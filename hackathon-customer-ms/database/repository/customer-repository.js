import { CustomerModel } from "../models/index.js";
import {
  APIError,
  BadRequestError,
  STATUS_CODES,
} from "../../utils/app-errors.js";
import { FormateData } from "../../utils/index.js";

//Dealing with data base operations
export default class CustomerRepository {
  async CreateCustomer(userInputs) {
    try {
      console.log(userInputs);
      const customer = new CustomerModel(userInputs);
      const customerResult = await customer.save();

      return customerResult;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Create Customer"
      );
    }
  }

  async VerifyCustomer(req) {
    try {
      const customer = await CustomerModel.findOneAndUpdate(
        {
          customerId: req.user.customerId,
        },
        {
          $set: { isVerified: true },
        },
        { new: true }
      );

      return customer;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Create Customer"
      );
    }
  }

  async forgotUserPassword(email, newPassword, newSalt) {
    try {
      const customer = await CustomerModel.findOneAndUpdate(
        { email: email },
        { $set: { password: newPassword , salt: newSalt} },
        { new: true }
      );

      return customer;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to update password"
      );
    }
  }

  async CreateAddress(customerId, newAddress) {
    try {
      console.log({ customerId });
      const profile = await CustomerModel.findOne({ customerId });

      if (!profile) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "Customer profile not found"
        );
      }

      // Add the new address to the profile's address array
      profile.address.push(newAddress);

      // Save the updated profile
      await profile.save();
      return {
        addressId: profile.address[profile.address.length - 1].addressId,
      };
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Error on Create Address"
      );
    }
  }

  async FetchAddress(customerId) {
    try {
      const profile = await CustomerModel.findOne({ customerId });

      if (!profile) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "Customer profile not found"
        );
      }

      return profile.address;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Error on Create Address"
      );
    }
  }

  async UpdateAddress(customerId, updatedAddress) {
    try {
      const profile = await CustomerModel.findOne({ customerId });

      if (!profile) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "Customer profile not found"
        );
      }

      // Find the index of the address to update
      const addressIndex = profile.address.findIndex(
        (addr) => addr.addressId === updatedAddress.addressId
      );

      if (addressIndex === -1) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "Address not found"
        );
      }

      // Update the address at the found index with the new data
      profile.address[addressIndex] = {
        ...profile.address[addressIndex],
        ...updatedAddress,
      };

      // Save the updated profile
      await profile.save();

      return profile;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Error on Update Address"
      );
    }
  }

  async DeleteAddress(customerId, addressId) {
    try {
      const profile = await CustomerModel.findOne({ customerId });
      console.log(profile);
      if (!profile) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "Customer profile not found"
        );
      }

      // Find the index of the address to update
      const addressIndex = profile.address.findIndex(
        (addr) => addr.addressId == addressId
      );

      if (addressIndex === -1) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "Address not found"
        );
      }

      // Delete the address at the found index
      profile.address.splice(addressIndex, 1);

      // Save the updated profile
      await profile.save();

      return { message: "address deleted successfully" };
    } catch (err) {
      console.log(err);
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Error on delete Address"
      );
    }
  }

  async FindCustomer({ email }) {
    try {
      const existingCustomer = await CustomerModel.findOne({ email: email });
      return existingCustomer;
    } catch (err) {
      console.log(err);
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Customer"
      );
    }
  }

  async FindCustomers({ customerIdArr, selectData }) {
    try {
      let existingCustomer = [];
      if (customerIdArr === undefined) {
        existingCustomer = await CustomerModel.find({}).select(selectData);
      } else {
        existingCustomer = await CustomerModel.find({
          customerId: { $in: customerIdArr },
        }).select(selectData);
      }

      return existingCustomer;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Customer"
      );
    }
  }

  async UpdateCustomer(req, updateData) {
    try {
      const updatedCustomer = await CustomerModel.findOneAndUpdate(
        { customerId: req.user.customerId },
        updateData,
        { new: true }
      );
      return updatedCustomer;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Customer"
      );
    }
  }

  async UpdateProfileImagePath(customerId, path) {
    try {
      const updatedServiceProvider = await CustomerModel.findOneAndUpdate(
        { customerId: customerId },
        { profileImagePath: path },
        { new: true }
      );
      return updatedServiceProvider;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Service Provider"
      );
    }
  }
}
