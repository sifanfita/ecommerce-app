import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MaterialReactTable } from "material-react-table";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import CreateShopkeeperModal from "./CreateShopkeeperModal";

const AdminShopkeepers = ({ token }) => {
  const [shopkeepers, setShopkeepers] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const fetchShopkeepers = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/user/admin/shopkeepers`,
        { headers: {
      Authorization: `Bearer ${token}`,
    } }
      );
      
      if (res.data.success) {
        setShopkeepers(res.data.shopkeepers);
      }
    } catch {
      toast.error("Failed to load shopkeepers");
    }
  };

  useEffect(() => {
    fetchShopkeepers();
  }, []);

  const deleteShopkeeper = async (id) => {
    if (!window.confirm("Delete this shopkeeper?")) return;

    try {
      const res = await axios.delete(
        `${backendUrl}/api/user/admin/shopkeeper/${id}`,
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Shopkeeper deleted");
        fetchShopkeepers();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "createdAt",
        header: "Created",
        Cell: ({ cell }) =>
          new Date(cell.getValue()).toLocaleDateString(),
      },
    ],
    []
  );

  return (
    <div className="p-4">
      <div className="flex justify-between mb-3">
        <h2 className="text-lg font-semibold">Shopkeepers</h2>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-black text-white px-4 py-1 rounded"
        >
          + Create
        </button>
      </div>

      <MaterialReactTable
        columns={columns}
        data={shopkeepers}
        enableSorting
        enablePagination
        enableColumnFilters
        enableRowActions
        renderRowActions={({ row }) => (
          <button
            className="text-red-600"
            onClick={() => deleteShopkeeper(row.original._id)}
          >
            Delete
          </button>
        )}
        initialState={{ pagination: { pageSize: 10 } }}
      />

      {openModal && (
        <CreateShopkeeperModal
          token={token}
          onClose={() => setOpenModal(false)}
          refresh={fetchShopkeepers}
        />
      )}
    </div>
  );
};

export default AdminShopkeepers;
