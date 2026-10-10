import React, { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { sendInquiry } from "../../services/inquiryService";
import { getErrorMessage } from "../../services/apiClient";
import { getCurrentUser } from "../../services/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InquiryDialog = ({ open, onClose, hostelId, hostelName }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const user = getCurrentUser();
  const [values, setValues] = useState({
    student_name: user?.userType === "hostelUser" ? user.userName : "",
    email: "",
    phone: "",
    message: "",
  });
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState({ sending: false, error: "", success: "" });

  const errors = {
    student_name: values.student_name.trim().length < 2 ? "Please enter your name" : "",
    email: !EMAIL_REGEX.test(values.email.trim()) ? "Please enter a valid email" : "",
    message: values.message.trim().length < 10 ? "Please write at least 10 characters" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const set = (key) => (event) => setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const handleClose = () => {
    if (status.success) {
      setValues((prev) => ({ ...prev, message: "" }));
      setStatus({ sending: false, error: "", success: "" });
      setTouched(false);
    }
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    setTouched(true);
    if (hasErrors) return;
    setStatus({ sending: true, error: "", success: "" });
    try {
      const message = await sendInquiry(hostelId, {
        student_name: values.student_name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        message: values.message.trim(),
      });
      setStatus({ sending: false, error: "", success: message });
    } catch (error) {
      setStatus({ sending: false, error: getErrorMessage(error, "Couldn't send your inquiry."), success: "" });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullScreen={fullScreen} fullWidth maxWidth="sm">
      <form onSubmit={submit} noValidate>
        <DialogTitle>Ask {hostelName ? `about ${hostelName}` : "the owner"}</DialogTitle>
        <DialogContent>
          {status.success ? (
            <Alert severity="success" sx={{ mt: 1 }}>{status.success}</Alert>
          ) : (
            <Stack spacing={2} mt={1}>
              <TextField label="Your name" required value={values.student_name} onChange={set("student_name")}
                error={touched && !!errors.student_name} helperText={touched && errors.student_name} inputProps={{ maxLength: 100 }} />
              <TextField label="Email" type="email" required value={values.email} onChange={set("email")}
                error={touched && !!errors.email} helperText={(touched && errors.email) || "The owner replies to this address."} />
              <TextField label="Phone (optional)" type="tel" value={values.phone} onChange={set("phone")} inputProps={{ maxLength: 20 }} />
              <TextField label="Message" required multiline minRows={4} value={values.message} onChange={set("message")}
                placeholder="e.g. Is a single room available from 1 July? What is the security deposit?"
                error={touched && !!errors.message} helperText={(touched && errors.message) || `${values.message.length}/2000`}
                inputProps={{ maxLength: 2000 }} />
              {status.error && <Alert severity="error">{status.error}</Alert>}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>{status.success ? "Close" : "Cancel"}</Button>
          {!status.success && (
            <Button type="submit" variant="contained" disabled={status.sending}
              startIcon={status.sending ? <CircularProgress size={16} color="inherit" /> : null}>
              Send inquiry
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InquiryDialog;
