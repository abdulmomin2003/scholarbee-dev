import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * When both min_percent and max_percent are present as numbers, requires min <= max.
 */
@ValidatorConstraint({ name: 'marksPercentOrder', async: false })
export class MarksPercentOrderConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const o = args.object as {
      min_percent?: number | null;
      max_percent?: number | null;
    };
    const min = o?.min_percent;
    const max = o?.max_percent;
    if (min == null || max == null) {
      return true;
    }
    if (typeof min !== 'number' || typeof max !== 'number') {
      return true;
    }
    return min <= max;
  }

  defaultMessage(): string {
    return 'min_percent cannot be greater than max_percent';
  }
}
