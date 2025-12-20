import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, TrendingUp, Sparkles, Rocket, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { CourseGrid } from '../components/course/CourseGrid';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { AuroraBackground } from '../components/ui/AuroraBackground';
import { Button as MovingBorderButton } from '../components/ui/MovingBorder';
import { CardContainer, CardBody, CardItem } from '../components/ui/3DCard';
import { SparklesCore } from '../components/ui/Sparkles';

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
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

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

  return (
    <div className="overflow-hidden text-white relative">
      {/* Background Sparkles */}
      <div className="w-full absolute inset-0 h-full min-h-screen">
        <SparklesCore
          id="tsparticleshomepage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      {/* Hero Section */}
      <div className="relative pt-20 pb-20 md:pt-32 md:pb-32">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 md:pt-0">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-purple-500/30 mb-8"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-purple-200">The Future of Learning is Here</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight drop-shadow-lg"
            >
              Master New Skills with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient">
                Premium Courses
              </span>
            </motion.h1>

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
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 text-lg">
                  Get Started for Free
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
                             <Sparkles className="w-5 h-5 text-yellow-400" />
                            <h2 className="text-3xl font-bold text-white">Recommended for You</h2>
                        </div>
                        <p className="text-gray-400">Because you're interested in <span className="text-purple-400 font-medium">{user.interests && user.interests[0]}</span></p>
                    </motion.div>
                </motion.div>
                <CourseGrid courses={recommendedCourses} loading={loading} />
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
          
          <CourseGrid courses={featuredCourses} loading={loading} />
          
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
                  <CardBody className="bg-white/5 relative group/card dark:hover:shadow-2xl dark:hover:shadow-pink-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-8 border transition-all duration-300 backdrop-blur-sm text-center">
                    <CardItem translateZ="50" className="w-full flex justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center transform rotate-3 group-hover:rotate-6 transition-transform">
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
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-pink-900"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            
            <div className="relative z-10 py-20 px-8 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Start Your Journey?</h2>
              <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
                Join SkillCerts today and unlock access to thousands of premium courses from industry experts.
              </p>
              <Link to="/signup">
                <Button size="lg" className="h-14 px-8 text-lg bg-white text-purple-900 hover:bg-gray-100 hover:text-purple-900 shadow-xl">
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
