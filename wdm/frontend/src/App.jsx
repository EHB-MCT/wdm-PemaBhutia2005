import { useEffect, useState } from "react";

function App() {
	const [message, setMessage] = useState("Loading...");

	useEffect(() => {
		const API_URL = import.meta.env.VITE_API_URL;

		fetch(API_URL + "/api/test")
			.then((res) => res.json())
			.then((data) => setMessage(data.message))
			.catch((err) => setMessage("Error: " + err.message));
	}, []);

	return (
		<div>
			<p>{message}</p>
		</div>
	);
}

export default App;
