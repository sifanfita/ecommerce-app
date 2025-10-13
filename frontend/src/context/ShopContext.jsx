import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";



export const ShopContext = createContext();

const ShopContextProvider = (props) => { 
    const currency = 'ETB';
    const delivery_fee = 100;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [paymentProof, setPaymentProof] = useState(null);
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    
    const [deliveryInfo, setDeliveryInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    phone: "",
  });

  const [productstData, setProductstData] = useState([]);
  
    useEffect(() => {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setProductstData(tempData);
    }, [cartItems]);


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

    const handlePlaceOrder = () => {
    if (!paymentProof) {
      toast.error("⚠️ Please upload proof of payment before placing order.");
      return;
    }

    
  

    const orderData = {
      customer: deliveryInfo,
      items: productstData,
      totalAmount: getCartAmount() + (productstData.length > 0 ? 100 : 0), // e.g. +delivery_fee
      currency,
      paymentProof: paymentProof.name,
      orderDate: new Date().toLocaleDateString(),
    };

    

    toast.success("✅ Order placed successfully (simulated).");
    navigate("/orders");
    
  };

  const getProducstData = async () => {

    try {

        const response = await axios.get(backendUrl + '/api/product/list')
        if (response.data.success) {
            setProducts(response.data.products);
            
        }
        else{
            toast.error(response.data.message);
        }


        
        

        
    } catch (error) {
        console.log(error);
        toast.error(error.message);
        
    }

  }
  useEffect(() => {
    getProducstData()
  }, [])

  useEffect(() => {
    if (!token && sessionStorage.getItem('token')) {
        sessionStorage.setItem('token', token);
    }
  }, []);

    const value = {
         products, currency, delivery_fee, search, setSearch, showSearch, setShowSearch, cartItems, setCartItems, addToCart, getCartCount, updateQuantity, getCartAmount, handlePlaceOrder, paymentProof, setPaymentProof, navigate, deliveryInfo, setDeliveryInfo, backendUrl, token, setToken
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}

        </ShopContext.Provider>
    )
}

export default ShopContextProvider