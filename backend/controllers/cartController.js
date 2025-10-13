import userModel from "../models/userModel.js";

// add products to usercart
const addToCart = async (req, res) => {

    try {

        const { userId, itemId, size } = req.body;
        const userData = await userModel.findById(userId);
        let cartData = await userData.cartData;

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else {
                cartData[itemId][size] = 1;
            }

        }
        else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        await userModel.findByIdAndUpdate(userId, { cartData});
        return res.json({
            success: true,
            message: "Item added to cart",
            data: cartData
        })
    } catch (error) {
        return res.json({
            success: false,
            message: "Error adding item to cart",
            error: error.message
        })
    }


}

// update user  cart 
const updateCart = async (req, res) => {

    try {
        const { userId, itemId, size, quantity } = req.body;
        const userData = await userModel.findById(userId);
        let cartData = await userData.cartData;
        cartData[itemId][size] = quantity;
        await userModel.findByIdAndUpdate(userId, { cartData });
        return res.json({
            success: true,
            message: "Cart updated",
            data: cartData
        })


        
    } catch (error) {
        console.error(error);
        return res.json({
            success: false,
            message: "Error updating cart",
            error: error.message
        })
        
    }

}

// get user cart data
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId);
        let cartData = await userData.cartData;
        return res.json({
            success: true,
            message: "User cart data fetched",
            data: cartData
        })
        
    } catch (error) {
        console.error(error);
        return res.json({
            success: false,
            message: "Error fetching user cart data",
            error: error.message
        })
    }

}

export { addToCart, updateCart, getUserCart };
