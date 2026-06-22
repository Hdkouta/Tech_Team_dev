import React from "react";
import { Button } from "@mui/material";

const OpenWebViewModalButton = ({ onClick }) => {
  return (
    <Button variant="contained" onClick={onClick}>
      Web閲覧入力モーダル
    </Button>
  );
};

export default OpenWebViewModalButton;
