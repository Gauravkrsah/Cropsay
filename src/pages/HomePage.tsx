
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ShoppingBag, BookOpen, Users, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  const features = [
    { 
      icon: <MessageSquare className="h-8 w-8 text-cropsay-green" />, 
      title: 'AI Chat Assistant',
      description: 'Get instant answers to your agricultural queries and personalized advice',
      link: '/chat'
    },
    { 
      icon: <ShoppingBag className="h-8 w-8 text-cropsay-green" />, 
      title: 'Shop Quality Products',
      description: 'Browse our curated selection of seeds, tools, and supplies',
      link: '/shop'
    },
    { 
      icon: <BookOpen className="h-8 w-8 text-cropsay-green" />, 
      title: 'Learn & Grow',
      description: 'Access educational resources to improve your agricultural practices',
      link: '/learn'
    },
    { 
      icon: <Users className="h-8 w-8 text-cropsay-green" />, 
      title: 'Connect with Experts',
      description: 'Consult with agricultural specialists for tailored advice',
      link: '/chat?expert=true'
    },
  ];

  const testimonials = [
    {
      name: 'Raj Patel',
      location: 'Punjab, India',
      quote: 'Cropsay helped me increase my wheat yields by 15% through better soil management practices.',
      avatar: '👨🏽‍🌾'
    },
    {
      name: 'Amina Sheikh',
      location: 'Terai, Nepal',
      quote: 'The expert guidance on pest control saved my rice crop this season. Truly grateful!',
      avatar: '👩🏽‍🌾'
    },
  ];

  return (
    <div className="min-h-screen overflow-y-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-cropsay-darkSecondary to-cropsay-dark py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">Grow Better with Cropsay</h1>
              <p className="text-xl text-cropsay-grayText">
                Your complete agricultural platform for learning, buying, selling,
                and getting expert assistance for your farming needs
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/chat">
                  <Button variant="default" size="lg" className="bg-cropsay-green hover:bg-cropsay-green/90">
                    Start Chatting
                  </Button>
                </Link>
                <Link to="/explore">
                  <Button variant="outline" size="lg">
                    Explore Resources
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 bg-cropsay-darkSecondary rounded-xl p-8 shadow-lg">
              <div className="aspect-video relative overflow-hidden rounded-lg bg-cropsay-grayDark flex items-center justify-center">
                <div className="text-6xl">🌾</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How Cropsay Helps You</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Link to={feature.link} key={index} className="group">
                <div className="bg-cropsay-darkSecondary rounded-xl p-6 h-full transition-all duration-300 hover:shadow-lg hover:shadow-cropsay-green/10 hover:-translate-y-1">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-cropsay-grayText mb-4">{feature.description}</p>
                  <span className="text-cropsay-green group-hover:underline">Learn more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Calendar Section */}
      <div className="bg-cropsay-darkSecondary py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-8">
            <Calendar className="text-cropsay-green mr-3" size={28} />
            <h2 className="text-2xl font-bold">Seasonal Farming Calendar</h2>
          </div>
          
          <div className="bg-cropsay-dark rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-cropsay-grayDark rounded-lg">
                <h3 className="font-semibold mb-2">Spring</h3>
                <p className="text-cropsay-grayText">Planting season for rice and vegetables</p>
              </div>
              <div className="text-center p-4 border border-cropsay-grayDark rounded-lg">
                <h3 className="font-semibold mb-2">Summer</h3>
                <p className="text-cropsay-grayText">Maintenance and pest control</p>
              </div>
              <div className="text-center p-4 border border-cropsay-grayDark rounded-lg">
                <h3 className="font-semibold mb-2">Autumn</h3>
                <p className="text-cropsay-grayText">Harvest season for most crops</p>
              </div>
              <div className="text-center p-4 border border-cropsay-grayDark rounded-lg">
                <h3 className="font-semibold mb-2">Winter</h3>
                <p className="text-cropsay-grayText">Planning and soil preparation</p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link to="/learn">
                <Button variant="outline" className="border-cropsay-green text-cropsay-green hover:bg-cropsay-green hover:text-white">
                  View Full Calendar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-8">
            <Award className="text-cropsay-green mr-3" size={28} />
            <h2 className="text-2xl font-bold">Farmer Success Stories</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-cropsay-darkSecondary rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-cropsay-grayText text-sm">{testimonial.location}</p>
                  </div>
                </div>
                <p className="italic text-cropsay-grayText">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
