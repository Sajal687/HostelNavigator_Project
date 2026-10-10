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
  Divider,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import { createReview, getHostelReviews } from "../../services/reviewService";
import { getErrorMessage } from "../../services/apiClient";
import { getCurrentUser } from "../../services/auth";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const ReviewForm = ({ hostelId, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState({ sending: false, error: "", success: "" });

  const submit = async (event) => {
    event.preventDefault();
    if (!rating) return setStatus({ sending: false, error: "Please choose a star rating.", success: "" });
    if (comment.trim().length < 10) return setStatus({ sending: false, error: "Please write at least 10 characters.", success: "" });
    setStatus({ sending: true, error: "", success: "" });
    try {
      const result = await createReview(hostelId, { rating, comment: comment.trim() });
      setStatus({ sending: false, error: "", success: result.message });
      if (result.status === "approved") onSubmitted();
    } catch (error) {
      setStatus({ sending: false, error: getErrorMessage(error, "Couldn't post your review."), success: "" });
    }
  };

  if (status.success) return <Alert severity="success">{status.success}</Alert>;

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>Write a review</Typography>
      <Rating value={rating} onChange={(_, value) => setRating(value || 0)} size="large" aria-label="Your rating" />
      <TextField fullWidth multiline minRows={3} sx={{ mt: 1 }} value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="How were the rooms, food, safety and the owner?" inputProps={{ maxLength: 2000 }}
        helperText={`${comment.length}/2000`} />
      {status.error && <Alert severity="error" sx={{ mt: 1 }}>{status.error}</Alert>}
      <Box display="flex" justifyContent="flex-end" mt={1}>
        <Button type="submit" variant="contained" disabled={status.sending}
          startIcon={status.sending ? <CircularProgress size={16} color="inherit" /> : null}>
          Post review
        </Button>
      </Box>
    </Box>
  );
};

const ReviewsSection = ({ hostelId }) => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [state, setState] = useState({ loading: true, error: "", reviews: [], summary: null, pagination: null });

  const load = useCallback(async (page = 1) => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const data = await getHostelReviews(hostelId, page);
      setState((prev) => ({
        loading: false,
        error: "",
        reviews: page === 1 ? data.reviews : [...prev.reviews, ...data.reviews],
        summary: data.summary,
        pagination: data.pagination,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(error, "Couldn't load reviews.") }));
    }
  }, [hostelId]);

  useEffect(() => {
    load(1);
  }, [load]);

  const { reviews, summary, pagination } = state;
  const hasMore = pagination && pagination.page < pagination.totalPages;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={2}>
          <Typography variant="h6" component="h2">Student reviews</Typography>
          {summary && summary.count > 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Rating value={summary.average} precision={0.1} readOnly size="small" />
              <Typography variant="body2">{summary.average} · {summary.count} review{summary.count === 1 ? "" : "s"}</Typography>
            </Stack>
          )}
        </Stack>

        {state.error && (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => load(1)}>Retry</Button>}>{state.error}</Alert>
        )}
        {!state.loading && !state.error && reviews.length === 0 && (
          <Typography variant="body2" color="text.secondary">No reviews yet. Students who stay here can share their experience.</Typography>
        )}

        <Stack divider={<Divider flexItem />} spacing={2}>
          {reviews.map((review) => (
            <Box key={review._id}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="subtitle2">{review.reviewerName}</Typography>
                <Rating value={review.rating} readOnly size="small" />
                {review.isVerifiedStay && <Chip icon={<VerifiedIcon />} label="Verified stay" size="small" color="success" variant="outlined" />}
                <Typography variant="caption" color="text.secondary">{formatDate(review.createdAt)}</Typography>
              </Stack>
              <Typography variant="body2" mt={0.5} sx={{ whiteSpace: "pre-wrap" }}>{review.comment}</Typography>
              {review.ownerReply && (
                <Box mt={1} ml={2} pl={1.5} borderLeft="3px solid #e0e0e0">
                  <Typography variant="caption" fontWeight={600}>Owner's reply</Typography>
                  <Typography variant="body2">{review.ownerReply.text}</Typography>
                </Box>
              )}
            </Box>
          ))}
        </Stack>

        {state.loading && <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>}
        {hasMore && !state.loading && (
          <Box textAlign="center" mt={2}><Button onClick={() => load(pagination.page + 1)}>Show more reviews</Button></Box>
        )}

        <Divider sx={{ my: 2 }} />
        {user?.userType === "hostelUser" ? (
          <ReviewForm hostelId={hostelId} onSubmitted={() => load(1)} />
        ) : user ? null : (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
            <Typography variant="body2" color="text.secondary">Stayed here? Log in as a student to leave a review.</Typography>
            <Button size="small" onClick={() => navigate("/login", { state: [{}, { userType: "" }] })}>Log in</Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewsSection;
