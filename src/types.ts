import type { PartialPath } from "history";

export type PathParams<
  PathParamKeys extends Record<string, string> = Record<never, string>
> = Record<keyof PathParamKeys, string>;

export type Match<
  PathParamKeys extends Record<string, string> = Record<never, string>
> = {
  params: PathParams<PathParamKeys>;
  search: string;
  hash: string;
  isExact: boolean;
};

export type HistoryMethod = "push" | "replace";

export type NavigateOptions<
  PathParamKeys extends Record<string, string> = Record<never, string>
> = Partial<{
  params: Partial<PathParams<PathParamKeys>>;
  search: boolean | string;
  hash: boolean | string;
  method: HistoryMethod;
}>;

export type NavigateFxOptions = PartialPath & { method?: HistoryMethod };
