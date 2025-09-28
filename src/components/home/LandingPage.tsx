import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <header className="w-full px-6 py-4 bg-white shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">BE<span className="font-bold text-gray-800 mb-6">NG</span></h1>
          <nav className="space-x-6">
            <a href="#sign-in" className="text-gray-600 hover:text-blue-500">Sign In</a>
            <a href="#sign-up" className="nline-block bg-blue-50 px-3 py-1 rounded-md text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition">Sign Up</a>
          </nav>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">Wanna Continue? Please <span className="text-blue-500">Sign In</span></h2>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2x2 mb-8">
          This is your landing page, to access the features, you need to sign in or sign up!</p>
      </main>
    </div>
  );
};

export default LandingPage;
