import { useEffect } from "react";
import { useState } from "react";

function App() {
	const [items, setItems] = useState([]);
	const [price, setPrice] = useState("");
	const [brand, setBrand] = useState("");
	const [season, setSeason] = useState("");
	const [size, setSize] = useState("");
	const [image, setImage] = useState(null);
	const [imageFile, setImageFile] = useState(null);

	const [message, setMessage] = useState("Loading...");

	useEffect(() => {
		const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

		fetch(API_URL + "/api/clothing-items")
			.then((res) => res.json())
			.then((data) => {
				setItems(data);
				setMessage("");
			})
			.catch((err) => setMessage("Error: " + err.message));
	}, []);

	function handleImageUpload(e) {
		const file = e.target.files[0];
		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImage(reader.result); // base64 for preview
			};
			reader.readAsDataURL(file);
		}
	}

	async function addItem() {
		if (!imageFile) {
			setMessage("Please select an image");
			return;
		}

		const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
		const formData = new FormData();
		formData.append("image", imageFile);
		formData.append("brand", brand);
		formData.append("price", price);
		formData.append("season", season);
		formData.append("size", size);

		try {
			const response = await fetch(API_URL + "/api/clothing-items", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				const newItem = await response.json();
				setItems([...items, newItem]);
				setPrice("");
				setBrand("");
				setSeason("");
				setSize("");
				setImage(null);
				setImageFile(null);
				setMessage("Item added successfully!");
			} else {
				setMessage("Error adding item");
			}
		} catch (err) {
			setMessage("Error: " + err.message);
		}
	}

	return (
		<div>
			<h2>Outfit planner</h2>
			<div>
				<input type="file" accept="image/*" onChange={handleImageUpload} />
				{image && <img src={image} alt="Preview" width="100" />}
				<input placeholder="Brand (optional)" value={brand} onChange={(e) => setBrand(e.target.value)} type="text" />
				<input placeholder="Price (optional)" value={price} onChange={(e) => setPrice(e.target.value)} type="number" />
				<select value={season} onChange={(e) => setSeason(e.target.value)}>
					<option value="">Season (optional)</option>
					<option value="Spring">Spring</option>
					<option value="Summer">Summer</option>
					<option value="Fall">Fall</option>
					<option value="Winter">Winter</option>
				</select>
				<select value={size} onChange={(e) => setSize(e.target.value)}>
					<option value="">Size (optional)</option>
					<option value="XS">XS</option>
					<option value="S">S</option>
					<option value="M">M</option>
					<option value="L">L</option>
					<option value="XL">XL</option>
					<option value="XXL">XXL</option>
				</select>
				<button onClick={addItem}>Add item</button>
			</div>
			<h3>My items</h3>
			<ul>
				{items.map((item) => (
					<li key={item.id}>
						{item.imagePath && <img src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${item.imagePath}`} alt="clothing" width="80" />}
						<br />
						{item.brand && <span>Brand: {item.brand}, </span>}
						{item.price && <span>Price: ${item.price}, </span>}
						{item.season && <span>Season: {item.season}, </span>}
						{item.size && <span>Size: {item.size}</span>}
					</li>
				))}
			</ul>
			<p>{message}</p>
		</div>
	);
}

export default App;
