import React from "react";
import { Button } from "@mui/material";

// 再読込ボタンを表示
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
