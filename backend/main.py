from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib

app = FastAPI(title="CrowdSense AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("crowd_model.pkl")
model_columns = joblib.load("model_columns.pkl")

locations = [
    {"name": "Main Ghat", "lat": 25.4358, "lng": 81.8463},
    {"name": "Temple Road", "lat": 25.4375, "lng": 81.8480},
    {"name": "Railway Station", "lat": 25.4450, "lng": 81.8320},
    {"name": "Bus Stand", "lat": 25.4280, "lng": 81.8400},
    {"name": "Market Area", "lat": 25.4310, "lng": 81.8510},
    {"name": "Parking Zone", "lat": 25.4210, "lng": 81.8360},
]

@app.get("/")
def home():
    return {"message": "CrowdSense AI Backend is running"}

@app.get("/locations")
def get_locations():
    return locations

@app.get("/predict")
def predict(location: str, event_type: str, hour: int, day_type: int, weather_score: int):
    input_data = pd.DataFrame([{
        "hour": hour,
        "day_type": day_type,
        "weather_score": weather_score
    }])

    for col in model_columns:
        if col not in input_data.columns:
            input_data[col] = 0

    loc_col = "location_" + location
    event_col = "event_type_" + event_type

    if loc_col in input_data.columns:
        input_data[loc_col] = 1

    if event_col in input_data.columns:
        input_data[event_col] = 1

    input_data = input_data[model_columns]
    prediction = int(model.predict(input_data)[0])

    if prediction < 400:
        level = "Low"
    elif prediction < 900:
        level = "Medium"
    else:
        level = "High"

    return {
        "location": location,
        "event_type": event_type,
        "predicted_crowd": prediction,
        "crowd_level": level
    }

@app.get("/alerts")
def alerts():
    return [
        {"area": "Main Ghat", "level": "High", "message": "Heavy crowd expected. Divert pilgrims to Route B."},
        {"area": "Temple Road", "level": "Medium", "message": "Moderate congestion. Monitor movement."},
        {"area": "Parking Zone", "level": "Low", "message": "Safe and open for movement."}
    ]

@app.get("/routes")
def routes(source: str, destination: str):
    return [
        {
            "route": "Route A",
            "path": f"{source} → Temple Road → {destination}",
            "time": "22 mins",
            "crowd": "High",
            "recommendation": "Avoid"
        },
        {
            "route": "Route B",
            "path": f"{source} → Market Area → Parking Zone → {destination}",
            "time": "28 mins",
            "crowd": "Low",
            "recommendation": "Recommended"
        },
        {
            "route": "Route C",
            "path": f"{source} → Bus Stand → {destination}",
            "time": "25 mins",
            "crowd": "Medium",
            "recommendation": "Use if needed"
        }
    ]
