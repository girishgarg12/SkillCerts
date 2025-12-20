import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Play, 
  CheckCircle, 
  Lock, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Clock,
  Award,
  Home,
  Library,
  LayoutDashboard,
  X,
  Menu,
  PlayCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { courseService } from '../services/courseService';
import { progressService } from '../services/progressService';
import { sectionService } from '../services/sectionService';
import { certificateService } from '../services/certificateService';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { formatDuration } from '../lib/utils';
import { CertificateModal } from '../components/ui/CertificateModal';

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
  const [showSidebar, setShowSidebar] = useState(true);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      if (id.startsWith('mock-')) {
          // Mock Data Handling
          const mockTitle = {
            'mock-1': 'Advanced Full Stack Web Development',
            'mock-2': 'UI/UX Design Masterclass 2024',
            'mock-3': 'Python for Data Science & AI',
            'mock-4': 'Mobile App Dev with React Native',
            'mock-5': 'Digital Marketing & SEO Strategy',
            'mock-6': 'DevOps & Cloud Infrastructure',
            'mock-7': 'Blender 3D Modeling Bootcamp',
            'mock-8': 'Cybersecurity Fundamentals'
          }[id] || 'Demo Course';

          setCourse({ _id: id, title: mockTitle, instructor: { name: 'Demo Instructor' } });
          
          const mockSections = [
              { _id: 'sec-1', title: 'Introduction', lectures: [{ _id: 'l-1', title: 'Welcome', duration: 300, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }, { _id: 'l-2', title: 'Setup', duration: 450, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }] },
              { _id: 'sec-2', title: 'Core Concepts', lectures: [{ _id: 'l-3', title: 'Deep/Dive', duration: 600, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }] }
          ];
          setSections(mockSections);
          setCurrentLecture(mockSections[0].lectures[0]);
          setExpandedSections({ 'sec-1': true });

          // Load progress from localStorage
          const localProgress = JSON.parse(localStorage.getItem(`progress-${id}`) || '{"completedLectures": [], "progressPercentage": 0}');
          setProgress(localProgress);
          
          if (localProgress.progressPercentage === 100) {
              setHasCertificate(true);
          }
          setLoading(false);
          return;
      }

      // Real Data Handling
      const [courseRes, progressRes, sectionsRes] = await Promise.all([
        courseService.getCourse(id),
        progressService.getCourseProgress(id),
        sectionService.getCourseSections(id),
      ]);

      setCourse(courseRes.data);
      setProgress(progressRes.data);
      setSections(sectionsRes.data);
      
      // Set first lecture as current
      if (sectionsRes.data[0]?.lectures[0]) {
        setCurrentLecture(sectionsRes.data[0].lectures[0]);
      }

      // Expand first section by default
      if (sectionsRes.data[0]?._id) {
        setExpandedSections({ [sectionsRes.data[0]._id]: true });
      }

      // Check if certificate exists or needs to be generated
      if (progressRes.data.progressPercentage === 100) {
        checkAndGenerateCertificate();
      }
    } catch (error) {
      console.error('Failed to load course:', error);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const checkAndGenerateCertificate = async () => {
    if (id.startsWith('mock-')) return; // Skip for mocks

    try {
      // Try to get existing certificate
      const certResponse = await certificateService.getCertificate(id);
      if (certResponse.data) {
        setHasCertificate(true);
      }
    } catch (error) {
      // Certificate doesn't exist, generate it
      if (error.response?.status === 404) {
        await generateCertificate();
      }
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

    if (id.startsWith('mock-')) {
        // Mock Progress Handling
        const newCompleted = isLectureCompleted(currentLecture._id) 
            ? progress.completedLectures.filter(lid => lid !== currentLecture._id)
            : [...(progress.completedLectures || []), currentLecture._id];
        
        const totalLectures = sections.reduce((acc, s) => acc + s.lectures.length, 0);
        const percentage = (newCompleted.length / totalLectures) * 100;

        const newProgress = {
            completedLectures: newCompleted,
            progressPercentage: percentage,
            completedCount: newCompleted.length,
            totalLectures
        };

        localStorage.setItem(`progress-${id}`, JSON.stringify(newProgress));
        setProgress(newProgress);

        if (!isLectureCompleted(currentLecture._id)) {
            toast.success('Lecture marked as complete!');
            const allLectures = sections.flatMap(s => s.lectures);
            const currentIndex = allLectures.findIndex(l => l._id === currentLecture._id);
            if (currentIndex < allLectures.length - 1) {
                setCurrentLecture(allLectures[currentIndex + 1]);
            }

            if (percentage === 100) {
                setHasCertificate(true);
                toast.success('Course Completed! Certificate Unlocked 🎉');
            }
        }
        return;
    }

    try {
      const response = await progressService.toggleLectureCompletion(id, currentLecture._id);
      
      // Update progress state with response
      setProgress({
        ...progress,
        completedLectures: response.data.progress.completedLectures,
        progressPercentage: response.data.progress.progressPercentage,
      });

      // Move to next lecture only if marking as complete
      const wasCompleted = isLectureCompleted(currentLecture._id);
      if (!wasCompleted) {
        toast.success('Lecture marked as complete!');
        const allLectures = sections.flatMap(s => s.lectures);
        const currentIndex = allLectures.findIndex(l => l._id === currentLecture._id);
        if (currentIndex < allLectures.length - 1) {
          setCurrentLecture(allLectures[currentIndex + 1]);
        }
        
        // Check if course is now 100% complete and generate certificate
        if (response.data.progress.progressPercentage === 100 && !hasCertificate) {
          generateCertificate();
        }
      } else {
        toast.success('Lecture marked as incomplete');
      }
    } catch (error) {
      console.error('Failed to toggle lecture completion:', error);
      toast.error('Failed to update lecture status');
    }
  };

  const generateCertificate = async () => {
    if (id.startsWith('mock-')) {
        setHasCertificate(true);
        toast.success('🎉 Congratulations! Your certificate has been generated!');
        return;
    }

    try {
      setGeneratingCertificate(true);
      const response = await certificateService.generateCertificate(id);
      if (response.data) {
        setHasCertificate(true);
        toast.success('🎉 Congratulations! Your certificate has been generated!');
      }
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      // Check if certificate already exists
      if (error.response?.data?.message?.includes('already exists')) {
        setHasCertificate(true);
      } else {
        toast.error('Failed to generate certificate. Please try again.');
      }
    } finally {
      setGeneratingCertificate(false);
    }
  };

  const handleViewCertificate = async () => {
    if (id.startsWith('mock-')) {
        setCertificateData({
            certificateId: `MOCK-${Date.now()}`,
            courseTitle: course.title,
            completionDate: new Date().toISOString(),
            userName: 'Demo Student', // In real app, get from auth store
            instructorName: 'Demo Instructor'
        });
        return;
    }

    try {
      // If no certificate yet, try to generate it first
      if (!hasCertificate) {
        await generateCertificate();
      }
      
      const response = await certificateService.viewCertificate(id);
      setCertificateData(response.data);
      toast.success('Certificate loaded');
    } catch (error) {
      toast.error('Failed to view certificate. Please ensure the course is fully completed.');
    }
  };

  const isLectureCompleted = (lectureId) => {
    return progress?.completedLectures?.some(id => 
      (typeof id === 'string' ? id : id._id) === lectureId
    ) || false;
  };

  if (loading) return <PageLoader />;
  if (error) return <Alert variant="error">{error}</Alert>;
  if (!course) return <Alert variant="error">Course not found</Alert>;

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Small Navigation Sidebar */}
      <div className="w-16 bg-black border-r border-white/10 flex flex-col items-center py-4 gap-4 z-20">
        <Link
          to="/"
          className="p-3 rounded-lg hover:bg-white/10 transition-colors group relative"
          title="Home"
        >
          <Home className="w-6 h-6 text-gray-400 group-hover:text-white" />
        </Link>
        <Link
          to="/courses"
          className="p-3 rounded-lg hover:bg-white/10 transition-colors group relative"
          title="All Courses"
        >
          <Library className="w-6 h-6 text-gray-400 group-hover:text-white" />
        </Link>
        <Link
          to="/my-learning"
          className="p-3 rounded-lg hover:bg-white/10 transition-colors group relative"
          title="My Learning"
        >
          <LayoutDashboard className="w-6 h-6 text-gray-400 group-hover:text-white" />
        </Link>
        
        <div className="flex-1" />
        
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-3 rounded-lg hover:bg-white/10 transition-colors group"
          title={showSidebar ? "Hide sidebar" : "Show sidebar"}
        >
          {showSidebar ? (
            <X className="w-6 h-6 text-gray-400 group-hover:text-white" />
          ) : (
            <Menu className="w-6 h-6 text-gray-400 group-hover:text-white" />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
         {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
        </div>

        {/* Video Player Section */}
        <div className="flex-1 flex flex-col p-6 z-10 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl w-full mx-auto flex flex-col">
            {/* Video Player */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video relative group">
              {currentLecture ? (
                <iframe
                  src={currentLecture.videoUrl}
                  title={currentLecture.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white bg-white/5 backdrop-blur-sm">
                  <div className="text-center">
                    <PlayCircle className="w-20 h-20 mx-auto mb-4 text-white/20" />
                    <p className="text-xl font-medium text-gray-400">Select a lecture to start learning</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info and Controls */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 mt-6 rounded-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {currentLecture?.title || 'No lecture selected'}
                  </h2>
                  <p className="text-gray-400 text-lg">
                    {course.title}
                  </p>
                </div>
                
                {currentLecture && (
                  <Button
                    onClick={handleMarkComplete}
                    disabled={isLectureCompleted(currentLecture._id)}
                    className={`${
                        isLectureCompleted(currentLecture._id) 
                        ? 'bg-green-500/20 text-green-400 border-green-500/50 cursor-default' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20'
                    } px-6 py-3 rounded-xl transition-all border`}
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
                <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Course Progress</span>
                    <span className="font-bold text-white">{Math.round(progress.progressPercentage || 0)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress.progressPercentage || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    {progress.completedCount || 0} of {progress.totalLectures || 0} lectures completed
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Course Content */}
      <div 
        className={`${showSidebar ? 'w-96 translate-x-0 opacity-100' : 'w-0 translate-x-full opacity-0'} transition-all duration-300 bg-black/80 backdrop-blur-xl border-l border-white/10 flex flex-col z-20 absolute right-0 inset-y-0 md:relative`}
      >
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h3 className="font-bold text-white mb-2 text-lg">Course Content</h3>
            <p className="text-sm text-gray-400">
              {sections.length} sections • {sections.reduce((acc, s) => acc + s.lectures.length, 0)} lectures
            </p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="divide-y divide-white/5">
              {sections.map((section) => (
                <div key={section._id}>
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section._id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:text-blue-300 transition-colors">
                           <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-200 group-hover:text-white transition-colors text-sm">{section.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {section.lectures.length} lectures
                        </p>
                      </div>
                    </div>
                    {expandedSections[section._id] ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {/* Lectures List */}
                  {expandedSections[section._id] && (
                    <div className="bg-black/40">
                      {section.lectures.map((lecture) => {
                        const isCompleted = isLectureCompleted(lecture._id);
                        const isCurrent = currentLecture?._id === lecture._id;

                        return (
                          <div
                            key={lecture._id}
                            className={`px-6 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-l-2 ${
                              isCurrent ? 'bg-blue-500/10 border-blue-500' : 'border-transparent'
                            }`}
                          >
                             {/* Checkbox for completion */}
                             <div 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const response = await progressService.toggleLectureCompletion(id, lecture._id);
                                    setProgress({
                                      ...progress,
                                      completedLectures: response.data.progress.completedLectures,
                                      progressPercentage: response.data.progress.progressPercentage,
                                    });
                                  } catch (error) {
                                    console.error('Failed to toggle lecture completion:', error);
                                  }
                                }}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-500 hover:border-gray-400'}`}
                             >
                                 {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                             </div>
                            
                            <button
                              onClick={() => handleLectureClick(lecture)}
                              className="flex items-center gap-3 flex-1 text-left min-w-0"
                            >
                              <span className={`text-sm flex-1 truncate ${
                                isCurrent ? 'font-medium text-blue-400' : 'text-gray-400 group-hover:text-gray-300'
                              }`}>
                                {lecture.title}
                              </span>
                            </button>
                            
                            <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                              {formatDuration(lecture.duration)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Completion CTA */}
          {progress?.progressPercentage === 100 && (
            <div className="p-6 bg-gradient-to-t from-green-900/20 to-transparent border-t border-green-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                    <Award className="w-6 h-6 text-green-400 flex-shrink-0" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-400 mb-1">
                    Congratulations! 🎉
                  </h4>
                  <p className="text-sm text-green-300/70 mb-4">
                    You've completed this course
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={handleViewCertificate}
                      className="bg-green-600 hover:bg-green-500 text-white w-full border-none shadow-lg shadow-green-900/20"
                      disabled={generatingCertificate}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      {generatingCertificate ? 'Generating...' : 'View Certificate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/certificates')}
                      className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      Go to Certificates
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Certificate Modal */}
      {certificateData && (
        <CertificateModal
          certificateData={certificateData}
          onClose={() => setCertificateData(null)}
        />
      )}
    </div>
  );
};
