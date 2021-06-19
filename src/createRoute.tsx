import * as React from "react";
import { combine, createEvent, createStore, guard, sample } from "effector";
import type { Store, Event } from "effector";
import { useStore } from "effector-react";
import { $location, navigateFx } from "./history";
import { getNavigateFxOptions, matchPath } from "./matchUtils";
import type { Match, NavigateOptions } from "./types";

export type RouteProps<
  PathParamKeys extends Record<string, string> = Record<never, string>
> = {
  exact?: boolean;
  children?:
    | React.ReactNode
    | ((match: Match<PathParamKeys>) => React.ReactNode);
};

export type Route<
  PathParamKeys extends Record<string, string> = Record<never, string>
> = {
  (props: RouteProps<PathParamKeys>): React.ReactElement | null;
  path: string;
  match: Store<Match<PathParamKeys> | null>;
  open: Event<Match<PathParamKeys> | null>;
  close: Event<Match<PathParamKeys> | null>;
  status: Store<boolean>;
  navigate: Event<void | NavigateOptions<PathParamKeys>>;
};

export const createRoute = <
  PathParamKeys extends Record<string, string> = Record<never, string>
>(
  path: string
) => {
  const $match = $location.map((location) =>
    matchPath<PathParamKeys>(location, path)
  );

  const $hasMatch = $match.map((match) => Boolean(match));

  const open = guard({
    clock: $hasMatch.updates,
    source: $match,
    filter: (_match, hasMatch) => hasMatch,
  });

  const close = guard({
    clock: $hasMatch.updates,
    source: $match,
    filter: (_match, hasMatch) => !hasMatch,
  });

  const $status = createStore<boolean>(false)
    .on(open, () => true)
    .reset(close);

  const navigate = createEvent<void | NavigateOptions<PathParamKeys>>();

  sample({
    clock: navigate,
    source: $location,
    fn: (location, options) =>
      getNavigateFxOptions(
        location,
        path,
        options as NavigateOptions<PathParamKeys>
      ),
    target: navigateFx,
  });

  const Route = ({
    exact,
    children,
  }: RouteProps<PathParamKeys>): React.ReactElement | null => {
    const match = useStore($match);

    if (!match || (exact && !match.isExact)) {
      return null;
    }

    return typeof children === "function" ? children(match) : children;
  };

  Route.path = path;
  Route.match = $match;
  Route.open = open;
  Route.close = close;
  Route.status = $status;
  Route.navigate = navigate;

  return Route;
};
