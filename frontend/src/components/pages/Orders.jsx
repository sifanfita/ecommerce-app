import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import Title from '../Title';
import Loader from '../Loader';
import axios from 'axios';
import { toast } from 'react-toastify';

function Orders() {
  const { backendUrl, token, currency, products } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);   // 👈 NEW

  const loadOrderData = async () => {
    try {
      if (!token) return;

      setLoading(true);   // 👈 start loading

      const response = await axios.post(
        backendUrl + '/api/order/userorders',
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        let allOrdersItem = [];

        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            const productInfo = products.find((p) => p._id === item.itemId);

            allOrdersItem.push({
              ...item,
              status: order.status,
              paymentProof: order.paymentProof,
              date: order.date,
              name: productInfo?.name || "Unknown Product",
              image: productInfo?.image || [],
              price: productInfo?.price || 0,
            });
          });
        });

        setOrderData(allOrdersItem);
      } else {
        toast.error(response.data.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Error loading order data:", error);
      toast.error("Error loading orders");
    } finally {
      setLoading(false);   // 👈 stop loading always
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token, products]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1="MY" text2="ORDERS" />
      </div>

      <div>
        {loading ? (
          <Loader message="Loading orders..." className="py-6" />
        ) : orderData.length > 0 ? (
          orderData.map((item, index) => (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-start gap-6 text-sm">
                <img
                  className="w-16 sm:w-20"
                  src={item.image || '/placeholder.png'}
                  alt={item.name}
                />
                <div>
                  <p className="text-base font-medium">{item.name}</p>
                  <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
                    <p className="text-lg">
                      {item.price} {currency}
                    </p>
                    <p>Quantity: {item.quantity || 1}</p>
                    <p>Size: {item.size || '-'}</p>
                  </div>
                  <p className="mt-2">
                    Date:{' '}
                    <span className="text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </div>

              <div className="md:w-1/2 flex justify-between">
                <div className="flex items-center gap-2">
                  <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                  <p className="text-sm md:text-base">
                    {item.status || "Processing"}
                  </p>
                </div>

                <button
                  onClick={loadOrderData}
                  disabled={loading}
                  className={`border px-4 py-2 text-sm font-medium rounded-sm ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Refresh
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
          <p>No orders yet.</p>
          <Link to="/collection" className="inline-block mt-3 text-sm underline hover:text-black">Start shopping</Link>
        </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
