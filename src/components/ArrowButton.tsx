import React from "react";
import arrow from "../asset/image/arrow.png";
import HKSMButton from "./HKSMButton";
import "./ArrowButton.css";

interface Props {
  id: string;
  onClick: () => void;
  text: string;
  disabled?: boolean;
}

const ArrowButton: React.FC<Props> = ({
  id,
  onClick,
  text,
  disabled,
}: Props) => {
  return (
    <HKSMButton
      className="arrow-button"
      onClick={onClick}
      id={id}
      disabled={disabled ?? false}
    >
      <img
        src={arrow}
        alt="decorative arrow"
        className="arrow arrow-left"
      ></img>
      <span className="button-text">{text}</span>
      <img
        src={arrow}
        alt="decorative arrow"
        className="arrow arrow-right"
      ></img>
    </HKSMButton>
  );
};

export default ArrowButton;
