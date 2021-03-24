import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import dotenv from "dotenv";

dotenv.config();

import App from "./components/layout/app-layout";
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
              <Router>
                <App />
              </Router>
            </ThemeProvider>
          </TransactionStateProvider>
        </GraphProvider>
      </MooncatsProvider>
    </Symfoni>
  </React.StrictMode>,
  document.getElementById("root")
);
