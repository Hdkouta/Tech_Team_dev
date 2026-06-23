import React from "react";
import { Button } from "@mui/material";

// 入力ボタンを表示
const InputMenuButton = ({ onClick }) => {

  return (
    <>
      <Button variant="contained" onClick={onClick}>
        入力
      </Button>
    </>
  );
};

export default InputMenuButton;
