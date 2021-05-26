import React from "react";
import arrow from "../asset/image/arrow.png";
import "./ArrowButton.css";

interface Props {
    onClick: () => void;
    text: string;
}

const ArrowButton: React.FC<Props> = ({
    onClick,
    text,
}) => {
    return (
        <button
            className="arrow-button"
            onClick={onClick}
        >
            <img
                src={arrow}
                alt="decorative arrow"
                className="arrow arrow-left"
            ></img>
            <span className="buttonText">
                {text}
            </span>
            <img
                src={arrow}
                alt="decorative arrow"
                className="arrow arrow-right"
            ></img>
        </button>
    );
};

export default ArrowButton;
