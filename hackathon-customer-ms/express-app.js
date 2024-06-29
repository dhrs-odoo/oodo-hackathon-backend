import express from "express";
import cors from "cors";
import { customer } from "./api/index.js";
import HandleErrors from "./utils/error-handler.js";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const expressApp = async (app) => {
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(
    cors({
      origin: [process.env.MAIN_BACKEND_URL],
      methods: ["GET", "POST", "UPDATE", "DELETE"],
      credentials: true,
    })
  );
  // app.use(express.static(path.join(__dirname, "public")));

  app.use(cookieParser());

  //api
  customer(app);

  // error handling
  app.use(HandleErrors);
};

export default expressApp;
