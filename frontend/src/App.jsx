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
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";

const API_URL = "http://127.0.0.1:8000";

const locationData = [
  { name: "Main Ghat", lat: 25.4358, lng: 81.8463, level: "High" },
  { name: "Temple Road", lat: 25.4375, lng: 81.848, level: "Medium" },
  { name: "Railway Station", lat: 25.445, lng: 81.832, level: "Medium" },
  { name: "Bus Stand", lat: 25.428, lng: 81.84, level: "Low" },
  { name: "Market Area", lat: 25.431, lng: 81.851, level: "Medium" },
  { name: "Parking Zone", lat: 25.421, lng: 81.836, level: "Low" },
];

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

  const [routeForm, setRouteForm] = useState({
    source: "Railway Station",
    destination: "Main Ghat",
  });

  const locations = locationData.map((item) => item.name);
  const events = ["Normal Day", "Snan Day", "Peak Ritual", "Evening Aarti"];

  const getPrediction = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/predict`, { params: form });
      setPrediction(res.data);
    } catch (error) {
      alert("Backend is not running. Start FastAPI backend first.");
    } finally {
      setLoading(false);
    }
  };

  const getRoutes = async () => {
    try {
      const res = await axios.get(`${API_URL}/routes`, {
        params: routeForm,
      });
      setRoutes(res.data);
    } catch (error) {
      alert("Backend is not running. Start FastAPI backend first.");
    }
  };

  const getAlerts = async () => {
    try {
      const res = await axios.get(`${API_URL}/alerts`);
      setAlerts(res.data);
    } catch (error) {
      alert("Backend is not running. Start FastAPI backend first.");
    }
  };

  const getLevelClass = (level) => {
    if (level === "High") return "high";
    if (level === "Medium") return "medium";
    return "low";
  };

  const getColor = (level) => {
    if (level === "High") return "#dc2626";
    if (level === "Medium") return "#f59e0b";
    return "#16a34a";
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
            Helps authorities and pilgrims predict congestion, avoid risky routes,
            and improve movement safety during Mahakumbh.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <Activity />
          <h3>AI Prediction</h3>
          <p>Predicts expected crowd density using a trained ML model.</p>
        </div>

        <div className="stat-card">
          <MapPinned />
          <h3>Live Map View</h3>
          <p>Displays major Mahakumbh zones with crowd-level markers.</p>
        </div>

        <div className="stat-card">
          <Route />
          <h3>Route Optimizer</h3>
          <p>Suggests safer route options based on congestion level.</p>
        </div>

        <div className="stat-card">
          <AlertTriangle />
          <h3>Alerts</h3>
          <p>Supports authority decisions with congestion warnings.</p>
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
                onChange={(e) => setForm({ ...form, location: e.target.value })}
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
              <p><strong>Location:</strong> {prediction.location}</p>
              <p><strong>Event:</strong> {prediction.event_type}</p>
              <p><strong>Predicted Crowd:</strong> {prediction.predicted_crowd}</p>
              <p><strong>Crowd Level:</strong> {prediction.crowd_level}</p>
            </div>
          )}
        </div>

        <div className="panel">
          <h2>Interactive Crowd Map</h2>
          <p className="panel-subtitle">
            Real map view using OpenStreetMap + Leaflet.
          </p>

          <div className="real-map">
            <MapContainer
              center={[25.4358, 81.8463]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {locationData.map((loc) => (
                <CircleMarker
                  key={loc.name}
                  center={[loc.lat, loc.lng]}
                  radius={14}
                  pathOptions={{
                    color: getColor(loc.level),
                    fillColor: getColor(loc.level),
                    fillOpacity: 0.75,
                  }}
                >
                  <Popup>
                    <strong>{loc.name}</strong>
                    <br />
                    Crowd Level: {loc.level}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
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
          <h2>Route Optimizer</h2>
          <p className="panel-subtitle">
            Select source and destination to get safer route suggestions.
          </p>

          <div className="form-grid">
            <label>
              Source
              <select
                value={routeForm.source}
                onChange={(e) =>
                  setRouteForm({ ...routeForm, source: e.target.value })
                }
              >
                {locations.map((location) => (
                  <option key={location}>{location}</option>
                ))}
              </select>
            </label>

            <label>
              Destination
              <select
                value={routeForm.destination}
                onChange={(e) =>
                  setRouteForm({ ...routeForm, destination: e.target.value })
                }
              >
                {locations.map((location) => (
                  <option key={location}>{location}</option>
                ))}
              </select>
            </label>
          </div>

          <button className="full-btn secondary-btn" onClick={getRoutes}>
            Find Best Route
          </button>

          {routes.length === 0 ? (
            <p className="empty">Click “Find Best Route” to view suggestions.</p>
          ) : (
            <div className="cards-list">
              {routes.map((route, index) => (
                <div
                  key={index}
                  className={`mini-card ${getLevelClass(route.crowd)}`}
                >
                  <h3>{route.route}</h3>
                  <p>{route.path}</p>
                  <p><Clock size={15} /> {route.time}</p>
                  <p><strong>Crowd:</strong> {route.crowd}</p>
                  <p><strong>Status:</strong> {route.recommendation}</p>
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
                  <p><strong>Level:</strong> {alert.level}</p>
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
          Machine Learning + OpenStreetMap
        </p>
      </footer>
    </div>
  );
}

export default App;
