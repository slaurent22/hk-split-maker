import React from "react";
import classNames from "classnames";
import "./HKSMButton.css";

interface Props {
  className?: string;
  children: React.ReactNode;
  id: string;
  onClick: () => void;
  disabled?: boolean;
}

const HKSMButton: React.FC<Props> = ({
  id,
  onClick,
  disabled,
  className,
  children,
}: Props) => {
  return (
    <button
      className={classNames("hksm-button", className)}
      onClick={onClick}
      id={id}
      disabled={disabled ?? false}
    >
      {children}
    </button>
  );
};

export default HKSMButton;
