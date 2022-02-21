import React, { useState, ReactElement } from "react";

export default function AlertBanner(): ReactElement {
  const [alertBannerVisible, setAlertBannerVisible] = useState(true);
  function onClickCloseAlertBanner() {
    setAlertBannerVisible(false);
  }
  return (
    <div className="alert-banner" style={alertBannerVisible ? {} : { display: "none", }}>
      <span className="close-ab" onClick={onClickCloseAlertBanner}>&times;</span>
                    Interested in contributing or suggesting ideas and splits? Check out the&nbsp;
      <a href="https://github.com/slaurent22/hk-split-maker" target="_blank" rel="noopener noreferrer">
        GitHub Project Site!</a> Need help? Join the&nbsp;
      <a href="https://discord.gg/3JtHPsBjHD" target="_blank" rel="noopener noreferrer">
        Hollow Knight Speedrun Community Discord server
      </a> and check out #tech-support
    </div>
  );
}
