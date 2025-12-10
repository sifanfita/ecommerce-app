import React, { useState } from "react";

const ImageSlider = ({ images }) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const next = () => {
    setFade(false); // start fade out
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % images.length);
      setFade(true); // fade in new image
    }, 300); // match transition duration
  };

  const prev = () => {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + images.length) % images.length);
      setFade(true);
    }, 300);
  };

  return (
    <div className="relative w-full h-full">
      {/* Image */}
      <img
        src={images[index]}
        alt="slide"
        className={`w-full h-64 sm:h-80 md:h-96 object-cover transition-opacity duration-300 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Left arrow */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full"
      >
        ‹
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full"
      >
        ›
      </button>
    </div>
  );
};

export default ImageSlider;
