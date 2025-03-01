using System.Text.RegularExpressions;
using JetBrains.Annotations;

namespace Flow.Launcher.Plugin.Extended.Attributes;

[AttributeUsage(AttributeTargets.Method)]
[PublicAPI]
[MeansImplicitUse]
public class SearchAttribute : Attribute {
    public string? EqualTo { get; }
    public string? StartsWith { get; }
    public Regex? Regex { get; }
    public StringComparison StringComparison { get; }
    public int DebounceDelay { get; }
    public int? MinLength { get; }
    public int? MaxLength { get; }

    public SearchAttribute(
        string? equalTo = null,
        string? startsWith = null,
        [RegexPattern] string? regex = null,
        RegexOptions regexOptions = RegexOptions.IgnoreCase,
        StringComparison stringComparison = StringComparison.InvariantCultureIgnoreCase,
        int debounceDelay = 0,
        int minLength = 0,
        int maxLength = int.MaxValue
    ) {
        EqualTo = equalTo;
        StartsWith = startsWith;
        if (regex != null) {
            Regex = new Regex(regex, regexOptions);
        }

        StringComparison = stringComparison;
        DebounceDelay = debounceDelay;
        MinLength = minLength;
        MaxLength = maxLength;
    }
}
