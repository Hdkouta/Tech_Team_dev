import React from "react";
import {
  Box,
  Grid,
  Select,
  MenuItem,
  FormControl,
  Typography,
  Button,
  Paper,
} from "@mui/material";

const StatusCard = ({ type, title, status }) => {
  const isError = type === "error";

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: 150,
        borderRadius: 2,
        border: isError ? "2px solid #ff8a8a" : "1px solid #dfe6ee",
        backgroundColor: isError ? "#fff1f1" : "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: isError ? "#ef4444" : "#16a34a",
          }}
        />

        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 700,
            color: "#1f2937",
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box>
        <Box
          component="span"
          sx={{
            display: "inline-block",
            px: 4,
            py: 1.5,
            borderRadius: 1,
            fontSize: 18,
            fontWeight: 700,
            color: isError ? "#dc2626" : "#16a34a",
            backgroundColor: isError ? "#ffffff" : "#dcfce7",
            border: isError ? "2px solid #ef4444" : "none",
          }}
        >
          {status}
        </Box>
      </Box>
    </Paper>
  );
};

const App = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#eef2f7",
        p: 0.5,
      }}
    >
      <Box
        sx={{
          maxWidth: 1185,
          mx: "auto",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          border: "1px solid #d9e0e8",
        }}
      >
        {/* ===== ヘッダー ===== */}
        <Box
          sx={{
            backgroundColor: "#2563eb",
            color: "#ffffff",
            px: 5.5,
            py: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            {/* アイコン */}
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.7 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 18,
                    backgroundColor: "#2563eb",
                    borderRadius: 0.5,
                  }}
                />
                <Box
                  sx={{
                    width: 7,
                    height: 28,
                    backgroundColor: "#2563eb",
                    borderRadius: 0.5,
                  }}
                />
                <Box
                  sx={{
                    width: 7,
                    height: 36,
                    backgroundColor: "#2563eb",
                    borderRadius: 0.5,
                  }}
                />
              </Box>
            </Box>

            <Typography
              component="h1"
              sx={{
                fontSize: 38,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              採用KPI分析ダッシュボード
            </Typography>
          </Box>

          <Box
            sx={{
              backgroundColor: "#4f82f3",
              px: 2.5,
              py: 1.4,
              borderRadius: 2,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            対象期間：2026年6月
          </Box>
        </Box>

        {/* ===== メイン ===== */}
        <Box
          sx={{
            px: 6.5,
            py: 4.5,
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            sx={{
              mb: 4,
              fontSize: 24,
              color: "#64748b",
              lineHeight: 1.8,
            }}
          >
            採用活動の実績値をKPI/KGIと比較し、未達項目・改善ポイントを見える化します。
          </Typography>

          {/* ===== 対象期間 ===== */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                mb: 1.5,
                fontSize: 22,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              対象期間
            </Typography>

            <FormControl sx={{ width: 380 }}>
              <Select
                defaultValue="2026年6月"
                sx={{
                  height: 66,
                  backgroundColor: "#ffffff",
                  borderRadius: 2,
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#1f2937",
                  boxShadow: "0 2px 8px rgba(15,23,42,0.12)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#dce3ec",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cbd5e1",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2563eb",
                  },
                }}
              >
                <MenuItem value="2026年6月">2026年6月</MenuItem>
                <MenuItem value="2026年5月">2026年5月</MenuItem>
                <MenuItem value="2026年4月">2026年4月</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* ===== データ状況 ===== */}
          <Box>
            <Typography
              sx={{
                mb: 1.5,
                fontSize: 22,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              データ状況
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <StatusCard
                  type="success"
                  title="5月までの実績データ"
                  status="登録済み"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <StatusCard
                  type="error"
                  title="6月の実績データ"
                  status="未登録"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <StatusCard
                  type="success"
                  title="KPI/KGI目標値"
                  status="設定済み"
                />
              </Grid>
            </Grid>
          </Box>

          {/* ===== ボタン ===== */}
          <Box
            sx={{
              mt: 2.2,
              display: "flex",
              justifyContent: "flex-end",
              gap: 4,
            }}
          >
            <Button
              variant="outlined"
              sx={{
                width: 262,
                height: 66,
                borderRadius: 2,
                borderWidth: 2,
                fontSize: 24,
                fontWeight: 800,
                color: "#2563eb",
                borderColor: "#2563eb",
                backgroundColor: "#ffffff",
                "&:hover": {
                  borderWidth: 2,
                  borderColor: "#1d4ed8",
                  backgroundColor: "#eff6ff",
                },
              }}
            >
              分析結果を見る
            </Button>

            <Button
              variant="contained"
              sx={{
                width: 272,
                height: 66,
                borderRadius: 2,
                fontSize: 24,
                fontWeight: 800,
                backgroundColor: "#2563eb",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#1d4ed8",
                  boxShadow: "none",
                },
              }}
            >
              データを取り込む
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default App;
