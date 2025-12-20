import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuthStore } from '../store/authStore';
import { GlassCard } from '../components/ui/GlassCard';
import { motion } from 'framer-motion';

const INTERESTS = [
  "Web Development", "Data Science", "Mobile Dev", 
  "UI/UX Design", "Machine Learning", "DevOps",
  "Cloud Computing", "Cybersecurity", "Blockchain",
  "Game Dev", "Digital Marketing", "Business"
];

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    interests: [],
  });
  const [error, setError] = useState('');
  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (formData.interests.length === 0 && formData.role === 'student') {
        // Optional: Force selection or just warn. Let's make it optional for now but encouraged.
      }
      await signup(formData);
      toast.success('Account created successfully! Welcome to SkillCerts.');
      navigate('/');
    } catch (err) {
      const errorMessage = err.message || 'Failed to sign up';
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest) => {
    setFormData(prev => {
      const isSelected = prev.interests.includes(interest);
      if (isSelected) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-30" />
            <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl opacity-30" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6 group">
            <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">SkillCerts</span>
          </Link>
          <h2 className="text-3xl font-bold text-white">Create your account</h2>
          <p className="text-gray-400 mt-2">Start your learning journey today</p>
        </div>

        <GlassCard className="backdrop-blur-xl border-white/10">
            {error && (
            <Alert variant="error" className="mb-6" onClose={() => setError('')}>
                {error}
            </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                />
            </div>

            <div>
                <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                />
            </div>

            <div>
                <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                  I am a
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                  <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'student' })}
                      className={`px-2 py-2.5 rounded-xl font-medium transition-all text-xs border ${
                      formData.role === 'student'
                          ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                      Student
                  </button>
                  <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'instructor' })}
                      className={`px-2 py-2.5 rounded-xl font-medium transition-all text-xs border ${
                      formData.role === 'instructor'
                          ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                      Instructor
                  </button>
                  </div>
              </div>
            </div>

            {formData.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Interests (Select a few)
                </label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        formData.interests.includes(interest)
                          ? 'bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-500/20'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {interest}
                      {formData.interests.includes(interest) && <Check className="w-3 h-3 inline ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full shadow-lg shadow-purple-500/20" disabled={loading}>
                {loading ? (
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating account...
                </>
                ) : (
                'Sign Up'
                )}
            </Button>

            <div className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Login
                </Link>
            </div>
            </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};
