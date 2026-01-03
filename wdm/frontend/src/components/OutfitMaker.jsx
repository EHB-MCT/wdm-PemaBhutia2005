import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clothingAPI, outfitAPI } from "../services/api";
import Navigation from "./Navigation";

const OutfitMaker = () => {
	const [items, setItems] = useState([]);
	const [tops, setTops] = useState([]);
	const [bottoms, setBottoms] = useState([]);
	const [shoes, setShoes] = useState([]);
	const [topIndex, setTopIndex] = useState(0);
	const [bottomIndex, setBottomIndex] = useState(0);
	const [shoesIndex, setShoesIndex] = useState(0);
	const [outfitName, setOutfitName] = useState("");
	const [savedOutfits, setSavedOutfits] = useState([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [itemsLoading, setItemsLoading] = useState(true);

	const { user, logout } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		fetchItems();
		fetchSavedOutfits();
	}, []);

	const fetchItems = async () => {
		try {
			const items = await clothingAPI.getAll();
			// Add imageUrl to each item
			const itemsWithUrls = items.map(item => ({
				...item,
				imageUrl: `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${item.image_path}`,
				name: item.brand || `${item.category} item`
			}));
			setItems(itemsWithUrls);

			// Filter items by category
			const topsItems = itemsWithUrls.filter((item) => ["tops", "sweaters", "jackets"].includes(item?.category));
			const bottomsItems = itemsWithUrls.filter((item) => ["bottoms"].includes(item?.category));
			const shoesItems = itemsWithUrls.filter((item) => ["shoes"].includes(item?.category));

			setTops(topsItems);
			setBottoms(bottomsItems);
			setShoes(shoesItems);
			setItemsLoading(false);
		} catch (error) {
			console.error("Error fetching items:", error);
			setMessage("Error loading clothing items");
			setItemsLoading(false);
		}
	};

const fetchSavedOutfits = async () => {
		try {
			const outfits = await outfitAPI.getAll();
			// Add image URLs to outfit items
			const outfitsWithImages = outfits.map(outfit => ({
				...outfit,
				top: outfit.top_id ? {
					...outfit,
					imageUrl: `${import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000"}/uploads/${outfit.top_image}`,
					brand: outfit.top_brand,
					name: outfit.top_brand || `${outfit.top_category} item`
				} : null,
				bottom: outfit.bottom_id ? {
					...outfit,
					imageUrl: `${import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000"}/uploads/${outfit.bottom_image}`,
					brand: outfit.bottom_brand,
					name: outfit.bottom_brand || `${outfit.bottom_category} item`
				} : null,
				shoes: outfit.shoes_id ? {
					...outfit,
					imageUrl: `${import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000"}/uploads/${outfit.shoes_image}`,
					brand: outfit.shoes_brand,
					name: outfit.shoes_brand || `${outfit.shoes_category} item`
				} : null
			}));
			setSavedOutfits(outfitsWithImages);
		} catch (error) {
			console.error("Error fetching outfits:", error);
		}
	};

	const handleSaveOutfit = async () => {
		if (!outfitName.trim()) {
			setMessage("Please enter an outfit name");
			setTimeout(() => setMessage(""), 3000);
			return;
		}

		setLoading(true);
		try {
			await outfitAPI.create({
				name: outfitName,
				topId: tops[topIndex]?.id || null,
				bottomId: bottoms[bottomIndex]?.id || null,
				shoesId: shoes[shoesIndex]?.id || null,
			});

			setOutfitName("");
			setMessage("Outfit saved successfully!");
			fetchSavedOutfits();
			setTimeout(() => setMessage(""), 3000);
		} catch (error) {
			console.error("Error saving outfit:", error);
			setMessage("Error saving outfit");
			setTimeout(() => setMessage(""), 3000);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteOutfit = async (outfitId) => {
		if (!window.confirm("Are you sure you want to delete this outfit?")) {
			return;
		}

		try {
			await outfitAPI.delete(outfitId);
			setMessage("Outfit deleted successfully!");
			fetchSavedOutfits();
			setTimeout(() => setMessage(""), 3000);
		} catch (error) {
			console.error("Error deleting outfit:", error);
			setMessage("Error deleting outfit");
			setTimeout(() => setMessage(""), 3000);
		}
	};

	const currentTop = tops[topIndex];
	const currentBottom = bottoms[bottomIndex];
	const currentShoes = shoes[shoesIndex];

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	if (itemsLoading) {
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
							<h1 className="text-heading">Outfit Maker</h1>
							<p className="text-small" style={{ marginTop: "0.25rem" }}>Create outfit combinations from your wardrobe</p>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
							<div style={{ textAlign: "right" }}>
								<p className="text-small">Items in wardrobe</p>
								<p className="text-heading">{items.length}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<main>
				{message && <div className="status-success">{message}</div>}

				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }}>
					{/* Outfit Preview */}
					<div>
						<h2 className="text-subheading" style={{ marginBottom: "var(--space-4)" }}>Current Outfit</h2>
						<div className="card" style={{ padding: "var(--space-4)", minHeight: "600px" }}>
							{/* Tops/Jackets/Sweaters */}
							<div style={{ marginBottom: "var(--space-4)", textAlign: "center" }}>
								{currentTop ? (
									<>
										<img src={currentTop.imageUrl} alt="top" style={{ width: "100%", maxWidth: "200px", height: "auto", maxHeight: "200px", objectFit: "contain" }} />
										<p className="text-small" style={{ marginTop: "var(--space-2)" }}>{currentTop.name}</p>
									</>
								) : (
									<div style={{ width: "100%", maxWidth: "200px", height: "200px", border: "2px dashed var(--color-gray-300)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "var(--color-gray-400)" }}>
										No tops available
									</div>
								)}
							</div>

							{/* Bottoms */}
							<div style={{ marginBottom: "var(--space-4)", textAlign: "center" }}>
								{currentBottom ? (
									<>
										<img src={currentBottom.imageUrl} alt="bottom" style={{ width: "100%", maxWidth: "200px", height: "auto", maxHeight: "200px", objectFit: "contain" }} />
										<p className="text-small" style={{ marginTop: "var(--space-2)" }}>{currentBottom.name}</p>
									</>
								) : (
									<div style={{ width: "100%", maxWidth: "200px", height: "200px", border: "2px dashed var(--color-gray-300)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "var(--color-gray-400)" }}>
										No bottoms available
									</div>
								)}
							</div>

							{/* Shoes */}
							<div style={{ textAlign: "center" }}>
								{currentShoes ? (
									<>
										<img src={currentShoes.imageUrl} alt="shoes" style={{ width: "100%", maxWidth: "200px", height: "auto", maxHeight: "200px", objectFit: "contain" }} />
										<p className="text-small" style={{ marginTop: "var(--space-2)" }}>{currentShoes.name}</p>
									</>
								) : (
									<div style={{ width: "100%", maxWidth: "200px", height: "200px", border: "2px dashed var(--color-gray-300)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "var(--color-gray-400)" }}>
										No shoes available
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Controls */}
					<div>
						<h2 className="text-subheading" style={{ marginBottom: "var(--space-4)" }}>Customize</h2>
						<div className="card" style={{ padding: "var(--space-4)" }}>
							{/* Tops Section */}
							<div style={{ marginBottom: "var(--space-6)" }}>
								<label className="form-label">Tops/Jackets/Sweaters</label>
								<div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
									<button 
										onClick={() => setTopIndex((prev) => (prev - 1 + tops.length) % tops.length)}
										disabled={tops.length === 0}
										className={tops.length > 0 ? "btn-primary" : "btn-secondary"}
										style={{ 
											padding: "var(--space-2)", 
											fontSize: "1rem"
										}}
									>
										←
									</button>
									<div style={{ flex: 1, textAlign: "center", padding: "var(--space-2)", backgroundColor: "var(--color-gray-50)", borderRadius: "var(--radius-sm)" }}>
										{tops.length > 0 ? tops[topIndex]?.name || "Select a top" : "No tops available"}
									</div>
									<button 
										onClick={() => setTopIndex((prev) => (prev + 1) % tops.length)}
										disabled={tops.length === 0}
										className={tops.length > 0 ? "btn-primary" : "btn-secondary"}
										style={{ 
											padding: "var(--space-2)", 
											fontSize: "1rem"
										}}
									>
										→
									</button>
								</div>
							</div>

							{/* Bottoms Section */}
							<div style={{ marginBottom: "var(--space-6)" }}>
								<label className="form-label">Bottoms</label>
								<div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
									<button 
										onClick={() => setBottomIndex((prev) => (prev - 1 + bottoms.length) % bottoms.length)}
										disabled={bottoms.length === 0}
										className={bottoms.length > 0 ? "btn-primary" : "btn-secondary"}
										style={{ 
											padding: "var(--space-2)", 
											fontSize: "1rem"
										}}
									>
										←
									</button>
									<div style={{ flex: 1, textAlign: "center", padding: "var(--space-2)", backgroundColor: "var(--color-gray-50)", borderRadius: "var(--radius-sm)" }}>
										{bottoms.length > 0 ? bottoms[bottomIndex]?.name || "Select bottoms" : "No bottoms available"}
									</div>
									<button 
										onClick={() => setBottomIndex((prev) => (prev + 1) % bottoms.length)}
										disabled={bottoms.length === 0}
										className={bottoms.length > 0 ? "btn-primary" : "btn-secondary"}
										style={{ 
											padding: "var(--space-2)", 
											fontSize: "1rem"
										}}
									>
										→
									</button>
								</div>
							</div>

							{/* Shoes Section */}
							<div style={{ marginBottom: "var(--space-6)" }}>
								<label className="form-label">Shoes</label>
								<div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
									<button 
										onClick={() => setShoesIndex((prev) => (prev - 1 + shoes.length) % shoes.length)}
										disabled={shoes.length === 0}
										className={shoes.length > 0 ? "btn-primary" : "btn-secondary"}
										style={{ 
											padding: "var(--space-2)", 
											fontSize: "1rem"
										}}
									>
										←
									</button>
									<div style={{ flex: 1, textAlign: "center", padding: "var(--space-2)", backgroundColor: "var(--color-gray-50)", borderRadius: "var(--radius-sm)" }}>
										{shoes.length > 0 ? shoes[shoesIndex]?.name || "Select shoes" : "No shoes available"}
									</div>
									<button 
										onClick={() => setShoesIndex((prev) => (prev + 1) % shoes.length)}
										disabled={shoes.length === 0}
										className={shoes.length > 0 ? "btn-primary" : "btn-secondary"}
										style={{ 
											padding: "var(--space-2)", 
											fontSize: "1rem"
										}}
									>
										→
									</button>
								</div>
							</div>

							<div className="form-group">
								<label className="form-label">Outfit Name</label>
								<input 
									type="text" 
									value={outfitName} 
									onChange={(e) => setOutfitName(e.target.value)} 
									className="input-field" 
									placeholder="Enter outfit name" 
								/>
							</div>

							<button onClick={handleSaveOutfit} disabled={loading} className="btn-primary" style={{ width: "100%" }}>
								{loading ? "Saving..." : "Save Outfit"}
							</button>
						</div>
					</div>
				</div>

{/* Saved Outfits */}
				<div style={{ marginTop: "var(--space-8)" }}>
					<h2 className="text-subheading" style={{ marginBottom: "var(--space-4)" }}>Saved Outfits</h2>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
						{savedOutfits.map((outfit) => (
							<div key={outfit.id} className="card" style={{ padding: "var(--space-4)" }}>
								<h3 className="text-subheading" style={{ marginBottom: "var(--space-3)", textAlign: "center" }}>{outfit.name}</h3>
								
								{/* Outfit Items Display */}
								<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
									{/* Top */}
									{outfit.top ? (
										<div style={{ textAlign: "center" }}>
											<img 
												src={outfit.top.imageUrl} 
												alt="top" 
												style={{ 
													width: "100%", 
													maxWidth: "120px", 
													height: "80px", 
													objectFit: "cover", 
													borderRadius: "var(--radius-sm)",
													border: "1px solid var(--color-gray-200)"
												}} 
											/>
											<p className="text-small" style={{ marginTop: "var(--space-1)", fontSize: "0.75rem", color: "var(--color-gray-600)" }}>
												{outfit.top.brand}
											</p>
										</div>
									) : (
										<div style={{ 
											width: "120px", 
											height: "80px", 
											border: "1px dashed var(--color-gray-300)", 
											borderRadius: "var(--radius-sm)", 
											display: "flex", 
											alignItems: "center", 
											justifyContent: "center", 
											color: "var(--color-gray-400)",
											fontSize: "0.75rem",
											margin: "0 auto"
										}}>
											No top
										</div>
									)}

									{/* Bottom */}
									{outfit.bottom ? (
										<div style={{ textAlign: "center" }}>
											<img 
												src={outfit.bottom.imageUrl} 
												alt="bottom" 
												style={{ 
													width: "100%", 
													maxWidth: "120px", 
													height: "80px", 
													objectFit: "cover", 
													borderRadius: "var(--radius-sm)",
													border: "1px solid var(--color-gray-200)"
												}} 
											/>
											<p className="text-small" style={{ marginTop: "var(--space-1)", fontSize: "0.75rem", color: "var(--color-gray-600)" }}>
												{outfit.bottom.brand}
											</p>
										</div>
									) : (
										<div style={{ 
											width: "120px", 
											height: "80px", 
											border: "1px dashed var(--color-gray-300)", 
											borderRadius: "var(--radius-sm)", 
											display: "flex", 
											alignItems: "center", 
											justifyContent: "center", 
											color: "var(--color-gray-400)",
											fontSize: "0.75rem",
											margin: "0 auto"
										}}>
											No bottom
										</div>
									)}
								</div>

								{/* Shoes - spans full width */}
								<div style={{ textAlign: "center", marginBottom: "var(--space-3)" }}>
									{outfit.shoes ? (
										<>
											<img 
												src={outfit.shoes.imageUrl} 
												alt="shoes" 
												style={{ 
													width: "100%", 
													maxWidth: "120px", 
													height: "80px", 
													objectFit: "cover", 
													borderRadius: "var(--radius-sm)",
													border: "1px solid var(--color-gray-200)"
												}} 
											/>
											<p className="text-small" style={{ marginTop: "var(--space-1)", fontSize: "0.75rem", color: "var(--color-gray-600)" }}>
												{outfit.shoes.brand}
											</p>
										</>
									) : (
										<div style={{ 
											width: "120px", 
											height: "80px", 
											border: "1px dashed var(--color-gray-300)", 
											borderRadius: "var(--radius-sm)", 
											display: "flex", 
											alignItems: "center", 
											justifyContent: "center", 
											color: "var(--color-gray-400)",
											fontSize: "0.75rem",
											margin: "0 auto"
										}}>
											No shoes
										</div>
									)}
								</div>

								<button onClick={() => handleDeleteOutfit(outfit.id)} className="btn-danger" style={{ width: "100%", fontSize: "0.875rem" }}>
									Delete
								</button>
							</div>
						))}
					</div>
				</div>
				</main>
			</div>
		</div>
	);
};

export default OutfitMaker;
