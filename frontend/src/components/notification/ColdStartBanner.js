import React, { useEffect, useState } from "react";
import { Alert, CircularProgress, Slide } from "@mui/material";
import { subscribeColdStart } from "../../services/apiClient";

const ColdStartBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => subscribeColdStart(setShow), []);

  return (
    <Slide direction="down" in={show} mountOnEnter unmountOnExit>
      <Alert
        severity="info"
        role="status"
        icon={<CircularProgress size={18} />}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.snackbar,
          borderRadius: 0,
          justifyContent: "center",
        }}
      >
        Starting backend services, please hold on... This can take up to a minute on first load.
      </Alert>
    </Slide>
  );
};

export default ColdStartBanner;
