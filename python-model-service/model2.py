import pandas as pd
import numpy as np
from datetime import datetime

TRANSPORT_EMISSION = {
    "Car": 0.21,
    "Bike": 0.09,
    "Public Transport": 0.05,
    "Walking": 0.0,
    "Carpool": 0.07,
    "Electric Car": 0.05
}
GRID_EMISSION_KG_PER_KWH = {
    "State Grid": 0.82,
    "Hybrid": 0.45,
    "Solar": 0.10
}
COOKING_EMISSION_PER_DAY = {
    "LPG": 1.5,
    "PNG": 1.2,
    "Induction": 0.3
}
WASTE_EMISSION_PER_KG = 1.8
FIXED_COST = 150
COST_PER_KWH = 8

def compute_daily_emission(payload):
    # payload example:
    # { "category": "Transport", "details": {"distance_travelled_km": 20, "transport_mode": "Car"} }
    cat = payload.get("category")
    d = payload.get("details", {})
    total = 0.0

    if cat == "Transport":
        dist = float(d.get("distance_travelled_km", 0))
        mode = d.get("transport_mode", "Car")
        total = dist * TRANSPORT_EMISSION.get(mode, 0)

    elif cat == "Electricity":
        # details: electricity_bill, days_in_month, electricity_source
        bill = float(d.get("electricity_bill", 0))
        days = int(d.get("days_in_month", 30))
        variable = max(0, bill - FIXED_COST)
        kwh_per_day = (variable / COST_PER_KWH) / days
        source = d.get("electricity_source", "State Grid")
        total = kwh_per_day * GRID_EMISSION_KG_PER_KWH.get(source, 0.82)

    elif cat == "Cooking":
        fuel = d.get("cooking_fuel_type", "LPG")
        total = COOKING_EMISSION_PER_DAY.get(fuel, 0)

    elif cat == "Waste":
        kg = float(d.get("daily_waste_generated_kg", 0))
        total = kg * WASTE_EMISSION_PER_KG

    elif cat == "Shopping":
        amount = float(d.get("purchase_amount", 0))
        # crude mapping: 1 kg CO2 per ₹500 spent (example)
        total = (amount / 500.0) * 1.0

    elif cat == "Water":
        # use a small emission factor
        liters = float(d.get("liters", 0))
        total = liters * 0.0005

    else:
        total = 0.0

    return {
        "category": cat,
        "total_emission_kgCO2": round(total, 3)
    }
