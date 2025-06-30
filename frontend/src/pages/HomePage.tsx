
import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ShoppingBag, BookOpen, Users, Award, Calendar, Star, TrendingUp, ChevronRight, Video, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/data/productData';
import { fetchProducts, getNewestProducts } from '@/services/productService';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);

        // Get newest products for featured section
        const newest = await getNewestProducts(12);
        setFeaturedProducts(newest);

        // Get all products and sort by rating for best selling
        const allProducts = await fetchProducts();
        const topRated = allProducts
          .filter(product => product.rating && product.rating > 4.0)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 8);
        setBestSellingProducts(topRated);

      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to empty arrays
        setFeaturedProducts([]);
        setBestSellingProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Course data
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

  // Trends data
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
  ];

  const features = [
    {
      icon: <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-cropsay-green" />,
      title: 'AI Chat Assistant',
      description: 'Get instant answers to your agricultural queries',
      link: '/chat'
    },
    {
      icon: <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-cropsay-green" />,
      title: 'Shop Products',
      description: 'Browse quality seeds, tools, and supplies',
      link: '/shop'
    },
    {
      icon: <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-cropsay-green" />,
      title: 'Learn & Grow',
      description: 'Access educational resources and courses',
      link: '/learn'
    }
  ];

  const testimonials = [
    {
      name: 'Gaurav Sah',
      location: 'Barahathawa, Sarlahi',
      quote: 'Cropsay helped me increase my wheat yields by 15% through better soil management practices.',
      avatar: '👨🏽‍🌾'
    },
    {
      name: 'Munchun Sah',
      location: 'Rampur, Rautahat',
      quote: 'The expert guidance on pest control saved my rice crop this season. Truly grateful!',
      avatar: '👩🏽‍🌾'
    },
  ];

  return (
    <div className="min-h-screen overflow-y-auto">
      {/* Hero Section - Compact and Mobile-First */}
      <div className="bg-gradient-to-br from-cropsay-darkSecondary via-cropsay-dark to-cropsay-darkSecondary py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            <div className="lg:w-3/5 space-y-3 sm:space-y-4 lg:space-y-6 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                <span className="text-cropsay-green">Grow Better</span> with Cropsay
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-cropsay-grayText max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Your complete agricultural platform for learning, shopping, and getting expert assistance for your farming needs
              </p>

              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4 justify-center lg:justify-start">
                <Link to="/chat" className="w-full xs:w-auto">
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-cropsay-green hover:bg-cropsay-green/90 w-full xs:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Chatting
                  </Button>
                </Link>
                <Link to="/shop" className="w-full xs:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full xs:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium border-cropsay-green/30 hover:border-cropsay-green hover:bg-cropsay-green/10"
                  >
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-2/5 w-full max-w-sm lg:max-w-none">
              <div className="bg-gradient-to-br from-cropsay-darkSecondary to-cropsay-grayDark rounded-2xl p-3 sm:p-4 lg:p-6 shadow-xl">
                <div className="aspect-square relative overflow-hidden rounded-xl bg-gradient-to-br from-cropsay-green/20 to-cropsay-green/5 flex items-center justify-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl">🌾</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Features - Compact */}
      <div className="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-cropsay-dark/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <Link to={feature.link} key={index} className="group">
                <div className="bg-cropsay-darkSecondary rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 h-full transition-all duration-300 hover:shadow-lg hover:shadow-cropsay-green/10 hover:-translate-y-1 touch-target text-center">
                  <div className="mb-2 sm:mb-3 flex justify-center">{feature.icon}</div>
                  <h3 className="text-xs sm:text-sm lg:text-base font-semibold mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-cropsay-grayText text-xs sm:text-sm leading-relaxed hidden sm:block">
                    {feature.description}
                  </p>
                  <span className="text-cropsay-green group-hover:underline text-xs sm:text-sm font-medium hidden lg:inline">
                    Learn more →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-cropsay-darkSecondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                Featured Products
              </h2>
              <p className="text-cropsay-grayText text-sm">
                Fresh arrivals and top picks
              </p>
            </div>
            <Link to="/shop">
              <Button
                variant="ghost"
                className="text-cropsay-green hover:bg-cropsay-green/10 text-sm px-3 py-2 h-auto"
              >
                See all
                <ChevronRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          {/* Horizontal scroll for all screen sizes */}
          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex-shrink-0 w-44 sm:w-48">
                  <div className="bg-[#1c232d] rounded-2xl h-[260px] animate-pulse border border-[#2A3143]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {featuredProducts.map(product => (
                <div key={product.id} className="flex-shrink-0 w-44 sm:w-48">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Best Selling Products Section */}
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-cropsay-dark">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
                <Star className="text-cropsay-green mr-2" size={18} />
                Best Selling
              </h2>
              <p className="text-cropsay-grayText text-sm">
                Top rated by farmers
              </p>
            </div>
            <Link to="/shop">
              <Button
                variant="ghost"
                className="text-cropsay-green hover:bg-cropsay-green/10 text-sm px-3 py-2 h-auto"
              >
                See all
                <ChevronRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          {/* Horizontal scroll for all screen sizes */}
          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex-shrink-0 w-44 sm:w-48">
                  <div className="bg-[#1c232d] rounded-2xl h-[260px] animate-pulse border border-[#2A3143]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {bestSellingProducts.map(product => (
                <div key={product.id} className="flex-shrink-0 w-44 sm:w-48">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-cropsay-darkSecondary py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6 sm:mb-8 justify-center sm:justify-start">
            <Calendar className="text-cropsay-green mr-3" size={24} />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Seasonal Farming Calendar</h2>
          </div>

          <div className="bg-cropsay-dark rounded-xl p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="text-center p-3 sm:p-4 border border-cropsay-grayDark rounded-lg hover:border-cropsay-green/50 transition-colors">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Spring</h3>
                <p className="text-cropsay-grayText text-xs sm:text-sm">Planting season for rice and vegetables</p>
              </div>
              <div className="text-center p-3 sm:p-4 border border-cropsay-grayDark rounded-lg hover:border-cropsay-green/50 transition-colors">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Summer</h3>
                <p className="text-cropsay-grayText text-xs sm:text-sm">Maintenance and pest control</p>
              </div>
              <div className="text-center p-3 sm:p-4 border border-cropsay-grayDark rounded-lg hover:border-cropsay-green/50 transition-colors">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Autumn</h3>
                <p className="text-cropsay-grayText text-xs sm:text-sm">Harvest season for most crops</p>
              </div>
              <div className="text-center p-3 sm:p-4 border border-cropsay-grayDark rounded-lg hover:border-cropsay-green/50 transition-colors">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Winter</h3>
                <p className="text-cropsay-grayText text-xs sm:text-sm">Planning and soil preparation</p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 text-center">
              <Link to="/learn">
                <Button
                  variant="outline"
                  className="border-cropsay-green text-cropsay-green hover:bg-cropsay-green hover:text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                >
                  View Full Calendar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Courses/Learn Section */}
      <div className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 flex items-center">
                <BookOpen className="text-cropsay-green mr-2 sm:mr-3" size={20} />
                Learn & Grow
              </h2>
              <p className="text-cropsay-grayText text-sm sm:text-base">
                Enhance your farming skills with expert-led courses
              </p>
            </div>
            <Link to="/learn">
              <Button
                variant="outline"
                className="bg-transparent border-cropsay-green/30 text-cropsay-green hover:bg-cropsay-green hover:text-white text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                All Courses
                <ChevronRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-cropsay-darkSecondary rounded-lg sm:rounded-xl overflow-hidden border border-cropsay-grayDark hover:border-cropsay-green/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="h-32 sm:h-40 bg-gradient-to-br from-cropsay-green/20 to-cropsay-green/5 flex items-center justify-center">
                  <Video size={24} className="text-cropsay-green" />
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <span className="text-xs bg-cropsay-dark px-2 py-1 rounded text-cropsay-grayText">
                      {course.level}
                    </span>
                    <span className="text-xs text-cropsay-grayText">
                      {course.lessons} lessons
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-cropsay-grayText text-xs sm:text-sm mb-3">
                    by {course.instructor}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-cropsay-grayText">
                      {course.duration}
                    </span>
                    <Button
                      size="sm"
                      className="bg-cropsay-green hover:bg-cropsay-green/90 text-xs px-3 py-1"
                    >
                      Start Learning
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore/Trends Section */}
      <div className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-cropsay-darkSecondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 flex items-center">
                <TrendingUp className="text-cropsay-green mr-2 sm:mr-3" size={20} />
                Trending in Agriculture
              </h2>
              <p className="text-cropsay-grayText text-sm sm:text-base">
                Stay updated with the latest agricultural trends and insights
              </p>
            </div>
            <Link to="/explore">
              <Button
                variant="outline"
                className="bg-transparent border-cropsay-green/30 text-cropsay-green hover:bg-cropsay-green hover:text-white text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                Explore More
                <ChevronRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trends.map(trend => (
              <div
                key={trend.id}
                className="bg-cropsay-darkSecondary rounded-lg sm:rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-cropsay-green/30 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2">
                      {trend.topic}
                    </h3>
                    <span className="text-xs bg-cropsay-dark px-2 py-1 rounded text-cropsay-grayText">
                      {trend.category}
                    </span>
                  </div>
                  <span className="text-cropsay-green font-bold text-sm sm:text-base ml-2">
                    {trend.growth}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-cropsay-grayDark flex justify-between items-center">
                  <button className="text-xs sm:text-sm text-cropsay-green hover:underline">
                    Learn More
                  </button>
                  <button className="text-xs sm:text-sm text-cropsay-grayText hover:text-cropsay-lightText">
                    Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6 sm:mb-8 justify-center sm:justify-start">
            <Award className="text-cropsay-green mr-2 sm:mr-3" size={20} />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Success Stories</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-cropsay-darkSecondary rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-cropsay-green/20">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="text-2xl sm:text-3xl">{testimonial.avatar}</div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">{testimonial.name}</h3>
                    <p className="text-cropsay-grayText text-xs sm:text-sm">{testimonial.location}</p>
                  </div>
                </div>
                <p className="italic text-cropsay-grayText text-sm sm:text-base leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
