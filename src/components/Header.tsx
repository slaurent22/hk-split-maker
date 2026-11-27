import type { ReactNode } from "react";
import logo from "../asset/image/logo.png";

function Header(): ReactNode {
  return (
    <div id="app">
      <header>
        <h1>
          <img alt="HK Split Maker logo" id="logo" src={logo} />
        </h1>
      </header>
    </div>
  );
}

export default Header;
