import {NativeResult, OriginalQueryData, Result} from "./types";
import fs from "node:fs";
import {ActionData} from "./decorators/ActionDecorator";

/** @internal */
export function makeResults(data: SearchResults, defaultIcon: string): NativeResult[] {
  let results: Result[];
  if (!Array.isArray(data)) {
    if (data == null) results = [];
    else if (typeof data === "object") results = [data];
    else results = [{title: data.toString()}];
  } else {
    results = data
      .filter(v => v != null)
      .map(v => {
        if (typeof v === "object") return v;
        return {title: v.toString()};
      });
  }

  for (const result of results) {
    result.iconPath ??= defaultIcon;
  }

  return results.map(v => {
    return {
      title: v.title,
      subtitle: v.subtitle,
      copyText: v.textToCopyOnCtrlC,
      autoCompleteText: v.autoCompleteText,
      icoPath: v.iconPath,
      roundedIcon: v.isIconRounded,
      score: v.score,
      titleHighlightData: v.titleHighlightData,
      contextData: v.contextMenu,
      titleTooltip: v.titleTooltip,
      subtitleTooltip: v.subtitleTooltip,
      progressBar: v.progress,
      progressBarColor: v.progressBarColor,
      preview: v.preview,
      jsonRPCAction: v.action as ActionData | undefined,
    };
  });
}

/** @internal */
export function getQuery(query: OriginalQueryData, startingIndex: number | RegExpMatchArray = 0): Query | RegexpQuery {
  const search = query.search.slice(typeof startingIndex === 'number' ? startingIndex : 0).trim();
  return {
    raw: query.rawQuery,
    isReQuery: query.isReQuery,
    actionKeyword: query.actionKeyword,
    search,
    terms: search.split(" ").filter(v => v.length > 0),
    regexpMatches: typeof startingIndex === 'number' ? undefined : startingIndex,
  };
}

/** @internal */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** @internal */
export async function handleDebounce(signal: AbortSignal, ms: number | undefined): Promise<boolean> {
  if (signal.aborted) return false;
  if (ms == null) return true;
  await wait(ms);
  return !signal.aborted;
}

export function log(file: string, data: unknown = file, raw = false) {
  const dataToWrite = raw ? data?.toString() ?? "" : JSON.stringify(data, null, 2);
  fs.writeFileSync(`Z:/flow-launcher/Flow.Launcher.Plugin.Extended/js/json/${file}.json`, dataToWrite);
}
