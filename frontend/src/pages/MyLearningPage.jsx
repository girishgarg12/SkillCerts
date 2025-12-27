import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, Clock, PlayCircle } from 'lucide-react';
import { enrollmentService } from '../services/enrollmentService';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';
import { CardContainer, CardBody, CardItem } from '../components/ui/3DCard';

export const MyLearningPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, [filter]);

  // Mock Data Definition Removed as we are using real backend

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const response = await enrollmentService.getMyEnrollments(status);
      setEnrollments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="bg-[#020617] min-h-screen text-[#f8fafc] pt-20 pb-12">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-slate-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-3">My Learning</h1>
          <p className="text-gray-400 text-lg">Continue your learning journey and master new skills</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'ongoing', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all text-sm whitespace-nowrap ${filter === f
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' && 'Courses'}
            </button>
          ))}
        </div>

        {/* Enrollments Grid */}
        {enrollments.length === 0 ? (
          <div className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No courses yet
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Explore our catalog to start learning.
            </p>
            <Link to="/courses">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20">
                Browse Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrollments.map((enrollment) => (
              <CardContainer key={enrollment._id} className="inter-var w-full h-full">
                <CardBody className="bg-[#1e293b]/40 relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-4 border border-white/10 transition-all duration-300 backdrop-blur-sm flex flex-col justify-between">
                  <Link to={`/courses/${enrollment.course._id}/learn`}>
                    <CardItem translateZ="50" className="w-full mt-2">
                      <div className="relative overflow-hidden rounded-xl aspect-video">
                        <img
                          src={enrollment.course.thumbnail || 'https://via.placeholder.com/400x225'}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover rounded-xl group-hover/card:shadow-xl group-hover/card:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                        </div>
                      </div>
                    </CardItem>
                  </Link>

                  <div className="mt-4 flex flex-col flex-grow">
                    <CardItem translateZ="60" className="text-xl font-bold text-[#f8fafc]">
                      <Link to={`/courses/${enrollment.course._id}/learn`} className="hover:text-blue-400 transition-colors line-clamp-2">
                        {enrollment.course.title}
                      </Link>
                    </CardItem>

                    {enrollment.course.instructor && (
                      <CardItem translateZ="40" className="text-slate-400 text-sm mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        By {enrollment.course.instructor.name}
                      </CardItem>
                    )}

                    <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
                      {enrollment.progress && (
                        <CardItem translateZ="30" className="w-full">
                          <div className="flex justify-between text-xs text-gray-400 mb-2">
                            <span>{Math.round(enrollment.progress.progressPercentage)}% Complete</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-slate-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${enrollment.progress.progressPercentage}%` }}
                            />
                          </div>
                        </CardItem>
                      )}

                      <CardItem translateZ="20" className="w-full">
                        <Link to={`/courses/${enrollment.course._id}/learn`} className="block">
                          <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/20 border-none">
                            Continue
                          </Button>
                        </Link>
                      </CardItem>
                    </div>
                  </div>
                </CardBody>
              </CardContainer>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
