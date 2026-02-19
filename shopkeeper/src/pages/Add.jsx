import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const clothingSizes = ["S", "M", "L", "XL", "XXL"];
  const shoeSizes = ["40", "41", "42", "43", "44"];

  // Images
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  // Product info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("T-shirt");
  const [price, setPrice] = useState("");
  const [bestSeller, setBestSeller] = useState(false);

  // Colors & Sizes per color
  const [colors, setColors] = useState([{ color: "", sizes: [] }]);
  const [loading, setLoading] = useState(false);

  // Submit handler
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("bestSeller", bestSeller);
      formData.append("colors", JSON.stringify(colors));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: {
          Authorization: `Bearer ${token}`,
        }}
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setCategory("T-shirt");
        setPrice("");
        setBestSeller(false);
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setColors([{ color: "", sizes: [] }]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className={`flex flex-col w-full items-start gap-3 ${loading ? 'pointer-events-none opacity-95' : ''}`}
    >
      {/* Images */}
      <div>
        <p className="mb-2">Upload Image</p>
        <div className="flex gap-2">
          {[image1, image2, image3, image4].map((img, idx) => (
            <label key={idx} htmlFor={`image${idx + 1}`}>
              <img
                className="w-20"
                src={!img ? assets.upload_area : URL.createObjectURL(img)}
                alt=""
              />
              <input
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (idx === 0) setImage1(file);
                  if (idx === 1) setImage2(file);
                  if (idx === 2) setImage3(file);
                  if (idx === 3) setImage4(file);
                }}
                type="file"
                id={`image${idx + 1}`}
                hidden
              />
            </label>
          ))}
        </div>
      </div>

      {/* Product name & description */}
      <div className="w-full">
        <p className="mb-2">Product name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Type here"
          required
        />
      </div>
      <div className="w-full">
        <p className="mb-2">Product description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full max-w-[500px] px-3 py-2"
          placeholder="Write content here"
          required
        />
      </div>

      {/* Category & price */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product category</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="w-full px-3 py-2"
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
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="Number"
            placeholder="25"
          />
        </div>
      </div>

      {/* Colors & sizes per color */}
      <div>
        <p className="mb-2">Colors & Stock</p>
        {colors.map((c, idx) => (
          <div key={idx} className="border p-2 mb-2 rounded">
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
              {(category === "Shoes" ? shoeSizes : clothingSizes).map(
                (size) => {
                  const stockObj = c.sizes.find((s) => s.size === size);
                  return (
                    <div key={size} className="flex items-center gap-1">
                      <span>{size}</span>
                      <input
                        type="number"
                        placeholder="Stock"
                        value={stockObj?.stock || ""}
                        onChange={(e) => {
                          const newColors = [...colors];
                          const index = newColors[idx].sizes.findIndex(
                            (s) => s.size === size
                          );
                          if (index > -1) {
                            newColors[idx].sizes[index].stock = Number(
                              e.target.value
                            );
                          } else {
                            newColors[idx].sizes.push({
                              size,
                              stock: Number(e.target.value),
                            });
                          }
                          setColors(newColors);
                        }}
                        className="w-16 px-1 py-0.5 border rounded"
                      />
                    </div>
                  );
                }
              )}
            </div>
            <button
              type="button"
              onClick={() =>
                setColors(colors.filter((_, i) => i !== idx))
              }
              className="mt-2 text-red-500"
            >
              Remove Color
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setColors([...colors, { color: "", sizes: [] }])}
          className="mt-2 bg-gray-200 px-3 py-1 rounded"
        >
          Add Color
        </button>
      </div>

      {/* Bestseller */}
      <div className="flex gap-2 mt-2">
        <input
          onChange={() => setBestSeller((prev) => !prev)}
          checked={bestSeller}
          type="checkbox"
          id="bestseller"
        />
        <label className="cursor-pointer" htmlFor="bestseller">
          Add to bestseller
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-28 py-3 mt-4 bg-black text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
      >
        {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden />}
        {loading ? 'Adding...' : 'ADD'}
      </button>
    </form>
  );
};

export default Add;
