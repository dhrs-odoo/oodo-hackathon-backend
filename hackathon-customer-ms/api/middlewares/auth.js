import { ValidateSignature } from "../../utils/index.js";

const auth = async (req, res, next) => {
  const customerAuthToken = req.cookies?.customerAuthToken;

  const isAuthorized = await ValidateSignature(req, customerAuthToken);

  if (isAuthorized) {
    return next();
  }
  return res.status(403).json({ message: "Not Authorized" });
};

export default auth;
