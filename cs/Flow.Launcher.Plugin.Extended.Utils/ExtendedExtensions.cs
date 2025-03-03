using CommunityToolkit.Mvvm.DependencyInjection;
using JetBrains.Annotations;

namespace Flow.Launcher.Plugin.Extended.Utils;

[PublicAPI]
public static class ExtendedExtensions {
    /// <summary>
    /// <see cref="IPublicAPI"/> instance.
    /// </summary>
    private static IPublicAPI? _api;

    /// <summary>
    /// Get <see cref="IPublicAPI"/> instance even in plugin constructors.
    /// </summary>
    /// <remarks>
    /// Only availbale for Flow Launcher 1.20.0 and later.
    /// </remarks>
    public static IPublicAPI Api => _api ??= Ioc.Default.GetRequiredService<IPublicAPI>();
}
