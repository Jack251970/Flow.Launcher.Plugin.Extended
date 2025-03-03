using CommunityToolkit.Mvvm.DependencyInjection;
using JetBrains.Annotations;

namespace Flow.Launcher.Plugin.Extended.Utils;

[PublicAPI]
public static class ExtendedExtensions
{
    /// <summary>
    /// <see cref="IPublicAPI"/> instance.
    /// </summary>
    private static IPublicAPI? _api;

    /// <summary>
    /// Get <see cref="IPublicAPI"/> instance even in plugin constructors.
    /// </summary>
    /// <remarks>
    /// From <see cref="Flow.Launcher.Plugin"/> 4.5.0, we can use <see cref="Ioc"/> to get <see cref="IPublicAPI"/> instance.
    /// </remarks>
    public static IPublicAPI Api => _api ??= Ioc.Default.GetRequiredService<IPublicAPI>();
}
