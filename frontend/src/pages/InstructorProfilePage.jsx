import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../services/userService';
import { CourseCard } from '../components/course/CourseCard';
import { Spinner } from '../components/ui/Spinner';
import { Star, BookOpen, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const InstructorProfilePage = () => {
    const { id } = useParams();
    const [instructor, setInstructor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, addToWishlist, removeFromWishlist } = useAuthStore();

    useEffect(() => {
        const fetchInstructor = async () => {
            try {
                const response = await userService.getInstructor(id);
                setInstructor(response.data);
            } catch (err) {
                console.error('Failed to fetch instructor:', err);
                setError(err.response?.data?.message || 'Failed to load instructor profile.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInstructor();
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleWishlistToggle = async (course) => {
        if (!user) return;
        const isWishlisted = user.wishlist?.includes(course._id);
        if (isWishlisted) {
            await removeFromWishlist(course._id);
        } else {
            await addToWishlist(course._id);
        }
    };

    if (loading) return <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!instructor) return <div className="text-center py-20 text-gray-400">Instructor not found (ID: {id}).</div>;

    // Attach instructor details to each course for the Card to render correctly
    const coursesWithInstructor = instructor.courses.map(course => ({
        ...course,
        instructor: { name: instructor.name, _id: instructor._id, avatar: instructor.avatar }
    }));

    return (
        <div className="min-h-screen pt-24 pb-12 bg-[#020617] text-[#f8fafc] px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <img
                        src={instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&background=0f172a&color=fff`}
                        alt={instructor.name}
                        className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-blue-500/20 shadow-xl"
                    />
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-white">
                            {instructor.name}
                        </h1>
                        <p className="text-gray-400 max-w-2xl leading-relaxed">
                            {instructor.bio || "Passionate instructor dedicated to teaching high-quality courses."}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                <BookOpen className="w-5 h-5 text-blue-400" />
                                <span className="font-semibold text-lg">{instructor.totalCourses}</span>
                                <span className="text-gray-400 text-sm">Courses</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold text-lg">{instructor.averageRating?.toFixed(1) || '0.0'}</span>
                                <span className="text-gray-400 text-sm">Rating</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                <Users className="w-5 h-5 text-blue-400" />
                                <span className="font-semibold text-lg">{instructor.totalReviews}</span>
                                <span className="text-gray-400 text-sm">Reviews</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold border-l-4 border-blue-500 pl-4">
                        Courses by {instructor.name}
                    </h2>

                    {coursesWithInstructor.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {coursesWithInstructor.map((course) => (
                                <CourseCard
                                    key={course._id}
                                    course={course}
                                    isInWishlist={user?.wishlist?.includes(course._id)}
                                    onWishlistToggle={handleWishlistToggle}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-gray-400">No courses available yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
