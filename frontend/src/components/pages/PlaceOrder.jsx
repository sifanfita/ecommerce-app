import React, { useContext, useEffect, useState } from "react";
import Title from "../Title";
import CartTotal from "../CartTotal";
import CheckoutSteps from "../CheckoutSteps";
import { ShopContext } from "../../context/ShopContext";
import { LoaderSpinner } from "../Loader";
import { validateEmail, validatePhone } from "../../utils/validation";
import { toast } from "react-toastify";

function PlaceOrder() {
  const {
   
    
    handlePlaceOrder,
    deliveryInfo,
    setDeliveryInfo,
    getCartCount,
    navigate,
  } = useContext(ShopContext);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentProof, setPaymentProof] = useState(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (getCartCount() === 0) navigate("/cart");
  }, [getCartCount, navigate]);

  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "street",
    "city",
    "state",
    "phone",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo({ ...deliveryInfo, [name]: value });

    // live validation
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: "This field is required" }));
    } else if (name === "email") {
      setErrors((prev) => ({ ...prev, [name]: validateEmail(value) || "" }));
    } else if (name === "phone") {
      setErrors((prev) => ({ ...prev, [name]: validatePhone(value) || "" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    let newErrors = {};
    requiredFields.forEach((field) => {
      if (!deliveryInfo[field]?.trim()) {
        newErrors[field] = "This field is required";
      } else if (field === "email") {
        const msg = validateEmail(deliveryInfo[field]);
        if (msg) newErrors[field] = msg;
      } else if (field === "phone") {
        const msg = validatePhone(deliveryInfo[field]);
        if (msg) newErrors[field] = msg;
      }
    });

    if (!paymentProof) {
      newErrors.paymentProof = "Payment proof is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill all required fields and upload payment proof.");
      return;
    }

    try {
      setLoading(true);
      await handlePlaceOrder(paymentProof);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (name) =>
    `border rounded py-1.5 px-3.5 w-full ${
      errors[name] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <form
      onSubmit={onSubmit}
      className={`flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] ${loading ? "pointer-events-none opacity-95" : ""}`}
    >
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <CheckoutSteps currentStep={2} />

        <div className="text-xl sm:text-2xl my-3 flex items-center justify-between flex-wrap gap-2">
          <Title text1="DELIVERY" text2="INFORMATION" />
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="text-sm text-gray-600 hover:text-black underline"
          >
            ← Back to cart
          </button>
        </div>

        <div className="flex gap-3">
          <div className="w-full">
            <input
              name="firstName"
              value={deliveryInfo.firstName}
              onChange={handleChange}
              className={inputClass("firstName")}
              placeholder="First Name"
              disabled={loading}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs">{errors.firstName}</p>
            )}
          </div>

          <div className="w-full">
            <input
              name="lastName"
              value={deliveryInfo.lastName}
              onChange={handleChange}
              className={inputClass("lastName")}
              placeholder="Last Name"
              disabled={loading}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs">{errors.lastName}</p>
            )}
          </div>
        </div>

        {["email", "street", "phone"].map((field) => (
          <div key={field}>
            <input
              name={field}
              type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
              value={deliveryInfo[field]}
              onChange={handleChange}
              className={inputClass(field)}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              disabled={loading}
            />
            {errors[field] && (
              <p className="text-red-500 text-xs">{errors[field]}</p>
            )}
          </div>
        ))}

        <div className="flex gap-3">
          {["city", "state"].map((field) => (
            <div className="w-full" key={field}>
              <input
                name={field}
                value={deliveryInfo[field]}
                onChange={handleChange}
                className={inputClass(field)}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                disabled={loading}
              />
              {errors[field] && (
                <p className="text-red-500 text-xs">{errors[field]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1="PAYMENT" text2="METHOD" />

          <div className="mb-6 text-sm text-gray-700 space-y-2">
            <p>
              <b>CBE:</b> 10001122334455
            </p>
            <p>
              <b>Awash:</b> 20002233445566
            </p>
            <p>
              <b>Abyssinia:</b> 30003344556677
            </p>
            <p>
              <b>Coop Bank:</b> 40004455667788
            </p>
          </div>

          <div className="w-full my-4">
            <label className="block mb-2 text-sm font-medium">
              Upload Proof of Payment
            </label>
            <input
              type="file"
              onChange={(e) => setPaymentProof(e.target.files[0])}
              className={`border p-2 w-full ${
                errors.paymentProof && "border-red-500"
              }`}
              disabled={loading}
            />
            {errors.paymentProof && (
              <p className="text-red-500 text-xs">{errors.paymentProof}</p>
            )}
          </div>

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-2 bg-black text-white px-16 py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none ${
                loading ? "opacity-80" : ""
              }`}
            >
              {loading && <LoaderSpinner className="w-4 h-4 border-white border-t-transparent" />}
              {loading ? "Placing Order..." : "PLACE ORDER"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default PlaceOrder;
