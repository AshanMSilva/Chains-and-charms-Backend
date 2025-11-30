const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var reviewSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

var productSchema = new Schema(
  {
    productCode: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    variety: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variety",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    carotSize: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "products/default-product.jpg",
    },
    price: {
      type: Number,
      required: true,
    },
    isDiscountApplied: {
      type: Boolean,
      default: false,
    },
    oldPrice: {
      type: Number,
      required: false,
    },
    availability: {
      type: Number,
      required: true,
    },
    materialUsed: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      enum: ["gold", "silver"],
      required: true,
    },
    size: {
      type: String,
      default: "",
    },
    sales: {
      type: Number,
      default: 0,
    },
    totalRating: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

var Products = mongoose.model("Product", productSchema);

module.exports = Products;
