// Type stub for class-validator (backend-only dependency)
// This allows the web app to compile shared library DTOs that import class-validator
// without actually needing the package installed

declare module 'class-validator' {
  // Export all common decorators as PropertyDecorator
  // Note: These decorators can accept multiple arguments (validation options and validation options object)
  export function IsString(...args: any[]): PropertyDecorator;
  export function IsNotEmpty(...args: any[]): PropertyDecorator;
  export function IsOptional(...args: any[]): PropertyDecorator;
  export function IsNumber(...args: any[]): PropertyDecorator;
  export function IsEnum(...args: any[]): PropertyDecorator;
  export function IsArray(...args: any[]): PropertyDecorator;
  export function IsBoolean(...args: any[]): PropertyDecorator;
  export function IsDate(...args: any[]): PropertyDecorator;
  export function Length(...args: any[]): PropertyDecorator;
  export function MinLength(...args: any[]): PropertyDecorator;
  export function MaxLength(...args: any[]): PropertyDecorator;
  export function Min(...args: any[]): PropertyDecorator;
  export function Max(...args: any[]): PropertyDecorator;
  export function ArrayMinSize(...args: any[]): PropertyDecorator;
  export function ArrayMaxSize(...args: any[]): PropertyDecorator;
  export function IsEmail(...args: any[]): PropertyDecorator;
  export function Matches(...args: any[]): PropertyDecorator;
  export function ValidateNested(...args: any[]): PropertyDecorator;
  export function IsUUID(...args: any[]): PropertyDecorator;
  export function IsInt(...args: any[]): PropertyDecorator;
  export function IsPositive(...args: any[]): PropertyDecorator;
  export function IsNegative(...args: any[]): PropertyDecorator;
  export function IsDateString(...args: any[]): PropertyDecorator;
  export function IsDefined(...args: any[]): PropertyDecorator;
  export function IsNotEmptyObject(...args: any[]): PropertyDecorator;
  export function IsObject(...args: any[]): PropertyDecorator;
  export function IsIn(...args: any[]): PropertyDecorator;
  export function IsNotIn(...args: any[]): PropertyDecorator;
  export function IsUrl(...args: any[]): PropertyDecorator;
  export function ValidateIf(...args: any[]): PropertyDecorator;
  
  // Validation functions
  export function validate(object: object, validatorOptions?: any): Promise<any[]>;
  export function validateOrReject(object: object, validatorOptions?: any): Promise<void>;
  export function validateSync(object: object, validatorOptions?: any): any[];
  
  // Validation error types
  export interface ValidationError {
    target?: object;
    property: string;
    value?: any;
    constraints?: { [type: string]: string };
    children?: ValidationError[];
    contexts?: { [type: string]: any };
  }
}

