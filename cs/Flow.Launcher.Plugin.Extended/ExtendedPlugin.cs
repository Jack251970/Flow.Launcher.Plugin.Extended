using System.Collections;
using System.Reflection;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Windows.Controls;
using Flow.Launcher.Plugin.Extended.Attributes;
using JetBrains.Annotations;

namespace Flow.Launcher.Plugin.Extended;

[PublicAPI]
public partial class ExtendedPlugin : IAsyncPlugin, IContextMenu, ISettingProvider {
    protected PluginMetadata PluginMetadata = null!;
    protected IPublicAPI Api = null!;

    private PluginQueryMethod[] _queryMethods = null!;
    private Dictionary<string, MethodInfo> _contextMenus = new();
    private MethodInfo? _createSettingsUiMethod;

    public async Task<List<Result>> QueryAsync(Query query, CancellationToken token) {
        object? result = null;
        foreach (var queryMethod in _queryMethods) {
            var searchAttribute = queryMethod.SearchAttribute;
            if (searchAttribute is { EqualTo: null, StartsWith: null, Regex: null }) {
                result = InvokeMethodWithCommonParameters(
                    queryMethod.MethodInfo,
                    query,
                    new ExtendedQuery(query),
                    token
                );
                break;
            }

            if (searchAttribute.EqualTo != null && query.Search.Equals(
                    searchAttribute.EqualTo,
                    searchAttribute.StringComparison
                )) {
                result = InvokeMethodWithCommonParameters(
                    queryMethod.MethodInfo,
                    query,
                    new ExtendedQuery(query),
                    token
                );
                break;
            }

            if (searchAttribute.StartsWith != null && query.Search.StartsWith(
                    searchAttribute.StartsWith,
                    searchAttribute.StringComparison
                )) {
                if (searchAttribute.MinLength != null && query.Search.Length < searchAttribute.MinLength) {
                    continue;
                }

                if (searchAttribute.MaxLength != null && query.Search.Length > searchAttribute.MaxLength) {
                    continue;
                }

                result = InvokeMethodWithCommonParameters(
                    queryMethod.MethodInfo,
                    query,
                    new ExtendedQuery(query, searchAttribute.StartsWith),
                    token
                );
                break;
            }

            if (searchAttribute.Regex != null) {
                var regex = searchAttribute.Regex;
                var match = regex.Match(query.Search);
                if (match.Success) {
                    var parameterValues = new List<object?>();
                    var parameters = queryMethod.MethodInfo.GetParameters();

                    foreach (var parameter in parameters) {
                        if (parameter.ParameterType == typeof(Query)) {
                            parameterValues.Add(query);
                        } else if (parameter.ParameterType == typeof(ExtendedQuery)) {
                            parameterValues.Add(new ExtendedQuery(query));
                        } else if (parameter.ParameterType == typeof(CancellationToken)) {
                            parameterValues.Add(token);
                        } else {
                            try {
                                var varRegex = ParameterIndexedCapturingGroupRegex();
                                var parameterName = parameter.Name!;
                                if (varRegex.IsMatch(parameterName)) {
                                    parameterName = parameterName[1..];
                                }

                                if (!match.Groups.ContainsKey(parameterName)) {
                                    if (parameter.HasDefaultValue) {
                                        parameterValues.Add(parameter.DefaultValue);
                                    }

                                    if (Nullable.GetUnderlyingType(parameter.ParameterType) != null) {
                                        parameterValues.Add(null);
                                    }
                                }

                                var value = match.Groups[parameterName].Value;
                                var convertedValue = Convert.ChangeType(value, parameter.ParameterType);
                                parameterValues.Add(convertedValue);
                            } catch (Exception e) {
                                return new List<Result> {
                                    new() {
                                        Title =
                                            $"Error: in method `{queryMethod.MethodInfo.ReturnType} {queryMethod.MethodInfo.Name}`",
                                        SubTitle = e.Message,
                                    },
                                };
                            }
                        }
                    }

                    result = queryMethod.MethodInfo.Invoke(this, parameterValues.ToArray());

                    break;
                }
            }
        }

        if (result is Task task) {
            await task;
            if (task.GetType().GetProperty("Result") != null) {
                result = ((dynamic)task).Result;
            } else {
                result = null;
            }
        }

        return ConvertToResults(result);
    }

