import {ActionData} from "./decorators/ActionDecorator";

/** @internal */
export type SearchRestrictionsAndHandler = {
  restrictions: SearchRestrictions | null;
  handler: SearchHandler;
};

/** @internal */
export type OriginalQueryData = {
  rawQuery: string;
  isReQuery: boolean;
  search: string;
  searchTerms: string[];
  actionKeyword: string;
}

export type SearchRestrictions = {
  startsWith?: string;
  equalTo?: string;
  caseSensitive?: boolean;
  minLength?: number;
  maxLength?: number;
  debounceDelay?: number;
  regexp?: RegExp;
}

export type Settings = Record<string, string | boolean | null | undefined>;

export type Metadata = {
  id: string;
  name: string;
  author: string;
  version: string;
  language: `${"javascript" | "typescript" | "python" | "executable"}${"" | "_v2"}` | "csharp" | "fsharp";
  description: string;
  website: string;
  disabled: boolean;
  executeFilePath: string;
  executeFileName: string;
  pluginDirectory: string;
  actionKeyword: string;
  actionKeywords: string[];
  icoPath: string;
}

export type SearchHandlerReturnTypeSingular =
  | string
  | number
  | boolean
  | void
  | null
  | undefined
  | Result;

export type SearchHandlerQueryOnly =
  | ((query: Query) => SearchResults | AsyncSearchResults)
  | ((query: RegexpQuery) => SearchResults | AsyncSearchResults);
export type SearchHandler =
  | ((query: Query, abortSignal: AbortSignal) => SearchResults | AsyncSearchResults)
  | ((query: RegexpQuery, abortSignal: AbortSignal) => SearchResults | AsyncSearchResults);

export type Result = {
  title?: string;
  subtitle?: string;
  textToCopyOnCtrlC?: string;
  autocompleteText?: string;
  iconPath?: string;
  isIconRounded?: boolean;
  action?: ActionData | ActionReturn;
  score?: number;
  titleHighlightData?: number[];
  titleTooltip?: string;
  subtitleTooltip?: string;
  progress?: number;
  progressBarColor?: string;
  preview?: {
    /** Full image used for the preview panel. */
    previewImagePath?: string;
    /** Determines if the preview image should occupy the full width of the preview panel. */
    isMedia?: boolean;
    /**
     * Result description text that is shown at the bottom of the preview panel.
     *
     * @remarks When a value is not set, the {@link subtitle} value is used.
     */
    description?: string;
    /** File path of the result. For third-party programs providing external preview. */
    filePath?: string;
  };
  contextMenu?: ContextMenu | AsyncContextMenu;
};

/** @internal */
export type NativeResult = {
  title?: string;
  subtitle?: string;
  copyText?: string;
  autoCompleteText?: string;
  icoPath?: string;
  roundedIcon?: boolean;
  score?: number;
  titleHighlightData?: number[];
  contextData?: any[] | any;
  titleTooltip?: string;
  subtitleTooltip?: string;
  progressBar?: number;
  progressBarColor?: string;
  jsonRPCAction?: ActionData;
  preview?: {
    previewImagePath?: string;
    isMedia?: boolean;
    description?: string;
    filePath?: string;
  }
};

declare global {
  export type Query = {
    raw: string;
    isReQuery: boolean;
    search: string;
    terms: string[];
    actionKeyword: string;
  };

  export type RegexpQuery = Query & { regexpMatches: RegExpMatchArray };

  export type SearchResults = SearchHandlerReturnTypeSingular | SearchHandlerReturnTypeSingular[];
  export type AsyncSearchResults = Promise<SearchResults>;
  export type ContextMenu = SearchResults;
  export type AsyncContextMenu = AsyncSearchResults;
  export type ActionReturn = boolean | Promise<boolean>;
}
