
import React from 'react';
import { BookOpen, Video, Newspaper, Calendar, ArrowRight } from 'lucide-react';

const articles = [
  {
    id: 1,
    title: "Best Practices for Sustainable Farming",
    category: "Sustainable Agriculture",
    readTime: "8 min read",
    date: "Apr 2, 2025",
  },
  {
    id: 2,
    title: "Understanding Modern Irrigation Techniques",
    category: "Water Management",
    readTime: "12 min read",
    date: "Mar 28, 2025",
  },
  {
    id: 3,
    title: "Guide to Organic Pest Control Methods",
    category: "Organic Farming",
    readTime: "10 min read",
    date: "Mar 25, 2025",
  },
];

const courses = [
  {
    id: 1,
    title: "Introduction to Sustainable Agriculture",
    instructor: "Dr. Sarah Chen",
    lessons: 12,
    duration: "4 weeks",
    level: "Beginner",
  },
  {
    id: 2,
    title: "Advanced Crop Rotation Strategies",
    instructor: "Prof. Michael Singh",
    lessons: 8,
    duration: "3 weeks",
    level: "Intermediate",
  },
  {
    id: 3,
    title: "Agricultural Business Management",
    instructor: "Elizabeth Wang",
    lessons: 15,
    duration: "6 weeks",
    level: "Advanced",
  },
];

const LearnPage = () => {
  return (
    <div className="h-screen overflow-y-auto">
      <div className="border-b border-cropsay-grayDark p-4">
        <h1 className="text-2xl font-bold">Learn & Grow</h1>
      </div>
      
      <div className="p-4">
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Featured Courses</h2>
            <button className="text-cropsay-green hover:underline flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <div key={course.id} className="bg-cropsay-darkSecondary rounded-lg overflow-hidden border border-cropsay-grayDark hover:border-cropsay-green transition-colors">
                <div className="h-40 bg-cropsay-grayDark flex items-center justify-center">
                  <Video size={32} className="text-cropsay-grayText" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs bg-cropsay-dark px-2 py-1 rounded text-cropsay-grayText">{course.level}</span>
                    <span className="text-xs text-cropsay-grayText">{course.lessons} lessons • {course.duration}</span>
                  </div>
                  <h3 className="font-medium mb-2">{course.title}</h3>
                  <p className="text-sm text-cropsay-grayText mb-4">by {course.instructor}</p>
                  <button className="primary-button w-full">
                    Start Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Latest Articles</h2>
            <button className="text-cropsay-green hover:underline flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="space-y-4">
            {articles.map(article => (
              <div key={article.id} className="bg-cropsay-darkSecondary rounded-lg p-4 flex hover:bg-cropsay-grayDark transition-colors">
                <div className="w-20 h-20 bg-cropsay-grayDark rounded-md mr-4 flex items-center justify-center flex-shrink-0">
                  <Newspaper size={24} className="text-cropsay-grayText" />
                </div>
                <div>
                  <div className="flex mb-1">
                    <span className="text-xs bg-cropsay-dark px-2 py-1 rounded text-cropsay-grayText">{article.category}</span>
                    <span className="text-xs text-cropsay-grayText ml-2 flex items-center">
                      <BookOpen size={12} className="mr-1" />
                      {article.readTime}
                    </span>
                    <span className="text-xs text-cropsay-grayText ml-2 flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {article.date}
                    </span>
                  </div>
                  <h3 className="font-medium">{article.title}</h3>
                  <button className="text-sm text-cropsay-green hover:underline mt-1">Read Article</button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Learning Paths</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-cropsay-darkSecondary rounded-lg p-6 border-l-4 border-green-500">
              <h3 className="font-medium mb-2">Sustainable Farming Certification</h3>
              <p className="text-sm text-cropsay-grayText mb-3">Complete this structured learning path to earn a certification in sustainable farming practices.</p>
              <div className="flex justify-between items-center">
                <div className="text-xs text-cropsay-grayText">3 courses • 8 weeks</div>
                <button className="text-sm text-cropsay-green hover:underline">View Path</button>
              </div>
            </div>
            
            <div className="bg-cropsay-darkSecondary rounded-lg p-6 border-l-4 border-blue-500">
              <h3 className="font-medium mb-2">Modern Agriculture Technology</h3>
              <p className="text-sm text-cropsay-grayText mb-3">Learn about the latest technologies transforming the agriculture industry.</p>
              <div className="flex justify-between items-center">
                <div className="text-xs text-cropsay-grayText">5 courses • 12 weeks</div>
                <button className="text-sm text-cropsay-green hover:underline">View Path</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LearnPage;
