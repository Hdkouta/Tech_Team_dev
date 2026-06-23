import React from "react";
import { Button } from "@mui/material";

const OpenMetricModalButton = ({ onClick }) => {
  return (
    <Button variant="contained" onClick={onClick}>
      KPI/KGI入力モーダル
    </Button>
  );
};

export default OpenMetricModalButton;
