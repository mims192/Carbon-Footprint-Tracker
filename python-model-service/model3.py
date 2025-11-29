from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

app = Flask(__name__)

def get_recommendations(label_name):
    suggestions = {
        "Low-Impact / Eco-conscious": [
            "Great job! You’re already eco-conscious.",
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


def run_cluster(profiles=None):
    if profiles is None:
        df = pd.read_csv("user_profiles.csv")
    else:
        df = pd.DataFrame(profiles)

    df["avg_transport_emission_kgCO2"] = df.get(
        "avg_transport_emission_kgCO2",
        df.get("avg_daily_travel_km", 0) * 0.21
    )

    df["avg_waste_generated_kg"] = df.get(
        "avg_waste_generated_kg",
        np.random.uniform(0.4, 1.5, len(df))
    )

    df["avg_purchases_per_day"] = df.get(
        "avg_purchases_per_day",
        df.get("avg_items_purchased", 0) / 30.0
    )

    features = [
        "avg_transport_emission_kgCO2",
        "avg_electricity_kwh",
        "avg_lpg_kg",
        "avg_nonveg_meals",
        "avg_waste_generated_kg",
        "avg_purchases_per_day",
        "avg_renewable_usage"
    ]

    for col in features:
        if col not in df.columns:
            df[col] = 0

    X = df[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(n_clusters=2, random_state=42).fit(X_scaled)
    df["cluster_label"] = kmeans.labels_

    cluster_summary = df.groupby("cluster_label")[features].mean().round(2)
    cluster_summary["users_in_cluster"] = df["cluster_label"].value_counts().sort_index().values

    labels = {}

    for idx, row in cluster_summary.iterrows():
        if row["avg_transport_emission_kgCO2"] < 1 and row["avg_electricity_kwh"] < 4:
            labels[idx] = "Low-Impact / Eco-conscious"
        elif row["avg_transport_emission_kgCO2"] < 2.5:
            labels[idx] = "Moderate Lifestyle"
        else:
            labels[idx] = "High-Impact / Energy Intensive"

    df["cluster_label_name"] = df["cluster_label"].map(labels)
    df["recommendations"] = df["cluster_label_name"].apply(get_recommendations)

    return df


@app.post("/model1/recommend")
def recommend():
    data = request.json
    userId = data.get("userId")
    profiles = data.get("profiles", [])

    df = run_cluster(profiles)
    user_row = df[df["userId"] == userId].iloc[0]

    return jsonify({
        "userId": userId,
        "cluster": user_row["cluster_label_name"],
        "recommendations": user_row["recommendations"]
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
