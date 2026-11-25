import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import Loader from "./components/Loader";
import { store } from "./store";

const AppRoot = lazy(async () => {
  const [{ default: AppWrapper }, { default: App }] = await Promise.all([
    import("./components/AppWrapper"),
    import("./components/App"),
  ]);
  return {
    default: () => (
      <AppWrapper>
        <App />
      </AppWrapper>
    ),
  };
});

const root = document.createElement("div");
document.body.appendChild(root);
createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <AppRoot />
        </Suspense>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
