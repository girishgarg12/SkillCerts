import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, Award, TrendingUp, Sparkles, Rocket, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { wishlistService } from '../services/wishlistService';
import { CourseGrid } from '../components/course/CourseGrid';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { AuroraBackground } from '../components/ui/AuroraBackground';
import { Button as MovingBorderButton } from '../components/ui/MovingBorder';
import { CardContainer, CardBody, CardItem } from '../components/ui/3DCard';
import { SparklesCore } from '../components/ui/Sparkles';
import { TypewriterEffect } from '../components/ui/TypewriterEffect';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const HomePage = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const { user, isAuthenticated } = useAuthStore();

  // Rotating skills state
  const [skillIndex, setSkillIndex] = useState(0);

  const skills = [
    { text: "UI/UX Design", className: "text-yellow-400 dark:text-yellow-400" },
    { text: "MERN Stack", className: "text-yellow-400 dark:text-yellow-400" },
    { text: "Data Structure And Algorithms", className: "text-yellow-400 dark:text-yellow-400" },
    { text: "Data Science", className: "text-yellow-400 dark:text-yellow-400" },
    { text: "Web Development", className: "text-yellow-400 dark:text-yellow-400" },
    { text: "Cyber Security", className: "text-yellow-400 dark:text-yellow-400" },
    { text: "Cloud Computing", className: "text-yellow-400 dark:text-yellow-400" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSkillIndex((prev) => (prev + 1) % skills.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [featuredRes, recommendedRes] = await Promise.all([
          courseService.getAllCourses({ limit: 8 }),
          user?.interests?.length > 0
            ? courseService.getAllCourses({ search: user.interests[0], limit: 4 })
            : Promise.resolve({ data: { courses: [] } })
        ]);

        setFeaturedCourses(featuredRes.data.courses);
        setRecommendedCourses(recommendedRes.data.courses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlistIds([]);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistService.getWishlist();
      const ids = response.data.courses?.map(c => c._id) || [];
      setWishlistIds(ids);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const handleWishlistToggle = async (course) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const courseId = course._id || course.id;
    const isInWishlist = wishlistIds.includes(courseId);

    // Optimistic UI Update
    if (isInWishlist) {
      setWishlistIds(prev => prev.filter(id => id !== courseId));
      toast.success('Removed from wishlist');
    } else {
      setWishlistIds(prev => [...prev, courseId]);
      toast.success('Added to wishlist');
    }

    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(courseId);
      } else {
        await wishlistService.addToWishlist(courseId);
      }
    } catch (error) {
      // Revert on failure
      if (isInWishlist) {
        setWishlistIds(prev => [...prev, courseId]);
        toast.error('Failed to remove from wishlist');
      } else {
        setWishlistIds(prev => prev.filter(id => id !== courseId));
        toast.error('Failed to add to wishlist');
      }
      console.error('Failed to toggle wishlist:', error);
    }
  };

  return (
    <div className="overflow-hidden text-[#f8fafc] relative bg-[#020617]">
      {/* Subtle Mesh Gradient for Professional Depth */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-900 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <div className="relative pt-20 pb-20 md:pt-10 md:pb-10">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-4 md:pt-0">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-blue-500/30 mb-4"
            >
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">The Future of Learning is Here</span>
            </motion.div>

            <div className="mb-8 min-h-[160px] md:min-h-[200px] flex flex-col items-center justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold mb-4 leading-tight tracking-tight drop-shadow-lg"
              >
                Master New Skills in <br />
              </motion.h1>
              <div key={skillIndex}>
                <TypewriterEffect
                  words={skills[skillIndex].text.split(" ").map(word => ({
                    text: word,
                    className: skills[skillIndex].className
                  }))}
                  className="text-4xl md:text-7xl font-bold"
                  cursorClassName="bg-blue-500"
                />
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto text-shadow"
            >
              Unlock your potential with expert-led courses. Earn recognized certificates and advance your career today.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-5 justify-center"
            >
              <Link to="/courses">
                <MovingBorderButton
                  borderRadius="1.75rem"
                  className="bg-zinc-900 text-white border-neutral-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Start Learning Now
                  </div>
                </MovingBorderButton>
              </Link>
              <Link to={isAuthenticated ? "/courses?isFree=true" : "/signup"}>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 text-lg">
                  {isAuthenticated ? "Explore Free Courses" : "Get Started for Free"}
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/10"
            >
              {[
                { label: "Active Students", value: "10K+" },
                { label: "Expert Instructors", value: "200+" },
                { label: "Course Library", value: "1,500+" },
                { label: "Certificates Earned", value: "50K+" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-white mb-2 drop-shadow-md">{stat.value}</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      {user && recommendedCourses.length > 0 && (
        <section className="py-12 relative block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex items-end justify-between mb-8"
            >
              <motion.div variants={fadeInUp}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h2 className="text-3xl font-bold text-white">Recommended for You</h2>
                </div>
                <p className="text-gray-400">Because you're interested in <span className="text-blue-400 font-medium">{user.interests && user.interests[0]}</span></p>
              </motion.div>
            </motion.div>
            <CourseGrid
              courses={recommendedCourses}
              loading={loading}
              onWishlistToggle={handleWishlistToggle}
              wishlistIds={wishlistIds}
            />
          </div>
        </section>
      )}

      {/* Featured Courses */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex items-end justify-between mb-12"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-4xl font-bold text-white mb-4">Featured Courses</h2>
              <p className="text-gray-400 text-lg">Explore our most popular and highest-rated content</p>
            </motion.div>
            <Link to="/courses">
              <Button variant="secondary" className="hidden sm:flex">View All Courses</Button>
            </Link>
          </motion.div>

          <CourseGrid
            courses={featuredCourses}
            loading={loading}
            onWishlistToggle={handleWishlistToggle}
            wishlistIds={wishlistIds}
          />

          <div className="mt-8 text-center sm:hidden">
            <Link to="/courses">
              <Button variant="secondary" className="w-full">View All Courses</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust/Info Section */}
      <section className="py-24 bg-white/2 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: "Recognized Certificates", desc: "Earn certificates that are recognized by top employers worldwide." },
              { icon: Users, title: "Community Driven", desc: "Join a vibrant community of learners and share your journey." },
              { icon: Shield, title: "Lifetime Access", desc: "Pay once and get lifetime access to your courses and updates." }
            ].map((feature, i) => (
              <CardContainer key={i} className="inter-var w-full h-full">
                <CardBody className="bg-white/5 relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-8 border transition-all duration-300 backdrop-blur-sm text-center">
                  <CardItem translateZ="50" className="w-full flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-slate-500 rounded-2xl flex items-center justify-center transform rotate-3 group-hover:rotate-6 transition-transform">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </CardItem>
                  <CardItem translateZ="40" className="w-full">
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  </CardItem>
                  <CardItem translateZ="30" className="w-full">
                    <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
                  </CardItem>
                </CardBody>
              </CardContainer>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-24 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-[#020617]"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>

            <div className="relative z-10 py-20 px-8 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Start Your Journey?</h2>
              <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
                Join SkillCerts today and unlock access to thousands of premium courses from industry experts.
              </p>
              <Link to="/signup">
                <Button size="lg" className="h-14 px-8 text-lg bg-white text-[#020617] hover:bg-gray-100 hover:text-[#020617] shadow-xl">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
};
