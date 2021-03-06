import * as React from "react";
import { createEvent, createStore, sample, split } from "effector";
import type { Store, Event } from "effector";
import { useStore } from "effector-react";
import { $location, $pathname, navigateFx } from "./history";
import { getNavigateFxOptions, matchPath } from "./matchUtils";
import type { Match, NavigateOptions } from "./types";

type RouteChildrenFunction<PathParamKeys extends string = never> = (
  match: Match<PathParamKeys>
) => React.ReactNode;

export type RouteProps<PathParamKeys extends string = never> = {
  exact?: boolean;
  children?: React.ReactNode | RouteChildrenFunction<PathParamKeys>;
};

export type Route<PathParamKeys extends string = never> = {
  (props: RouteProps<PathParamKeys>): React.ReactElement | null;
  path: string;
  match: Store<Match<PathParamKeys> | null>;
  open: Event<Match<PathParamKeys>>;
  close: Event<null>;
  status: Store<boolean>;
  navigate: Event<void | NavigateOptions<PathParamKeys>>;
};

export const createRoute = <PathParamKeys extends string = never>(
  path: string
): Route<PathParamKeys> => {
  const updateMatch = createEvent<Match<PathParamKeys> | null>();
  const $match = createStore<Match<PathParamKeys> | null>(null).on(
    updateMatch,
    (_state, match) => match
  );

  const $status = $match.map((match) => Boolean(match));

  const open = createEvent<Match<PathParamKeys>>();
  const close = createEvent<null>();

  split<Match<PathParamKeys> | null, "open" | "close">({
    source: sample({ clock: $status, source: $match }),
    match: (match) => (match ? "open" : "close"),
    cases: { open, close },
  });

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

    return <>{typeof children === "function" ? children(match) : children}</>;
  };

  Route.path = path;
  Route.match = $match;
  Route.open = open;
  Route.close = close;
  Route.status = $status;
  Route.navigate = navigate;

  // Subscribe to pathname updates inside setTimeout to properly handle initial page load.
  setTimeout(() => {
    $pathname.watch((pathname) => {
      const match = matchPath<PathParamKeys>(pathname, path);
      updateMatch(match);
    });
  });

  return Route;
};

export type CurrentRoute = {
  path: null;
  navigate: Event<NavigateOptions<never>>;
};

const navigateToCurrentRoute = createEvent<NavigateOptions<never>>();

sample({
  clock: navigateToCurrentRoute,
  source: $location,
  fn: (location, options) => getNavigateFxOptions(location, null, options),
  target: navigateFx,
});

export const CurrentRoute: CurrentRoute = {
  path: null,
  navigate: navigateToCurrentRoute,
};
