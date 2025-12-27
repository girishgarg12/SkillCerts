import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { wishlistService } from '../services/wishlistService';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { CourseCard } from '../components/course/CourseCard';

export const WishlistPage = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistService.getWishlist();
      setWishlist(response.data);
    } catch (error) {
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (course) => {
    const courseId = course._id || course.id;
    try {
      await wishlistService.removeFromWishlist(courseId);
      setWishlist({
        ...wishlist,
        courses: wishlist.courses.filter(c => c._id !== courseId)
      });
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  if (loading) return <PageLoader />;

  const courses = wishlist?.courses || [];

  return (
    <div className="bg-[#020617] min-h-screen text-[#f8fafc] pt-20 pb-12">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">My Wishlist</h1>
          <p className="text-gray-400">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} saved for later
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Wishlist Content */}
        {courses.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Your wishlist is empty
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Save courses you're interested in for later. Explore our catalog to find your next skill to master.
            </p>
            <Link to="/courses">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20">
                Browse Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onWishlistToggle={handleRemove}
                isInWishlist={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
