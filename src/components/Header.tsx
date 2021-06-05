import type { ReactNode } from "react";
import React, { Component } from "react";
import logo from "../asset/image/logo.png";


export default class Header extends Component {
    public render(): ReactNode {
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
    }
}
