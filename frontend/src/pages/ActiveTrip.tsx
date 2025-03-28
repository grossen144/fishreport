import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import axios from "axios";
import { FishingTrip } from "@fishreport/shared/types/fishing-trip";

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
  const [trip, setTrip] = useState<FishingTrip | null>(null);
  const [catches, setCatches] = useState<any[]>([]);
  const [showAddCatch, setShowAddCatch] = useState(false);

  // Auto-save function
  const autoSave = async (data: any) => {
    try {
      await axios.patch(`/api/trips/${trip?.id}`, data);
    } catch (error) {
      console.error("Error auto-saving:", error);
    }
  };

  const allRequiredFieldsFilled =
    trip &&
    trip.hours_fished &&
    trip.water_temperature &&
    trip.number_of_persons;

  return (
    <Container maxWidth="sm">
      {/* Trip Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">{trip?.target_species} Trip</Typography>
        <Typography variant="body2" color="text.secondary">
          {trip?.date ? new Date(trip.date).toLocaleDateString() : ""}
        </Typography>
      </Paper>

      {/* Catches List */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Catches
        </Typography>
        <Stack spacing={2}>
          {catches.map((catch_) => (
            <Paper key={catch_.id} sx={{ p: 2 }}>
              <Typography>{catch_.species}</Typography>
              <Typography variant="body2">
                {catch_.weight_grams}g • {catch_.length_cm}cm
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Paper>

      {/* Additional Details (with auto-save) */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Trip Details
        </Typography>
        <Stack spacing={2}>
          <NumberInput
            label="Hours Fishing"
            value={trip?.hours_fished?.toString() || ""}
            onChange={(value) => {
              setTrip((prev) =>
                prev ? { ...prev, hours_fished: parseInt(value) } : null
              );
              autoSave({ hours_fished: parseInt(value) });
            }}
          />
          {/* Other details with auto-save */}
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

      {/* End Trip Button (enabled when required fields are filled) */}
      <Button
        variant="contained"
        color="success"
        fullWidth
        sx={{ mt: 2, mb: 4 }}
        onClick={() => {
          /* End trip logic */
        }}
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
        {/* Add catch form */}
      </Dialog>
    </Container>
  );
};
