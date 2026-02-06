import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: Array, required: true },
  category: { type: String, required: true },

  colors: [
    {
      color: { type: String, required: true },
      sizes: [
        {
          size: { type: String, required: true },
          stock: { type: Number, required: true, min: 0 },
        },
      ],
    },
  ],

  bestSeller: { type: Boolean, default: false },
  date: { type: Number, required: true },
});

/* 🔥 Virtual total stock */
productSchema.virtual("totalStock").get(function () {
  let total = 0;

  this.colors.forEach((color) => {
    color.sizes.forEach((size) => {
      total += size.stock;
    });
  });

  return total;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
