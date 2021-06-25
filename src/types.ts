import type { PartialPath } from "history";

export type PathParams<PathParamKeys extends string = never> = [
  PathParamKeys
] extends [never]
  ? {}
  : Record<PathParamKeys, string>;

export type Match<PathParamKeys extends string = never> = {
  params: PathParams<PathParamKeys>;
  isExact: boolean;
};

export type HistoryMethod = "push" | "replace";

export type NavigateOptions<PathParamKeys extends string = never> = Partial<{
  params: Partial<PathParams<PathParamKeys>>;
  search: boolean | string;
  hash: boolean | string;
  method: HistoryMethod;
}>;

export type NavigateFxOptions = PartialPath & { method?: HistoryMethod };
