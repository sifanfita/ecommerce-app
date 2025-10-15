import mongoose from "mongoose";

const orderSChema = new mongoose.Schema({
    userId: {type: String, required: true},
    items: {type: Array, required: true},
    amount: {type: Number, required: true},
    address: {type: Object, required: true},
    status: {type: String, required: true, default: "Order placed"},
    paymentProof: {type: String, required: true, default: ""},
    date: {type: Number, required: true}
}

)


const orderModel = mongoose.models.order || mongoose.model('order', orderSChema);

export default orderModel;