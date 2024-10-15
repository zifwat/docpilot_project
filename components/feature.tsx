import React from "react";

interface FeatureProps {
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ title, description }) => {
  return (
    <div className="p-8 bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4 text-gray-100">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="h-[85vh] bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <header className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Landing Page</h1>
          <p className="text-lg mb-8">Discover amazing features and enhance your experience.</p>
          <a
            href="#features"
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
          >
            Explore Features
          </a>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-12 text-gray-100">Our Amazing Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Feature title="Feature 1" description="Description of the first feature goes here." />
            <Feature title="Feature 2" description="Description of the second feature goes here." />
            <Feature title="Feature 3" description="Description of the third feature goes here." />
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
