import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clothingAPI } from '../services/api';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    brand: '',
    price: '',
    season: '',
    size: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch user's clothing items
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const items = await clothingAPI.getAll();
      setItems(items);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setMessage('Error loading items');
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      setMessage('Please select an image');
      return;
    }

    setSubmitting(true);
    setMessage('');

    const formDataToSend = new FormData();
    formDataToSend.append('image', imageFile);
    formDataToSend.append('brand', formData.brand);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('season', formData.season);
    formDataToSend.append('size', formData.size);

    try {
      const newItem = await clothingAPI.create(formDataToSend);
      setItems([newItem, ...items]);
      
      // Reset form
      setFormData({ brand: '', price: '', season: '', size: '' });
      setImageFile(null);
      setImagePreview(null);
      setMessage('Item added successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding item:', error);
      setMessage('Error adding item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await clothingAPI.delete(itemId);
      setItems(items.filter(item => item.id !== itemId));
      setMessage('Item deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage('Error deleting item');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-5 h-5 mx-auto mb-4"></div>
          <p className="text-body">Loading your wardrobe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading">Wardrobe</h1>
              <p className="text-small mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-small text-gray-500">Items</p>
                <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-ghost"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Add Item Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-subheading mb-2">Add New Item</h2>
            <p className="text-body">Upload a photo to start organizing your wardrobe</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="card p-8">
              {message && (
                <div className={`mb-6 animate-slide-up ${
                  message.includes('success') ? 'status-success' : 'status-error'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <div className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                      imagePreview 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                    }`}>
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-32 h-32 object-cover rounded-lg mx-auto shadow-soft"
                          />
                          <p className="text-small text-gray-600">Click to change image</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-medium text-gray-900">Click to upload image</p>
                            <p className="text-small text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="brand" className="form-label">Brand</label>
                    <input
                      id="brand"
                      name="brand"
                      type="text"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="e.g. Nike, Zara"
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="price" className="form-label">Price</label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="season" className="form-label">Season</label>
                    <select
                      id="season"
                      name="season"
                      value={formData.season}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Select season</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Fall">Fall</option>
                      <option value="Winter">Winter</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="size" className="form-label">Size</label>
                    <select
                      id="size"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Select size</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="spinner w-4 h-4"></div>
                      <span>Adding to wardrobe...</span>
                    </div>
                  ) : (
                    'Add to Wardrobe'
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Items Grid */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-subheading mb-2">Your Wardrobe</h2>
            <p className="text-body">Manage your clothing collection</p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
              <p className="text-body text-center max-w-md mx-auto">
                Start building your wardrobe by adding your first clothing item above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item, index) => (
                <div key={item.id} className="card card-hover group stagger-item" style={{animationDelay: `${index * 0.1}s`}}>
                  {item.image_path && (
                    <div className="aspect-square overflow-hidden rounded-t-xl">
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${item.image_path}`}
                        alt="Clothing item"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="space-y-2 mb-4">
                      {item.brand && (
                        <p className="text-sm font-medium text-gray-900">{item.brand}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {item.price && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            ${item.price}
                          </span>
                        )}
                        {item.season && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {item.season}
                          </span>
                        )}
                        {item.size && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            {item.size}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-danger w-full text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;