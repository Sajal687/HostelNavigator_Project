import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { getOwnerInquiries, updateInquiryStatus } from "../../services/inquiryService";
import { getErrorMessage } from "../../services/apiClient";

const STATUS_LABELS = { new: "New", contacted: "Contacted", closed: "Closed" };

// Lead tracker: every student inquiry for the owner's hostel, with status updates.
const OwnerInquiries = () => {
  const [filter, setFilter] = useState("");
  const [state, setState] = useState({ loading: true, error: "", inquiries: [], counts: null });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const { inquiries, counts } = await getOwnerInquiries(filter || undefined);
      setState({ loading: false, error: "", inquiries, counts });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(error, "Couldn't load inquiries.") }));
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (inquiryId, status) => {
    try {
      await updateInquiryStatus(inquiryId, status);
      load();
    } catch (error) {
      setState((prev) => ({ ...prev, error: getErrorMessage(error, "Couldn't update the inquiry.") }));
    }
  };

  const { counts } = state;
  const total = counts ? counts.new + counts.contacted + counts.closed : 0;

  return (
    <Box>
      <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, value) => value !== null && setFilter(value)}
        sx={{ mb: 2, flexWrap: "wrap" }} aria-label="Filter inquiries">
        <ToggleButton value="">All{counts ? ` (${total})` : ""}</ToggleButton>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <ToggleButton key={value} value={value}>{label}{counts ? ` (${counts[value]})` : ""}</ToggleButton>
        ))}
      </ToggleButtonGroup>

      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>{state.error}</Alert>
      )}
      {state.loading ? (
        <Box display="flex" justifyContent="center" py={3}><CircularProgress size={28} /></Box>
      ) : state.inquiries.length === 0 ? (
        <Typography color="text.secondary">No inquiries {filter ? `marked "${STATUS_LABELS[filter]}"` : "yet"}.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {state.inquiries.map((inquiry) => (
            <Card key={inquiry._id} variant="outlined" sx={{ borderLeft: inquiry.status === "new" ? "4px solid #1976d2" : undefined }}>
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                  <Box minWidth={0}>
                    <Typography fontWeight={600}>{inquiry.student_name}</Typography>
                    <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                      <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                      {inquiry.phone && <> · <a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a></>}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(inquiry.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </Typography>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select value={inquiry.status} onChange={(e) => changeStatus(inquiry._id, e.target.value)} inputProps={{ "aria-label": "Inquiry status" }}>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Stack>
                <Typography variant="body2" mt={1} sx={{ whiteSpace: "pre-wrap" }}>{inquiry.message}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default OwnerInquiries;
