import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

  const currency = "ETB";
  const delivery_fee = 100;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");

  // ================= ADD TO CART =================

  const addToCart = (itemId, size, color, stock) => {
    if (!size || !color) {
      alert("Select size and color");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (!cartData[itemId]) cartData[itemId] = {};
    if (!cartData[itemId][color]) cartData[itemId][color] = {};
    if (!cartData[itemId][color][size]) cartData[itemId][color][size] = 0;

    if (cartData[itemId][color][size] >= stock) {
      alert("No more stock available");
      return;
    }

    cartData[itemId][color][size] += 1;
    setCartItems(cartData);
  };

  // ================= UPDATE QUANTITY =================

  const updateQuantity = (itemId, size, color, quantity) => {
    let cartData = structuredClone(cartItems);

    if (quantity <= 0) {
      delete cartData[itemId][color][size];
    } else {
      cartData[itemId][color][size] = quantity;
    }

    setCartItems(cartData);
  };

  // ================= GET CART COUNT =================

  const getCartCount = () => {
    let total = 0;

    for (const items in cartItems) {
      for (const color in cartItems[items]) {
        for (const size in cartItems[items][color]) {
          total += cartItems[items][color][size];
        }
      }
    }

    return total;
  };

  // ================= GET CART AMOUNT =================

  const getCartAmount = () => {
    let totalAmount = 0;

    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);

      if (!itemInfo) continue;

      for (const color in cartItems[items]) {
        for (const size in cartItems[items][color]) {
          totalAmount +=
            itemInfo.price * cartItems[items][color][size];
        }
      }
    }

    return totalAmount;
  };

  // ================= FETCH PRODUCTS =================

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);

      if (response.data.success) {
        setProducts(response.data.data);   // ✅ FIXED HERE
      }

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  // ================= CONTEXT VALUE =================

  const value = {
    products,
    currency,
    delivery_fee,

    search,
    setSearch,
    showSearch,
    setShowSearch,

    cartItems,
    addToCart,
    updateQuantity,
    getCartCount,
    getCartAmount,

    backendUrl,
    token,
    setToken,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
