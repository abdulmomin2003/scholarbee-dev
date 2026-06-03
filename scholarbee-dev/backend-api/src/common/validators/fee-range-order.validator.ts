import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * When both min and max are present as numbers, requires min <= max.
 */
@ValidatorConstraint({ name: 'feeRangeOrder', async: false })
export class FeeRangeOrderConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const o = args.object as {
      min?: number | null;
      max?: number | null;
    };
    const min = o?.min;
    const max = o?.max;
    if (min == null || max == null) {
      return true;
    }
    if (typeof min !== 'number' || typeof max !== 'number') {
      return true;
    }
    return min <= max;
  }

  defaultMessage(): string {
    return 'min cannot be greater than max';
  }
}
