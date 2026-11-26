import type { ReactNode } from "react";
import arrow from "../asset/image/arrow.png";
import HKSMButton from "./HKSMButton";
import "./ArrowButton.css";
import "./HKSMButton.css";

interface Props {
  id: string;
  onClick: () => void;
  text: string;
  disabled?: boolean;
}

function ArrowButton({ id, onClick, text, disabled }: Props): ReactNode {
  return (
    <HKSMButton
      className="arrow-button"
      onClick={onClick}
      id={id}
      disabled={disabled ?? false}
    >
      <img src={arrow} alt="decorative arrow" className="arrow"></img>
      <span className="button-text">{text}</span>
      <img
        src={arrow}
        alt="decorative arrow"
        className="arrow arrow-right"
      ></img>
    </HKSMButton>
  );
}

export default ArrowButton;
