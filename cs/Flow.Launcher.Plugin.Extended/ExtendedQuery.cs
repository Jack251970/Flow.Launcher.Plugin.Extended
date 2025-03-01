using JetBrains.Annotations;

namespace Flow.Launcher.Plugin.Extended;

[PublicAPI]
public class ExtendedQuery {
    private readonly Query _query;
    private readonly string? _commandStartsFrom;

    public string[] SearchTerms => _commandStartsFrom switch {
        null => _query.SearchTerms,
        _ => Search.Split(Query.TermSeparator),
    };

    public string Search => _commandStartsFrom switch {
        null => _query.Search,
        _ => _query.Search.Remove(0, _commandStartsFrom.Length),
    };

    public string ActionKeyword => _query.ActionKeyword;

    public ExtendedQuery(Query query, string? commandStartsFrom) {
        _query = query;
        _commandStartsFrom = commandStartsFrom;
    }

    public ExtendedQuery(Query query) {
        _query = query;
        _commandStartsFrom = null;
    }
}
