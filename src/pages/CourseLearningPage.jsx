import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  CheckCircle, 
  Lock, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Clock,
  Award
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { progressService } from '../services/progressService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { formatDuration } from '../lib/utils';

export const CourseLearningPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details and progress
      const [courseRes, progressRes] = await Promise.all([
        courseService.getCourse(id),
        progressService.getProgress(id),
      ]);

      setCourse(courseRes.data);
      setProgress(progressRes.data);

      // Fetch sections with lectures (you'll need to add this API endpoint)
      // For now, using mock data structure
      const mockSections = [
        {
          _id: '1',
          title: 'Introduction',
          order: 1,
          lectures: [
            { _id: 'l1', title: 'Welcome to the Course', duration: 300, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 1 },
            { _id: 'l2', title: 'Course Overview', duration: 420, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 2 },
          ]
        },
        {
          _id: '2',
          title: 'Getting Started',
          order: 2,
          lectures: [
            { _id: 'l3', title: 'Setting Up Your Environment', duration: 600, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 1 },
            { _id: 'l4', title: 'First Steps', duration: 480, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 2 },
          ]
        }
      ];

      setSections(mockSections);
      
      // Set first lecture as current
      if (mockSections[0]?.lectures[0]) {
        setCurrentLecture(mockSections[0].lectures[0]);
      }

      // Expand first section by default
      setExpandedSections({ '1': true });
    } catch (error) {
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleLectureClick = (lecture) => {
    setCurrentLecture(lecture);
  };

  const handleMarkComplete = async () => {
    if (!currentLecture) return;

    try {
      await progressService.markLectureComplete(currentLecture._id);
      
      // Update progress state
      setProgress(prev => ({
        ...prev,
        completedLectures: [...(prev?.completedLectures || []), currentLecture._id]
      }));

      // Move to next lecture
      const allLectures = sections.flatMap(s => s.lectures);
      const currentIndex = allLectures.findIndex(l => l._id === currentLecture._id);
      if (currentIndex < allLectures.length - 1) {
        setCurrentLecture(allLectures[currentIndex + 1]);
      }
    } catch (error) {
      console.error('Failed to mark lecture complete:', error);
    }
  };

  const isLectureCompleted = (lectureId) => {
    return progress?.completedLectures?.includes(lectureId);
  };

  if (loading) return <PageLoader />;
  if (error) return <Alert variant="error">{error}</Alert>;
  if (!course) return <Alert variant="error">Course not found</Alert>;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main Content - Video Player */}
      <div className="flex-1 flex flex-col">
        {/* Video Player */}
        <div className="bg-black aspect-video">
          {currentLecture ? (
            <iframe
              src={currentLecture.videoUrl}
              title={currentLecture.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a lecture to start learning</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Controls */}
        <div className="bg-gray-800 text-white p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">
                  {currentLecture?.title || 'No lecture selected'}
                </h2>
                <p className="text-sm text-gray-400">
                  {course.title}
                </p>
              </div>
              
              {currentLecture && (
                <Button
                  onClick={handleMarkComplete}
                  disabled={isLectureCompleted(currentLecture._id)}
                  variant={isLectureCompleted(currentLecture._id) ? 'secondary' : 'primary'}
                >
                  {isLectureCompleted(currentLecture._id) ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      Mark Complete
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            {progress && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Course Progress</span>
                  <span>{Math.round(progress.progressPercentage || 0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progressPercentage || 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Course Content */}
      <div className="w-96 bg-white overflow-y-auto border-l border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-1">Course Content</h3>
          <p className="text-sm text-gray-600">
            {sections.length} sections • {sections.reduce((acc, s) => acc + s.lectures.length, 0)} lectures
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {sections.map((section) => (
            <div key={section._id}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section._id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">{section.title}</h4>
                    <p className="text-sm text-gray-600">
                      {section.lectures.length} lectures
                    </p>
                  </div>
                </div>
                {expandedSections[section._id] ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Lectures List */}
              {expandedSections[section._id] && (
                <div className="bg-gray-50">
                  {section.lectures.map((lecture) => {
                    const isCompleted = isLectureCompleted(lecture._id);
                    const isCurrent = currentLecture?._id === lecture._id;

                    return (
                      <button
                        key={lecture._id}
                        onClick={() => handleLectureClick(lecture)}
                        className={`w-full px-4 py-3 pl-12 flex items-center justify-between hover:bg-gray-100 transition-colors ${
                          isCurrent ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Play className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={`text-sm text-left ${
                            isCurrent ? 'font-medium text-blue-600' : 'text-gray-700'
                          }`}>
                            {lecture.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDuration(lecture.duration)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Completion CTA */}
        {progress?.progressPercentage === 100 && (
          <div className="p-4 bg-green-50 border-t border-green-200">
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">
                  Congratulations! 🎉
                </h4>
                <p className="text-sm text-green-800 mb-3">
                  You've completed this course
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate('/certificates')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  View Certificate
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
