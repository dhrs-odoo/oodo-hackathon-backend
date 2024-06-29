import { ValidateSignature } from "../../utils/index.js";

const auth = async (req, res, next) => {
  const ServiceProviderAuthToken = req.cookies?.serviceProviderAuthToken;

  const isAuthorized = await ValidateSignature(req, ServiceProviderAuthToken);

  if (isAuthorized) {
    console.log("isAuthorized");
    return next();
  }
  return res.status(403).json({ message: "Not Authorized" });
};

export default auth;
