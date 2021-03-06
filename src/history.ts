import history from "history/browser";
import type { Location } from "history";
import { createEffect, createEvent, restore } from "effector";
import type { NavigateFxOptions, NavigateOptions } from "./types";
import { getNavigateFxOptions } from "./matchUtils";

const changeLocation = createEvent<Location>();

export const $location = restore(changeLocation, history.location);

export const $pathname = $location.map((location) => location.pathname);

export const $search = $location.map((location) => location.search);

export const $hash = $location.map((location) => location.hash);

history.listen(({ location }) => changeLocation(location));

export const navigateFx = createEffect(
  ({ method, ...options }: NavigateFxOptions) => {
    method === "replace" ? history.replace(options) : history.push(options);
  }
);

export const getHref = <PathParamKeys extends string = never>(
  location: Location,
  path: string | null,
  options: NavigateOptions<PathParamKeys> = {}
): string => {
  const navigateFxOptions = getNavigateFxOptions(location, path, options);

  return history.createHref(navigateFxOptions);
};
