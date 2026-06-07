import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

np.random.seed(42)

locations = ["Main Ghat", "Temple Road", "Railway Station", "Bus Stand", "Market Area", "Parking Zone"]
event_types = ["Normal Day", "Snan Day", "Peak Ritual", "Evening Aarti"]

data = []

for i in range(3000):
    hour = np.random.randint(0, 24)
    day_type = np.random.randint(0, 2)
    weather_score = np.random.randint(1, 5)
    location = np.random.choice(locations)
    event_type = np.random.choice(event_types)

    base = 200

    if location in ["Main Ghat", "Temple Road"]:
        base += 400
    if event_type == "Snan Day":
        base += 500
    if event_type == "Peak Ritual":
        base += 700
    if 6 <= hour <= 10 or 17 <= hour <= 21:
        base += 300
    if day_type == 1:
        base += 250

    crowd_count = base + np.random.randint(-100, 200)

    data.append([location, event_type, hour, day_type, weather_score, crowd_count])

df = pd.DataFrame(data, columns=["location", "event_type", "hour", "day_type", "weather_score", "crowd_count"])

df = pd.get_dummies(df, columns=["location", "event_type"])

X = df.drop("crowd_count", axis=1)
y = df["crowd_count"]

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

joblib.dump(model, "crowd_model.pkl")
joblib.dump(list(X.columns), "model_columns.pkl")

print("Model trained successfully")
