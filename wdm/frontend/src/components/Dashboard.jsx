import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clothingAPI } from "../services/api";
import Navigation from "./Navigation";
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
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);


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

	const triggerFileUpload = () => {
		const fileInput = document.getElementById('image-upload');
		if (fileInput) {
			fileInput.click();
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!imageFile) {
			setMessage("Please select an image");
			return;
		}

		if (!formData.category) {
			setMessage("Please select a category");
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
	};

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

	// Add Item Modal Component
	const AddItemModal = () => {
		if (!showAddModal) return null;

		return (
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 1000,
					padding: "20px",
				}}
			>
				<div
					style={{
						background: "white",
						borderRadius: "16px",
						maxWidth: "800px",
						width: "100%",
						maxHeight: "90vh",
						overflowY: "auto",
						position: "relative",
					}}
				>
					{/* Close button */}
					<button
						onClick={() => setShowAddModal(false)}
						style={{
							position: "absolute",
							top: "16px",
							right: "16px",
							background: "none",
							border: "none",
							fontSize: "24px",
							cursor: "pointer",
							color: "#6b7280",
							zIndex: 1,
						}}
					>
						×
					</button>

					<div className="card" style={{ border: "none", boxShadow: "none" }}>
						<div className="text-center mb-8" style={{ paddingTop: "32px" }}>
							<h2 className="text-subheading mb-2">Add New Item</h2>
							<p className="text-body">Upload a photo to start organizing your wardrobe</p>
						</div>

						{message && (
							<div className={`mb-6 animate-slide-up ${message.includes("success") ? "status-success" : "status-error"}`} style={{ margin: "0 24px" }}>
								{message}
							</div>
						)}

						<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start" style={{ padding: "0 24px 24px" }}>
								{/* Image Upload */}
								<div>
									<input 
										id="image-upload"
										type="file" 
										accept="image/*" 
										onChange={handleImageUpload} 
										style={{ display: 'none' }} 
									/>

									<div 
										onClick={triggerFileUpload}
										className={`rounded-xl border-2 border-dashed p-6 transition-all duration-200 cursor-pointer ${imagePreview ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"}`}
									>
										<div className="flex items-start gap-4">
											{/* Preview (fixed size, left-aligned) */}
											<div
												style={{
													width: "128px",
													height: "128px",
													overflow: "hidden",
													borderRadius: "12px",
													background: "#e5e7eb",
													flexShrink: 0,
												}}
											>
												{imagePreview ? (
													<img
														src={imagePreview}
														alt="Preview"
														style={{
															width: "100%",
															height: "100%",
															objectFit: "cover",
															display: "block",
														}}
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center">
														<FiPlus className="text-gray-400" size={20} />
													</div>
												)}
											</div>

											{/* Text */}
											<div className="flex-1">
												<p className="text-medium text-gray-900">{imagePreview ? "Click to change photo" : "Click to upload a photo"}</p>
												<p className="text-small text-gray-500 mt-1">PNG, JPG up to 5MB</p>
												<p className="text-xs text-gray-400 mt-3">Tip: upload a clear photo with the item centered.</p>
											</div>
										</div>
									</div>
								</div>

							<div className="space-y-6">
								{/* Details Grid */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="form-group">
										<label htmlFor="category" className="form-label">
											Category <span style={{ color: "#dc2626" }}>*</span>
										</label>
										<select id="category" name="category" value={formData.category} onChange={handleChange} className="input-field">
											<option value="">Select category</option>
											<option value="tops">Tops</option>
											<option value="bottoms">Bottoms</option>
											<option value="shoes">Shoes</option>
											<option value="sweaters">Sweaters</option>
											<option value="jackets">Jackets</option>
											<option value="accessories">Accessories</option>
										</select>
									</div>

									<div className="form-group">
										<label htmlFor="brand" className="form-label">
											Brand
										</label>
										<input id="brand" name="brand" type="text" value={formData.brand} onChange={handleChange} placeholder="e.g. Nike, Zara" className="input-field" />
									</div>

									<div className="form-group">
										<label htmlFor="price" className="form-label">
											Price
										</label>
										<input id="price" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="0.00" step="0.01" className="input-field" />
									</div>

									<div className="form-group">
										<label htmlFor="season" className="form-label">
											Season
										</label>
										<select id="season" name="season" value={formData.season} onChange={handleChange} className="input-field">
											<option value="">Select season</option>
											<option value="Spring">Spring</option>
											<option value="Summer">Summer</option>
											<option value="Fall">Fall</option>
											<option value="Winter">Winter</option>
										</select>
									</div>

									<div className="form-group">
										<label htmlFor="size" className="form-label">
											Size
										</label>
										<select id="size" name="size" value={formData.size} onChange={handleChange} className="input-field">
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
							</div>

							<div className="grid grid-cols-2 gap-4" style={{ gridColumn: "1 / -1" }}>
								<button
									type="button"
									onClick={() => setShowAddModal(false)}
									style={{
										padding: "12px 24px",
										backgroundColor: "#f3f4f6",
										color: "#374151",
										border: "none",
										borderRadius: "8px",
										fontSize: "14px",
										fontWeight: "500",
										cursor: "pointer",
										transition: "all 200ms ease-in-out",
									}}
								>
									Cancel
								</button>
								<button type="submit" disabled={submitting} className="btn-primary">
									{submitting ? <span>Adding to wardrobe...</span> : "Add to Wardrobe"}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
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
													src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${item.image_path}`}
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

				<AddItemModal />
			</div>
		</div>
	);
};

export default Dashboard;
