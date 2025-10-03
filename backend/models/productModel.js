
import mongoose from "mongoose";


// Create a schema/blueprint for the product model
const productSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    image: {type: Array, required: true},
    category: {type: String, required: true},
    size: {type: Array, required: true},
    bestSeller: {type: Boolean},
    date: {type: Number, required: true}




})

// Model
const productModel = mongoose.models.product || mongoose.model("product", productSchema)

export default productModel;