using System.Reflection;
using Flow.Launcher.Plugin.Extended.Attributes;

namespace Flow.Launcher.Plugin.Extended;

public record PluginQueryMethod {
    public MethodInfo MethodInfo { get; init; } = null!;
    public SearchAttribute SearchAttribute { get; init; } = null!;
}
