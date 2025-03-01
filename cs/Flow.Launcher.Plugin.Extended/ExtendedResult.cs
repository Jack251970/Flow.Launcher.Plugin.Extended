using System.Collections;
using System.Windows.Controls;
using JetBrains.Annotations;

namespace Flow.Launcher.Plugin.Extended;

[PublicAPI]
public class ExtendedResult {
    public string? Title { get; set; }
    public string? Subtitle { get; set; }
    public string? TextToCopyOnCtrlC { get; set; }
    public string? TextToCopyOnEnter { get; set; }
    public string? AutoCompleteText { get; set; }
    public string? IconPath { get; set; }
    public bool? IsIconRounded { get; set; }
    public Result.IconDelegate? Icon { get; set; }
    public GlyphInfo? Glyph { get; set; }
    public Func<ActionContext, bool>? Action { get; set; }
    public Func<ActionContext, ValueTask<bool>>? ActionAsync { get; set; }
    public string? UrlToOpen { get; set; }
    public string? UrlToOpenIncognito { get; set; }
    public int Score { get; set; }
    public IList<int>? TitleHighlightData { get; set; }
    public string? TitleTooltip { get; set; }
    public string? SubtitleTooltip { get; set; }
    public Lazy<UserControl>? PreviewPanel { get; set; }
    [ValueRange(0, 100)] public int? ProgressBar { get; set; }
    public string ProgressBarColor { get; set; } = "#26a0da";
    public Result.PreviewInfo Preview { get; set; } = Result.PreviewInfo.Default;
    public ExtendedContextMenu? ContextMenu { get; set; }

    internal static ExtendedResult From(object obj) => new() { Title = obj.ToString()! };

    internal static IEnumerable<ExtendedResult> From(IEnumerable<object> objs) =>
        objs.Select(v => new ExtendedResult { Title = v.ToString() });

    internal static IEnumerable<ExtendedResult> From(ICollection collection) =>
        collection.Cast<object>().Select(v => new ExtendedResult { Title = v.ToString() });

    internal Result ToResult(IPublicAPI api, PluginMetadata metadata) {
        var action = Action;
        var actionAsync = ActionAsync;

        if (action == null && actionAsync == null) {
            if (UrlToOpenIncognito != null) {
                action = _ => {
                    api.OpenUrl(UrlToOpenIncognito, true);
                    return true;
                };
            } else if (UrlToOpen != null) {
                action = _ => {
                    api.OpenUrl(UrlToOpen);
                    return true;
                };
            } else if (TextToCopyOnEnter != null) {
                action = _ => {
                    api.CopyToClipboard(TextToCopyOnEnter);
                    return false;
                };
            }
        }

        if (ContextMenu is not null)
            ContextMenu.ExtendedResult = this;

        return new Result {
            Title = Title,
            SubTitle = Subtitle,
            CopyText = TextToCopyOnCtrlC,
            IcoPath = IconPath ?? metadata.IcoPath,
            Score = Score,
            TitleHighlightData = TitleHighlightData,
            Action = action,
            AsyncAction = actionAsync,
            AutoCompleteText = AutoCompleteText,
            Icon = Icon,
            Glyph = Glyph,
            ContextData = ContextMenu,
            TitleToolTip = TitleTooltip,
            SubTitleToolTip = SubtitleTooltip,
            PreviewPanel = PreviewPanel,
            ProgressBar = ProgressBar,
            ProgressBarColor = ProgressBarColor,
            Preview = Preview,
        };
    }
}
