import { ServiceProviderModel } from "../models/index.js";
import {
  APIError,
  BadRequestError,
  STATUS_CODES,
} from "../../utils/app-errors.js";
import { FormateData } from "../../utils/index.js";

//Dealing with data base operations
export default class ServiceProviderRepository {
  async CreateServiceProvider(userInputs) {
    try {
      console.log("userInputs data form the registers", userInputs);
      const ServiceProvider = new ServiceProviderModel(userInputs);
      const ServiceProviderResult = await ServiceProvider.save();

      return ServiceProviderResult;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Create Service Provider"
      );
    }
  }
  async forgotUserPassword(email, newPassword, newSalt) {
    try {
      const serviceProvider = await ServiceProviderModel.findOneAndUpdate(
        { email: email },
        { $set: { password: newPassword, salt: newSalt } },
        { new: true }
      );

      return serviceProvider;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to update password"
      );
    }
  }

  async VerifyServiceProvider(req) {
    try {
      const serviceProvider = await ServiceProviderModel.findOneAndUpdate(
        {
          serviceProviderId: req.user.serviceProviderId,
        },
        {
          $set: { isVerified: true },
        },
        { new: true }
      );

      return serviceProvider;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Verify ServiceProvider"
      );
    }
  }

  async CreateAddress(serviceProviderId, newAddress) {
    try {
      const profile = await ServiceProviderModel.findOne({ serviceProviderId });

      if (!profile) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "ServiceProvider profile not found"
        );
      }

      // Add the new address to the profile's address array
      profile.address.push(newAddress);

      // Save the updated profile
      await profile.save();

      return profile;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Error on Create Address"
      );
    }
  }

  async FetchAddress(serviceProviderId) {
    try {
      const profile = await ServiceProviderModel.findOne({ serviceProviderId });

      if (!profile) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "Service Provider profile not found"
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
  
  async UpdateAddress(serviceProviderId, updatedAddress) {
    try {
      const profile = await ServiceProviderModel.findOne({ serviceProviderId });

      if (!profile) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "serviceProvider profile not found"
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

  async DeleteAddress(serviceProviderId, addressId) {
    try {
      const profile = await ServiceProviderModel.findOne({ serviceProviderId });
      console.log(profile);
      if (!profile) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "Service Provider profile not found"
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

  async FindServiceProvider({ email }) {
    try {
      console.log("email from find", email);
      const existingServiceProvider = await ServiceProviderModel.findOne({
        email: email,
      });
      console.log(
        "data of serviceProvider from find serviceProvider",
        existingServiceProvider
      );
      return existingServiceProvider;
    } catch (err) {
      console.log(err);
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Service Provider"
      );
    }
  }



  async FindServiceProviders({ serviceProviderIdArr, selectData, query }) {
    try {
      let existingServiceProvider = [];

      const { verificationStatus, serviceProviderId, lat, lng } = query;

      if (serviceProviderIdArr === undefined) {
        existingServiceProvider = await ServiceProviderModel.find({
          serviceProviderId: { $in: serviceProviderIdArr },
        }).select(selectData);
      }
      if (query) {
        const queryVar = {};

        if (verificationStatus) {
          queryVar.verificationStatus = verificationStatus;
        }

        // Fetch the specific document by its unique identifier (serviceProviderId)
        if (serviceProviderId) {
          queryVar.serviceProviderId = serviceProviderId;
        }

        // Fetch service providers based on geoSpatial query if lat and lng are provided
        if (lat && lng) {
          // Define the maximum distance (in meters) within which to search for service providers
          const maxDistance = 10000; // For example, searching within a radius of 10 kilometers

          // Construct the geoSpatial query using MongoDB's $near operator
          queryVar["orderLocation.coordinates"] = {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)],
              },
              $maxDistance: maxDistance,
            },
          };
        }
        console.log("queryVar:", queryVar);

        // Fetch the document(s) based on the constructed query
        existingServiceProvider = await ServiceProviderModel.find(
          queryVar
        ).select(selectData);
      } else {
        existingServiceProvider = await ServiceProviderModel.find({
          ServiceProviderId: { $in: serviceProviderIdArr },
        }).select(selectData);
      }

      return existingServiceProvider;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Service Provider"
      );
    }
  }

  async UpdateServiceProvider(req, updateData) {
    try {
      const updatedServiceProvider =
        await ServiceProviderModel.findOneAndUpdate(
          { serviceProviderId: req.user.serviceProviderId },
          { $set: updateData },
          { new: true }
        );
      console.log(updatedServiceProvider);
      return updatedServiceProvider;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Service Provider"
      );
    }
  }

  async UpdateServiceProviderWorkImagesAndVideos(serviceProviderId, path) {
    try {
      // First, find the service provider by id
      const serviceProvider = await ServiceProviderModel.findOne({
        serviceProviderId: serviceProviderId,
      });

      if (!serviceProvider) {
        throw new APIError(
          "API Error",
          STATUS_CODES.INTERNAL_ERROR,
          "Service Provider not found"
        );
      }

      // Update the productImageVideos array by pushing new paths
      serviceProvider.productImageVideos.push(path);

      // Save the updated service provider
      const updatedServiceProvider = await serviceProvider.save();

      console.log(updatedServiceProvider);
      return updatedServiceProvider;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find or Update Service Provider"
      );
    }
  }

  async UpdateProfileImagePath(serviceProviderId, path) {
    try {
      const updatedServiceProvider =
        await ServiceProviderModel.findOneAndUpdate(
          { serviceProviderId: serviceProviderId },
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
  
  async CreateFurnitureItem(serviceProviderId, newItem) {
    try {
      const profile = await ServiceProviderModel.findOne({ serviceProviderId });

      if (!profile) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "ServiceProvider profile not found"
        );
      }

      // Add the new furniture item to the profile's furnitureItems array
      profile.furnitureItems.push(newItem);

      // Save the updated profile
      await profile.save();

      return profile;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Error on Create Furniture Item"
      );
    }
  }
  async UpdateFurnitureItem(serviceProviderId, updatedFurnitureItem) {
    try {
      const profile = await ServiceProviderModel.findOne({ serviceProviderId });

      if (!profile) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "Service provider profile not found"
        );
      }

      // Find the index of the furniture item to update
      const itemIndex = profile.furnitureItems.findIndex(
        (item) => item.itemId === updatedFurnitureItem.itemId
      );

      if (itemIndex === -1) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "Furniture item not found"
        );
      }

      // Update only the found item with the new data
      profile.furnitureItems[itemIndex] = {
        ...profile.furnitureItems[itemIndex],
        ...updatedFurnitureItem,
      };

      // Save the updated profile
      await profile.save();

      return profile;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Error on updating furniture item"
      );
    }
  }
  async DeleteFurnitureItems(serviceProviderId, furnitureItemIds) {
    try {
      const profile = await ServiceProviderModel.findOne({ serviceProviderId });

      if (!profile) {
        throw new APIError(
          "API Error",
          STATUS_CODES.NOT_FOUND,
          "Service provider profile not found"
        );
      }
      console.log(furnitureItemIds, "Updateddajfhasldjhfkdskdbasfk");
      // If furnitureItemIds is an array, filter out the items to delete. Otherwise, delete a single item by ID.
      if (Array.isArray(furnitureItemIds) && furnitureItemIds.length > 0) {
        // Delete multiple items by their IDs
        profile.furnitureItems = profile.furnitureItems.filter(
          (item) => !furnitureItemIds.includes(item.itemId)
        );
      } else {
        // Delete a single item by ID
        const itemIndex = profile.furnitureItems.findIndex(
          (item) => item.itemId === furnitureItemIds
        );
        if (itemIndex !== -1) {
          profile.furnitureItems.splice(itemIndex, 1);
        } else {
          throw new APIError(
            "API Error",
            STATUS_CODES.NOT_FOUND,
            "Furniture item not found"
          );
        }
      }

      // Save the updated profile
      await profile.save();

      return { message: "Furniture item(s) deleted successfully" };
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Error on delete furniture item(s)"
      );
    }
  }
  async FindFurnitureItems({ furnitureItemIds, selectData }) {
    try {
      let existingFurnitureItems = [];

      if (!furnitureItemIds) {
        // If no specific IDs are provided, fetch all furniture items with selected fields
        existingFurnitureItems = await FurnitureItemModel.find({}).select(
          selectData
        );
      } else {
        // If furnitureItemIds is an array, fetch multiple items by their IDs
        if (Array.isArray(furnitureItemIds) && furnitureItemIds.length > 0) {
          existingFurnitureItems = await FurnitureItemModel.find({
            itemId: { $in: furnitureItemIds },
          }).select(selectData);
        } else {
          // If furnitureItemIds is a single ID, fetch that specific item
          existingFurnitureItems = await FurnitureItemModel.findOne({
            itemId: furnitureItemIds,
          }).select(selectData);
        }
      }

      return existingFurnitureItems;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to find furniture items"
      );
    }
  }
}
