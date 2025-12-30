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
				imageUrl: `http://localhost:5000/uploads/${item.image_path}`,
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
			setSavedOutfits(outfits);
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
			
			{/* Page Header */}
			<div style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
				<div className="container" style={{ padding: "1.5rem 0" }}>
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
						<div>
							<h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>Outfit Maker</h1>
							<p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>Create outfit combinations from your wardrobe</p>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
							<div style={{ textAlign: "right" }}>
								<p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Items in wardrobe</p>
								<p style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{items.length}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<main className="container" style={{ padding: "2rem 0" }}>
				{message && <div style={{ padding: "1rem", marginBottom: "1rem", backgroundColor: "#f0f9ff", color: "#0369a1", borderRadius: "0.5rem" }}>{message}</div>}

				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
					{/* Outfit Preview */}
					<div>
						<h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Current Outfit</h2>
						<div style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1rem", minHeight: "600px" }}>
							{/* Tops/Jackets/Sweaters */}
							<div style={{ marginBottom: "1rem", textAlign: "center" }}>
								{currentTop ? (
									<>
										<img src={currentTop.imageUrl} alt="top" style={{ width: "100%", maxWidth: "200px", height: "auto", maxHeight: "200px", objectFit: "contain" }} />
										<p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#6b7280" }}>{currentTop.name}</p>
									</>
								) : (
									<div style={{ width: "100%", maxWidth: "200px", height: "200px", border: "2px dashed #d1d5db", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "#9ca3af" }}>
										No tops available
									</div>
								)}
							</div>

							{/* Bottoms */}
							<div style={{ marginBottom: "1rem", textAlign: "center" }}>
								{currentBottom ? (
									<>
										<img src={currentBottom.imageUrl} alt="bottom" style={{ width: "100%", maxWidth: "200px", height: "auto", maxHeight: "200px", objectFit: "contain" }} />
										<p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#6b7280" }}>{currentBottom.name}</p>
									</>
								) : (
									<div style={{ width: "100%", maxWidth: "200px", height: "200px", border: "2px dashed #d1d5db", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "#9ca3af" }}>
										No bottoms available
									</div>
								)}
							</div>

							{/* Shoes */}
							<div style={{ textAlign: "center" }}>
								{currentShoes ? (
									<>
										<img src={currentShoes.imageUrl} alt="shoes" style={{ width: "100%", maxWidth: "200px", height: "auto", maxHeight: "200px", objectFit: "contain" }} />
										<p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#6b7280" }}>{currentShoes.name}</p>
									</>
								) : (
									<div style={{ width: "100%", maxWidth: "200px", height: "200px", border: "2px dashed #d1d5db", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "#9ca3af" }}>
										No shoes available
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Controls */}
					<div>
						<h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Customize</h2>
						<div style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1rem" }}>
							{/* Tops Section */}
							<div style={{ marginBottom: "1.5rem" }}>
								<label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>Tops/Jackets/Sweaters</label>
								<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
									<button 
										onClick={() => setTopIndex((prev) => (prev - 1 + tops.length) % tops.length)}
										disabled={tops.length === 0}
										style={{ 
											padding: "0.5rem", 
											backgroundColor: tops.length > 0 ? "#3b82f6" : "#e5e7eb", 
											color: tops.length > 0 ? "white" : "#9ca3af", 
											border: "none", 
											borderRadius: "0.375rem", 
											cursor: tops.length > 0 ? "pointer" : "not-allowed",
											fontSize: "1rem"
										}}
									>
										←
									</button>
									<div style={{ flex: 1, textAlign: "center", padding: "0.5rem", backgroundColor: "#f9fafb", borderRadius: "0.375rem" }}>
										{tops.length > 0 ? tops[topIndex]?.name || "Select a top" : "No tops available"}
									</div>
									<button 
										onClick={() => setTopIndex((prev) => (prev + 1) % tops.length)}
										disabled={tops.length === 0}
										style={{ 
											padding: "0.5rem", 
											backgroundColor: tops.length > 0 ? "#3b82f6" : "#e5e7eb", 
											color: tops.length > 0 ? "white" : "#9ca3af", 
											border: "none", 
											borderRadius: "0.375rem", 
											cursor: tops.length > 0 ? "pointer" : "not-allowed",
											fontSize: "1rem"
										}}
									>
										→
									</button>
								</div>
							</div>

							{/* Bottoms Section */}
							<div style={{ marginBottom: "1.5rem" }}>
								<label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>Bottoms</label>
								<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
									<button 
										onClick={() => setBottomIndex((prev) => (prev - 1 + bottoms.length) % bottoms.length)}
										disabled={bottoms.length === 0}
										style={{ 
											padding: "0.5rem", 
											backgroundColor: bottoms.length > 0 ? "#3b82f6" : "#e5e7eb", 
											color: bottoms.length > 0 ? "white" : "#9ca3af", 
											border: "none", 
											borderRadius: "0.375rem", 
											cursor: bottoms.length > 0 ? "pointer" : "not-allowed",
											fontSize: "1rem"
										}}
									>
										←
									</button>
									<div style={{ flex: 1, textAlign: "center", padding: "0.5rem", backgroundColor: "#f9fafb", borderRadius: "0.375rem" }}>
										{bottoms.length > 0 ? bottoms[bottomIndex]?.name || "Select bottoms" : "No bottoms available"}
									</div>
									<button 
										onClick={() => setBottomIndex((prev) => (prev + 1) % bottoms.length)}
										disabled={bottoms.length === 0}
										style={{ 
											padding: "0.5rem", 
											backgroundColor: bottoms.length > 0 ? "#3b82f6" : "#e5e7eb", 
											color: bottoms.length > 0 ? "white" : "#9ca3af", 
											border: "none", 
											borderRadius: "0.375rem", 
											cursor: bottoms.length > 0 ? "pointer" : "not-allowed",
											fontSize: "1rem"
										}}
									>
										→
									</button>
								</div>
							</div>

							{/* Shoes Section */}
							<div style={{ marginBottom: "1.5rem" }}>
								<label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>Shoes</label>
								<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
									<button 
										onClick={() => setShoesIndex((prev) => (prev - 1 + shoes.length) % shoes.length)}
										disabled={shoes.length === 0}
										style={{ 
											padding: "0.5rem", 
											backgroundColor: shoes.length > 0 ? "#3b82f6" : "#e5e7eb", 
											color: shoes.length > 0 ? "white" : "#9ca3af", 
											border: "none", 
											borderRadius: "0.375rem", 
											cursor: shoes.length > 0 ? "pointer" : "not-allowed",
											fontSize: "1rem"
										}}
									>
										←
									</button>
									<div style={{ flex: 1, textAlign: "center", padding: "0.5rem", backgroundColor: "#f9fafb", borderRadius: "0.375rem" }}>
										{shoes.length > 0 ? shoes[shoesIndex]?.name || "Select shoes" : "No shoes available"}
									</div>
									<button 
										onClick={() => setShoesIndex((prev) => (prev + 1) % shoes.length)}
										disabled={shoes.length === 0}
										style={{ 
											padding: "0.5rem", 
											backgroundColor: shoes.length > 0 ? "#3b82f6" : "#e5e7eb", 
											color: shoes.length > 0 ? "white" : "#9ca3af", 
											border: "none", 
											borderRadius: "0.375rem", 
											cursor: shoes.length > 0 ? "pointer" : "not-allowed",
											fontSize: "1rem"
										}}
									>
										→
									</button>
								</div>
							</div>

							<div style={{ marginBottom: "1rem" }}>
								<label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>Outfit Name</label>
								<input type="text" value={outfitName} onChange={(e) => setOutfitName(e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.5rem" }} placeholder="Enter outfit name" />
							</div>

							<button onClick={handleSaveOutfit} disabled={loading} style={{ width: "100%", padding: "0.625rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "500", cursor: "pointer" }}>
								{loading ? "Saving..." : "Save Outfit"}
							</button>
						</div>
					</div>
				</div>

				{/* Saved Outfits */}
				<div style={{ marginTop: "2rem" }}>
					<h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Saved Outfits</h2>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
						{savedOutfits.map((outfit) => (
							<div key={outfit.id} style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1rem" }}>
								<h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>{outfit.name}</h3>
								<button onClick={() => handleDeleteOutfit(outfit.id)} style={{ width: "100%", padding: "0.5rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
									Delete
								</button>
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
};

export default OutfitMaker;
