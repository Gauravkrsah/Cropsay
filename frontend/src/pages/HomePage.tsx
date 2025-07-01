
import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ShoppingBag, BookOpen, Users, Award, Calendar, Star, TrendingUp, ChevronRight, Video, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/data/productData';
import { fetchProducts, getNewestProducts, getBestSellingProducts } from '@/services/productService';
import { testSupabaseConnection } from '@/utils/testSupabase';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real products from Supabase with robust fallback
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        console.log('Loading products for homepage...');

        // Always load demo products as fallback first
        const { products: demoProducts } = await import('@/data/productData');
        const demoFeatured = demoProducts.slice(0, 12);
        const demoBestSelling = demoProducts
          .filter(product => product.rating > 4.0)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 8);

        // Test Supabase connection
        const connectionTest = await testSupabaseConnection();

        if (connectionTest) {
          try {
            // Try to get products from database
            const newest = await getNewestProducts(12);
            const bestSelling = await getBestSellingProducts(8);
            const allProducts = await fetchProducts();

            if (newest.length > 0 || bestSelling.length > 0 || allProducts.length > 0) {
              // Use database products if available
              setFeaturedProducts(newest.length > 0 ? newest : demoFeatured);
              setBestSellingProducts(bestSelling.length > 0 ? bestSelling : demoBestSelling);
            } else {
              // Use demo products if database is empty
              setFeaturedProducts(demoFeatured);
              setBestSellingProducts(demoBestSelling);
            }
          } catch (dbError) {
            console.error('Database error, using demo products:', dbError);
            setFeaturedProducts(demoFeatured);
            setBestSellingProducts(demoBestSelling);
          }
        } else {
          // Connection failed, use demo products
          setFeaturedProducts(demoFeatured);
          setBestSellingProducts(demoBestSelling);
        }

      } catch (error) {
        console.error('Critical error loading products:', error);

        // Last resort: try to load demo products
        try {
          const { products: demoProducts } = await import('@/data/productData');
          const demoFeatured = demoProducts.slice(0, 12);
          const demoBestSelling = demoProducts
            .filter(product => product.rating > 4.0)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 8);

          setFeaturedProducts(demoFeatured);
          setBestSellingProducts(demoBestSelling);
        } catch (fallbackError) {
          console.error('Even demo products failed:', fallbackError);
          setFeaturedProducts([]);
          setBestSellingProducts([]);
        }
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
      thumbnail: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 2,
      title: "Advanced Crop Rotation Strategies",
      instructor: "Prof. Michael Singh",
      lessons: 8,
      duration: "3 weeks",
      level: "Intermediate",
      thumbnail: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 3,
      title: "Agricultural Business Management",
      instructor: "Elizabeth Wang",
      lessons: 15,
      duration: "6 weeks",
      level: "Advanced",
      thumbnail: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
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
      {/* Hero Section - Compact Design with YouTube Video */}
      <div className="bg-gradient-to-br from-cropsay-darkSecondary via-cropsay-dark to-cropsay-darkSecondary py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 hero-compact">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-3 sm:space-y-4 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                <span className="text-cropsay-green">Grow Better</span> with Cropsay
              </h1>
              <p className="text-sm sm:text-base text-cropsay-grayText max-w-xl mx-auto lg:mx-0 leading-relaxed line-clamp-3 lg:line-clamp-none">
                Your complete agricultural platform for learning, shopping, and getting expert assistance for your farming needs
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2">
                <Link to="/chat" className="w-full sm:w-auto">
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-cropsay-green hover:bg-cropsay-green/90 w-full sm:w-auto px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Chatting
                  </Button>
                </Link>
                <Link to="/shop" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-6 py-3 text-base font-medium border-cropsay-green/30 hover:border-cropsay-green hover:bg-cropsay-green/10"
                  >
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content - YouTube Video */}
            <div className="w-full mt-2 sm:mt-0">
              <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-xl sm:shadow-2xl bg-cropsay-darkSecondary/50 backdrop-blur-sm border border-cropsay-green/20">
                <div className="aspect-video">
                  <iframe
                    src="https://www.youtube.com/embed/gxAaO2rsdIs"
                    title="Cropsay AI - Revolutionary Agricultural Platform"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                {/* Video overlay for branding */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-xs sm:text-sm font-medium">
                      See Cropsay in Action
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Features - Compact Mobile Design */}
      <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8 bg-cropsay-dark/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {features.map((feature, index) => (
              <Link to={feature.link} key={index} className="group">
                <div className="bg-cropsay-darkSecondary rounded-lg p-3 sm:p-4 h-full transition-all duration-300 hover:shadow-lg hover:shadow-cropsay-green/10 hover:-translate-y-1 border border-cropsay-green/10 hover:border-cropsay-green/30">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 bg-cropsay-green/10 rounded-lg">
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold mb-1 text-white truncate">
                        {feature.title}
                      </h3>
                      <p className="text-cropsay-grayText text-xs sm:text-sm line-clamp-2">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8 bg-cropsay-darkSecondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-left">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">
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
            <div className="product-scroll">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="w-40 sm:w-44">
                  <div className="bg-[#1c232d] rounded-2xl h-[260px] animate-pulse border border-[#2A3143]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="product-scroll">
              {featuredProducts.map(product => (
                <div key={product.id} className="w-40 sm:w-44">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Best Selling Products Section */}
      <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8 bg-cropsay-dark">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-left">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center mb-1">
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
            <div className="product-scroll">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="w-40 sm:w-44">
                  <div className="bg-[#1c232d] rounded-2xl h-[260px] animate-pulse border border-[#2A3143]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="product-scroll">
              {bestSellingProducts.map(product => (
                <div key={product.id} className="w-40 sm:w-44">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Section - Compact */}
      <div className="bg-cropsay-darkSecondary py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4 sm:mb-6 text-left">
            <Calendar className="text-cropsay-green mr-2" size={20} />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Seasonal Farming Calendar</h2>
          </div>

          <div className="bg-cropsay-dark rounded-xl p-4 sm:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 border border-cropsay-grayDark rounded-lg hover:border-cropsay-green/50 transition-colors">
                <h3 className="font-semibold mb-1 text-sm">Spring</h3>
                <p className="text-cropsay-grayText text-xs">Planting season</p>
              </div>
              <div className="text-center p-3 border border-cropsay-grayDark rounded-lg hover:border-cropsay-green/50 transition-colors">
                <h3 className="font-semibold mb-1 text-sm">Summer</h3>
                <p className="text-cropsay-grayText text-xs">Maintenance</p>
              </div>
              <div className="text-center p-3 border border-cropsay-grayDark rounded-lg hover:border-cropsay-green/50 transition-colors">
                <h3 className="font-semibold mb-1 text-sm">Autumn</h3>
                <p className="text-cropsay-grayText text-xs">Harvest season</p>
              </div>
              <div className="text-center p-3 border border-cropsay-grayDark rounded-lg hover:border-cropsay-green/50 transition-colors">
                <h3 className="font-semibold mb-1 text-sm">Winter</h3>
                <p className="text-cropsay-grayText text-xs">Planning</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 text-center">
              <Link to="/learn">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-cropsay-green text-cropsay-green hover:bg-cropsay-green hover:text-white px-4 py-2 text-sm"
                >
                  View Full Calendar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Courses/Learn Section */}
      <div className="py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="text-left">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 flex items-center">
                <BookOpen className="text-cropsay-green mr-2" size={18} />
                Learn & Grow
              </h2>
              <p className="text-cropsay-grayText text-sm">
                Enhance your farming skills with expert-led courses
              </p>
            </div>
            <Link to="/learn">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-cropsay-green/30 text-cropsay-green hover:bg-cropsay-green hover:text-white text-xs px-3 py-2"
              >
                All Courses
                <ChevronRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map(course => (
              <div key={course.id} className="bg-cropsay-darkSecondary rounded-lg overflow-hidden border border-cropsay-grayDark/50">
                <div className="relative aspect-video overflow-hidden">
                  {/* Course Thumbnail */}
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  
                  {/* Fallback gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cropsay-green/20 to-cropsay-green/5 hidden flex items-center justify-center">
                    <Video size={16} className="text-cropsay-green" />
                  </div>
                  
                  {/* Level Badge */}
                  <div className="absolute top-2 left-2 bg-cropsay-green text-white text-xs px-2 py-1 rounded font-medium">
                    {course.level}
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {course.duration}
                  </div>
                </div>
                
                {/* Compact Content Container */}
                <div className="p-3">
                  {/* Title */}
                  <h3 className="font-medium text-sm mb-2 text-white line-clamp-2 leading-tight">
                    {course.title}
                  </h3>
                  
                  {/* Instructor - Compact */}
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-cropsay-green rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        {course.instructor.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <p className="text-xs text-cropsay-grayText truncate">
                      {course.instructor}
                    </p>
                  </div>
                  
                  {/* Course Stats - Compact */}
                  <div className="flex items-center justify-between text-xs text-cropsay-grayText mb-3">
                    <span>{course.lessons} lessons</span>
                    <span>{course.duration}</span>
                  </div>
                  
                  {/* Compact Start Learning Button */}
                  <button className="w-full bg-cropsay-green text-white py-2 px-3 rounded text-xs font-medium">
                    Start Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore/Trends Section */}
      <div className="py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 bg-cropsay-darkSecondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="text-left">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 flex items-center">
                <TrendingUp className="text-cropsay-green mr-2" size={18} />
                Trending in Agriculture
              </h2>
              <p className="text-cropsay-grayText text-sm">
                Stay updated with the latest agricultural trends and insights
              </p>
            </div>
            <Link to="/explore">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-cropsay-green/30 text-cropsay-green hover:bg-cropsay-green hover:text-white text-xs px-3 py-2"
              >
                Explore More
                <ChevronRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trends.map(trend => (
              <div
                key={trend.id}
                className="bg-cropsay-darkSecondary rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-cropsay-green/30 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {trend.topic}
                    </h3>
                    <span className="text-xs bg-cropsay-dark px-2 py-1 rounded text-cropsay-grayText">
                      {trend.category}
                    </span>
                  </div>
                  <span className="text-cropsay-green font-bold text-sm ml-2">
                    {trend.growth}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-cropsay-grayDark flex justify-between items-center">
                  <button className="text-xs text-cropsay-green hover:underline">
                    Learn More
                  </button>
                  <button className="text-xs text-cropsay-grayText hover:text-cropsay-lightText">
                    Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4 sm:mb-6 text-left">
            <Award className="text-cropsay-green mr-2" size={18} />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Success Stories</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-cropsay-darkSecondary rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-cropsay-green/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <h3 className="font-semibold text-sm">{testimonial.name}</h3>
                    <p className="text-cropsay-grayText text-xs">{testimonial.location}</p>
                  </div>
                </div>
                <p className="italic text-cropsay-grayText text-sm leading-relaxed">
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
