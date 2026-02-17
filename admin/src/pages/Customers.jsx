import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MaterialReactTable } from "material-react-table";
import { MRT_Localization_EN } from "material-react-table/locales/en";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const Customers = ({ token }) => {
  const [customers, setCustomers] = useState([]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(backendUrl + "/api/customers", {
        headers: {
      Authorization: `Bearer ${token}`,
    },
      });
      console.log(res.data.customers);

      if (res.data.success) {
        setCustomers(res.data.customers);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch customers");
    }
  };


  useEffect(() => {
    fetchCustomers();
  }, []);

  const columns = useMemo(
    () => [
       
      
      { accessorKey: "email", header: "Email" },
      {
      header: "Phone",
      accessorFn: (row) => row.phone || row.addresses?.[0]?.phone || "N/A",
    },
      { accessorKey: "ordersCount", header: "Orders" },
      {
        accessorKey: "totalSpent",
        header: "Total Spent (Birr)",
        Cell: ({ cell }) => <span>{cell.getValue() ?? 0} Br</span>,
      },
      {
        accessorKey: "joinedAt",
        header: "Joined",
        Cell: ({ cell }) =>
          cell.getValue()
            ? new Date(cell.getValue()).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "",
      },
    ],
    []
  );

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">Customers</h2>

      <MaterialReactTable
        columns={columns}
        data={customers}
        localization={MRT_Localization_EN}
        enableTopToolbar
        enableColumnFilters
        enableSorting
        enablePagination
        enableExpanding
        enableStickyHeader
        initialState={{ pagination: { pageSize: 10 } }}
        renderDetailPanel={({ row }) => {
          const c = row.original;
          return (
            <div className="p-4 flex flex-col gap-3">
              {/* Addresses */}
              {c.addresses?.length > 0 && (
                <div>
                  <h4 className="font-semibold">Addresses</h4>
                  {c.addresses.map((addr, i) => (
                    <p key={i} className="text-sm">
                      {addr.street}, {addr.city}, {addr.state} — {addr.phone}
                    </p>
                  ))}
                </div>
              )}

              {/* Orders */}
              <div>
                <h4 className="font-semibold">Recent Orders</h4>
                {c.orders?.length > 0 ? (
                  c.orders.map((o, i) => (
                    <p key={i} className="text-sm">
                      {o._id} — {o.amount} Birr — {o.status}
                    </p>
                  ))
                ) : (
                  <p>No Orders</p>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default Customers;
