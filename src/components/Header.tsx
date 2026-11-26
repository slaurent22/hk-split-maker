import type { ReactNode } from "react";
import logo from "../asset/image/logo.png";

function Header(): ReactNode {
  return (
    <div id="app">
      <header>
        <h1>
          <img id="logo" src={logo} alt="HK Split Maker logo" />
        </h1>
      </header>
    </div>
  );
}

export default Header;
