/**
 * Matriculation and Intermediate share the same Field of Study list (static).
 * Bachelors+ use majors from API — same as programs listing filter (`useGetMajorsQuery`).
 */
export const MATRIC_INTERMEDIATE_FIELD_OF_STUDY_OPTIONS = [
  { value: 'Science', label: 'Science' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Pre-Medical', label: 'Pre-Medical' },
  { value: 'Pre-Engineering', label: 'Pre-Engineering' },
  { value: 'ICS', label: 'ICS' },
  { value: 'Commerce', label: 'Commerce' }
];

export const EDUCATIONAL_BG_FIELDS = [
  {
    name: 'education_level',
    label: 'Education Level',
    type: 'select',
    value: '',
    options: [
      { value: 'Matriculation', label: 'Matriculation' },
      { value: 'Intermediate', label: 'Intermediate' },
      { value: 'Bachelors', label: 'Bachelors' },
      { value: 'Masters', label: 'Masters' },
      { value: 'Doctorate', label: 'PhD' }
    ],
    required: true,
    placeholder: 'Select your education level'
  },
  {
    name: 'school_college_university',
    label: 'School/College/University',
    type: 'text',
    value: '',
    required: true,
    placeholder: 'Enter your school/college/university'
  },
  {
    name: 'field_of_study',
    label: 'Field of Study',
    type: 'select',
    value: '',
    required: true,
    placeholder: 'Select your field of study'
  },
  {
    name: 'marks_gpa',
    label: 'Marks/GPA',
    type: 'number',
    value: '',
    doubleFields: [
      { name: 'total_marks_gpa', placeholder: 'Total Marks/GPA' },
      { name: 'obtained_marks_gpa', placeholder: 'Obtained Marks/GPA' }
    ],
    required: true,
    isDouble: true
  },
  {
    name: 'year_of_passing',
    label: 'Year of Passing',
    type: 'select',
    value: '',
    required: true,
    placeholder: 'Select your year of passing'
  },
  {
    name: 'board',
    label: 'Board',
    type: 'text',
    value: '',
    required: true,
    placeholder: 'Enter your board'
  },
  {
    name: 'transcript',
    label: 'Transcript',
    type: 'file',
    value: '',
    required: true,
    fullWidth: true,
    placeholder: 'Upload Transcript'
  }
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getYearOptions = (index: number, allEducation: any[]) => {
  const currentYear = new Date().getFullYear();
  const currentLevel = allEducation[index]?.education_level;
  const prevLevel = index > 0 ? allEducation[index - 1] : null;
  const prevYear = prevLevel ? parseInt(prevLevel.year_of_passing) : 0;

  const orderedLevels = [
    'Matriculation',
    'Intermediate',
    'Bachelors',
    'Masters',
    'PhD'
  ];
  const currentLevelIndex = orderedLevels.indexOf(currentLevel);
  const prevLevelIndex = prevLevel
    ? orderedLevels.indexOf(prevLevel.education_level)
    : -1;

  let startYear = currentYear - 15;
  const endYear = currentYear;

  // If there's a previous level and current level is higher
  if (prevLevel && currentLevelIndex > prevLevelIndex) {
    startYear = prevYear + 2; // Must be at least 2 years after previous education
  }

  return Array.from({ length: endYear - startYear + 1 }, (_, i) => {
    const year = startYear + i;
    return { value: year.toString(), label: year.toString() };
  }).sort((a, b) => parseInt(b.value) - parseInt(a.value)); // Sort in descending order
};
