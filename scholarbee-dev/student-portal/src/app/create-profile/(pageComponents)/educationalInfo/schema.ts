import { z } from 'zod';

// Individual field validation functions for better error handling
const validateMarks = (value: string, fieldType: 'total' | 'obtained') => {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      message: `${fieldType === 'total' ? 'Total' : 'Obtained'} Marks is required`
    };
  }

  // Clean the value to handle any edge cases
  const cleanValue = value.toString().trim();

  // Check for invalid patterns like "000", "00", multiple leading zeros, etc.
  if (/^0{2,}$/.test(cleanValue)) {
    return {
      isValid: false,
      message: `${fieldType === 'total' ? 'Total' : 'Obtained'} Marks cannot be entered as ${cleanValue}. Please enter a valid marks value`
    };
  }

  const num = parseFloat(cleanValue);

  if (isNaN(num)) {
    return {
      isValid: false,
      message: `${fieldType === 'total' ? 'Total' : 'Obtained'} Marks must be a valid number`
    };
  }

  if (num % 1 !== 0) {
    return {
      isValid: false,
      message: `${fieldType === 'total' ? 'Total' : 'Obtained'} Marks must be a whole number`
    };
  }

  const minValue = fieldType === 'total' ? 100 : 0;
  const maxValue = 1100;

  if (num < minValue || num > maxValue) {
    return {
      isValid: false,
      message: `${fieldType === 'total' ? 'Total' : 'Obtained'} Marks must be between ${minValue} and ${maxValue}`
    };
  }

  return { isValid: true, message: '' };
};

const validateGPA = (value: string, fieldType: 'total' | 'obtained') => {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      message: `${fieldType === 'total' ? 'Total' : 'Obtained'} GPA is required`
    };
  }

  // Clean the value to handle any edge cases
  const cleanValue = value.toString().trim();

  // Check for invalid patterns like "000", "00", multiple leading zeros, etc.
  if (/^0{2,}$/.test(cleanValue) || /^0{2,}\.0*$/.test(cleanValue)) {
    return {
      isValid: false,
      message: `${fieldType === 'total' ? 'Total' : 'Obtained'} GPA cannot be entered as ${cleanValue}. Please enter a valid GPA value`
    };
  }

  const num = parseFloat(cleanValue);
  if (isNaN(num)) {
    return {
      isValid: false,
      message: `${fieldType === 'total' ? 'Total' : 'Obtained'} GPA must be a valid number`
    };
  }

  // For total GPA, 0 is never valid (must be > 0)
  if (fieldType === 'total' && num <= 0) {
    return {
      isValid: false,
      message: 'Total GPA must be greater than 0'
    };
  }

  // For obtained GPA, allow 0 but not negative values
  if (fieldType === 'obtained' && num < 0) {
    return {
      isValid: false,
      message: 'Obtained GPA cannot be negative'
    };
  }

  if (num > 5) {
    return {
      isValid: false,
      message: `${fieldType === 'total' ? 'Total' : 'Obtained'} GPA must be between 0.0 and 5.0`
    };
  }

  const decimalPart = cleanValue.split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    return {
      isValid: false,
      message: `${fieldType === 'total' ? 'Total' : 'Obtained'} GPA can have maximum 2 decimal places`
    };
  }

  return { isValid: true, message: '' };
};

const validateComparison = (
  total: string,
  obtained: string,
  isMarks: boolean
) => {
  if (!total || !obtained) return { isValid: true, message: '' };

  const totalNum = parseFloat(total);
  const obtainedNum = parseFloat(obtained);

  if (isNaN(totalNum) || isNaN(obtainedNum))
    return { isValid: true, message: '' };

  if (obtainedNum > totalNum) {
    return {
      isValid: false,
      message: isMarks
        ? 'Obtained Marks cannot be greater than Total Marks'
        : 'Obtained GPA cannot be greater than Total GPA'
    };
  }

  return { isValid: true, message: '' };
};

