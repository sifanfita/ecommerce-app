import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MaterialReactTable } from "material-react-table";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import CreateShopkeeperModal from "./CreateShopkeeperModal";

const AdminShopkeepers = ({ token }) => {
  const [shopkeepers, setShopkeepers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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
    if (deletingId) return;
    setDeletingId(id);
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
    } finally {
      setDeletingId(null);
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
        renderRowActions={({ row }) => {
          const id = row.original._id;
          const isDeleting = deletingId === id;
          return (
            <button
              className="text-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center gap-2"
              onClick={() => deleteShopkeeper(id)}
              disabled={isDeleting}
            >
              {isDeleting && <span className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" aria-hidden />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          );
        }}
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
