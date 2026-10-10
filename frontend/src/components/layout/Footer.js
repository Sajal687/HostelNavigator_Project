import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Grid, Link, Stack, Typography } from "@mui/material";
import { Brand } from "../pages/NavigationBar";
import { tokens } from "../../theme";

const columns = [
  {
    title: "Students",
    links: [
      { label: "Find hostels", to: "/hostellist" },
      { label: "FAQs", to: "/faqs" },
    ],
  },
  {
    title: "Owners",
    links: [
      { label: "List your hostel", to: "/login", state: [{}, { userType: "hostelOwner" }] },
      { label: "Owner login", to: "/login", state: [{}, { userType: "hostelOwner" }] },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

const Footer = () => {
  const navigate = useNavigate();
  const go = (event, link) => {
    event.preventDefault();
    navigate(link.to, link.state ? { state: link.state } : undefined);
  };

  return (
    <Box component="footer" sx={{ mt: "auto", backgroundColor: tokens.white, borderTop: `1px solid ${tokens.border}` }}>
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 6 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Brand onClick={(e) => go(e, { to: "/" })} />
            <Typography variant="body2" mt={1.5} maxWidth={340}>
              Verified hostels and PGs near campus, with honest reviews and AI-powered search for students in India.
            </Typography>
          </Grid>
          {columns.map((column) => (
            <Grid item xs={6} sm={4} md={2} key={column.title}>
              <Typography variant="overline" color="text.primary">{column.title}</Typography>
              <Stack spacing={1} mt={1}>
                {column.links.map((link) => (
                  <Link key={link.label} href={link.to} onClick={(e) => go(e, link)} color={tokens.body} variant="body2"
                    sx={{ width: "fit-content", "&:hover": { color: "primary.main" } }}>
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Box mt={5} pt={3} borderTop={`1px solid ${tokens.border}`}>
          <Typography variant="caption" component="p" sx={{ maxWidth: 820 }}>
            HostelNavigator lists properties provided by their owners. Listing details, house rules and AI-generated
            summaries are for guidance only. Always visit the property and confirm rent, deposit and agreement terms
            directly with the owner before paying anything.
          </Typography>
          <Typography variant="caption" component="p" mt={1}>
            © {new Date().getFullYear()} HostelNavigator. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
