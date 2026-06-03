import { ComparisonCriteria } from './types';

export const COMPARISON_CRITERIA: ComparisonCriteria[] = [
  {
    id: 'location',
    label: 'Location',
    key: 'campusAddress',
    formatValue: (address) => `${address.city}, ${address.country}`
  },
  { id: 'university', label: 'University Name', key: 'universityName' },
  { id: 'programName', label: 'Program Name', key: 'programName' },
  { id: 'major', label: 'Major', key: 'major' },
  { id: 'duration', label: 'Duration', key: 'duration' },
  { id: 'creditHours', label: 'Credit Hours', key: 'creditHours' },
  { id: 'degreeLevel', label: 'Degree Level', key: 'degreeLevel' },
  { id: 'studyMode', label: 'Mode of Study', key: 'modeOfStudy' },
  { id: 'language', label: 'Language', key: 'languageOfInstruction' },
  { id: 'campus', label: 'Campus', key: 'campusName' },
  {
    id: 'ranking',
    label: 'University Ranking',
    key: 'universityRanking',
    formatValue: (value) => value || 'Will Update Soon'
  },
  // {
  //   id: 'tuitionFee',
  //   label: 'Tuition Fee',
  //   key: 'totalFirstSemesterFee',
  //   formatValue: (value) =>
  //     value ? `PKR ${value.toLocaleString()}` : 'Will Update Soon'
  // },
  // {
  //   id: 'applicationFee',
  //   label: 'Application Fee',
  //   key: 'totalApplicationFee',
  //   formatValue: (value) =>
  //     value ? `PKR ${value.toLocaleString()}` : 'Will Update Soon'
  // },
  {
    id: 'semesterFee',
    label: 'Per Semester Fee',
    key: 'totalRegularSemesterFee',
    formatValue: (value) =>
      value ? `PKR ${value.toLocaleString()}` : 'Will Update Soon'
  }
];
