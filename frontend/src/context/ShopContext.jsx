import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "ETB";
  const delivery_fee = 100;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [token, setToken] = useState(() => sessionStorage.getItem("token") || "");

  const [cartItems, setCartItems] = useState({});
  const [deliveryInfo, setDeliveryInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    phone: "",
  });

  // ================= LOAD CART & DELIVERY INFO =================
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCartItems(JSON.parse(storedCart));

    const storedInfo = localStorage.getItem("deliveryInfo");
    if (storedInfo) setDeliveryInfo(JSON.parse(storedInfo));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("deliveryInfo", JSON.stringify(deliveryInfo));
  }, [deliveryInfo]);

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        if (!backendUrl) {
          setProducts([]);
          setProductsError("Backend URL not configured");
          toast.error("Backend URL is not configured. Set VITE_BACKEND_URL in your frontend .env file.");
          return;
        }

        setProductsError("");

        const response = await axios.get(`${backendUrl}/api/product/list`);
        if (response.data.success) {
          setProducts(Array.isArray(response.data.data) ? response.data.data : []);
        } else {
          setProducts([]);
          setProductsError(response.data.message || "Failed to load products");
          toast.error(response.data.message || "Failed to load products");
        }
      } catch (error) {
        console.log(error);
        setProducts([]);
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Failed to load products";
        setProductsError(msg);
        toast.error(msg);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [backendUrl]);

  // ================= ADD TO CART =================
  const addToCart = (itemId, color, size) => {
    if (!size || !color) {
      toast.error("Select size and color");
      return;
    }

    const product = products.find(p => p._id === itemId);
    if (!product) {
      toast.error("Product not found");
      return;
    }

    const normalizedColor = color.trim().toLowerCase();
    const normalizedSize = size.trim().toLowerCase();

    const colorObj = product.colors.find(c => c.color.trim().toLowerCase() === normalizedColor);
    if (!colorObj) {
      toast.error("Selected color not available");
      return;
    }

    const sizeObj = colorObj.sizes.find(s => s.size.trim().toLowerCase() === normalizedSize);
    if (!sizeObj || sizeObj.stock <= 0) {
      toast.error("Selected size not available");
      return;
    }

    let cartData = structuredClone(cartItems);
    if (!cartData[itemId]) cartData[itemId] = {};
    if (!cartData[itemId][normalizedColor]) cartData[itemId][normalizedColor] = {};
    if (!cartData[itemId][normalizedColor][normalizedSize]) cartData[itemId][normalizedColor][normalizedSize] = 0;

    if (cartData[itemId][normalizedColor][normalizedSize] >= sizeObj.stock) {
      toast.error("No more stock available");
      return;
    }

    cartData[itemId][normalizedColor][normalizedSize] += 1;
    setCartItems(cartData);
  };

  // ================= UPDATE QUANTITY =================
  const updateQuantity = (itemId, color, size, quantity) => {
    let cartData = structuredClone(cartItems);
    const normalizedColor = color.trim().toLowerCase();
    const normalizedSize = size.trim().toLowerCase();

    if (quantity <= 0) {
      delete cartData[itemId]?.[normalizedColor]?.[normalizedSize];
    } else {
      cartData[itemId][normalizedColor][normalizedSize] = quantity;
    }

    setCartItems(cartData);
  };

  // ================= CART COUNT & AMOUNT =================
  const getCartCount = () => {
    let total = 0;
    for (const item in cartItems) {
      const product = products.find(p => p._id === item);
      if (!product) continue; // skip entries for removed products

      for (const color in cartItems[item]) {
        for (const size in cartItems[item][color]) {
          total += cartItems[item][color][size];
        }
      }
    }
    return total;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      const product = products.find(p => p._id === item);
      if (!product) continue;

      for (const color in cartItems[item]) {
        for (const size in cartItems[item][color]) {
          totalAmount += product.price * cartItems[item][color][size];
        }
      }
    }
    return totalAmount;
  };

  // ================= PLACE ORDER =================
  const handlePlaceOrder = async (paymentProof) => {
    try {
      if (!backendUrl) {
        toast.error("Backend URL is not configured. Set VITE_BACKEND_URL in your frontend .env file.");
        return;
      }

      if (!token) {
        toast.error("Please login before placing an order.");
        navigate("/login");
        return;
      }

      if (!paymentProof) {
        toast.error("Payment proof is required");
        return;
      }

      // Clean up cart entries for products that no longer exist
      const cleanedCart = {};
      let removedStaleItems = false;

      for (const itemId in cartItems) {
        const product = products.find(p => p._id === itemId);
        if (!product) {
          removedStaleItems = true;
          continue;
        }
        cleanedCart[itemId] = cartItems[itemId];
      }

      if (removedStaleItems) {
        setCartItems(cleanedCart);
        toast.info("Some unavailable products were removed from your cart.");
      }

      const items = [];

      for (const itemId in cleanedCart) {
        const product = products.find(p => p._id === itemId);

        for (const color in cleanedCart[itemId]) {
          const colorObj = product.colors.find(
            c => c.color.trim().toLowerCase() === color.trim().toLowerCase()
          );
          if (!colorObj) {
            toast.error(`Selected color "${color}" not available for product "${product.name}"`);
            return;
          }

          for (const size in cleanedCart[itemId][color]) {
            const sizeObj = colorObj.sizes.find(
              s => s.size.trim().toLowerCase() === size.trim().toLowerCase()
            );
            if (!sizeObj || sizeObj.stock <= 0) {
              toast.error(`Selected size "${size}" not available for product "${product.name}"`);
              return;
            }

            const quantity = cleanedCart[itemId][color][size];
            if (quantity > sizeObj.stock) {
              toast.error(`Not enough stock for "${colorObj.color}" size "${sizeObj.size}" of product "${product.name}"`);
              return;
            }

            items.push({
              itemId,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity,
              color: colorObj.color,
              size: sizeObj.size,
            });
          }
        }
      }

      if (!items.length) {
        toast.error("Your cart is empty.");
        return;
      }

      const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0) + delivery_fee;

      const normalizedAddress = {
        name: `${deliveryInfo.firstName || ""} ${deliveryInfo.lastName || ""}`.trim(),
        email: deliveryInfo.email,
        phone: deliveryInfo.phone,
        street: deliveryInfo.street,
        city: deliveryInfo.city,
        state: deliveryInfo.state,
      };

      const formData = new FormData();
      formData.append("items", JSON.stringify(items));
      formData.append("address", JSON.stringify(normalizedAddress));
      formData.append("amount", amount);
      formData.append("paymentProof", paymentProof);

      const response = await axios.post(`${backendUrl}/api/order/place`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setCartItems({});
        localStorage.removeItem("cart");
        toast.success("Order placed successfully");
        navigate("/orders");
      } else {
        toast.error(response.data.message || "Order failed");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Order failed");
    }
  };

  const value = {
    products,
    productsLoading,
    productsError,
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
    deliveryInfo,
    setDeliveryInfo,
    backendUrl,
    token,
    setToken,
    navigate,
    handlePlaceOrder,
  };

  return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>;
};

export default ShopContextProvider;
