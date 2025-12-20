import { CourseCard } from './CourseCard';

export const CourseGrid = ({ courses, onWishlistToggle, wishlistIds = [], loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-t-lg"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No courses found</p>
      </div>
    );
  }

  // detailed mock data for visual variety (Frontend Only)
  const mockCourses = [
    {
      _id: 'mock-1',
      title: 'Advanced Full Stack Web Development',
      description: 'Master MERN stack with modern practices and cloud deployment.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
      level: 'advanced',
      price: 1999,
      isFree: false,
      rating: 4.8,
      ratingCount: 124,
      totalDuration: 4500,
      instructor: { name: 'Sarah Wilson' },
      published: true
    },
    {
      _id: 'mock-2',
      title: 'UI/UX Design Masterclass 2024',
      description: 'Design beautiful interfaces and user experiences like a pro.',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop',
      level: 'beginner',
      price: 2499,
      isFree: false,
      rating: 4.9,
      ratingCount: 89,
      totalDuration: 3200,
      instructor: { name: 'Alex Rivera' },
      published: true
    },
    {
      _id: 'mock-3',
      title: 'Python for Data Science & AI',
      description: 'Zero to Hero in Python, Pandas, and Machine Learning concepts.',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop',
      level: 'intermediate',
      price: 1499,
      isFree: false,
      rating: 4.7,
      ratingCount: 210,
      totalDuration: 5200,
      instructor: { name: 'David Chen' },
      published: true
    },
    {
      _id: 'mock-4',
      title: 'Mobile App Dev with React Native',
      description: 'Build native iOS and Android apps with a single codebase.',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop',
      level: 'intermediate',
      price: 1899,
      isFree: false,
      rating: 4.6,
      ratingCount: 156,
      totalDuration: 4100,
      instructor: { name: 'Emily Davis' },
      published: true
    },
    {
      _id: 'mock-5',
      title: 'Digital Marketing & SEO Strategy',
      description: 'Grow your business with proven digital marketing techniques.',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
      level: 'beginner',
      price: 999,
      isFree: false,
      rating: 4.5,
      ratingCount: 312,
      totalDuration: 2800,
      instructor: { name: 'Mark Johnson' },
      published: true
    },
    {
      _id: 'mock-6',
      title: 'DevOps & Cloud Infrastructure',
      description: 'Learn Docker, Kubernetes, and AWS deployment pipelines.',
      thumbnail: 'https://images.unsplash.com/photo-1667372393119-c81c0026dfba?q=80&w=1920&auto=format&fit=crop',
      level: 'advanced',
      price: 2999,
      isFree: false,
      rating: 4.9,
      ratingCount: 56,
      totalDuration: 6200,
      instructor: { name: 'James Carter' },
      published: true
    },
    {
      _id: 'mock-7',
      title: 'Blender 3D Modeling Bootcamp',
      description: 'Create stunning 3D models and animations from scratch.',
      thumbnail: 'https://images.unsplash.com/photo-1626379953822-baec19c3accd?q=80&w=2070&auto=format&fit=crop',
      level: 'beginner',
      price: 1299,
      isFree: false,
      rating: 4.8,
      ratingCount: 178,
      totalDuration: 3600,
      instructor: { name: 'Lisa Wong' },
      published: true
    },
    {
      _id: 'mock-8',
      title: 'Cybersecurity Fundamentals',
      description: 'Protect systems and networks from digital attacks.',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
      level: 'intermediate',
      price: 2299,
      isFree: false,
      rating: 4.7,
      ratingCount: 92,
      totalDuration: 3900,
      instructor: { name: 'Robert Fox' },
      published: true
    }
  ];

  // Use real courses if available, otherwise fallback to mock data combined with real data
  const displayCourses = courses && courses.length > 0 
    ? [...courses, ...mockCourses].slice(0, 8) // Show real courses first, then fill with mock
    : mockCourses;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {displayCourses.map((course) => (
        <CourseCard
          key={course.uniqueId || course._id || course.id}
          course={course}
          onWishlistToggle={onWishlistToggle}
          isInWishlist={wishlistIds.includes(course._id || course.id)}
        />
      ))}
    </div>
  );
};
