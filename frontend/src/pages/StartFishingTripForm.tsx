import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Box,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { MobileDatePicker } from "@mui/x-date-pickers";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { LunarData, WeatherData } from "@fishreport/shared/types/weather";

interface Buddy {
  id: number;
  name: string;
}

export const StartTripForm: React.FC = () => {
  const { user } = useAuth();
  const [species, setSpecies] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [gpsPosition, setLocationGpsPosition] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [lunarData, setLunarData] = useState<LunarData | null>(null);
  const [selectedBuddies, setSelectedBuddies] = useState<Buddy[]>([]);
  const [availableBuddies, setAvailableBuddies] = useState<Buddy[]>([]);
  const [numberOfPersons, setNumberOfPersons] = useState("1");
  const [error, setError] = useState("");
  const [hasActiveTrip, setHasActiveTrip] = useState(false);
  const [activeTripId, setActiveTripId] = useState<number | null>(null);

  const fetchWeatherData = useCallback(
    async (lat: number, lon: number) => {
      try {
        const response = await axios.get<WeatherData>(
          `http://localhost:3003/api/weather?lat=${lat}&lon=${lon}&date=${date}`
        );
        setWeatherData(response.data);
      } catch (error) {
        setError("Error fetching weather data");
      }
    },
    [date]
  );

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

  // const getWindDirection = (deg: number): string => {
  //   const directions = [
  //     { min: 337.5, max: 22.5, name: "North" },
  //     { min: 22.5, max: 67.5, name: "Northeast" },
  //     { min: 67.5, max: 112.5, name: "East" },
  //     { min: 112.5, max: 157.5, name: "Southeast" },
  //     { min: 157.5, max: 202.5, name: "South" },
  //     { min: 202.5, max: 247.5, name: "Southwest" },
  //     { min: 247.5, max: 292.5, name: "West" },
  //     { min: 292.5, max: 337.5, name: "Northwest" },
  //   ];

  //   // Handle North's special case (337.5-360 and 0-22.5)
  //   if (deg >= 337.5 || deg < 22.5) return "North";

  //   return (
  //     directions.find((dir) => deg >= dir.min && deg < dir.max)?.name ?? "North"
  //   );
  // };

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
    if (useCurrentLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationGpsPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
          fetchLunarData(date?.toISOString() || new Date().toISOString());
        },
        (error) => {
          setError("Error getting location: " + error.message);
        }
      );
    }
  }, [useCurrentLocation, date, fetchWeatherData]);

  useEffect(() => {
    // Number of persons is current user + number of buddies
    const defaultPersons = (selectedBuddies.length + 1).toString();
    setNumberOfPersons(defaultPersons);
  }, [selectedBuddies]);

  useEffect(() => {
    const checkActiveTrip = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3003/api/trips/active",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data && typeof response.data.id === "number") {
          setHasActiveTrip(true);
          setActiveTripId(response.data.id);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          setError(error.response.data.error);
        } else {
          setError("Error checking active trips");
        }
      }
    };

    checkActiveTrip();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const tripData = {
        user_id: user?.id,
        target_species: species,
        date: date?.toISOString(),
        latitude: gpsPosition.latitude ?? null,
        longitude: gpsPosition.longitude ?? null,
        location: location ?? null,
        number_of_persons: parseInt(numberOfPersons) || 1,
        weather_data: weatherData,
        lunar_data: lunarData,
        status: "active",
      };

      // Create trip first
      const response = await axios.post(
        "http://localhost:3003/api/trips/start",
        tripData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        // Then create buddy relationships
        if (selectedBuddies.length > 0) {
          await axios.post(
            `http://localhost:3003/api/trips/${response.data.id}/buddies`,
            { buddyIds: selectedBuddies.map((b) => b.id) },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }

        window.location.href = `/active-trip/${response.data.id}`;
      } else {
        console.error("Failed to create trip:", response.data);
      }
    } catch (error) {
      console.error("Error starting trip:", error);
      setError("Failed to create trip");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 2, my: 2 }}>
        <Typography variant="h5" gutterBottom>
          Start New Trip
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {hasActiveTrip ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="error" gutterBottom>
              You already have an active trip
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Please complete or end your current trip before starting a new
              one.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                (window.location.href = `/active-trip/${activeTripId}`)
              }
              sx={{ mt: 2 }}
            >
              Go to Active Trip
            </Button>
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Species Selection */}
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

            {/* Date Picker */}
            <MobileDatePicker
              label="Date*"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              slotProps={{
                textField: { fullWidth: true },
              }}
            />

            {/* Location Toggle */}
            <Box>
              <Typography gutterBottom>Location</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={useCurrentLocation}
                    onChange={(e) => setUseCurrentLocation(e.target.checked)}
                    color="primary"
                  />
                }
                label="Use current location"
                sx={{
                  width: "100%",
                  margin: 0,
                  padding: "8px 16px",
                  backgroundColor: "background.paper",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              />
            </Box>

            {!useCurrentLocation && (
              <Box>
                <Typography gutterBottom>Location Name</Typography>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location name"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    fontSize: "16px",
                  }}
                />
              </Box>
            )}

            {/* Buddy Selection */}
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

            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={!species || !date}
            >
              Start Trip
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  );
};
