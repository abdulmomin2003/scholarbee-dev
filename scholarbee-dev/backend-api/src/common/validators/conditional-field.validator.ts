import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

interface ConditionalValidationOptions {
  conflictingFields?: string[]; // Fields that, when present, should NOT allow this field
  requiredFields?: string[]; // Fields that must be present for this field to be valid
}

export function IsConditionallyValid(
  options: ConditionalValidationOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isConditionallyValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;

          // Check for conflicting fields (mutual exclusivity)
          if (options.conflictingFields) {
            const hasConflictingFields = options.conflictingFields.some(
              (field) => obj[field] !== undefined && obj[field] !== null,
            );

            // If conflicting fields are provided, this field should NOT be provided
            if (hasConflictingFields) {
              return value === undefined || value === null;
            }
          }

          // Check for required fields (dependencies)
          if (options.requiredFields) {
            const hasAllRequiredFields = options.requiredFields.every(
              (field) => obj[field] !== undefined && obj[field] !== null,
            );

            // If this field is provided, all required fields must also be provided
            if (
              value !== undefined &&
              value !== null &&
              !hasAllRequiredFields
            ) {
              return false;
            }
          }

          // If no conflicts and no requirements, or all conditions are met
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const messages: string[] = [];

          if (options.conflictingFields) {
            const conflictingFieldsStr = options.conflictingFields.join(' or ');
            messages.push(
              `${args.property} cannot be used when ${conflictingFieldsStr} is provided`,
            );
          }

          if (options.requiredFields) {
            const requiredFieldsStr = options.requiredFields.join(' and ');
            messages.push(
              `${args.property} requires ${requiredFieldsStr} to be provided`,
            );
          }

          return messages.join('. ') + '.';
        },
      },
    });
  };
}
