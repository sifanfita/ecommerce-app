import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MaterialReactTable } from "material-react-table";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: {
                  Authorization: `Bearer ${token}`,
                } }
      );

      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load orders");
    }
  };

  // Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: newStatus },
        { headers: {
                  Authorization: `Bearer ${token}`,
                } }
      );

      if (response.data.success) {
        toast.success("Order status updated");
        fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatAddress = (address) => {
  if (!address) return "";
  return `Phone: ${address.phone || ""}, Street: ${address.street || ""}, City: ${address.city || ""}, State: ${address.state || ""}`;
};


  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "Order ID",
        size: 180,
        Cell: ({ cell }) => <p className="break-all">{cell.getValue()}</p>,
      },
     
      { accessorKey: "amount", header: "Total (Birr)" },
      {
        accessorKey: "status",
        header: "Status",
        Filter: ({ column }) => (
          <select
            value={column.getFilterValue() || ""}
            onChange={(e) =>
              column.setFilterValue(e.target.value || undefined)
            }
          >
            <option value="">All</option>
            <option value="Order placed">Order placed</option>
            <option value="Processing">Processing</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        ),
        Cell: ({ cell }) => {
          const order = cell.row.original;
          return (
            <select
              className="border px-2 py-1"
              value={order.status}
              onChange={(e) => updateStatus(order._id, e.target.value)}
            >
              <option value="Order placed">Order placed</option>
              <option value="Processing">Processing</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          );
        },
      },
      {
        accessorKey: "date",
        header: "Date",
        Cell: ({ cell }) =>
          new Date(cell.getValue()).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
      },
    ],
    []
  );

  // Filter orders by search text and date
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const date = new Date(order.date);
      if (filterStartDate && date < filterStartDate) return false;
      if (filterEndDate && date > filterEndDate) return false;

      if (searchText) {
        const text = searchText.toLowerCase();
        return (
          order.userEmail?.toLowerCase().includes(text) ||
          order._id?.toLowerCase().includes(text)
        );
      }
      return true;
    });
  }, [orders, filterStartDate, filterEndDate, searchText]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">All Orders</h2>

      

      <MaterialReactTable
        columns={columns}
        data={filteredOrders}
        localization={MRT_Localization_EN}
        enableColumnActions
        enableSorting
        enablePagination
        enableColumnFilters
        enableStickyHeader
        enableRowVirtualization
        enableExpanding
        renderDetailPanel={({ row }) => {
          const order = row.original;
          return (
            <div className="p-4 border-t border-gray-200 flex flex-col gap-4">
              {/* Customer Info */}
              <div>
                <h4 className="font-medium">Customer Info</h4>
                
                <p>Phone: {order.address?.phone}</p>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-medium">Products</h4>
                {order.items?.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 my-1">
                    <img
                      src={p.image[0]}
                      alt={p.name}
                      className="w-12 h-12 object-cover border"
                    />
                    <div>
                      <p>
                        {p.name} — {p.color} × {p.quantity}
                      </p>
                      <p className="text-sm text-gray-500">Price: {p.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Proof */}
              <div>
                <h4 className="font-medium">Payment Proof</h4>
                {order.paymentProof ? (
                  <button
                    onClick={() => window.open(order.paymentProof, "_blank")}
                    className="text-blue-600 underline"
                  >
                    View Payment Proof
                  </button>
                ) : (
                  <p>No payment proof</p>
                )}
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-medium">Shipping Address</h4>
                <p>{formatAddress(order.address)}</p>
              </div>
            </div>
          );
        }}
        initialState={{
          density: "compact",
          pagination: { pageSize: 10 },
        }}
      />
    </div>
  );
};

export default Orders;
