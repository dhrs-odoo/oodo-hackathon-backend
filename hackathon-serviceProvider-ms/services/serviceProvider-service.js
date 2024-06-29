import { ServiceProviderRepository } from "../database/index.js";
import {
  FormateData,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
  ValidateSignature,
  GenerateForgotPasswordSignature,
  ValidateSignatureAndSendData,
} from "../utils/index.js";
import { APIError, BadRequestError } from "../utils/app-errors.js";
import { sendServiceProviderForgotMail, sendServiceProviderVerificationMail, sendServiceProviderWelcomeEmail } from "../mailSending/mails/mail.js";

// All Business logic will be here
export default class ServiceProviderService {
  constructor() {
    this.repository = new ServiceProviderRepository();
  }

  async SignIn(userInputs) {
    const { email, password } = userInputs;
    console.log("emails and passwords from services", email, password);
    try {
      const existingServiceProvider = await this.repository.FindServiceProvider(
        { email }
      );
      console.log("data of existing serviceProvider", existingServiceProvider);
      if (existingServiceProvider && existingServiceProvider.isVerified) {
        const validPassword = await ValidatePassword(
          password,
          existingServiceProvider.password,
          existingServiceProvider.salt
        );
        console.log("inside service provider", validPassword);
        if (validPassword) {
          const token = await GenerateSignature({
            email: existingServiceProvider.email,
            serviceProviderId: existingServiceProvider.serviceProviderId,
          });
          return FormateData({
            serviceProviderId: existingServiceProvider.serviceProviderId,
            token,
          });
        }
      }

      return FormateData({
        message: "please verify your number first",
        status: 400,
      });
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }
  async forgotPasswordRequestUrl(userInputs) {
    const { email } = userInputs;
    console.log("object", email);
    try {
      const existingServiceProvider = await this.repository.FindServiceProvider(
        { email }
      );
      console.log("existingServiceProvider", existingServiceProvider);
      if (existingServiceProvider && existingServiceProvider.isVerified) {
        const token = await GenerateForgotPasswordSignature({
          email: existingServiceProvider.email,
        });
        const emailId = existingServiceProvider.email;
        const forgotPasswordUrl = `${process.env.MAIN_BACKEND_URL}/api/v1/serviceProvider/auth/forgotPassword/verify/${emailId}/${token}`;
        console.log(forgotPasswordUrl);
        sendServiceProviderForgotMail(emailId, forgotPasswordUrl);
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
        const serviceProvider = await this.repository.forgotUserPassword(
          emailId,
          password,
          newSalt
        );
        if (serviceProvider) {
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

  async SignUp(userInputs) {
    const { email, password } = userInputs;

    try {
      // create salt
      let salt = await GenerateSalt();
      userInputs.password = await GeneratePassword(password, salt);

      userInputs.salt = salt;

      const existingServiceProvider =
        await this.repository.CreateServiceProvider(userInputs);

      const token = await GenerateSignature({
        email: email,
        serviceProviderId: existingServiceProvider.serviceProviderId,
      });

      const serviceProviderUrl = `${process.env.MAIN_BACKEND_URL}/api/v1/serviceProvider/auth/verify/${token}`;
      console.log(serviceProviderUrl);
      await sendServiceProviderVerificationMail(email, serviceProviderUrl);
      await sendServiceProviderWelcomeEmail(email);     
      return FormateData({
        message: "verify your email address",
        verificationUrl: serviceProviderUrl,
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
        const data = await this.repository.VerifyServiceProvider(req);
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

  async VerifyToken(req, token) {
    try {
      // console.log("token", token);
      const ValidatedSignature = await ValidateSignature(req, token);

      if (ValidatedSignature) {
        const serviceProvider = await this.repository.FindServiceProvider({
          email: req.user.email,
        });

        return FormateData({
          message: "serviceProvider is authenticated",
          status: "authenticated",
          serviceProviderId: serviceProvider?.serviceProviderId,
          firstName: serviceProvider?.firstName,
          lastName: serviceProvider?.lastName,
          mobileNo: serviceProvider?.mobileNo,
          email: serviceProvider?.email,
          profileImage: serviceProvider?.profileImagePath,
          verificationStatus: serviceProvider?.verificationStatus,
        });
      }
      return FormateData({
        message: "please verify your email first",
      });
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async AddNewAddress(serviceProviderId, userInputs) {
    try {
      const addressResult = await this.repository.CreateAddress(
        serviceProviderId,
        userInputs
      );
      return FormateData(addressResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async FetchAddress(serviceProviderId) {
    try {
      const addressResult = await this.repository.FetchAddress(
        serviceProviderId
      );
      return FormateData(addressResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async UpdateAddress(serviceProviderId, userInputs) {
    try {
      const addressResult = await this.repository.UpdateAddress(
        serviceProviderId,
        userInputs
      );
      return FormateData(addressResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async DeleteAddress(serviceProviderId, addressId) {
    try {
      const addressResult = await this.repository.DeleteAddress(
        serviceProviderId,
        addressId
      );
      return FormateData(addressResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async FetchServiceProviders({ serviceProviderIdArr, selectData, query }) {
    try {
      const existingServiceProvider =
        await this.repository.FindServiceProviders({
          serviceProviderIdArr,
          selectData,
          query,
        });
      return FormateData(existingServiceProvider);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async FetchServiceProvider({ serviceProviderId }) {
    try {
      const existingServiceProvider =
        await this.repository.FindServiceProviderFromServiceProviderId({
          serviceProviderId,
        });
      return FormateData(existingServiceProvider);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }
  async UpdateServiceProvider(req, updateData) {
    try {
      const updatedServiceProvider =
        await this.repository.UpdateServiceProvider(req, updateData);
      return FormateData(updatedServiceProvider);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async UpdateServiceProviderProfileImagePath(serviceProviderId, path) {
    try {
      const updatedServiceProvider =
        await this.repository.UpdateProfileImagePath(serviceProviderId, path);
      return FormateData(updatedServiceProvider);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async UpdateServiceProviderWorkImageAndVideoPath(serviceProviderId, path) {
    try {
      const updatedServiceProvider =
        await this.repository.UpdateServiceProviderWorkImagesAndVideos(
          serviceProviderId,
          path
        );
      return FormateData(updatedServiceProvider);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }



  async AddNewFurnitureItem(serviceProviderId, userInputs) {
    try {
      const furnitureItemResult = await this.repository.CreateFurnitureItem(
        serviceProviderId,
        userInputs
      );
      return FormateData(furnitureItemResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }
  async UpdateFurnitureItem(serviceProviderId, updatedFurnitureItem) {
    try {
      const profileResult = await this.repository.UpdateFurnitureItem(
        serviceProviderId,
        updatedFurnitureItem
      );
      return FormateData(profileResult); // Assuming FormatData is a function to format response data
    } catch (err) {
      throw new APIError("Data not found", err);
    }
  }
  async DeleteFurnitureItems(serviceProviderId, furnitureItemIds) {
    try {
      const result = await this.repository.DeleteFurnitureItems(
        serviceProviderId,
        furnitureItemIds
      );
      return FormateData(result); // Assuming FormatData is a function to format response data
    } catch (err) {
      throw new APIError("Data not found", err);
    }
  }
  async FindFurnitureItems(furnitureItemQuery) {
    try {
      const result = await this.repository.FindFurnitureItems(furnitureItemQuery);
      return FormateData(result); // Assuming FormatData is a function to format response data
    } catch (err) {
      throw new APIError("Data not found", err);
    }
  }
  
}
