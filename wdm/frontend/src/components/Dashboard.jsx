import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clothingAPI } from "../services/api";
import Navigation from "./Navigation";
import AddItemModal from "./AddItemModal";
import { FiPlus } from "react-icons/fi";

const Dashboard = () => {
	const [items, setItems] = useState([]);
	const [formData, setFormData] = useState({
		brand: "",
		price: "",
		season: "",
		size: "",
		category: "",
	});

	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState("all");


	const { user, logout } = useAuth();
	const navigate = useNavigate();

	// Fetch user's clothing items
	useEffect(() => {
		fetchItems();
	}, []);

const fetchItems = async () => {
		try {
			const items = await clothingAPI.getAll();
			console.log("Fetched items:", items);
			setItems(items);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching items:", error);
			setMessage("Error loading items");
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

const triggerFileUpload = useCallback(() => {
		const fileInput = document.getElementById('image-upload');
		if (fileInput) {
			fileInput.click();
		}
	}, []);

const handleChange = useCallback((e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	}, []);

	const handleSubmit = useCallback(async (e) => {
		e.preventDefault();

		if (!imageFile) {
			setMessage("Please select an image");
			return;
		}

		if (!formData.category) {
			setMessage("Please select a category");
			return;
		}

		if (!formData.price) {
			setMessage("Please enter a price");
			return;
		}

		setSubmitting(true);
		setMessage("");

		const formDataToSend = new FormData();
		formDataToSend.append("image", imageFile);
		formDataToSend.append("brand", formData.brand);
		formDataToSend.append("price", formData.price);
		formDataToSend.append("season", formData.season);
		formDataToSend.append("size", formData.size);
		formDataToSend.append("category", formData.category);

		try {
			const newItem = await clothingAPI.create(formDataToSend);
			setItems([newItem, ...items]);

			// Reset form
			setFormData({ brand: "", price: "", season: "", size: "", category: "" });
			setImageFile(null);
			setImagePreview(null);
			setMessage("Item added successfully!");
			setShowAddModal(false);

			// Clear message after 3 seconds
			setTimeout(() => setMessage(""), 3000);
} catch (error) {
			console.error("Error adding item:", error);
			setMessage("Error adding item");
		} finally {
			setSubmitting(false);
		}
	}, [imageFile, formData]);

	const handleDelete = async (itemId) => {
		if (!window.confirm("Are you sure you want to delete this item?")) {
			return;
		}

		try {
			await clothingAPI.delete(itemId);
			setItems(items.filter((item) => item.id !== itemId));
			setMessage("Item deleted successfully!");
			setTimeout(() => setMessage(""), 3000);
		} catch (error) {
			console.error("Error deleting item:", error);
			setMessage("Error deleting item");
		}
	};



	const handleLogout = () => {
		logout();
		navigate("/login");
	};



	if (loading) {
		return (
			<div className="page-container flex items-center justify-center">
				<div className="text-center">
					<p className="text-body">Loading your wardrobe...</p>
				</div>
			</div>
		);
	}

		return (
		<div className="page-container">
			<Navigation />

			<div className="nav-content" style={{ paddingTop: "2rem" }}>
				{/* Page Header */}
				<div style={{ backgroundColor: "var(--color-gray-50)", borderBottom: "1px solid var(--color-gray-200)", padding: "1.5rem 0", marginBottom: "2rem" }}>
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
						<div>
							<h1 className="text-heading">Wardrobe</h1>
							<p className="text-small" style={{ marginTop: "0.25rem" }}>Welcome back, {user?.name}</p>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
							<button
								onClick={() => navigate("/outfit-maker")}
								className="btn-primary"
							>
								Outfit Maker
							</button>
							<div style={{ textAlign: "right" }}>
								<p className="text-small">Items</p>
								<p className="text-heading">{items.length}</p>
							</div>
						</div>
					</div>
				</div>

				<main>
				{items.length === 0 ? (
					<div className="text-center" style={{ padding: "var(--space-16) 0" }}>
						<h3 className="text-subheading">No items yet</h3>
						<p className="text-body" style={{ maxWidth: "28rem", margin: "0 auto" }}>Start building your wardrobe by adding your first clothing item.</p>
						
						<div style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-8)" }}>
							<div
								onClick={() => setShowAddModal(true)}
								className="card card-hover"
								style={{
									cursor: "pointer",
									border: "2px dashed var(--color-gray-300)",
									background: "var(--color-gray-50)",
									width: "200px",
									height: "300px",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									transition: "var(--transition-normal)",
									borderRadius: "0.75rem",
								}}
								onMouseOver={(e) => {
									e.target.style.borderColor = "#3b82f6";
									e.target.style.backgroundColor = "#eff6ff";
								}}
								onMouseOut={(e) => {
									e.target.style.borderColor = "#d1d5db";
									e.target.style.backgroundColor = "#f9fafb";
								}}
							>
								<div
									style={{
										width: "60px",
										height: "60px",
										borderRadius: "50%",
										background: "var(--color-gray-200)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										marginBottom: "var(--space-4)",
									}}
								>
									<FiPlus size={24} color="var(--color-gray-400)" />
								</div>
								<p className="text-subheading" style={{ margin: "0" }}>Add First Item</p>
								<p className="text-small" style={{ margin: "var(--space-1) 0 0 0" }}>Click to add clothing</p>
							</div>
						</div>
					</div>
				) : (
					<div>
						{/* Category Filter */}
						<div style={{ marginBottom: "var(--space-8)", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "var(--space-2)" }}>
							<button
								onClick={() => setSelectedCategory("all")}
								className={selectedCategory === "all" ? "btn-primary" : "btn-secondary"}
								style={{
									padding: "var(--space-2) var(--space-4)",
									fontSize: "14px",
								}}
							>
								All
							</button>
							<button
								onClick={() => setSelectedCategory("tops")}
								className={selectedCategory === "tops" ? "btn-primary" : "btn-secondary"}
								style={{
									padding: "var(--space-2) var(--space-4)",
									fontSize: "14px",
								}}
							>
								Tops
							</button>
							<button
								onClick={() => setSelectedCategory("bottoms")}
								className={selectedCategory === "bottoms" ? "btn-primary" : "btn-secondary"}
								style={{
									padding: "var(--space-2) var(--space-4)",
									fontSize: "14px",
								}}
							>
								Bottoms
							</button>
							<button
								onClick={() => setSelectedCategory("shoes")}
								className={selectedCategory === "shoes" ? "btn-primary" : "btn-secondary"}
								style={{
									padding: "var(--space-2) var(--space-4)",
									fontSize: "14px",
								}}
							>
								Shoes
							</button>
							<button
								onClick={() => setSelectedCategory("sweaters")}
								className={selectedCategory === "sweaters" ? "btn-primary" : "btn-secondary"}
								style={{
									padding: "var(--space-2) var(--space-4)",
									fontSize: "14px",
								}}
							>
								Sweaters
							</button>
							<button
								onClick={() => setSelectedCategory("jackets")}
								className={selectedCategory === "jackets" ? "btn-primary" : "btn-secondary"}
								style={{
									padding: "var(--space-2) var(--space-4)",
									fontSize: "14px",
								}}
							>
								Jackets
							</button>
							<button
								onClick={() => setSelectedCategory("accessories")}
								className={selectedCategory === "accessories" ? "btn-primary" : "btn-secondary"}
								style={{
									padding: "var(--space-2) var(--space-4)",
									fontSize: "14px",
								}}
							>
								Accessories
							</button>
						</div>

						{/* Items Grid */}
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
								gap: "var(--space-5)",
								maxWidth: "80rem",
								margin: "0 auto",
							}}
						>
							{/* Add Item Card */}
							<div
								onClick={() => setShowAddModal(true)}
								className="card card-hover"
								style={{
									cursor: "pointer",
									border: "2px dashed var(--color-gray-300)",
									background: "var(--color-gray-50)",
									minHeight: "300px",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									transition: "var(--transition-normal)",
									borderRadius: "0.75rem",
								}}
								onMouseOver={(e) => {
									e.target.style.borderColor = "#3b82f6";
									e.target.style.backgroundColor = "#eff6ff";
								}}
								onMouseOut={(e) => {
									e.target.style.borderColor = "#d1d5db";
									e.target.style.backgroundColor = "#f9fafb";
								}}
							>
								<div
									style={{
										width: "60px",
										height: "60px",
										borderRadius: "50%",
										background: "var(--color-gray-200)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										marginBottom: "var(--space-4)",
									}}
								>
									<FiPlus size={24} color="var(--color-gray-400)" />
								</div>
								<p className="text-subheading" style={{ margin: "0" }}>Add New Item</p>
								<p className="text-small" style={{ margin: "var(--space-1) 0 0 0" }}>Click to add clothing</p>
							</div>

							{items
								.filter((item) => selectedCategory === "all" || item.category === selectedCategory)
								.map((item, index) => (
									<div
										key={item.id}
										className="card card-hover group stagger-item"
										style={{
											animationDelay: `${index * 0.1}s`,
											width: "100%",
										}}
									>
										{item.image_path && (
											<div
												style={{
													width: "100%",
													height: "200px",
													overflow: "hidden",
													borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
													backgroundColor: "var(--color-gray-100)",
												}}
											>
												<img
													src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000"}/uploads/${item.image_path}`}
													alt="Clothing item"
													style={{
														width: "100%",
														height: "100%",
														objectFit: "cover",
													}}
												/>
											</div>
										)}
										<div style={{ padding: "var(--space-4)" }}>
											<div style={{ marginBottom: "var(--space-3)" }}>
												{item.brand && <p className="text-small" style={{ fontWeight: "500", color: "var(--color-gray-900)", margin: "0 0 var(--space-1) 0" }}>{item.brand}</p>}
												<div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)", fontSize: "12px" }}>
													{item.price && <span style={{ padding: "var(--space-1) var(--space-2)", borderRadius: "9999px", backgroundColor: "var(--color-gray-100)", color: "var(--color-gray-700)" }}>${item.price}</span>}
													{item.season && <span style={{ padding: "var(--space-1) var(--space-2)", borderRadius: "9999px", backgroundColor: "#dbeafe", color: "#1e40af" }}>{item.season}</span>}
													{item.size && <span style={{ padding: "var(--space-1) var(--space-2)", borderRadius: "9999px", backgroundColor: "#d1fae5", color: "#065f46" }}>{item.size}</span>}
													{item.category && <span style={{ padding: "var(--space-1) var(--space-2)", borderRadius: "9999px", backgroundColor: "#8b5cf6", color: "white" }}>{item.category}</span>}
												</div>
											</div>
											<button
												onClick={() => handleDelete(item.id)}
												className="btn-danger"
												style={{
													width: "100%",
													padding: "var(--space-2) var(--space-4)",
													fontSize: "14px",
												}}
											>
												Remove
											</button>
										</div>
									</div>
								))}
						</div>
					</div>
				)}
				</main>

				<AddItemModal 
				showAddModal={showAddModal}
				formData={formData}
				imageFile={imageFile}
				imagePreview={imagePreview}
				submitting={submitting}
				message={message}
				handleChange={handleChange}
				handleSubmit={handleSubmit}
				handleImageUpload={handleImageUpload}
				setShowAddModal={setShowAddModal}
			/>
			</div>
		</div>
	);
};

export default Dashboard;
