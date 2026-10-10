import React, { useState } from "react";
import { Alert, Box, Chip, FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import { updateHostel } from "../../services/hostelService";
import { getErrorMessage } from "../../services/apiClient";

// Visibility and vacancy toggles for the owner's listing.
const ListingSettings = ({ hostel }) => {
  const [settings, setSettings] = useState({
    published: !hostel.status || hostel.status === "published",
    hasVacancy: hostel.has_vacancy !== false,
  });
  const [status, setStatus] = useState({ saving: false, error: "" });
  const archived = hostel.status === "archived";

  const save = async (changes, next) => {
    const previous = settings;
    setSettings(next); // optimistic; reverted on failure
    setStatus({ saving: true, error: "" });
    try {
      await updateHostel(hostel._id, changes);
      setStatus({ saving: false, error: "" });
    } catch (error) {
      setSettings(previous);
      setStatus({ saving: false, error: getErrorMessage(error, "Couldn't save the change.") });
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Listing settings</Typography>
        {hostel.isVerified
          ? <Chip icon={<VerifiedIcon />} label="Verified by HostelNavigator" color="success" size="small" />
          : <Chip label="Verification pending" size="small" variant="outlined" />}
      </Stack>
      {archived ? (
        <Alert severity="warning">This listing was archived by an administrator. Contact support to restore it.</Alert>
      ) : (
        <Stack>
          <FormControlLabel
            control={<Switch checked={settings.published} disabled={status.saving}
              onChange={(e) => save({ status: e.target.checked ? "published" : "draft" }, { ...settings, published: e.target.checked })} />}
            label={settings.published ? "Visible to students" : "Hidden (draft)"}
          />
          <FormControlLabel
            control={<Switch checked={settings.hasVacancy} disabled={status.saving}
              onChange={(e) => save({ has_vacancy: e.target.checked }, { ...settings, hasVacancy: e.target.checked })} />}
            label={settings.hasVacancy ? "Rooms available" : "Currently full"}
          />
        </Stack>
      )}
      {status.error && <Alert severity="error" sx={{ mt: 1 }}>{status.error}</Alert>}
    </Box>
  );
};

export default ListingSettings;
