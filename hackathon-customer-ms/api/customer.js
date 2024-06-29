import { CustomerModel } from "../database/models/index.js";
import CustomerService from "../services/customer-service.js";
import getCustomerProfileImages from "./getCustomerProfileImages.js";
import UserAuth from "./middlewares/auth.js";
import uploadCustomerProfileImages from "./middlewares/uploadCustomerProfileImages.js";
import path from "path";
const customer = (app) => {
  const service = new CustomerService();

  app.post("/auth/register", async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const alreadyUser = await CustomerModel.findOne({
        email: email,
      });
      if (!alreadyUser) {
        const { data } = await service.SignUp(req.body);
        return res.json(data);
      } else {
        return res.status(400).json({ message: "user already registered" });
      }
    } catch (err) {
      next(err);
    }
  });

  app.post("/auth/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const { data } = await service.SignIn({ email, password });

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

  app.get("/auth/verify/:token", async (req, res, next) => {
    try {
      const { token } = req.params;
      const { data } = await service.Verify(req, token);

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/auth/verifyUser", async (req, res, next) => {
    try {
      const { customerAuthToken: token } = req.cookies;
      if (!token) return res.json({ message: "token is required" });
      const { data } = await service.VerifyToken(req, token);

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/fetchCustomers", UserAuth, async (req, res, next) => {
    try {
      const { customerIdArr, selectData } = await req.body;
      const { data } = await service.FetchCustomers({
        customerIdArr,
        selectData,
      });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/updateCustomer", UserAuth, async (req, res, next) => {
    try {
      const updateData = req.body;
      console.log(updateData);

      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "Customer's not found" });
      }

      const { data } = await service.UpdateCustomer(req, updateData);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/deleteCustomer", UserAuth, async (req, res, next) => {
    try {
      return res.json({ message: "this endpoint is temporarily unavailable" });
    } catch (err) {
      next(err);
    }
  });

  app.post("/addAddress", UserAuth, async (req, res, next) => {
    try {
      const { customerId } = req.user;

      const newAddress = req.body;

      const { data } = await service.AddNewAddress(customerId, newAddress);

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/fetchAddresses", UserAuth, async (req, res, next) => {
    try {
      const { customerId } = req.user;

      const { data } = await service.FetchAddress(customerId);

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/updateAddress", UserAuth, async (req, res, next) => {
    try {
      const { customerId } = req.user;

      const newAddress = req.body;

      const { data } = await service.UpdateAddress(customerId, newAddress);

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post(
    "/upload-customerProfile-img",
    UserAuth,
    uploadCustomerProfileImages.single("profileImage"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file provided" });
        }
        const customerId = req.headers["customerid"];
        console.log("fdsgfdgsdfgfdsgfdsd", customerId);
        console.log("req.file", req.file);
        var packageImgPath = req?.file?.key;
        packageImgPath = path.basename(packageImgPath);

        console.log("Image path:", packageImgPath);
        const updateCustomer =
          await service.UpdateServiceProviderProfileImagePath(
            customerId,
            packageImgPath
          );
        if (!updateCustomer) {
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
    "/customerProfileImages/:imageName",
    UserAuth,
    getCustomerProfileImages
  );
  app.delete("/deleteAddress", UserAuth, async (req, res, next) => {
    try {
      const { customerId } = req.user;

      const { addressId } = req.body;

      const { data } = await service.DeleteAddress(customerId, addressId);

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });
};

export default customer;
