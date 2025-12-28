import { useEffect } from "react";
import { useState } from "react";

function App() {
	const [items, setItems] = useState([]);
	const [price, setPrice] = useState("");
	const [brandType, setBrandType] = useState("0");
	const [image, setImage] = useState(null);

	const [message, setMessage] = useState("Loading...");

	useEffect(() => {
		const API_URL = import.meta.env.VITE_API_URL;

		fetch(API_URL + "/api/test")
			.then((res) => res.json())
			.then((data) => setMessage(data.message))
			.catch((err) => setMessage("Error: " + err.message));
	}, []);

	function handleImageUpload(e) {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImage(reader.result); // base64 for preview
			};
			reader.readAsDataURL(file);
		}
	}

	function addItem() {
		setItems([...items, { price: Number(price), brand_type: Text(brandType) }]);
		setPrice("");
		setBrand("");
		setImage(null);
	}

	return (
		<div>
			<h2>Outfit planner</h2>
			<div>
				<input type="file" accept="image/*" onChange={handleImageUpload} />
				{image && <img src={image} alt="Preview" width="100" />}
				<input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} type="number" />
				<input placeholder="Brand" value={brandType} onChange={(e) => setBrandType(e.target.value)} type="text" />
				<button onClick={addItem}>Add item</button>
			</div>
			<h3>My items</h3>
			<ul>
				{items.map((it, i) => (
					<li key={i}>
						<img src={it.image} alt="clothing" width="80" /> <br />
						Price: ${it.price}, Brand: {it.brand}
					</li>
				))}
			</ul>
			<p>{message}</p>
		</div>
	);
}

export default App;
