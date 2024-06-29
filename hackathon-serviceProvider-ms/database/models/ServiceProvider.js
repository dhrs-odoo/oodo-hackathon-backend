import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const addressSchema = new mongoose.Schema(
  {
    addressId: {
      type: String,
      default: uuid,
    },
    streetAddress: {
      type: String,
    },
    apartmentNo: {
      type: String,
    },
    city: {
      type: String,
    },
    district: {
      type: String,
    },
    state: {
      type: String,
    },
    zipCode: {
      type: String,
    },
  },
  { timestamps: true }
);
const workHistorySchema = new mongoose.Schema(
  {
    workId: {
      type: String,
      default: uuid,
    },
    customerId: {
      type: String,
    },
    serviceName: {
      type: String,
    },
    servicePhotos: {
      type: [
        {
          type: [String],
          validate: {
            validator: function (array) {
              return array.length <= 20;
            },
            message: "Service photos array cannot have more than 20 items.",
          },
        },
      ],
    },
    rating: {
      type: Number,
    },
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      default: uuid,
    },
    customerId: {
      type: String,
      required: true,
    },
    furnitureItems: {
      type: [
        {
          itemId: String,
          rentalDates: {
            startDate: Date,
            endDate: Date,
          },
        },
      ],
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    reviewId: {
      type: String,
      default: uuid,
    },
    customerId: {
      type: String,
    },
    serviceName: {
      type: String,
    },
    review: {
      type: String,
    },
    isVisibleOnWebsite: {
      type: Boolean,
      required: true,
      default: false,
    },
    isApprovedByAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    rating: {
      type: Number,
    },
    servicePhotos: {
      type: [
        {
          type: [String],
          validate: {
            validator: function (array) {
              return array.length <= 20;
            },
            message: "Service photos array cannot have more than 20 items.",
          },
        },
      ],
    },
  },
  { timestamps: true }
);

const specializationsSchema = new mongoose.Schema({
  value: { type: String },
  label: { type: String },
});

const profileSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      default: "",
    },
    specializations: {
      type: [specializationsSchema],
    },
    description: {
      type: String,
      default: "",
    },
    workExperience: {
      type: specializationsSchema,
    },
    rating: {
      type: Number,
      default: 0,
    },
    servicePhotos: {
      type: [String],
    },
  },
  { timestamps: true }
);

const availabilityTimeSchema = new mongoose.Schema({
  availabilityTimeId: {
    type: String,
    default: uuid,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
});

const furnitureItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      default: uuid,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    rentalPrice: {
      type: Number,
      required: true,
    },
    availabilityStatus: {
      type: String,
      enum: ["available", "rented"],
      default: "available",
    },
    images: {
      type: [String],
    },
    rentalDates: {
      startDate: Date,
      endDate: Date,
    },
    category: {
      type: String,
    },
  },
  { timestamps: true }
);

const orderLocationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "Point",
    enum: ["Point"],
  },
  coordinates: {
    type: [Number],
    required: true,
    default: [43.12231, 43.12231],
  },
});

const serviceProvider = new mongoose.Schema(
  {
    serviceProviderId: {
      type: String,
      required: true,
      unique: true,
      default: uuid,
    },
    firstName: {
      type: String,
      default: "",
    },
    middleName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dob: {
      type: Date,
      default: Date(new Date()),
    },
    email: {
      type: String,
      default: "",
      require: true,
    },
    salt: {
      type: String,
      require: true,
    },
    mobileNo: {
      type: Number,
      default: 1234567890,
    },
    profileImage: {
      type: String,
    },
    profileImagePath: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: [addressSchema],
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: false,
    },
    availabilityTime: {
      type: [availabilityTimeSchema],
    },
    orderLocation: {
      type: orderLocationSchema,
    },
    verificationStatus: {
      type: String,
      required: true,
      default: "pending",
      enum: ["pending", "approved", "disapproved", "query"],
    },
    productImageVideos: {
      type: [String],
    },
    furnitureItems: {
      type: [furnitureItemSchema],
    },
    workHistory: {
      type: [workHistorySchema],
    },
    reviews: {
      type: [reviewSchema],
    },
    booking: {
      type: [bookingSchema],
    },
    profile: {
      type: profileSchema,
    },
  },
  { timestamps: true }
);

const ServiceProvider = mongoose.model(
  "serviceProviderDetails",
  serviceProvider
);

export { ServiceProvider };
