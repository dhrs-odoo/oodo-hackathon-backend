import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import proxy from "express-http-proxy";
import multer from "multer";
import axios from "axios";

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
const upload = multer();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL_1,
      process.env.CLIENT_URL_2,
      process.env.CLIENT_URL_3,
    ],
    methods: ["GET", "POST", "UPDATE", "DELETE"],
    credentials: true,
  })
);

app.post(
  "/api/v1/serviceProvider/upload-serviceProviderProfile-img",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const serviceProviderAuthToken = req.cookies?.serviceProviderAuthToken;

      if (!serviceProviderAuthToken) {
        return res.status(400).json({
          message: "Missing serviceProvider authorization token",
          status: "error",
        });
      }
      if (!req.file) {
        return res.status(400).json({
          message: "No file provided",
          status: "error",
        });
      }
      console.log("Uploaded file:", req.headers["serviceproviderid"]); // Accessing serviceProviderId header
      const formData = new FormData();
      const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
      formData.append("profileImage", fileBlob, req.file.originalname);
      const headers = {
        Cookie: `serviceProviderAuthToken=${serviceProviderAuthToken}`,
        "Content-Type": "multipart/form-data",
        serviceProviderId: req.headers["serviceproviderid"],
      };
      const response = await axios.post(
        `${process.env.SERVICE_PROVIDER_BACKEND_URL}/upload-serviceProviderProfile-img`,
        formData,
        { headers }
      );

      res.status(200).json({ data: response.data, status: "success" });
    } catch (error) {
      console.error("Error uploading file:", error);
      res
        .status(500)
        .json({ message: "Internal server error", status: "error" });
    }
  }
);

app.post(
  "/api/v1/serviceProvider/upload-serviceProvider-product-img-videos",
  upload.single("productImagesVideos"),
  async (req, res) => {
    try {
      const serviceProviderAuthToken = req.cookies?.serviceProviderAuthToken;

      if (!serviceProviderAuthToken) {
        return res.status(400).json({
          message: "Missing serviceProvider authorization token",
          status: "error",
        });
      }
      if (!req.file) {
        return res.status(400).json({
          message: "No file provided",
          status: "error",
        });
      }
      console.log("Uploaded file:", req.headers["serviceproviderid"]); // Accessing serviceProviderId header
      const formData = new FormData();
      const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
      formData.append("productImagesVideos", fileBlob, req.file.originalname);
      const headers = {
        Cookie: `serviceProviderAuthToken=${serviceProviderAuthToken}`,
        "Content-Type": "multipart/form-data",
        serviceProviderId: req.headers["serviceproviderid"],
      };
      const response = await axios.post(
        `${process.env.SERVICE_PROVIDER_BACKEND_URL}/upload-serviceProvider-product-img-videos`,
        formData,
        { headers }
      );

      res.status(200).json({ data: response.data, status: "success" });
    } catch (error) {
      console.error("Error uploading file:", error);
      res
        .status(500)
        .json({ message: "Internal server error", status: "error" });
    }
  }
);

app.post(
  "/api/v1/serviceProvider/upload-serviceProvider-product-img-videos",
  upload.single("productImagesVideos"),
  async (req, res) => {
    try {
      const serviceProviderAuthToken = req.cookies?.serviceProviderAuthToken;

      if (!serviceProviderAuthToken) {
        return res.status(400).json({
          message: "Missing serviceProvider authorization token",
          status: "error",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No files provided",
          status: "error",
        });
      }

      const formData = new FormData();
      formData.append("productImagesVideos", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const headers = {
        Cookie: `serviceProviderAuthToken=${serviceProviderAuthToken}`,
        "Content-Type": "multipart/form-data",
        serviceProviderId: req.headers["serviceproviderid"],
      };

      const response = await axios.post(
        `${process.env.SERVICE_PROVIDER_BACKEND_URL}/upload-serviceProvider-product-img-videos`,
        formData,
        { headers }
      );

      res.status(200).json({ data: response.data, status: "success" });
    } catch (error) {
      console.error("Error uploading files:", error);
      res
        .status(500)
        .json({ message: "Internal server error", status: "error" });
    }
  }
);

app.post(
  "/api/v1/customer/upload-customerProfile-img",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const customerAuthToken = req.cookies?.customerAuthToken;
      const customerId = req.headers["customerid"];
      if (!customerAuthToken) {
        return res.status(400).json({
          message: "Missing customer authorization token",
          status: "error",
        });
      }
      if (!req.file) {
        return res.status(400).json({
          message: "No file provided",
          status: "error",
        });
      }
      console.log("Uploaded file:", req.file);
      const formData = new FormData();
      const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
      formData.append("profileImage", fileBlob, req.file.originalname);
      const headers = {
        Cookie: `customerAuthToken=${customerAuthToken}`,
        "Content-Type": "multipart/form-data",
        customerId: customerId,
      };
      const response = await axios.post(
        `${process.env.CUSTOMER_BACKEND_URL}/upload-customerProfile-img`,
        formData,
        { headers }
      );

      res.status(200).json({ data: response.data, status: "success" });
    } catch (error) {
      console.error("Error uploading file:", error);
      res
        .status(500)
        .json({ message: "Internal server error", status: "error" });
    }
  }
);

app.use("/api/v1/customer", proxy(process.env.CUSTOMER_BACKEND_URL));
app.use(
  "/api/v1/serviceProvider",
  proxy(process.env.SERVICE_PROVIDER_BACKEND_URL)
);
app.use("/api/v1/chat", proxy(process.env.CHAT_BACKEND_URL));
app.use("/api/v1/action", proxy(process.env.ACTION_BACKEND_URL));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
