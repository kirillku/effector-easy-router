import * as React from "react";
import type { CurrentRoute, Route } from "./createRoute";
import type { NavigateOptions } from "./types";

export interface RedirectProps<PathParamKeys extends string = never>
  extends NavigateOptions<PathParamKeys> {
  to: Route<PathParamKeys> | CurrentRoute;
}

export const Redirect = <PathParamKeys extends string = never>({
  to: Route,
  method = "replace",
  ...options
}: RedirectProps<PathParamKeys>): null => {
  React.useEffect(() => {
    // @ts-ignore https://github.com/kirillku/effector-easy-router/issues/1
    Route.navigate({ method, ...options });
  }, []);

  return null;
};
