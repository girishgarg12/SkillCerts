import { useState, useEffect } from 'react';
import { User, Mail, Camera, Save, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { USER_ROLES } from '../lib/constants';

export const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.updateProfile(formData);
      updateUser(response.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[#020617] min-h-screen text-[#f8fafc] pt-20 pb-12">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-[20%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-[10%] w-[500px] h-[500px] bg-slate-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-24">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-slate-500">
                    <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                      {formData.avatar ? (
                        <img
                          src={formData.avatar}
                          alt={formData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-bold text-white">{formData.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <button className="absolute bottom-1 right-1 bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors shadow-lg">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">
                  {user.name}
                </h3>
                <p className="text-gray-400 mb-4 text-sm">{user.email}</p>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 capitalize">
                    {USER_ROLES[user.role]}
                  </Badge>

                  {user.isVerified && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="pt-6 border-t border-white/10 text-left">
                  <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    Account Details
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Member since</span>
                      <span className="font-medium text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                <h2 className="text-lg font-semibold text-white">Personal Information</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Input
                      label="Full Name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                      labelClassName="text-gray-300"
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
                      className="bg-black/20 border-white/5 text-gray-400 cursor-not-allowed"
                      labelClassName="text-gray-300"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1.5 ml-1">
                      Email cannot be changed contact support for assistance
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <Input
                      label="Avatar URL"
                      type="url"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                      className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                      labelClassName="text-gray-300"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 py-3 rounded-xl font-semibold">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                <h2 className="text-lg font-semibold text-white">Account Settings</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <h4 className="text-sm font-medium text-white">Change Password</h4>
                      <p className="text-sm text-gray-500">Update your security credentials</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10">Change</Button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <h4 className="text-sm font-medium text-white">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Manage your email preferences</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10">Manage</Button>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-sm font-medium text-red-400">Delete Account</h4>
                      <p className="text-sm text-gray-500">Permanently delete your account</p>
                    </div>
                    <Button variant="danger" size="sm" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20">Delete</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
