import {JsonRpcConnection} from "./JsonRpcConnection";
import {makeResults} from "./utils";
import {Metadata} from "./types";

/** @internal */
export class FlowApi {
  readonly #connection: JsonRpcConnection;
  readonly #pluginId: string;
  readonly #iconPath: string;

  constructor(connection: JsonRpcConnection, pluginMetadata: Metadata) {
    this.#connection = connection;
    this.#pluginId = pluginMetadata.id;
    this.#iconPath = pluginMetadata.icoPath;
  }

  async changeQuery(query: string, requery = true): Promise<void> {
    return this.#connection.sendRequest("ChangeQuery", arguments);
  }

  async restartApp(): Promise<void> {
    return this.#connection.sendRequest("RestartApp");
  }

  async shellRun(cmd: string, filename = "cmd.exe"): Promise<void> {
    return this.#connection.sendRequest("ShellRun", [cmd, filename]);
  }

  async copyToClipboard(text: string, copyFile = false, showDefaultNotification = false): Promise<void> {
    return this.#connection.sendRequest("CopyToClipboard", arguments);
  }

  async saveAllAppSettings(): Promise<void> {
    return this.#connection.sendRequest("SaveAppAllSettings");
  }

  async saveAllPluginSettings(): Promise<void> {
    return this.#connection.sendRequest("SavePluginSettings");
  }

  async reloadAllPluginData(): Promise<void> {
    return this.#connection.sendRequest("ReloadAllPluginData");
  }

  async checkForUpdates(): Promise<void> {
    return this.#connection.sendRequest("CheckForNewUpdate");
  }

  async showErrorMessage(title: string, subtitle = ""): Promise<void> {
    return this.#connection.sendRequest("ShowMsgError", arguments);
  }

  async showMainWindow(): Promise<void> {
    return this.#connection.sendRequest("ShowMainWindow");
  }

  async hideMainWindow(): Promise<void> {
    return this.#connection.sendRequest("HideMainWindow");
  }

  async isMainWindowVisible(): Promise<boolean> {
    return this.#connection.sendRequest("IsMainWindowVisible");
  }

  async showMessage(title: string, subtitle = "", iconPath = "", useMainWindowAsOwner = true): Promise<void> {
    return this.#connection.sendRequest("ShowMsg", arguments);
  }

  async openSettingsWindow(): Promise<void> {
    return this.#connection.sendRequest("OpenSettingDialog");
  }

  async getTranslation(key: string): Promise<string> {
    return this.#connection.sendRequest("GetTranslation", arguments);
  }

  async getAllPlugins(): Promise<unknown[]> {
    return this.#connection.sendRequest("GetAllPlugins");
  }

  async fuzzySearch(needle: string, haystack: string): Promise<number> {
    return this.#connection.sendRequest("FuzzySearch", arguments);
  }

  async httpGetString(url: string): Promise<string> {
    return this.#connection.sendRequest("HttpGetStringAsync", arguments);
  }

  async httpGetJson<T extends any = any>(url: string): Promise<T>;
  async httpGetJson<T extends any = any>(url: string, query: string): Promise<T>;
  async httpGetJson<T extends any = any>(url: string, query?: string): Promise<T> {
    if (query) {
      url += encodeURIComponent(query);
    }
    const response = await this.httpGetString(url);
    return JSON.parse(response) as T;
  }

  async httpDownload(url: string, filePath: string): Promise<void> {
    return this.#connection.sendRequest("HttpDownloadAsync", arguments);
  }

  async addActionKeyword(keyword: string): Promise<void>;
  async addActionKeyword(pluginId: string, keyword: string): Promise<void>;
  async addActionKeyword(pluginIdOrKeyword: string, keyword?: string): Promise<void> {
    if (!keyword) {
      keyword = pluginIdOrKeyword;
      pluginIdOrKeyword = this.#pluginId;
    }
    return this.#connection.sendRequest("AddActionKeyword", [pluginIdOrKeyword, keyword]);
  }

  async removeActionKeyword(keyword: string): Promise<void>;
  async removeActionKeyword(pluginId: string, keyword: string): Promise<void>;
  async removeActionKeyword(pluginIdOrKeyword: string, keyword?: string): Promise<void> {
    if (!keyword) {
      keyword = pluginIdOrKeyword;
      pluginIdOrKeyword = this.#pluginId;
    }
    return this.#connection.sendRequest("RemoveActionKeyword", [pluginIdOrKeyword, keyword]);
  }

  async isActionKeywordAssigned(keyword: string): Promise<boolean> {
    return this.#connection.sendRequest("ActionKeywordAssigned", arguments);
  }

  async logDebug(className: string, message: string, methodName = ""): Promise<void> {
    return this.#connection.sendRequest("LogDebug", arguments);
  }

  async logInfo(className: string, message: string, methodName = ""): Promise<void> {
    return this.#connection.sendRequest("LogInfo", arguments);
  }

  async logWarn(className: string, message: string, methodName = ""): Promise<void> {
    return this.#connection.sendRequest("LogWarn", arguments);
  }

  async openDirectory(directoryPath: string, fileNameOrFilePath: string | null = null): Promise<void> {
    return this.#connection.sendRequest("OpenDirectory", arguments);
  }

  async openUrl(url: string, incognito: boolean | null = null): Promise<void> {
    return this.#connection.sendRequest("OpenUrl", arguments);
  }

  async openAppUri(uri: string): Promise<void> {
    return this.#connection.sendRequest("OpenAppUri", arguments);
  }

  async toggleGameMode(): Promise<void> {
    return this.#connection.sendRequest("ToggleGameMode");
  }

  async setGameMode(value: boolean): Promise<void> {
    return this.#connection.sendRequest("SetGameMode", arguments);
  }

  async isGameModeOn(): Promise<boolean> {
    return this.#connection.sendRequest("IsGameModeOn");
  }

  async reQuery(reselect = false): Promise<void> {
    return this.#connection.sendRequest("ReQuery", arguments);
  }

  async updateResults(rawQuery: string, results: SearchResults): Promise<void> {
    return this.#connection.sendRequest("UpdateResults", [rawQuery, { result: makeResults(results, this.#iconPath) }]);
  }
}
