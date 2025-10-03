import React, { useEffect, useState } from 'react';
import stocks from '../images/signin.png';

const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8ECAE6] to-white pt-5">
      {/* Fixed Header */}
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-white rounded-full shadow-md max-w-3xl w-full z-50 transition-colors duration-500">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold transition-colors duration-500">
            <span className={scrolled ? 'text-[#FFB701]' : 'text-[#209ebb]'}>BE</span>
            <span className="font-bold text-gray-800">NG</span>
          </h1>
          <nav className="space-x-6">
            <a href="#sign-in" className="text-black hover:text-gray-400 font-bold">
              Sign In
            </a>
            <a
              href="#sign-up"
              className={`inline-block px-3 py-1 rounded-full text-white font-bold transition-colors duration-500 ${
                scrolled
                  ? 'bg-[#FFB701] hover:bg-[#FC8500]'
                  : 'bg-[#209ebb] hover:bg-[#023047]'
              }`}
            >
              Sign Up
            </a>
          </nav>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
        <h2 className="text-4xl sm:text-6xl lg:text-8xl font-bold text-gray-800 mb-6 mt-30 max-w-4xl">
          Wanna Continue? Please 
          <span className="text-[#209EBB]"> Sign In
            <img
              src={stocks}
              alt="Sign In"
              className="w-15 h-15 inline-block ml-5"
            />
          </span>
        </h2>

        <p className="text-lg sm:text-xl text-gray-600">
          This is your landing page, to access the features, you need to sign in or sign up!
        </p>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mb-8">
          Curious on what this website can do? Scroll down.
        </p>
      </main>
    </div>
  );
};

export default LandingPage;
