import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { updateHostel } from "../../services/hostelService";
import { getErrorMessage } from "../../services/apiClient";

// Lets owners describe the hostel and its rules; the AI listing summary is built from these.
const ListingDetailsEditor = ({ hostelId, description = "", houseRules = "" }) => {
  const [values, setValues] = useState({ description, house_rules: houseRules });
  const [saved, setSaved] = useState({ description, house_rules: houseRules });
  const [status, setStatus] = useState({ saving: false, error: "", success: "" });

  const dirty = values.description !== saved.description || values.house_rules !== saved.house_rules;

  const save = async (event) => {
    event.preventDefault();
    setStatus({ saving: true, error: "", success: "" });
    try {
      const updated = await updateHostel(hostelId, values);
      const next = { description: updated.description || "", house_rules: updated.house_rules || "" };
      setValues(next);
      setSaved(next);
      setStatus({ saving: false, error: "", success: "Saved. Students will see the updated AI summary." });
    } catch (error) {
      setStatus({ saving: false, error: getErrorMessage(error, "Couldn't save your changes."), success: "" });
    }
  };

  return (
    <Box component="form" onSubmit={save}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
        About & House Rules
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Mention curfew timings, guest policy, security deposit and refund terms - students see an AI summary of this.
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Description"
          multiline
          minRows={3}
          value={values.description}
          onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
          inputProps={{ maxLength: 5000 }}
          helperText={`${values.description.length}/5000`}
        />
        <TextField
          label="House rules, deposit & refunds"
          multiline
          minRows={3}
          value={values.house_rules}
          onChange={(e) => setValues((prev) => ({ ...prev, house_rules: e.target.value }))}
          inputProps={{ maxLength: 3000 }}
          helperText={`${values.house_rules.length}/3000`}
          placeholder="e.g. Gate closes at 10 PM. Deposit of one month's rent, refunded within 15 days of leaving."
        />
        {status.error && <Alert severity="error">{status.error}</Alert>}
        {status.success && <Alert severity="success">{status.success}</Alert>}
        <Box display="flex" justifyContent="flex-end">
          <Button type="submit" variant="contained" disabled={!dirty || status.saving}
            startIcon={status.saving ? <CircularProgress size={16} color="inherit" /> : null}>
            Save
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default ListingDetailsEditor;
