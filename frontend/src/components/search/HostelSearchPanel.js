import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TuneIcon from "@mui/icons-material/Tune";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { FACILITIES, GENDER_OPTIONS, ROOM_TYPES, SORT_OPTIONS } from "../../constants/listing";
import { parseSearchQuery } from "../../services/aiService";
import { getErrorMessage } from "../../services/apiClient";

export const EMPTY_FILTERS = {
  q: "",
  city: "",
  minRent: "",
  maxRent: "",
  gender: "",
  roomTypes: [],
  facilities: [],
  lat: null,
  lng: null,
  radiusKm: 5,
  sort: "rating_desc",
};

const RADIUS_OPTIONS = [2, 5, 10, 20];
const genderLabel = (id) => GENDER_OPTIONS.find((g) => g.id === id)?.label || id;
const roomLabel = (id) => ROOM_TYPES.find((r) => r.id === id)?.label || id;

// Human-readable chips describing what the AI understood.
const describeFilters = (f) => {
  const chips = [];
  if (f.city) chips.push(`City: ${f.city}`);
  if (f.minRent && f.maxRent) chips.push(`₹${f.minRent} – ₹${f.maxRent}`);
  else if (f.maxRent) chips.push(`Up to ₹${f.maxRent}`);
  else if (f.minRent) chips.push(`From ₹${f.minRent}`);
  if (f.gender) chips.push(genderLabel(f.gender));
  f.roomTypes.forEach((r) => chips.push(roomLabel(r)));
  f.facilities.forEach((fac) => chips.push(fac));
  if (f.keywords) chips.push(`Name: ${f.keywords}`);
  return chips;
};

