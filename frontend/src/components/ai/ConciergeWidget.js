import React, { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { askConcierge, getAiStatus } from "../../services/aiService";
import { getErrorMessage } from "../../services/apiClient";

const GREETING = {
  role: "assistant",
  content: "Hi! I'm the HostelNavigator concierge. Ask me to compare hostels, what to check before booking, or anything about a listing.",
};
const MAX_LENGTH = 1000;

const ConciergeWidget = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  // On a hostel's detail page, the concierge answers with that listing in context.
  const onDetailPage = location.pathname === "/hosteldetails";
  const hostelId = onDetailPage ? location.state?.id || searchParams.get("id") : null;

  useEffect(() => {
    getAiStatus().then(setEnabled).catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  if (!enabled) return null;

  const send = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setError("");
    setSending(true);
    try {
      const reply = await askConcierge(next, hostelId);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(getErrorMessage(err, "The concierge is unavailable right now."));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {open && (
        <Paper
          elevation={8}
          role="dialog"
          aria-label="HostelNavigator concierge"
          sx={{
            position: "fixed",
            zIndex: (theme) => theme.zIndex.modal,
            right: { xs: 0, sm: 24 },
            bottom: { xs: 0, sm: 96 },
            width: { xs: "100%", sm: 380 },
            height: { xs: "75vh", sm: 520 },
            display: "flex",
            flexDirection: "column",
            borderRadius: { xs: "16px 16px 0 0", sm: 2 },
            overflow: "hidden",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={1.5} color="#fff" sx={{ background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SupportAgentIcon />
              <Box>
                <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>Concierge</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {hostelId ? "Asking about this hostel" : "AI assistant - verify details with owners"}
                </Typography>
              </Box>
            </Stack>
            <IconButton aria-label="Close concierge" onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box ref={scrollRef} flex={1} overflow="auto" px={2} py={1.5} bgcolor="#f8fafc" aria-live="polite">
            {messages.map((message, index) => (
              <Box key={index} display="flex" justifyContent={message.role === "user" ? "flex-end" : "flex-start"} mb={1}>
                <Box
                  px={1.5}
                  py={1}
                  maxWidth="85%"
                  borderRadius={2}
                  bgcolor={message.role === "user" ? "primary.main" : "#fff"}
                  color={message.role === "user" ? "primary.contrastText" : "text.primary"}
                  boxShadow={message.role === "user" ? 0 : 1}
                  sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                </Box>
              </Box>
            ))}
            {sending && (
              <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                <CircularProgress size={14} />
                <Typography variant="caption">Concierge is typing...</Typography>
              </Stack>
            )}
            {error && <Alert severity="warning" sx={{ mt: 1 }}>{error}</Alert>}
          </Box>

          <Box component="form" onSubmit={send} display="flex" gap={1} p={1.5} borderTop="1px solid #e2e8f0">
            <TextField
              fullWidth
              size="small"
              placeholder="Ask about hostels..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              inputProps={{ maxLength: MAX_LENGTH, "aria-label": "Message" }}
              autoFocus
            />
            <IconButton type="submit" color="primary" aria-label="Send" disabled={!input.trim() || sending}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}

      {!open && (
        <Fab
          color="primary"
          aria-label="Open concierge"
          onClick={() => setOpen(true)}
          // Below md the detail page has a sticky action bar; sit above it.
          sx={{
            position: "fixed",
            right: { xs: 16, sm: 24 },
            bottom: onDetailPage ? { xs: 88, md: 24 } : { xs: 16, sm: 24 },
            zIndex: (theme) => theme.zIndex.speedDial,
          }}
        >
          <SupportAgentIcon />
        </Fab>
      )}
    </>
  );
};

export default ConciergeWidget;
