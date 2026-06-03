import type { FAQItem } from '@/app/programs/(pageComponents)/ProgramListingFAQ';

export function getCityListingIntroParagraphs(cityName: string): string[] {
  return [
    `${cityName} is home to a wide range of HEC-recognized universities and campuses, offering programs across disciplines. Whether you are looking for undergraduate or postgraduate studies, the city provides multiple options to match your goals.`,
    `Students in ${cityName} benefit from access to libraries, research facilities, and industry links. Many institutions offer scholarships and financial aid; check each university's website for eligibility and deadlines.`,
    `Use the listing below to explore campuses, compare programs, and visit official admission portals. Always confirm fee structures and entry requirements directly with the institution.`
  ];
}

export const UNIVERSITIES_MASTER_FAQ: FAQItem[] = [
  {
    question: 'How do I find universities in Pakistan?',
    answer:
      'Use this page to browse all HEC-recognized universities and campuses. You can filter by city or search by name to find the right institution for you.'
  },
  {
    question: 'Are all listed universities HEC recognized?',
    answer:
      'ScholarBee focuses on HEC-recognized institutions. Always confirm current recognition status on the HEC website or with the university directly.'
  },
  {
    question: 'Can I compare universities?',
    answer:
      'Yes. Use the Compare Universities tool on ScholarBee to compare campuses side by side. You can also shortlist favorites and view program offerings.'
  },
  {
    question: 'How do I apply to a university?',
    answer:
      'Each university has its own admission process and deadlines. Use the campus cards to visit official websites or contact the institution for application details.'
  }
];

/** FAQ items for city listing page, including a city-specific question. */
export function getUniversitiesCityFAQ(cityName: string): FAQItem[] {
  return [
    {
      question: `How many HEC recognized universities are in ${cityName}?`,
      answer: `The number of HEC-recognized universities and campuses in ${cityName} is shown in the listing above. You can use the search and filters to explore them. For the latest count, refer to the HEC official directory.`
    },
    {
      question: `Why study in ${cityName}?`,
      answer: `${cityName} hosts a range of universities offering diverse programs, from engineering and medicine to business and arts. Students benefit from the city's academic environment, facilities, and career opportunities.`
    },
    {
      question: 'How do I apply to universities in this city?',
      answer:
        'Each university sets its own admission schedule and requirements. Click on a campus card to visit its website or contact the institution for application forms and deadlines.'
    }
  ];
}