export const educationalBackgroundSchema = z.object({
  educational_backgrounds: z
    .array(
      z
        .object({
          education_level: z.string().min(1, 'Education Level is required'),
          school_college_university: z
            .string()
            .min(1, 'School/College is required'),
          field_of_study: z.string().min(1, 'Field of Study is required'),
          marks_gpa: z.object({
            total_marks_gpa: z.string().min(1, 'Total Marks/GPA is required'),
            obtained_marks_gpa: z
              .string()
              .min(1, 'Obtained Marks/GPA is required')
          }),
          year_of_passing: z.string().min(1, 'Year of Passing is required'),
          board: z.string(),
          transcript: z.string().min(1, 'Transcript is required')
        })
        .refine(
          (data) => {
            const educationLevel = data.education_level;
            const isMarksLevel = ['Matriculation', 'Intermediate'].includes(
              educationLevel
            );
            const isGPALevel = ['Bachelors', 'Masters', 'PhD'].includes(
              educationLevel
            );

            if (!isMarksLevel && !isGPALevel) {
              return true; // Skip validation if education level is not set
            }

            const { total_marks_gpa, obtained_marks_gpa } = data.marks_gpa;

            if (isMarksLevel) {
              // Validate marks
              const totalValidation = validateMarks(total_marks_gpa, 'total');
              const obtainedValidation = validateMarks(
                obtained_marks_gpa,
                'obtained'
              );

              if (!totalValidation.isValid || !obtainedValidation.isValid) {
                return false;
              }

              // Enhanced comparison validation
              const comparisonValidation = validateComparison(
                total_marks_gpa,
                obtained_marks_gpa,
                true
              );
              if (!comparisonValidation.isValid) {
                return false;
              }
            } else if (isGPALevel) {
              // Validate GPA
              const totalValidation = validateGPA(total_marks_gpa, 'total');
              const obtainedValidation = validateGPA(
                obtained_marks_gpa,
                'obtained'
              );

              if (!totalValidation.isValid || !obtainedValidation.isValid) {
                return false;
              }

              // Enhanced comparison validation
              const comparisonValidation = validateComparison(
                total_marks_gpa,
                obtained_marks_gpa,
                false
              );
              if (!comparisonValidation.isValid) {
                return false;
              }
            }

            return true;
          },
          (data) => {
            const educationLevel = data.education_level;
            const isMarksLevel = ['Matriculation', 'Intermediate'].includes(
              educationLevel
            );
            const isGPALevel = ['Bachelors', 'Masters', 'PhD'].includes(
              educationLevel
            );

            if (!isMarksLevel && !isGPALevel) {
              return { message: 'Please select a valid education level' };
            }

            const { total_marks_gpa, obtained_marks_gpa } = data.marks_gpa;

            if (isMarksLevel) {
              // Check total marks
              const totalValidation = validateMarks(total_marks_gpa, 'total');
              if (!totalValidation.isValid) {
                return {
                  message: totalValidation.message,
                  path: ['marks_gpa', 'total_marks_gpa']
                };
              }

              // Check obtained marks
              const obtainedValidation = validateMarks(
                obtained_marks_gpa,
                'obtained'
              );
              if (!obtainedValidation.isValid) {
                return {
                  message: obtainedValidation.message,
                  path: ['marks_gpa', 'obtained_marks_gpa']
                };
              }

              // Enhanced comparison validation
              const comparisonValidation = validateComparison(
                total_marks_gpa,
                obtained_marks_gpa,
                true
              );
              if (!comparisonValidation.isValid) {
                return {
                  message: comparisonValidation.message,
                  path: ['marks_gpa', 'obtained_marks_gpa']
                };
              }
            } else if (isGPALevel) {
              // Check total GPA
              const totalValidation = validateGPA(total_marks_gpa, 'total');
              if (!totalValidation.isValid) {
                return {
                  message: totalValidation.message,
                  path: ['marks_gpa', 'total_marks_gpa']
                };
              }

              // Check obtained GPA
              const obtainedValidation = validateGPA(
                obtained_marks_gpa,
                'obtained'
              );
              if (!obtainedValidation.isValid) {
                return {
                  message: obtainedValidation.message,
                  path: ['marks_gpa', 'obtained_marks_gpa']
                };
              }

              // Enhanced comparison validation
              const comparisonValidation = validateComparison(
                total_marks_gpa,
                obtained_marks_gpa,
                false
              );
              if (!comparisonValidation.isValid) {
                return {
                  message: comparisonValidation.message,
                  path: ['marks_gpa', 'obtained_marks_gpa']
                };
              }
            }

            return {
              message:
                'Invalid marks/GPA values for the selected education level'
            };
          }
        )
        .refine(
          (data) => {
            // Check if board is required and provided
            const educationLevel = data.education_level;
            const requiresBoard = ['Matriculation', 'Intermediate'].includes(
              educationLevel
            );

            if (requiresBoard && (!data.board || data.board.trim() === '')) {
              return false;
            }

            return true;
          },
          () => {
            return {
              message:
                'Board is required for Matriculation and Intermediate education levels',
              path: ['board']
            };
          }
        )
    )
    .refine((backgrounds) => {
      // Sort backgrounds by education level to ensure chronological order
      const orderedLevels = [
        'Matriculation',
        'Intermediate',
        'Bachelors',
        'Masters',
        'PhD'
      ];

      for (let i = 1; i < backgrounds.length; i++) {
        const prevBackground = backgrounds[i - 1];
        const currentBackground = backgrounds[i];

        const prevYear = parseInt(prevBackground.year_of_passing);
        const currentYear = parseInt(currentBackground.year_of_passing);

        // Get education level indices for comparison
        const prevLevelIndex = orderedLevels.indexOf(
          prevBackground.education_level
        );
        const currentLevelIndex = orderedLevels.indexOf(
          currentBackground.education_level
        );

        // If current level is higher in sequence, year should be at least 2 years after
        if (currentLevelIndex > prevLevelIndex && currentYear <= prevYear + 1) {
          return false;
        }
      }
      return true;
    }, 'Higher education years must be at least 2 years after previous education')
});

export type FormData = z.infer<typeof educationalBackgroundSchema>;
