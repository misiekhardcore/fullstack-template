import { Schema, Types } from "mongoose";

export const OrderSchema = new Schema(
  {
    owner: {
      type: Types.ObjectId,
      ref: "User",
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    products: [
      {
        product: {
          type: Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
