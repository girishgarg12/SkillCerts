import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchCourseDetails();
    fetchSections();
    fetchReviews();
    if (isAuthenticated) {
      checkEnrollment();
      checkWishlistStatus();
    }
  }, [id]);

  // Mock Data Details (Frontend Only)
  const mockCourseDetails = {
    'mock-1': { _id: 'mock-1', title: 'Advanced Full Stack Web Development', description: 'Master MERN stack with modern practices and cloud deployment. This comprehensive course takes you from basic React concepts to advanced server-side rendering and database optimization.', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop', level: 'advanced', price: 1999, isFree: false, rating: 4.8, ratingCount: 124, totalDuration: 4500, instructor: { name: 'Sarah Wilson', _id: 'mock-inst-1' }, published: true, learningOutcomes: ['Build scalable web applications', 'Master React.js and Node.js', 'Deploy to AWS and Vercel', 'Implement secure authentication'], requirements: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals'] },
    'mock-2': { _id: 'mock-2', title: 'UI/UX Design Masterclass 2024', description: 'Design beautiful interfaces and user experiences like a pro.', thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop', level: 'beginner', price: 2499, isFree: false, rating: 4.9, ratingCount: 89, totalDuration: 3200, instructor: { name: 'Alex Rivera', _id: 'mock-inst-2' }, published: true, learningOutcomes: ['Master Figma and Adobe XD', 'Understand User Psychology', 'Create High-Fidelity Prototypes'], requirements: ['No prior experience needed'] },
    'mock-3': { _id: 'mock-3', title: 'Python for Data Science & AI', description: 'Zero to Hero in Python, Pandas, and Machine Learning concepts.', thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop', level: 'intermediate', price: 1499, isFree: false, rating: 4.7, ratingCount: 210, totalDuration: 5200, instructor: { name: 'David Chen', _id: 'mock-inst-3' }, published: true, learningOutcomes: ['Data Analysis with Pandas', 'Machine Learning Algorithms', 'Deep Learning Basics'], requirements: ['Basic Math knowledge'] },
    'mock-4': { _id: 'mock-4', title: 'Mobile App Dev with React Native', description: 'Build native iOS and Android apps with a single codebase.', thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop', level: 'intermediate', price: 1899, isFree: false, rating: 4.6, ratingCount: 156, totalDuration: 4100, instructor: { name: 'Emily Davis', _id: 'mock-inst-4' }, published: true, learningOutcomes: ['React Native Hooks', 'Native Device Features', 'Publishing to App Stores'], requirements: ['React Basics'] },
    'mock-5': { _id: 'mock-5', title: 'Digital Marketing & SEO Strategy', description: 'Grow your business with proven digital marketing techniques.', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop', level: 'beginner', price: 999, isFree: false, rating: 4.5, ratingCount: 312, totalDuration: 2800, instructor: { name: 'Mark Johnson', _id: 'mock-inst-5' }, published: true, learningOutcomes: ['SEO Optimization', 'Social Media Marketing', 'Email Campaigns'], requirements: ['None'] },
    'mock-6': { _id: 'mock-6', title: 'DevOps & Cloud Infrastructure', description: 'Learn Docker, Kubernetes, and AWS deployment pipelines.', thumbnail: '/devops.png', level: 'advanced', price: 2999, isFree: false, rating: 4.9, ratingCount: 56, totalDuration: 6200, instructor: { name: 'James Carter', _id: 'mock-inst-6' }, published: true, learningOutcomes: ['CI/CD Pipelines', 'Container Orchestration', 'Infrastructure as Code'], requirements: ['Linux Basics', 'Networking Fundamentals'] },
    'mock-7': { _id: 'mock-7', title: 'Blender 3D Modeling Bootcamp', description: 'Create stunning 3D models and animations from scratch.', thumbnail: 'https://images.unsplash.com/photo-1626379953822-baec19c3accd?q=80&w=2070&auto=format&fit=crop', level: 'beginner', price: 1299, isFree: false, rating: 4.8, ratingCount: 178, totalDuration: 3600, instructor: { name: 'Lisa Wong', _id: 'mock-inst-7' }, published: true, learningOutcomes: ['3D Modeling Techniques', 'Texturing and Shading', 'Animation Basics'], requirements: ['A computer with decent GPU'] },
    'mock-8': { _id: 'mock-8', title: 'Cybersecurity Fundamentals', description: 'Protect systems and networks from digital attacks.', thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop', level: 'intermediate', price: 2299, isFree: false, rating: 4.7, ratingCount: 92, totalDuration: 3900, instructor: { name: 'Robert Fox', _id: 'mock-inst-8' }, published: true, learningOutcomes: ['Network Security', 'Ethical Hacking', 'Risk Management'], requirements: ['Basic IT knowledge'] },
  };

  const fetchCourseDetails = async () => {
    try {
      if (id.startsWith('mock-')) {
        // Load mock data instantly
        const mockData = mockCourseDetails[id];
        if (mockData) {
            setCourse(mockData);
            setLoading(false);
            return;
        }
      }
      
      const response = await courseService.getCourse(id);
      setCourse(response.data);
    } catch (error) {
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    if (id.startsWith('mock-')) {
        // Return dummy sections for mock courses
        setSections([
            { _id: 'sec-1', title: 'Section 1: Introduction', lectures: [{ _id: 'l-1', title: 'Welcome to the Course', duration: 300, isPreview: true }, { _id: 'l-2', title: 'Course Overview', duration: 450, isPreview: false }] },
            { _id: 'sec-2', title: 'Section 2: Core Concepts', lectures: [{ _id: 'l-3', title: 'Fundamental Theory', duration: 1200, isPreview: false }, { _id: 'l-4', title: 'Hands-on Practice', duration: 1800, isPreview: false }] }
        ]);
        return;
    }

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

    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(id);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(id);
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      toast.error(error.message || 'Failed to update wishlist');
      setError(error.message || 'Failed to update wishlist');
    }
  };

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login');
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
    <div className="bg-black text-white min-h-screen relative overflow-hidden">
       {/* Background Effects */}
       <div className="fixed inset-0 z-0 pointer-events-none">
           <div className="w-full absolute inset-0 h-screen">
                <SparklesCore
                    id="tsparticlesdetailpage"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={100}
                    className="w-full h-full"
                    particleColor="#FFFFFF"
                />
           </div>
           <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_50%)] blur-[100px]" />
           <div className="absolute bottom-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15),transparent_50%)] blur-[100px]" />
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold">
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
                              className="w-full h-12 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
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
                                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-pink-500 text-pink-500' : ''}`} />
                                <span>{isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
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
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
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
                                  <BookOpen className="w-5 h-5 text-purple-400" />
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
                                          <Play className="w-4 h-4 text-purple-400" />
                                        ) : (
                                          <Lock className="w-4 h-4 text-gray-500" />
                                        )}
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-200">
                                              {index + 1}. {lecture.title}
                                            </span>
                                            {lecture.isPreview && (
                                              <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">Free Preview</Badge>
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
                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-8">
                     <div className="flex items-start gap-4">
                         <div className="bg-purple-500/20 p-3 rounded-full">
                             <Award className="w-8 h-8 text-purple-400" />
                         </div>
                         <div>
                             <h2 className="text-2xl font-bold text-white mb-2">Professional Certification</h2>
                             <p className="text-gray-300 mb-4">
                                 Upon completing this course, you will receive a verifiable digital certificate. This can be added to your LinkedIn profile, resume, or portfolio to validate your skills to potential employers.
                             </p>
                             <Button 
                                variant="outline" 
                                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 border-t border-white/10 mt-12">
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
