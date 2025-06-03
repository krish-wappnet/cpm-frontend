import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen font-['Inter',sans-serif] bg-white text-gray-800">
      {/* Navbar */}
      <nav
        className={`fixed w-full z-30 transition-all duration-500 ${
          isScrolled ? "bg-blue-200 shadow-md" : "bg-blue-100/90"
        } text-blue-900`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold tracking-tight">
                HR Analytics
              </h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-10 items-center">
              <a
                href="#home"
                className="hover:text-blue-600 font-medium transition-colors"
              >
                Home
              </a>
              <a
                href="#features"
                className="hover:text-blue-600 font-medium transition-colors"
              >
                Features
              </a>
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-5 py-2.5 rounded-md font-semibold hover:from-blue-400 hover:to-blue-500 transition duration-200"
              >
                Sign In
              </Link>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-blue-900 focus:outline-none p-2"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      isMobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16m-7 6h7"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              isMobileMenuOpen ? "max-h-60" : "max-h-0"
            }`}
          >
            <div className="px-4 py-4 space-y-3 bg-blue-100/95">
              <a
                href="#home"
                onClick={toggleMobileMenu}
                className="block font-medium hover:text-blue-600"
              >
                Home
              </a>
              <a
                href="#features"
                onClick={toggleMobileMenu}
                className="block font-medium hover:text-blue-600"
              >
                Features
              </a>
              <Link
                to="/login"
                onClick={toggleMobileMenu}
                className="block bg-gradient-to-r from-blue-300 to-blue-400 text-white text-center px-5 py-2.5 rounded-md font-semibold hover:from-blue-400 hover:to-blue-500"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="pt-36 pb-24 bg-cover bg-center text-white relative"
        style={{
          backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.8), rgba(30, 58, 138, 0.8)), url('https://plus.unsplash.com/premium_photo-1661497675847-2075003562fd?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Elevate HR with Strategic Insights
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto font-light">
            Optimize KPIs, streamline OKRs, gather 360 feedback, and visualize
            performance with our advanced HR analytics platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-blue-300 hover:bg-blue-400 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-md transition duration-200"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold shadow-md transition duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* Hero Section */}
      <section
        id="home"
        className="pt-36 pb-24 bg-white text-center text-blue-900"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Elevate HR with Strategic Insights
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto font-light text-gray-700">
            Optimize KPIs, streamline OKRs, gather 360 feedback, and visualize
            performance with our advanced HR analytics platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-blue-300 hover:bg-blue-400 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-md transition duration-200"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white border border-blue-300 text-blue-900 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold shadow-md transition duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-200 text-blue-900 py-12 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-6 text-sm text-blue-800 font-light">
            © 2025 HR Analytics. All rights reserved.
          </p>
          <div className="space-x-8 text-sm">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Terms of Service
            </a>
            <a
              href="#contact"
              className="hover:text-blue-600 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
