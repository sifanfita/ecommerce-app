import React, { useEffect, useState, useContext } from "react";
import { ShopContext } from "../../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

function Login() {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } =
    useContext(ShopContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (currentState === "Sign Up") {
        // ✅ Build payload WITHOUT empty fields
        const payload = {
          name,
          password,
        };

        if (email.trim()) payload.email = email.trim();
        if (phone.trim()) payload.phone = phone.trim();

        if (!payload.email && !payload.phone) {
          toast.error("Email or phone is required");
          return;
        }

        const response = await axios.post(
          backendUrl + "/api/user/register",
          payload
        );

        if (response.data.success) {
          setToken(response.data.token);
          sessionStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      } else {
        // LOGIN
        const payload = { password };

        if (email.trim()) payload.email = email.trim();
        if (phone.trim()) payload.phone = phone.trim();

        if (!payload.email && !payload.phone) {
          toast.error("Email or phone is required");
          return;
        }

        const response = await axios.post(
          backendUrl + "/api/user/login",
          payload
        );

        if (response.data.success) {
          setToken(response.data.token);
          sessionStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === "Sign Up" && (
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Name"
          required
        />
      )}

      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email (optional)"
      />

      <input
        onChange={(e) => setPhone(e.target.value)}
        value={phone}
        type="text"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Phone (optional)"
      />

      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Password"
        required
      />

      <div className="w-full flex justify-between text-sm mt-[8px]">
       
        {currentState === "Login" ? (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer"
          >
            Create account
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer"
          >
            Login here
          </p>
        )}
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
}

export default Login;
