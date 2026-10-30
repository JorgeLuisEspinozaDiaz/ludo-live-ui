import React, { type ReactElement, type ReactNode } from "react";

export const addClass = (elemento: ReactNode, clase: string): ReactNode => {
  if (
    React.isValidElement<{
      className?: string;
      children?: ReactNode;
    }>(elemento)
  ) {
    const { children, ...props } = elemento.props;

    const childrenWithClass = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return addClass(child, clase);
      }

      return child;
    });

    return React.cloneElement(
      elemento as ReactElement<any>,
      {
        ...props,
        className: `${elemento.props.className ?? ""} ${clase}`.trim(),
      },
      childrenWithClass,
    );
  }

  return elemento;
};
