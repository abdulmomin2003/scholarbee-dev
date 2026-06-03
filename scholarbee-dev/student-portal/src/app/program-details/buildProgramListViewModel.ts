import {
  formatMoney,
  getYearFromTimestamp,
  isPaymentSchedulePerYear
} from '@/utils/helperFunctions';
import clockIcon from '@public/assets/svg/timer.svg';
import type {
  ProgramDetailsInfoItem,
  AboutUniItem,
  ProgramOverviewItem,
  FeeDataItem
} from './buildAdmissionProgramViewModel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildProgramListViewModel(programDetails: any) {
  const {
    university,
    campus,
    degree_level = '',
    major = '',
    mode_of_study = '',
    credit_hours = '',
    duration = '',
    fee_structure = {},
    name: programName = ''
  } = programDetails || {};

  const {
    name: universityName = '',
    ranking = '',
    founded = '',
    affiliations = '',
    slug: universitySlug = ''
  } = university || {};

  const {
    slug: campusSlug = '',
    city = '',
    country = '',
    image = ''
  } = campus || {};

  const {
    payment_schedule = '',
    first_semester_fee = '',
    _preview_first_semester_total = '',
    tuition_fee
  } = fee_structure;

  const aboutUni: AboutUniItem[] = [
    { title: ranking, subtitle: 'HEC Ranking' },
    {
      title: universityName,
      subtitle: 'Campus',
      link: `/universities/${city}/${campusSlug || universitySlug}`
    },
    { title: affiliations, subtitle: 'Affiliated by' },
    { title: getYearFromTimestamp(founded), subtitle: 'Founded In' }
  ];

  const infoItems: ProgramDetailsInfoItem[] = [
    { icon: clockIcon, title: credit_hours, subtitle: 'Credit hours' },
    { icon: clockIcon, title: duration, subtitle: 'Program duration' }
  ];

  const programInfo: ProgramOverviewItem[] = [
    { title: degree_level, subtitle: 'Study Level' },
    { title: mode_of_study, subtitle: 'Study Mode' },
    { title: major, subtitle: 'Main Subject' }
  ];

  const logo = university?.logo_url;
  const isPerYear = isPaymentSchedulePerYear(payment_schedule);
  const feeAmount = first_semester_fee || _preview_first_semester_total;

  const feeData: FeeDataItem[] = feeAmount
    ? [
        {
          id: 1,
          label: isPerYear ? 'First Year' : 'First Semester',
          amount: `${formatMoney(Number.parseInt(String(feeAmount), 10))}`,
          description: `The ${isPerYear ? 'yearly' : 'semester'} fee is a recurring charge paid by students at the beginning of each academic ${isPerYear ? 'year' : 'semester'} or term.`
        }
      ]
    : [];

  const feeSummaryAmount = feeAmount
    ? `${formatMoney(Number.parseInt(String(feeAmount), 10))}`
    : 'Will Update Soon';

  return {
    hero: {
      uniLogo: logo?.startsWith('https') ? logo : '',
      campusImage: image,
      title: programName,
      address: `${universityName}, ${city}, ${country}`
    },
    breadcrumbs: {
      programTitle: programName,
      universityTitle: universityName,
      city,
      campusSlug: campusSlug || universitySlug
    },
    infoItems,
    aboutUni,
    programInfo,
    programOverviewTitle: programName,
    feeData,
    feeSummaryAmount,
    feeSummaryLabel: isPerYear ? 'First Year' : 'First Semester',
    hasTuitionFee: Boolean(tuition_fee || feeAmount)
  };
}
