import { Transform, TransformFnParams } from 'class-transformer';

/**
 * Transforms a string or boolean value to a boolean.
 * Handles query parameter strings like 'true', 'false', '1', '0', etc.
 * @returns Decorator function
 * @example
 *
 * ```ts
 * @IsOptional()
 * @TransformToBoolean()
 * @IsBoolean()
 * includeZeroApplicants?: boolean;
 * ```
 */
export function TransformToBoolean() {
    return function (target: any, key: string) {
        Transform(({ value }: TransformFnParams) => {
            // If already a boolean, return as is
            if (typeof value === 'boolean') {
                return value;
            }

            // If undefined or null, return undefined
            if (value === undefined || value === null) {
                return undefined;
            }

            // Convert string to boolean
            // 'true', '1' -> true
            // 'false', '0', '' -> false
            const stringValue = String(value).toLowerCase().trim();

            if (stringValue === 'true' || stringValue === '1') {
                return true;
            }

            if (stringValue === 'false' || stringValue === '0' || stringValue === '') {
                return false;
            }

            // Default to false for any other value
            return false;
        })(target, key);
    };
}

