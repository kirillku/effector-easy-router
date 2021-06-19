import type { Location } from "history";
import type {
  Match,
  NavigateFxOptions,
  NavigateOptions,
  PathParams,
  RouteOptions,
} from "./types";

export const getPathParams = <
  PathParamKeys extends Record<string, string> = Record<never, string>
>(
  pathname: string,
  path: string
): PathParams<PathParamKeys> => {
  // TODO: Implement params.
  return {} as PathParams<PathParamKeys>;
};

export const getPathname = <
  PathParamKeys extends Record<string, string> = Record<never, string>
>(
  path: string,
  params: PathParams<PathParamKeys>
): string => {
  // TODO: Implement params.
  return path;
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

  const currentParams = getPathParams(location.pathname, path);
  const params = { ...currentParams, ...options.params };
  navigateFxOptions.pathname = getPathname(path, params);

  return navigateFxOptions;
};

export const getHref = <
  PathParamKeys extends Record<string, string> = Record<never, string>
>(
  location: Location,
  path: string,
  options: NavigateOptions<PathParamKeys> = {}
) => {
  const navigateFxOptions = getNavigateFxOptions(location, path, options);

  // TODO: Implement params.
  return path;
};

export const matchPath = <
  PathParamKeys extends Record<string, string> = Record<never, string>
>(
  location: Location,
  path: string,
  options: RouteOptions = {}
): Match<PathParamKeys> | null => {
  const isExact = location.pathname === path;

  const isMatch = options?.exact ? isExact : location.pathname.startsWith(path);

  if (isMatch) {
    return {
      params: getPathParams<PathParamKeys>(location.pathname, path),
      search: location.search,
      hash: location.hash,
      isExact,
    };
  }

  return null;
};
