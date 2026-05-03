// ---------------- SENSOR DATA (FROM NODE BACKEND) ----------------
async function getSensorData() {
    try {
        const res = await fetch("http://localhost:3000/sensor");
        const data = await res.json();

        document.getElementById("temperature").value = data.temperature;
        document.getElementById("humidity").value = data.humidity;
        document.getElementById("moisture").value = data.moisture;

    } catch (error) {
        console.error("Sensor Error:", error);
    }
}


// ---------------- WEATHER API (RAINFALL ONLY) ----------------
async function getWeatherData() {
    try {
        const apiKey = "YOUR_API_KEY";

        const locRes = await fetch(
            `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=Dhule`
        );

        const locData = await locRes.json();
        const locationKey = locData[0].Key;

        const weatherRes = await fetch(
            `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&details=true`
        );

        const data = await weatherRes.json();

        const rainfall = data[0].PrecipitationSummary.Precipitation.Metric.Value;

        document.getElementById("rainfall").value = rainfall;

    } catch (error) {
        console.error("Weather API Error:", error);
    }
}


// ---------------- LOAD DATA ----------------
function loadRealTimeData() {
    getSensorData();
    getWeatherData();
}


// ---------------- AUTO LOAD ----------------
window.onload = () => {
    loadRealTimeData();
    setInterval(loadRealTimeData, 5000); // refresh every 5 sec
};


function getRecommendation() {

    const output = document.getElementById("cropOutput");

    let N = document.getElementById("nitrogen").value;
    let P = document.getElementById("phosphorus").value;
    let K = document.getElementById("potassium").value;
    let H = document.getElementById("ph").value;

    let temp = document.getElementById("temperature").value;
    let humidity = document.getElementById("humidity").value;
    let moisture = document.getElementById("moisture").value;
    let rainfall = document.getElementById("rainfall").value;

    // ---------------- STEP 1: EMPTY CHECK ----------------
    if (!N || !P || !K || !H) {
        output.innerText = "⚠️ Please enter N, P, K and pH values.";
        return;
    }

    // ---------------- STEP 2: CONVERT ----------------
    N = parseFloat(N);
    P = parseFloat(P);
    K = parseFloat(K);
    H = parseFloat(H);

    // ---------------- STEP 3: INVALID / NONSENSE CHECK ----------------
    if ([N, P, K, H].some(v => isNaN(v))) {
        output.innerText = "⚠️ Invalid input values.";
        return;
    }

    // 🔥 STRICT RANGE CHECK (THIS FIXES YOUR ISSUE)
    if (
        N < 0 || N > 200 ||
        P < 0 || P > 200 ||
        K < 0 || K > 200 ||
        H < 0 || H > 14
    ) {
        output.innerText = "⚠️ Enter realistic NPK and pH values.";
        return;
    }

    // ---------------- STEP 4: SENSOR CHECK ----------------
    if (!temp || !humidity || !moisture) {
        output.innerText = "📡 Sensor data loading... Please wait.";
        return;
    }

    // ---------------- STEP 5: CONVERT SENSOR ----------------
    temp = parseFloat(temp);
    humidity = parseFloat(humidity);
    moisture = parseFloat(moisture);
    rainfall = parseFloat(rainfall);

    if ([temp, humidity, moisture].some(v => isNaN(v))) {
        output.innerText = "⚠️ Invalid sensor data.";
        return;
    }

    // ---------------- STEP 6: LOGIC ----------------
    let crop = "";

    if (N > 80 && P > 30 && K > 30 && temp > 25 && humidity > 40 && rainfall > 50) {
        crop = "Rice 🌾";
    } 
    else if (N > 60 && P > 30 && temp < 25 && moisture < 40) {
        crop = "Wheat 🌿";
    } 
    else if (N > 90 && temp > 25 && rainfall < 80) {
        crop = "Maize 🌽";
    } 
    else if (K > 80 && moisture > 60) {
        crop = "Potato 🥔";
    } 
    else {
        crop = "Cotton 🌼";
    }

    output.innerText = crop;
}