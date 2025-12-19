import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Star, Users, Award, Play, Heart } from 'lucide-react';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import { reviewService } from '../services/reviewService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { formatCurrency, formatDuration } from '../lib/utils';
import { COURSE_LEVELS } from '../lib/constants';
import { useAuthStore } from '../store/authStore';

export const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseDetails();
    fetchReviews();
    if (isAuthenticated) {
      checkEnrollment();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await courseService.getCourse(id);
      setCourse(response.data);
    } catch (error) {
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getCourseReviews(id, { limit: 5 });
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await enrollmentService.checkEnrollment(id);
      setIsEnrolled(response.data.enrolled);
    } catch (error) {
      console.error('Failed to check enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // If it's a paid course, redirect to payment page
    if (!course.isFree) {
      navigate(`/payment/${id}`);
      return;
    }

    // For free courses, enroll directly
    setEnrolling(true);
    try {
      await enrollmentService.enrollCourse(id);
      setIsEnrolled(true);
      navigate('/my-learning');
    } catch (error) {
      setError(error.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error && !course) return <Alert variant="error">{error}</Alert>;
  if (!course) return <Alert variant="error">Course not found</Alert>;

  const levelColors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                {course.category && (
                  <Badge variant="primary">{course.category.name}</Badge>
                )}
                {course.level && (
                  <Badge variant={levelColors[course.level]}>
                    {COURSE_LEVELS[course.level]}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-gray-300 mb-6">{course.description}</p>
              
              <div className="flex items-center gap-6 text-sm">
                {course.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{course.rating.toFixed(1)}</span>
                    <span className="text-gray-400">({course.ratingCount} ratings)</span>
                  </div>
                )}
                
                {course.instructor && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">By</span>
                    <span className="font-medium">{course.instructor.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full rounded-lg mb-4"
                    />
                  )}
                  
                  <div className="text-3xl font-bold text-gray-900 mb-4">
                    {course.isFree ? 'Free' : formatCurrency(course.price)}
                  </div>

                  {isEnrolled ? (
                    <Button
                      onClick={() => navigate('/my-learning')}
                      className="w-full mb-3"
                    >
                      Go to Course
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full mb-3"
                    >
                      {enrolling ? 'Enrolling...' : course.isFree ? 'Enroll Now' : 'Buy Now'}
                    </Button>
                  )}

                  <Button variant="outline" className="w-full">
                    <Heart className="w-5 h-5 mr-2" />
                    Add to Wishlist
                  </Button>

                  <div className="mt-6 space-y-3 text-sm">
                    {course.totalDuration && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-5 h-5" />
                        <span>{formatDuration(course.totalDuration)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-gray-700">
                      <BookOpen className="w-5 h-5" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Award className="w-5 h-5" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review._id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {review.user?.name}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
