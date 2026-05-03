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
        const apiKey = "zpka_cbe15254016941db9f888a124a4678c0_6dd62cff";

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

    // Validation
    if (!N || !P || !K || !H) {
        output.innerText = "⚠️ Please enter N, P, K and pH values.";
        return;
    }

    N = parseFloat(N);
    P = parseFloat(P);
    K = parseFloat(K);
    H = parseFloat(H);

    if ([N, P, K, H].some(v => isNaN(v))) {
        output.innerText = "⚠️ Invalid input values.";
        return;
    }

    if (N < 0 || N > 200 || P < 0 || P > 200 || K < 0 || K > 200 || H < 0 || H > 14) {
        output.innerText = "⚠️ Enter realistic values.";
        return;
    }

    if (!temp || !humidity || !moisture) {
        output.innerText = "📡 Sensor data loading...";
        return;
    }

    temp = parseFloat(temp);
    humidity = parseFloat(humidity);
    moisture = parseFloat(moisture);
    rainfall = parseFloat(rainfall);

    if ([temp, humidity, moisture].some(v => isNaN(v))) {
        output.innerText = "⚠️ Invalid sensor data.";
        return;
    }

    // ✅ CALL ML HERE
    callML(N, P, K, H, temp, humidity, rainfall, moisture);
}


// ✅ OUTSIDE FUNCTION
async function callML(N, P, K, H, temp, humidity, rainfall, moisture) {
    try {
        const res = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                N, P, K,
                ph: H,
                temperature: temp,
                humidity,
                rainfall,
                soil: moisture
            })
        });

        const result = await res.json();

        document.getElementById("cropOutput").innerText = result.crop;
        document.getElementById("qualityOutput").innerText = result.quality;

    } catch (error) {
        console.error("ML Error:", error);
        document.getElementById("cropOutput").innerText = "Error";
        document.getElementById("qualityOutput").innerText = "--";
    }
}











// function getRecommendation() {

//     const output = document.getElementById("cropOutput");

//     let N = document.getElementById("nitrogen").value;
//     let P = document.getElementById("phosphorus").value;
//     let K = document.getElementById("potassium").value;
//     let H = document.getElementById("ph").value;

//     let temp = document.getElementById("temperature").value;
//     let humidity = document.getElementById("humidity").value;
//     let moisture = document.getElementById("moisture").value;
//     let rainfall = document.getElementById("rainfall").value;

//     // ---------------- STEP 1: EMPTY CHECK ----------------
//     if (!N || !P || !K || !H) {
//         output.innerText = "⚠️ Please enter N, P, K and pH values.";
//         return;
//     }

//     // ---------------- STEP 2: CONVERT ----------------
//     N = parseFloat(N);
//     P = parseFloat(P);
//     K = parseFloat(K);
//     H = parseFloat(H);

//     // ---------------- STEP 3: INVALID / NONSENSE CHECK ----------------
//     if ([N, P, K, H].some(v => isNaN(v))) {
//         output.innerText = "⚠️ Invalid input values.";
//         return;
//     }

//     // 🔥 STRICT RANGE CHECK (THIS FIXES YOUR ISSUE)
//     if (
//         N < 0 || N > 200 ||
//         P < 0 || P > 200 ||
//         K < 0 || K > 200 ||
//         H < 0 || H > 14
//     ) {
//         output.innerText = "⚠️ Enter realistic NPK and pH values.";
//         return;
//     }

//     // ---------------- STEP 4: SENSOR CHECK ----------------
//     if (!temp || !humidity || !moisture) {
//         output.innerText = "📡 Sensor data loading... Please wait.";
//         return;
//     }

//     // ---------------- STEP 5: CONVERT SENSOR ----------------
//     temp = parseFloat(temp);
//     humidity = parseFloat(humidity);
//     moisture = parseFloat(moisture);
//     rainfall = parseFloat(rainfall);

//     if ([temp, humidity, moisture].some(v => isNaN(v))) {
//         output.innerText = "⚠️ Invalid sensor data.";
//         return;
//     }

// async function callML(N, P, K, H, temp, humidity, rainfall, moisture) {
//     try {
//         const res = await fetch("http://localhost:5000/predict", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 N: N,
//                 P: P,
//                 K: K,
//                 ph: H,
//                 temperature: temp,
//                 humidity: humidity,
//                 rainfall: rainfall,
//                 soil: moisture
//             })
//         });

//         const result = await res.json();

//         document.getElementById("cropOutput").innerText = result.crop;
//         document.getElementById("qualityOutput").innerText = result.quality;

//     } catch (error) {
//         console.error("ML Error:", error);
//         document.getElementById("cropOutput").innerText = "Error";
//         document.getElementById("qualityOutput").innerText = "--";
//     }
//     console.log("Calling ML...");
// }
// callML(N, P, K, H, temp, humidity, rainfall, moisture);
// }