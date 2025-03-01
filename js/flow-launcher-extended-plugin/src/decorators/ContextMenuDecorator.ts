import {FlowPlugin} from "../index";

/** @internal */
export const __SYMBOL_CONTEXT_MENU = Symbol("context-menu");

/** @internal */
export type ContextMenuData<TArgs extends any[]> = [
  methodName: string,
  data: TArgs,
];

type ContextMenuDecoratorContext<TArgs extends any[], TMethod extends (...args: TArgs) => ContextMenu | AsyncContextMenu> = ClassMethodDecoratorContext<FlowPlugin, TMethod>;

export function ContextMenuDecorator<TArgs extends any[], TMethod extends (...args: TArgs) => ContextMenu | AsyncContextMenu>(): (target: TMethod, context: ContextMenuDecoratorContext<TArgs, TMethod>) => (...args: TArgs) => any;
export function ContextMenuDecorator<TArgs extends any[], TMethod extends (...args: TArgs) => ContextMenu | AsyncContextMenu>(target: TMethod, context: ContextMenuDecoratorContext<TArgs, TMethod>): (...args: TArgs) => any;

export function ContextMenuDecorator<TArgs extends any[], TMethod extends (...args: TArgs) => ContextMenu | AsyncContextMenu>(target?: TMethod, context?: ContextMenuDecoratorContext<TArgs, TMethod>): ((...args: TArgs) => any) | ((target: TMethod, context: ContextMenuDecoratorContext<TArgs, TMethod>) => (...args: TArgs) => any) {
  function actualDecorator(target: TMethod, context: ContextMenuDecoratorContext<TArgs, TMethod>): (...args: TArgs) => any {
    context.addInitializer(function() {
      this[__SYMBOL_CONTEXT_MENU].set(context.name as string, target);
    });

    return function(...args: TArgs) {
      return [ context.name as string, args ];
    };
  }
  if (context && typeof target === 'function') {
    return actualDecorator(target, context);
  }

  return actualDecorator;
}
