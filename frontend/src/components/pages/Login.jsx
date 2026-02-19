import React, { useEffect, useState, useContext } from "react";
import { ShopContext } from "../../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { LoaderSpinner } from "../Loader";
import { validateEmail, validatePhone, validatePassword, validateName } from "../../utils/validation";

function Login() {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (currentState === "Sign Up") {
      const nameErr = validateName(name, true);
      if (nameErr) newErrors.name = nameErr;
    }

    const hasEmail = email.trim().length > 0;
    const hasPhone = phone.trim().length > 0;
    if (!hasEmail && !hasPhone) {
      newErrors.contact = "Email or phone is required.";
    } else {
      const emailErr = hasEmail ? validateEmail(email) : null;
      const phoneErr = hasPhone ? validatePhone(phone) : null;
      if (emailErr) newErrors.contact = emailErr;
      else if (phoneErr) newErrors.contact = phoneErr;
    }

    const passwordErr = validatePassword(password, {
      minLength: 6,
      required: true,
    });
    if (passwordErr) newErrors.password = passwordErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const payload = { password };
      if (currentState === "Sign Up") payload.name = name.trim();
      if (email.trim()) payload.email = email.trim();
      if (phone.trim()) payload.phone = phone.trim();

      const url =
        currentState === "Sign Up"
          ? backendUrl + "/api/user/register"
          : backendUrl + "/api/user/login";

      const response = await axios.post(url, payload);

      if (response.data.success) {
        setToken(response.data.token);
        sessionStorage.setItem("token", response.data.token);
        toast.success(
          currentState === "Sign Up"
            ? "Sign up successful! Welcome 🎉"
            : "Login successful! Welcome back 🙂"
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Login error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  const inputStyle = (field) =>
    `w-full px-3 py-2 border ${
      errors[field] ? "border-red-500" : "border-gray-800"
    }`;

  return (
    <form
      onSubmit={onSubmitHandler}
      className={`flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-3 text-gray-800 ${loading ? "pointer-events-none opacity-90" : ""}`}
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === "Sign Up" && (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputStyle("name")}
            placeholder="Name"
            disabled={loading}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </>
      )}

      <input
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputStyle("contact")}
        placeholder="Email (optional)"
        disabled={loading}
      />

      <input
        type="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={inputStyle("contact")}
        placeholder="Phone (optional)"
        disabled={loading}
      />

      {errors.contact && (
        <p className="text-red-500 text-xs">{errors.contact}</p>
      )}

      <input
        type="password"
        autoComplete={currentState === "Sign Up" ? "new-password" : "current-password"}
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputStyle("password")}
        placeholder="Password"
        disabled={loading}
      />
      {errors.password && (
        <p className="text-red-500 text-xs">{errors.password}</p>
      )}

      <div className="w-full flex justify-between text-sm mt-2">
        {currentState === "Login" ? (
          <p onClick={() => !loading && setCurrentState("Sign Up")} className="cursor-pointer">
            Create account
          </p>
        ) : (
          <p onClick={() => !loading && setCurrentState("Login")} className="cursor-pointer">
            Login here
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`flex items-center justify-center gap-2 bg-black text-white px-8 py-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none transition-opacity ${
          loading ? "opacity-80" : ""
        }`}
      >
        {loading && <LoaderSpinner className="w-4 h-4 border-white border-t-transparent" />}
        {loading ? "Processing..." : currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
}

export default Login;
