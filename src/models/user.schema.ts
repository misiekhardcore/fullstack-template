import { Schema } from "mongoose";

export const UserSchema = new Schema(
  {
    name: String,
    password: String,
    seller: {
      type: Boolean,
      default: false,
    },
    address: {
      addr1: String,
      addr2: String,
      city: String,
      state: String,
      country: String,
      zip: Number,
    },
  },
  {
    timestamps: true,
  }
);
