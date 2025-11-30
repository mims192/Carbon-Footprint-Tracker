from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

app = Flask(__name__)

def get_recommendations(label_name):
    suggestions = {
        "Low-Impact / Eco-conscious": [
            "Great job! You're already eco-conscious.",
            "Try composting and growing your own herbs.",
            "Consider using 100% renewable energy sources."
        ],
        "Moderate Lifestyle": [
            "Reduce non-veg consumption gradually.",
            "Switch to LED bulbs and energy-efficient appliances.",
            "Use public transportation or carpool when possible."
        ],
        "High-Impact / Energy Intensive": [
            "Reduce high electricity usage and unplug idle devices.",
            "Limit car usage — consider EVs, cycling, or public transport.",
            "Reduce non-veg meals and improve waste management habits."
        ]
    }
    return suggestions.get(label_name, ["Recommendation unavailable."])


def run_cluster(profiles):
    df = pd.DataFrame(profiles)
    
    # Convert MongoDB _id to string for matching
    if '_id' in df.columns:
        df['_id'] = df['_id'].astype(str)
    
    # Calculate derived fields with safe defaults
    df["avg_transport_emission_kgCO2"] = df.get("avg_daily_travel_km", pd.Series([0]*len(df))) * 0.21
    df["avg_waste_generated_kg"] = np.random.uniform(0.4, 1.5, len(df))
    df["avg_purchases_per_day"] = df.get("avg_items_purchased", pd.Series([0]*len(df))) / 30.0
    df["avg_renewable_usage"] = 0  # Default to 0 if not provided

    features = [
        "avg_transport_emission_kgCO2",
        "avg_electricity_kwh",
        "avg_lpg_kg",
        "avg_nonveg_meals",
        "avg_waste_generated_kg",
        "avg_purchases_per_day",
        "avg_renewable_usage"
    ]

    # Ensure all features exist
    for col in features:
        if col not in df.columns:
            df[col] = 0

    X = df[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Use 2 or 3 clusters depending on data size
    n_clusters = min(3, len(df))
    kmeans = KMeans(n_clusters=n_clusters, random_state=42).fit(X_scaled)
    df["cluster_label"] = kmeans.labels_

    cluster_summary = df.groupby("cluster_label")[features].mean().round(2)
    cluster_summary["users_in_cluster"] = df["cluster_label"].value_counts().sort_index().values

    # Assign labels based on cluster characteristics
    labels = {}
    for idx, row in cluster_summary.iterrows():
        if row["avg_transport_emission_kgCO2"] < 1 and row["avg_electricity_kwh"] < 4:
            labels[idx] = "Low-Impact / Eco-conscious"
        elif row["avg_transport_emission_kgCO2"] < 2.5:
            labels[idx] = "Moderate Lifestyle"
        else:
            labels[idx] = "High-Impact / Energy Intensive"

    df["cluster_label_name"] = df["cluster_label"].map(labels)
    
    # Convert to list of dicts for JSON response
    result = df.to_dict('records')
    
    return result, labels


@app.route("/model3/cluster", methods=["POST"])
def cluster():
    try:
        data = request.json
        profiles = data.get("profiles", [])
        
        if not profiles:
            return jsonify({"error": "No profiles provided"}), 400
        
        clustered_profiles, labels = run_cluster(profiles)
        
        return jsonify({
            "profiles": clustered_profiles,
            "labels": labels
        })
    
    except Exception as e:
        print(f"Error in clustering: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/model1/recommend", methods=["POST"])
def recommend():
    try:
        data = request.json
        userId = data.get("userId")
        profiles = data.get("profiles", [])
        
        if not profiles:
            return jsonify({"error": "No profiles provided"}), 400

        clustered_profiles, _ = run_cluster(profiles)
        
        # Find user in results
        user_row = None
        for profile in clustered_profiles:
            if str(profile.get('_id')) == str(userId) or str(profile.get('userId')) == str(userId):
                user_row = profile
                break
        
        if not user_row:
            return jsonify({"error": "User not found in clustering results"}), 404

        recommendations = get_recommendations(user_row["cluster_label_name"])

        return jsonify({
            "userId": userId,
            "cluster": user_row["cluster_label_name"],
            "recommendations": recommendations
        })
    
    except Exception as e:
        print(f"Error in recommendation: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)