// Type stub for class-transformer (backend-only dependency)
// This allows the web app to compile shared library DTOs that import class-transformer
// without actually needing the package installed

declare module 'class-transformer' {
  export function plainToClass<T, V>(cls: new () => T, plain: V): T;
  export function plainToClass<T, V>(cls: new () => T, plain: V[]): T[];
  export function plainToClass<T, V>(cls: new () => T, plain: V, options?: any): T;
  export function plainToClass<T, V>(cls: new () => T, plain: V[], options?: any): T[];
  
  export function plainToInstance<T, V>(cls: new () => T, plain: V): T;
  export function plainToInstance<T, V>(cls: new () => T, plain: V[]): T[];
  export function plainToInstance<T, V>(cls: new () => T, plain: V, options?: any): T;
  export function plainToInstance<T, V>(cls: new () => T, plain: V[], options?: any): T[];
  
  export function classToPlain<T>(object: T, options?: any): any;
  export function classToPlain<T>(object: T[], options?: any): any[];
  
  export function instanceToPlain<T>(object: T, options?: any): any;
  export function instanceToPlain<T>(object: T[], options?: any): any[];
  
  export function transform<T, V>(object: T, targetType: new () => V, options?: any): V;
  export function transform<T, V>(object: T[], targetType: new () => V, options?: any): V[];
  
  export function serialize(object: any, options?: any): any;
  export function deserialize<T>(cls: new () => T, json: any, options?: any): T;
  export function deserializeArray<T>(cls: new () => T, json: any[], options?: any): T[];
  
  export function Exclude(options?: any): PropertyDecorator;
  export function Expose(options?: any): PropertyDecorator;
  export function Type(fn: () => Function): PropertyDecorator;
  export function Transform(fn: (value: any) => any, options?: any): PropertyDecorator;
}

