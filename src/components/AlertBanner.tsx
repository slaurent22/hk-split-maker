import type { ReactElement } from "react";
import { useState } from "react";

export default function AlertBanner(): ReactElement {
  const [alertBannerVisible, setAlertBannerVisible] = useState(true);
  function onClickCloseAlertBanner(): void {
    setAlertBannerVisible(false);
  }
  return (
    <div
      className="alert-banner"
      style={alertBannerVisible ? {} : { display: "none" }}
    >
      <button
        className="close-ab"
        onClick={onClickCloseAlertBanner}
        type="button"
      >
        &times;
      </button>
      Interested in contributing or suggesting ideas and splits? Check out
      the&nbsp;
      <a
        href="https://github.com/slaurent22/hk-split-maker"
        rel="noopener noreferrer"
        target="_blank"
      >
        GitHub Project Site!
      </a>{" "}
      Need help? Join the&nbsp;
      <a
        href="https://discord.gg/3JtHPsBjHD"
        rel="noopener noreferrer"
        target="_blank"
      >
        Hollow Knight Speedrun Community Discord server
      </a>{" "}
      and check out #tech-support
    </div>
  );
}
