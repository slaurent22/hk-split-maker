import type { ReactElement } from "react";
import "./Loader.css";

export default function Loader(): ReactElement {
  return (
    <div className="loader-wrap">
      <span className="spinner"></span>
    </div>
  );
}
