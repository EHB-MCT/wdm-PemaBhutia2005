import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShield } from 'react-icons/fi';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminKey: ''
  });
  const [errors, setErrors] = useState({});
  
  const { adminRegister, loading, error, clearError } = useAuth();
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Admin password must be at least 8 characters long';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.adminKey) {
      newErrors.adminKey = 'Admin registration key is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      clearError();
      await adminRegister(
        formData.name,
        formData.email,
        formData.password,
        formData.adminKey
      );
      navigate('/admin/dashboard');
    } catch (error) {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="page-container flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 rounded-xl mb-4">
            <FiShield className="text-white" size={16} />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Admin Registration</h1>
          <p className="text-gray-600">Create administrator account</p>
        </div>

        {/* Admin Registration Form */}
        <div className="card p-8 border-2 border-red-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
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
                autoComplete="new-password"
                required
                className={`input-field ${errors.password ? 'input-field-error' : ''}`}
                placeholder="Create a strong password (min 8 chars)"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
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

            <div className="form-group">
              <label htmlFor="adminKey" className="form-label">Admin Registration Key</label>
              <input
                id="adminKey"
                name="adminKey"
                type="password"
                required
                className={`input-field ${errors.adminKey ? 'input-field-error' : ''}`}
                placeholder="Enter admin registration key"
                value={formData.adminKey}
                onChange={handleChange}
              />
              {errors.adminKey && (
                <p className="form-error">{errors.adminKey}</p>
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
                <span>Creating account...</span>
              ) : (
                'Create Admin Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-small">
              Already have admin access?{' '}
              <Link
                to="/admin/login"
                className="font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
            <p className="text-small mt-2">
              Regular user?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-red-500">
            Restricted registration • Valid admin key required
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;