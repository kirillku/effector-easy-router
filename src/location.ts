import history from "history/browser";
import type { Location } from "history";
import { createEffect, createEvent, restore } from "effector";
import type { NavigateFxOptions } from "./types";

const changeLocation = createEvent<Location>();

export const $location = restore(changeLocation, history.location);

history.listen(({ location }) => changeLocation(location));

export const navigateFx = createEffect(
  ({ method, ...options }: NavigateFxOptions) => {
    method === "replace" ? history.replace(options) : history.push(options);
  }
);
