import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import { getOwnerReviews, replyToReview } from "../../services/reviewService";
import { getErrorMessage } from "../../services/apiClient";

const STATUS_CHIP = {
  approved: { label: "Published", color: "success" },
  pending: { label: "Awaiting moderation", color: "default" },
  rejected: { label: "Hidden by moderator", color: "error" },
};

const ReplyBox = ({ review, onSaved }) => {
  const [text, setText] = useState(review.ownerReply?.text || "");
  const [status, setStatus] = useState({ saving: false, error: "" });

  const save = async () => {
    setStatus({ saving: true, error: "" });
    try {
      const ownerReply = await replyToReview(review._id, text.trim());
      setStatus({ saving: false, error: "" });
      onSaved(ownerReply);
    } catch (error) {
      setStatus({ saving: false, error: getErrorMessage(error, "Couldn't save your reply.") });
    }
  };

  return (
    <Box mt={1}>
      <TextField fullWidth size="small" multiline minRows={2} value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Reply publicly to this review" inputProps={{ maxLength: 1000 }} />
      {status.error && <Alert severity="error" sx={{ mt: 1 }}>{status.error}</Alert>}
      <Box display="flex" justifyContent="flex-end" mt={1}>
        <Button size="small" variant="contained" onClick={save} disabled={!text.trim() || status.saving}>
          {review.ownerReply?.text ? "Update reply" : "Post reply"}
        </Button>
      </Box>
    </Box>
  );
};

const OwnerReviews = () => {
  const [state, setState] = useState({ loading: true, error: "", reviews: [] });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      setState({ loading: false, error: "", reviews: await getOwnerReviews() });
    } catch (error) {
      setState({ loading: false, error: getErrorMessage(error, "Couldn't load reviews."), reviews: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateReply = (reviewId, ownerReply) =>
    setState((prev) => ({ ...prev, reviews: prev.reviews.map((r) => (r._id === reviewId ? { ...r, ownerReply } : r)) }));

  if (state.loading) return <Box display="flex" justifyContent="center" py={3}><CircularProgress size={28} /></Box>;
  if (state.error) {
    return <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>{state.error}</Alert>;
  }
  if (!state.reviews.length) return <Typography color="text.secondary">No reviews yet.</Typography>;

  return (
    <Stack spacing={1.5}>
      {state.reviews.map((review) => (
        <Card key={review._id} variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography fontWeight={600}>{review.reviewerName}</Typography>
              <Rating value={review.rating} readOnly size="small" />
              {review.isVerifiedStay && <Chip icon={<VerifiedIcon />} label="Verified stay" size="small" color="success" variant="outlined" />}
              <Chip size="small" label={STATUS_CHIP[review.status].label} color={STATUS_CHIP[review.status].color} variant="outlined" />
            </Stack>
            <Typography variant="body2" mt={1} sx={{ whiteSpace: "pre-wrap" }}>{review.comment}</Typography>
            {review.status === "approved" && <ReplyBox review={review} onSaved={(reply) => updateReply(review._id, reply)} />}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default OwnerReviews;
