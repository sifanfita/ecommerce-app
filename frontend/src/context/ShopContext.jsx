import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "ETB";
  const delivery_fee = 100;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [productstData, setProductstData] = useState([]);
  const [paymentProof, setPaymentProof] = useState(null);
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

  /* =========================
     BUILD CART DATA
  ========================= */

  useEffect(() => {
    const tempData = [];

    for (const productId in cartItems) {
      for (const key in cartItems[productId]) {
        if (cartItems[productId][key] > 0) {
          const [color, size] = key.split("-");

          tempData.push({
            _id: productId,
            color,
            size,
            quantity: cartItems[productId][key],
          });
        }
      }
    }

    setProductstData(tempData);
  }, [cartItems]);

  /* =========================
     ADD TO CART
  ========================= */

  const addToCart = async (itemId, color, size) => {
  if (!color || !size) {
    toast.error("Please select both color and size");
    return;
  }

  let cartData = structuredClone(cartItems) || {};

  // Initialize product entry if it doesn't exist
  if (!cartData[itemId]) {
    cartData[itemId] = {};
  }

  // Initialize size entry if it doesn't exist
  const key = `${color}-${size}`;
  if (!cartData[itemId][key]) {
    cartData[itemId][key] = 0;
  }

  // Increment quantity
  cartData[itemId][key] += 1;

  setCartItems(cartData);

  if (token) {
    try {
      await axios.post(
        backendUrl + "/api/cart/add",
        { itemId, color, size },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }
};



// Get available stock for a specific product/color/size
const getAvailableStock = (product, color, size) => {
  const colorObj = product.colors.find((c) => c.color === color);
  if (!colorObj) return 0;

  const sizeObj = colorObj.sizes.find((s) => s.size === size);
  if (!sizeObj) return 0;

  return sizeObj.stock;
};


  /* =========================
   UPDATE QUANTITY
========================= */

const updateQuantity = async (itemId, sizeKey, quantity) => {
  let cartData = structuredClone(cartItems);

  const productInfo = products.find((p) => p._id === itemId);
  if (!productInfo) return;

  // Extract color and size from sizeKey
  const [color, size] = sizeKey.split("-");

  const availableStock = getAvailableStock(productInfo, color, size);

  const finalQuantity = Math.max(0, Math.min(quantity, availableStock));

  cartData[itemId][sizeKey] = finalQuantity;
  setCartItems(cartData);

  if (token) {
    try {
      await axios.post(
        backendUrl + "/api/cart/update",
        { itemId, size: sizeKey, quantity: finalQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.log(error);
    }
  }

  if (quantity > availableStock) {
    toast.error(`Only ${availableStock} item(s) available in stock.`);
  }
};



  /* =========================
     CART COUNT
  ========================= */

  const getCartCount = () => {
    let total = 0;

    for (const productId in cartItems) {
      for (const key in cartItems[productId]) {
        total += cartItems[productId][key];
      }
    }

    return total;
  };

  /* =========================
     CART AMOUNT
  ========================= */

  const getCartAmount = () => {
    let total = 0;

    for (const productId in cartItems) {
      const productInfo = products.find(
        (p) => p._id.toString() === productId
      );

      for (const key in cartItems[productId]) {
        const quantity = cartItems[productId][key];

        if (quantity > 0 && productInfo) {
          total += productInfo.price * quantity;
        }
      }
    }

    return total;
  };

  /* =========================
     PLACE ORDER
  ========================= */

  const handlePlaceOrder = async () => {
    if (!paymentProof) {
      toast.error("Upload payment proof first");
      return;
    }

    try {
      const fullItems = productstData.map((item) => {
        const productInfo = products.find((p) => p._id === item._id);

        return {
          itemId: item._id,
          name: productInfo?.name,
          price: productInfo?.price,
          image: productInfo?.image?.[0],
          color: item.color,
          size: item.size,
          quantity: item.quantity,
        };
      });

      const formData = new FormData();

      formData.append(
        "amount",
        getCartAmount() + (productstData.length ? delivery_fee : 0)
      );

      const fullName =
        deliveryInfo.firstName + " " + deliveryInfo.lastName;

      const orderAddress = {
        ...deliveryInfo,
        name: fullName,
      };

      formData.append("address", JSON.stringify(orderAddress));
      formData.append("items", JSON.stringify(fullItems));
      formData.append("paymentProof", paymentProof);

      const response = await axios.post(
        backendUrl + "/api/order/place",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Order placed successfully");

        setCartItems({});
        setPaymentProof(null);

        navigate("/orders");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Order failed");
    }
  };

  /* =========================
     PRODUCTS
  ========================= */

  const getProducts = async () => {
    try {
      const res = await axios.get(
        backendUrl + "/api/product/list"
      );

      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* =========================
     USER CART
  ========================= */

  const getUserCart = async (token) => {
    try {
      const res = await axios.get(
        backendUrl + "/api/cart/get",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setCartItems(res.data.cartData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* =========================
     INIT
  ========================= */

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);
      getUserCart(storedToken);
    }
  }, []);

  const value = {
    products,
    currency,
    delivery_fee,
    cartItems,
    setCartItems,
    addToCart,
    updateQuantity,
    getCartCount,
    getCartAmount,
    handlePlaceOrder,
    paymentProof,
    setPaymentProof,
    deliveryInfo,
    setDeliveryInfo,
    navigate,
    backendUrl,
      token,
      setToken,

  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
