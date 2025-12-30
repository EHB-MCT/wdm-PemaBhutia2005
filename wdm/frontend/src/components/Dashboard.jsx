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

	if (loading) {
		return (
			<div className="page-container flex items-center justify-center">
				<div className="text-center">
					<div className="spinner w-8 h-8 mx-auto mb-4"></div>
					<p className="text-body">Loading your wardrobe...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="page-container">
			<Navigation />
			
			{/* Page Header */}
			<div style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
				<div className="container" style={{ padding: "1.5rem 0" }}>
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
						<div>
							<h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>Wardrobe</h1>
							<p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>Welcome back, {user?.name}</p>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
							<button
								onClick={() => navigate('/outfit-maker')}
								style={{
									padding: '0.625rem 1rem',
									backgroundColor: '#3b82f6',
									color: 'white',
									border: 'none',
									borderRadius: '0.5rem',
									fontSize: '0.875rem',
									fontWeight: '500',
									cursor: 'pointer',
									transition: 'all 200ms ease-in-out'
								}}
							>
								Outfit Maker
							</button>
							<div style={{ textAlign: "right" }}>
								<p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Items</p>
								<p style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{items.length}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<main className="container py-8">
				{/* Add Item Section */}
				<section className="mb-12">
					<div className="text-center mb-8">
						<h2 className="text-subheading mb-2">Add New Item</h2>
						<p className="text-body">Upload a photo to start organizing your wardrobe</p>
					</div>

					<div className="max-w-2xl mx-auto">
						<div className="card p-8">
							{message && <div className={`mb-6 animate-slide-up ${message.includes("success") ? "status-success" : "status-error"}`}>{message}</div>}

							<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
								{/* Image Upload */}
								<div>
									<div className="relative">
										<input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />

										<div className={`rounded-xl border-2 border-dashed p-6 transition-all duration-200 ${imagePreview ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"}`}>
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
								</div>

								<div className="space-y-6">
									{/* Details Grid */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

										<div className="form-group">
											<label htmlFor="category" className="form-label">
												Category
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
									</div>
								</div>

								<button type="submit" disabled={submitting} className="btn-primary w-full">
									{submitting ? (
										<div className="flex items-center justify-center space-x-2">
											<div className="spinner w-4 h-4"></div>
											<span>Adding to wardrobe...</span>
										</div>
									) : (
										"Add to Wardrobe"
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

						{/* Category Filter */}
						<div style={{ marginBottom: "24px", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px" }}>
							<button
								onClick={() => setSelectedCategory("all")}
								style={{
									padding: "8px 16px",
									backgroundColor: selectedCategory === "all" ? "#3b82f6" : "#f3f4f6",
									color: selectedCategory === "all" ? "white" : "#374151",
									border: "none",
									borderRadius: "8px",
									fontSize: "14px",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.2s",
								}}
							>
								All
							</button>
							<button
								onClick={() => setSelectedCategory("tops")}
								style={{
									padding: "8px 16px",
									backgroundColor: selectedCategory === "tops" ? "#3b82f6" : "#f3f4f6",
									color: selectedCategory === "tops" ? "white" : "#374151",
									border: "none",
									borderRadius: "8px",
									fontSize: "14px",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.2s",
								}}
							>
								Tops
							</button>
							<button
								onClick={() => setSelectedCategory("bottoms")}
								style={{
									padding: "8px 16px",
									backgroundColor: selectedCategory === "bottoms" ? "#3b82f6" : "#f3f4f6",
									color: selectedCategory === "bottoms" ? "white" : "#374151",
									border: "none",
									borderRadius: "8px",
									fontSize: "14px",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.2s",
								}}
							>
								Bottoms
							</button>
							<button
								onClick={() => setSelectedCategory("shoes")}
								style={{
									padding: "8px 16px",
									backgroundColor: selectedCategory === "shoes" ? "#3b82f6" : "#f3f4f6",
									color: selectedCategory === "shoes" ? "white" : "#374151",
									border: "none",
									borderRadius: "8px",
									fontSize: "14px",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.2s",
								}}
							>
								Shoes
							</button>
							<button
								onClick={() => setSelectedCategory("sweaters")}
								style={{
									padding: "8px 16px",
									backgroundColor: selectedCategory === "sweaters" ? "#3b82f6" : "#f3f4f6",
									color: selectedCategory === "sweaters" ? "white" : "#374151",
									border: "none",
									borderRadius: "8px",
									fontSize: "14px",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.2s",
								}}
							>
								Sweaters
							</button>
							<button
								onClick={() => setSelectedCategory("jackets")}
								style={{
									padding: "8px 16px",
									backgroundColor: selectedCategory === "jackets" ? "#3b82f6" : "#f3f4f6",
									color: selectedCategory === "jackets" ? "white" : "#374151",
									border: "none",
									borderRadius: "8px",
									fontSize: "14px",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.2s",
								}}
							>
								Jackets
							</button>
							<button
								onClick={() => setSelectedCategory("accessories")}
								style={{
									padding: "8px 16px",
									backgroundColor: selectedCategory === "accessories" ? "#3b82f6" : "#f3f4f6",
									color: selectedCategory === "accessories" ? "white" : "#374151",
									border: "none",
									borderRadius: "8px",
									fontSize: "14px",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.2s",
								}}
							>
								Accessories
							</button>
						</div>
					</div>

					{items.length === 0 ? (
						<div className="text-center py-16">
							<h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
							<p className="text-body text-center max-w-md mx-auto">Start building your wardrobe by adding your first clothing item above.</p>
						</div>
					) : (
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(5, 1fr)",
								gap: "16px",
								maxWidth: "1280px",
								margin: "0 auto",
							}}
						>
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
										<div style={{ display: "flex" }}>
											{item.image_path && (
												<div
													style={{
														width: "150px",
														height: "150px",
														overflow: "hidden",
														borderRadius: "12px 0 0 12px",
														backgroundColor: "#f3f4f6",
														flexShrink: "0",
													}}
												>
													<img
														src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${item.image_path}`}
														alt="Clothing item"
														style={{
															width: "150px",
															height: "150px",
															objectFit: "cover",
														}}
													/>
												</div>
											)}
											<div style={{ flex: "1", padding: "16px" }}>
												<div style={{ marginBottom: "12px" }}>
													{item.brand && <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827", margin: "0 0 4px 0" }}>{item.brand}</p>}
													<div style={{ display: "flex", flexWrap: "wrap", gap: "4px", fontSize: "12px" }}>
														{item.price && <span style={{ padding: "2px 8px", borderRadius: "9999px", backgroundColor: "#f3f4f6", color: "#374151" }}>${item.price}</span>}
														{item.season && <span style={{ padding: "2px 8px", borderRadius: "9999px", backgroundColor: "#dbeafe", color: "#1e40af" }}>{item.season}</span>}
														{item.size && <span style={{ padding: "2px 8px", borderRadius: "9999px", backgroundColor: "#d1fae5", color: "#065f46" }}>{item.size}</span>}
														{item.category && <span style={{ padding: "2px 8px", borderRadius: "9999px", backgroundColor: "#8b5cf6", color: "white" }}>{item.category}</span>}
													</div>
												</div>
												<button
													onClick={() => handleDelete(item.id)}
													style={{
														width: "100%",
														padding: "8px 16px",
														backgroundColor: "#dc2626",
														color: "white",
														border: "none",
														borderRadius: "8px",
														fontSize: "14px",
														fontWeight: "500",
														cursor: "pointer",
														transition: "background-color 0.2s",
													}}
												>
													Remove
												</button>
											</div>
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
