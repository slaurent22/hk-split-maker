import classNames from "classnames";
import type { ReactNode } from "react";
import "./HKSMButton.css";

interface Props {
  className?: string;
  children: React.ReactNode;
  id: string;
  onClick: () => void;
  disabled?: boolean;
}

function HKSMButton({
  id,
  onClick,
  disabled,
  className,
  children,
}: Props): ReactNode {
  return (
    <button
      className={classNames("hksm-button", className)}
      disabled={disabled ?? false}
      id={id}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export default HKSMButton;
