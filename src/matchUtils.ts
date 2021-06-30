import type { Location } from "history";
import { compile, match } from "path-to-regexp";
import type { MatchFunction } from "path-to-regexp";
import type {
  Match,
  NavigateFxOptions,
  NavigateOptions,
  PathParams,
} from "./types";

const CACHE_SIZE_LIMIT = 1000;
const cache = new Map<string, MatchFunction>();

const getMatcher = <PathParamKeys extends string = never>(
  path: string
): MatchFunction<PathParams<PathParamKeys>> => {
  let matcher = cache.get(path);

  if (!matcher) {
    matcher = match<PathParams<PathParamKeys>>(path, { end: false });
    if (cache.size > CACHE_SIZE_LIMIT) {
      cache.clear();
    }
    cache.set(path, matcher);
  }

  return matcher as MatchFunction<PathParams<PathParamKeys>>;
};

export const matchPath = <PathParamKeys extends string = never>(
  pathname: string,
  path: string
): Match<PathParamKeys> | null => {
  const matcher = getMatcher<PathParamKeys>(path);
  const match = matcher(pathname);

  if (!match) {
    return null;
  }

  const { path: url, params } = match;

  return {
    params,
    isExact: url === pathname,
  };
};

export const getPathname = <PathParamKeys extends string = never>(
  path: string,
  params: PathParams<PathParamKeys>
): string => {
  return compile(path)(params);
};

const addPrefix = (value: string, prefix: string): string =>
  !value.startsWith(prefix) ? `${prefix}${value}` : value;

export const getNavigateFxOptions = <PathParamKeys extends string = never>(
  location: Location,
  path: string | null,
  options: NavigateOptions<PathParamKeys> = {}
): NavigateFxOptions => {
  const navigateFxOptions: NavigateFxOptions = {};

  if (options.method) {
    navigateFxOptions.method = options.method;
  }

  if (options.search) {
    navigateFxOptions.search =
      options.search === true
        ? location.search
        : addPrefix(options.search, "?");
  }
  if (options.hash) {
    navigateFxOptions.hash =
      options.hash === true ? location.hash : addPrefix(options.hash, "#");
  }

  if (path) {
    const currentParams =
      matchPath<PathParamKeys>(location.pathname, path)?.params || {};
    const params = { ...currentParams, ...options.params };
    navigateFxOptions.pathname = getPathname(path, params);
  } else {
    navigateFxOptions.pathname = location.pathname;
  }

  return navigateFxOptions;
};
