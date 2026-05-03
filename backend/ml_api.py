from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd

app = Flask(__name__)
CORS(app)

# 🔹 Load model
model = pickle.load(open("model.pkl", "rb"))

# 🔹 Reverse mapping
reverse_crop_dict = {
    0: "Rice 🌾", 1: "Maize 🌽", 2: "Chickpea", 3: "Kidneybeans",
    4: "Pigeonpeas", 5: "Mothbeans", 6: "Mungbean", 7: "Blackgram",
    8: "Lentil", 9: "Pomegranate", 10: "Banana", 11: "Mango",
    12: "Grapes 🍇", 13: "Watermelon", 14: "Muskmelon", 15: "Apple",
    16: "Orange", 17: "Papaya", 18: "Coconut", 19: "Cotton",
    20: "Jute", 21: "Coffee"
}

# 🔹 Quality calculation
def calculate_quality(N, P, K, temperature, humidity, ph, rainfall, moisture):
    score = (N + P + K)/3 * 0.4 + temperature * 0.1 + humidity * 0.1 + rainfall * 0.2 + moisture * 0.2
    return score

def quality_label(score):
    if score >= 80:
        return "Excellent"
    elif score >= 60:
        return "Good"
    elif score >= 40:
        return "Average"
    else:
        return "Poor"


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        # ✅ Validate input
        required = ["N","P","K","temperature","humidity","ph","rainfall","soil"]
        for key in required:
            if key not in data:
                return jsonify({"error": f"Missing field: {key}"}), 400

        # ✅ Convert values
        vals = {k: float(data[k]) for k in required}

        # ✅ Prepare features
        features = pd.DataFrame([{
            "N": vals["N"],
            "P": vals["P"],
            "K": vals["K"],
            "temperature": vals["temperature"],
            "humidity": vals["humidity"],
            "ph": vals["ph"],
            "rainfall": vals["rainfall"],
            "moisture": vals["soil"]
        }])

        # ✅ Crop prediction
        prediction = model.predict(features)
        crop = reverse_crop_dict[int(prediction[0])]

        # ✅ Quality calculation
        score = calculate_quality(
            vals["N"], vals["P"], vals["K"],
            vals["temperature"], vals["humidity"],
            vals["ph"], vals["rainfall"], vals["soil"]
        )
        quality = quality_label(score)

        return jsonify({
            "crop": crop,
            "quality": quality
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)