import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { APP_SECRET, APP_SECRET2 } from "../config/index.js";

//Utility functions
export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};


export const GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

export const removeCountryCode = (phoneNo) => {
  let modifiedPhoneNumber = phoneNo.substring(3);
  console.log(modifiedPhoneNumber); // Output: 9016600610
  return modifiedPhoneNumber;
};
export const GenerateForgotPasswordSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET2, { expiresIn: "1h" });
  } catch (error) {
    console.log(error);
    return error;
  }
};
export const ValidateSignatureAndSendData = async (req, signature) => {
  try {
    console.log(signature);
    const payload = await jwt.verify(signature, APP_SECRET2);
    req.user = payload;
    return {
      isValid: true,
      data: payload,
    };
  } catch (error) {
    console.log(error);
    return false;
  }
};
export const ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const ValidateSignature = async (req, signature) => {
  try {
    console.log("signatures", signature);
    const payload = await jwt.verify(signature, APP_SECRET);
    console.log("payload", payload);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};
