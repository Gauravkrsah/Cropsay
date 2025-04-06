
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="h-screen overflow-y-auto">
      <div className="min-h-[70vh] flex flex-col justify-center px-8 py-16 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Welcome to Cropsay</h1>
        <p className="text-xl text-cropsay-grayText mb-10">
          Your complete agricultural platform for learning, buying, selling,
          and getting expert assistance
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Link to="/chat" className="primary-button">
            Get Started
          </Link>
          <button className="secondary-button">
            Learn More
          </button>
        </div>
      </div>
      
      <div className="bg-cropsay-darkSecondary py-16">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex items-center mb-6">
            <MessageSquare className="text-cropsay-green mr-3" size={28} />
            <h2 className="text-2xl font-bold">AI Chat Assistant</h2>
          </div>
          <p className="text-cropsay-grayText mb-8">
            Get instant answers to your agricultural queries
          </p>
          
          <Link to="/chat" className="primary-button inline-flex">
            Start Chatting
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
