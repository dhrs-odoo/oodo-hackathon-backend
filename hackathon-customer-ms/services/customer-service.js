import { CustomerRepository } from "../database/index.js";
import {
  FormateData,
  GenerateForgotPasswordSignature,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
  ValidateSignature,
  ValidateSignatureAndSendData,
} from "../utils/index.js";
import { APIError, BadRequestError } from "../utils/app-errors.js";
import {
  sendCustomerForgotPasswordLink,
  sendCustomerVerificationMail,
  sendCustomerWelcomeEmail,
} from "../mailSending/mails/mail.js";

// All Business logic will be here
export default class CustomerService {
  constructor() {
    this.repository = new CustomerRepository();
  }

  async SignIn(userInputs) {
    const { email, password } = userInputs;

    try {
      const existingCustomer = await this.repository.FindCustomer({ email });

      if (existingCustomer && existingCustomer.isVerified) {
        const validPassword = await ValidatePassword(
          password,
          existingCustomer.password,
          existingCustomer.salt
        );

        if (validPassword) {
          const token = await GenerateSignature({
            email: existingCustomer.email,
            customerId: existingCustomer.customerId,
          });
          return FormateData({
            customerId: existingCustomer.customerId,
            token,
          });
        }
      }

      return FormateData({
        message: "please verify your email first",
      });
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async forgotPasswordRequestUrl(userInputs) {
    const { email } = userInputs;

    try {
      const existingCustomer = await this.repository.FindCustomer({ email });

      if (existingCustomer && existingCustomer.isVerified) {
        const token = await GenerateForgotPasswordSignature({
          email: existingCustomer.email,
        });
        const emailId = existingCustomer.email;
        const PasswordUrl = `${process.env.MAIN_BACKEND_URL}/api/v1/customer/auth/forgotPassword/verify/${emailId}/${token}`;
        console.log(forgotPasswordUrl);
        sendCustomerForgotPasswordLink(email, forgotPasswordUrl);
        return FormateData({
          message: "you will be able to forgot your password using this link",
          forgotPasswordUrl,
        });
      }

      return FormateData({
        message: "please verify your email first",
      });
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }
  async SignUp(userInputs) {
    const { email, password } = userInputs;

    try {
      // create salt
      let salt = await GenerateSalt();
      userInputs.password = await GeneratePassword(password, salt);

      userInputs.salt = salt;

      const existingCustomer = await this.repository.CreateCustomer(userInputs);

      const token = await GenerateSignature({
        email: email,
        customerId: existingCustomer.customerId,
      });
      const customerUrl = `${process.env.MAIN_BACKEND_URL}/api/v1/customer/auth/verify/${token}`;
      console.log(customerUrl);
      await sendCustomerVerificationMail(email, customerUrl);
      await sendCustomerWelcomeEmail(email);
      return FormateData({
        message: "verify your email address",
        verificationUrl: customerUrl,
      });
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async Verify(req, token) {
    try {
      // console.log("token", token);
      const ValidatedSignature = await ValidateSignature(req, token);
      if (ValidatedSignature) {
        const data = await this.repository.VerifyCustomer(req);
        return FormateData({
          message: "user verified successfully.",
        });
      }
      return FormateData({
        message: "please verify your email first",
      });
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async forgotUserPassword(req, token, emailId, newPassword) {
    try {
      const ValidatedSignature = await ValidateSignatureAndSendData(req, token);
      console.log(emailId);
      if (
        ValidatedSignature.isValid == true &&
        ValidatedSignature.data.email == emailId
      ) {
        const newSalt = await GenerateSalt();
        const password = await GeneratePassword(newPassword, newSalt);
        const customer = await this.repository.forgotUserPassword(
          emailId,
          password,
          newSalt
        );
        if (customer) {
          return FormateData({
            message: "Password updated successfully.",
          });
        } else {
          return FormateData({
            message: "User not found.",
          });
        }
      } else {
        return FormateData({
          message: "Invalid or expired token.",
        });
      }
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async VerifyToken(req, token) {
    try {
      // console.log("token", token);
      const ValidatedSignature = await ValidateSignature(req, token);

      if (ValidatedSignature) {
        const customer = await this.repository.FindCustomer({
          email: req.user.email,
        });
        console.log("customer form here", customer);
        return FormateData({
          message: "customer is authenticated",
          status: "authenticated",
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          customerId: customer.customerId,
          profileImagePath: customer.profileImagePath,
        });
      }
      return FormateData({
        message: "please verify your email first",
      });
    } catch (err) {
      throw new APIError("Data Not found ok ok ", err);
    }
  }

  async AddNewAddress(customerId, newAddress) {
    try {
      const addressResult = await this.repository.CreateAddress(
        customerId,
        newAddress
      );
      return FormateData(addressResult);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found", err);
    }
  }

  async FetchAddress(customerId) {
    try {
      const addressResult = await this.repository.FetchAddress(customerId);
      return FormateData(addressResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async UpdateServiceProviderProfileImagePath(customerId, path) {
    try {
      const updatedServiceProvider =
        await this.repository.UpdateProfileImagePath(customerId, path);
      return FormateData(updatedServiceProvider);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }
  async UpdateAddress(customerId, userInputs) {
    try {
      const addressResult = await this.repository.UpdateAddress(
        customerId,
        userInputs
      );
      return FormateData(addressResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async DeleteAddress(customerId, addressId) {
    try {
      const addressResult = await this.repository.DeleteAddress(
        customerId,
        addressId
      );
      return FormateData(addressResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async FetchCustomers({ customerIdArr, selectData }) {
    try {
      const existingCustomer = await this.repository.FindCustomers({
        customerIdArr,
        selectData,
      });
      return FormateData(existingCustomer);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async UpdateCustomer(req, updateData) {
    try {
      const updatedCustomer = await this.repository.UpdateCustomer(
        req,
        updateData
      );
      return FormateData(updatedCustomer);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  // async SubscribeEvents(payload) {
  //   const { event, data } = payload;

  //   const { userId, product, order, qty } = data;

  //   switch (event) {
  //     case "ADD_TO_WISHLIST":
  //     case "REMOVE_FROM_WISHLIST":
  //       this.AddToWishlist(userId, product);
  //       break;
  //     case "ADD_TO_CART":
  //       this.ManageCart(userId, product, qty, false);
  //       break;
  //     case "REMOVE_FROM_CART":
  //       this.ManageCart(userId, product, qty, true);
  //       break;
  //     case "CREATE_ORDER":
  //       this.ManageOrder(userId, order);
  //       break;
  //     default:
  //       break;
  //   }
  // }
}