const HostelSearchPanel = ({ filters, onApply, aiEnabled, initialSmartQuery }) => {
  const [mode, setMode] = useState(initialSmartQuery ? "smart" : "filters");
  const [draft, setDraft] = useState(filters);
  const [smartQuery, setSmartQuery] = useState(initialSmartQuery || "");
  const initialQueryRan = useRef(false);
  const [aiState, setAiState] = useState({ loading: false, error: "", understood: null });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Keep the form in sync when filters are applied from elsewhere (e.g. smart search).
  useEffect(() => setDraft(filters), [filters]);

  const update = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const hasLocation = draft.lat !== null && draft.lng !== null;

  const handleNearMe = (event) => {
    setLocationError("");
    if (!event.target.checked) {
      setDraft((prev) => ({
        ...prev,
        lat: null,
        lng: null,
        sort: prev.sort === "distance" ? "rating_desc" : prev.sort,
      }));
      return;
    }
    if (!navigator.geolocation) {
      setLocationError("Your browser can't share your location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setDraft((prev) => ({
          ...prev,
          lat: Number(position.coords.latitude.toFixed(5)),
          lng: Number(position.coords.longitude.toFixed(5)),
          sort: "distance",
        }));
      },
      () => {
        setLocating(false);
        setLocationError("Location permission was denied, so we can't search near you.");
      },
      { timeout: 10000 }
    );
  };

  const handleApply = (event) => {
    event.preventDefault();
    onApply(draft);
  };

  const handleReset = () => {
    setAiState({ loading: false, error: "", understood: null });
    setSmartQuery("");
    onApply(EMPTY_FILTERS);
  };

  const handleSmartSearch = (event) => {
    event.preventDefault();
    runSmartSearch(smartQuery);
  };

  // A query typed into the home page hero runs once on arrival.
  useEffect(() => {
    if (initialSmartQuery && !initialQueryRan.current) {
      initialQueryRan.current = true;
      runSmartSearch(initialSmartQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSmartQuery]);

  async function runSmartSearch(text) {
    if (text.trim().length < 3) {
      setAiState({ loading: false, error: "Tell us a little more about what you need.", understood: null });
      return;
    }
    setAiState({ loading: true, error: "", understood: null });
    try {
      const result = await parseSearchQuery(text.trim());
      const next = {
        ...EMPTY_FILTERS,
        // Keep "near me" if it's on; landmark wishes come back as `unmatched`.
        lat: draft.lat,
        lng: draft.lng,
        radiusKm: draft.radiusKm,
        sort: hasLocation ? "distance" : "rating_desc",
        q: result.keywords || "",
        city: result.city || "",
        minRent: result.minRent ?? "",
        maxRent: result.maxRent ?? "",
        gender: result.gender || "",
        roomTypes: result.roomTypes,
        facilities: result.facilities,
      };
      setAiState({ loading: false, error: "", understood: result });
      onApply(next);
    } catch (error) {
      setAiState({ loading: false, error: getErrorMessage(error, "Smart search is unavailable right now. Try the filters instead."), understood: null });
    }
  }

  const understoodChips = aiState.understood ? describeFilters(aiState.understood) : [];

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3, boxShadow: 1 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} mb={2}>
        <Typography variant="h6" component="h2">
          Search filters
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={mode}
          onChange={(_, value) => value && setMode(value)}
          aria-label="Search mode"
        >
          <ToggleButton value="filters" aria-label="Filters">
            <TuneIcon fontSize="small" sx={{ mr: 0.5 }} /> Filters
          </ToggleButton>
          <Tooltip title={aiEnabled ? "" : "Smart search is not available right now"}>
            <span>
              <ToggleButton value="smart" disabled={!aiEnabled} aria-label="Smart search">
                <AutoAwesomeIcon fontSize="small" sx={{ mr: 0.5 }} /> Smart search
              </ToggleButton>
            </span>
          </Tooltip>
        </ToggleButtonGroup>
      </Stack>

      {mode === "smart" ? (
        <Box component="form" onSubmit={handleSmartSearch}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={smartQuery}
              onChange={(e) => setSmartQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSmartSearch(e);
              }}
              inputProps={{ maxLength: 500 }}
              label="Describe the place you want"
              placeholder="e.g. single room for girls in Indore under ₹8,000 with food and laundry"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={aiState.loading}
              startIcon={aiState.loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
              sx={{ minWidth: 140 }}
            >
              {aiState.loading ? "Thinking..." : "Search"}
            </Button>
          </Stack>
          {aiState.error && <Alert severity="warning" sx={{ mt: 2 }}>{aiState.error}</Alert>}
          {aiState.understood && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Understood as:
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {understoodChips.length ? (
                  understoodChips.map((label) => <Chip key={label} label={label} size="small" color="primary" variant="outlined" />)
                ) : (
                  <Typography variant="body2">No specific filters - showing all hostels.</Typography>
                )}
              </Stack>
              {aiState.understood.unmatched.length > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  We can't filter by these yet, so check them with the owner: {aiState.understood.unmatched.join(", ")}.
                </Alert>
              )}
              <Button size="small" sx={{ mt: 1 }} onClick={() => setMode("filters")}>
                Adjust filters
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <Box component="form" onSubmit={handleApply}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Hostel name or area"
                value={draft.q}
                onChange={(e) => update("q", e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TextField fullWidth size="small" label="City" placeholder="Any city" InputLabelProps={{ shrink: true }} value={draft.city} onChange={(e) => update("city", e.target.value)} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Min budget / month"
                value={draft.minRent}
                onChange={(e) => update("minRent", e.target.value)}
                inputProps={{ min: 0, step: 500 }}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Max budget / month"
                value={draft.maxRent}
                onChange={(e) => update("maxRent", e.target.value)}
                inputProps={{ min: 0, step: 500 }}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="gender-label" shrink>For</InputLabel>
                <Select labelId="gender-label" label="For" value={draft.gender} onChange={(e) => update("gender", e.target.value)} displayEmpty notched>
                  <MenuItem value="">Anyone</MenuItem>
                  {GENDER_OPTIONS.map((g) => <MenuItem key={g.id} value={g.id}>{g.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="room-label" shrink>Room</InputLabel>
                <Select
                  labelId="room-label"
                  label="Room"
                  multiple
                  value={draft.roomTypes}
                  onChange={(e) => update("roomTypes", e.target.value)}
                  renderValue={(selected) => (selected.length ? selected.map(roomLabel).join(", ") : "Any room")}
                  displayEmpty
                  notched
                >
                  {ROOM_TYPES.map((r) => <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="sort-label">Sort by</InputLabel>
                <Select labelId="sort-label" label="Sort by" value={draft.sort} onChange={(e) => update("sort", e.target.value)}>
                  {SORT_OPTIONS.filter((s) => !s.needsLocation || hasLocation).map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                size="small"
                options={FACILITIES}
                value={draft.facilities}
                onChange={(_, value) => update("facilities", value)}
                renderInput={(params) => (
                  <TextField {...params} label="Must have" placeholder={draft.facilities.length ? "" : "Any facilities"}
                    InputLabelProps={{ ...params.InputLabelProps, shrink: true }} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} display="flex" alignItems="center" flexWrap="wrap" gap={1}>
              <FormControlLabel
                control={<Switch checked={hasLocation} onChange={handleNearMe} disabled={locating} />}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {locating ? <CircularProgress size={16} /> : <MyLocationIcon fontSize="small" />}
                    <span>Near me</span>
                  </Stack>
                }
              />
              {hasLocation && (
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <InputLabel id="radius-label">Within</InputLabel>
                  <Select labelId="radius-label" label="Within" value={draft.radiusKm} onChange={(e) => update("radiusKm", e.target.value)}>
                    {RADIUS_OPTIONS.map((km) => <MenuItem key={km} value={km}>{km} km</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            </Grid>
            <Grid item xs={12} sm={6} display="flex" justifyContent={{ xs: "stretch", sm: "flex-end" }} gap={1}>
              <Button onClick={handleReset} sx={{ flex: { xs: 1, sm: "none" } }}>Reset</Button>
              <Button type="submit" variant="contained" sx={{ flex: { xs: 1, sm: "none" } }}>Apply filters</Button>
            </Grid>
          </Grid>
          {locationError && <Alert severity="warning" sx={{ mt: 2 }}>{locationError}</Alert>}
        </Box>
      )}
    </Paper>
  );
};

export default HostelSearchPanel;
