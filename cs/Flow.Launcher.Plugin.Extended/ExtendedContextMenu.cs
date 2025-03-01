using JetBrains.Annotations;

namespace Flow.Launcher.Plugin.Extended;

[PublicAPI]
public record ExtendedContextMenu(string Name, object[] Data) {
    internal ExtendedResult? ExtendedResult { get; set; }
}
