import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import "./index.css";

const hash = window.location.hash.substring(1);
const initialCategoryName = hash.toLowerCase();

function onUpdateCategoryName(categoryName: string) {
  window.location.hash = categoryName;
}

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(
  <React.StrictMode>
    <App
      requestedCategoryName={initialCategoryName}
      onUpdateCategoryName={onUpdateCategoryName}
    />
  </React.StrictMode>,
  root
);
