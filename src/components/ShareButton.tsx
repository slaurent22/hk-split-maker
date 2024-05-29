import React from "react";
import { TiArrowForwardOutline } from "react-icons/ti";
import HKSMButton from "./HKSMButton";

interface Props {
  id: string;
  onClick: () => void;
  text: string;
  disabled?: boolean;
}

const ShareButton: React.FC<Props> = ({ text, id, onClick, disabled }: Props) => {
  return (
    <HKSMButton onClick={onClick} id={id} disabled={disabled ?? false}>
      <span className="button-text">{text}</span>
      <TiArrowForwardOutline size="1.5em" />
    </HKSMButton>
  );
};

export default ShareButton;
