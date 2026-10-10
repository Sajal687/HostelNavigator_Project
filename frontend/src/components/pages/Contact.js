import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import SendIcon from '@mui/icons-material/Send';
import { getContactStatus, sendContactMessage } from '../../services/contactService';
import { getErrorMessage } from '../../services/apiClient';
import { tokens } from '../../theme';

const SUPPORT_EMAIL = 'support@hostelnavigator.online';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOPICS = [
  { id: 'general', label: 'General question' },
  { id: 'student', label: 'Student support' },
  { id: 'owner', label: 'Hostel owner support' },
  { id: 'listing-issue', label: 'Report a listing' },
  { id: 'technical', label: 'Technical problem' },
];
const EMPTY = { name: '', email: '', topic: 'general', message: '', website: '' };

const InfoRow = ({ icon, title, children }) => (
  <Stack direction="row" spacing={2} alignItems="flex-start">
    <Box sx={{ width: 40, height: 40, borderRadius: 2.5, display: 'grid', placeItems: 'center', backgroundColor: tokens.primaryLight, color: 'primary.main', flexShrink: 0 }}>
      {icon}
    </Box>
    <Box minWidth={0}>
      <Typography variant="subtitle2" color="text.primary">{title}</Typography>
      <Typography variant="body2" component="div" sx={{ wordBreak: 'break-word' }}>{children}</Typography>
    </Box>
  </Stack>
);

const ContactUs = () => {
  const [contact, setContact] = useState({ enabled: true, email: SUPPORT_EMAIL });
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState({ sending: false, error: '', success: '' });

  // If the server can't send email, the form is replaced by a mailto link.
  useEffect(() => {
    getContactStatus().then(setContact).catch(() => {});
  }, []);

  const errors = {
    name: values.name.trim().length < 2 ? 'Please enter your name' : '',
    email: !EMAIL_REGEX.test(values.email.trim()) ? 'Please enter a valid email' : '',
    message: values.message.trim().length < 10 ? 'Please write at least 10 characters' : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const set = (key) => (event) => setValues((prev) => ({ ...prev, [key]: event.target.value }));
  const mailto = `mailto:${contact.email}`;

  const submit = async (event) => {
    event.preventDefault();
    setTouched(true);
    if (hasErrors) return;
    setStatus({ sending: true, error: '', success: '' });
    try {
      const message = await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        topic: values.topic,
        message: values.message.trim(),
        website: values.website,
      });
      setStatus({ sending: false, error: '', success: message });
      setValues(EMPTY);
      setTouched(false);
    } catch (error) {
      setStatus({ sending: false, error: getErrorMessage(error, `We couldn't send your message. Please email us at ${contact.email}.`), success: '' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
      <Box maxWidth={640} mb={{ xs: 4, md: 5 }}>
        <Typography variant="overline" color="primary">Contact</Typography>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' }, mt: 0.5 }}>
          We're here to help
        </Typography>
        <Typography variant="body1" mt={1.5}>
          Questions about a listing, your booking, or listing your hostel? Send us a message and we'll reply by email.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              {status.success ? (
                <Stack spacing={2} alignItems="flex-start">
                  <Alert severity="success" sx={{ width: '100%' }}>{status.success}</Alert>
                  <Button onClick={() => setStatus({ sending: false, error: '', success: '' })}>Send another message</Button>
                </Stack>
              ) : contact.enabled ? (
                <Box component="form" onSubmit={submit} noValidate>
                  <Typography variant="h6" component="h2" mb={2.5}>Send us a message</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Your name" required value={values.name} onChange={set('name')}
                        error={touched && !!errors.name} helperText={touched && errors.name} inputProps={{ maxLength: 100 }} autoComplete="name" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Email" type="email" required value={values.email} onChange={set('email')}
                        error={touched && !!errors.email} helperText={touched && errors.email} autoComplete="email" />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="contact-topic">Topic</InputLabel>
                        <Select labelId="contact-topic" label="Topic" value={values.topic} onChange={set('topic')}>
                          {TOPICS.map((topic) => <MenuItem key={topic.id} value={topic.id}>{topic.label}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Message" required multiline minRows={5} value={values.message} onChange={set('message')}
                        error={touched && !!errors.message} helperText={(touched && errors.message) || `${values.message.length}/3000`}
                        inputProps={{ maxLength: 3000 }} />
                    </Grid>
                    {/* Honeypot: hidden from people and screen readers; bots tend to fill it. */}
                    <Box component="input" type="text" name="website" value={values.website} onChange={set('website')}
                      tabIndex={-1} autoComplete="off" aria-hidden="true"
                      sx={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }} />
                  </Grid>
                  {status.error && <Alert severity="error" sx={{ mt: 2 }}>{status.error}</Alert>}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" mt={3}>
                    <Typography variant="caption">We only use your email to reply to this message.</Typography>
                    <Button type="submit" variant="contained" size="large" disabled={status.sending}
                      startIcon={status.sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}>
                      {status.sending ? 'Sending...' : 'Send message'}
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Stack spacing={2} alignItems="flex-start">
                  <Typography variant="h6" component="h2">Email us</Typography>
                  <Typography variant="body2">Our contact form is temporarily unavailable. Please write to us directly.</Typography>
                  <Button variant="contained" startIcon={<MailOutlineIcon />} href={mailto}>{contact.email}</Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <InfoRow icon={<MailOutlineIcon fontSize="small" />} title="Email">
              <a href={mailto}>{contact.email}</a>
            </InfoRow>
            <InfoRow icon={<PhoneOutlinedIcon fontSize="small" />} title="Phone">
              <a href="tel:+91999999999">Call us</a>
            </InfoRow>
            <InfoRow icon={<PlaceOutlinedIcon fontSize="small" />} title="Office address">
              1234 Main Street, Gadarwara, India<br />Postal Code: 487551
            </InfoRow>
            <InfoRow icon={<ScheduleOutlinedIcon fontSize="small" />} title="Office hours">
              Monday to Friday: 9:00 AM - 5:00 PM<br />Saturday and Sunday: Closed
            </InfoRow>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactUs;
