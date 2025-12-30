import { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { adminAPI } from "../services/api";
import { FiShield, FiMapPin, FiCamera, FiCalendar, FiPackage } from "react-icons/fi";

const AdminDashboard = () => {
  const [usersWithItems, setUsersWithItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedUsers, setExpandedUsers] = useState(new Set());

  useEffect(() => {
    fetchUsersWithItems();
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

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
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
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Items with GPS</p>
                  <p style={{ fontSize: "2rem", fontWeight: "600", color: "#111827" }}>
                    {usersWithItems.reduce((sum, user) => 
                      sum + user.items.filter(item => item.gps_lat && item.gps_lon).length, 0
                    )}
                  </p>
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
                      <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                        {user.email} • {user.items.length} items
                      </p>
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