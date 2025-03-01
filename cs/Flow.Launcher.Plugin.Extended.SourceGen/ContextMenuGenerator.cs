using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Flow.Launcher.Plugin.Extended.SourceGen;

[Generator]
public class ContextMenuGenerator : IIncrementalGenerator {
    public void Initialize(IncrementalGeneratorInitializationContext context) {
        var partialClassProvider = context
            .SyntaxProvider
            .CreateSyntaxProvider(
                predicate: static (s, _) =>
                    s is ClassDeclarationSyntax cds &&
                    cds.Modifiers.Any(SyntaxKind.PartialKeyword),
                transform: static (ctx, _) => {
                    var classDecl = (ClassDeclarationSyntax)ctx.Node;
                    var model = ctx.SemanticModel;
                    var symbol = ModelExtensions.GetDeclaredSymbol(model, classDecl) as INamedTypeSymbol;
                    return symbol?.BaseType?.Name == "ExtendedPlugin" ? symbol : null;
                }
            )
            .Where(symbol => symbol is not null);

        var methodProvider = partialClassProvider
            .SelectMany((classSymbol, _) => classSymbol?.GetMembers().OfType<IMethodSymbol>() ??
                                            Array.Empty<IMethodSymbol>()
            )
            .Where(method => method
                .GetAttributes()
                .Any(attr =>
                    attr.AttributeClass?.Name is "ContextMenu" or "ContextMenuAttribute"
                )
            );

        context.RegisterSourceOutput(methodProvider,
            (spc, methodSymbol) => {
                var methodName = methodSymbol.Name;
                var ns = methodSymbol.ContainingNamespace.ToDisplayString();
                var contextMenuInName = methodName.ToLower().Contains("context") ? "" : "ContextMenu";
                var parameters = methodSymbol.Parameters.Select(v => $"{v.Type.ToDisplayString()} {v.Name}");
                var parametersStr = string.Join(", ", parameters);
                var parameterNames = methodSymbol.Parameters.Select(v => v.Name);
                var parameterNamesStr = string.Join(", ", parameterNames);
                var newMethodName = $"Create{methodName}{contextMenuInName}";
                var sourceCode = $$"""
                                   namespace {{ns}};

                                   using Flow.Launcher.Plugin.Extended;

                                   public partial class {{methodSymbol.ContainingType.Name}}
                                   {
                                       public ExtendedContextMenu {{newMethodName}}({{parametersStr}})
                                       {
                                            return new ExtendedContextMenu(nameof({{methodName}}), new object[] { {{parameterNamesStr}} });
                                       }
                                   }
                                   """;
                spc.AddSource($"{newMethodName}.g.cs", sourceCode);
            }
        );
    }
}
