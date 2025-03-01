> [!WARNING]
> This project is experimental, is still a work in progress, and is not ready for production use.

This project is an attempt
at making plugin development for [Flow Launcher](https://github.com/Flow-Launcher/Flow.Launcher/) simpler.
It includes:

- `Flow.Launcher.Plugin.Extended` — a library that provides a set of attributes like `[Init]`, `[Search]` and
  `[ContextMenu]` to make plugin development easier.
- `Flow.Launcher.Plugin.Extended.SourceGen` — a source generator that generates code for the attributes in
  `Flow.Launcher.Plugin.Extended`. Right now it's only used for `[ContextMenu]` attribute, but that might change in the
  future.
- `Flow.Launcher.Plugin.Extended.Template` — a dotnet template that creates a new project with the necessary
  dependencies and a basic plugin structure.
