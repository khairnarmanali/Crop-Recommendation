const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ EMPTY DATA (NO DUMMY VALUES)
let sensorData = {
    temperature: "",
    humidity: "",
    moisture: ""
};

// GET
app.get("/sensor", (req, res) => {
    res.json(sensorData);
});

// POST (for future real sensor)
app.post("/sensor", (req, res) => {
    const { temperature, humidity, moisture } = req.body;

    sensorData = { temperature, humidity, moisture };

    res.json({ message: "Updated" });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log("Server running on http://localhost:3000");
});