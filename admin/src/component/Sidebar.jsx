
import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ${
      isActive ? "bg-gray-100 border-gray-500" : ""
    }`;

  return (
    <div className="w-[18%] min-h-screen border-r-2">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        <NavLink className={linkClass} to="/add">
          <img className="w-5 h-5" src={assets.add_icon} alt="" />
          <p className="hidden md:block">Add Items</p>
        </NavLink>

        <NavLink className={linkClass} to="/list">
          <img className="w-5 h-5" src={assets.order_icon} alt="" />
          <p className="hidden md:block">List Items</p>
        </NavLink>

        <NavLink className={linkClass} to="/brands">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2 3 7l9 5 9-5-9-5Z" />
            <path d="m3 12 9 5 9-5" />
            <path d="m3 17 9 5 9-5" />
          </svg>
          <p className="hidden md:block">Brands</p>
        </NavLink>

        <NavLink className={linkClass} to="/orders">
          <img className="w-5 h-5" src={assets.order_icon} alt="" />
          <p className="hidden md:block">Orders</p>
        </NavLink>

        <NavLink className={linkClass} to="/pos">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H5" />
          </svg>
          <p className="hidden md:block">POS</p>
        </NavLink>

        <NavLink className={linkClass} to="/sales-history">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-5 5" />
          </svg>
          <p className="hidden md:block">Sales History</p>
        </NavLink>

        <NavLink className={linkClass} to="/customers">
          <img className="w-5 h-5" src={assets.customers_icon} alt="" />
          <p className="hidden md:block">Customers</p>
        </NavLink>

        <NavLink className={linkClass} to="/admin/shopkeepers">
          <img className="w-5 h-5" src={assets.shopkeeper_icon} alt="" />
          <p className="hidden md:block">Shopkeepers</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
