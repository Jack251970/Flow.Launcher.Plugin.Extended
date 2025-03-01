import {SearchHandler, SearchHandlerQueryOnly, SearchRestrictions} from "../types";
import {FlowPlugin} from "../index";

/** @internal */
export const __SYMBOL_SEARCH = Symbol("search");

type SearchDecoratorContext<T extends SearchHandler | SearchHandlerQueryOnly> = ClassMethodDecoratorContext<FlowPlugin, T>;
type SearchDecoratorReturn<T extends SearchHandler | SearchHandlerQueryOnly> = (value: T, context: SearchDecoratorContext<T>) => T;

export function SearchDecorator<T extends SearchHandler | SearchHandlerQueryOnly>(): SearchDecoratorReturn<T>;
export function SearchDecorator<T extends SearchHandler | SearchHandlerQueryOnly>(target: SearchRestrictions): SearchDecoratorReturn<T>;
export function SearchDecorator<T extends SearchHandler | SearchHandlerQueryOnly>(target: T, context: SearchDecoratorContext<T>): T;

export function SearchDecorator<T extends SearchHandler | SearchHandlerQueryOnly>(target?: SearchRestrictions | T, context?: SearchDecoratorContext<T>): SearchDecoratorReturn<T> | T {
  function actualDecorator(innerTarget: T, context: SearchDecoratorContext<T>): T {
    context.addInitializer(function() {
      this[__SYMBOL_SEARCH].push({ restrictions: typeof target === 'object' ? target : null, handler: innerTarget });
    });
    return innerTarget;
  }
  if (context && typeof target === 'function') {
    return actualDecorator(target, context);
  }

  return actualDecorator;
}
