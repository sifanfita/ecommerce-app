import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "ETB";
  const delivery_fee = 100;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [paymentProof, setPaymentProof] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [token, setToken] = useState("");

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

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);
    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      for (const size in cartItems[item]) {
        try {
          if (cartItems[item][size] > 0) {
            totalCount += cartItems[item][size];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find(
        (product) => product._id.toString() === items.toString()
      );
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalAmount;
  };

  const handlePlaceOrder = async () => {
    if (!paymentProof) {
      toast.error("⚠️ Please upload proof of payment before placing order.");
      return;
    }

    if (!deliveryInfo.firstName || !deliveryInfo.phone || !deliveryInfo.city) {
      toast.error("⚠️ Please complete all delivery fields.");
      return;
    }

    try {

      const fullItems = productstData.map((item) => {
        const productInfo = products.find((p) => p._id === item._id);
        return {
          itemId: item._id,
          name: productInfo?.name || "Unknown Product",
          price: productInfo?.price || 0,
          image: productInfo?.image?.[0] || "",
          size: item.size,
          quantity: item.quantity,
        };
      });
      const formData = new FormData();

      formData.append(
        "amount",
        getCartAmount() + (productstData.length > 0 ? delivery_fee : 0)
      );
      formData.append("address", JSON.stringify(deliveryInfo));
      

      formData.append("items", JSON.stringify(fullItems));
      formData.append("paymentProof", paymentProof);

      const response = await axios.post(
        backendUrl + "/api/order/place",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token,
          },
        }
      );

      if (response.data.success) {
        toast.success("✅ Order placed successfully!");
        setCartItems({});
        setPaymentProof(null);
        navigate("/orders");
      } else {
        console.log(response.data);
        toast.error("❌ " + response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error placing order: " + error.message);
    }
  };

  const getProducstData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.get(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  useEffect(() => {
    getProducstData();
  }, []);

  useEffect(() => {
    if (!token && sessionStorage.getItem("token")) {
      getUserCart(sessionStorage.getItem("token"));
      setToken(sessionStorage.getItem("token"));
    }
  }, []);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    handlePlaceOrder,
    paymentProof,
    setPaymentProof,
    navigate,
    deliveryInfo,
    setDeliveryInfo,
    backendUrl,
    token,
    setToken,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
