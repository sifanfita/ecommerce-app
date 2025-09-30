import React, { useContext } from 'react';
import Title from '../Title';
import CartTotal from '../CartTotal';
import { ShopContext } from '../../context/ShopContext';
import { useState } from 'react';

function PlaceOrder() {
  const { paymentProof, setPaymentProof, cartItems, products, getCartAmount, currency, handlePlaceOrder, deliveryInfo, setDeliveryInfo, navigate } = useContext(ShopContext);

  

  const handleChange = (e) => {
    setDeliveryInfo({
      ...deliveryInfo,
      [e.target.name]: e.target.value,
    });
  };


  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* Left Side - Shipping Details */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="DELIVERY" text2="INFORMATION" />
        </div>

        <div className="flex gap-3">
          <input name='firstName' value={deliveryInfo.firstName} onChange={handleChange} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="First Name" />
          <input name='lastName' value={deliveryInfo.lastName} onChange={handleChange} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="Last Name" />
        </div>

        <input name='email' value={deliveryInfo.email} onChange={handleChange} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="email" placeholder="Email Address" />
        <input name='street' value={deliveryInfo.street} onChange={handleChange} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="Street" />

        <div className="flex gap-3">
          <input name='city' value={deliveryInfo.city} onChange={handleChange} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="City" />
          <input name='state' value={deliveryInfo.state} onChange={handleChange} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="State" />
        </div>

        <div className="flex gap-3">
          <input name='phone' value={deliveryInfo.phone} onChange={handleChange} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="tel" placeholder="Phone Number" />
        </div>

        {/* Right side - Payment Details */}
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1="PAYMENT" text2="METHOD" />
          {/* Bank Accounts */}
          <div className="mb-6 text-sm text-gray-700 space-y-2">
            <p><b>Commercial Bank of Ethiopia (CBE):</b> 10001122334455</p>
            <p><b>Awash Bank:</b> 20002233445566</p>
            <p><b>Bank of Abyssinia:</b> 30003344556677</p>
            <p><b>Cooperative Bank of Oromia:</b> 40004455667788</p>
          </div>


          <div className="w-full my-4">
            <label className="block mb-2 text-sm font-medium">Upload Proof of Payment:</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setPaymentProof(e.target.files[0])}
              className="border p-2 w-full"
            />
            {paymentProof && (
              <p className="text-xs mt-2">Selected file: {paymentProof.name}</p>
            )}
          </div>
          {/* Place Order Button */}
          <div className="w-full text-end mt-8">
            <button
              onClick={handlePlaceOrder}
              className="bg-black text-white px-16 py-3 text-sm"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaceOrder;
