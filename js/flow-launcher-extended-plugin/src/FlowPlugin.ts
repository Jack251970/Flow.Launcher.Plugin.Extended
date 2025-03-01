import {JsonRpcConnection} from "./JsonRpcConnection";
import type {Metadata, OriginalQueryData, SearchRestrictionsAndHandler, Settings} from "./types";
import {getQuery, handleDebounce, log, makeResults} from "./utils";
import {__SYMBOL_SEARCH, SearchDecorator} from "./decorators/SearchDecorator";
import {__SYMBOL_CONTEXT_MENU, type ContextMenuData, ContextMenuDecorator} from "./decorators/ContextMenuDecorator";
import {__SYMBOL_INIT, InitDecorator} from "./decorators/InitDecorator";
import {ClassDecorator} from "./decorators/ClassDecorator";
import {__SYMBOL_ACTION, ActionDecorator, LocalActionData} from "./decorators/ActionDecorator";
import {FlowApi} from "./FlowApi";
import {FlowApiActions} from "./FlowApiActions";

export class FlowPlugin<TSettings extends Settings = Settings> {
  /**
   * All search handlers of the plugin.
   */
  private [__SYMBOL_SEARCH]: SearchRestrictionsAndHandler[] = [];
  /**
   * All context menus of the plugin.
   */
  private [__SYMBOL_CONTEXT_MENU] = new Map<string, (...args: any[]) => ContextMenu | AsyncContextMenu>();
  /**
   * All actions of the plugin.
   */
  private [__SYMBOL_ACTION] = new Map<string, (...args: any[]) => ActionReturn>();
  /**
   * All initializers of the plugin.
   */
  private [__SYMBOL_INIT]: Array<() => void | Promise<void | unknown>> = [];

  /**
   * An instance of an internal class that implements a simple JSON-RPC connection.
   */
  #connection: JsonRpcConnection;

  #api: FlowApi = null!;
  #settings: TSettings = {} as TSettings;
  #metadata: Metadata = null!;
  #abortController: AbortController | undefined;
  #actions: FlowApiActions = null!;

  get actions(): FlowApiActions {
    return this.#actions;
  }

