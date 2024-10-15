"use client";
import React from "react";
import Link from "next/link"; // Import Next.js Link for navigation

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header Section */}
      <header className="bg-custome-darkmint text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-lg mb-8">
            Learn more about our mission, vision, and values.
          </p>
          <Link href="/">
            <a className="px-6 py-3 bg-white text-custome-darkmint font-semibold rounded-lg hover:bg-gray-200 transition">
              Back to Home
            </a>
          </Link>
        </div>
      </header>

      {/* Main Content Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Our Story</h2>
          <p className="text-gray-600 mb-6">
            We are passionate about building innovative solutions that empower
            our users. Since our founding, we’ve been driven by a commitment to
            quality, innovation, and delivering real value to our customers.
          </p>

          <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            Our mission is to create cutting-edge tools and technologies that
            solve real-world problems, enhance productivity, and improve the
            lives of those who use our products.
          </p>

          <h2 className="text-3xl font-bold mb-8">Our Values</h2>
          <p className="text-gray-600 mb-6">
            Integrity, innovation, and user-centric design are at the heart of
            everything we do. We believe in transparency, collaboration, and
            continuous improvement to stay ahead of the curve and meet the
            evolving needs of our customers.
          </p>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; 2024 Your Company. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
