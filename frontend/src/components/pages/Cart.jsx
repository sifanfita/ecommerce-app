import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../../context/ShopContext";
import Title from "../Title";
import { assets } from "../../assets/assets";
import CartTotal from "../CartTotal";
import Loader from "../Loader";
import CheckoutSteps from "../CheckoutSteps";

function Cart() {
  const { cartItems, products, currency, updateQuantity, navigate } =
    useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to get stock from nested colors/sizes
  const getAvailableStock = (product, sizeKey) => {
    const [color, size] = sizeKey.split("-");
    const colorObj = product.colors.find((c) => c.color === color);
    if (!colorObj) return 0;
    const sizeObj = colorObj.sizes.find((s) => s.size === size);
    return sizeObj?.stock || 0;
  };

  useEffect(() => {
    if (!products || products.length === 0) {
      setLoading(true);
      return;
    }

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

    setCartData(tempData);
    setLoading(false);
  }, [cartItems, products]);

  if (loading) {
    return <Loader message="Loading cart..." />;
  }

  return (
    <div className="pt-14">
      <CheckoutSteps currentStep={1} />
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {cartData.length === 0 ? (
        <div className="text-center py-14 flex flex-col items-center gap-4">
          <p className="text-gray-500">Your cart is empty.</p>
          <Link
            to="/collection"
            className="bg-black text-white text-sm px-6 py-3 hover:opacity-90 transition-opacity"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      ) : (
        <div>
          {cartData.map((item, index) => {
            const productData = products.find(
              (product) => product._id.toString() === item._id.toString()
            );
            if (!productData) return null;

            const availableStock = getAvailableStock(productData, item.size);

            return (
              <div
                key={index}
                className="py-4 border-t text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
              >
                <div className="flex items-start gap-6">
                  <img
                    className="w-16 sm:w-20"
                    src={productData?.image?.[0] || ""}
                    alt={productData.name}
                  />
                  <div>
                    <p className="text-xs sm:text-lg font-medium">
                      {productData.name}
                    </p>
                    <div className="flex items-center gap-5 mt-2">
                      <p>
                        {currency} {productData.price}
                      </p>
                      <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                        {item.size}
                      </p>
                    </div>
                  </div>
                </div>

                <input
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    if (val >= 1) {
                      if (val > availableStock) val = availableStock; // cap at stock
                      updateQuantity(item._id, item.size, val);
                    } else if (e.target.value === "" || val === 0) {
                      updateQuantity(item._id, item.size, 0);
                    }
                  }}
                  className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                  type="number"
                  min={1}
                  max={availableStock}
                  value={item.quantity}
                />

                <img
                  onClick={() => updateQuantity(item._id, item.size, 0)}
                  className="w-4 mr-4 sm:w-5 cursor-pointer"
                  src={assets.trashBin}
                  alt="Remove item"
                />
              </div>
            );
          })}

          <div className="flex justify-end my-20">
            <div className="w-full sm:w-[450px]">
              <CartTotal />
              <div className="w-full text-end">
                <button
                  className="bg-black text-white text-sm my-8 px-8 py-3"
                  disabled={cartData.length === 0}
                  onClick={() => navigate("/place-order")}
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
