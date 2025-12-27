import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Edit, Trash2, Eye, EyeOff, MoreVertical, DollarSign, FileText } from 'lucide-react';
import { instructorService } from '../services/instructorService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { CardContainer, CardBody, CardItem } from '../components/ui/3DCard';
import { Alert } from '../components/ui/Alert';
import { formatCurrency } from '../lib/utils';
import { COURSE_LEVELS } from '../lib/constants';

export const InstructorDashboardPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const response = await instructorService.getMyCourses();
      setCourses(response.data || []);
    } catch (error) {
      setError('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    setActionLoading(courseId);
    try {
      await instructorService.togglePublish(courseId);
      // Update local state
      setCourses(courses.map(course =>
        course._id === courseId
          ? { ...course, published: !currentStatus }
          : course
      ));
    } catch (error) {
      setError('Failed to update course status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setActionLoading(courseId);
    try {
      await instructorService.deleteCourse(courseId);
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (error) {
      setError('Failed to delete course');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <PageLoader />;

  const publishedCount = courses.filter(c => c.published).length;
  const draftCount = courses.filter(c => !c.published).length;
  const totalRevenue = courses.reduce((sum, c) => sum + (c.price || 0), 0);

  return (
    <div className="bg-[#020617] min-h-screen text-[#f8fafc] pt-20 pb-12">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Instructor Dashboard</h1>
              <p className="text-gray-400">Manage your courses, track performance, and create new content</p>
            </div>
            <Link to="/instructor/courses/create">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                <Plus className="w-5 h-5 mr-2" />
                Create New Course
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Published', value: publishedCount, icon: Eye, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Drafts', value: draftCount, icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Total Portfolio Value', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-slate-400', bg: 'bg-slate-500/10' }
          ].map((stat, i) => (
            <CardContainer key={i} className="inter-var w-full h-full">
              <CardBody className="bg-white/5 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-6 border transition-all duration-300 backdrop-blur-sm">
                <CardItem translateZ="50" className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${i === 3 ? 'text-white' : stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 ${stat.bg} rounded-xl`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>
          ))}
        </div>

        {/* Courses List */}
        {courses.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No courses yet
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start creating courses and share your knowledge with students to earn revenue and build your reputation.
            </p>
            <Link to="/instructor/courses/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Course
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">My Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CardContainer key={course._id} className="inter-var w-full h-full">
                  <CardBody className="bg-[#1e293b]/40 relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-4 border border-white/10 transition-all duration-300 backdrop-blur-sm flex flex-col justify-between">
                    <div className="w-full">
                      <CardItem translateZ="50" className="w-full mt-2">
                        <div className="relative w-full h-48 rounded-xl overflow-hidden">
                          <img
                            src={course.thumbnail || 'https://via.placeholder.com/200x120'}
                            alt={course.title}
                            className="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-500"
                          />
                          {course.published ? (
                            <Badge className="absolute top-2 right-2 bg-green-500/90 text-white border-none shadow-lg">Published</Badge>
                          ) : (
                            <Badge className="absolute top-2 right-2 bg-yellow-500/90 text-black border-none shadow-lg">Draft</Badge>
                          )}
                        </div>
                      </CardItem>

                      <CardItem translateZ="60" className="mt-4">
                        <h3 className="text-xl font-bold text-[#f8fafc] line-clamp-1">
                          {course.title}
                        </h3>
                      </CardItem>

                      {course.description && (
                        <CardItem translateZ="40" className="mt-2">
                          <p className="text-neutral-400 text-sm line-clamp-2">
                            {course.description}
                          </p>
                        </CardItem>
                      )}

                      <CardItem translateZ="30" className="flex items-center gap-4 text-sm text-gray-400 mt-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="font-medium text-white">{course.isFree ? 'Free' : formatCurrency(course.price)}</span>
                        </div>
                        {course.category && (
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                            <span>{course.category.name}</span>
                          </div>
                        )}
                      </CardItem>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-white/10">
                      <div className="flex gap-2">
                        <CardItem translateZ="20" className="w-full">
                          <Link to={`/instructor/courses/${course._id}/edit`} className="w-full block">
                            <Button variant="outline" size="sm" className="w-full border-white/20 text-gray-300 hover:text-white hover:bg-white/10">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                        </CardItem>
                      </div>

                      <div className="flex gap-2">
                        <CardItem translateZ="20" className="w-1/2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(course._id, course.published)}
                            disabled={actionLoading === course._id}
                            className={`w-full ${course.published ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
                          >
                            {course.published ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-1" />
                                Unpub
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-1" />
                                Publish
                              </>
                            )}
                          </Button>
                        </CardItem>

                        <CardItem translateZ="20" className="w-1/2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCourse(course._id)}
                            disabled={actionLoading === course._id}
                            className="w-full text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </CardItem>
                      </div>
                    </div>
                  </CardBody>
                </CardContainer>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
