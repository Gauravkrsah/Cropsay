
import React, { useState } from 'react';
import { Search, MapPin, Users, TrendingUp, Calendar } from 'lucide-react';

const events = [
  {
    id: 1,
    title: "Agricultural Technology Expo 2025",
    date: "Apr 15-17, 2025",
    location: "New Delhi, India",
    attendees: 2500,
  },
  {
    id: 2,
    title: "Sustainable Farming Workshop",
    date: "Apr 22, 2025",
    location: "Mumbai, India",
    attendees: 150,
  },
  {
    id: 3,
    title: "Organic Farming Certification Program",
    date: "May 5-6, 2025",
    location: "Bangalore, India",
    attendees: 80,
  },
];

const trends = [
  {
    id: 1,
    topic: "Vertical Farming",
    growth: "+28%",
    category: "Technology",
  },
  {
    id: 2,
    topic: "Organic Wheat",
    growth: "+15%",
    category: "Crops",
  },
  {
    id: 3,
    topic: "Precision Agriculture",
    growth: "+42%",
    category: "Technology",
  },
  {
    id: 4,
    topic: "Sustainable Irrigation",
    growth: "+23%",
    category: "Water Management",
  },
  {
    id: 5,
    topic: "Farm-to-Table",
    growth: "+31%",
    category: "Distribution",
  },
];

const ExplorePage = () => {
  const [activeTab, setActiveTab] = useState('trends');

  return (
    <div className="h-screen overflow-y-auto">
      <div className="border-b border-cropsay-grayDark p-4">
        <h1 className="text-2xl font-bold mb-4">Explore Agriculture</h1>
        
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cropsay-grayText" />
          <input
            type="text"
            placeholder="Search trends, events, and more..."
            className="w-full bg-cropsay-darkSecondary border border-cropsay-grayDark rounded-lg py-2 pl-10 pr-4 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
          />
        </div>
        
        <div className="flex border-b border-cropsay-grayDark">
          <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'trends' ? 'text-cropsay-green border-b-2 border-cropsay-green' : 'text-cropsay-grayText'}`}
            onClick={() => setActiveTab('trends')}
          >
            Trends
          </button>
          <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'events' ? 'text-cropsay-green border-b-2 border-cropsay-green' : 'text-cropsay-grayText'}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
          <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'community' ? 'text-cropsay-green border-b-2 border-cropsay-green' : 'text-cropsay-grayText'}`}
            onClick={() => setActiveTab('community')}
          >
            Community
          </button>
        </div>
      </div>
      
      {activeTab === 'trends' && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-full">
              <h2 className="text-lg font-medium flex items-center">
                <TrendingUp size={20} className="mr-2 text-cropsay-green" />
                Agricultural Trends
              </h2>
              <p className="text-sm text-cropsay-grayText mt-1">
                Track what's popular in agriculture today
              </p>
            </div>
            
            {trends.map(trend => (
              <div 
                key={trend.id} 
                className="bg-cropsay-darkSecondary rounded-lg p-4 hover:shadow-lg transition-shadow border border-transparent hover:border-cropsay-green"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{trend.topic}</h3>
                    <span className="text-xs bg-cropsay-dark px-2 py-1 rounded text-cropsay-grayText mt-1 inline-block">
                      {trend.category}
                    </span>
                  </div>
                  <span className="text-green-500 font-medium">{trend.growth}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-cropsay-grayDark flex justify-between">
                  <button className="text-sm text-cropsay-green hover:underline">Learn More</button>
                  <button className="text-sm text-cropsay-grayText hover:text-cropsay-lightText">Follow</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'events' && (
        <div className="p-4">
          <div className="mb-8">
            <h2 className="text-lg font-medium flex items-center mb-4">
              <Calendar size={20} className="mr-2 text-cropsay-green" />
              Upcoming Agricultural Events
            </h2>
            
            <div className="space-y-4">
              {events.map(event => (
                <div 
                  key={event.id} 
                  className="bg-cropsay-darkSecondary rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-medium">{event.title}</h3>
                  <div className="flex items-center text-cropsay-grayText text-sm mt-2">
                    <Calendar size={14} className="mr-1" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-cropsay-grayText text-sm mt-1">
                    <MapPin size={14} className="mr-1" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-cropsay-grayText text-sm mt-1">
                    <Users size={14} className="mr-1" />
                    <span>{event.attendees} attendees</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-cropsay-grayDark flex justify-between">
                    <button className="text-sm text-cropsay-green hover:underline">View Details</button>
                    <button className="primary-button text-sm px-3 py-1">Register</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-2">Can't find what you're looking for?</h2>
            <button className="secondary-button">
              Suggest an Event
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'community' && (
        <div className="p-4">
          <div className="text-center py-16">
            <div className="flex justify-center">
              <div className="bg-cropsay-darkSecondary p-6 rounded-full">
                <Users size={48} className="text-cropsay-grayText" />
              </div>
            </div>
            <h3 className="mt-6 text-xl">Community Coming Soon</h3>
            <p className="text-cropsay-grayText mt-2">
              Connect with farmers and agricultural experts around the world.
              <br />We're working on building a vibrant community platform.
            </p>
            <button className="secondary-button mt-6 mx-auto">
              Get Notified When Launched
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
