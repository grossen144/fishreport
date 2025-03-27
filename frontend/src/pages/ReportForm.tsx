import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { LunarData, WeatherData } from "@shared/types/weather";

const ReportForm: React.FC = () => {
  const { user } = useAuth();
  const [species, setSpecies] = useState("perch");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [locationName, setLocationName] = useState("");
  const [hoursFishing, setHoursFishing] = useState("");
  const [numberOfPersons, setNumberOfPersons] = useState("");
  const [numberOfFish, setNumberOfFish] = useState("");
  const [fishOver40cm, setFishOver40cm] = useState("");
  const [bonusPike, setBonusPike] = useState("");
  const [bonusZander, setBonusZander] = useState("");
  const [waterTemperature, setWaterTemperature] = useState("");
  const [bagTotal, setBagTotal] = useState("");
  const [comment, setComment] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [lunarData, setLunarData] = useState<LunarData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (useCurrentLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
          fetchLunarData(date);
        },
        (error) => {
          setError("Error getting location: " + error.message);
        }
      );
    }
  }, [useCurrentLocation]);

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      const response = await axios.get<WeatherData>(
        `http://localhost:3003/api/weather?lat=${lat}&lon=${lon}&date=${date}`
      );
      setWeatherData(response.data);
    } catch (error) {
      setError("Error fetching weather data");
    }
  };

  const fetchLunarData = async (date: string) => {
    try {
      const response = await axios.get<LunarData>(
        `http://localhost:3003/api/weather/lunar?date=${date}`
      );
      setLunarData(response.data);
    } catch (error) {
      setError("Error fetching lunar data");
    }
  };

  const getWindDirection = (deg: number): string => {
    const directions = [
      { min: 337.5, max: 22.5, name: "North" },
      { min: 22.5, max: 67.5, name: "Northeast" },
      { min: 67.5, max: 112.5, name: "East" },
      { min: 112.5, max: 157.5, name: "Southeast" },
      { min: 157.5, max: 202.5, name: "South" },
      { min: 202.5, max: 247.5, name: "Southwest" },
      { min: 247.5, max: 292.5, name: "West" },
      { min: 292.5, max: 337.5, name: "Northwest" },
    ];

    // Handle North's special case (337.5-360 and 0-22.5)
    if (deg >= 337.5 || deg < 22.5) return "North";

    return (
      directions.find((dir) => deg >= dir.min && deg < dir.max)?.name ?? "North"
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reportData = {
        species,
        date,
        latitude: location.latitude,
        longitude: location.longitude,
        locationName,
        hoursFishing: parseFloat(hoursFishing),
        numberOfPersons: parseInt(numberOfPersons),
        numberOfFish: parseInt(numberOfFish),
        fishOver40cm: parseInt(fishOver40cm),
        bonusPike: parseInt(bonusPike),
        bonusZander: parseInt(bonusZander),
        waterTemperature: parseFloat(waterTemperature),
        bagTotal: parseFloat(bagTotal),
        comment,
        ...weatherData,
      };

      await axios.post("http://localhost:3003/api/reports", reportData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Reset form
      setSpecies("perch");
      setDate(new Date().toISOString().split("T")[0]);
      setUseCurrentLocation(false);
      setLocation({ latitude: 0, longitude: 0 });
      setLocationName("");
      setHoursFishing("");
      setNumberOfPersons("");
      setNumberOfFish("");
      setFishOver40cm("");
      setBonusPike("");
      setBonusZander("");
      setWaterTemperature("");
      setBagTotal("");
      setComment("");
      setWeatherData(null);
      setError("");
    } catch (error) {
      setError("Error submitting report");
    }
  };

  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
  };

  const formCardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "24px",
  };

  const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  };

  const fullWidthStyle = {
    gridColumn: "1 / -1",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "16px",
  };

  const switchContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const switchStyle = {
    position: "relative" as const,
    display: "inline-block",
    width: "60px",
    height: "34px",
  };

  const switchInputStyle = {
    opacity: 0,
    width: 0,
    height: 0,
  };

  const switchSliderStyle = {
    position: "absolute" as const,
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ccc",
    transition: ".4s",
    borderRadius: "34px",
  };

  const switchSliderCheckedStyle = {
    ...switchSliderStyle,
    backgroundColor: "#2196F3",
  };

  const switchSliderBeforeStyle = {
    position: "absolute" as const,
    content: '""',
    height: "26px",
    width: "26px",
    left: "4px",
    bottom: "4px",
    backgroundColor: "white",
    transition: ".4s",
    borderRadius: "50%",
  };

  const buttonStyle = {
    backgroundColor: "#2196F3",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    width: "100%",
    marginTop: "20px",
  };

  const errorStyle = {
    color: "#d32f2f",
    marginTop: "8px",
    fontSize: "14px",
  };

  return (
    <div style={containerStyle}>
      <div style={formCardStyle}>
        <h1 style={{ marginBottom: "24px", color: "#333" }}>
          New Fishing Report
        </h1>
        <form onSubmit={handleSubmit} style={formGridStyle}>
          <div>
            <label style={labelStyle}>
              Species
              <select
                style={inputStyle}
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
              >
                <option value="perch">Perch</option>
                <option value="pike">Pike</option>
                <option value="zander">Zander</option>
              </select>
            </label>
          </div>

          <div>
            <label style={labelStyle}>
              Date
              <input
                type="date"
                style={inputStyle}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>
          </div>

          <div style={fullWidthStyle}>
            <label style={switchContainerStyle}>
              <div style={switchStyle}>
                <input
                  type="checkbox"
                  style={switchInputStyle}
                  checked={useCurrentLocation}
                  onChange={(e) => setUseCurrentLocation(e.target.checked)}
                />
                <span
                  style={
                    useCurrentLocation
                      ? switchSliderCheckedStyle
                      : switchSliderStyle
                  }
                >
                  <span style={switchSliderBeforeStyle}></span>
                </span>
              </div>
              Use current location
            </label>
          </div>

          {!useCurrentLocation && (
            <div style={fullWidthStyle}>
              <label style={labelStyle}>
                Location Name
                <input
                  type="text"
                  style={inputStyle}
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  required
                />
              </label>
            </div>
          )}

          <div>
            <label style={labelStyle}>
              Hours Fishing
              <input
                type="number"
                style={inputStyle}
                value={hoursFishing}
                onChange={(e) => setHoursFishing(e.target.value)}
                required
              />
            </label>
          </div>

          <div>
            <label style={labelStyle}>
              Number of Persons
              <input
                type="number"
                style={inputStyle}
                value={numberOfPersons}
                onChange={(e) => setNumberOfPersons(e.target.value)}
                required
              />
            </label>
          </div>

          <div>
            <label style={labelStyle}>
              Number of Fish
              <input
                type="number"
                style={inputStyle}
                value={numberOfFish}
                onChange={(e) => setNumberOfFish(e.target.value)}
                required
              />
            </label>
          </div>

          {species === "perch" && (
            <>
              <div>
                <label style={labelStyle}>
                  Fish over 40cm
                  <input
                    type="number"
                    style={inputStyle}
                    value={fishOver40cm}
                    onChange={(e) => setFishOver40cm(e.target.value)}
                  />
                </label>
              </div>

              <div>
                <label style={labelStyle}>
                  Bonus Pike
                  <input
                    type="number"
                    style={inputStyle}
                    value={bonusPike}
                    onChange={(e) => setBonusPike(e.target.value)}
                  />
                </label>
              </div>

              <div>
                <label style={labelStyle}>
                  Bonus Zander
                  <input
                    type="number"
                    style={inputStyle}
                    value={bonusZander}
                    onChange={(e) => setBonusZander(e.target.value)}
                  />
                </label>
              </div>
            </>
          )}

          <div>
            <label style={labelStyle}>
              Water Temperature
              <input
                type="number"
                style={inputStyle}
                value={waterTemperature}
                onChange={(e) => setWaterTemperature(e.target.value)}
                required
              />
            </label>
          </div>

          <div>
            <label style={labelStyle}>
              Bag Total
              <input
                type="number"
                style={inputStyle}
                value={bagTotal}
                onChange={(e) => setBagTotal(e.target.value)}
                required
              />
            </label>
          </div>

          <div style={fullWidthStyle}>
            <label style={labelStyle}>
              Comment
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: "100px",
                  resize: "vertical",
                }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </label>
          </div>

          {weatherData && (
            <div style={fullWidthStyle}>
              <h3 style={{ marginBottom: "16px", color: "#333" }}>
                Weather Data
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                <div>
                  <strong>Temperature:</strong> {weatherData.main.temp}°C
                </div>
                <div>
                  <strong>Wind Speed:</strong> {weatherData.wind.speed} m/s
                </div>
                <div>
                  <strong>Wind Direction:</strong>{" "}
                  {getWindDirection(weatherData.wind.deg)}
                </div>
                <div>
                  <strong>Weather Condition:</strong>{" "}
                  {weatherData.weather[0].description}
                </div>
                <div>
                  <strong>Barometric Pressure:</strong>{" "}
                  {weatherData.main.pressure} hPa
                </div>
                <div>
                  <strong>Lunar Phase:</strong>
                  {lunarData?.[0]?.Moon[0]}
                </div>
              </div>
            </div>
          )}

          {error && <div style={errorStyle}>{error}</div>}

          <div style={fullWidthStyle}>
            <button type="submit" style={buttonStyle}>
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
