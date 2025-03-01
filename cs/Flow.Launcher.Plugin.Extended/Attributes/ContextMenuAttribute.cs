using JetBrains.Annotations;

namespace Flow.Launcher.Plugin.Extended.Attributes;

[AttributeUsage(AttributeTargets.Method)]
[PublicAPI]
[MeansImplicitUse]
public class ContextMenuAttribute : Attribute {
}
