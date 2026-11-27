import type { ReactNode } from "react";
import { TiArrowForwardOutline } from "react-icons/ti";
import HKSMButton from "./HKSMButton";
import "./HKSMButton.css";

interface Props {
  disabled?: boolean;
  id: string;
  onClick: () => void;
}

function ShareButton({ id, onClick, disabled }: Props): ReactNode {
  return (
    <HKSMButton disabled={disabled ?? false} id={id} onClick={onClick}>
      <span className="button-text">Share</span>
      <TiArrowForwardOutline size="1.5em" />
    </HKSMButton>
  );
}

export default ShareButton;
