import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Carbon emission factors (kg CO2)
EMISSION_FACTORS = {
    'electricity': 0.92,  # per kWh
    'lpg': 3.0,  # per kg
    'transport': 0.12,  # per km (avg car)
    'nonveg_meal': 2.5,  # per meal
    'shopping_item': 5.0  # per item (avg)
}

# Model paths
MODEL_PATH = 'carbon_rf_model.pkl'
SCALER_PATH = 'carbon_scaler.pkl'

# Global variables
model = None
scaler = None

def create_sample_training_data():
    """Create synthetic training data for the RF model"""
    np.random.seed(42)
    n_samples = 1000
    
    data = {
        'avg_daily_travel_km': np.random.uniform(5, 50, n_samples),
        'avg_electricity_kwh': np.random.uniform(100, 500, n_samples),
        'avg_lpg_kg': np.random.uniform(5, 30, n_samples),
        'avg_nonveg_meals': np.random.uniform(0, 20, n_samples),
        'avg_items_purchased': np.random.uniform(0, 15, n_samples),
        'last_month_emission': np.random.uniform(50, 400, n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Calculate target (predicted emission) with some noise
    df['predicted_emission'] = (
        df['avg_daily_travel_km'] * 30 * EMISSION_FACTORS['transport'] +
        df['avg_electricity_kwh'] * EMISSION_FACTORS['electricity'] +
        df['avg_lpg_kg'] * EMISSION_FACTORS['lpg'] +
        df['avg_nonveg_meals'] * 4 * EMISSION_FACTORS['nonveg_meal'] +
        df['avg_items_purchased'] * 4 * EMISSION_FACTORS['shopping_item'] +
        df['last_month_emission'] * np.random.uniform(0.8, 1.2, n_samples)
    ) / 2  # Average with last month
    
    # Add some noise
    df['predicted_emission'] += np.random.normal(0, 10, n_samples)
    
    return df

def train_model():
    """Train the Random Forest model"""
    global model, scaler
    
    print("Training Random Forest model...")
    df = create_sample_training_data()
    
    features = ['avg_daily_travel_km', 'avg_electricity_kwh', 'avg_lpg_kg', 
                'avg_nonveg_meals', 'avg_items_purchased', 'last_month_emission']
    
    X = df[features]
    y = df['predicted_emission']
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train Random Forest
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_scaled, y)
    
    # Save model and scaler
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    print(f"Model trained! Score: {model.score(X_scaled, y):.4f}")
    return model, scaler

def load_or_train_model():
    """Load existing model or train new one"""
    global model, scaler
    
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        print("Loading existing Random Forest model...")
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("Model loaded successfully!")
    else:
        print("No existing model found. Training new model...")
        model, scaler = train_model()

def generate_recommendations(breakdown, features):
    """Generate personalized recommendations based on emissions"""
    recs = []
    
    # Sort by highest impact
    sorted_categories = sorted(breakdown.items(), key=lambda x: x[1], reverse=True)
    
    for category, emission in sorted_categories[:3]:
        if category == 'transport' and emission > 40:
            recs.append("🚗 Consider carpooling, public transport, or cycling to reduce travel emissions")
        elif category == 'electricity' and emission > 100:
            recs.append("💡 Switch to LED bulbs and unplug devices when not in use")
        elif category == 'lpg' and emission > 50:
            recs.append("🔥 Use pressure cookers and optimize cooking to reduce LPG usage")
        elif category == 'food' and emission > 40:
            recs.append("🥗 Try 1-2 plant-based meals per week to reduce food carbon footprint")
        elif category == 'shopping' and emission > 30:
            recs.append("🛍️ Buy less, choose sustainable products, and repair instead of replace")
    
    if not recs:
        recs.append("✅ Great job! Your carbon footprint is well managed. Keep it up!")
    
    return recs

def predict_carbon_emission(payload):
    """
    Predict next month's carbon emission based on user profile
    
    Args:
        payload: dict with keys:
            - avg_daily_travel_km
            - avg_electricity_kwh
            - avg_lpg_kg
            - avg_nonveg_meals
            - avg_items_purchased
            - last_month_emission
    
    Returns:
        dict with prediction, breakdown, recommendations, etc.
    """
    global model, scaler
    
    # Load model if not already loaded
    if model is None or scaler is None:
        load_or_train_model()
    
    # Extract features
    features = {
        'avg_daily_travel_km': float(payload.get('avg_daily_travel_km', 0)),
        'avg_electricity_kwh': float(payload.get('avg_electricity_kwh', 0)),
        'avg_lpg_kg': float(payload.get('avg_lpg_kg', 0)),
        'avg_nonveg_meals': float(payload.get('avg_nonveg_meals', 0)),
        'avg_items_purchased': float(payload.get('avg_items_purchased', 0)),
        'last_month_emission': float(payload.get('last_month_emission', 0))
    }
    
    # Create feature array
    X = np.array([[
        features['avg_daily_travel_km'],
        features['avg_electricity_kwh'],
        features['avg_lpg_kg'],
        features['avg_nonveg_meals'],
        features['avg_items_purchased'],
        features['last_month_emission']
    ]])
    
    # Scale and predict
    X_scaled = scaler.transform(X)
    prediction = model.predict(X_scaled)[0]
    
    # Get feature importance
    feature_names = ['Travel', 'Electricity', 'LPG', 'Non-Veg Meals', 'Shopping', 'Last Month']
    importances = model.feature_importances_
    feature_impact = dict(zip(feature_names, importances))
    
    # Calculate breakdown by category
    breakdown = {
        'transport': features['avg_daily_travel_km'] * 30 * EMISSION_FACTORS['transport'],
        'electricity': features['avg_electricity_kwh'] * EMISSION_FACTORS['electricity'],
        'lpg': features['avg_lpg_kg'] * EMISSION_FACTORS['lpg'],
        'food': features['avg_nonveg_meals'] * 4 * EMISSION_FACTORS['nonveg_meal'],
        'shopping': features['avg_items_purchased'] * 4 * EMISSION_FACTORS['shopping_item']
    }
    
    # Generate recommendations
    recommendations = generate_recommendations(breakdown, features)
    
    return {
        'predicted_emission_kgCO2': round(prediction, 2),
        'breakdown': {k: round(v, 2) for k, v in breakdown.items()},
        'feature_importance': {k: round(v, 4) for k, v in feature_impact.items()},
        'recommendations': recommendations,
        'comparison_to_last_month': round(prediction - features['last_month_emission'], 2)
    }

def retrain_model():
    """Retrain the model (for admin use)"""
    return train_model()

# Initialize model on module import
load_or_train_model()