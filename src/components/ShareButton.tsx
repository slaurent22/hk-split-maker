import type { ReactNode } from "react";
import { TiArrowForwardOutline } from "react-icons/ti";
import HKSMButton from "./HKSMButton";
import "./HKSMButton.css";

interface Props {
  id: string;
  onClick: () => void;
  disabled?: boolean;
}

function ShareButton({ id, onClick, disabled }: Props): ReactNode {
  return (
    <HKSMButton onClick={onClick} id={id} disabled={disabled ?? false}>
      <span className="button-text">Share</span>
      <TiArrowForwardOutline size="1.5em" />
    </HKSMButton>
  );
}

export default ShareButton;
