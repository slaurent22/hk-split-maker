import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { store } from "./store";

const App = lazy(() => import("./components/App"));
const AppWrapper = lazy(() => import("./components/AppWrapper"));

const root = document.createElement("div");
document.body.appendChild(root);
createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <AppWrapper>
            <Suspense fallback={<div>Loading...</div>}>
              <App />
            </Suspense>
          </AppWrapper>
        </Suspense>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
