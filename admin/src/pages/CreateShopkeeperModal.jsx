import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const CreateShopkeeperModal = ({ token, onClose = () => {}, refresh }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/user/admin/shopkeeper/create`,
        form,
        { headers: {
      Authorization: `Bearer ${token}`,
    } }
      );

      if (res.data.success) {
        toast.success("Shopkeeper created successfully");
        refresh();
        onClose();
      } else {
        toast.error(res.data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create shopkeeper");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose} // Close when clicking outside
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
      >
        <h2 className="font-semibold text-xl mb-6">Create New Shopkeeper</h2>

        <input
          className="border border-gray-300 p-3 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-70"
          placeholder="Full Name"
          disabled={loading}
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          className="border border-gray-300 p-3 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-70"
          placeholder="Email Address"
          disabled={loading}
          name="email"
          type="email"
          autoComplete="new-email"
          value={form.email}
          onChange={handleChange}
        />

        

        <input
          className="border border-gray-300 p-3 w-full mb-6 rounded focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-70"
          placeholder="Password"
          disabled={loading}
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden />}
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateShopkeeperModal;