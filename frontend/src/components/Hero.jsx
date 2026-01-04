import React from "react";
import { assets } from "../assets/assets.js";
import ImageSlider from "./ImageSlider";

const Hero = () => {
  const sliderImages = [
    assets.heroImage,
    assets.heroImage2,
    assets.heroImage3,
  ];

  return (
    <div className="flex flex-col sm:flex-row border border-gray-400 h-auto sm:h-[250px] md:h-[300px]">
      {/* Left Section */}
      <div className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0">
        <div className="text-[#414141] text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <p className="w-8 md:w-11 h-0.5 bg-[#414141]"></p>
            <p className="font-medium text-sm md:text-base">OUR BEST SELLERS</p>
          </div>

          <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed">
            Latest Arrivals
          </h1>

          <div className="flex items-center gap-2 justify-center sm:justify-start mt-2">
            <p className="font-semibold text-sm md:text-base">SHOP NOW</p>
            <p className="w-8 md:w-11 h-0.5 bg-[#414141]"></p>
          </div>
        </div>
      </div>

      {/* Right Section (Slider) */}
      <div className="w-full sm:w-1/2 h-[400px] sm:h-full md:h-full">
        <ImageSlider images={sliderImages} />
      </div>
    </div>
  );
};

export default Hero;
