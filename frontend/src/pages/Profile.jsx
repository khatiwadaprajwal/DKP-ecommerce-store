import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Mail, Shield, LogOut, Lock } from 'lucide-react';
import api from '../config/api';
import { useAuth } from '../context/AuthProvider';

export default function Profile() {
  const [user, setUser] = useState(null);
  
  // Password Form States
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Input Visibility States
  const [visible, setVisible] = useState({
    old: false,
    new: false,
    confirm: false
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  const togglePasswordForm = () => {
    setShowPasswordForm(!showPasswordForm);
    if (!showPasswordForm) {
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const toggleVisibility = (field) => {
    setVisible(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/v1/changepassword', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success(response.data.msg || 'Password changed successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      
    } catch (error) {
      const errorMessage = error.response?.data?.msg || error.message || 'Failed to change password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Background */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32 relative">
           {/* Decorative circles */}
           <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white opacity-10 blur-xl"></div>
           <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 rounded-full bg-white opacity-10 blur-xl"></div>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-8 relative">
          
          {/* Avatar Section - First Letter of Name */}
          <div className="flex justify-center -mt-12 mb-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-white p-1.5 shadow-lg">
                <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-blue-600 uppercase">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full capitalize border border-blue-100">
              {user.role}
            </span>
          </div>

          <div className="space-y-4">
            {/* Info Cards */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <Mail className="text-gray-400 mr-3" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <Shield className="text-gray-400 mr-3" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Account Type</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 my-6" />

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={togglePasswordForm}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 transition-all duration-200 font-medium"
              >
                <Lock size={18} className="mr-2" />
                {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200 font-medium border border-red-100"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Password Form with Smooth Transition */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showPasswordForm ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <Shield size={16} className="mr-2 text-blue-600" />
                Secure Password Update
              </h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100 flex items-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div>
                   {error}
                </div>
              )}
              
              <form onSubmit={submitPasswordChange} className="space-y-4">
                {['old', 'new', 'confirm'].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      {field === 'old' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={visible[field] ? 'text' : 'password'}
                        name={`${field}Password`}
                        value={passwordData[`${field}Password`]}
                        onChange={handlePasswordChange}
                        className="w-full pl-3 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility(field)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {visible[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 rounded-lg text-white font-medium shadow-sm ${
                    loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                  } transition-all duration-200`}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}