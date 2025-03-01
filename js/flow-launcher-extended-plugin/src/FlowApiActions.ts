import {ActionData} from "./decorators/ActionDecorator";
import {Metadata} from "./types";
import {makeResults} from "./utils";

/** @internal */
export class FlowApiActions {
  readonly #pluginId: string;
  readonly #iconPath: string;

  constructor(pluginMetadata: Metadata) {
    this.#pluginId = pluginMetadata.id;
    this.#iconPath = pluginMetadata.icoPath;
  }

  changeQuery(query: string, requery = false): ActionData {
    return makeActionData("ChangeQuery", arguments);
  }

  restartApp(): ActionData {
    return makeActionData("RestartApp");
  }

  shellRun(cmd: string, filename = "cmd.exe"): ActionData {
    return makeActionData("ShellRun", arguments);
  }

  copyToClipboard(text: string, copyFile = false, showDefaultNotification = false): ActionData {
    return makeActionData("CopyToClipboard", arguments);
  }

  saveAllAppSettings(): ActionData {
    return makeActionData("SaveAppAllSettings");
  }

  saveAllPluginSettings(): ActionData {
    return makeActionData("SavePluginSettings");
  }

  reloadAllPluginData(): ActionData {
    return makeActionData("ReloadAllPluginData");
  }

  checkForUpdates(): ActionData {
    return makeActionData("CheckForNewUpdate");
  }

  showErrorMessage(title: string, subtitle = ""): ActionData {
    return makeActionData("ShowMsgError", arguments);
  }

  showMainWindow(): ActionData {
    return makeActionData("ShowMainWindow");
  }

  hideMainWindow(): ActionData {
    return makeActionData("HideMainWindow");
  }

  showMessage(title: string, subtitle = "", iconPath = "", useMainWindowAsOwner = true): ActionData {
    return makeActionData("ShowMsg", arguments);
  }

  openSettings(): ActionData {
    return makeActionData("OpenSettingDialog");
  }

  httpDownload(url: string, filename: string): ActionData {
    return makeActionData("HttpDownload", arguments);
  }

  addActionKeyword(keyword: string): ActionData;
  addActionKeyword(pluginId: string, keyword: string): ActionData;
  addActionKeyword(pluginIdOrKeyword: string, keyword?: string): ActionData {
    if (!keyword) {
      return makeActionData("AddActionKeyword", [this.#pluginId, pluginIdOrKeyword]);
    }

    return makeActionData("AddActionKeyword", [pluginIdOrKeyword, keyword]);
  }

  removeActionKeyword(keyword: string): ActionData;
  removeActionKeyword(pluginId: string, keyword: string): ActionData;
  removeActionKeyword(pluginIdOrKeyword: string, keyword?: string): ActionData {
    if (!keyword) {
      return makeActionData("RemoveActionKeyword", [this.#pluginId, pluginIdOrKeyword]);
    }

    return makeActionData("RemoveActionKeyword", [pluginIdOrKeyword, keyword]);
  }

  logDebug(message: string): ActionData;
  logDebug(className: string, message: string, methodName?: string): ActionData;
  logDebug(classNameOrMessage: string, message?: string, methodName = ""): ActionData {
    if (message == null) {
      message = classNameOrMessage;
      classNameOrMessage = "";
    }

    return makeActionData("LogDebug", [classNameOrMessage, message, methodName]);
  }

  logInfo(message: string): ActionData;
  logInfo(className: string, message: string, methodName?: string): ActionData;
  logInfo(classNameOrMessage: string, message?: string, methodName = ""): ActionData {
    if (message == null) {
      message = classNameOrMessage;
      classNameOrMessage = "";
    }

    return makeActionData("LogInfo", [classNameOrMessage, message, methodName]);
  }

  logWarn(message: string): ActionData;
  logWarn(className: string, message: string, methodName?: string): ActionData;
  logWarn(classNameOrMessage: string, message?: string, methodName = ""): ActionData {
    if (message == null) {
      message = classNameOrMessage;
      classNameOrMessage = "";
    }

    return makeActionData("LogWarn", [classNameOrMessage, message, methodName]);
  }

  openDirectory(directoryPath: string, fileNameOrFilePath: string | null = null): ActionData {
    return makeActionData("OpenDirectory", arguments);
  }

  openUrl(url: string, incognito: boolean | null = null): ActionData {
    return makeActionData("OpenUrl", arguments);
  }

  openAppUri(uri: string): ActionData {
    return makeActionData("OpenAppUri", arguments);
  }

  toggleGameMode(): ActionData {
    return makeActionData("ToggleGameMode");
  }

  setGameMode(value: boolean): ActionData {
    return makeActionData("SetGameMode", arguments);
  }

  requery(reselect = true): ActionData {
    return makeActionData("ReQuery", arguments);
  }

  updateResults(rawQuery: string, results: SearchResults): ActionData {
    return makeActionData("UpdateResults", [rawQuery, { result: makeResults(results, this.#iconPath) }]);
  }
}

function makeActionData(methodName: string, args: any[] | IArguments = []): ActionData {
  return new ActionData("FlowLauncher.Action", methodName, args);
}