  /**
   * Returns read-only settings of this plugin.
   */
  get settings(): TSettings {
    return {...this.#settings};
  }

  /**
   * Returns read-only metadata of this plugin. The metadata includes (but is not limited to):
   * * Plugin ID
   * * Plugin name
   * * Plugin description
   * etc.
   */
  get metadata(): Metadata {
    return {...this.#metadata};
  }

  get api(): FlowApi {
    return this.#api;
  }

  /**
   * Class methods that initialize your plugin (e.g., load data at startup) must be decorated with this decorator.
   *
   * @example
   * ```ts
   * @FlowPlugin.Init
   * initialization(): void {
   *     // ... do something
   * }
   *
   * @FlowPlugin.Init
   * async asyncInitialization(): Promise<void> {
   *     // ... do something async
   * }
   * ```
   */
  static Init = InitDecorator;
  /**
   * Class methods that return search results must be decorated with this decorator.
   *
   * @example
   * ```ts
   * @FlowPlugin.Search
   * defaultSearch(): SearchResults {
   *     return "This is a default result";
   * }
   *
   * @FlowPlugin.Search({ equalTo: "greet" })
   * greet(): SearchResults {
   *     return "Who are we greeting today?";
   * }
   *
   * @FlowPlugin.Search({ startsWith: "greet " })
   * greetName(query: Query): SearchResults {
   *     return `Hello, ${query.search}!`;
   * }
   * ```
   */
  static Search = SearchDecorator;
  /**
   * Class methods that are supposed to return context menus must be decorated with this decorator.
   *
   * @example
   * ```ts
   * @FlowPlugin.ContextMenu
   * greetingContextMenu(name: string): ContextMenu {
   *     return [`Hello, ${name}!`, `Hi, ${name}!`, `Welcome, ${name}!`];
   * }
   *
   * @FlowPlugin.Search({ startsWith: "greet " })
   * greetName(query: Query): SearchResults {
   *     return {
   *         title: `Hello, ${query.search}!`,
   *         contextMenu: this.greetingContextMenu(query.search),
   *     };
   * }
   * ```
   */
  static ContextMenu = ContextMenuDecorator;
  /**
   * The plugin class that extends `Plugin` must be decorated with this decorator.
   *
   * @example
   * ```ts
   * @FlowPlugin.Class
   * class MyPlugin extends FlowPlugin {
   * }
   * ```
   */
  static Class = ClassDecorator;
  /**
   * Class methods that are used in the [action]{@link Result#action} property of {@link Result} must be decorated
   * with this decorator. Additionally, this contains the full list of Flow Launcher's built-in API actions that can be
   * used in results like this:
   *
   * ```js
   * {
   *     title: "Hello World",
   *     action: FlowLauncher.Action.ShowMessage("Hello World"),
   * }
   * ```
   */
  static Action = ActionDecorator;

  constructor() {
    this.#connection = new JsonRpcConnection();

    this.#connection.onRequest("initialize", async (params) => {
      this.#metadata = params.currentPluginMetadata;
      this.#api = new FlowApi(this.#connection, this.#metadata);
      this.#actions = new FlowApiActions(this.#metadata);

      for (const initializer of this[__SYMBOL_INIT]) {
        initializer.call(this);
      }

      this[__SYMBOL_SEARCH].reverse();

      return {};
    });

    this.#connection.onRequest("query", async (query: OriginalQueryData, settings: TSettings) => {
      this.#settings = settings;

      this.#abortController?.abort();
      this.#abortController = new AbortController();

      const signal = this.#abortController.signal;

      try {
        let result: any[] = [];
        for (const search of this[__SYMBOL_SEARCH]) {
          if (search.restrictions == null || (
            search.restrictions.equalTo == null &&
            search.restrictions.startsWith == null &&
            search.restrictions.regexp == null
          )) {
            if (!await handleDebounce(signal, search.restrictions?.debounceDelay)) {
              return {};
            }
            result = makeResults(await search.handler.call(this, getQuery(query) as any, this.#abortController.signal), this.#metadata.icoPath);
            break;
          } else if (search.restrictions.equalTo != null) {
            if (search.restrictions.caseSensitive && search.restrictions.equalTo === query.search) {
              if (!await handleDebounce(signal, search.restrictions?.debounceDelay)) {
                return {};
              }
              result = makeResults(await search.handler.call(this, getQuery(query, search.restrictions.equalTo.length) as any, this.#abortController.signal), this.#metadata.icoPath);
              break;
            }

            if (!search.restrictions.caseSensitive && search.restrictions.equalTo.toLowerCase() === query.search.toLowerCase()) {
              if (!await handleDebounce(signal, search.restrictions?.debounceDelay)) {
                return {};
              }
              result = makeResults(await search.handler.call(this, getQuery(query, search.restrictions.equalTo.length) as any, this.#abortController.signal), this.#metadata.icoPath);
              break;
            }
          } else if (search.restrictions.startsWith != null) {
            if (search.restrictions.caseSensitive && query.search.startsWith(search.restrictions.startsWith)) {
              if (!await handleDebounce(signal, search.restrictions?.debounceDelay)) {
                return {};
              }
              result = makeResults(await search.handler.call(this, getQuery(query, search.restrictions.startsWith.length) as any, this.#abortController.signal), this.#metadata.icoPath);
              break;
            }

            if (!search.restrictions.caseSensitive && query.search.toLowerCase().startsWith(search.restrictions.startsWith.toLowerCase())) {
              if (!await handleDebounce(signal, search.restrictions.debounceDelay)) {
                return {};
              }
              result = makeResults(await search.handler.call(this, getQuery(query, search.restrictions.startsWith.length) as any, this.#abortController.signal), this.#metadata.icoPath);
              break;
            }
          } else if (search.restrictions.regexp) {
            const matches = query.search.match(search.restrictions.regexp);
            if (matches != null) {
              if (!await handleDebounce(signal, search.restrictions.debounceDelay)) {
                return {};
              }
              result = makeResults(await search.handler.call(this, getQuery(query, matches) as any, this.#abortController.signal), this.#metadata.icoPath);
              break;
            }
          }
        }

        return {result};
      } catch (e) {
        return {
          // result: makeResults(e instanceof Error ? e.message : `${e}`, this.#metadata.icoPath),
          error: {code: -32603, message: `${e}`}
        };
      }
    });

    this.#connection.onRequest("context_menu", async (params: ContextMenuData<any>) => {
      if (!this.#verifyContextMenuParams(params)) return;

      const result = makeResults(await this[__SYMBOL_CONTEXT_MENU].get(params[0])?.call(this, ...params[1]), this.#metadata.icoPath);

      return {result};
    });

    this.#connection.onRequest("FlowLauncher.Action", async (params: LocalActionData) => {
      if (!this.#verifyActionParams(params)) return;

      await this.#connection.sendRequest(params[0], params[1]);

      return {hide: params[2] === true};
    });

    this.#connection.onRequest("Plugin.Action", async (params: LocalActionData) => {
      log("Plugin.Action", params);
      if (!this.#verifyActionParams(params)) return;

      const result = await this[__SYMBOL_ACTION].get(params[0])?.call(this, ...params[1]);

      if (result === false) {
        return {hide: false};
      }

      return {hide: true};
    });
  }

  #verifyContextMenuParams(params: ContextMenuData<any>) {
    return Array.isArray(params) && params.length === 2 && typeof params[0] === "string" && Array.isArray(params[1]);
  }

  #verifyActionParams(params: LocalActionData) {
    return Array.isArray(params) && typeof params[0] === "string" && Array.isArray(params[1]) && (params.length === 2 || (params.length === 3 && (typeof params[2] === "boolean" || typeof params[2] === "undefined")));
  }
}
