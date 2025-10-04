import React from "react";
import products from "../images/products.png";
import orders from "../images/orders.png";
import sales from "../images/sales.png";
import stocks from "../images/stocks.png";
import centerImage from "../images/center.png";
import { useNavigate } from "react-router";

const Content: React.FC = () => {
  const navigate = useNavigate();
  const offers = [
    {
      title: "Product Adjustments",
      description:
        "When selling a product, you need to make a few adjustments, our website can help you with that. From namings, pricing, and stock, we got it all.",
      icon: products,
    },
    {
      title: "Order Details",
      description:
        "With our order details feature, you can easily track and manage your orders. From supplier names to the products you have purchased.",
      icon: orders,
    },
    {
      title: "Sales Recap",
      description:
        "When it comes to sales, you need to have a recap of what you have sold. This feature gives you the details of what product sells the most per month.",
      icon: sales,
    },
    {
      title: "Stock Counter",
      description:
        "The stock counter feature helps you in organizing your stock. You can easily see what products are running low and need to be restocked.",
      icon: stocks,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8ecae6] via-white to-[#ffedbe] py-32">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-gray-800 mb-6">
          Why Choose Us?
        </h1>
        <p className="sm:text-2xl text-2xl text-gray-600 mb-4">
          <i>Track, Manage, and Grow Every Part of Your Business</i>
        </p>
      </div>

      {/* Bento Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="flex flex-col gap-10">
          {offers.slice(0, 2).map((offer, index) => (
            <div
              key={index}
              className="
                bg-white rounded-2xl shadow p-6 flex flex-col gap-4
                transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl hover:scale-[1.02] cursor-pointer
              "
            >
              <div className="flex items-center gap-3">
                <img
                  src={offer.icon}
                  alt={offer.title}
                  className="w-6 h-6 object-contain"
                />
                <h2 className="text-lg font-semibold text-[#FC8500]">
                  {offer.title}
                </h2>
              </div>
              <p className="text-gray-600 text-sm">{offer.description}</p>
            </div>
          ))}
        </div>

        {/* Center Image */}
        <div className="flex items-center justify-center">
          <img
            src={centerImage}
            alt="center"
            className="rounded-2xl w-full h-full object-contain transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-10">
          {offers.slice(2).map((offer, index) => (
            <div
              key={index}
              className="
                bg-white rounded-2xl shadow p-6 flex flex-col gap-3
                transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl hover:scale-[1.02] cursor-pointer
              "
            >
              <div className="flex items-center gap-3">
                <img
                  src={offer.icon}
                  alt={offer.title}
                  className="w-6 h-6 object-contain"
                />
                <h2 className="text-lg font-semibold text-[#FC8500]">
                  {offer.title}
                </h2>
              </div>
              <p className="text-gray-600 text-sm">{offer.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center mt-12">
        <button
          className="
            relative 
            px-10 py-4 
            rounded-full 
            text-white
            font-bold 
            bg-gradient-to-r from-[#ffb700] to-[#fc8600b2]
            shadow-lg 
            transition-all duration-300 
            hover:scale-110 
            hover:shadow-2xl
            cursor-pointer
          "
          onClick={() => {
            navigate("/register");
          }}
        >
          Start Your Journey
        </button>
      </div>
    </div>
  );
};

export default Content;
