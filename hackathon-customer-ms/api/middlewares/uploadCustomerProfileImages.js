import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import { randomBytes } from "crypto";
import { AWS_ACCESS_KEY_ID, AWS_ACL, AWS_BUCKET_NAME, AWS_REGION, AWS_SECRET_ACCESS_KEY_ID } from "../../config/index.js";


const s3 = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY_ID,
  },
  region: AWS_REGION,
});
const allowedFileTypes = [
  "image/svg+xml",
  "image/jpeg",
  "image/png",
  "image/gif",
];

const storage = multerS3({
  s3: s3,
  bucket: AWS_BUCKET_NAME,
  acl: AWS_ACL,
  key: (req, file, cb) => {
    const uploadPath = "customerProfileImages";


    const randomString = randomBytes(16).toString("hex");
    const fileName = `${randomString}-${Date.now()}-${file.originalname.replace(
      /\s+/g,
      ""
    )}`;
    const filePath = `${uploadPath}/${fileName}`;

    cb(null, filePath); // Specify the key (file path) in the S3 bucket
  },
});
const fileFilter = (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true); // Allow file upload
  } else {
    const error = new Error(
      "Invalid file type. Only SVG, JPEG, PNG, and GIF files are allowed."
    );
    error.status = 415; // Unsupported Media Type
    cb(error, false); // Reject file upload
  }
};
const uploadCustomerProfileImages = multer({
  storage: storage,
  fileFilter: fileFilter, // Apply the custom file filter
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
  },
});
export default uploadCustomerProfileImages;
