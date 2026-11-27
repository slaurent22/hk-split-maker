import type { ReactElement, ReactNode } from "react";
import { cloneElement, useId } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

interface TooltipProps {
  children: ReactElement;
  content: string;
}
export default function Tooltip({
  children,
  content,
}: TooltipProps): ReactNode {
  const id = useId();
  const childWithProps = cloneElement(children, {
    "data-tooltip-content": content,
    "data-tooltip-id": id,
  });

  return (
    <>
      {childWithProps}
      <ReactTooltip id={id} />
    </>
  );
}
