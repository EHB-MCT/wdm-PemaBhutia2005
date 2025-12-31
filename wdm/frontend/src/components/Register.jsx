import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUserPlus, FiShield } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAdminAccess = () => {
    if (adminKey === 'admin-secret-key-2024') {
      navigate('/admin/login');
    } else {
      setErrors({ adminKey: 'Invalid admin key' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      clearError();
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="page-container flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <FiUserPlus className="text-white" size={16} />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Create account</h1>
          <p className="text-gray-600">Start organizing your wardrobe today</p>
        </div>

        {/* Registration Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`input-field ${errors.name ? 'input-field-error' : ''}`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="form-error">{errors.name}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`input-field ${errors.email ? 'input-field-error' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="form-error">{errors.email}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`input-field ${errors.password ? 'input-field-error' : ''}`}
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`input-field ${errors.confirmPassword ? 'input-field-error' : ''}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword}</p>
              )}
            </div>

            {error && (
              <div className="status-error animate-slide-up">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span>Creating account...</span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-small">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Admin Access Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            {!showAdminKey ? (
              <button
                type="button"
                onClick={() => setShowAdminKey(true)}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2"
              >
                <FiShield size={16} />
                Admin Access
              </button>
            ) : (
              <div className="space-y-3">
                <div className="form-group">
                  <label htmlFor="adminKey" className="form-label text-sm">Admin Key</label>
                  <input
                    id="adminKey"
                    name="adminKey"
                    type="password"
                    className={`input-field text-sm ${errors.adminKey ? 'input-field-error' : ''}`}
                    placeholder="Enter admin key"
                    value={adminKey}
                    onChange={(e) => {
                      setAdminKey(e.target.value);
                      if (errors.adminKey) {
                        setErrors(prev => ({ ...prev, adminKey: '' }));
                      }
                    }}
                  />
                  {errors.adminKey && (
                    <p className="form-error">{errors.adminKey}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAdminAccess}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Access Admin Panel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminKey(false);
                      setAdminKey('');
                      setErrors(prev => ({ ...prev, adminKey: '' }));
                    }}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            By creating an account, you agree to our terms of service
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;