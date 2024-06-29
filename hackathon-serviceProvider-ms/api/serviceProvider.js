import { ServiceProviderModel } from "../database/models/index.js";
import ServiceProviderService from "../services/serviceProvider-service.js";
import getServiceProviderProfileImage from "./getServiceProviderProfileImageFromS3.js";
import getServiceProviderProductImagesAndVideos from "./getServiceProviderProductImagesAndVideos.js";
import UserAuth from "./middlewares/auth.js";
import uploadServiceProviderProfileImages from "./middlewares/uploadServiceProviderProfileImagesToS3.js";
import uploadServiceProviderWorkImagesVideos from "./middlewares/uploadServiceProviderWorkImagesVideos.js";
import path from "path";
const serviceProvider = (app) => {
  const service = new ServiceProviderService();

  app.post("/auth/register", async (req, res, next) => {
    try {
      const { email } = req.body;
      console.log("object form registration ", req.body);
      const alreadyUser = await ServiceProviderModel.findOne({
        email,
      });
      if (!alreadyUser) {
        const { data } = await service.SignUp(req.body);
        return res.json(data);
      } else {
        return res.status(409).json({ message: "user already registered" });
      }
    } catch (err) {
      next(err);
    }
  });


  app.post("/auth/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      console.log("emails and passwords from the route", email, password);
      const { data } = await service.SignIn({ email, password });
      return res.status(data.status ? data.status : 200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/auth/verify/:token", async (req, res, next) => {
    try {
      const { token } = req.params;
      const { data } = await service.Verify(req, token);

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/auth/forgotPassword", async (req, res, next) => {
    try {
      const { email } = req.body;
      const { data } = await service.forgotPasswordRequestUrl({ email });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post(
    "/auth/forgotPassword/verify/:emailId/:token",
    async (req, res, next) => {
      try {
        const { emailId, token } = req.params;
        const { newPassword } = req.body;
        const { data } = await service.forgotUserPassword(
          req,
          token,
          emailId,
          newPassword
        );
        return res.json(data);
      } catch (err) {
        next(err);
      }
    }
  );

  app.post("/auth/verifyUser", async (req, res, next) => {
    try {
      const { serviceProviderAuthToken: token } = req.cookies;
      if (!token) return res.json({ message: "token is required" });
      const { data } = await service.VerifyToken(req, token);

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/fetchServiceProvider", async (req, res, next) => {
    try {
      const { serviceProviderId } = req.query;
      const { data } = await service.FetchServiceProvider({
        serviceProviderId,
      });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/fetchServiceProviders", async (req, res, next) => {
    try {
      const { serviceProviderIdArr, selectData } = await req.body;
      const { data } = await service.FetchServiceProviders({
        serviceProviderIdArr,
        selectData,
        query: req.query,
      });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/updateServiceProvider", UserAuth, async (req, res, next) => {
    try {
      const updateData = req.body;
      console.log(updateData);

      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "ServiceProvider's not found" });
      }

      const { data } = await service.UpdateServiceProvider(req, updateData);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/deleteServiceProvider", UserAuth, async (req, res, next) => {
    try {
      return res.json({ message: "this endpoint is temporarily unavailable" });
    } catch (err) {
      next(err);
    }
  });

  app.post("/addAddress", UserAuth, async (req, res, next) => {
    try {
      const { serviceProviderId } = req.user;

      const newAddress = req.body;

      const { data } = await service.AddNewAddress(
        serviceProviderId,
        newAddress
      );

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/fetchAddresses", UserAuth, async (req, res, next) => {
    try {
      const { serviceProviderId } = req.user;

      const newAddress = req.body;

      const { data } = await service.FetchAddress(serviceProviderId);

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/updateAddress", UserAuth, async (req, res, next) => {
    try {
      const { serviceProviderId } = req.user;

      const newAddress = req.body;

      const { data } = await service.UpdateAddress(
        serviceProviderId,
        newAddress
      );

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/deleteAddress", UserAuth, async (req, res, next) => {
    try {
      const { serviceProviderId } = req.user;

      const { addressId } = req.body;

      const { data } = await service.DeleteAddress(
        serviceProviderId,
        addressId
      );

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });


  app.post(
    "/upload-serviceProviderProfile-img",
    UserAuth,
    uploadServiceProviderProfileImages.single("profileImage"),
    async (req, res) => {
      try {
        console.log("Reached route handler", req.file);
        console.log("hello");

        if (!req.file) {
          return res.status(400).json({ error: "No file provided" });
        }
        const serviceProviderId = req.headers["serviceproviderid"];

        // Use req.file.location for S3
        var packageImgPath = req?.file?.key;
        packageImgPath = path.basename(packageImgPath);

        console.log("Image path:", packageImgPath);
        const updatedServiceProvider =
          await service.UpdateServiceProviderProfileImagePath(
            serviceProviderId,
            packageImgPath
          );
        if (!updatedServiceProvider) {
          return res.status(404).json({ error: "Service provider not found" });
        }
        res.status(200).json({
          message: "Image uploaded successfully",
          path: packageImgPath,
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  app.post(
    "/upload-serviceProvider-product-img-videos",
    UserAuth,
    uploadServiceProviderWorkImagesVideos.single("productImagesVideos"),
    async (req, res) => {
      try {
        const serviceProviderId = req.headers["serviceproviderid"];
        console.log(serviceProviderId);
        if (!req.file) {
          return res.status(400).json({ error: "No file provided" });
        }
        console.log("req.file", req.file);
        var packageImgPath = req?.file?.key;
        packageImgPath = path.basename(packageImgPath);

        const updatedServiceProvider =
          await service.UpdateServiceProviderWorkImageAndVideoPath(
            serviceProviderId,
            packageImgPath
          );

        console.log("Updated service provider:", updatedServiceProvider);
        if (!updatedServiceProvider) {
          return res.status(404).json({ error: "Service provider not found" });
        }

        res.status(200).json({
          message: "Image uploaded successfully",
          path: packageImgPath,
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  app.get(
    "/serviceProviderProfileImage/:imageName",
    UserAuth,
    getServiceProviderProfileImage
  );

  app.get(
    "/serviceProviderProductImages/:imageName",
    UserAuth,
    getServiceProviderProductImagesAndVideos
  );
  app.post("/addFurnitureItem", UserAuth, async (req, res, next) => {
    try {
      const { serviceProviderId } = req.user;

      const newItem = req.body;

      const { data } = await service.AddNewFurnitureItem(
        serviceProviderId,
        newItem
      );
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });
  app.post("/updateFurnitureItems", UserAuth, async (req, res, next) => {
    try {
      const { serviceProviderId } = req.user;
      const newFurnitureItems = req.body;

      const { data } = await service.UpdateFurnitureItem(
        serviceProviderId,
        newFurnitureItems
      );

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });
  app.delete("/deleteFurnitureItems", UserAuth, async (req, res, next) => {
    try {
      const { serviceProviderId } = req.user;
      const { furnitureItemIds } = req.body;

      const { data } = await service.DeleteFurnitureItems(
        serviceProviderId,
        furnitureItemIds
      );

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });
  app.get("/findFurnitureItems", async (req, res, next) => {
    try {
      const { furnitureItemIds, selectData } = req.query;

      const { data } = await service.FindFurnitureItems({
        furnitureItemIds: furnitureItemIds
          ? JSON.parse(furnitureItemIds)
          : undefined,
        selectData: selectData ? JSON.parse(selectData) : undefined,
      });

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });
};

export default serviceProvider;
