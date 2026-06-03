import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import {
  formatAdmissionDeadline,
  formatMoney,
  getYearFromTimestamp,
  isPaymentSchedulePerYear
} from '@/utils/helperFunctions';
import clockIcon from '@public/assets/svg/timer.svg';
import calendarIcon from '@public/assets/svg/calendar.svg';
import primaryCalendarIcon from '@public/assets/svg/calendar-primary.svg';
import seatsIcon from '@public/assets/svg/people.svg';

export type ProgramDetailsInfoItem = {
  icon: StaticImport;
  subtitle: string;
  title: string;
  hasDatePassed?: boolean;
};

export type AboutUniItem = {
  title?: string;
  subtitle: string;
  link?: string;
};

export type ProgramOverviewItem = {
  title: string;
  subtitle: string;
};

export type FeeDataItem = {
  id: number;
  label: string;
  amount: string;
  description: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildAdmissionProgramViewModel(programDetails: any) {
  const tuitionFee = programDetails?.fee_structure;
  const campus = programDetails?.admission?.campus;
  const { city = '', country = '' } = campus?.address || {};
  const {
    mode_of_study = '',
    degree_level = '',
    major = '',
    name = ''
  } = programDetails?.program ?? {};
  const {
    available_seats = '',
    admission_deadline = '',
    admission_startdate = '',
    admission_title = ''
  } = programDetails?.admission ?? {};
  const { admission_requirements = [] } = programDetails || {};

  const receivingApplications =
    programDetails?.receiving_applications &&
    programDetails?.receiving_applications !== 'inherit'
      ? programDetails?.receiving_applications
      : programDetails?.admission?.receiving_applications;

  const progRec = programDetails?.receiving_applications;
  const admRec = programDetails?.admission?.receiving_applications;

  const isNotAccepting =
    progRec === 'inherit'
      ? admRec === 'false' || admRec === false
      : progRec === 'false' ||
        progRec === false ||
        admRec === 'false' ||
        admRec === false;

  const affiliationsRaw =
    programDetails?.admission?.university?.affiliations ?? '—';
  const affiliationsTitle =
    affiliationsRaw.length > 35
      ? `${affiliationsRaw.slice(0, 35)}...`
      : affiliationsRaw;

  const aboutUni: AboutUniItem[] = [
    {
      title: programDetails?.admission?.university?.ranking,
      subtitle: 'HEC Ranking'
    },
    {
      title: programDetails?.admission?.campus?.name,
      subtitle: 'Campus',
      link: `/universities/${city}/${programDetails?.admission?.campus?.slug}`
    },
    {
      title: affiliationsTitle,
      subtitle: 'Affiliated by'
    },
    {
      title: getYearFromTimestamp(
        programDetails?.admission?.university?.founded
      ),
      subtitle: 'Founded In'
    }
  ];

  const program = programDetails?.program;
  const deadline = formatAdmissionDeadline(admission_deadline);
  const startDate = formatAdmissionDeadline(admission_startdate);

  const currentDate = new Date();
  const deadlineDate = admission_deadline ? new Date(admission_deadline) : null;
  const startDateDate = admission_startdate
    ? new Date(admission_startdate)
    : null;

  const isDeadlineIncoming = deadlineDate ? deadlineDate > currentDate : false;
  const isStartDateIncoming = startDateDate
    ? startDateDate > currentDate
    : false;

  const isEndDateExpired = deadlineDate !== null && deadlineDate < currentDate;

  const getDateItems = (): ProgramDetailsInfoItem[] => {
    const hasStartDate = !!admission_startdate;
    const hasDeadline = !!admission_deadline;

    if (isNotAccepting && !hasStartDate && !hasDeadline) {
      return [];
    }

    if (hasStartDate && hasDeadline) {
      if (isStartDateIncoming && isDeadlineIncoming) {
        return [
          {
            icon: isStartDateIncoming ? primaryCalendarIcon : calendarIcon,
            title: startDate.formattedDate,
            subtitle: 'Starting date'
          },
          {
            icon: isDeadlineIncoming ? primaryCalendarIcon : calendarIcon,
            title: deadline.formattedDate,
            subtitle: 'Deadline'
          }
        ];
      }
      return [
        {
          icon: isDeadlineIncoming ? primaryCalendarIcon : calendarIcon,
          title: deadline.formattedDate,
          subtitle: 'Deadline'
        }
      ];
    }

    if (hasStartDate && !hasDeadline) {
      return [
        {
          icon: isStartDateIncoming ? primaryCalendarIcon : calendarIcon,
          title: startDate.formattedDate,
          subtitle: 'Starting date'
        },
        {
          icon: calendarIcon,
          title: 'Coming Soon',
          subtitle: 'Deadline'
        }
      ];
    }

    if (!hasStartDate && hasDeadline) {
      return [
        {
          icon: isDeadlineIncoming ? primaryCalendarIcon : calendarIcon,
          title: deadline.formattedDate,
          subtitle: 'Deadline'
        }
      ];
    }

    return [
      {
        icon: calendarIcon,
        title: 'Coming Soon',
        subtitle: 'Deadline'
      }
    ];
  };

  const infoItems: ProgramDetailsInfoItem[] = [
    {
      icon: clockIcon,
      title: program?.credit_hours,
      subtitle: 'Credit hours'
    },
    {
      icon: clockIcon,
      title: program?.duration || '48 Months',
      subtitle: 'Program duration'
    },
    ...getDateItems(),
    {
      icon: seatsIcon,
      title: programDetails?.available_seats || available_seats,
      subtitle: 'Available Seats'
    }
  ];

  const programInfo: ProgramOverviewItem[] = [
    { title: degree_level, subtitle: 'Study Level' },
    { title: mode_of_study, subtitle: 'Study Mode' },
    { title: major, subtitle: 'Main Subject' }
  ];

  const logo = programDetails?.admission?.university?.logo_url;
  const universityTitle = programDetails?.admission?.university?.name;
  const isPerYear = isPaymentSchedulePerYear(tuitionFee?.payment_schedule);

  const feeData: FeeDataItem[] = tuitionFee?.tuition_fee
    ? [
        {
          id: 1,
          label: isPerYear ? 'First Year' : 'First Semester',
          amount: `${formatMoney(Number.parseInt(tuitionFee?.first_semester_fee || tuitionFee?._preview_first_semester_total, 10))}`,
          description: `The ${isPerYear ? 'yearly' : 'semester'} fee is a recurring charge paid by students at the beginning of each academic ${isPerYear ? 'year' : 'semester'} or term.`
        }
      ]
    : [];

  const feeSummaryAmount = tuitionFee?.tuition_fee
    ? `${formatMoney(Number.parseInt(tuitionFee?.first_semester_fee || tuitionFee?._preview_first_semester_total, 10))}`
    : 'Will Update Soon';

  const isRichTextRequirements =
    admission_requirements.length > 0 &&
    typeof admission_requirements[0]?.value !== 'string';

  return {
    hero: {
      uniLogo: logo?.startsWith('https') ? logo : '',
      campusImage: campus?.logo_url ?? '',
      title: name || admission_title,
      address: `${universityTitle}, ${city}, ${country}`
    },
    breadcrumbs: {
      programTitle: name || admission_title,
      universityTitle,
      city,
      campusSlug: programDetails?.admission?.campus?.slug
    },
    infoItems,
    aboutUni,
    programInfo,
    programOverviewTitle: name || admission_title,
    admissionRequirements: admission_requirements,
    isRichTextRequirements,
    feeData,
    feeSummaryAmount,
    feeSummaryLabel: isPerYear ? 'First Year' : 'First Semester',
    apply: {
      was_redirected: programDetails?.was_redirected ?? false,
      is_already_applied: programDetails?.is_already_applied ?? false,
      c_id: programDetails?.admission?.campus_id ?? '',
      programId: programDetails?.program?._id ?? '',
      admissionId: programDetails?.admission?._id ?? '',
      admissionProgramId: programDetails?._id ?? '',
      receivingApplications,
      admissionStartDate: admission_startdate,
      admissionEndDate: admission_deadline,
      disabled: isEndDateExpired || isNotAccepting || !receivingApplications,
      universityId: programDetails?.admission?.university_id,
      departmentId: programDetails?.program?.academic_departments
    }
  };
}
