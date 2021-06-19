import { useStore } from "effector-react";
import * as React from "react";
import type { Route } from "./createRoute";
import { $location } from "./location";
import { getHref, getNavigateFxOptions } from "./matchUtils";
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

export interface LinkProps<
  PathParamKeys extends Record<string, string> = Record<never, string>
>
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    NavigateOptions<PathParamKeys> {
  to: Route<PathParamKeys>;
}

const LinkInner = <
  PathParamKeys extends Record<string, string> = Record<never, string>
>(
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
      Route.navigate(navigateOptions);
    }
  };

  return <a ref={ref} href={href} onClick={handleClick} {...props} />;
};

export const Link = React.forwardRef(LinkInner) as <
  PathParamKeys extends Record<string, string> = Record<never, string>
>(
  props: LinkProps<PathParamKeys> & { ref?: React.Ref<HTMLAnchorElement> }
) => React.ReactElement;
