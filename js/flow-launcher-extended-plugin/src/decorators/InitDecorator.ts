import {FlowPlugin} from "../index";

/** @internal */
export const __SYMBOL_INIT = Symbol("init");

type InitDecoratorContext = ClassMethodDecoratorContext<FlowPlugin, () => void | Promise<void | unknown>>;

export function InitDecorator<T extends () => void | Promise<void | unknown>>(): (target: T, context: InitDecoratorContext) => T;
export function InitDecorator<T extends () => void | Promise<void | unknown>>(target: T, context: InitDecoratorContext): T;

export function InitDecorator<T extends () => void | Promise<void | unknown>>(target?: T, context?: InitDecoratorContext): T | ((target: T, context: InitDecoratorContext) => T) {
  function actualDecorator(target: T, context: InitDecoratorContext): T {
    context.addInitializer(function() {
      this[__SYMBOL_INIT].push(target);
    });
    return target;
  }
  if (context && typeof target === 'function') {
    return actualDecorator(target, context);
  }

  return actualDecorator;
}
