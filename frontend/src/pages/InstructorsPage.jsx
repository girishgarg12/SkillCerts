import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { userService } from '../services/userService';
import { User, Star, BookOpen, MessageSquare, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageLoader } from '../components/ui/Spinner';

export const InstructorsPage = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInstructors();
    }, []);

    const fetchInstructors = async () => {
        try {
            const response = await userService.getAllInstructors();
            setInstructors(response.data || []);
        } catch (error) {
            console.error('Failed to fetch instructors:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-screen bg-[#020617] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-400 mb-4">
                        World-Class Instructors
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Learn from industry experts passionate about sharing their knowledge and experience.
                    </p>
                </motion.div>

                {instructors.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-xl">No active instructors found at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {instructors.map((instructor, index) => (
                            <motion.div
                                key={instructor._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 flex flex-col"
                            >
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-slate-500 p-[2px]">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-black">
                                                {instructor.avatar ? (
                                                    <img
                                                        src={instructor.avatar}
                                                        alt={instructor.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                                                        <User className="w-8 h-8" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
                                                <Link to={`/instructors/${instructor._id}`}>{instructor.name}</Link>
                                            </h3>
                                            <p className="text-sm text-blue-400 font-medium capitalize">{instructor.role}</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-6 line-clamp-3 min-h-[60px] flex-grow">
                                        {instructor.bio || "No bio available."}
                                    </p>

                                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-white/10 mb-6 mt-auto">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-yellow-400 font-bold text-lg">
                                                <Star className="w-4 h-4 fill-current" />
                                                {instructor.averageRating ? instructor.averageRating.toFixed(1) : '0.0'}
                                            </div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Rating</div>
                                        </div>
                                        <div className="text-center border-l border-white/10">
                                            <div className="flex items-center justify-center gap-1 text-white font-bold text-lg">
                                                <BookOpen className="w-4 h-4" />
                                                {instructor.totalCourses}
                                            </div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Courses</div>
                                        </div>
                                        <div className="text-center border-l border-white/10">
                                            <div className="flex items-center justify-center gap-1 text-white font-bold text-lg">
                                                <MessageSquare className="w-4 h-4" />
                                                {instructor.totalReviews}
                                            </div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Reviews</div>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/instructors/${instructor._id}`}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors text-sm font-medium group"
                                    >
                                        View Profile <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
