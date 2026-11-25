
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Brands = ({ token }) => {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingBrand, setEditingBrand] = useState(null);
  const [name, setName] = useState("");
  const [brandCode, setBrandCode] = useState("");

  const resetForm = () => {
    setEditingBrand(null);
    setName("");
    setBrandCode("");
  };

  const fetchBrands = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${backendUrl}/api/brand/list?includeInactive=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setBrands(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to load brands");
      }
    } catch (error) {
      console.error("FETCH BRANDS ERROR:", error);
      toast.error(
        error.response?.data?.message || "Failed to load brands"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    const cleanedName = name.trim();
    const cleanedCode = brandCode.trim().toUpperCase();

    if (!cleanedName || !cleanedCode) {
      toast.error("Enter both brand name and brand code");
      return;
    }

    if (cleanedCode.length > 10 || !/^[A-Z0-9]+$/.test(cleanedCode)) {
      toast.error("Brand code must contain 1-10 letters or numbers");
      return;
    }

    try {
      setSaving(true);

      let response;

      if (editingBrand) {
        response = await axios.put(
          `${backendUrl}/api/brand/update/${editingBrand.id}`,
          {
            name: cleanedName,
            brandCode: cleanedCode,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `${backendUrl}/api/brand/add`,
          {
            name: cleanedName,
            brandCode: cleanedCode,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
        await fetchBrands();
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("SAVE BRAND ERROR:", error);
      toast.error(
        error.response?.data?.message || "Failed to save brand"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setBrandCode(brand.brand_code);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusChange = async (brand) => {
    const action = brand.is_active ? "deactivate" : "reactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${brand.name}?`
    );

    if (!confirmed) return;

    try {
      const response = await axios.put(
        `${backendUrl}/api/brand/${action}/${brand.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchBrands();

        if (editingBrand?.id === brand.id) {
          resetForm();
        }
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("CHANGE BRAND STATUS ERROR:", error);
      toast.error(
        error.response?.data?.message || "Failed to update brand status"
      );
    }
  };

  const filteredBrands = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return brands;

    return brands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(searchValue) ||
        brand.brand_code.toLowerCase().includes(searchValue)
    );
  }, [brands, search]);

  const activeCount = brands.filter((brand) => brand.is_active).length;
  const inactiveCount = brands.length - activeCount;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Brand Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the brands available in your store.
          </p>
        </div>

        <button
          type="button"
          onClick={resetForm}
          className="border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-100"
        >
          + New Brand
        </button>
      </div>

      {/* BRAND SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Brands</p>
          <p className="text-2xl font-semibold text-gray-800 mt-1">
            {brands.length}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Active Brands</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">
            {activeCount}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Inactive Brands</p>
          <p className="text-2xl font-semibold text-gray-500 mt-1">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      <div className="bg-white border rounded-lg p-5 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          {editingBrand ? "Edit Brand" : "Add New Brand"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Brand Name
              </label>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="e.g. New Balance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Brand Code
              </label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="e.g. NB"
                value={brandCode}
                onChange={(e) =>
                  setBrandCode(e.target.value.toUpperCase())
                }
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-gray-600"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use a short, unique code. Maximum 10 letters or numbers.
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button
              type="submit"
              disabled={saving}
              className="bg-black text-white rounded px-5 py-2 text-sm disabled:opacity-50"
            >
              {saving
                ? "SAVING..."
                : editingBrand
                ? "UPDATE BRAND"
                : "ADD BRAND"}
            </button>

            {editingBrand && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="border border-gray-300 rounded px-5 py-2 text-sm hover:bg-gray-100"
              >
                CANCEL
              </button>
            )}
          </div>
        </form>
      </div>

      {/* BRAND LIST */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-medium text-gray-800">All Brands</h2>
            <p className="text-xs text-gray-500 mt-1">
              {filteredBrands.length} brand(s) found
            </p>
          </div>

          <input
            type="text"
            placeholder="Search brand or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-64 outline-none focus:border-gray-600"
          />
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading brands...
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-700 font-medium">No brands found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try another search or add a new brand.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Brand Name</th>
                  <th className="px-4 py-3 font-medium">Brand Code</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredBrands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {brand.name}
                    </td>

                    <td className="px-4 py-3">
                      <span className="bg-gray-100 border rounded px-2 py-1 font-mono text-xs">
                        {brand.brand_code}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs ${
                          brand.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {brand.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(brand)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(brand)}
                          className={`hover:underline ${
                            brand.is_active
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {brand.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Brands;
