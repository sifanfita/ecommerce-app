import React from 'react';

/**
 * Consistent loading spinner used across Cart, Product, Collection, Orders.
 */
export function LoaderSpinner({ className = '' }) {
  return (
    <div
      className={`inline-block w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Full-page or block loading state with optional message.
 */
export function Loader({ message = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-20 text-gray-500 ${className}`}>
      <LoaderSpinner />
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}

export default Loader;
