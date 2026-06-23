import React from "react";
import { Button } from "@mui/material";

const OpenRecruitmentModalButton = ({ onClick }) => {
  return (
    <Button variant="contained" onClick={onClick}>
      採用工程入力モーダル
    </Button>
  );
};

export default OpenRecruitmentModalButton;
