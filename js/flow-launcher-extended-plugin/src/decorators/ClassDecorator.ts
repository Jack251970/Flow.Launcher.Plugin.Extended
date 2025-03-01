type ClassDecoratorMetadata = ClassDecoratorContext<any>;

type Constructable = { new(): any };

export function ClassDecorator<T extends Constructable>(): (target: T, context: ClassDecoratorMetadata) => T;
export function ClassDecorator<T extends Constructable>(target: T, context: ClassDecoratorMetadata): T;

export function ClassDecorator<T extends Constructable>(target?: T, context?: ClassDecoratorMetadata): void | ((target: T, context: ClassDecoratorMetadata) => void) {
  function actualDecorator(target: T, context: ClassDecoratorMetadata): void {
    new target();
  }
  if (context && typeof target === 'function') {
    return actualDecorator(target, context);
  }

  return actualDecorator;
}
