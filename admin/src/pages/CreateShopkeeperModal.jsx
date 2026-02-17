import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const CreateShopkeeperModal = ({ token, onClose = () => console.log("onClose called"), refresh }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
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
          className="border border-gray-300 p-3 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          className="border border-gray-300 p-3 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Email Address"
          name="email"
          type="email"
          autoComplete="new-email"
          value={form.email}
          onChange={handleChange}
        />

        

        <input
          className="border border-gray-300 p-3 w-full mb-6 rounded focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              console.log("Cancel button clicked"); // ← Debug log
              onClose(); // This MUST be called
            }}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateShopkeeperModal;