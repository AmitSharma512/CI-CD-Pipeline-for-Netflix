import Box, { BoxProps } from "@mui/material/Box";
import { Link as RouterLink } from "react-router-dom";
import { MAIN_PATH } from "src/constant";

export default function Logo({ sx }: BoxProps) {
  return (
    <RouterLink to={`/${MAIN_PATH.browse}`}>
      <Box
        component="img"
        alt="FilmFlix Logo"
        src="/assets/FilmFlix-logo.png"
        width={250}
        height={150}
        sx={{
          ...sx,
        }}
      />
    </RouterLink>
  );
}
