const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Load Firebase key
const serviceAccount = require("./serviceAccountKey.json");

// 🔹 Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://crop-recommendation-bf251-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

// ✅ GET sensor data from Firebase
app.get("/sensor", async (req, res) => {
  try {
    const snapshot = await db.ref("sensor").once("value");
    const data = snapshot.val();

    if (!data) {
      return res.json({
        temperature: "--",
        humidity: "--",
        moisture: "--"
      });
    }

    res.json({
      temperature: data.temperature,
      humidity: data.humidity,
      moisture: data.soil
    });

  } catch (err) {
    console.error("Firebase error:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// 🚫 POST disabled (data comes from ESP → Firebase)
app.post("/sensor", (req, res) => {
  res.json({ message: "Use Firebase (ESP8266) to send data" });
});

// 🔹 Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});