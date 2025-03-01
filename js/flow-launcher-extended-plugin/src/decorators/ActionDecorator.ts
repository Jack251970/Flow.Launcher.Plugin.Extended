import {FlowPlugin} from "../index";

/** @internal */
export const __SYMBOL_ACTION = Symbol("action");

/** @internal */
export class ActionData {
  readonly #callbackName: 'FlowLauncher.Action' | 'Plugin.Action';
  readonly #methodName: string;
  readonly #data: any[];
  #hide = true;

  constructor(callbackName: 'FlowLauncher.Action' | 'Plugin.Action', methodName: string, data: any[] | IArguments = []) {
    this.#callbackName = callbackName;
    this.#methodName = methodName;
    this.#data = [...data];
  }

  public dontHide(): ActionData {
    this.#hide = false;
    return this;
  }

  private toJSON(): any {
    return {
      method: this.#callbackName,
      parameters: [this.#methodName, this.#data, this.#hide],
    };
  }
}

/** @internal */
export type LocalActionData<TMethod extends string = string, TArgs extends any[] = any[]> = [
  methodName: TMethod,
  data: TArgs,
  hide?: boolean,
];

type ActionReturn = boolean | Promise<boolean>;

type ActionDecoratorContext<TArgs extends any[], TMethod extends (...args: TArgs) => ActionReturn> = ClassMethodDecoratorContext<FlowPlugin, TMethod>;

export function ActionDecorator<TArgs extends any[], TMethod extends (...args: TArgs) => ActionReturn>(): (target: TMethod, context: ActionDecoratorContext<TArgs, TMethod>) => (...args: TArgs) => any;
export function ActionDecorator<TArgs extends any[], TMethod extends (...args: TArgs) => ActionReturn>(target: TMethod, context: ActionDecoratorContext<TArgs, TMethod>): (...args: TArgs) => any;

export function ActionDecorator<TArgs extends any[], TMethod extends (...args: TArgs) => ActionReturn>(target?: TMethod, context?: ActionDecoratorContext<TArgs, TMethod>): ((...args: TArgs) => any) | ((target: TMethod, context: ActionDecoratorContext<TArgs, TMethod>) => (...args: TArgs) => any) {
  function actualDecorator(target: TMethod, context: ActionDecoratorContext<TArgs, TMethod>): (...args: TArgs) => any {
    context.addInitializer(function () {
      this[__SYMBOL_ACTION].set(context.name as string, target);
    });

    return function (...args: TArgs) {
      return { method: "Plugin.Action", parameters: [context.name as string, args] };
    };
  }

  if (context && typeof target === "function") {
    return actualDecorator(target, context);
  }

  return actualDecorator;
}