    private static bool IsEnumerable(object? obj) => obj?.GetType().GetInterface("IEnumerable") != null;
    private static bool IsDictionary(object? obj) => obj?.GetType().GetInterface("IDictionary") != null;

    private object? InvokeMethodWithCommonParameters(
        MethodInfo method, Query query, ExtendedQuery extendedQuery, CancellationToken token
    ) {
        var methodParams = method.GetParameters();
        var list = new List<object>();
        foreach (var param in methodParams) {
            if (param.ParameterType == typeof(Query)) {
                list.Add(query);
            } else if (param.ParameterType == typeof(ExtendedQuery)) {
                list.Add(extendedQuery);
            } else if (param.ParameterType == typeof(CancellationToken)) {
                list.Add(token);
            }
        }

        return method.Invoke(this, list.ToArray());
    }

    public Task InitAsync(PluginInitContext context) {
        PluginMetadata = context.CurrentPluginMetadata;
        Api = context.API;

        var type = GetType();

        var settingsFields = type
            .GetFields(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance)
            .Where(v => v.GetCustomAttribute<SettingsAttribute>() != null);

        var loadSettingsMethod = typeof(IPublicAPI).GetMethod(nameof(Api.LoadSettingJsonStorage))!;
        foreach (var field in settingsFields) {
            var fieldType = field.FieldType;
            var genericLoadSettingsMethod = loadSettingsMethod.MakeGenericMethod(fieldType);
            var settings = genericLoadSettingsMethod.Invoke(Api, null);
            field.SetValue(this, settings);
        }

        var methodInfos = type.GetMethods(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance);

        _queryMethods = methodInfos
            .Where(v => v.GetCustomAttribute<SearchAttribute>() != null)
            .Select(
                v => {
                    var queryAttribute = v.GetCustomAttribute<SearchAttribute>()!;
                    return new PluginQueryMethod { MethodInfo = v, SearchAttribute = queryAttribute };
                }
            )
            .Reverse()
            .ToArray();

        methodInfos
            .Where(v => v.GetCustomAttribute<ContextMenuAttribute>() != null)
            .ToList()
            .ForEach(v => _contextMenus[v.Name] = v);

        _createSettingsUiMethod = methodInfos
            .SingleOrDefault(v => v.GetCustomAttribute<CreateSettingsUiAttribute>() != null);

        var initMethods = methodInfos
            .Where(v => v.GetCustomAttribute<InitAttribute>() != null)
            .ToList()
            .Select(
                v => {
                    var result = v.Invoke(this, Array.Empty<object>());
                    if (result is Task task) {
                        return task;
                    }

                    return Task.CompletedTask;
                }
            );

        return Task.WhenAll(initMethods);
    }

    protected async Task<T?> DownloadJson<T>(string url, CancellationToken token = default) {
        var response = await Api.HttpGetStringAsync(url, token);
        return JsonSerializer.Deserialize<T>(response);
    }

    public List<Result> LoadContextMenus(Result selectedResult) {
        if (selectedResult.ContextData is not ExtendedContextMenu contextMenu) return new List<Result>();

        var method = _contextMenus[contextMenu.Name];
        var result = method.Invoke(this, contextMenu.Data);
        return ConvertToResults(result);
    }

    private List<Result> ConvertToResults(object? result) {
        return result switch {
            ExtendedResult r => new List<Result> { r.ToResult(Api, PluginMetadata) },
            string str => new List<Result> { ExtendedResult.From(str).ToResult(Api, PluginMetadata) },
            not null when IsDictionary(result) => ExtendedResult
                .From(((IDictionary)result).Values)
                .Select(v => v.ToResult(Api, PluginMetadata))
                .ToList(),
            IEnumerable<ExtendedResult> enumerable => enumerable.Select(v => v.ToResult(Api, PluginMetadata)).ToList(),
            not null when IsEnumerable(result) => ExtendedResult
                .From((IEnumerable<object>)result)
                .Select(v => v.ToResult(Api, PluginMetadata))
                .ToList(),
            not null => new List<Result> { ExtendedResult.From(result).ToResult(Api, PluginMetadata) },
            null => new List<Result>(),
        };
    }

    [GeneratedRegex(@"^_\d")]
    private static partial Regex ParameterIndexedCapturingGroupRegex();

    public Control CreateSettingPanel() => (Control?)_createSettingsUiMethod?.Invoke(this, null) ?? new Control();
}
