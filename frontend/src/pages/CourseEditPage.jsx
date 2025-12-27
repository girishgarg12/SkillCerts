import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Settings, Lightbulb } from 'lucide-react';
import { instructorService } from '../services/instructorService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { CurriculumBuilder } from '../components/instructor/CurriculumBuilder';
import { formatCurrency } from '../lib/utils';

export const CourseEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('curriculum'); // curriculum or settings

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getMyCourses();
      const foundCourse = response.data.find(c => c._id === id);

      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        setError('Course not found');
      }
    } catch (err) {
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 bg-[#020617] min-h-screen text-white">
        <Alert variant="error">{error}</Alert>
        <Button onClick={() => navigate('/instructor/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 bg-[#020617] min-h-screen text-white">
        <Alert variant="error">Course not found</Alert>
        <Button onClick={() => navigate('/instructor/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#020617] min-h-screen text-[#f8fafc] pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/instructor/dashboard"
            className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
              <div className="flex items-center gap-3">
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${course.isPublished ? 'bg-green-500/10 text-green-300 border-green-500/20' : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'}`}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </div>
                <span className="text-gray-400">
                  {course.isFree ? 'Free' : formatCurrency(course.price)}
                </span>
                {course.level && (
                  <span className="text-gray-400 capitalize bg-white/5 px-2 py-0.5 rounded text-sm border border-white/10">{course.level}</span>
                )}
              </div>
            </div>

            <Link to={`/instructor/courses/${id}/form`}>
              <Button variant="outline" className="border-white/10 text-gray-300 hover:text-white hover:bg-white/10">
                <Settings className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-white/10">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`pb-3 px-1 border-b-2 transition-all text-sm font-medium flex items-center gap-2 ${activeTab === 'curriculum'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
            >
              <BookOpen className="w-4 h-4" />
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 px-1 border-b-2 transition-all text-sm font-medium flex items-center gap-2 ${activeTab === 'settings'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'curriculum' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                  <h2 className="text-lg font-semibold text-white">Course Curriculum</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Organize your course content into sections and lectures.
                  </p>
                </div>
                <div className="p-6">
                  <CurriculumBuilder courseId={id} />
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-2xl overflow-hidden sticky top-24">
                <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-semibold text-yellow-200">Tips for Great Content</h2>
                </div>
                <div className="p-6">
                  <ul className="space-y-4 text-sm text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0"></span>
                      <span>Group related lectures into sections for better organization</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0"></span>
                      <span>Keep lectures concise (5-15 minutes is ideal)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0"></span>
                      <span>Mark one or two lectures as "Free Preview" to attract students</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0"></span>
                      <span>Add accurate video durations to help students plan their learning</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0"></span>
                      <span>Use clear, descriptive titles that tell students what they'll learn</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Settings className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Course Settings</h2>
                  <p className="text-gray-400">Manage course details, pricing, and media</p>
                </div>
              </div>

              <div className="space-y-4 text-gray-300 mb-8">
                <p>You can edit your course's basic information, including:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Course Title and Description</li>
                  <li>Category and Level</li>
                  <li>Thumbnail Image</li>
                  <li>Promotional Preview Video</li>
                  <li>Pricing and Currency</li>
                </ul>
              </div>

              <Link to={`/instructor/courses/${id}/form`}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                  Edit Course Details
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
