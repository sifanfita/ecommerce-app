import React, { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.post(backendUrl + '/api/user/admin/login', {
        email,
        password,
      }
    ); // important for cookies

      if (response.data.success) {
        setToken(response.data.token);
        toast.success('Login successful!');
        // Optional: redirect to dashboard
        // navigate('/admin/dashboard');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl px-8 py-10 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>

        {/* Hidden fields to trick browser autofill */}
        <input type="text" name="fake-email" style={{ display: 'none' }} autoComplete="off" />
        <input type="password" name="fake-password" style={{ display: 'none' }} autoComplete="off" />

        <form onSubmit={onSubmitHandler} className={`flex flex-col gap-5 ${loading ? 'pointer-events-none opacity-90' : ''}`}>
          <div className="min-w-72">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"                        // important for autofill prevention
              autoComplete="new-email"            // best for new/unique email
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
            />
          </div>

          <div className="min-w-72">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              autoComplete="new-password"         // key for password fields
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 px-4 rounded-lg text-white bg-black hover:bg-gray-800 transition duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden />}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;