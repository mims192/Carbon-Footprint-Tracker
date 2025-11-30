from flask import Flask, request, jsonify
from flask_cors import CORS
import model1
import model2
import model3
print("=== Starting app.py ===")

try:
    print("Attempting to import predictonmodel...")
    import predictonmodel
    print("✓ predictonmodel imported successfully!")
except Exception as e:
    print(f"✗ ERROR importing predictonmodel: {e}")
    import traceback
    traceback.print_exc()


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

@app.route("/model3/cluster", methods=["POST"])
def cluster_model3():
    try:
        data = request.json
        profiles = data.get("profiles", [])
        
        if not profiles:
            return jsonify({"error": "No profiles provided"}), 400
        
        clustered_profiles, labels = model3.run_cluster(profiles)
        
        return jsonify({
            "profiles": clustered_profiles,
            "labels": labels
        })
    
    except Exception as e:
        print(f"Error in clustering: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/model3/recommend", methods=["POST"])
def recommend_model3():
    try:
        data = request.json
        userId = data.get("userId")
        profiles = data.get("profiles", [])
        
        if not profiles:
            return jsonify({"error": "No profiles provided"}), 400

        clustered_profiles, _ = model3.run_cluster(profiles)
        
        # Find user in results
        user_row = None
        for profile in clustered_profiles:
            if str(profile.get('_id')) == str(userId) or str(profile.get('userId')) == str(userId):
                user_row = profile
                break
        
        if not user_row:
            return jsonify({"error": "User not found in clustering results"}), 404

        recommendations = model3.get_recommendations(user_row["cluster_label_name"])

        return jsonify({
            "userId": userId,
            "cluster": user_row["cluster_label_name"],
            "recommendations": recommendations
        })
    
    except Exception as e:
        print(f"Error in recommendation: {str(e)}")
        return jsonify({"error": str(e)}), 500

# NEW ENDPOINT: Random Forest Carbon Prediction
@app.route("/predict_carbon_emission", methods=["POST"])
def predict_carbon_emission():
    """
    Predict next month's carbon emission using Random Forest model
    
    Expected JSON payload:
    {
        "avg_daily_travel_km": 15.5,
        "avg_electricity_kwh": 120,
        "avg_lpg_kg": 18,
        "avg_nonveg_meals": 12,
        "avg_items_purchased": 6,
        "last_month_emission": 200
    }
    """
    try:
        data = request.json
        
        # Validate required fields
        required_fields = [
            'avg_daily_travel_km',
            'avg_electricity_kwh', 
            'avg_lpg_kg',
            'avg_nonveg_meals',
            'avg_items_purchased',
            'last_month_emission'
        ]
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        # Call prediction model
        result = predictonmodel.predict_carbon_emission(data)
        
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400
    except Exception as e:
        print(f"Error in carbon prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Optional: Retrain model endpoint (for admin use)
@app.route("/retrain_model", methods=["POST"])
def retrain():
    """
    Retrain the Random Forest model
    (Use this when you want to update the model with new patterns)
    """
    try:
        predictonmodel.retrain_model()
        return jsonify({
            "success": True,
            "message": "Model retrained successfully"
        })
    except Exception as e:
        print(f"Error retraining model: {str()}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("\n=== Registered Routes ===")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule.rule} [{', '.join(rule.methods - {'HEAD', 'OPTIONS'})}]")
    print("========================\n")
    
    app.run(host="0.0.0.0", port=5000, debug=True)