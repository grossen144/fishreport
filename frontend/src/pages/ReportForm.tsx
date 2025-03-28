import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { LunarData, WeatherData } from "@fishreport/shared/types/weather";
import { MobileDateTimePicker, MobileDatePicker } from "@mui/x-date-pickers";
import {
  Container,
  Box,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  IconButton,
  Typography,
  Paper,
  Chip,
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";

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
  const [numberOfPersons, setNumberOfPersons] = useState("1");
  const [numberOfFish, setNumberOfFish] = useState("");
  const [perchOver40cm, setPerchOver40cm] = useState("");
  const [numberOfBonusPike, setNumberOfBonusPike] = useState("");
  const [numberOfBonusZander, setNumberOfBonusZander] = useState("");
  const [numberOfBonusPerch, setNumberOfBonusPerch] = useState("");
  const [waterTemperature, setWaterTemperature] = useState("");
  const [bagTotal, setBagTotal] = useState("");
  const [comment, setComment] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [lunarData, setLunarData] = useState<LunarData | null>(null);
  const [error, setError] = useState("");
  const [selectedBuddies, setSelectedBuddies] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [availableBuddies, setAvailableBuddies] = useState<
    Array<{ id: number; name: string }>
  >([]);

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

  useEffect(() => {
    const fetchBuddies = async () => {
      try {
        const response = await axios.get("http://localhost:3003/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAvailableBuddies(response.data);
      } catch (error) {
        console.error("Error fetching buddies:", error);
      }
    };

    fetchBuddies();
  }, []);

  useEffect(() => {
    // Number of persons is current user + number of buddies
    const defaultPersons = (selectedBuddies.length + 1).toString();
    setNumberOfPersons(defaultPersons);
  }, [selectedBuddies]);

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
        user_id: user?.id,
        target_species: species,
        date,
        latitude: location.latitude || null,
        longitude: location.longitude || null,
        location: locationName,
        hours_fished: parseFloat(hoursFishing) || 0,
        number_of_persons: parseInt(numberOfPersons) || 1,
        number_of_fish: parseInt(numberOfFish) || 0,
        perch_over_40: parseInt(perchOver40cm) || null,
        number_of_bonus_pike: parseInt(numberOfBonusPike) || null,
        number_of_bonus_zander: parseInt(numberOfBonusZander) || null,
        number_of_bonus_perch: parseInt(numberOfBonusPerch) || null,
        water_temperature: parseFloat(waterTemperature) || null,
        bag_total: parseFloat(bagTotal) || null,
        comment: comment || null,
        weather_data: weatherData || null,
        lunar_data: lunarData || null,
        buddy_ids: selectedBuddies.map((buddy) => buddy.id),
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
      setNumberOfPersons("1");
      setNumberOfFish("");
      setPerchOver40cm("");
      setNumberOfBonusPike("");
      setNumberOfBonusZander("");
      setWaterTemperature("");
      setBagTotal("");
      setComment("");
      setWeatherData(null);
      setLunarData(null);
      setSelectedBuddies([]);
      setError("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        // Handle Zod validation errors
        if (error.response.data.error.errors) {
          const validationErrors = error.response.data.error.errors.map(
            (err: any) => `${err.path.join(".")}: ${err.message}`
          );
          setError(validationErrors.join("\n"));
        } else {
          // If it's a string, use it directly, otherwise convert to string
          setError(
            typeof error.response.data.error === "string"
              ? error.response.data.error
              : JSON.stringify(error.response.data.error)
          );
        }
      } else {
        setError("Error submitting report");
      }
    }
  };

  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "12px",
  };

  const formCardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "16px",
  };

  const formGridStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
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

  const NumberInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
  }> = ({ label, value, onChange, required }) => {
    const handleChange = (increment: boolean) => {
      const currentValue = parseInt(value) || 0;
      onChange(
        (increment
          ? currentValue + 1
          : Math.max(0, currentValue - 1)
        ).toString()
      );
    };

    return (
      <Box>
        <Typography gutterBottom>{label}</Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => handleChange(false)}>
            <RemoveIcon />
          </IconButton>
          <Typography sx={{ minWidth: 40, textAlign: "center" }}>
            {value || "0"}
          </Typography>
          <IconButton onClick={() => handleChange(true)}>
            <AddIcon />
          </IconButton>
        </Stack>
      </Box>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={formCardStyle}>
        <h1 style={{ marginBottom: "24px", color: "#333" }}>
          New Fishing Trip
        </h1>
        <form onSubmit={handleSubmit} style={formGridStyle}>
          <div>
            <Box>
              <Typography gutterBottom>Targeted specie</Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={species}
                onChange={(_, newValue) => newValue && setSpecies(newValue)}
              >
                <ToggleButton value="perch">Perch</ToggleButton>
                <ToggleButton value="pike">Pike</ToggleButton>
                <ToggleButton value="zander">Zander</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </div>

          <div>
            <MobileDatePicker
              label="Date"
              value={date ? new Date(date) : null}
              onChange={(newDate) => {
                if (newDate) {
                  setDate(newDate.toISOString().split("T")[0]);
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  sx: { mb: 2 },
                },
              }}
            />
          </div>

          <div>
            <Box>
              <Typography gutterBottom>Fishing buddies</Typography>
              <Stack spacing={1}>
                {availableBuddies.map((buddy) => (
                  <Chip
                    key={buddy.id}
                    label={buddy.name}
                    onClick={() => {
                      if (selectedBuddies.some((b) => b.id === buddy.id)) {
                        // Remove buddy if already selected
                        setSelectedBuddies((prev) =>
                          prev.filter((b) => b.id !== buddy.id)
                        );
                      } else {
                        // Add buddy if not selected
                        setSelectedBuddies((prev) => [...prev, buddy]);
                      }
                    }}
                    color={
                      selectedBuddies.some((b) => b.id === buddy.id)
                        ? "primary"
                        : "default"
                    }
                    sx={{
                      width: "100%", // Full width chips
                      height: "48px", // Taller chips for better touch targets
                      "& .MuiChip-label": {
                        fontSize: "1rem", // Larger text
                      },
                    }}
                  />
                ))}
              </Stack>
              {selectedBuddies.length > 0 && (
                <Typography sx={{ mt: 1, color: "text.secondary" }}>
                  Selected: {selectedBuddies.length}{" "}
                  {selectedBuddies.length === 1 ? "buddy" : "buddies"}
                </Typography>
              )}
            </Box>
          </div>

          <div>
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
            <div>
              <label style={labelStyle}>
                Location name
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
            <Box>
              <Typography gutterBottom>Hours fishing</Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={hoursFishing}
                onChange={(_, value) => value && setHoursFishing(value)}
              >
                <ToggleButton value="2">2h</ToggleButton>
                <ToggleButton value="4">4h</ToggleButton>
                <ToggleButton value="6">6h</ToggleButton>
                <ToggleButton value="8">8h</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </div>

          <div>
            <Box>
              <Typography gutterBottom>Number of persons</Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={numberOfPersons}
                onChange={(_, value) => value && setNumberOfPersons(value)}
              >
                <ToggleButton value="1">1</ToggleButton>
                <ToggleButton value="2">2</ToggleButton>
                <ToggleButton value="3">3</ToggleButton>
                <ToggleButton value="4">4</ToggleButton>
                <ToggleButton value="5">5</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </div>

          <div>
            <NumberInput
              label={`Caught ${species}`}
              value={numberOfFish}
              onChange={setNumberOfFish}
              required
            />
          </div>

          {species === "perch" && (
            <>
              <Box>
                <NumberInput
                  label="Perch over 40 cm"
                  value={perchOver40cm}
                  onChange={setPerchOver40cm}
                  required
                />
              </Box>
              <Box>
                <label style={labelStyle}>
                  Top 8 {species} bag total
                  <input
                    type="number"
                    style={inputStyle}
                    value={bagTotal}
                    onChange={(e) => setBagTotal(e.target.value)}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Enter weight in grams
                  </Typography>
                </label>
              </Box>
            </>
          )}

          <Box>
            <Stack direction="row" spacing={2}>
              {species !== "perch" && (
                <Box flex={1}>
                  <NumberInput
                    label="Bonus Perch"
                    value={numberOfBonusPerch}
                    onChange={setNumberOfBonusPerch}
                    required
                  />
                </Box>
              )}
              {species !== "pike" && (
                <Box flex={1}>
                  <NumberInput
                    label="Bonus Pike"
                    value={numberOfBonusPike}
                    onChange={setNumberOfBonusPike}
                    required
                  />
                </Box>
              )}
              {species !== "zander" && (
                <Box flex={1}>
                  <NumberInput
                    label="Bonus Zander"
                    value={numberOfBonusZander}
                    onChange={setNumberOfBonusZander}
                    required
                  />
                </Box>
              )}
            </Stack>
          </Box>

          <div>
            <Box>
              <Typography gutterBottom>Water Temperature (°C)</Typography>
              <Slider
                value={parseFloat(waterTemperature) || 0}
                onChange={(_, value) => setWaterTemperature(value.toString())}
                min={-2}
                max={30}
                marks
                step={0.5}
                valueLabelDisplay="auto"
              />
            </Box>
          </div>

          <div>
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
            <div>
              <h3 style={{ marginBottom: "16px", color: "#333" }}>
                Weather Data
              </h3>
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
          )}

          {error && <div style={errorStyle}>{error}</div>}

          <div>
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
