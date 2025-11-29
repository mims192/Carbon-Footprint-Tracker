import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

def run_cluster(profiles=None):
    # profiles can be a list of dicts or None. If None, try read user_profiles.csv.
    if profiles is None:
        df = pd.read_csv("user_profiles.csv")
    else:
        df = pd.DataFrame(profiles)
    # ensure expected columns exist
    df["avg_transport_emission_kgCO2"] = df.get("avg_transport_emission_kgCO2",
        df.get("avg_daily_travel_km", 0) * 0.21)
    df["avg_waste_generated_kg"] = df.get("avg_waste_generated_kg", np.random.uniform(0.4, 1.5, len(df)))
    df["avg_purchases_per_day"] = df.get("avg_purchases_per_day", df.get("avg_items_purchased", 0) / 30.0)

    features = [
        "avg_transport_emission_kgCO2",
        "avg_electricity_kwh",
        "avg_lpg_kg",
        "avg_nonveg_meals",
        "avg_waste_generated_kg",
        "avg_purchases_per_day",
        "avg_renewable_usage"
    ]
    # fill missing columns
    for col in features:
        if col not in df.columns:
            df[col] = 0

    X = df[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # choose k=2 as before; for production you can compute elbow
    k = 2
    kmeans = KMeans(n_clusters=k, random_state=42).fit(X_scaled)
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

    # return JSON-friendly results
    return {
        "cluster_summary": cluster_summary.reset_index().to_dict(orient="records"),
        "profiles": df.to_dict(orient="records"),
        "labels": labels
    }
