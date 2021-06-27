import { useStore } from "effector-react";
import * as React from "react";
import type { Route, CurrentRoute } from "./createRoute";
import { $location, getHref } from "./history";
import type { NavigateOptions } from "./types";

const isModifiedEvent = (event: React.MouseEvent): boolean =>
  Boolean(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

const shouldNavigate = (event: React.MouseEvent, target?: string): boolean =>
  // onClick prevented default.
  !event.defaultPrevented &&
  // Ignore everything but left clicks.
  event.button === 0 &&
  // Let browser handle "target=_blank" etc.
  (!target || target === "_self") &&
  // Ignore clicks with modifier keys.
  !isModifiedEvent(event);

export interface LinkProps<PathParamKeys extends string = never>
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    NavigateOptions<PathParamKeys> {
  to: Route<PathParamKeys> | CurrentRoute;
}

const LinkInner = <PathParamKeys extends string = never>(
  {
    to: Route,
    params,
    search,
    hash,
    method,
    onClick,
    ...props
  }: LinkProps<PathParamKeys>,
  ref: React.Ref<HTMLAnchorElement>
): React.ReactElement => {
  const location = useStore($location);
  const navigateOptions = { params, search, hash, method };
  const href = getHref(location, Route.path, navigateOptions);

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    try {
      if (onClick) onClick(event);
    } catch (error) {
      event.preventDefault();
      throw error;
    }

    if (shouldNavigate(event, props.target)) {
      event.preventDefault();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore https://github.com/kirillku/effector-easy-router/issues/1
      Route.navigate(navigateOptions);
    }
  };

  return <a ref={ref} href={href} onClick={handleClick} {...props} />;
};

export const Link = React.forwardRef(LinkInner) as <
  PathParamKeys extends string = never
>(
  props: LinkProps<PathParamKeys> & { ref?: React.Ref<HTMLAnchorElement> }
) => React.ReactElement;
