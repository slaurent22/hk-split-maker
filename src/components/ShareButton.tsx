import React from "react";
import { TiArrowForwardOutline } from "react-icons/ti";
import HKSMButton from "./HKSMButton";

interface Props {
  id: string;
  onClick: () => void;
  disabled?: boolean;
}

const ShareButton: React.FC<Props> = ({ id, onClick, disabled }: Props) => {
  return (
    <HKSMButton onClick={onClick} id={id} disabled={disabled ?? false}>
      <span className="button-text">Share</span>
      <TiArrowForwardOutline size="1.5em" />
    </HKSMButton>
  );
};

export default ShareButton;
