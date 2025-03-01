var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "node:fs";
/** @internal */
export function makeResults(data, defaultIcon) {
    var _a;
    let results;
    if (!Array.isArray(data)) {
        if (data == null)
            results = [];
        else if (typeof data === "object")
            results = [data];
        else
            results = [{ title: data.toString() }];
    }
    else {
        results = data
            .filter(v => v != null)
            .map(v => {
            if (typeof v === "object")
                return v;
            return { title: v.toString() };
        });
    }
    for (const result of results) {
        (_a = result.iconPath) !== null && _a !== void 0 ? _a : (result.iconPath = defaultIcon);
    }
    return results.map(v => ({
        title: v.title,
        subtitle: v.subtitle,
        copyText: v.textToCopyOnCtrlC,
        autoCompleteText: v.autoCompleteText,
        icoPath: v.iconPath,
        roundedIcon: v.isIconRounded,
        score: v.score,
        titleHighlightData: v.titleHighlightData,
        contextData: v.contextMenu ? makeResults(v.contextMenu, defaultIcon) : undefined,
        titleTooltip: v.titleTooltip,
        subtitleTooltip: v.subtitleTooltip,
        progressBar: v.progress,
        progressBarColor: v.progressBarColor,
        preview: v.preview,
    }));
}
/** @internal */
export function getQuery(query, startingIndex = 0) {
    const search = query.search.slice(startingIndex).trim();
    return {
        raw: query.rawQuery,
        isReQuery: query.isReQuery,
        actionKeyword: query.actionKeyword,
        search,
        terms: search.split(" ").filter(v => v.length > 0),
    };
}
/** @internal */
export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/** @internal */
export function handleDebounce(signal, ms) {
    return __awaiter(this, void 0, void 0, function* () {
        if (signal.aborted)
            return false;
        if (ms == null)
            return true;
        yield wait(ms);
        return !signal.aborted;
    });
}
export function log(file, data = file, raw = false) {
    var _a;
    const dataToWrite = raw ? (_a = data === null || data === void 0 ? void 0 : data.toString()) !== null && _a !== void 0 ? _a : "" : JSON.stringify(data, null, 2);
    fs.writeFileSync(`Z:/flow-launcher/Flow.Launcher.Plugin.Extended/js/json/${file}.json`, dataToWrite);
}
