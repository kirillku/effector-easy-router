import type { Location } from "history";
import { compile, match } from "path-to-regexp";
import type {
  Match,
  NavigateFxOptions,
  NavigateOptions,
  PathParams,
} from "./types";

export const matchPath = <
  PathParamKeys extends Record<string, string> = Record<never, string>
>(
  location: Location,
  path: string
): Match<PathParamKeys> | null => {
  const m = match<PathParams<PathParamKeys>>(path, { end: false })(
    location.pathname
  );

  if (!m) {
    return null;
  }

  const { path: url, params } = m;

  return {
    params,
    search: location.search,
    hash: location.hash,
    isExact: url === location.pathname,
  };
};

export const getPathname = <
  PathParamKeys extends Record<string, string> = Record<never, string>
>(
  path: string,
  params: PathParams<PathParamKeys>
): string => {
  return compile(path)(params);
};

export const getNavigateFxOptions = <
  PathParamKeys extends Record<string, string> = Record<never, string>
>(
  location: Location,
  path: string,
  options: NavigateOptions<PathParamKeys> = {}
): NavigateFxOptions => {
  const navigateFxOptions: NavigateFxOptions = {};

  if (options.method) {
    navigateFxOptions.method = options.method;
  }

  if (options.search) {
    navigateFxOptions.search =
      options.search === true ? location.search : options.search;
  }
  if (options.hash) {
    navigateFxOptions.hash =
      options.hash === true ? location.hash : options.hash;
  }

  const currentParams = matchPath<PathParamKeys>(location, path)?.params || {};
  const params = { ...currentParams, ...options.params };
  navigateFxOptions.pathname = getPathname(path, params);

  return navigateFxOptions;
};
