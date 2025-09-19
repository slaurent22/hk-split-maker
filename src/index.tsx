import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./components/App";
import "./index.css";
import AppWrapper from "./components/AppWrapper";
import { store } from "./store";

const root = document.createElement("div");
document.body.appendChild(root);
createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppWrapper>
          <App />
        </AppWrapper>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
