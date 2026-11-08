
import { createContext, useCallback, useEffect, useState } from "react";
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
  const [token, setToken] = useState(
    () => sessionStorage.getItem("token") || ""
  );

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
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch {
        localStorage.removeItem("cart");
      }
    }

    const storedInfo = localStorage.getItem("deliveryInfo");
    if (storedInfo) {
      try {
        setDeliveryInfo(JSON.parse(storedInfo));
      } catch {
        localStorage.removeItem("deliveryInfo");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("deliveryInfo", JSON.stringify(deliveryInfo));
  }, [deliveryInfo]);

  // ================= FETCH / REFRESH PRODUCTS =================
  const refreshProducts = useCallback(async ({ showError = true } = {}) => {
    setProductsLoading(true);
    setProductsError("");

    try {
      if (!backendUrl) {
        throw new Error("Backend URL is not configured");
      }

      const response = await axios.get(`${backendUrl}/api/product/list`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to load products");
      }

      const latestProducts = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      setProducts(latestProducts);
      setProductsError("");

      return true;
    } catch (error) {
      console.log("FETCH PRODUCTS ERROR:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load products";

      setProductsError(message);

      if (showError) {
        toast.error(message);
      }

      // Keep previously loaded products if refreshing fails.
      return false;
    } finally {
      setProductsLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // ================= ADD TO CART =================
  const addToCart = (itemId, color, size, quantity = 1) => {
    if (!size || !color) {
      toast.error("Select size and color");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      toast.error("Invalid quantity");
      return;
    }

    const product = products.find((p) => p._id === itemId);

    if (!product) {
      toast.error("Product not found");
      return;
    }

    const normalizedColor = color.trim().toLowerCase();
    const normalizedSize = size.trim().toLowerCase();

    const colorObj = product.colors.find(
      (c) => c.color.trim().toLowerCase() === normalizedColor
    );

    if (!colorObj) {
      toast.error("Selected color not available");
      return;
    }

    const sizeObj = colorObj.sizes.find(
      (s) => s.size.trim().toLowerCase() === normalizedSize
    );

    if (!sizeObj || sizeObj.stock <= 0) {
      toast.error("Selected size is out of stock");
      return;
    }

    const currentQuantity =
      cartItems[itemId]?.[normalizedColor]?.[normalizedSize] || 0;

    const newQuantity = currentQuantity + quantity;

    if (newQuantity > sizeObj.stock) {
      toast.error(
        `Only ${sizeObj.stock - currentQuantity} more items can be added to your cart`
      );
      return;
    }

    const cartData = structuredClone(cartItems);

    if (!cartData[itemId]) cartData[itemId] = {};
    if (!cartData[itemId][normalizedColor]) {
      cartData[itemId][normalizedColor] = {};
    }

    cartData[itemId][normalizedColor][normalizedSize] = newQuantity;

    setCartItems(cartData);
    toast.success(`${quantity} item(s) added to cart!`);
  };

  // ================= UPDATE QUANTITY =================
  const updateQuantity = (itemId, color, size, quantity) => {
    const normalizedColor = color.trim().toLowerCase();
    const normalizedSize = size.trim().toLowerCase();

    if (quantity <= 0) {
      const cartData = structuredClone(cartItems);
      delete cartData[itemId]?.[normalizedColor]?.[normalizedSize];
      setCartItems(cartData);
      return;
    }

    const product = products.find((p) => p._id === itemId);

    if (!product) {
      toast.error("Product not found");
      return;
    }

    const colorObj = product.colors.find(
      (c) => c.color.trim().toLowerCase() === normalizedColor
    );

    const sizeObj = colorObj?.sizes.find(
      (s) => s.size.trim().toLowerCase() === normalizedSize
    );

    const maxStock = sizeObj?.stock ?? 0;

    if (quantity > maxStock) {
      toast.error(`Only ${maxStock} available for this size`);
      quantity = maxStock;
    }

    const cartData = structuredClone(cartItems);

    if (!cartData[itemId]) cartData[itemId] = {};
    if (!cartData[itemId][normalizedColor]) {
      cartData[itemId][normalizedColor] = {};
    }

    cartData[itemId][normalizedColor][normalizedSize] = quantity;
    setCartItems(cartData);
  };

  // ================= CART COUNT & AMOUNT =================
  const getCartCount = () => {
    let total = 0;

    for (const item in cartItems) {
      const product = products.find((p) => p._id === item);
      if (!product) continue;

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
      const product = products.find((p) => p._id === item);
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
        toast.error("Backend URL is not configured.");
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

      const items = [];

      for (const itemId in cartItems) {
        const product = products.find((p) => p._id === itemId);

        if (!product) {
          toast.error("A product in your cart is no longer available.");
          return;
        }

        for (const color in cartItems[itemId]) {
          const colorObj = product.colors.find(
            (c) => c.color.trim().toLowerCase() === color.trim().toLowerCase()
          );

          if (!colorObj) {
            toast.error(
              `Selected color "${color}" is no longer available for "${product.name}".`
            );
            return;
          }

          for (const size in cartItems[itemId][color]) {
            const sizeObj = colorObj.sizes.find(
              (s) => s.size.trim().toLowerCase() === size.trim().toLowerCase()
            );

            if (!sizeObj || sizeObj.stock <= 0) {
              toast.error(
                `Selected size "${size}" is no longer available for "${product.name}".`
              );
              return;
            }

            const quantity = cartItems[itemId][color][size];

            if (quantity > sizeObj.stock) {
              toast.error(
                `Not enough stock for "${colorObj.color}" size "${sizeObj.size}" of "${product.name}".`
              );
              return;
            }

            // Send only identifiers and quantities.
            // The backend gets prices and product details from PostgreSQL.
            items.push({
              itemId,
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
      formData.append("paymentProof", paymentProof);

      const response = await axios.post(
        `${backendUrl}/api/order/place`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setCartItems({});
        localStorage.removeItem("cart");

        toast.success("Order placed successfully");
        navigate("/orders");
      } else {
        toast.error(response.data.message || "Order failed");
      }
    } catch (error) {
      console.log("PLACE ORDER ERROR:", error);
      toast.error(error.response?.data?.message || "Order failed");
    }
  };

  const value = {
    products,
    productsLoading,
    productsError,
    refreshProducts,
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

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
