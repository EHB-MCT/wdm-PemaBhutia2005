const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
	res.json({ message: "docker backend test" });
});

app.listen(5000, "0.0.0.0", () => {
	console.log("running on port 5000");
});
