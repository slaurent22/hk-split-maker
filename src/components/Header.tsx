import React from "react";
import logo from "../asset/image/logo.png";

const Header: React.FC = () => {
    return (
        <div id="app">
            <header>
                <h1>
                    <img
                        id="logo"
                        src={logo}
                        alt="HK Split Maker logo"
                    ></img>
                </h1>
            </header>
        </div>
    );
};

export default Header;
