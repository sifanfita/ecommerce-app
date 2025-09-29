import { createContext, useEffect, useState } from "react";
import { products } from "../assets/assets";
import { toast } from "react-toastify";


export const ShopContext = createContext();

const ShopContextProvider = (props) => { 
    const currency = 'ETB';
    const delivery_fee = 100;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [paymentProof, setPaymentProof] = useState(null);

    const addToCart = async (ItemId, size) => {

        if (!size){
            toast.error("Please select a size");
            return;
        }
        let cartData = structuredClone(cartItems);
        if (cartData[ItemId]) {
            if (cartData[ItemId][size]) {
                cartData[ItemId][size] += 1;
            } else {
                cartData[ItemId][size] = 1;
            }
        }
        else{
            cartData[ItemId] = {};
            cartData[ItemId][size] = 1;
        }
        setCartItems(cartData);

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const item in cartItems) {
            for (const size in cartItems[item]) {
                try {
                    if (cartItems[item][size] > 0) {
                        totalCount += cartItems[item][size];
                    }
                    
                } catch (error) {
                    
                }

    }}        
    return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);


    }
    
    const getCartAmount =  () => {

        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find(product => product._id.toString() === items.toString());
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmount += itemInfo.price * cartItems[items][item];

                    }
                    
                } catch (error) {
                    
                }
                
            }

        }
        return totalAmount;

    }

    const handleCheckout = () => {
        if (!paymentProof) {
            alert("Please upload proof of payment before proceeding.");
            return; 
        }

        const formData = new FormData();
        formData.append("paymentProof", paymentProof); 
        formData.append("cart", JSON.stringify(cartItems));

        // Simulate API call for now
        console.log("Cart items:", cartItems);
        console.log("Uploaded file:", paymentProof);
        alert("Checkout simulated!");
    };


    const value = {
        products, currency, delivery_fee, search, setSearch, showSearch, setShowSearch, cartItems, setCartItems, addToCart, getCartCount, updateQuantity, getCartAmount, handleCheckout, paymentProof, setPaymentProof
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}

        </ShopContext.Provider>
    )
}

export default ShopContextProvider