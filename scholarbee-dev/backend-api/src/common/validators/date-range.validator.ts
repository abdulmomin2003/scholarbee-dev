import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';

// Custom validator to ensure from <= to for date ranges
export function IsDateRangeValid(propertyFrom: string, propertyTo: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isDateRangeValid',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [propertyFrom, propertyTo],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [fromKey, toKey] = args.constraints;
                    const from = (args.object as any)[fromKey];
                    const to = (args.object as any)[toKey];

                    let fromDate: Date | undefined;
                    let toDate: Date | undefined;

                    if (from) {
                        if (from instanceof Date) {
                            fromDate = from;
                        } else {
                            const parsed = new Date(from);
                            if (!isNaN(parsed.getTime())) {
                                fromDate = parsed;
                            }
                        }
                    }

                    if (to) {
                        if (to instanceof Date) {
                            toDate = to;
                        } else {
                            const parsed = new Date(to);
                            if (!isNaN(parsed.getTime())) {
                                toDate = parsed;
                            }
                        }
                    }

                    if (fromDate && toDate) {
                        return fromDate <= toDate;
                    }
                    // If either is missing or invalid, skip this validation (let other validators handle invalid dates)
                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    const [fromKey, toKey] = args.constraints;
                    return `${fromKey} must be less than or equal to ${toKey}`;
                },
            },
        });
    };
}

