import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Stack,
  Typography,
  Fab,
  Button,
  Dialog,
  Box,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Chip,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { TimeField } from "@mui/x-date-pickers";
import axios from "axios";
import { useParams } from "react-router-dom";

interface NumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  required,
}) => {
  const handleChange = (increment: boolean) => {
    const currentValue = parseInt(value) || 0;
    onChange(
      (increment ? currentValue + 1 : Math.max(0, currentValue - 1)).toString()
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

export const ActiveTrip: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any | null>(null);
  const [catches, setCatches] = useState<any[]>([]);
  const [showAddCatch, setShowAddCatch] = useState(false);
  const [error, setError] = useState<string>("");
  const [availableBuddies, setAvailableBuddies] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [selectedBuddies, setSelectedBuddies] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [gpsPosition, setLocationGpsPosition] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [newCatch, setNewCatch] = useState({
    species: "",
    weight_grams: "",
    length_cm: "",
    depth_cm: "",
    caught_at: new Date(),
  });

  // Form state
  const [hoursFishing, setHoursFishing] = useState<string>("");
  const [numberOfFish, setNumberOfFish] = useState("");
  const [perchOver40cm, setPerchOver40cm] = useState("");
  const [numberOfBonusPike, setNumberOfBonusPike] = useState("");
  const [numberOfBonusZander, setNumberOfBonusZander] = useState("");
  const [numberOfBonusPerch, setNumberOfBonusPerch] = useState("");
  const [waterTemperature, setWaterTemperature] = useState("");
  const [bagTotal, setBagTotal] = useState("");
  const [comment, setComment] = useState("");
  const [numberOfPersons, setNumberOfPersons] = useState("1");

  // Auto-save function with debounce
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const capitalize = (str: string | undefined) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const fetchCatches = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:3003/api/trips/${id}/catches`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCatches(response.data);
    } catch (error) {
      console.error("Error fetching catches:", error);
      setError("Error fetching catches");
    }
  }, [id]);

  useEffect(() => {
    const fetchBuddies = async () => {
      try {
        const response = await axios.get("http://localhost:3003/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAvailableBuddies(response.data);

        // If we have trip data with buddy_ids, set the selected buddies
        if (trip?.buddy_ids) {
          const selectedBuddyObjects = (trip.buddy_ids as number[])
            .map((id: number) =>
              response.data.find(
                (b: { id: number; name: string }) => b.id === id
              )
            )
            .filter((b): b is { id: number; name: string } => b !== undefined);
          setSelectedBuddies(selectedBuddyObjects);
        }
      } catch (error) {
        console.error("Error fetching buddies:", error);
      }
    };

    fetchBuddies();
  }, [trip?.buddy_ids]); // Add trip?.buddy_ids as a dependency

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3003/api/trips/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTrip(response.data);
        fetchCatches(); // Fetch catches after getting trip data

        // Convert decimal to whole number string for the toggle buttons
        const hoursValue = response.data.hours_fished
          ? Math.round(response.data.hours_fished).toString()
          : "";
        setHoursFishing(hoursValue);
        setNumberOfFish(response.data.number_of_fish?.toString() || "");
        setPerchOver40cm(response.data.perch_over_40?.toString() || "");
        setNumberOfBonusPike(
          response.data.number_of_bonus_pike?.toString() || ""
        );
        setNumberOfBonusZander(
          response.data.number_of_bonus_zander?.toString() || ""
        );
        setNumberOfBonusPerch(
          response.data.number_of_bonus_perch?.toString() || ""
        );
        setWaterTemperature(response.data.water_temperature?.toString() || "");
        setBagTotal(response.data.bag_total?.toString() || "");
        setComment(response.data.comment || "");
        setNumberOfPersons(response.data.number_of_persons?.toString() || "1");
      } catch (error) {
        setError("Error fetching trip details");
      }
    };

    fetchTrip();
  }, [id, fetchCatches]);

  useEffect(() => {
    if (useCurrentLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationGpsPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError("Error getting location: " + error.message);
        }
      );
    }
  }, [useCurrentLocation]);

  // Auto-save function with debounce
  const autoSave = async (data: any) => {
    // Clear any existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set a new timer
    const timer = setTimeout(async () => {
      try {
        await axios.patch(`http://localhost:3003/api/trips/${id}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } catch (error) {
        console.error("Error auto-saving:", error);
        setError("Error saving changes");
      }
    }, 2000); // 2 second delay

    setDebounceTimer(timer);
  };

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handleEndTrip = async () => {
    try {
      const tripData = {
        hours_fished: parseFloat(hoursFishing) || 0,
        number_of_fish: parseInt(numberOfFish) || 0,
        perch_over_40: parseInt(perchOver40cm) || null,
        number_of_bonus_pike: parseInt(numberOfBonusPike) || null,
        number_of_bonus_zander: parseInt(numberOfBonusZander) || null,
        number_of_bonus_perch: parseInt(numberOfBonusPerch) || null,
        water_temperature: parseFloat(waterTemperature) || null,
        bag_total: parseFloat(bagTotal) || null,
        comment: comment || null,
        status: "completed",
      };

      await axios.patch(`http://localhost:3003/api/trips/${id}`, tripData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Redirect to dashboard or show success message
      window.location.href = "/dashboard";
    } catch (error) {
      setError("Error ending trip");
    }
  };

  const handleAddCatch = async () => {
    try {
      const catchData = {
        trip_id: id,
        species: newCatch.species,
        weight_grams: parseFloat(newCatch.weight_grams),
        length_cm: newCatch.length_cm ? parseFloat(newCatch.length_cm) : null,
        depth_cm: newCatch.depth_cm ? parseFloat(newCatch.depth_cm) : null,
        latitude: useCurrentLocation ? gpsPosition.latitude : null,
        longitude: useCurrentLocation ? gpsPosition.longitude : null,
        caught_at: newCatch.caught_at.toISOString(),
      };

      await axios.post(
        `http://localhost:3003/api/trips/${id}/catches`,
        catchData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Reset form and close dialog
      setNewCatch({
        species: "",
        weight_grams: "",
        length_cm: "",
        depth_cm: "",
        caught_at: new Date(),
      });
      setUseCurrentLocation(false);
      setShowAddCatch(false);

      // Refresh catches list
      fetchCatches();
    } catch (error) {
      setError("Error adding catch");
    }
  };

  const allRequiredFieldsFilled =
    trip && hoursFishing && waterTemperature && numberOfFish;

  return (
    <Container maxWidth="sm">
      {/* Catches List */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h6">Catches</Typography>
          <Typography variant="body2" color="text.secondary">
            {catches.length} {catches.length === 1 ? "catch" : "catches"}
          </Typography>
        </Box>
        <Stack spacing={0.5}>
          {catches.map((catch_) => (
            <Box
              key={catch_.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": {
                  borderBottom: "none",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    textTransform: "capitalize",
                    fontWeight: "medium",
                    minWidth: 60,
                  }}
                >
                  {catch_.species}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(catch_.weight_grams)} gr /{" "}
                  {Math.round(catch_.length_cm)} cm
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {new Date(catch_.caught_at).toLocaleTimeString()}
              </Typography>
            </Box>
          ))}
          {catches.length === 0 && (
            <Typography color="text.secondary" align="center" sx={{ py: 1 }}>
              No catches yet. Add your first catch!
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Trip Details Form */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6">
              {capitalize(trip?.target_species as string) + " Fishing Trip"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {trip?.date
                ? new Date(trip.date as string).toLocaleDateString()
                : ""}
            </Typography>
          </Box>
          {/* Hours Fishing */}
          <Box>
            <Typography gutterBottom>Hours fishing</Typography>
            <Slider
              value={parseFloat(hoursFishing) || 0}
              onChange={(_, value) => {
                setHoursFishing(value.toString());
                autoSave({ hours_fished: value });
              }}
              min={1}
              max={24}
              marks
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Number of Fish */}
          <NumberInput
            label={`Caught ${trip?.target_species} in total`}
            value={numberOfFish}
            onChange={(value) => {
              setNumberOfFish(value);
              autoSave({ number_of_fish: parseInt(value) });
            }}
            required
          />

          {/* Perch-specific fields */}
          {trip?.target_species === "perch" && (
            <>
              <NumberInput
                label="Caught perch over 40 cm"
                value={perchOver40cm}
                onChange={(value) => {
                  setPerchOver40cm(value);
                  autoSave({ perch_over_40: parseInt(value) });
                }}
                required
              />
              <Box>
                <Typography gutterBottom>Top 8 perch bag total</Typography>
                <input
                  type="number"
                  value={bagTotal}
                  onChange={(e) => {
                    setBagTotal(e.target.value);
                    autoSave({ bag_total: parseFloat(e.target.value) });
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    fontSize: "16px",
                  }}
                  placeholder="Enter weight in grams"
                />
              </Box>
            </>
          )}

          {/* Bonus Fish */}
          <Box>
            <Stack direction="row" spacing={2}>
              {trip?.target_species !== "perch" && (
                <Box flex={1}>
                  <NumberInput
                    label="Bonus Perch"
                    value={numberOfBonusPerch}
                    onChange={(value) => {
                      setNumberOfBonusPerch(value);
                      autoSave({ number_of_bonus_perch: parseInt(value) });
                    }}
                    required
                  />
                </Box>
              )}
              {trip?.target_species !== "pike" && (
                <Box flex={1}>
                  <NumberInput
                    label="Bonus Pike"
                    value={numberOfBonusPike}
                    onChange={(value) => {
                      setNumberOfBonusPike(value);
                      autoSave({ number_of_bonus_pike: parseInt(value) });
                    }}
                    required
                  />
                </Box>
              )}
              {trip?.target_species !== "zander" && (
                <Box flex={1}>
                  <NumberInput
                    label="Bonus Zander"
                    value={numberOfBonusZander}
                    onChange={(value) => {
                      setNumberOfBonusZander(value);
                      autoSave({ number_of_bonus_zander: parseInt(value) });
                    }}
                    required
                  />
                </Box>
              )}
            </Stack>
          </Box>

          {/* Water Temperature */}
          <Box>
            <Typography gutterBottom>Water Temperature (°C)</Typography>
            <Slider
              value={parseFloat(waterTemperature) || 0}
              onChange={(_, value) => {
                setWaterTemperature(value.toString());
                autoSave({ water_temperature: value });
              }}
              min={-2}
              max={30}
              marks
              step={0.5}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Fishing Buddies */}
          <Box>
            <Typography gutterBottom>Fishing buddies</Typography>
            <Stack spacing={1}>
              {availableBuddies.map((buddy) => (
                <Chip
                  key={buddy.id}
                  label={buddy.name}
                  onClick={() => {
                    if (selectedBuddies.some((b) => b.id === buddy.id)) {
                      setSelectedBuddies((prev) =>
                        prev.filter((b) => b.id !== buddy.id)
                      );
                      autoSave({
                        buddy_ids: selectedBuddies
                          .map((b) => b.id)
                          .filter((id) => id !== buddy.id),
                      });
                    } else {
                      setSelectedBuddies((prev) => [...prev, buddy]);
                      autoSave({
                        buddy_ids: [
                          ...selectedBuddies.map((b) => b.id),
                          buddy.id,
                        ],
                      });
                    }
                  }}
                  color={
                    selectedBuddies.some((b) => b.id === buddy.id)
                      ? "primary"
                      : "default"
                  }
                  sx={{
                    width: "100%",
                    height: "48px",
                    "& .MuiChip-label": {
                      fontSize: "1rem",
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
          {/* Comment */}
          <Box>
            <Typography gutterBottom>Comment</Typography>
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                autoSave({ comment: e.target.value });
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontSize: "16px",
                minHeight: "100px",
                resize: "vertical",
              }}
              placeholder="Add any notes about the trip..."
            />
          </Box>
        </Stack>
      </Paper>

      {/* Add Catch FAB */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => setShowAddCatch(true)}
      >
        <AddIcon />
      </Fab>

      {/* End Trip Button */}
      <Button
        variant="contained"
        color="success"
        fullWidth
        sx={{ mt: 2, mb: 4 }}
        onClick={handleEndTrip}
        disabled={!allRequiredFieldsFilled}
      >
        End Trip
      </Button>

      {/* Add Catch Dialog */}
      <Dialog
        fullScreen
        open={showAddCatch}
        onClose={() => setShowAddCatch(false)}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Add New Catch
          </Typography>
          <Stack spacing={3}>
            {/* Species Selection */}
            <Box>
              <Typography gutterBottom>Species</Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={newCatch.species}
                onChange={(_, value) => {
                  if (value) {
                    setNewCatch((prev) => ({ ...prev, species: value }));
                  }
                }}
              >
                <ToggleButton value="perch">Perch</ToggleButton>
                <ToggleButton value="pike">Pike</ToggleButton>
                <ToggleButton value="zander">Zander</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Weight and Length */}
            <Box>
              <Typography gutterBottom>Weight (g)</Typography>
              <input
                type="number"
                value={newCatch.weight_grams}
                onChange={(e) =>
                  setNewCatch((prev) => ({
                    ...prev,
                    weight_grams: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                }}
                placeholder="Enter weight in grams"
              />
            </Box>

            <Box>
              <Typography gutterBottom>Length (cm)</Typography>
              <input
                type="number"
                value={newCatch.length_cm}
                onChange={(e) =>
                  setNewCatch((prev) => ({
                    ...prev,
                    length_cm: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                }}
                placeholder="Enter length in centimeters"
              />
            </Box>

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

            {/* Time of Catch */}
            <Box>
              <Typography gutterBottom>Time of Catch</Typography>
              <TimeField
                value={newCatch.caught_at}
                onChange={(newValue) => {
                  if (newValue) {
                    // Keep the trip's date but update the time
                    const tripDate = new Date(trip.date);
                    const newDate = new Date(newValue);
                    tripDate.setHours(newDate.getHours());
                    tripDate.setMinutes(newDate.getMinutes());
                    setNewCatch((prev) => ({
                      ...prev,
                      caught_at: tripDate,
                    }));
                  }
                }}
                format="HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: "Select time",
                  },
                }}
              />
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setShowAddCatch(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddCatch}
                disabled={!newCatch.species || !newCatch.weight_grams}
              >
                Add Catch
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Dialog>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error as string}
        </Typography>
      )}
    </Container>
  );
};
