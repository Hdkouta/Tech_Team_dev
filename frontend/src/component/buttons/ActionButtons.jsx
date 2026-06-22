import React from "react";
import { Button } from "@mui/material";

const ActionButtons = ({ onReload }) => {
  return (
    <>
      <Button variant="outlined" onClick={onReload}>
        再読込
      </Button>
    </>
  );
};

export default ActionButtons;
