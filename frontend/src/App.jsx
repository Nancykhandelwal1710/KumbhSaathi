import { useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Route,
  Users,
  Activity,
  ShieldCheck,
  Clock,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Popup,
  CircleMarker,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";

const API_URL = "https://kumbhsaathi-backend-o91s.onrender.com";

const cityData = {
  Prayagraj: {
    center: [25.4358, 81.8463],
    locations: [
      { name: "Triveni Sangam", lat: 25.429, lng: 81.885, level: "High" },
      { name: "Arail Ghat", lat: 25.421, lng: 81.889, level: "Medium" },
      { name: "Prayagraj Junction", lat: 25.435, lng: 81.846, level: "Medium" },
      { name: "Civil Lines Bus Stand", lat: 25.45, lng: 81.84, level: "Low" },
      { name: "Tent City", lat: 25.414, lng: 81.9, level: "Medium" },
      { name: "Akhara Area", lat: 25.433, lng: 81.875, level: "High" },
    ],
  },
  Ujjain: {
    center: [23.1765, 75.7885],
    locations: [
      { name: "Ram Ghat", lat: 23.1765, lng: 75.7885, level: "High" },
      { name: "Mahakaleshwar Temple", lat: 23.1828, lng: 75.7682, level: "High" },
      { name: "Ujjain Junction", lat: 23.1793, lng: 75.7849, level: "Medium" },
      { name: "Mela Ground", lat: 23.17, lng: 75.79, level: "Medium" },
      { name: "Nanakaheda Bus Stand", lat: 23.176, lng: 75.755, level: "Low" },
      { name: "Shipra Riverfront", lat: 23.174, lng: 75.789, level: "High" },
    ],
  },
  Haridwar: {
    center: [29.9457, 78.1642],
    locations: [
      { name: "Har Ki Pauri", lat: 29.9569, lng: 78.1715, level: "High" },
      { name: "Mansa Devi Route", lat: 29.96, lng: 78.17, level: "Medium" },
      { name: "Haridwar Railway Station", lat: 29.9457, lng: 78.1642, level: "Medium" },
      { name: "Haridwar Bus Stand", lat: 29.949, lng: 78.158, level: "Low" },
      { name: "Chandi Ghat", lat: 29.951, lng: 78.19, level: "Medium" },
      { name: "Parking Zone", lat: 29.94, lng: 78.15, level: "Low" },
    ],
  },
  Nashik: {
    center: [20.0059, 73.791],
    locations: [
      { name: "Ramkund", lat: 20.007, lng: 73.79, level: "High" },
      { name: "Trimbakeshwar Temple", lat: 19.9322, lng: 73.5297, level: "High" },
      { name: "Nashik Road Station", lat: 19.9475, lng: 73.8411, level: "Medium" },
      { name: "Tapovan Area", lat: 20.02, lng: 73.8, level: "Medium" },
      { name: "CBS Bus Stand", lat: 20.002, lng: 73.78, level: "Low" },
      { name: "Godavari Ghat", lat: 20.006, lng: 73.789, level: "High" },
    ],
  },
};

function ChangeMapView({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

function App() {
  const [selectedCity, setSelectedCity] = useState("Prayagraj");
  const [prediction, setPrediction] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [nearbyServices, setNearbyServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const locationData = cityData[selectedCity].locations;
  const mapCenter = cityData[selectedCity].center;
  const locations = locationData.map((item) => item.name);

  const [form, setForm] = useState({
    location: "Triveni Sangam",
    event_type: "Snan Day",
    hour: 9,
    day_type: 1,
    weather_score: 3,
  });

  const [routeForm, setRouteForm] = useState({
    source: "Arail Ghat",
    destination: "Triveni Sangam",
  });

  const events = ["Normal Day", "Snan Day", "Peak Ritual", "Evening Aarti"];

  const getCoordinates = (name) => {
    return locationData.find((item) => item.name === name);
  };

  const sourceLocation = getCoordinates(routeForm.source);
  const destinationLocation = getCoordinates(routeForm.destination);

  const routePath =
    sourceLocation && destinationLocation
      ? [
          [sourceLocation.lat, sourceLocation.lng],
          [destinationLocation.lat, destinationLocation.lng],
        ]
      : [];
  const getWeather = async () => {
    try {
      const res = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude: mapCenter[0],
          longitude: mapCenter[1],
          current: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
        },
      });

      setWeather(res.data.current);
    } catch (error) {
      console.error(error);
      alert("Weather data could not be loaded.");
    }
  };
  const getNearbyServices = async () => {
    try {
      setServicesLoading(true);

      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:3000,${mapCenter[0]},${mapCenter[1]});
          node["amenity"="police"](around:3000,${mapCenter[0]},${mapCenter[1]});
          node["amenity"="parking"](around:3000,${mapCenter[0]},${mapCenter[1]});
          node["amenity"="bus_station"](around:3000,${mapCenter[0]},${mapCenter[1]});
        );
        out body;
      `;

      const res = await axios.post(
        "https://overpass-api.de/api/interpreter",
        query,
        {
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );

      const services = res.data.elements
        .filter((item) => item.tags?.name)
        .slice(0, 8)
        .map((item) => ({
          name: item.tags.name,
          type: item.tags.amenity,
          lat: item.lat,
          lon: item.lon,
      }));

      setNearbyServices(services);
    } catch (error) {
      console.error(error);
      alert("Nearby services could not be loaded.");
    } finally {
      setServicesLoading(false);
    }
  };
  const handleCityChange = (city) => {
    const cityLocations = cityData[city].locations;
    const firstLocation = cityLocations[0].name;
    const secondLocation = cityLocations[1].name;

    setSelectedCity(city);
    setForm((prev) => ({
      ...prev,
      location: firstLocation,
    }));

    setRouteForm({
      source: secondLocation,
      destination: firstLocation,
    });

    setPrediction(null);
    setRoutes([]);
    setAlerts([]);
    setWeather(null);
    setNearbyServices([]);
  };

  const getPrediction = async () => {
    try {
      setLoading(true);

      const backendLocationMap = {
        "Triveni Sangam": "Main Ghat",
        "Arail Ghat": "Temple Road",
        "Prayagraj Junction": "Railway Station",
        "Civil Lines Bus Stand": "Bus Stand",
        "Tent City": "Market Area",
        "Akhara Area": "Main Ghat",

        "Ram Ghat": "Main Ghat",
        "Mahakaleshwar Temple": "Temple Road",
        "Ujjain Junction": "Railway Station",
        "Mela Ground": "Market Area",
        "Nanakaheda Bus Stand": "Bus Stand",
        "Shipra Riverfront": "Main Ghat",

        "Har Ki Pauri": "Main Ghat",
        "Mansa Devi Route": "Temple Road",
        "Haridwar Railway Station": "Railway Station",
        "Haridwar Bus Stand": "Bus Stand",
        "Chandi Ghat": "Market Area",
        "Parking Zone": "Parking Zone",

        "Ramkund": "Main Ghat",
        "Trimbakeshwar Temple": "Temple Road",
        "Nashik Road Station": "Railway Station",
        "Tapovan Area": "Market Area",
        "CBS Bus Stand": "Bus Stand",
        "Godavari Ghat": "Main Ghat",
      };

      const res = await axios.get(`${API_URL}/predict`, {
        params: {
          ...form,
          location: backendLocationMap[form.location] || "Main Ghat",
        },
      });

      setPrediction({
        ...res.data,
        city: selectedCity,
        location: form.location,
      });
    } catch (error) {
      alert("Backend is not running or backend request failed.");
      console.error(error);
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
      alert("Backend is not running or route request failed.");
      console.error(error);
    }
  };

  const getAlerts = async () => {
    try {
      const res = await axios.get(`${API_URL}/alerts`);

      const cityAlerts = res.data.map((alert) => ({
        ...alert,
        area:
          selectedCity === "Prayagraj"
            ? alert.area
            : selectedCity === "Ujjain"
            ? alert.area.replace("Main Ghat", "Ram Ghat").replace("Temple Road", "Mahakaleshwar Temple").replace("Parking Zone", "Nanakaheda Bus Stand")
            : selectedCity === "Haridwar"
            ? alert.area.replace("Main Ghat", "Har Ki Pauri").replace("Temple Road", "Mansa Devi Route").replace("Parking Zone", "Parking Zone")
            : alert.area.replace("Main Ghat", "Ramkund").replace("Temple Road", "Trimbakeshwar Temple").replace("Parking Zone", "CBS Bus Stand"),
      }));

      setAlerts(cityAlerts);
    } catch (error) {
      alert("Backend is not running or alert request failed.");
      console.error(error);
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
          <p className="badge">Mahakumbh Innovation Hackathon 2026</p>
          <h1>🕉️ KumbhSaathi</h1>
          <p className="subtitle">
            Smart Crowd Prediction & Route Optimization for Every Kumbh City
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
          <h3>Scalable Kumbh Safety Assistant</h3>
          <p>
            Supports city-wise crowd prediction, route optimization, map
            monitoring, and congestion alerts for major Kumbh locations.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <Activity />
          <h3>4 Kumbh Cities</h3>
          <p>Prayagraj, Ujjain, Haridwar, and Nashik supported.</p>
        </div>

        <div className="stat-card">
          <AlertTriangle />
          <h3>City-wise Alerts</h3>
          <p>Congestion alerts adapt based on the selected city.</p>
        </div>

        <div className="stat-card">
          <Route />
          <h3>Route Options</h3>
          <p>Alternative routes generated for safer pilgrim movement.</p>
        </div>

        <div className="stat-card">
          <ShieldCheck />
          <h3>AI Decision Support</h3>
          <p>Prediction, alerts, routing, and maps combined in one platform.</p>
        </div>
      </section>

      <section className="city-selector-section">
        <div>
          <h2>Select Kumbh City</h2>
          <p>
            KumbhSaathi works as a configurable platform for different Kumbh
            locations across India.
          </p>
        </div>

        <select value={selectedCity} onChange={(e) => handleCityChange(e.target.value)}>
          {Object.keys(cityData).map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </section>

      <section className="main-grid">
        <div className="panel">
          <h2>Predict Crowd Flow</h2>
          <p className="panel-subtitle">
            Select city, location, event type, and conditions to predict crowd density.
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
                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
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
                onChange={(e) => setForm({ ...form, hour: Number(e.target.value) })}
              />
            </label>

            <label>
              Day Type
              <select
                value={form.day_type}
                onChange={(e) => setForm({ ...form, day_type: Number(e.target.value) })}
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
              <p><strong>City:</strong> {prediction.city}</p>
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
            City-wise map using OpenStreetMap + Leaflet.
          </p>

          <div className="real-map">
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <ChangeMapView center={mapCenter} />

              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {locationData.map((loc) => (
                <CircleMarker
                  key={loc.name}
                  center={[loc.lat, loc.lng]}
                  radius={16}
                  pathOptions={{
                    color: getColor(loc.level),
                    fillColor: getColor(loc.level),
                    fillOpacity: 0.75,
                  }}
                >
                  <Popup>
                    <strong>{loc.name}</strong>
                    <br />
                    City: {selectedCity}
                    <br />
                    Crowd Level: {loc.level}
                  </Popup>
                </CircleMarker>
              ))}

              <Polyline
                positions={routePath}
                pathOptions={{
                  color: "#2563eb",
                  weight: 6,
                }}
              />
            </MapContainer>
          </div>

          <div className="legend">
            <span><b className="dot red-dot"></b> High</span>
            <span><b className="dot yellow-dot"></b> Medium</span>
            <span><b className="dot green-dot"></b> Low</span>
            <span><b className="dot blue-dot"></b> Selected Route</span>
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
      <section className="main-grid">
        <div className="panel">
          <h2>Visitor Safety Assistant</h2>
          <p className="panel-subtitle">
            Personalized safety guidance for pilgrims based on selected city and crowd conditions.
          </p>

          <div className="safety-card">
            <h3>Recommended Visit Plan</h3>
            <p><strong>Selected City:</strong> {selectedCity}</p>
            <p><strong>Best Time to Visit:</strong> 5:00 AM - 8:00 AM</p>
            <p><strong>Avoid Peak Hours:</strong> 11:00 AM - 3:00 PM</p>
            <p><strong>Suggested Action:</strong> Prefer low-crowd routes and avoid high-risk ghats during peak rituals.</p>
          </div>

          <div className="tips-grid">
            <div>
              <h4>Before Visit</h4>
              <p>Carry water, ID card, phone battery backup, and note the nearest help center.</p>
            </div>

            <div>
              <h4>During Crowd</h4>
              <p>Move with the flow, avoid pushing, stay with your group, and follow police instructions.</p>
            </div>

            <div>
              <h4>If Separated</h4>
              <p>Go to the nearest Lost & Found center or police assistance booth immediately.</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Real Nearby Services</h2>
              <p className="panel-subtitle">
                Live nearby hospitals, police stations, parking, and transport points from OpenStreetMap.
              </p>
            </div>

            <button className="secondary" onClick={getNearbyServices}>
              {servicesLoading ? "Loading..." : "Find Nearby"}
            </button>
          </div>

          {nearbyServices.length === 0 ? (
            <p className="empty">
              Click “Find Nearby” to fetch real public services near {selectedCity}.
            </p>
          ) : (
            <div className="emergency-grid">
              {nearbyServices.map((service, index) => (
                <div className="emergency-card" key={index}>
                  <h3>
                    {service.type === "hospital"
                      ? "🚑"
                      : service.type === "police"
                      ? "🚓"
                      : service.type === "parking"
                      ? "🅿️"
                      : "🚌"}{" "}
                    {service.name}
                  </h3>

                  <p>
                    Type: {service.type}
                  </p>

                  <span>
                    Real OSM location
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="main-grid">
        <div className="panel">
          <h2>Best Time Predictor</h2>
          <p className="panel-subtitle">
            Helps visitors choose safer time slots for darshan and bathing.
          </p>

          <div className="time-grid">
            <div className="time-card safe">
              <h3>Best Time</h3>
              <p>5:00 AM - 8:00 AM</p>
              <span>Low crowd expected</span>
            </div>

            <div className="time-card moderate">
              <h3>Manageable Time</h3>
              <p>8:00 AM - 11:00 AM</p>
              <span>Moderate movement</span>
            </div>

            <div className="time-card danger">
              <h3>Avoid Time</h3>
              <p>11:00 AM - 3:00 PM</p>
              <span>High congestion risk</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>Smart Travel Advisory</h2>

          <p className="panel-subtitle">
            AI-powered recommendations for safer pilgrimage planning.
          </p>

         <div className="safety-card">
            <h3>{selectedCity} Travel Advisory</h3>

            <p>
              <strong>Recommended Entry Point:</strong>{" "}
              {routeForm.source}
            </p>

            <p>
              <strong>Recommended Destination:</strong>{" "}
              {routeForm.destination}
            </p>

            <p>
              <strong>Best Visit Time:</strong> 5:00 AM - 8:00 AM
            </p>

            <p>
              <strong>Avoid Peak Hours:</strong> 11:00 AM - 3:00 PM
            </p>

            <p>
              <strong>Parking Availability:</strong> Available in outer parking zones
            </p>

            <p>
              <strong>Safety Recommendation:</strong> Use low crowd routes and avoid
              heavily congested areas during major rituals.
            </p>
          </div>

          <div className="tips-grid">
            <div>
              <h4>Visitor Action</h4>
              <p>
                Follow suggested routes and travel during recommended hours.
              </p>
            </div>

            <div>
              <h4>Authority Action</h4>
              <p>
                Increase volunteer deployment near high-risk crowd locations.
              </p>
            </div>

            <div>
              <h4>Emergency Preparedness</h4>
              <p>
                Keep emergency contacts accessible and identify nearby help centers.
              </p>
            </div>
          </div>

          <div className="safety-card" style={{ marginTop: "20px" }}>
            <h3>Lost Person Assistance</h3>

            <p>
              Generate a help request reference for missing or separated pilgrims.
            </p>

            <p>
              <strong>Reference ID:</strong>{" "}
              KS-{selectedCity.toUpperCase().slice(0, 3)}-10452
            </p>

            <p>
              <strong>Status:</strong> Ready for nearest Police Help Booth
            </p>

            <p>
              <strong>Nearest Support:</strong> Lost & Found Center
            </p>
          </div>
        </div>
      </section>
      
      <section className="panel live-section">
        <h2>Live Weather Risk</h2>
        <p className="panel-subtitle">
          Real-time weather data for the selected Kumbh city.
        </p>

        <button
          onClick={getWeather}
          className="secondary"
          style={{ marginTop: "12px", marginBottom: "16px" }}
        >
          <Activity size={18} />
          Load Live Weather
        </button> 

        {!weather ? (
          <p className="empty">Click “Live Weather” to fetch real-time city weather.</p>
        ) : (
          <div className="weather-grid">
            <div>
              <h3>🌡️ Temperature</h3>
              <p>{weather.temperature_2m}°C</p>
            </div>

            <div>
              <h3>💧 Humidity</h3>
              <p>{weather.relative_humidity_2m}%</p>
            </div>

            <div>
              <h3>🌧️ Rain</h3>
              <p>{weather.precipitation} mm</p>
            </div>

            <div>
              <h3>🌬️ Wind Speed</h3>
              <p>{weather.wind_speed_10m} km/h</p>
            </div>
          </div>
        )}
      </section>

      <section className="workflow-section">
        <h2>How KumbhSaathi Works</h2>
        <p>
          KumbhSaathi uses AI-assisted crowd forecasting to help authorities and
          pilgrims make safer movement decisions across different Kumbh cities.
        </p>

        <div className="workflow-grid">
          <div>
            <h3>1. City Configuration</h3>
            <p>
              Authorities select the Kumbh city and monitor location-specific hotspots.
            </p>
          </div>

          <div>
            <h3>2. ML Prediction</h3>
            <p>
              A Random Forest model predicts expected crowd count and classifies
              congestion as Low, Medium, or High.
            </p>
          </div>

          <div>
            <h3>3. Route Intelligence</h3>
            <p>
              Route suggestions help pilgrims avoid risky paths and support
              authority-level diversion planning.
            </p>
          </div>

          <div>
            <h3>4. Decision Dashboard</h3>
            <p>
              The dashboard combines prediction, alerts, maps, and route guidance
              into one monitoring interface.
            </p>
          </div>
        </div>
      </section>

      <footer>
        <p>
          Built for Mahakumbh Innovation Hackathon 2026 | React + FastAPI +
          Machine Learning + OpenStreetMap
        </p>
      </footer>
    </div>
  );
}

export default App;
