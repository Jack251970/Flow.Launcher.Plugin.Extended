type PluginManifest = {
  "ID": string;
  "Name": string;
  "Description": string;
  "Author": string;
  "Version": string;
  "Language": `${"javascript" | "typescript" | "python" | "executable"}${"" | "_v2"}` | "csharp" | "fsharp";
  "Website": string;
  "ExecuteFileName": string;
  "IcoPath": string;
  "ActionKeyword": string;
}

type RetryQueueData =
  | { type: "copy", src: string, dest: string }
  | { type: "delete", dest: string };
