import React, { useEffect, useState } from "react";
import { Link } from "@/router";
import test from "../images/test.png";
import { useNavigate } from "react-router";

const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 1000);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#8ecae6] pt-5">
      {/* Fixed Header */}
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-white rounded-full shadow-md max-w-3xl w-full z-50 transition-colors duration-500">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span
              className={`transition-colors ${scrolled ? "text-[#FFB701]" : "text-[#209ebb]"
                }`}
            >
              BE
            </span>
            <span className="font-bold text-gray-800">NG</span>
          </h1>
          <nav className="space-x-6">
            <Link
              to="/login"
              className={`text-black font-bold ${scrolled ? "hover:text-[#FFB701]" : "hover:text-[#209ebb]"
                }`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className={`inline-block px-3 py-1 rounded-full text-white font-bold transition-colors duration-500 ${scrolled
                ? "bg-[#FFB701] hover:bg-[#FC8500]"
                : "bg-[#209ebb] hover:bg-[#023047]"
                }`}
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 md:px-20 p-32">
        {/* Left: Text */}
        <div className="text-center">
          <h2 className="text-4xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-gray-800 mb-6 line-height-1.5">
            Everything <span className="lora font-bold"><i>you</i></span> need <span className="lora font-bold"><i>to</i></span><br />
            <span className="text-[#1889a2] p-2">Manage <span className="lora font-bold"><i>your</i></span> Business</span>
          </h2>

          <p className="sm:text-2xl text-2xl text-gray-600 mb-4">
            From products and sales to suppliers, orders, and stock analysis <br />
            <span>get full control of your operations in one easy-to-use platform.</span>
          </p>
        </div>
        <div>
          <button
            className="
            relative 
            px-10 py-4 
            rounded-full 
            text-white
            font-bold 
            bg-gradient-to-r from-[#8ecae6] to-[#209EBB] 
            bg-opacity-70 
            backdrop-blur-md 
            shadow-lg 
            transition z-0
            duration-300 
            hover:scale-105 
            hover:shadow-xl
            border-none
            cursor-pointer
            text-md
          "
            onClick={() => { navigate("/register") }}
          >
            Get Started
          </button>

        </div>

        {/* Right: Image */}
        <div className="flex justify-center w-full">
          <img
            src={test}
            alt="Sign In"
            className="max-w-2xl w-full h-[500px] object-contain"
          />
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
