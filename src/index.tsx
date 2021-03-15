import React from "react";
import ReactDOM from "react-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import dotenv from "dotenv";

dotenv.config();

import App from "./App";
import { GraphProvider } from "./contexts/graph/index";
import { MooncatsProvider } from "./contexts/mooncats/index";
import { TransactionStateProvider } from "./contexts/TransactionState";
import { Symfoni } from "./hardhat/SymfoniContext";

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      "Righteous",
      "consolas",
      "Menlo",
      "monospace",
      "sans-serif",
    ].join(","),
  },
});

ReactDOM.render(
  <React.StrictMode>
    <Symfoni>
      <MooncatsProvider>
        <GraphProvider>
          <TransactionStateProvider>
            <ThemeProvider theme={theme}>
              <App />
            </ThemeProvider>
          </TransactionStateProvider>
        </GraphProvider>
      </MooncatsProvider>
    </Symfoni>
  </React.StrictMode>,
  document.getElementById("root")
);
