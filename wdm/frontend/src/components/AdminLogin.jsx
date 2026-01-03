import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShield } from 'react-icons/fi';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  
  const { adminLogin, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to admin dashboard
  const from = location.state?.from?.pathname || '/admin/dashboard';

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      clearError();
      await adminLogin(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="page-container flex items-center justify-center">
      <div className="nav-content flex items-center justify-center min-h-screen py-8">
        <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 rounded-xl mb-4">
            <FiShield className="text-white" size={16} />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-600">Sign in to administrative panel</p>
        </div>

        {/* Admin Login Form */}
        <div className="card p-8 border-2 border-red-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Admin Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`input-field ${errors.email ? 'input-field-error' : ''}`}
                placeholder="Enter admin email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="form-error">{errors.email}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Admin Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`input-field ${errors.password ? 'input-field-error' : ''}`}
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="form-error">{errors.password}</p>
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
              className="btn-primary w-full bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                'Admin Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-small">
              Don't have admin access?{' '}
              <Link
                to="/admin/register"
                className="font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Register here
              </Link>
            </p>
            <p className="text-small mt-2">
              Regular user?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-red-500">
            Restricted access • Administrator privileges required
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminLogin;