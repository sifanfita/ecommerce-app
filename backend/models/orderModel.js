import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      image: [{ type: String, required: true }],
      quantity: { type: Number, required: true },
      size: { type: String },
      color: { type: String },   // <-- added
    },
  ],

  amount: { type: Number, required: true },
  address: {
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  
},

  status: {
    type: String,
    required: true,
    default: "Order placed",
  },

  paymentProof: { type: String, default: "" },

  date: { type: Number, required: true },
});

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
