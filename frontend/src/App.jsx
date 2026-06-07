import { useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  MapPinned,
  Route,
  Users,
  Activity,
  ShieldCheck,
  Clock,
} from "lucide-react";
import "./index.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [prediction, setPrediction] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    location: "Main Ghat",
    event_type: "Snan Day",
    hour: 9,
    day_type: 1,
    weather_score: 3,
  });

  const locations = [
    "Main Ghat",
    "Temple Road",
    "Railway Station",
    "Bus Stand",
    "Market Area",
    "Parking Zone",
  ];

  const events = ["Normal Day", "Snan Day", "Peak Ritual", "Evening Aarti"];

  const getPrediction = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/predict`, {
        params: form,
      });

      setPrediction(res.data);
    } catch (error) {
      alert("Backend is not running. Start FastAPI backend first.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRoutes = async () => {
    try {
      const res = await axios.get(`${API_URL}/routes`, {
        params: {
          source: "Railway Station",
          destination: "Main Ghat",
        },
      });

      setRoutes(res.data);
    } catch (error) {
      alert("Backend is not running. Start FastAPI backend first.");
      console.error(error);
    }
  };

  const getAlerts = async () => {
    try {
      const res = await axios.get(`${API_URL}/alerts`);
      setAlerts(res.data);
    } catch (error) {
      alert("Backend is not running. Start FastAPI backend first.");
      console.error(error);
    }
  };

  const getLevelClass = (level) => {
    if (level === "High") return "high";
    if (level === "Medium") return "medium";
    return "low";
  };

  return (
    <div className="app">
      <section className="hero">
        <div>
          <p className="badge">Mahakumbh Innovation Hackathon 2028</p>
          <h1>🕉️ KumbhSaathi</h1>
          <p className="subtitle">
            Smart Crowd Prediction & Route Optimization for Mahakumbh
          </p>

          <div className="hero-buttons">
            <button onClick={getPrediction}>
              <Users size={18} />
              Predict Crowd
            </button>

            <button onClick={getRoutes} className="secondary">
              <Route size={18} />
              Optimize Route
            </button>

            <button onClick={getAlerts} className="warning">
              <AlertTriangle size={18} />
              Get Alerts
            </button>
          </div>
        </div>

        <div className="hero-card">
          <ShieldCheck size={42} />
          <h3>AI Safety Assistant</h3>
          <p>
            Helps authorities and pilgrims identify congestion, avoid risky
            routes, and improve movement safety.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <Activity />
          <h3>Real-time Intelligence</h3>
          <p>Predict crowd density using AI-assisted forecasting.</p>
        </div>

        <div className="stat-card">
          <MapPinned />
          <h3>Hotspot Monitoring</h3>
          <p>Track major locations like ghats, roads, and stations.</p>
        </div>

        <div className="stat-card">
          <Route />
          <h3>Route Optimization</h3>
          <p>Recommend safer paths based on congestion level.</p>
        </div>

        <div className="stat-card">
          <AlertTriangle />
          <h3>Congestion Alerts</h3>
          <p>Notify when specific zones need crowd diversion.</p>
        </div>
      </section>

      <section className="main-grid">
        <div className="panel">
          <h2>Predict Crowd Flow</h2>
          <p className="panel-subtitle">
            Select conditions and predict expected crowd density.
          </p>

          <div className="form-grid">
            <label>
              Location
              <select
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              >
                {locations.map((location) => (
                  <option key={location}>{location}</option>
                ))}
              </select>
            </label>

            <label>
              Event Type
              <select
                value={form.event_type}
                onChange={(e) =>
                  setForm({ ...form, event_type: e.target.value })
                }
              >
                {events.map((event) => (
                  <option key={event}>{event}</option>
                ))}
              </select>
            </label>

            <label>
              Hour
              <input
                type="number"
                min="0"
                max="23"
                value={form.hour}
                onChange={(e) =>
                  setForm({ ...form, hour: Number(e.target.value) })
                }
              />
            </label>

            <label>
              Day Type
              <select
                value={form.day_type}
                onChange={(e) =>
                  setForm({ ...form, day_type: Number(e.target.value) })
                }
              >
                <option value={0}>Normal Day</option>
                <option value={1}>Peak Day</option>
              </select>
            </label>

            <label>
              Weather Score
              <select
                value={form.weather_score}
                onChange={(e) =>
                  setForm({ ...form, weather_score: Number(e.target.value) })
                }
              >
                <option value={1}>1 - Clear</option>
                <option value={2}>2 - Warm</option>
                <option value={3}>3 - Humid</option>
                <option value={4}>4 - Difficult</option>
              </select>
            </label>
          </div>

          <button className="full-btn" onClick={getPrediction}>
            {loading ? "Predicting..." : "Run AI Prediction"}
          </button>

          {prediction && (
            <div className={`result-card ${getLevelClass(prediction.crowd_level)}`}>
              <h3>Prediction Result</h3>
              <p>
                <strong>Location:</strong> {prediction.location}
              </p>
              <p>
                <strong>Event:</strong> {prediction.event_type}
              </p>
              <p>
                <strong>Predicted Crowd:</strong>{" "}
                {prediction.predicted_crowd}
              </p>
              <p>
                <strong>Crowd Level:</strong> {prediction.crowd_level}
              </p>
            </div>
          )}
        </div>

        <div className="panel map-panel">
          <h2>Mahakumbh Crowd Hotspots</h2>
          <p className="panel-subtitle">
            Simulated hotspot view for key public zones.
          </p>

          <div className="map-box">
            <div className="map-point red" style={{ top: "28%", left: "48%" }}>
              Main Ghat
            </div>
            <div className="map-point yellow" style={{ top: "43%", left: "62%" }}>
              Temple Road
            </div>
            <div className="map-point yellow" style={{ top: "58%", left: "35%" }}>
              Railway Station
            </div>
            <div className="map-point green" style={{ top: "70%", left: "54%" }}>
              Bus Stand
            </div>
            <div className="map-point green" style={{ top: "38%", left: "28%" }}>
              Parking Zone
            </div>
          </div>

          <div className="legend">
            <span><b className="dot red-dot"></b> High</span>
            <span><b className="dot yellow-dot"></b> Medium</span>
            <span><b className="dot green-dot"></b> Low</span>
          </div>
        </div>
      </section>

      <section className="main-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Route Recommendations</h2>
              <p className="panel-subtitle">
                Safer route suggestions for pilgrims.
              </p>
            </div>

            <button onClick={getRoutes}>Load Routes</button>
          </div>

          {routes.length === 0 ? (
            <p className="empty">Click “Load Routes” to view suggestions.</p>
          ) : (
            <div className="cards-list">
              {routes.map((route, index) => (
                <div
                  key={index}
                  className={`mini-card ${getLevelClass(route.crowd)}`}
                >
                  <h3>{route.route}</h3>
                  <p>{route.path}</p>
                  <p>
                    <Clock size={15} /> {route.time}
                  </p>
                  <p>
                    <strong>Crowd:</strong> {route.crowd}
                  </p>
                  <p>
                    <strong>Status:</strong> {route.recommendation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Congestion Alerts</h2>
              <p className="panel-subtitle">
                Alerts for authority decision support.
              </p>
            </div>

            <button className="warning" onClick={getAlerts}>
              Load Alerts
            </button>
          </div>

          {alerts.length === 0 ? (
            <p className="empty">Click “Load Alerts” to view alerts.</p>
          ) : (
            <div className="cards-list">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`mini-card ${getLevelClass(alert.level)}`}
                >
                  <h3>{alert.area}</h3>
                  <p>
                    <strong>Level:</strong> {alert.level}
                  </p>
                  <p>{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer>
        <p>
          Built for Mahakumbh Innovation Hackathon 2028 | React + FastAPI +
          Machine Learning
        </p>
      </footer>
    </div>
  );
}

export default App;
