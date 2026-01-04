import React, { useState, useEffect } from "react";

const ImageSlider = ({ images, interval = 3000 }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const slider = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(slider);
  }, [images.length, interval]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`slide-${index}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        />
      ))}

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              idx === current ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => setCurrent(idx)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
