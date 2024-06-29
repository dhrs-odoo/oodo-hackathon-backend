import express from "express";
import cors from "cors";
import { serviceProvider } from "./api/index.js";
import HandleErrors from "./utils/error-handler.js";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// (async () => {
//   try {
//     await initializeRedis();
//   } catch (error) {
//     console.error("Failed to initialize Redis:", error);
//     process.exit(1); // Exit the app if Redis initialization fails
//   }
// })();
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
  serviceProvider(app);

  // error handling
  app.use(HandleErrors);
};

export default expressApp;
