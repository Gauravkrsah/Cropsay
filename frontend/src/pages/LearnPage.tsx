
import React, { useState, useEffect } from 'react';
import { BookOpen, Video, Newspaper, Calendar, ArrowRight, Home, ChevronRight, Search, Filter, Play, Clock, Users, Star, Award, TrendingUp, X, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile, useIsSmallMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Extended articles data with more content
const articles = [
  {
    id: 1,
    title: "Best Practices for Sustainable Farming",
    category: "Sustainable Agriculture",
    readTime: "8 min read",
    date: "Apr 2, 2025",
    excerpt: "Learn essential techniques for environmentally friendly farming that boost productivity while preserving soil health.",
    content: "Sustainable farming practices are crucial for long-term agricultural success...",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: "Dr. Maria Rodriguez",
    tags: ["sustainability", "soil health", "organic"]
  },
  {
    id: 2,
    title: "Understanding Modern Irrigation Techniques",
    category: "Water Management",
    readTime: "12 min read",
    date: "Mar 28, 2025",
    excerpt: "Discover efficient water management systems that reduce waste and improve crop yields.",
    content: "Modern irrigation systems have revolutionized agriculture...",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: "Prof. James Wilson",
    tags: ["irrigation", "water management", "technology"]
  },
  {
    id: 3,
    title: "Guide to Organic Pest Control Methods",
    category: "Organic Farming",
    readTime: "10 min read",
    date: "Mar 25, 2025",
    excerpt: "Natural pest control solutions that protect crops without harmful chemicals.",
    content: "Organic pest control methods offer safe alternatives...",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: "Dr. Lisa Chen",
    tags: ["organic", "pest control", "natural methods"]
  },
  {
    id: 4,
    title: "Climate-Smart Agriculture Strategies",
    category: "Climate Change",
    readTime: "15 min read",
    date: "Mar 20, 2025",
    excerpt: "Adapt your farming practices to changing climate conditions for better resilience.",
    content: "Climate change presents new challenges for farmers...",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: "Dr. Ahmed Hassan",
    tags: ["climate change", "adaptation", "resilience"]
  }
];

// Extended courses data with more details
const courses = [
  {
    id: 1,
    title: "Introduction to Sustainable Agriculture",
    instructor: "Dr. Sarah Chen",
    lessons: 12,
    duration: "4 weeks",
    level: "Beginner",
    rating: 4.8,
    students: 1250,
    price: 2999,
    description: "Learn the fundamentals of sustainable farming practices that protect the environment while maintaining productivity.",
    thumbnail: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    topics: ["Soil Health", "Crop Rotation", "Organic Methods", "Water Conservation"],
    certificate: true
  },
  {
    id: 2,
    title: "Advanced Crop Rotation Strategies",
    instructor: "Prof. Michael Singh",
    lessons: 8,
    duration: "3 weeks",
    level: "Intermediate",
    rating: 4.9,
    students: 890,
    price: 3999,
    description: "Master advanced crop rotation techniques to maximize yield and soil health.",
    thumbnail: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    topics: ["Rotation Planning", "Soil Nutrients", "Pest Management", "Yield Optimization"],
    certificate: true
  },
  {
    id: 3,
    title: "Agricultural Business Management",
    instructor: "Elizabeth Wang",
    lessons: 15,
    duration: "6 weeks",
    level: "Advanced",
    rating: 4.7,
    students: 650,
    price: 4999,
    description: "Develop business skills to run a successful agricultural enterprise.",
    thumbnail: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    topics: ["Financial Planning", "Market Analysis", "Risk Management", "Technology Integration"],
    certificate: true
  },
  {
    id: 4,
    title: "Modern Irrigation Systems",
    instructor: "Dr. Raj Patel",
    lessons: 10,
    duration: "4 weeks",
    level: "Intermediate",
    rating: 4.6,
    students: 720,
    price: 3499,
    description: "Learn to design and implement efficient irrigation systems for various crops.",
    thumbnail: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    topics: ["Drip Irrigation", "Smart Controllers", "Water Efficiency", "System Design"],
    certificate: true
  }
];

// Learning paths data
const learningPaths = [
  {
    id: 1,
    title: "Sustainable Farming Certification",
    description: "Complete this structured learning path to earn a certification in sustainable farming practices.",
    courses: 3,
    duration: "8 weeks",
    level: "Beginner to Intermediate",
    color: "green",
    progress: 0,
    courseIds: [1, 2, 4]
  },
  {
    id: 2,
    title: "Modern Agriculture Technology",
    description: "Learn about the latest technologies transforming the agriculture industry.",
    courses: 5,
    duration: "12 weeks",
    level: "Intermediate to Advanced",
    color: "blue",
    progress: 0,
    courseIds: [2, 3, 4]
  },
  {
    id: 3,
    title: "Organic Farming Mastery",
    description: "Master organic farming techniques from soil preparation to harvest.",
    courses: 4,
    duration: "10 weeks",
    level: "All Levels",
    color: "purple",
    progress: 0,
    courseIds: [1, 2]
  }
];

const LearnPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();

  // State management
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSearch, setShowSearch] = useState(false);

  // Filter courses based on search and filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = activeFilter === 'all' || course.level.toLowerCase() === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // Filter articles based on search
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-screen overflow-y-auto bg-[#1E2735]">
      {/* Mobile-optimized Header */}
      <div className={cn(
        "sticky z-20 bg-[#1E2735] border-b border-[#2A3143]",
        isMobile ? "top-0" : "top-0"
      )}>
        <div className={cn(
          "px-4 py-3",
          isMobile && "py-2"
        )}>
          <div className="flex items-center justify-between">
            {/* Left - Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <button
                onClick={() => navigate("/")}
                className="hover:text-white transition-colors"
              >
                <Home size={isMobile ? 14 : 16} />
              </button>
              <ChevronRight size={isMobile ? 12 : 14} />
              <span className="text-white font-medium">Learn</span>
            </div>

            {/* Right - Search and Filter */}
            <div className="flex items-center gap-2">
              {!isMobile && (
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses, articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-cropsay-darkSecondary border border-cropsay-grayDark rounded-lg text-sm text-white placeholder-gray-400 focus:border-cropsay-green focus:outline-none w-64"
                  />
                </div>
              )}

              {isMobile && (
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 hover:bg-cropsay-grayDark rounded-lg transition-colors"
                >
                  <Search size={16} className="text-gray-400" />
                </button>
              )}

              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className={cn(
                  "bg-cropsay-darkSecondary border border-cropsay-grayDark rounded-lg text-white focus:border-cropsay-green focus:outline-none",
                  isMobile ? "text-xs px-2 py-1" : "text-sm px-3 py-2"
                )}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isMobile && showSearch && (
            <div className="mt-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-cropsay-darkSecondary border border-cropsay-grayDark rounded-lg text-sm text-white placeholder-gray-400 focus:border-cropsay-green focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1 overflow-y-auto",
        isMobile ? "p-3 pb-20" : "p-6"
      )}>
        {/* Featured Courses Section */}
        <section className={cn(
          isMobile ? "mb-6" : "mb-10"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={cn(
                "font-bold text-white flex items-center gap-2",
                isMobile ? "text-lg" : "text-xl"
              )}>
                <BookOpen className="text-cropsay-green" size={isMobile ? 18 : 20} />
                Featured Courses
              </h2>
              {!isMobile && (
                <p className="text-cropsay-grayText text-sm mt-1">
                  {filteredCourses.length} courses available
                </p>
              )}
            </div>
            <button className="text-cropsay-green hover:underline flex items-center text-sm">
              View All <ArrowRight size={14} className="ml-1" />
            </button>
          </div>

          {/* Courses Grid */}
          <div className={cn(
            "grid gap-4",
            isMobile
              ? "grid-cols-1 gap-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}>
            {filteredCourses.map(course => (
              <div
                key={course.id}
                className={cn(
                  "bg-cropsay-darkSecondary rounded-lg overflow-hidden border border-cropsay-grayDark/50 hover:border-cropsay-green/30 transition-all duration-300 cursor-pointer group",
                  isMobile ? "hover:shadow-lg" : "hover:shadow-xl hover:-translate-y-1"
                )}
                onClick={() => setSelectedCourse(course)}
              >
                {/* Course Thumbnail */}
                <div className={cn(
                  "relative overflow-hidden",
                  isMobile ? "aspect-video" : "aspect-video"
                )}>
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />

                  {/* Fallback gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 hidden flex items-center justify-center">
                    <BookOpen size={32} className="text-gray-400" />
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-cropsay-green rounded-full p-3">
                      <Play size={20} className="text-white ml-1" />
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div className={cn(
                    "absolute top-2 left-2 bg-cropsay-green text-white rounded font-medium",
                    isMobile ? "text-xs px-2 py-1" : "text-xs px-2 py-1"
                  )}>
                    {course.level}
                  </div>

                  {/* Price Badge */}
                  <div className={cn(
                    "absolute top-2 right-2 bg-black/70 text-white rounded",
                    isMobile ? "text-xs px-2 py-1" : "text-xs px-2 py-1"
                  )}>
                    ₹{course.price}
                  </div>
                </div>

                {/* Course Content */}
                <div className={cn(
                  isMobile ? "p-3" : "p-4"
                )}>
                  {/* Title */}
                  <h3 className={cn(
                    "font-semibold text-white mb-2 line-clamp-2 leading-tight",
                    isMobile ? "text-sm" : "text-base"
                  )}>
                    {course.title}
                  </h3>

                  {/* Instructor */}
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-cropsay-green rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        {course.instructor.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <p className={cn(
                      "text-cropsay-grayText truncate",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      {course.instructor}
                    </p>
                  </div>

                  {/* Course Stats */}
                  <div className={cn(
                    "flex items-center justify-between text-cropsay-grayText mb-3",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {course.students}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-current" />
                      <span>{course.rating}</span>
                    </div>
                  </div>

                  {/* Start Learning Button */}
                  <button className={cn(
                    "w-full bg-cropsay-green hover:bg-cropsay-green/90 text-white rounded font-medium transition-colors",
                    isMobile ? "py-2 text-xs" : "py-2.5 text-sm"
                  )}>
                    Start Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Latest Articles Section */}
        <section className={cn(
          isMobile ? "mb-6" : "mb-10"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={cn(
                "font-bold text-white flex items-center gap-2",
                isMobile ? "text-lg" : "text-xl"
              )}>
                <Newspaper className="text-cropsay-green" size={isMobile ? 18 : 20} />
                Latest Articles
              </h2>
              {!isMobile && (
                <p className="text-cropsay-grayText text-sm mt-1">
                  {filteredArticles.length} articles available
                </p>
              )}
            </div>
            <button className="text-cropsay-green hover:underline flex items-center text-sm">
              View All <ArrowRight size={14} className="ml-1" />
            </button>
          </div>

          {/* Articles List */}
          <div className={cn(
            isMobile ? "space-y-3" : "space-y-4"
          )}>
            {filteredArticles.map(article => (
              <div
                key={article.id}
                className={cn(
                  "bg-cropsay-darkSecondary rounded-lg border border-cropsay-grayDark/50 hover:border-cropsay-green/30 transition-all duration-300 cursor-pointer group",
                  isMobile ? "p-3 hover:shadow-lg" : "p-4 hover:shadow-xl hover:-translate-y-1"
                )}
                onClick={() => setSelectedArticle(article)}
              >
                <div className={cn(
                  "flex gap-4",
                  isMobile && "flex-col"
                )}>
                  {/* Article Image */}
                  <div className={cn(
                    "flex-shrink-0 bg-cropsay-grayDark rounded-lg overflow-hidden",
                    isMobile ? "w-full h-32" : "w-24 h-24"
                  )}>
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Newspaper size={isMobile ? 32 : 24} className="text-cropsay-grayText" />
                      </div>
                    )}
                  </div>

                  {/* Article Content */}
                  <div className="flex-1 min-w-0">
                    {/* Article Meta */}
                    <div className={cn(
                      "flex flex-wrap gap-2 mb-2",
                      isMobile ? "text-xs" : "text-xs"
                    )}>
                      <span className="bg-cropsay-dark px-2 py-1 rounded text-cropsay-grayText">
                        {article.category}
                      </span>
                      <span className="text-cropsay-grayText flex items-center gap-1">
                        <Clock size={10} />
                        {article.readTime}
                      </span>
                      <span className="text-cropsay-grayText flex items-center gap-1">
                        <Calendar size={10} />
                        {article.date}
                      </span>
                    </div>

                    {/* Article Title */}
                    <h3 className={cn(
                      "font-semibold text-white mb-2 line-clamp-2 group-hover:text-cropsay-green transition-colors",
                      isMobile ? "text-sm" : "text-base"
                    )}>
                      {article.title}
                    </h3>

                    {/* Article Excerpt */}
                    {!isMobile && (
                      <p className="text-cropsay-grayText text-sm mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Author and Read Button */}
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-cropsay-grayText",
                        isMobile ? "text-xs" : "text-sm"
                      )}>
                        By {article.author}
                      </span>
                      <button className={cn(
                        "text-cropsay-green hover:underline font-medium",
                        isMobile ? "text-xs" : "text-sm"
                      )}>
                        Read Article
                      </button>
                    </div>

                    {/* Tags */}
                    {!isMobile && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-cropsay-green/10 text-cropsay-green px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Paths Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={cn(
                "font-bold text-white flex items-center gap-2",
                isMobile ? "text-lg" : "text-xl"
              )}>
                <Award className="text-cropsay-green" size={isMobile ? 18 : 20} />
                Learning Paths
              </h2>
              {!isMobile && (
                <p className="text-cropsay-grayText text-sm mt-1">
                  Structured learning journeys with certifications
                </p>
              )}
            </div>
          </div>

          {/* Learning Paths Grid */}
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {learningPaths.map(path => (
              <div
                key={path.id}
                className={cn(
                  "bg-cropsay-darkSecondary rounded-lg border-l-4 hover:shadow-lg transition-all duration-300 cursor-pointer group",
                  isMobile ? "p-4" : "p-6",
                  path.color === 'green' && "border-green-500",
                  path.color === 'blue' && "border-blue-500",
                  path.color === 'purple' && "border-purple-500"
                )}
                onClick={() => setSelectedPath(path)}
              >
                {/* Path Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className={cn(
                    "font-semibold text-white group-hover:text-cropsay-green transition-colors",
                    isMobile ? "text-sm" : "text-base"
                  )}>
                    {path.title}
                  </h3>
                  <div className={cn(
                    "flex items-center gap-1 text-cropsay-green",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    <Award size={14} />
                    <span>Cert</span>
                  </div>
                </div>

                {/* Path Description */}
                <p className={cn(
                  "text-cropsay-grayText mb-4 line-clamp-2",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {path.description}
                </p>

                {/* Path Stats */}
                <div className={cn(
                  "flex items-center justify-between text-cropsay-grayText mb-4",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} />
                      {path.courses} courses
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {path.duration}
                    </span>
                  </div>
                  <span className="text-cropsay-green font-medium">
                    {path.level}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-cropsay-grayText",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      Progress
                    </span>
                    <span className={cn(
                      "text-cropsay-green font-medium",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      {path.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-cropsay-grayDark rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        path.color === 'green' && "bg-green-500",
                        path.color === 'blue' && "bg-blue-500",
                        path.color === 'purple' && "bg-purple-500"
                      )}
                      style={{ width: `${path.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* View Path Button */}
                <button className={cn(
                  "w-full bg-transparent border border-cropsay-green text-cropsay-green hover:bg-cropsay-green hover:text-white rounded font-medium transition-colors",
                  isMobile ? "py-2 text-xs" : "py-2.5 text-sm"
                )}>
                  View Learning Path
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Course Detail Modal */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className={cn(
          "bg-cropsay-darkSecondary border-cropsay-grayDark text-white",
          isMobile ? "max-w-[95vw] max-h-[90vh] overflow-y-auto" : "max-w-2xl"
        )}>
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">
                  {selectedCourse.title}
                </DialogTitle>
                <DialogDescription className="text-cropsay-grayText">
                  {selectedCourse.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Course Image */}
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={selectedCourse.thumbnail}
                    alt={selectedCourse.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Course Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-cropsay-green" />
                      <span>{selectedCourse.students} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-cropsay-green" />
                      <span>{selectedCourse.duration}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-yellow-400" />
                      <span>{selectedCourse.rating} rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-cropsay-green" />
                      <span>{selectedCourse.lessons} lessons</span>
                    </div>
                  </div>
                </div>

                {/* Topics */}
                <div>
                  <h4 className="font-semibold mb-2">What you'll learn:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedCourse.topics.map((topic, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-cropsay-green rounded-full"></div>
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-3 p-3 bg-cropsay-dark rounded-lg">
                  <div className="w-12 h-12 bg-cropsay-green rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {selectedCourse.instructor.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-semibold">{selectedCourse.instructor}</h5>
                    <p className="text-sm text-cropsay-grayText">Course Instructor</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 bg-cropsay-green hover:bg-cropsay-green/90">
                    Enroll Now - ₹{selectedCourse.price}
                  </Button>
                  <Button variant="outline" className="border-cropsay-green text-cropsay-green hover:bg-cropsay-green hover:text-white">
                    Preview
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Article Detail Modal */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className={cn(
          "bg-cropsay-darkSecondary border-cropsay-grayDark text-white",
          isMobile ? "max-w-[95vw] max-h-[90vh] overflow-y-auto" : "max-w-3xl"
        )}>
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">
                  {selectedArticle.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-cropsay-grayText">
                  <span>By {selectedArticle.author}</span>
                  <span>{selectedArticle.date}</span>
                  <span>{selectedArticle.readTime}</span>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Article Image */}
                {selectedArticle.image && (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={selectedArticle.image}
                      alt={selectedArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Article Content */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-cropsay-grayText mb-4">
                    {selectedArticle.excerpt}
                  </p>
                  <div className="text-white leading-relaxed">
                    {selectedArticle.content}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-cropsay-grayDark">
                  {selectedArticle.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-cropsay-green/10 text-cropsay-green px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Learning Path Detail Modal */}
      <Dialog open={!!selectedPath} onOpenChange={() => setSelectedPath(null)}>
        <DialogContent className={cn(
          "bg-cropsay-darkSecondary border-cropsay-grayDark text-white",
          isMobile ? "max-w-[95vw] max-h-[90vh] overflow-y-auto" : "max-w-2xl"
        )}>
          {selectedPath && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="text-cropsay-green" size={24} />
                  {selectedPath.title}
                </DialogTitle>
                <DialogDescription className="text-cropsay-grayText">
                  {selectedPath.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Path Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-cropsay-dark rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cropsay-green">{selectedPath.courses}</div>
                    <div className="text-xs text-cropsay-grayText">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cropsay-green">{selectedPath.duration}</div>
                    <div className="text-xs text-cropsay-grayText">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cropsay-green">{selectedPath.progress}%</div>
                    <div className="text-xs text-cropsay-grayText">Complete</div>
                  </div>
                </div>

                {/* Included Courses */}
                <div>
                  <h4 className="font-semibold mb-3">Included Courses:</h4>
                  <div className="space-y-2">
                    {selectedPath.courseIds.map((courseId, index) => {
                      const course = courses.find(c => c.id === courseId);
                      return course ? (
                        <div key={courseId} className="flex items-center gap-3 p-3 bg-cropsay-dark rounded-lg">
                          <div className="w-8 h-8 bg-cropsay-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{course.title}</h5>
                            <p className="text-sm text-cropsay-grayText">{course.duration} • {course.lessons} lessons</p>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full bg-cropsay-green hover:bg-cropsay-green/90">
                  Start Learning Path
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LearnPage;
