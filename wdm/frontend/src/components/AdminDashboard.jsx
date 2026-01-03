import { useState, useEffect } from "react";
import Navigation from "./Navigation";
import UserCard from "./UserCard";
import PhotoHistogramChart from "./charts/PhotoHistogramChart";
import WardrobeClassChart from "./charts/WardrobeClassChart";
import { adminAPI } from "../services/api";
import { FiShield } from "react-icons/fi";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, BubbleController, PointElement } from 'chart.js';
import { Bubble } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  filterUsersByEconomicStatus, 
  calculateUserStats, 
  getBubbleChartData, 
  getBubbleChartOptions,
  formatExifData 
} from "../utils/adminHelpers";

ChartJS.register(CategoryScale, LinearScale, BarElement, BubbleController, PointElement);

const AdminDashboard = () => {
  const [usersWithItems, setUsersWithItems] = useState([]);
  const [histogramData, setHistogramData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [priceTierData, setPriceTierData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [economicStatusFilter, setEconomicStatusFilter] = useState("All");

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

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId === selectedUserId ? null : userId);
  };

  const filteredLocationData = selectedUserId
    ? locationData.filter(user => user.userId === selectedUserId)
    : locationData;

  const stats = calculateUserStats(usersWithItems, selectedUserId);
  const bubbleChartData = getBubbleChartData(usersWithItems, selectedUserId);
  const bubbleChartOptions = getBubbleChartOptions();

  const renderUserSection = (title, isAdmin, allUsers) => {
    const filteredUsers = filterUsersByEconomicStatus(allUsers, economicStatusFilter);
    
    if (filteredUsers.length === 0 && economicStatusFilter === "All") return null;

    return (
      <>
        <div style={{ 
          fontSize: "0.75rem", 
          fontWeight: "600", 
          color: isAdmin ? "#dc2626" : "#374151", 
          marginBottom: "0.5rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em"
        }}>
          {title} ({filteredUsers.length}{economicStatusFilter !== "All" ? `/${allUsers.length}` : ""})
        </div>
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isSelected={user.id === selectedUserId}
            onSelect={handleUserSelect}
            isAdmin={isAdmin}
          />
        ))}
        {economicStatusFilter !== "All" && filteredUsers.length === 0 && (
          <div style={{ 
            padding: "1rem", 
            textAlign: "center", 
            color: "#6b7280", 
            fontSize: "0.875rem",
            backgroundColor: "#f9fafb",
            borderRadius: "0.375rem",
            marginBottom: "0.5rem"
          }}>
            No {isAdmin ? "administrators" : "regular users"} with "{economicStatusFilter}" status
          </div>
        )}
        <div style={{ 
          height: "1px", 
          backgroundColor: "#e5e7eb", 
          margin: "1rem 0" 
        }} />
      </>
    );
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
      
      <div className="nav-content" style={{ paddingTop: "2rem" }}>
        <div style={{ backgroundColor: "#fef2f2", borderBottom: "1px solid #fecaca", padding: "1.5rem 0", marginBottom: "2rem" }}>
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

        <main>
          <div style={{ display: "flex", gap: "2rem" }}>
            {error && (
              <div className="status-error mb-6" style={{ gridColumn: "1 / -1" }}>
                {error}
              </div>
            )}

            {usersWithItems.length === 0 ? (
              <div className="text-center py-16" style={{ gridColumn: "1 / -1" }}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-body">No users have registered yet.</p>
              </div>
            ) : (
              <>
                <aside style={{ width: "300px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
                  <div className="card" style={{ padding: "1rem", height: "100%", display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center" }}>
                      👥 Users
                    </h3>
                    {selectedUserId && (
                      <button
                        onClick={() => setSelectedUserId(null)}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          marginBottom: "1rem",
                          backgroundColor: "#f3f4f6",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.375rem",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          flexShrink: 0
                        }}
                      >
                        ← Show All Users
                      </button>
                    )}

                    <div style={{ marginBottom: "1rem", flexShrink: 0 }}>
                      <label style={{ 
                        fontSize: "0.875rem", 
                        fontWeight: "500", 
                        color: "#374151", 
                        display: "block", 
                        marginBottom: "0.5rem" 
                      }}>
                        Filter by Economic Status:
                      </label>
                      <select
                        value={economicStatusFilter}
                        onChange={(e) => setEconomicStatusFilter(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.375rem",
                          fontSize: "0.875rem",
                          backgroundColor: "white",
                          cursor: "pointer"
                        }}
                      >
                        <option value="All">All Users</option>
                        <option value="Budget-Conscious">🟢 Budget-Conscious</option>
                        <option value="Middle Class">🔵 Middle Class</option>
                        <option value="Upper Middle Class">🟣 Upper Middle Class</option>
                        <option value="Affluent">🟠 Affluent</option>
                        <option value="High Net Worth">🔴 High Net Worth</option>
                        <option value="No Data">⚪ No Data</option>
                      </select>
                    </div>
                    
                    <div style={{ height: "1200px", overflowY: "auto" }}>
                      {renderUserSection(
                        "👑 Administrators", 
                        true, 
                        usersWithItems.filter(user => user.is_admin === 1 || user.is_admin === true)
                      )}
                      {renderUserSection(
                        "👥 Regular Users", 
                        false, 
                        usersWithItems.filter(user => !user.is_admin || user.is_admin === 0)
                      )}
                    </div>
                  </div>
                </aside>

                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                    gap: "1rem", 
                    marginBottom: "2rem" 
                  }}>
                    <div className="card">
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          {selectedUserId ? "Selected User" : "Total Users"}
                        </p>
                        <p style={{ fontSize: "2rem", fontWeight: "600", color: "#111827" }}>
                          {stats.totalUsers}
                        </p>
                      </div>
                    </div>
                    <div className="card">
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Total Items</p>
                        <p style={{ fontSize: "2rem", fontWeight: "600", color: "#111827" }}>
                          {stats.totalItems}
                        </p>
                      </div>
                    </div>
                    <div className="card">
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Avg Item Price</p>
                        <p style={{ fontSize: "2rem", fontWeight: "600", color: "#111827" }}>
                          ${stats.avgItemPrice}
                        </p>
                      </div>
                    </div>
                    <div className="card">
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Items with GPS</p>
                        <p style={{ fontSize: "2rem", fontWeight: "600", color: "#111827" }}>
                          {stats.itemsWithGPS}
                        </p>
                      </div>
                    </div>
                  </div>

                  <PhotoHistogramChart 
                    histogramData={histogramData} 
                    selectedUserId={selectedUserId} 
                    usersWithItems={usersWithItems} 
                  />

                  <WardrobeClassChart 
                    priceTierData={priceTierData} 
                    selectedUserId={selectedUserId} 
                  />

                  <div style={{ marginTop: "2rem" }}>
                    <div className="card" style={{ padding: "1.5rem" }}>
                      <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center" }}>
                        📊 Wardrobe Value vs. Item Count Analysis
                      </h2>
                      <div style={{ height: "500px", position: "relative" }}>
                        {bubbleChartData.datasets[0].data.length > 0 ? (
                          <Bubble data={bubbleChartData} options={bubbleChartOptions} />
                        ) : (
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            height: "100%",
                            color: "#6b7280" 
                          }}>
                            No price data available for bubble chart analysis
                          </div>
                        )}
                      </div>
                      <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <div style={{ padding: "1rem", backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "0.5rem" }}>
                          <h4 style={{ margin: "0 0 8px 0", color: "#0369a1", fontSize: "14px", fontWeight: "600" }}>🔵 X-Axis: Item Count</h4>
                          <p style={{ margin: "0", color: "#075985", fontSize: "12px" }}>Number of items in user's wardrobe</p>
                        </div>
                        <div style={{ padding: "1rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.5rem" }}>
                          <h4 style={{ margin: "0 0 8px 0", color: "#166534", fontSize: "14px", fontWeight: "600" }}>🟢 Y-Axis: Total Value</h4>
                          <p style={{ margin: "0", color: "#15803d", fontSize: "12px" }}>Combined value of all items</p>
                        </div>
                        <div style={{ padding: "1rem", backgroundColor: "#fef3c7", border: "1px solid #fed7aa", borderRadius: "0.5rem" }}>
                          <h4 style={{ margin: "0 0 8px 0", color: "#d97706", fontSize: "14px", fontWeight: "600" }}>🟠 Bubble Size: Avg Price</h4>
                          <p style={{ margin: "0", color: "#b45309", fontSize: "12px" }}>Average price per item</p>
                        </div>
                        <div style={{ padding: "1rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.5rem" }}>
                          <h4 style={{ margin: "0 0 8px 0", color: "#dc2626", fontSize: "14px", fontWeight: "600" }}>🔴 Color: Upload Frequency</h4>
                          <p style={{ margin: "0", color: "#b91c1c", fontSize: "12px" }}>How often user adds items</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "2rem" }}>
                    <div className="card" style={{ padding: "1.5rem" }}>
                      <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center" }}>
                        🗺 User Locations Worldwide
                      </h2>
                      <div style={{ height: "500px", position: "relative", borderRadius: "0.5rem", overflow: "hidden" }}>
                        {filteredLocationData.length > 0 ? (
                          <MapContainer 
                            center={[20, 0]} 
                            zoom={2} 
                            style={{ height: "100%", width: "100%" }}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            {filteredLocationData.filter(user => user.centroid).map(user => (
                              <Circle
                                key={`centroid-${user.userId}`}
                                center={[user.centroid.lat, user.centroid.lng]}
                                radius={500000}
                                fillColor="rgba(59, 130, 246, 0.1)"
                                color="rgba(59, 130, 246, 0.3)"
                                weight={1}
                              />
                            ))}
                            
                            {filteredLocationData.map(user => (
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
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;