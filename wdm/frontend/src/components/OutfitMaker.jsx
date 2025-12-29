import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clothingAPI, outfitAPI } from "../services/api";

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
			setItems(items);

			// Filter items by category
			const topsItems = items.filter((item) => ["tops", "sweaters", "jackets"].includes(item?.category));
			const bottomsItems = items.filter((item) => ["bottoms"].includes(item?.category));
			const shoesItems = items.filter((item) => ["shoes"].includes(item?.category));

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
					<div className="spinner w-5 h-5 mx-auto mb-4"></div>
					<p className="text-body">Loading your wardrobe...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="page-container">
			{/* Header */}
			<header style={{ backgroundColor: "white", borderBottom: "1px solid #f3f4f6" }}>
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
							<button
								onClick={() => navigate("/dashboard")}
								style={{
									padding: "0.625rem 1rem",
									backgroundColor: "transparent",
									color: "#6b7280",
									border: "1px solid #d1d5db",
									borderRadius: "0.5rem",
									fontSize: "0.875rem",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 200ms ease-in-out",
								}}
							>
								← Back to Wardrobe
							</button>
							<button
								onClick={handleLogout}
								style={{
									padding: "0.625rem 1rem",
									backgroundColor: "transparent",
									color: "#6b7280",
									border: "1px solid #d1d5db",
									borderRadius: "0.5rem",
									fontSize: "0.875rem",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 200ms ease-in-out",
								}}
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container" style={{ padding: "2rem 0" }}>
				{message && <div style={{ padding: "1rem", marginBottom: "1rem", backgroundColor: "#f0f9ff", color: "#0369a1", borderRadius: "0.5rem" }}>{message}</div>}

				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
					{/* Outfit Preview */}
					<div>
						<h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Current Outfit</h2>
						<div style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1rem", minHeight: "400px" }}>
							{/* Top */}
							{currentTop && <img src={currentTop.imageUrl} alt="top" style={{ width: "100%", marginBottom: "1rem" }} />}
							{/* Bottom */}
							{currentBottom && <img src={currentBottom.imageUrl} alt="bottom" style={{ width: "100%", marginBottom: "1rem" }} />}
							{/* Shoes */}
							{currentShoes && <img src={currentShoes.imageUrl} alt="shoes" style={{ width: "100%" }} />}
						</div>
					</div>

					{/* Controls */}
					<div>
						<h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Customize</h2>
						<div style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1rem" }}>
							<div style={{ marginBottom: "1rem" }}>
								<label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>Tops</label>
								<select value={topIndex} onChange={(e) => setTopIndex(parseInt(e.target.value))} style={{ width: "100%", padding: "0.5rem" }}>
									{tops.map((top, idx) => (
										<option key={idx} value={idx}>
											{top.name}
										</option>
									))}
								</select>
							</div>

							<div style={{ marginBottom: "1rem" }}>
								<label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>Bottoms</label>
								<select value={bottomIndex} onChange={(e) => setBottomIndex(parseInt(e.target.value))} style={{ width: "100%", padding: "0.5rem" }}>
									{bottoms.map((bottom, idx) => (
										<option key={idx} value={idx}>
											{bottom.name}
										</option>
									))}
								</select>
							</div>

							<div style={{ marginBottom: "1rem" }}>
								<label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>Shoes</label>
								<select value={shoesIndex} onChange={(e) => setShoesIndex(parseInt(e.target.value))} style={{ width: "100%", padding: "0.5rem" }}>
									{shoes.map((shoe, idx) => (
										<option key={idx} value={idx}>
											{shoe.name}
										</option>
									))}
								</select>
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
