using Flow.Launcher.Plugin.Extended;
using Flow.Launcher.Plugin.Extended.Attributes;

namespace Flow.Launcher.Plugin.MyFlowPlugin;

#if withContextMenus
public partial class MyFlowPlugin : ExtendedPlugin {
#else
public class MyFlowPlugin : ExtendedPlugin {
#endif
#if withContextMenus
    [Search]
    public ExtendedResult EmptyQuery() {
        return new ExtendedResult {
            Title = "Hello, Flow Launcher!",
            ContextMenu = CreateEmptyQueryContextMenu();
        };
    };

    [ContextMenu]
    public string EmptyQueryContextMenu() {
        return "Context menu";
    }
#else
    [Search]
    public string EmptyQuery() {
        return "Hello, Flow Launcher!";
    }
#endif
}
