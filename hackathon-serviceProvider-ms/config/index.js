import dotEnv from "dotenv";

if (process.env.NODE_ENV !== "prod") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotEnv.config({ path: configFile });
} else {
  dotEnv.config();
}

export const PORT = process.env.PORT;
export const DB_URL = process.env.MONGODB_URI;
export const APP_SECRET = process.env.APP_SECRET;
export const ACCOUNT_SID = process.env.ACCOUNT_SID;
export const AUTH_TOKEN = process.env.AUTH_TOKEN;
export const AWS_REGION = process.env.AWS_REGION;
export const AWS_ACL = process.env.AWS_ACL;
export const AWS_BUCKET_NAME_1 = process.env.AWS_BUCKET_NAME_1;
export const AWS_ACCESS_KEY_ID_1 = process.env.AWS_ACCESS_KEY_ID_1;
export const AWS_SECRET_ACCESS_KEY_ID_1 = process.env.AWS_SECRET_ACCESS_KEY_ID_1;
export const AWS_ACCESS_KEY_ID_2 = process.env.AWS_ACCESS_KEY_ID_2;
export const AWS_SECRET_ACCESS_KEY_ID_2 = process.env.AWS_SECRET_ACCESS_KEY_ID_2;
export const AWS_BUCKET_NAME_2 = process.env.AWS_BUCKET_NAME_2;
export const AWS_ACCESS_KEY_ID_3 = process.env.AWS_ACCESS_KEY_ID_3;
export const AWS_SECRET_ACCESS_KEY_ID_3 = process.env.AWS_SECRET_ACCESS_KEY_ID_3;
export const MAIL_ID = process.env.MAIL_ID;
export const MAIL_APP_PASSWORD = process.env.MAIL_APP_PASSWORD;
export const APP_SECRET2 = process.env.APP_SECRET2;
