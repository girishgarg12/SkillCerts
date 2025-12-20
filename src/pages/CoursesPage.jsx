import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseService } from '../services/courseService';
import { categoryService } from '../services/categoryService';
import { wishlistService } from '../services/wishlistService';
import { CourseGrid } from '../components/course/CourseGrid';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { COURSE_LEVELS } from '../lib/constants';
import { useAuthStore } from '../store/authStore';

export const CoursesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    isFree: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await wishlistService.getWishlist();
      const ids = response.data.courses?.map(c => c._id) || [];
      setWishlistIds(ids);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const handleWishlistToggle = async (course) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const courseId = course._id || course.id;
    const isInWishlist = wishlistIds.includes(courseId);

    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(courseId);
        setWishlistIds(wishlistIds.filter(id => id !== courseId));
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(courseId);
        setWishlistIds([...wishlistIds, courseId]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.level) params.level = filters.level;
      if (filters.category) params.category = filters.category;
      if (filters.isFree) params.isFree = filters.isFree;
      if (filters.search) params.search = filters.search;

      const response = await courseService.getAllCourses(params);
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({ level: '', category: '', isFree: '', search: '' });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-black min-h-screen text-white pt-32 pb-12">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 mb-4">Explore Our Courses</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Discover a world of knowledge with our expertly curated courses.</p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-12 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-indigo-300">
              <SlidersHorizontal className="w-5 h-5" />
              <span className="font-semibold">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">{activeFiltersCount}</Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              {activeFiltersCount > 0 && (
                <button 
                  onClick={clearFilters}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden text-gray-300 hover:text-white hover:bg-white/5"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${showFilters || 'hidden md:grid'}`}>
            {/* Search */}
            <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
                />
            </div>

            {/* Level Filter */}
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all appearance-none"
            >
              <option value="">All Levels</option>
              {Object.entries(COURSE_LEVELS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Price Filter */}
            <select
              value={filters.isFree}
              onChange={(e) => handleFilterChange('isFree', e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all appearance-none"
            >
              <option value="">All Prices</option>
              <option value="true">Free</option>
              <option value="false">Paid</option>
            </select>
          </div>
        </div>

        {/* Course Grid */}
        <CourseGrid 
          courses={courses} 
          loading={loading} 
          onWishlistToggle={handleWishlistToggle}
          wishlistIds={wishlistIds}
        />
      </div>
    </div>
  );
};
