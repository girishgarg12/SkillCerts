import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Star, Users, Award, Play, Heart, ChevronDown, ChevronUp, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import { reviewService } from '../services/reviewService';
import { wishlistService } from '../services/wishlistService';
import { sectionService } from '../services/sectionService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { CertificateModal } from '../components/ui/CertificateModal';
import { formatCurrency, formatDuration } from '../lib/utils';
import { COURSE_LEVELS } from '../lib/constants';
import { useAuthStore } from '../store/authStore';
import { ReviewSection } from '../components/course/ReviewSection';
import { PaymentModal } from '../components/payment/PaymentModal';
import { SparklesCore } from '../components/ui/Sparkles';

export const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const reviewsRef = useRef(null);

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchCourseDetails();
    fetchSections();
    fetchReviews();
    if (isAuthenticated) {
      checkEnrollment();
      checkWishlistStatus();
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

  const fetchSections = async () => {
    try {
      const response = await sectionService.getCourseSections(id);
      setSections(response.data || []);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getCourseReviews(id, { limit: 10 });
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

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistService.checkWishlist(id);
      setIsInWishlist(response.data.inWishlist);
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Optimistic UI Update
    const previousState = isInWishlist;
    setIsInWishlist(!previousState);
    if (previousState) {
      toast.success('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }

    try {
      if (previousState) {
        await wishlistService.removeFromWishlist(id);
      } else {
        await wishlistService.addToWishlist(id);
      }
    } catch (error) {
      // Revert on failure
      setIsInWishlist(previousState);
      const action = previousState ? 'remove from' : 'add to';
      console.error(`Failed to ${action} wishlist:`, error);
      toast.error(error.message || `Failed to ${action} wishlist`);
      setError(error.message || `Failed to ${action} wishlist`);
    }
  };

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user is an instructor (Instructors should use learner accounts for buying)
    if (user?.role === 'instructor') {
      toast.error('Please create a learner account to buy this course.');
      return;
    }

    // Check if user is the instructor of this course (redundant but safe)
    if (user?._id === course?.instructor?._id || user?._id === course?.instructor) {
      toast.error('You created this course, you cannot buy it.');
      return;
    }

    setShowPaymentModal(true);
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
    <div className="bg-[#020617] text-[#f8fafc] min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_50%)] blur-[120px]" />
        <div className="absolute bottom-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.05),transparent_50%)] blur-[120px]" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                {course.category && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1 text-sm backdrop-blur-md">
                    {course.category.name}
                  </Badge>
                )}
                {course.level && (
                  <Badge variant={levelColors[course.level]} className="uppercase tracking-wide text-xs font-bold px-3 py-1">
                    {COURSE_LEVELS[course.level]}
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                {course.title}
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm md:text-base border-t border-white/10 pt-6">
                {course.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-white">{course.rating.toFixed(1)}</span>
                    <span className="text-gray-400">({course.ratingCount} ratings)</span>
                  </div>
                )}

                {course.instructor && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-slate-500 flex items-center justify-center font-bold">
                      {course.instructor.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs uppercase tracking-wider block">Created by</span>
                      <span className="font-medium text-white">{course.instructor.name}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>Last updated {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Right Sticky Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                  <div className="relative aspect-video overflow-hidden">
                    {course.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x225?text=Course+Image';
                        }}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-bold text-white">
                        {course.isFree ? 'Free' : formatCurrency(course.price)}
                      </div>
                      {!course.isFree && <span className="text-gray-400 line-through text-sm mb-1">{formatCurrency(course.price * 1.5)}</span>}
                    </div>

                    {isEnrolled ? (
                      <Button
                        onClick={() => navigate('/my-learning')}
                        className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                      >
                        Go to Course
                      </Button>
                    ) : (
                      <Button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full h-12 text-lg font-semibold bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10"
                      >
                        {enrolling ? 'Enrolling...' : course.isFree ? 'Enroll Now' : 'Buy Now'}
                      </Button>
                    )}

                    {!isEnrolled && (
                      <button
                        onClick={handleWishlistToggle}
                        className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                      </button>
                    )}

                    {isEnrolled && (
                      <button
                        onClick={scrollToReviews}
                        className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Star className="w-5 h-5" />
                        <span>Rate this Course</span>
                      </button>
                    )}

                    <div className="space-y-4 pt-6 border-t border-white/10">
                      <h4 className="font-semibold text-white">This course includes:</h4>
                      <ul className="space-y-3 text-sm text-gray-300">
                        {course.totalDuration && (
                          <li className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-500" />
                            <span>{formatDuration(course.totalDuration)} on-demand video</span>
                          </li>
                        )}
                        <li className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-gray-500" />
                          <span>Full lifetime access</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-gray-500" />
                          <span>Access on mobile and TV</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-gray-500" />
                          <span>Certificate of completion</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      {sections.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            <div className="lg:col-span-2 space-y-12">

              {/* What you'll learn */}
              {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold text-white mb-6">What you{`'`}ll learn</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.learningOutcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Content */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>
                <div className="mb-4 text-sm text-gray-400">
                  {sections.length} sections • {sections.reduce((acc, s) => acc + (s.lectures?.length || 0), 0)} lectures
                </div>

                <div className="space-y-3">
                  {sections.map((section) => (
                    <div key={section._id} className="border border-white/10 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section._id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-blue-400" />
                          <div className="text-left">
                            <h3 className="font-semibold text-white">{section.title}</h3>
                            <p className="text-sm text-gray-400">
                              {section.lectures?.length || 0} lectures
                            </p>
                          </div>
                        </div>
                        {expandedSections.has(section._id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {/* Section Lectures */}
                      {expandedSections.has(section._id) && section.lectures && section.lectures.length > 0 && (
                        <div className="border-t border-white/10 bg-black/20">
                          {section.lectures.map((lecture, index) => (
                            <div
                              key={lecture._id}
                              className="px-6 py-3 flex items-center justify-between border-b border-white/5 last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                {lecture.isPreview ? (
                                  <Play className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <Lock className="w-4 h-4 text-gray-500" />
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-200">
                                      {index + 1}. {lecture.title}
                                    </span>
                                    {lecture.isPreview && (
                                      <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">Free Preview</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                {lecture.duration && (
                                  <>
                                    <Clock className="w-3 h-3" />
                                    {formatDuration(lecture.duration)}
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Requirements</h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-300">
                    {course.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certification Section */}
              <div className="bg-gradient-to-br from-slate-900/40 to-[#020617] border border-blue-500/20 rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-full">
                    <Award className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Professional Certification</h2>
                    <p className="text-gray-300 mb-4">
                      Upon completing this course, you will receive a verifiable digital certificate. This can be added to your LinkedIn profile, resume, or portfolio to validate your skills to potential employers.
                    </p>
                    <Button
                      variant="outline"
                      className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
                      onClick={() => setShowCertificatePreview(true)}
                    >
                      View Sample Certificate
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div ref={reviewsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 border-t border-white/10 mt-12">
        <ReviewSection
          courseId={id}
          reviews={reviews}
          userReview={reviews.find(r => r.user?._id === user?._id)}
          isEnrolled={isEnrolled}
          onReviewSubmitted={fetchReviews}
        />
      </div>

      {showCertificatePreview && (
        <CertificateModal
          certificateData={{
            userName: user?.name || "John Doe",
            courseTitle: course.title,
            completionDate: new Date().toISOString(),
            certificateId: "SAMPLE-CERT-123456",
            instructorName: course.instructor?.name || "Instructor Name"
          }}
          onClose={() => setShowCertificatePreview(false)}
        />
      )}

      {course && (
        <PaymentModal
          course={course}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          user={user}
        />
      )}
    </div>
  );
};
