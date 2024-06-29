import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import axios from "axios";
import path from "path";
import {
  AWS_REGION,
  AWS_BUCKET_NAME_1,
  AWS_ACCESS_KEY_ID_1,
  AWS_SECRET_ACCESS_KEY_ID_1,
} from "../config/index.js";

const s3 = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID_1,
    secretAccessKey: AWS_SECRET_ACCESS_KEY_ID_1,
  },
  region: AWS_REGION,
});
console.log(AWS_ACCESS_KEY_ID_1);
const mimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

export const getServiceProviderProfileImage = async (req, res) => {
  const imageName = req.params.imageName;

  // Define S3 parameters
  const s3Params = {
    Bucket: AWS_BUCKET_NAME_1,
    Key: `serviceProviderProfileImages/${imageName}`,
  };

  try {
    // Fetch metadata to determine the content type
    const headCommand = new HeadObjectCommand(s3Params);
    const metadata = await s3.send(headCommand);
    let contentType = metadata.ContentType;

    // If the content type is generic, infer it from the file extension
    if (contentType === "application/octet-stream") {
      const ext = path.extname(imageName).toLowerCase();
      contentType = mimeTypes[ext] || "application/octet-stream";
    }

    console.log("Content type: ", contentType);
    // Generate a pre-signed URL
    const command = new GetObjectCommand(s3Params);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

    // Fetch the object data
    const response = await axios.get(url, { responseType: "arraybuffer" });

    // Set the appropriate content type for the image
    res.setHeader("Content-Type", contentType);
    res.setHeader("X-Signed-URL", url);

    // Send the image data as the response
    res.send(response.data);
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);

    // Extract relevant information from the error object
    const errorMessage = error.message || "Internal Server Error";

    // Send a simplified error response
    res.status(500).json({ error: errorMessage });
  }
};

export default getServiceProviderProfileImage;
