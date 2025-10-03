import {v2 as cloudinary} from 'cloudinary';
import productModel from '../models/productModel.js';

// function for add product
const addProduct = async (req, res) => {

    try {

        const { name, description, price, category, sizes, bestSeller } = req.body;

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);
        // let's upload images to cloudinary and get the urls
        let imageUrls = await Promise.all(
            images.map( async (item) => {
                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'})
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            price: Number(price),
            category,
            sizes: JSON.parse(sizes),
            bestSeller: bestSeller === 'true' ? true : false,
            date: Date.now(),
            image: imageUrls
        }

        // save the product data to database
        const product = new productModel(productData);
        await product.save();

        res.json({
            success: true,
            message: 'Product added successfully',
            data: productData
        })





        

        



        
    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        })
        
    }




}

// function for get all products
const listProducts = async (req, res) => {

    try {
        const products = await productModel.find({});
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }

}


// function for get single product
const singleProduct = async (req, res) => {

}

// function for remove product
const removeProduct = async (req, res) => {

    try {

        await productModel.findByIdAndDelete(req.body.id);
        res.json({
            success: true,
            message: 'Product removed successfully'
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }

}


export { addProduct, listProducts, singleProduct, removeProduct }