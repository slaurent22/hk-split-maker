import React, { ReactNode, ReactElement, cloneElement, useId } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

interface TooltipProps {
  content: string;
  children: ReactElement;
}
export default function Tooltip({
  children,
  content,
}: TooltipProps): ReactNode {
  const id = useId();
  const childWithProps = cloneElement(children, {
    "data-tooltip-id": id,
    "data-tooltip-content": content,
  });

  return (
    <>
      {childWithProps}
      <ReactTooltip id={id} />
    </>
  );
}
