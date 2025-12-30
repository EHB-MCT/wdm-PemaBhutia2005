import { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { adminAPI } from "../services/api";
import { FiShield, FiMapPin, FiCamera, FiCalendar, FiPackage } from "react-icons/fi";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const AdminDashboard = () => {
  const [usersWithItems, setUsersWithItems] = useState([]);
  const [histogramData, setHistogramData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [priceTierData, setPriceTierData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedUsers, setExpandedUsers] = useState(new Set());

  // Color coding for social status
  const getSocialStatusColor = (status) => {
    switch (status) {
      case 'Budget-Conscious': return '#10b981'; // green
      case 'Middle Class': return '#3b82f6'; // blue
      case 'Upper Middle Class': return '#8b5cf6'; // purple
      case 'Affluent': return '#f59e0b'; // amber
      case 'High Net Worth': return '#dc2626'; // red
      default: return '#6b7280'; // gray
    }
  };

  // Register Chart.js components
  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

  // Chart data
  const chartData = {
    labels: histogramData.map(d => d.label),
    datasets: [
      {
        label: 'Photos Taken',
        data: histogramData.map(d => d.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Photos Taken by Hour of Day',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Hour of Day',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Photos',
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  useEffect(() => {
    fetchUsersWithItems();
    fetchHistogramData();
    fetchLocationData();
    fetchPriceTierData();
  }, []);

  const fetchUsersWithItems = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsersWithItems();
      setUsersWithItems(data);
      setError("");
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setError(error.response?.data?.error || "Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistogramData = async () => {
    try {
      const data = await adminAPI.getHistogramData();
      setHistogramData(data);
    } catch (error) {
      console.error("Error fetching histogram data:", error);
    }
  };

  const fetchLocationData = async () => {
    try {
      const data = await adminAPI.getLocationData();
      setLocationData(data);
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  const fetchPriceTierData = async () => {
    try {
      const data = await adminAPI.getPriceTierData();
      setPriceTierData(data);
    } catch (error) {
      console.error("Error fetching price tier data:", error);
    }
  };

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  // Price tier chart configuration
  const priceTierChartData = {
    labels: priceTierData.map(user => user.userName),
    datasets: [
      {
        label: 'Budget (<$30)',
        data: priceTierData.map(user => user.percentages?.budget || 0),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
      },
      {
        label: 'Mid-range ($30-$100)',
        data: priceTierData.map(user => user.percentages?.midRange || 0),
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        borderWidth: 1,
      },
      {
        label: 'Premium (>$100)',
        data: priceTierData.map(user => user.percentages?.premium || 0),
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        borderWidth: 1,
      },
    ],
  };

  const priceTierChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'User Wardrobe Class Analysis',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value}%`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Users',
        },
        stacked: true,
      },
      y: {
        title: {
          display: true,
          text: 'Percentage of Wardrobe (%)',
        },
        stacked: true,
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
    },
  };

  const formatExifData = (item) => {
    const exifFields = [];
    
    if (item.gps_lat && item.gps_lon) {
      exifFields.push({
        icon: <FiMapPin size={12} />,
        label: "GPS",
        value: `${item.gps_lat.toFixed(6)}, ${item.gps_lon.toFixed(6)}`
      });
    }
    
    if (item.datetime_original) {
      exifFields.push({
        icon: <FiCalendar size={12} />,
        label: "Date",
        value: new Date(item.datetime_original).toLocaleDateString()
      });
    }
    
    if (item.camera_make || item.camera_model) {
      exifFields.push({
        icon: <FiCamera size={12} />,
        label: "Camera",
        value: `${item.camera_make || ''} ${item.camera_model || ''}`.trim()
      });
    }
    
    if (item.software) {
      exifFields.push({
        icon: <FiPackage size={12} />,
        label: "Software",
        value: item.software
      });
    }
    
    return exifFields;
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-body">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navigation />
      
      {/* Admin Header */}
      <div style={{ backgroundColor: "#fef2f2", borderBottom: "1px solid #fecaca" }}>
        <div className="container" style={{ padding: "1.5rem 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div className="inline-flex items-center justify-center w-10 h-10 bg-red-600 rounded-lg">
              <FiShield className="text-white" size={16} />
            </div>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#991b1b" }}>Admin Dashboard</h1>
              <p style={{ fontSize: "0.875rem", color: "#dc2626", marginTop: "0.25rem" }}>
                Users and their EXIF data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container py-8">
        {error && (
          <div className="status-error mb-6">
            {error}
          </div>
        )}

        {usersWithItems.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-body">No users have registered yet.</p>
          </div>
        ) : (
          <div>
            {/* Summary Stats */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "1rem", 
              marginBottom: "2rem" 
            }}>
              <div className="card">
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Total Users</p>
                  <p style={{ fontSize: "2rem", fontWeight: "600", color: "#111827" }}>
                    {usersWithItems.length}
                  </p>
                </div>
              </div>
            <div className="card">
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Total Items</p>
                <p style={{ fontSize: "2rem", fontWeight: "600", color: "#111827" }}>
                  {usersWithItems.reduce((sum, user) => sum + user.items.length, 0)}
                </p>
              </div>
            </div>
            <div className="card">
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Avg Item Price</p>
                <p style={{ fontSize: "2rem", fontWeight: "600", color: "#111827" }}>
                  ${(() => {
                    const usersWithValidItems = usersWithItems.filter(user => user.items.length > 0);
                    if (usersWithValidItems.length === 0) return '0.0';
                    
                    const totalAverage = usersWithItems.reduce((sum, user) => {
                      const validPrices = user.items.filter(item => item.price && !isNaN(parseFloat(item.price)));
                      if (validPrices.length === 0) return sum;
                      const userAvg = validPrices.reduce((itemSum, item) => itemSum + parseFloat(item.price), 0) / validPrices.length;
                      return sum + userAvg;
                    }, 0);
                    
                    return (totalAverage / usersWithValidItems.length).toFixed(1);
                  })()}
                </p>
              </div>
            </div>
              <div className="card">
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Items with GPS</p>
                  <p style={{ fontSize: "2rem", fontWeight: "600", color: "#111827" }}>
                    {usersWithItems.reduce((sum, user) => 
                      sum + user.items.filter(item => item.gps_lat && item.gps_lon).length, 0
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Hour Histogram */}
            <div style={{ marginTop: "2rem" }}>
              <div className="card" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center" }}>
                  📸 Photo Activity Timeline
                </h2>
                <div style={{ height: "400px", position: "relative" }}>
                  {histogramData.length > 0 ? (
                    <Bar data={chartData} options={chartOptions} />
                  ) : (
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      height: "100%",
                      color: "#6b7280" 
                    }}>
                      No photo timestamp data available
                    </div>
                  )}
                </div>
                <div style={{ marginTop: "1rem", textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
                  Showing when users take photos throughout the day (24-hour UTC format)
                </div>
              </div>
            </div>

            {/* Wardrobe Class Analysis */}
            <div style={{ marginTop: "2rem" }}>
              <div className="card" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center" }}>
                  💰 Wardrobe Class Distribution
                </h2>
                <div style={{ height: "450px", position: "relative" }}>
                  {priceTierData.length > 0 ? (
                    <Bar data={priceTierChartData} options={priceTierChartOptions} />
                  ) : (
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      height: "100%",
                      color: "#6b7280" 
                    }}>
                      No price data available for class analysis
                    </div>
                  )}
                </div>
                <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <div style={{ padding: "1rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.5rem" }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#166534", fontSize: "14px", fontWeight: "600" }}>🟢 Budget (&lt;$30)</h4>
                    <p style={{ margin: "0", color: "#15803d", fontSize: "12px" }}>Affordable items, budget-conscious shoppers</p>
                  </div>
                  <div style={{ padding: "1rem", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "0.5rem" }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#1d4ed8", fontSize: "14px", fontWeight: "600" }}>🔵 Mid-range ($30-$100)</h4>
                    <p style={{ margin: "0", color: "#1e40af", fontSize: "12px" }}>Standard retail price range</p>
                  </div>
                  <div style={{ padding: "1rem", backgroundColor: "#fef3c7", border: "1px solid #fed7aa", borderRadius: "0.5rem" }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#d97706", fontSize: "14px", fontWeight: "600" }}>🟠 Premium (&gt;$100)</h4>
                    <p style={{ margin: "0", color: "#b45309", fontSize: "12px" }}>High-end fashion, luxury brands</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Locations Map */}
            <div style={{ marginTop: "2rem" }}>
              <div className="card" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center" }}>
                  🗺 User Locations Worldwide
                </h2>
                <div style={{ height: "500px", position: "relative", borderRadius: "0.5rem", overflow: "hidden" }}>
                  {locationData.length > 0 ? (
                    <MapContainer 
                      center={[20, 0]} 
                      zoom={2} 
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {/* User centroids with circles showing activity density */}
                      {locationData.filter(user => user.centroid).map(user => (
                        <Circle
                          key={`centroid-${user.userId}`}
                          center={[user.centroid.lat, user.centroid.lng]}
                          radius={500000} // 500km radius
                          fillColor="rgba(59, 130, 246, 0.1)"
                          color="rgba(59, 130, 246, 0.3)"
                          weight={1}
                        />
                      ))}
                      
                      {/* Individual photo markers */}
                      {locationData.map(user => (
                        <div key={user.userId}>
                          {user.items.map((item, index) => (
                            <Marker
                              key={`${user.userId}-${item.itemId}`}
                              position={[item.lat, item.lng]}
                            >
                              <Popup>
                                <div style={{ minWidth: "200px" }}>
                                  <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "bold" }}>
                                    {user.userName}
                                  </h4>
                                  <p style={{ margin: "4px 0", fontSize: "12px" }}>
                                    📸 {item.brand} {item.category}
                                  </p>
                                  <p style={{ margin: "4px 0", fontSize: "11px", color: "#6b7280" }}>
                                    📍 {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                                  </p>
                                  {item.timestamp && (
                                    <p style={{ margin: "4px 0", fontSize: "11px", color: "#6b7280" }}>
                                      🕐 {new Date(item.timestamp).toLocaleString()}
                                    </p>
                                  )}
                                  <p style={{ margin: "4px 0", fontSize: "11px", color: "#6b7280" }}>
                                    📊 User has {user.totalItems} total items
                                  </p>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </div>
                      ))}
                    </MapContainer>
                  ) : (
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      height: "100%",
                      color: "#6b7280" 
                    }}>
                      No location data available
                    </div>
                  )}
                </div>
                <div style={{ marginTop: "1rem", textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
                  📍 Blue circles show user activity areas | Red dots mark individual photo locations
                </div>
              </div>
            </div>

            {/* Users List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {usersWithItems.map((user) => (
                <div key={user.id} className="card">
                  {/* User Header */}
                  <div 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      cursor: "pointer",
                      padding: "1rem"
                    }}
                    onClick={() => toggleUserExpansion(user.id)}
                  >
                    <div>
                      <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#111827", margin: "0" }}>
                        {user.name}
                      </h3>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0.25rem 0" }}>
                        {user.email} • {user.items.length} items
                      </p>
                      {user.priceStats && (
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <span style={{ 
                            padding: "2px 8px", 
                            borderRadius: "9999px", 
                            fontSize: "12px",
                            fontWeight: "500",
                            backgroundColor: getSocialStatusColor(user.priceStats.socialStatus),
                            color: "white"
                          }}>
                            {user.priceStats.socialStatus}
                          </span>
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>
                            Avg: ${user.priceStats.averagePrice}
                          </span>
                          {user.priceStats.totalItems > 0 && (
                            <span style={{ fontSize: "12px", color: "#6b7280" }}>
                              Total: ${user.priceStats.totalPrice}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      style={{
                        padding: "0.5rem",
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {expandedUsers.has(user.id) ? "▼" : "▶"}
                    </button>
                  </div>

                  {/* User Items (expanded) */}
                  {expandedUsers.has(user.id) && user.items.length > 0 && (
                    <div style={{ 
                      borderTop: "1px solid #e5e7eb", 
                      padding: "1rem",
                      backgroundColor: "#f9fafb"
                    }}>
                      <div style={{ display: "grid", gap: "1rem" }}>
                        {user.items.map((item) => {
                          const exifData = formatExifData(item);
                          return (
                            <div key={item.id} style={{ 
                              border: "1px solid #e5e7eb", 
                              borderRadius: "0.5rem", 
                              padding: "1rem",
                              backgroundColor: "white"
                            }}>
                              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                {/* Thumbnail */}
                                {item.image_path && (
                                  <div style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "0.375rem",
                                    overflow: "hidden",
                                    backgroundColor: "#f3f4f6",
                                    flexShrink: 0
                                  }}>
                                    <img
                                      src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${item.image_path}`}
                                      alt="Clothing item"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                      }}
                                    />
                                  </div>
                                )}
                                
                                {/* Item Details */}
                                <div style={{ flex: 1 }}>
                                  <div style={{ marginBottom: "0.5rem" }}>
                                    <span style={{ 
                                      padding: "2px 8px", 
                                      borderRadius: "9999px", 
                                      backgroundColor: "#8b5cf6", 
                                      color: "white",
                                      fontSize: "12px",
                                      fontWeight: "500"
                                    }}>
                                      {item.category || "uncategorized"}
                                    </span>
                                    {item.brand && (
                                      <span style={{ 
                                        marginLeft: "0.5rem",
                                        fontSize: "14px",
                                        color: "#374151",
                                        fontWeight: "500"
                                      }}>
                                        {item.brand}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* EXIF Data */}
                                  {exifData.length > 0 && (
                                    <div style={{ 
                                      display: "flex", 
                                      flexWrap: "wrap", 
                                      gap: "0.75rem",
                                      fontSize: "12px",
                                      color: "#6b7280"
                                    }}>
                                      {exifData.map((field, index) => (
                                        <div key={index} style={{ 
                                          display: "flex", 
                                          alignItems: "center", 
                                          gap: "0.25rem" 
                                        }}>
                                          {field.icon}
                                          <span style={{ color: "#374151", fontWeight: "500" }}>
                                            {field.label}:
                                          </span>
                                          <span>{field.value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {exifData.length === 0 && (
                                    <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                                      No EXIF data available
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;