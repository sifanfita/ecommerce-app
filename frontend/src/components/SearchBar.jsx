import React, { useContext, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(ShopContext);
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Show search on all pages when opened; from other pages, go to collection to see results
  useEffect(() => {
    if (showSearch && !location.pathname.includes("collection")) {
      navigate("/collection");
    }
  }, [showSearch]);

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  return showSearch ? (
    <div className="border-t border-b bg-gray-50 text-center">
      <div className="inline-flex items-center justify-center border border-gray-500 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2">
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none bg-inherit text-sm min-w-0"
          type="text"
          placeholder="Search products..."
          aria-label="Search products"
        />
        <img className="w-4 shrink-0" src={assets.searchIcon} alt="" />
      </div>
      <button
        type="button"
        onClick={() => setShowSearch(false)}
        className="inline p-1 cursor-pointer hover:opacity-70"
        aria-label="Close search"
      >
        <img className="w-3" src={assets.crossIcon} alt="" />
      </button>
    </div>
  ) : null;
};

export default SearchBar;
