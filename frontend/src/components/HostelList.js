import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Hostel from "./Hostel";
import { Alert, Box, Button, CircularProgress, Container, Pagination, Typography } from "@mui/material";
import HostelSearchPanel, { EMPTY_FILTERS } from "./search/HostelSearchPanel";
import { searchHostels } from "../services/hostelService";
import { getAiStatus } from "../services/aiService";
import { getErrorMessage } from "../services/apiClient";

const PAGE_SIZE = 12;

const HostelList = () => {
  // The home page hero hands over either filters or a smart-search query.
  const location = useLocation();
  const [filters, setFilters] = useState(() =>
    location.state?.filters ? { ...EMPTY_FILTERS, ...location.state.filters } : EMPTY_FILTERS
  );
  const [page, setPage] = useState(1);
  const [results, setResults] = useState({ hostels: [], pagination: null });
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    getAiStatus().then(setAiEnabled).catch(() => setAiEnabled(false));
  }, []);

  const fetchHostels = useCallback(async () => {
    setStatus({ loading: true, error: "" });
    try {
      const data = await searchHostels({ ...filters, page, limit: PAGE_SIZE });
      setResults(data);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: getErrorMessage(err, "We couldn't load hostels. Please try again.") });
    }
  }, [filters, page]);

  useEffect(() => {
    fetchHostels();
  }, [fetchHostels]);

  const handleApply = (next) => {
    setPage(1);
    setFilters(next);
  };

  const { hostels, pagination } = results;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Box mb={3}>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
          Find your perfect hostel
        </Typography>
        <Typography variant="body1" mt={0.75}>
          Verified hostels and PGs for students. Filter by city, budget and amenities, or try Smart search.
        </Typography>
      </Box>

      <HostelSearchPanel
        filters={filters}
        onApply={handleApply}
        aiEnabled={aiEnabled}
        initialSmartQuery={location.state?.smartQuery}
      />

      {pagination && !status.loading && !status.error && (
        <Typography variant="body2" color="text.secondary" mb={1}>
          {pagination.total} hostel{pagination.total === 1 ? "" : "s"} found
        </Typography>
      )}

      {status.loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress aria-label="Loading hostels" />
        </Box>
      ) : status.error ? (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchHostels}>Retry</Button>}>
          {status.error}
        </Alert>
      ) : hostels.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" gutterBottom>No hostels match your search</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Try a higher budget, fewer facilities, or a bigger radius.
          </Typography>
          <Button variant="outlined" onClick={() => handleApply(EMPTY_FILTERS)}>Clear all filters</Button>
        </Box>
      ) : (
        <>
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(min(100%, 270px), 1fr))"
            gap={3}
          >
            {hostels.map((hostel) => (
              <Hostel
                key={hostel._id}
                id={hostel._id}
                hostel_id={hostel.hostel_id}
                name={hostel.hostel_name}
                address={hostel.hostel_address}
                rent={hostel.hostel_rent}
                rating={hostel.hostel_rating}
                image={hostel.hostel_img}
                ownerName={hostel.owner_name}
                contactPhn={hostel.owner_phone_number}
                email={hostel.owner_email}
                allowGender={hostel.hostel_gender_type}
                facilities={hostel.hostel_facilities}
                isVerified={hostel.isVerified}
                hasVacancy={hostel.has_vacancy !== false}
                distanceKm={hostel.distanceKm}
              />
            ))}
          </Box>
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, value) => {
                  setPage(value);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default HostelList;
