from flask import Flask, request, jsonify
from flask_cors import CORS
import model1
import model2

app = Flask(__name__)
CORS(app)

@app.route("/model1/cluster", methods=["POST"])
def cluster():
    data = request.json
    # either accept 'profiles' or read from file path
    profiles = data.get("profiles")
    result = model1.run_cluster(profiles)
    return jsonify(result)

@app.route("/predict_daily_emission", methods=["POST"])
def predict_daily_emission():
    payload = request.json
    # payload: { category: "Transport" | "Electricity" | ..., details: {...} }
    result = model2.compute_daily_emission(payload)
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
