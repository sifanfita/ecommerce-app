// FRONTEND (Add.jsx)

import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const clothingSizes = ["S", "M", "L", "XL", "XXL"];
  const shoeSizes = ["40", "41", "42", "43", "44"];

  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("T-shirt");
  const [price, setPrice] = useState("");
  const [bestSeller, setBestSeller] = useState(false);

  const [colors, setColors] = useState([{ color: "", sizes: [] }]);

  const [submitting, setSubmitting] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      const cleanedColors = colors
        .filter((c) => c.color.trim() !== "")
        .map((c) => ({
          color: c.color.trim(),
          sizes: c.sizes
            .filter(
              (s) =>
                typeof s.stock === "number" &&
                !Number.isNaN(s.stock) &&
                s.stock >= 0
            )
            .map((s) => ({
              size: s.size,
              stock: Number(s.stock),
            })),
        }))
        .filter((c) => c.sizes.length > 0);

      if (cleanedColors.length === 0) {
        toast.error("Add at least one color with stock");
        return;
      }

      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("bestSeller", String(bestSeller));
      formData.append("colors", JSON.stringify(cleanedColors));

      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);

        setName("");
        setDescription("");
        setCategory("T-shirt");
        setPrice("");
        setBestSeller(false);

        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);

        setColors([{ color: "", sizes: [] }]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Failed to add product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3"
    >
      <div>
        <p className="mb-2">Upload Image</p>

        <div className="flex gap-2">
          {[image1, image2, image3, image4].map((img, idx) => (
            <label key={idx} htmlFor={`image${idx + 1}`}>
              <img
                className="w-20"
                src={
                  !img
                    ? assets.upload_area
                    : URL.createObjectURL(img)
                }
                alt=""
              />

              <input
                hidden
                type="file"
                id={`image${idx + 1}`}
                onChange={(e) => {
                  const file = e.target.files[0];

                  if (idx === 0) setImage1(file);
                  if (idx === 1) setImage2(file);
                  if (idx === 2) setImage3(file);
                  if (idx === 3) setImage4(file);
                }}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Product name</p>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2"
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Product description</p>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product category</p>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2"
          >
            <option value="T-shirt">T-shirt</option>
            <option value="Shirt">Shirt</option>
            <option value="Jacket">Jacket</option>
            <option value="Shoes">Shoes</option>
            <option value="Tuta">Tuta</option>
            <option value="Trouser">Trouser</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Product price</p>

          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="px-3 py-2 sm:w-[120px]"
          />
        </div>
      </div>

      <div>
        <p className="mb-2">Colors & Stock</p>

        {colors.map((c, idx) => (
          <div
            key={idx}
            className="border p-2 mb-2 rounded"
          >
            <input
              type="text"
              placeholder="Color name"
              value={c.color}
              onChange={(e) => {
                const newColors = [...colors];
                newColors[idx].color = e.target.value;
                setColors(newColors);
              }}
              className="px-2 py-1 mb-2"
            />

            <div className="flex flex-wrap gap-2">
              {(category === "Shoes"
                ? shoeSizes
                : clothingSizes
              ).map((size) => {
                const stockObj = c.sizes.find(
                  (s) => s.size === size
                );

                return (
                  <div
                    key={size}
                    className="flex items-center gap-1"
                  >
                    <span>{size}</span>

                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={stockObj?.stock ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;

                        const value =
                          raw === ""
                            ? ""
                            : Number(raw);

                        const newColors = [...colors];

                        const sizeIndex =
                          newColors[
                            idx
                          ].sizes.findIndex(
                            (s) =>
                              s.size === size
                          );

                        if (raw === "") {
                          if (sizeIndex > -1) {
                            newColors[
                              idx
                            ].sizes.splice(
                              sizeIndex,
                              1
                            );
                          }
                        } else {
                          if (sizeIndex > -1) {
                            newColors[
                              idx
                            ].sizes[
                              sizeIndex
                            ].stock = value;
                          } else {
                            newColors[
                              idx
                            ].sizes.push({
                              size,
                              stock: value,
                            });
                          }
                        }

                        setColors(newColors);
                      }}
                      className="w-16 px-1 py-0.5 border rounded"
                    />
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="mt-2 text-red-500"
              onClick={() =>
                setColors(
                  colors.filter(
                    (_, i) => i !== idx
                  )
                )
              }
            >
              Remove Color
            </button>
          </div>
        ))}

        <button
          type="button"
          className="mt-2 bg-gray-200 px-3 py-1 rounded"
          onClick={() =>
            setColors([
              ...colors,
              { color: "", sizes: [] },
            ])
          }
        >
          Add Color
        </button>
      </div>

      <div className="flex gap-2 mt-2">
        <input
          id="bestseller"
          type="checkbox"
          checked={bestSeller}
          onChange={() =>
            setBestSeller((prev) => !prev)
          }
        />

        <label htmlFor="bestseller">
          Add to bestseller
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-28 py-3 mt-4 bg-black text-white"
      >
        {submitting ? "ADDING..." : "ADD"}
      </button>
    </form>
  );
};

export default Add;