import { DarkMode } from "@chakra-ui/color-mode";
import { Box, ChakraProvider } from "@chakra-ui/react";
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

export const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    metamask: {
      100: "#F6851B",
    },
    metamask_gray: {
      100: "#393E46",
    },
  },
  components: {
    Modal: {
      baseStyle: {
        dialog: {
          bg: "metamask_gray.100",
          color: "white",
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "#121212",
      },
    },
  },
});

export default function Layout() {
  return (
    <ChakraProvider theme={theme}>
      <DarkMode>
        <Outlet />
      </DarkMode>
    </ChakraProvider>
  );
}
