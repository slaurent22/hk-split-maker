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
      disabled={disabled ?? false}
      id={id}
      onClick={onClick}
    >
      <img alt="decorative arrow" className="arrow" src={arrow} />
      <span className="button-text">{text}</span>
      <img alt="decorative arrow" className="arrow arrow-right" src={arrow} />
    </HKSMButton>
  );
}

export default ArrowButton;
