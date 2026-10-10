import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { summarizeListing } from "../../services/aiService";
import { getErrorMessage } from "../../services/apiClient";

const Section = ({ title, icon, items, emptyText }) => (
  <Box>
    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
      {icon}
      <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
    </Stack>
    {items.length ? (
      <List dense disablePadding>
        {items.map((item) => (
          <ListItem key={item} disableGutters sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 20 }}>•</ListItemIcon>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    ) : (
      <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
    )}
  </Box>
);

// Loaded on demand so browsing listings doesn't spend AI calls; the backend caches
// each summary until the listing changes.
const AiInsightsCard = ({ hostelId }) => {
  const [state, setState] = useState({ loading: false, error: "", data: null });

  const load = async () => {
    setState({ loading: true, error: "", data: null });
    try {
      const data = await summarizeListing(hostelId);
      setState({ loading: false, error: "", data });
    } catch (error) {
      setState({ loading: false, error: getErrorMessage(error, "AI insights are unavailable right now."), data: null });
    }
  };

  const summary = state.data?.summary;

  return (
    <Card variant="outlined" sx={{ borderColor: "primary.light" }}>
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} mb={summary ? 2 : 0}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h6" component="h2">AI Insights & House Rules</Typography>
          </Stack>
          {!summary && (
            <Button variant="contained" size="small" onClick={load} disabled={state.loading}
              startIcon={state.loading ? <CircularProgress size={16} color="inherit" /> : null}>
              {state.loading ? "Reading the listing..." : "Summarise this listing"}
            </Button>
          )}
        </Stack>

        {state.error && (
          <Alert severity="warning" sx={{ mt: 2 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
            {state.error}
          </Alert>
        )}

        {summary && (
          <>
            <Typography variant="body1" mb={2}>{summary.overview}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Section title="Key amenities" icon={<CheckCircleOutlineIcon fontSize="small" color="success" />}
                  items={summary.keyAmenities} emptyText="No amenities listed." />
              </Grid>
              <Grid item xs={12} md={6}>
                <Section title="Curfew & security" icon={<ShieldOutlinedIcon fontSize="small" color="primary" />}
                  items={summary.curfewAndSecurity} emptyText="Not mentioned by the owner." />
              </Grid>
              <Grid item xs={12} md={6}>
                <Section title="Deposit & refunds" icon={<AccountBalanceWalletOutlinedIcon fontSize="small" color="primary" />}
                  items={summary.depositAndRefund} emptyText="Not mentioned by the owner." />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} mb={0.5}>Community sentiment</Typography>
                <Typography variant="body2">{summary.communitySentiment}</Typography>
              </Grid>
              {summary.questionsToAsk.length > 0 && (
                <Grid item xs={12}>
                  <Section title="Ask the owner" icon={<HelpOutlineIcon fontSize="small" color="warning" />}
                    items={summary.questionsToAsk} emptyText="" />
                </Grid>
              )}
            </Grid>
            <Typography variant="caption" color="text.secondary" display="block" mt={2}>
              AI-generated from the owner's listing{state.data.cached ? "" : " just now"}. Always confirm important details with the owner.
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AiInsightsCard;
