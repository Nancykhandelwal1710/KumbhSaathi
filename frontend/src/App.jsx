import { useState } from "react";
import axios from "axios";

function App() {
  const [prediction, setPrediction] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const getPrediction = async () => {
    const res = await axios.get(
      "http://127.0.0.1:8000/predict?location=Main Ghat&event_type=Snan Day&hour=9&day_type=1&weather_score=3"
    );

    setPrediction(res.data);
  };

  const getRoutes = async () => {
    const res = await axios.get(
      "http://127.0.0.1:8000/routes?source=Railway Station&destination=Main Ghat"
    );

    setRoutes(res.data);
  };

  const getAlerts = async () => {
    const res = await axios.get(
      "http://127.0.0.1:8000/alerts"
    );

    setAlerts(res.data);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "#f5f7fa",
        fontFamily: "Arial"
      }}
    >
      <h1>🚶 CrowdSense AI</h1>
      <p>
        Intelligent Crowd Flow Prediction & Route Optimization
      </p>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={getPrediction}
          style={{
            padding: "10px",
            marginRight: "10px"
          }}
        >
          Predict Crowd
        </button>

        <button
          onClick={getRoutes}
          style={{
            padding: "10px",
            marginRight: "10px"
          }}
        >
          Route Optimizer
        </button>

        <button
          onClick={getAlerts}
          style={{
            padding: "10px"
          }}
        >
          Get Alerts
        </button>
      </div>

      {prediction && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "white",
            borderRadius: "10px"
          }}
        >
          <h2>Crowd Prediction</h2>

          <p>
            <b>Location:</b> {prediction.location}
          </p>

          <p>
            <b>Event:</b> {prediction.event_type}
          </p>

          <p>
            <b>Predicted Crowd:</b>{" "}
            {prediction.predicted_crowd}
          </p>

          <p>
            <b>Crowd Level:</b>{" "}
            {prediction.crowd_level}
          </p>
        </div>
      )}

      {routes.length > 0 && (
        <div
          style={{
            marginTop: "30px",
            background: "white",
            padding: "20px",
            borderRadius: "10px"
          }}
        >
          <h2>Route Recommendations</h2>

          {routes.map((route, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                marginBottom: "10px",
                padding: "10px"
              }}
            >
              <p>
                <b>{route.route}</b>
              </p>

              <p>{route.path}</p>

              <p>
                Time: {route.time}
              </p>

              <p>
                Crowd: {route.crowd}
              </p>

              <p>
                {route.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}

      {alerts.length > 0 && (
        <div
          style={{
            marginTop: "30px",
            background: "white",
            padding: "20px",
            borderRadius: "10px"
          }}
        >
          <h2>Congestion Alerts</h2>

          {alerts.map((alert, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                marginBottom: "10px",
                padding: "10px"
              }}
            >
              <h3>{alert.area}</h3>

              <p>
                Level: {alert.level}
              </p>

              <p>{alert.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
