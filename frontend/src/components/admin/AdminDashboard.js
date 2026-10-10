import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Pagination,
  Rating,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import {
  getAdminHostels,
  getAdminReviews,
  getAdminStats,
  moderateReview,
  updateAdminHostel,
} from "../../services/adminService";
import { getErrorMessage } from "../../services/apiClient";
import { getCurrentUser } from "../../services/auth";

const StatCard = ({ label, value }) => (
  <Card variant="outlined">
    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
      <Typography variant="h5" fontWeight={700}>{value ?? "–"}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </CardContent>
  </Card>
);

const useList = (fetcher, deps) => {
  const [state, setState] = useState({ loading: true, error: "", items: [], pagination: null });
  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const { items, pagination } = await fetcher();
      setState({ loading: false, error: "", items, pagination });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(error, "Couldn't load data.") }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    load();
  }, [load]);
  return [state, load, setState];
};

const ListState = ({ state, onRetry, emptyText }) => {
  if (state.loading) return <Box display="flex" justifyContent="center" py={3}><CircularProgress size={28} /></Box>;
  if (state.error) return <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetry}>Retry</Button>}>{state.error}</Alert>;
  if (!state.items.length) return <Typography color="text.secondary">{emptyText}</Typography>;
  return null;
};

const ListingsTab = ({ onChanged }) => {
  const [filter, setFilter] = useState("unverified");
  const [page, setPage] = useState(1);
  const query = filter === "unverified" ? { verified: "false" } : filter === "archived" ? { status: "archived" } : {};
  const [state, load] = useList(async () => {
    const { hostels, pagination } = await getAdminHostels({ ...query, page });
    return { items: hostels, pagination };
  }, [filter, page]);
  const [actionError, setActionError] = useState("");

  const act = async (hostelId, changes) => {
    setActionError("");
    try {
      await updateAdminHostel(hostelId, changes);
      load();
      onChanged();
    } catch (error) {
      setActionError(getErrorMessage(error, "Couldn't update the listing."));
    }
  };

  return (
    <Box>
      <ToggleButtonGroup size="small" exclusive value={filter} sx={{ mb: 2, flexWrap: "wrap" }}
        onChange={(_, value) => { if (value) { setFilter(value); setPage(1); } }}>
        <ToggleButton value="unverified">Needs verification</ToggleButton>
        <ToggleButton value="all">All listings</ToggleButton>
        <ToggleButton value="archived">Archived</ToggleButton>
      </ToggleButtonGroup>
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
      <ListState state={state} onRetry={load} emptyText="Nothing here." />
      {!state.loading && !state.error && (
        <Stack spacing={1.5}>
          {state.items.map((h) => (
            <Card key={h._id} variant="outlined">
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                  <Box minWidth={0}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography fontWeight={600}>{h.hostel_name}</Typography>
                      {h.isVerified && <Chip icon={<VerifiedIcon />} label="Verified" size="small" color="success" />}
                      <Chip label={h.status || "published"} size="small" variant="outlined" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {[h.hostel_address?.street, h.hostel_address?.city].filter(Boolean).join(", ")} · ₹{h.hostel_rent}/month · {h.hostel_gender_type}
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                      {h.owner_name} · {h.owner_phone_number} · {h.owner_email}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="flex-start" flexShrink={0}>
                    <Button size="small" variant={h.isVerified ? "outlined" : "contained"} color={h.isVerified ? "inherit" : "success"}
                      onClick={() => act(h._id, { isVerified: !h.isVerified })}>
                      {h.isVerified ? "Unverify" : "Verify"}
                    </Button>
                    {h.status === "archived" ? (
                      <Button size="small" onClick={() => act(h._id, { status: "published" })}>Restore</Button>
                    ) : (
                      <Button size="small" color="error" onClick={() => act(h._id, { status: "archived" })}>Archive</Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      {state.pagination?.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={state.pagination.totalPages} page={page} onChange={(_, value) => setPage(value)} />
        </Box>
      )}
    </Box>
  );
};

const ReviewsTab = ({ onChanged }) => {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [state, load] = useList(async () => {
    const { reviews, pagination } = await getAdminReviews(status, page);
    return { items: reviews, pagination };
  }, [status, page]);
  const [actionError, setActionError] = useState("");

  const act = async (reviewId, nextStatus) => {
    setActionError("");
    try {
      await moderateReview(reviewId, nextStatus);
      load();
      onChanged();
    } catch (error) {
      setActionError(getErrorMessage(error, "Couldn't update the review."));
    }
  };

  return (
    <Box>
      <ToggleButtonGroup size="small" exclusive value={status} sx={{ mb: 2 }}
        onChange={(_, value) => { if (value) { setStatus(value); setPage(1); } }}>
        <ToggleButton value="pending">Pending</ToggleButton>
        <ToggleButton value="approved">Approved</ToggleButton>
        <ToggleButton value="rejected">Rejected</ToggleButton>
      </ToggleButtonGroup>
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
      <ListState state={state} onRetry={load} emptyText={status === "pending" ? "The moderation queue is empty." : "Nothing here."} />
      {!state.loading && !state.error && (
        <Stack spacing={1.5}>
          {state.items.map((r) => (
            <Card key={r._id} variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography fontWeight={600}>{r.hostelName}</Typography>
                  <Rating value={r.rating} readOnly size="small" />
                  {r.isVerifiedStay && <Chip icon={<VerifiedIcon />} label="Verified stay" size="small" color="success" variant="outlined" />}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  by {r.reviewerName} · {new Date(r.createdAt).toLocaleDateString("en-IN")}
                </Typography>
                <Typography variant="body2" mt={1} sx={{ whiteSpace: "pre-wrap" }}>{r.comment}</Typography>
                <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1}>
                  {r.status !== "approved" && <Button size="small" variant="contained" color="success" onClick={() => act(r._id, "approved")}>Approve</Button>}
                  {r.status !== "rejected" && <Button size="small" color="error" onClick={() => act(r._id, "rejected")}>Reject</Button>}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      {state.pagination?.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={state.pagination.totalPages} page={page} onChange={(_, value) => setPage(value)} />
        </Box>
      )}
    </Box>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [tab, setTab] = useState("listings");
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");
  const isAdmin = user?.userType === "admin";

  const loadStats = useCallback(() => {
    if (!isAdmin) return;
    getAdminStats()
      .then((data) => { setStats(data); setStatsError(""); })
      .catch((error) => setStatsError(getErrorMessage(error, "Couldn't load stats.")));
  }, [isAdmin]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // The API enforces the admin role; this just avoids showing an empty shell.
  if (!isAdmin) {
    return (
      <Box maxWidth={600} mx="auto" p={2}>
        <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => navigate("/login", { state: [{}, { userType: "" }] })}>Log in</Button>}>
          This page is for HostelNavigator administrators.
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxWidth={1000} mx="auto" px={{ xs: 1, sm: 2 }} py={2}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: "1.6rem", md: "2.1rem" } }}>Admin</Typography>
      {statsError && <Alert severity="error" sx={{ mb: 2 }}>{statsError}</Alert>}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} md={3}><StatCard label="Listings" value={stats?.hostels} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Awaiting verification" value={stats?.unverified} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Reviews to moderate" value={stats?.pendingReviews} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Unanswered inquiries" value={stats?.openInquiries} /></Grid>
      </Grid>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
        <Tab label="Listings" value="listings" />
        <Tab label={stats?.pendingReviews ? `Reviews (${stats.pendingReviews})` : "Reviews"} value="reviews" />
      </Tabs>
      {tab === "listings" ? <ListingsTab onChanged={loadStats} /> : <ReviewsTab onChanged={loadStats} />}
    </Box>
  );
};

export default AdminDashboard;
