import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const addressTypeSchema = new mongoose.Schema({
  label: {
    type: String,
  },
  value: {
    type: String,
  },
});
const addressSchema = new mongoose.Schema(
  {
    addressId: {
      type: String,
      required: true,
      default: uuid,
    },
    apartmentNo: {
      type: String,
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    district: {
      type: String,
    },
    state: {
      type: String,
    },
    zipCode: {
      type: String,
      required: true,
    },
    fullAddress: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
    },
    addressType: {
      type: addressTypeSchema,
      required: true,
    },
    country: {
      type: String,
    },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
    },
    orderName: {
      type: String,
    },
  },
  { timestamps: true }
);

const customer = new mongoose.Schema(
  {
    customerId: {
      type: String,
      require: true,
      unique: true,
      default: uuid,
    },
    firstName: {
      type: String,
      require: true,
    },
    middleName: {
      type: String,
    },
    lastName: {
      type: String,
      require: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    DOB: {
      type: Date,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    mobileNo: {
      type: Number,
    },
    password: {
      type: String,
      require: true,
    },
    salt: {
      type: String,
      require: true,
    },
    address: {
      type: [addressSchema],
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    workerHistory: {
      type: [orderSchema],
    },
    profileImagePath: {
      type: String,
      default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("customerDetails", customer);

export { Customer };
