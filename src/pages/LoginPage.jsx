import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuthStore } from '../store/authStore';
import { GlassCard } from '../components/ui/GlassCard';
import { motion } from 'framer-motion';

export const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData);
      toast.success('Login successful! Welcome back.');
      navigate('/');
    } catch (err) {
      const errorMessage = err.message || 'Failed to login';
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-30" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl opacity-30" />
        </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6 group">
            <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">SkillCerts</span>
          </Link>
          <h2 className="text-3xl font-bold text-white">Welcome back</h2>
          <p className="text-gray-400 mt-2">Login to continue your learning journey</p>
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

            <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500" />
                <span className="ml-2 text-sm text-gray-400">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
                </Link>
            </div>

            <Button type="submit" className="w-full shadow-lg shadow-purple-500/20" disabled={loading}>
                {loading ? (
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Logging in...
                </>
                ) : (
                'Login'
                )}
            </Button>

            <div className="text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Sign up
                </Link>
            </div>
            </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};
