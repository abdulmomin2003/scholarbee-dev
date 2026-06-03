import {
  CountryType,
  MenuItem,
  ScholarshipsFiltersKeys,
  SocialIconType
} from '@/types';
import facebookIcon from '@public/assets/svg/facebook.svg';
import instagramIcon from '@public/assets/svg/instagram.svg';
import twitterIcon from '@public/assets/svg/twitter.svg';
import linkedInIcon from '@public/assets/svg/linkedin.svg';
import settingsIcon from '@public/assets/svg/settings.svg';
import callUsIcon from '@public/assets/svg/callUs.svg';
import emailIcon from '@public/assets/svg/email.svg';
import chatbotIcon from '@public/assets/png/chatbot-bee.png';
import { getNextTenYears } from '@/utils/helperFunctions';

export { chatbotIcon };

export const carouselImages = [
  '/assets/png/cover1.jpg',
  '/assets/png/cover2.png',
  '/assets/png/cover1.jpg',
  '/assets/png/cover2.png'
];

export const VIDEO_DATA = [
  {
    name: 'University',
    imageUrl: '/assets/png/hero-thumbnails/1.png',
    videoUrl: 'https://www.youtube.com/watch?v=svkgtnGonsU',
    title: 'Why Choose Scholar Bee?',
    description:
      'Your one-stop platform for simplifying admissions and discovering scholarships. Achieve more with less stress.'
  },
  {
    focused: true,
    name: 'ScholarBee',
    imageUrl: '/assets/png/hero-thumbnails/2.png',
    videoUrl: 'https://youtu.be/Lj4dvruEGvA?si=r3vYhSLEkQsbSQBw',
    title: 'How Does ScholarBee Work?',
    description:
      'We connect your goals with top universities, simplifying every step of the admission process.'
  },
  {
    name: 'Student',
    imageUrl: '/assets/png/hero-thumbnails/3.png',
    videoUrl: 'https://www.youtube.com/watch?v=VcL6qGFd_kk',
    title: 'How to Apply?',
    description:
      '50+ top universities and their application forms just a click away. ScholarBee provides you with multiple options all in one place! '
  }
];

export const dropdownOptions = [
  {
    value: '1',
    label: 'Not Identified'
  },
  {
    value: '2',
    label: 'Closed'
  },
  {
    value: '3',
    label: 'Communicated'
  },
  {
    value: '4',
    label: 'Identified'
  },
  {
    value: '5',
    label: 'Resolved'
  },
  {
    value: '6',
    label: 'Cancelled'
  }
];

export const imageWidth = [182, 270, 170, 262];

export const PROGRAMS_DATA = [
  {
    id: 1,
    title:
      'Bachelor of Arts and Bachelor of Computer and Information Sciences Conjoint programs',
    location: 'New York City, USA',
    rating: 4.0,
    deadline: '24-11-2024',
    fee: '20000',
    studyMode: 'Online',
    isScholarshipAvailable: false,
    imageUrl: '/assets/png/program1.png'
  },
  {
    id: 2,
    title: 'Masters of Applied Physics and Atomic Energy Conjoint programs',
    location: 'New York City, USA',
    rating: 4.0,
    deadline: '24-11-2024',
    fee: '20000',
    studyMode: 'Online',
    isScholarshipAvailable: true,
    imageUrl: '/assets/png/program2.png'
  },
  {
    id: 3,
    title: 'Masters of Applied Physics and Atomic Energy Conjoint programs',
    location: 'New York City, USA',
    rating: 4.0,
    deadline: '24-11-2024',
    fee: '20000',
    studyMode: 'Online',
    isScholarshipAvailable: false,
    imageUrl: '/assets/png/program3.png'
  }
];

export const STATS = [
  {
    title: 'Signups',
    value: '10,000+'
  },
  {
    title: 'Universities in Pakistan',
    value: '50+'
  },
  {
    title: 'Universities in the UAE',
    value: '10+'
  },
  {
    title: 'Programs',
    value: '4000+'
  },
  {
    title: 'Scholarships',
    value: '1000+'
  }
];

export const menuItems: MenuItem[] = [
  { key: 'explore', label: 'Home', path: '/', className: 'menuItem' },
  { key: 'features', label: 'Programs', path: '/programs' },
  { key: 'about', label: 'Scholarships', path: '/scholarships' },
  { key: 'contact', label: 'Community', path: '/community' }
];

export const RESOURCES = [
  {
    label: 'HEC',
    path: '/'
  },
  {
    label: 'Australian Embassy',
    path: '/'
  },
  {
    label: 'Pakistan Hight Commission',
    path: '/'
  },
  {
    label: 'Poland School of Languages',
    path: '/'
  }
];

export const PARTNERS = [
  {
    label: 'RIPHAH International',
    path: '/'
  },
  {
    label: 'FAST',
    path: '/'
  },
  {
    label: 'COMSATS',
    path: '/'
  }
];

export const LINKS = [
  {
    label: 'Home',
    path: '/'
  },
  {
    label: 'Programs',
    path: '/'
  },
  // {
  //   label: 'Scholarships',
  //   path: '/'
  // },
  {
    label: 'About',
    path: '/'
  },
  {
    label: 'Blogs',
    path: '/'
  }
];

export const SOCIAL_ICONS: SocialIconType[] = [
  {
    href: '/#',
    src: facebookIcon,
    alt: 'facebook icon'
  },
  { href: '/#', src: twitterIcon, alt: 'twitter icon' },
  {
    href: '/#',
    src: instagramIcon,
    alt: 'instagram icon'
  },
  { href: '/#', src: linkedInIcon, alt: 'linkedin icon' }
];

export const FOOTER_SECTIONS = [
  { title: 'Resources', items: RESOURCES },
  { title: 'Partners', items: PARTNERS },
  { title: 'Links', items: LINKS },
  {
    title: 'Contacts',
    items: [
      {
        label:
          'Meydan Grandstand, 6th floor, Meydan Road, Nad Al Sheba, Dubai, U.A.E',
        path: '#'
      },
      { label: 'Call Us: +1 23456789', path: '#' },
      { label: 'test@gmail.com', path: '#' }
    ]
  }
];

export const REVIEW_CARDS_DATA = [
  {
    key: 2,
    highlighted: false,
    reviewer: 'Taha M. – Lahore',
    review:
      'Honestly didn’t expect to love it this much. The UI is clean, the content is helpful, and it saves so much time. It’s like having a smart friend who’s always ready to help with admissions and scholarships 😅'
  },
  {
    key: 1,
    highlighted: true,
    reviewer: 'Areeba K. – Karachi',
    review:
      'ScholarBee is a total game-changer! I used their resources for my final semester, and not only were the study guides super clear, but the support team was also so responsive. Highly recommend for students who want to actually understand what they’re learning!'
  },

  {
    key: 3,
    highlighted: false,
    reviewer: 'Zoya A. – Islamabad',
    review:
      'I came across ScholarBee through a friend and now I’m hooked. From program ideas to scholarship ideas  and application —it’s got everything I needed. It makes admission less stressful and more fun.'
  }
];
export const FOOTER_LINKS = [
  { title: 'Home', link: '/' },
  { title: 'Programs', link: '/programs' },
  { title: 'Scholarships', link: '/search-scholarship' },
  { title: 'About Us', link: '/about-us' },
  { title: 'Blog', link: '/blogs' },
  { title: 'Contact Us', link: '/contact-us' }
];

export const pages = [
  { title: 'Home', link: '/' },
  { title: 'Programs', link: '/programs' },
  { title: 'Universities', link: '/universities' },
  { title: 'Scholarships', link: '/search-scholarship' }
  // { title: 'Favorites', link: '/favorites' }
  // { title: 'Community', link: '/community' }
];

export const responsiveMenu = ['Home', 'Product', 'Pricing', 'Account'];

export const TOP_UNIVERSITIES = [
  {
    value: "Sardar Bahadur Khan Women's University",
    label: "Sardar Bahadur Khan Women's University"
  },
  { value: 'COMSATS', label: 'COMSATS' },
  { value: 'Harvard', label: 'Harvard' },
  { value: 'Stanford', label: 'Stanford' },
  { value: 'MIT', label: 'MIT' },
  { value: 'Oxford', label: 'Oxford' },
  { value: 'Cambridge', label: 'Cambridge' }
];

export const PROGRAM_TYPES = [
  { label: 'Bachelors', value: 'Bachelor' },
  { label: 'Masters', value: 'Master' },
  { label: 'PhD', value: 'Phd' }
];

export const SPECIALIZATIONS = [
  {
    value: 'Architecture',
    label: 'Architecture'
  },
  {
    value: 'Fashion Design',
    label: 'Fashion Design'
  },
  {
    value: 'Graphic Design',
    label: 'Graphic Design'
  },
  {
    value: 'Fine Arts',
    label: 'Fine Arts'
  },
  {
    value: 'Early Childhood Education',
    label: 'Early Childhood Education'
  },
  {
    value: 'LAW',
    label: 'LAW'
  },
  {
    value: 'Urdu',
    label: 'Urdu'
  },
  {
    value: 'Islamic Studies',
    label: 'Islamic Studies'
  },
  {
    value: 'Philosophy',
    label: 'Philosophy'
  },
  {
    value: 'History',
    label: 'History'
  },
  {
    value: 'English',
    label: 'English'
  },
  {
    value: 'IT Management',
    label: 'IT Management'
  },
  {
    value: 'Data Science',
    label: 'Data Science'
  },
  {
    value: 'Cyber Security',
    label: 'Cyber Security'
  },
  {
    value: 'Artificial Intelligence',
    label: 'Artificial Intelligence'
  },
  {
    value: 'Environmental Sciences',
    label: 'Environmental Sciences'
  },
  {
    value: 'Biology',
    label: 'Biology'
  },
  {
    value: 'Chemistry',
    label: 'Chemistry'
  },
  {
    value: 'Physics',
    label: 'Physics'
  },
  {
    value: 'Mass Communication',
    label: 'Mass Communication'
  },
  {
    value: 'International Relations',
    label: 'International Relations'
  },
  {
    value: 'Sociology',
    label: 'Sociology'
  },
  {
    value: 'Psychology',
    label: 'Psychology'
  },
  {
    value: 'Supply Chain Management',
    label: 'Supply Chain Management'
  },
  {
    value: 'Marketing',
    label: 'Marketing'
  },
  {
    value: 'Accounting & Finance',
    label: 'Accounting & Finance'
  },
  {
    value: 'Bachelor Business Administration',
    label: 'Bachelor Business Administration'
  },
  {
    value: 'Physiotherapy',
    label: 'Physiotherapy'
  },
  {
    value: 'Pharmacy ',
    label: 'Pharmacy '
  },
  {
    value: 'Nursing',
    label: 'Nursing'
  },
  {
    value: 'Medical',
    label: 'Medical'
  },
  {
    value: 'Software',
    label: 'Software'
  },
  {
    value: 'Civil',
    label: 'Civil'
  },
  {
    value: 'Mechanical',
    label: 'Mechanical'
  },
  {
    value: 'Electrical',
    label: 'Electrical'
  },
  {
    value: 'Computer Science ',
    label: 'Computer Science '
  }
];

export const SEARCHES = [
  {
    id: 2,
    title: 'Program Type',
    name: 'degree_level',
    data: PROGRAM_TYPES
  }
  // {
  //   id: 3,
  //   name: 'major',
  //   title: 'Specialization',
  //   data: SPECIALIZATIONS
  // }
];
export const FAQ_DATA = [
  {
    id: 'faq1',
    question: 'What is ScholarBee?',
    answer:
      'ScholarBee is an online admissions platform that helps students find universities, compare programs, check fee structures, and discover scholarships across Pakistan.'
  },
  {
    id: 'faq2',
    question: 'Can I apply to multiple universities through ScholarBee?',
    answer:
      'Yes, you can explore and apply to multiple HEC-recognized universities through ScholarBee.'
  },
  {
    id: 'faq3',
    question: 'How do I find the right university for me?',
    answer:
      'You can use Scholar Bee’s filters to search for universities based on location, program, tuition fees, and other preferences to find the perfect match for your academic goals.'
  },
  {
    id: 'faq4',
    question: 'Do I need to create an account to apply?',
    answer:
      'Yes, creating an account helps ScholarBee to save your preferences and manage your applications smoothly.'
  },
  {
    id: 'faq5',
    question: 'Are there any fees for applying through ScholarBee?',
    answer: 'No. ScholarBee is completely free for students.'
  },
  {
    id: 'faq6',
    question: 'Do I need to submit documents for my application?',
    answer:
      'Some universities require documents during the process. ScholarBee will notify you whenever documents are needed.'
  },
  {
    id: 'faq7',
    question: 'Who can apply for scholarships?',
    answer:
      'Students applying for merit-based, need-based, or fully funded scholarships can apply through our portal if they meet eligibility criteria.'
  },
  {
    id: 'faq8',
    question: 'How do I contact ScholarBee for support?',
    answer:
      'You can reach us through our support email, social media pages, or by submitting a query on the platform.'
  },
  {
    id: 'faq9',
    question: 'Which universities offer need-based or HEC scholarships?',
    answer:
      'ScholarBee lists fully funded, partial, need-based, and HEC scholarships with complete eligibility details.'
  }
];
export const CONTACT_DATA = [
  {
    title: 'Call Us',
    icon: callUsIcon,
    description:
      'Keen to chat with one of our experts? Go on, we don’t bite. Give us a call on the number below.',
    buttonText: '+92 325 555 9699'
  },
  {
    title: 'Email Us',
    icon: emailIcon,
    description:
      'Email us now about any problem you face with your business. Do share your concern with us',
    buttonText: '@ Email Us Now',
    focused: true
  },
  {
    title: 'Support',
    icon: settingsIcon,
    description: `If you're an existing ScholarBee user looking for support, please contact us for any queries.`,
    buttonText: 'Open Chat',
    buttonIcon: chatbotIcon
  }
];

export const WHY_CHOOSE_US = [
  {
    id: 1,
    title: 'Comprehensive Scholarship Database',
    desc: "Our platform boasts a vast and meticulously curated database of scholarships from around the world. Whether you're seeking funding for undergraduate, graduate, or postgraduate studies, Scholarbee provides access to thousands of opportunities."
  },
  {
    id: 2,
    title: 'Personalized Matching Algorithm',
    desc: "At Scholarbee, we understand that every student is unique, with their own set of skills, interests, and aspirations. That's why we've developed a personalized matching algorithm that helps you find scholarships tailored specifically to your profile."
  },
  {
    id: 3,
    title: 'Vibrant Community Engagement',
    desc: 'Join a vibrant and supportive community of students, mentors, and experts on Scholarbee. Engage in discussions, share insights, and seek advice from peers who are navigating similar educational journeys.',
    focused: true
  },
  {
    id: 4,
    title: 'Dedicated Support and Resources',
    desc: "Navigating the world of scholarships and higher education can be overwhelming, but you don't have to do it alone. Scholarbee offers dedicated support and resources to guide you every step of the way."
  }
];

export const BLOGS_CATEGORIES = [
  'All Blogs',
  'Scholarships',
  'Admission',
  'Study Tips',
  'Career Advice'
];

export const COUNTRIES: readonly CountryType[] = [
  { code: 'AD', label: 'Andorra', phone: '376' },
  {
    code: 'AE',
    label: 'United Arab Emirates',
    phone: '971'
  },
  { code: 'AF', label: 'Afghanistan', phone: '93' },
  {
    code: 'AG',
    label: 'Antigua and Barbuda',
    phone: '1-268'
  },
  { code: 'AI', label: 'Anguilla', phone: '1-264' },
  { code: 'AL', label: 'Albania', phone: '355' },
  { code: 'AM', label: 'Armenia', phone: '374' },
  { code: 'AO', label: 'Angola', phone: '244' },
  { code: 'AQ', label: 'Antarctica', phone: '672' },
  { code: 'AR', label: 'Argentina', phone: '54' },
  { code: 'AS', label: 'American Samoa', phone: '1-684' },
  { code: 'AT', label: 'Austria', phone: '43' },
  {
    code: 'AU',
    label: 'Australia',
    phone: '61',
    suggested: true
  },
  { code: 'AW', label: 'Aruba', phone: '297' },
  { code: 'AX', label: 'Alland Islands', phone: '358' },
  { code: 'AZ', label: 'Azerbaijan', phone: '994' },
  {
    code: 'BA',
    label: 'Bosnia and Herzegovina',
    phone: '387'
  },
  { code: 'BB', label: 'Barbados', phone: '1-246' },
  { code: 'BD', label: 'Bangladesh', phone: '880' },
  { code: 'BE', label: 'Belgium', phone: '32' },
  { code: 'BF', label: 'Burkina Faso', phone: '226' },
  { code: 'BG', label: 'Bulgaria', phone: '359' },
  { code: 'BH', label: 'Bahrain', phone: '973' },
  { code: 'BI', label: 'Burundi', phone: '257' },
  { code: 'BJ', label: 'Benin', phone: '229' },
  { code: 'BL', label: 'Saint Barthelemy', phone: '590' },
  { code: 'BM', label: 'Bermuda', phone: '1-441' },
  { code: 'BN', label: 'Brunei Darussalam', phone: '673' },
  { code: 'BO', label: 'Bolivia', phone: '591' },
  { code: 'BR', label: 'Brazil', phone: '55' },
  { code: 'BS', label: 'Bahamas', phone: '1-242' },
  { code: 'BT', label: 'Bhutan', phone: '975' },
  { code: 'BV', label: 'Bouvet Island', phone: '47' },
  { code: 'BW', label: 'Botswana', phone: '267' },
  { code: 'BY', label: 'Belarus', phone: '375' },
  { code: 'BZ', label: 'Belize', phone: '501' },
  {
    code: 'CA',
    label: 'Canada',
    phone: '1',
    suggested: true
  },
  {
    code: 'CC',
    label: 'Cocos (Keeling) Islands',
    phone: '61'
  },
  {
    code: 'CD',
    label: 'Congo, Democratic Republic of the',
    phone: '243'
  },
  {
    code: 'CF',
    label: 'Central African Republic',
    phone: '236'
  },
  {
    code: 'CG',
    label: 'Congo, Republic of the',
    phone: '242'
  },
  { code: 'CH', label: 'Switzerland', phone: '41' },
  { code: 'CI', label: "Cote d'Ivoire", phone: '225' },
  { code: 'CK', label: 'Cook Islands', phone: '682' },
  { code: 'CL', label: 'Chile', phone: '56' },
  { code: 'CM', label: 'Cameroon', phone: '237' },
  { code: 'CN', label: 'China', phone: '86' },
  { code: 'CO', label: 'Colombia', phone: '57' },
  { code: 'CR', label: 'Costa Rica', phone: '506' },
  { code: 'CU', label: 'Cuba', phone: '53' },
  { code: 'CV', label: 'Cape Verde', phone: '238' },
  { code: 'CW', label: 'Curacao', phone: '599' },
  { code: 'CX', label: 'Christmas Island', phone: '61' },
  { code: 'CY', label: 'Cyprus', phone: '357' },
  { code: 'CZ', label: 'Czech Republic', phone: '420' },
  {
    code: 'DE',
    label: 'Germany',
    phone: '49',
    suggested: true
  },
  { code: 'DJ', label: 'Djibouti', phone: '253' },
  { code: 'DK', label: 'Denmark', phone: '45' },
  { code: 'DM', label: 'Dominica', phone: '1-767' },
  {
    code: 'DO',
    label: 'Dominican Republic',
    phone: '1-809'
  },
  { code: 'DZ', label: 'Algeria', phone: '213' },
  { code: 'EC', label: 'Ecuador', phone: '593' },
  { code: 'EE', label: 'Estonia', phone: '372' },
  { code: 'EG', label: 'Egypt', phone: '20' },
  { code: 'EH', label: 'Western Sahara', phone: '212' },
  { code: 'ER', label: 'Eritrea', phone: '291' },
  { code: 'ES', label: 'Spain', phone: '34' },
  { code: 'ET', label: 'Ethiopia', phone: '251' },
  { code: 'FI', label: 'Finland', phone: '358' },
  { code: 'FJ', label: 'Fiji', phone: '679' },
  {
    code: 'FK',
    label: 'Falkland Islands (Malvinas)',
    phone: '500'
  },
  {
    code: 'FM',
    label: 'Micronesia, Federated States of',
    phone: '691'
  },
  { code: 'FO', label: 'Faroe Islands', phone: '298' },
  {
    code: 'FR',
    label: 'France',
    phone: '33',
    suggested: true
  },
  { code: 'GA', label: 'Gabon', phone: '241' },
  { code: 'GB', label: 'United Kingdom', phone: '44' },
  { code: 'GD', label: 'Grenada', phone: '1-473' },
  { code: 'GE', label: 'Georgia', phone: '995' },
  { code: 'GF', label: 'French Guiana', phone: '594' },
  { code: 'GG', label: 'Guernsey', phone: '44' },
  { code: 'GH', label: 'Ghana', phone: '233' },
  { code: 'GI', label: 'Gibraltar', phone: '350' },
  { code: 'GL', label: 'Greenland', phone: '299' },
  { code: 'GM', label: 'Gambia', phone: '220' },
  { code: 'GN', label: 'Guinea', phone: '224' },
  { code: 'GP', label: 'Guadeloupe', phone: '590' },
  { code: 'GQ', label: 'Equatorial Guinea', phone: '240' },
  { code: 'GR', label: 'Greece', phone: '30' },
  {
    code: 'GS',
    label: 'South Georgia and the South Sandwich Islands',
    phone: '500'
  },
  { code: 'GT', label: 'Guatemala', phone: '502' },
  { code: 'GU', label: 'Guam', phone: '1-671' },
  { code: 'GW', label: 'Guinea-Bissau', phone: '245' },
  { code: 'GY', label: 'Guyana', phone: '592' },
  { code: 'HK', label: 'Hong Kong', phone: '852' },
  {
    code: 'HM',
    label: 'Heard Island and McDonald Islands',
    phone: '672'
  },
  { code: 'HN', label: 'Honduras', phone: '504' },
  { code: 'HR', label: 'Croatia', phone: '385' },
  { code: 'HT', label: 'Haiti', phone: '509' },
  { code: 'HU', label: 'Hungary', phone: '36' },
  { code: 'ID', label: 'Indonesia', phone: '62' },
  { code: 'IE', label: 'Ireland', phone: '353' },
  { code: 'IL', label: 'Israel', phone: '972' },
  { code: 'IM', label: 'Isle of Man', phone: '44' },
  { code: 'IN', label: 'India', phone: '91' },
  {
    code: 'IO',
    label: 'British Indian Ocean Territory',
    phone: '246'
  },
  { code: 'IQ', label: 'Iraq', phone: '964' },
  {
    code: 'IR',
    label: 'Iran, Islamic Republic of',
    phone: '98'
  },
  { code: 'IS', label: 'Iceland', phone: '354' },
  { code: 'IT', label: 'Italy', phone: '39' },
  { code: 'JE', label: 'Jersey', phone: '44' },
  { code: 'JM', label: 'Jamaica', phone: '1-876' },
  { code: 'JO', label: 'Jordan', phone: '962' },
  {
    code: 'JP',
    label: 'Japan',
    phone: '81',
    suggested: true
  },
  { code: 'KE', label: 'Kenya', phone: '254' },
  { code: 'KG', label: 'Kyrgyzstan', phone: '996' },
  { code: 'KH', label: 'Cambodia', phone: '855' },
  { code: 'KI', label: 'Kiribati', phone: '686' },
  { code: 'KM', label: 'Comoros', phone: '269' },
  {
    code: 'KN',
    label: 'Saint Kitts and Nevis',
    phone: '1-869'
  },
  {
    code: 'KP',
    label: "Korea, Democratic People's Republic of",
    phone: '850'
  },
  { code: 'KR', label: 'Korea, Republic of', phone: '82' },
  { code: 'KW', label: 'Kuwait', phone: '965' },
  { code: 'KY', label: 'Cayman Islands', phone: '1-345' },
  { code: 'KZ', label: 'Kazakhstan', phone: '7' },
  {
    code: 'LA',
    label: "Lao People's Democratic Republic",
    phone: '856'
  },
  { code: 'LB', label: 'Lebanon', phone: '961' },
  { code: 'LC', label: 'Saint Lucia', phone: '1-758' },
  { code: 'LI', label: 'Liechtenstein', phone: '423' },
  { code: 'LK', label: 'Sri Lanka', phone: '94' },
  { code: 'LR', label: 'Liberia', phone: '231' },
  { code: 'LS', label: 'Lesotho', phone: '266' },
  { code: 'LT', label: 'Lithuania', phone: '370' },
  { code: 'LU', label: 'Luxembourg', phone: '352' },
  { code: 'LV', label: 'Latvia', phone: '371' },
  { code: 'LY', label: 'Libya', phone: '218' },
  { code: 'MA', label: 'Morocco', phone: '212' },
  { code: 'MC', label: 'Monaco', phone: '377' },
  {
    code: 'MD',
    label: 'Moldova, Republic of',
    phone: '373'
  },
  { code: 'ME', label: 'Montenegro', phone: '382' },
  {
    code: 'MF',
    label: 'Saint Martin (French part)',
    phone: '590'
  },
  { code: 'MG', label: 'Madagascar', phone: '261' },
  { code: 'MH', label: 'Marshall Islands', phone: '692' },
  {
    code: 'MK',
    label: 'Macedonia, the Former Yugoslav Republic of',
    phone: '389'
  },
  { code: 'ML', label: 'Mali', phone: '223' },
  { code: 'MM', label: 'Myanmar', phone: '95' },
  { code: 'MN', label: 'Mongolia', phone: '976' },
  { code: 'MO', label: 'Macao', phone: '853' },
  {
    code: 'MP',
    label: 'Northern Mariana Islands',
    phone: '1-670'
  },
  { code: 'MQ', label: 'Martinique', phone: '596' },
  { code: 'MR', label: 'Mauritania', phone: '222' },
  { code: 'MS', label: 'Montserrat', phone: '1-664' },
  { code: 'MT', label: 'Malta', phone: '356' },
  { code: 'MU', label: 'Mauritius', phone: '230' },
  { code: 'MV', label: 'Maldives', phone: '960' },
  { code: 'MW', label: 'Malawi', phone: '265' },
  { code: 'MX', label: 'Mexico', phone: '52' },
  { code: 'MY', label: 'Malaysia', phone: '60' },
  { code: 'MZ', label: 'Mozambique', phone: '258' },
  { code: 'NA', label: 'Namibia', phone: '264' },
  { code: 'NC', label: 'New Caledonia', phone: '687' },
  { code: 'NE', label: 'Niger', phone: '227' },
  { code: 'NF', label: 'Norfolk Island', phone: '672' },
  { code: 'NG', label: 'Nigeria', phone: '234' },
  { code: 'NI', label: 'Nicaragua', phone: '505' },
  { code: 'NL', label: 'Netherlands', phone: '31' },
  { code: 'NO', label: 'Norway', phone: '47' },
  { code: 'NP', label: 'Nepal', phone: '977' },
  { code: 'NR', label: 'Nauru', phone: '674' },
  { code: 'NU', label: 'Niue', phone: '683' },
  { code: 'NZ', label: 'New Zealand', phone: '64' },
  { code: 'OM', label: 'Oman', phone: '968' },
  { code: 'PA', label: 'Panama', phone: '507' },
  { code: 'PE', label: 'Peru', phone: '51' },
  { code: 'PF', label: 'French Polynesia', phone: '689' },
  { code: 'PG', label: 'Papua New Guinea', phone: '675' },
  { code: 'PH', label: 'Philippines', phone: '63' },
  { code: 'PK', label: 'Pakistan', phone: '92' },
  { code: 'PL', label: 'Poland', phone: '48' },
  {
    code: 'PM',
    label: 'Saint Pierre and Miquelon',
    phone: '508'
  },
  { code: 'PN', label: 'Pitcairn', phone: '870' },
  { code: 'PR', label: 'Puerto Rico', phone: '1' },
  {
    code: 'PS',
    label: 'Palestine, State of',
    phone: '970'
  },
  { code: 'PT', label: 'Portugal', phone: '351' },
  { code: 'PW', label: 'Palau', phone: '680' },
  { code: 'PY', label: 'Paraguay', phone: '595' },
  { code: 'QA', label: 'Qatar', phone: '974' },
  { code: 'RE', label: 'Reunion', phone: '262' },
  { code: 'RO', label: 'Romania', phone: '40' },
  { code: 'RS', label: 'Serbia', phone: '381' },
  { code: 'RU', label: 'Russian Federation', phone: '7' },
  { code: 'RW', label: 'Rwanda', phone: '250' },
  { code: 'SA', label: 'Saudi Arabia', phone: '966' },
  { code: 'SB', label: 'Solomon Islands', phone: '677' },
  { code: 'SC', label: 'Seychelles', phone: '248' },
  { code: 'SD', label: 'Sudan', phone: '249' },
  { code: 'SE', label: 'Sweden', phone: '46' },
  { code: 'SG', label: 'Singapore', phone: '65' },
  { code: 'SH', label: 'Saint Helena', phone: '290' },
  { code: 'SI', label: 'Slovenia', phone: '386' },
  {
    code: 'SJ',
    label: 'Svalbard and Jan Mayen',
    phone: '47'
  },
  { code: 'SK', label: 'Slovakia', phone: '421' },
  { code: 'SL', label: 'Sierra Leone', phone: '232' },
  { code: 'SM', label: 'San Marino', phone: '378' },
  { code: 'SN', label: 'Senegal', phone: '221' },
  { code: 'SO', label: 'Somalia', phone: '252' },
  { code: 'SR', label: 'Suriname', phone: '597' },
  { code: 'SS', label: 'South Sudan', phone: '211' },
  {
    code: 'ST',
    label: 'Sao Tome and Principe',
    phone: '239'
  },
  { code: 'SV', label: 'El Salvador', phone: '503' },
  {
    code: 'SX',
    label: 'Sint Maarten (Dutch part)',
    phone: '1-721'
  },
  {
    code: 'SY',
    label: 'Syrian Arab Republic',
    phone: '963'
  },
  { code: 'SZ', label: 'Swaziland', phone: '268' },
  {
    code: 'TC',
    label: 'Turks and Caicos Islands',
    phone: '1-649'
  },
  { code: 'TD', label: 'Chad', phone: '235' },
  {
    code: 'TF',
    label: 'French Southern Territories',
    phone: '262'
  },
  { code: 'TG', label: 'Togo', phone: '228' },
  { code: 'TH', label: 'Thailand', phone: '66' },
  { code: 'TJ', label: 'Tajikistan', phone: '992' },
  { code: 'TK', label: 'Tokelau', phone: '690' },
  { code: 'TL', label: 'Timor-Leste', phone: '670' },
  { code: 'TM', label: 'Turkmenistan', phone: '993' },
  { code: 'TN', label: 'Tunisia', phone: '216' },
  { code: 'TO', label: 'Tonga', phone: '676' },
  { code: 'TR', label: 'Turkey', phone: '90' },
  {
    code: 'TT',
    label: 'Trinidad and Tobago',
    phone: '1-868'
  },
  { code: 'TV', label: 'Tuvalu', phone: '688' },
  {
    code: 'TW',
    label: 'Taiwan',
    phone: '886'
  },
  {
    code: 'TZ',
    label: 'United Republic of Tanzania',
    phone: '255'
  },
  { code: 'UA', label: 'Ukraine', phone: '380' },
  { code: 'UG', label: 'Uganda', phone: '256' },
  {
    code: 'US',
    label: 'United States',
    phone: '1',
    suggested: true
  },
  { code: 'UY', label: 'Uruguay', phone: '598' },
  { code: 'UZ', label: 'Uzbekistan', phone: '998' },
  {
    code: 'VA',
    label: 'Holy See (Vatican City State)',
    phone: '379'
  },
  {
    code: 'VC',
    label: 'Saint Vincent and the Grenadines',
    phone: '1-784'
  },
  { code: 'VE', label: 'Venezuela', phone: '58' },
  {
    code: 'VG',
    label: 'British Virgin Islands',
    phone: '1-284'
  },
  {
    code: 'VI',
    label: 'US Virgin Islands',
    phone: '1-340'
  },
  { code: 'VN', label: 'Vietnam', phone: '84' },
  { code: 'VU', label: 'Vanuatu', phone: '678' },
  { code: 'WF', label: 'Wallis and Futuna', phone: '681' },
  { code: 'WS', label: 'Samoa', phone: '685' },
  { code: 'XK', label: 'Kosovo', phone: '383' },
  { code: 'YE', label: 'Yemen', phone: '967' },
  { code: 'YT', label: 'Mayotte', phone: '262' },
  { code: 'ZA', label: 'South Africa', phone: '27' },
  { code: 'ZM', label: 'Zambia', phone: '260' },
  { code: 'ZW', label: 'Zimbabwe', phone: '263' }
];

export const CITIES = [
  { label: 'Attock' },
  { label: 'Bahawalnagar' },
  { label: 'Bahawalpur' },
  { label: 'Bhakkar' },
  { label: 'Chakwal' },
  { label: 'Chiniot' },
  { label: 'Dera Ghazi Khan' },
  { label: 'Faisalabad' },
  { label: 'Gujranwala' },
  { label: 'Gujrat' },
  { label: 'Hafizabad' },
  { label: 'Jhang' },
  { label: 'Jhelum' },
  { label: 'Kasur' },
  { label: 'Khanewal' },
  { label: 'Khushab' },
  { label: 'Lahore' },
  { label: 'Layyah' },
  { label: 'Lodhran' },
  { label: 'Mandi Bahauddin' },
  { label: 'Mianwali' },
  { label: 'Multan' },
  { label: 'Muzaffargarh' },
  { label: 'Nankana Sahib' },
  { label: 'Narowal' },
  { label: 'Okara' },
  { label: 'Pakpattan' },
  { label: 'Rahim Yar Khan' },
  { label: 'Rajanpur' },
  { label: 'Rawalpindi' },
  { label: 'Sahiwal' },
  { label: 'Sargodha' },
  { label: 'Sheikhupura' },
  { label: 'Sialkot' },
  { label: 'Toba Tek Singh' },
  { label: 'Vehari' },
  { label: 'Badin' },
  { label: 'Dadu' },
  { label: 'Ghotki' },
  { label: 'Hyderabad' },
  { label: 'Jacobabad' },
  { label: 'Jamshoro' },
  { label: 'Karachi' },
  { label: 'Karachi Central' },
  { label: 'Karachi East' },
  { label: 'Karachi South' },
  { label: 'Karachi West' },
  { label: 'Kashmore' },
  { label: 'Khairpur' },
  { label: 'Korangi' },
  { label: 'Larkana' },
  { label: 'Malir' },
  { label: 'Matiari' },
  { label: 'Mirpur Khas' },
  { label: 'Naushahro Feroze' },
  { label: 'Shaheed Benazirabad' },
  { label: 'Qambar Shahdadkot' },
  { label: 'Sanghar' },
  { label: 'Shikarpur' },
  { label: 'Sukkur' },
  { label: 'Tando Allahyar' },
  { label: 'Tando Muhammad Khan' },
  { label: 'Tharparkar' },
  { label: 'Thatta' },
  { label: 'Umerkot' },
  { label: 'Abbottabad' },
  { label: 'Bajaur' },
  { label: 'Bannu' },
  { label: 'Battagram' },
  { label: 'Buner' },
  { label: 'Charsadda' },
  { label: 'Chitral Lower' },
  { label: 'Chitral Upper' },
  { label: 'Dera Ismail Khan' },
  { label: 'Dir Lower' },
  { label: 'Dir Upper' },
  { label: 'Hangu' },
  { label: 'Haripur' },
  { label: 'Karak' },
  { label: 'Khyber' },
  { label: 'Kohat' },
  { label: 'Kolai Palas' },
  { label: 'Kurram' },
  { label: 'Lakki Marwat' },
  { label: 'Malakand' },
  { label: 'Mansehra' },
  { label: 'Mardan' },
  { label: 'Mohmand' },
  { label: 'North Waziristan' },
  { label: 'Nowshera' },
  { label: 'Orakzai' },
  { label: 'Peshawar' },
  { label: 'Shangla' },
  { label: 'South Waziristan' },
  { label: 'Swabi' },
  { label: 'Swat' },
  { label: 'Tank' },
  { label: 'Tor Ghar' },
  { label: 'Kohistan Upper' },
  { label: 'Kohistan Lower' },
  { label: 'Awaran' },
  { label: 'Barkhan' },
  { label: 'Chagai' },
  { label: 'Dera Bugti' },
  { label: 'Gwadar' },
  { label: 'Harnai' },
  { label: 'Jafarabad' },
  { label: 'Jhal Magsi' },
  { label: 'Kachhi' },
  { label: 'Kalat' },
  { label: 'Kech' },
  { label: 'Kharan' },
  { label: 'Khuzdar' },
  { label: 'Killa Abdullah' },
  { label: 'Killa Saifullah' },
  { label: 'Kohlu' },
  { label: 'Lasbela' },
  { label: 'Loralai' },
  { label: 'Mastung' },
  { label: 'Musakhel' },
  { label: 'Nasirabad' },
  { label: 'Nushki' },
  { label: 'Panjgur' },
  { label: 'Pishin' },
  { label: 'Quetta' },
  { label: 'Sherani' },
  { label: 'Sibi' },
  { label: 'Sohbatpur' },
  { label: 'Washuk' },
  { label: 'Zhob' },
  { label: 'Ziarat' },
  { label: 'Islamabad' },
  { label: 'Ghanche' },
  { label: 'Skardu' },
  { label: 'Shigar' },
  { label: 'Kharmang' },
  { label: 'Rondu' },
  { label: 'Gilgit' },
  { label: 'Hunza' },
  { label: 'Nagar' },
  { label: 'Ghizer' },
  { label: 'Astore' },
  { label: 'Diamer' },
  { label: 'Tangir' },
  { label: 'Darel' },
  { label: 'Bhimber' },
  { label: 'Kotli' },
  { label: 'Mirpur' },
  { label: 'Muzaffarabad' },
  { label: 'Neelum' },
  { label: 'Poonch' },
  { label: 'Sudhnoti' },
  { label: 'Bagh' },
  { label: 'Haveli' },
  { label: 'Hattian' }
];

export const ALL_DISTRICTS = [
  {
    label: 'Abbottabad',
    value: 'abbottabad'
  },
  {
    label: 'Allai',
    value: 'allai'
  },
  {
    label: 'Astore',
    value: 'astore'
  },
  {
    label: 'Attock',
    value: 'attock'
  },
  {
    label: 'Awaran',
    value: 'awaran'
  },
  {
    label: 'Badin',
    value: 'badin'
  },
  {
    label: 'Bagh',
    value: 'bagh'
  },
  {
    label: 'Bahawalnagar',
    value: 'bahawalnagar'
  },
  {
    label: 'Bahawalpur',
    value: 'bahawalpur'
  },
  {
    label: 'Bajaur',
    value: 'bajaur'
  },
  {
    label: 'Bannu',
    value: 'bannu'
  },
  {
    label: 'Barkhan',
    value: 'barkhan'
  },
  {
    label: 'Battagram',
    value: 'battagram'
  },
  {
    label: 'Bhakkar',
    value: 'bhakkar'
  },
  {
    label: 'Bhimber',
    value: 'bhimber'
  },
  {
    label: 'Buner',
    value: 'buner'
  },
  {
    label: 'Central Dir',
    value: 'central dir'
  },
  {
    label: 'Chagai',
    value: 'chagai'
  },
  {
    label: 'Chakwal',
    value: 'chakwal'
  },
  {
    label: 'Chaman',
    value: 'chaman'
  },
  {
    label: 'Charsadda',
    value: 'charsadda'
  },
  {
    label: 'Chiniot',
    value: 'chiniot'
  },
  {
    label: 'Dadu',
    value: 'dadu'
  },
  {
    label: 'Darel',
    value: 'darel'
  },
  {
    label: 'Dera Bugti',
    value: 'dera bugti'
  },
  {
    label: 'Dera Ghazi Khan',
    value: 'dera ghazi khan'
  },
  {
    label: 'Dera Ismail Khan',
    value: 'dera ismail khan'
  },
  {
    label: 'Diamer',
    value: 'diamer'
  },
  {
    label: 'Duki',
    value: 'duki'
  },
  {
    label: 'Faisalabad',
    value: 'faisalabad'
  },
  {
    label: 'Ghanche',
    value: 'ghanche'
  },
  {
    label: 'Ghizer',
    value: 'ghizer'
  },
  {
    label: 'Ghotki',
    value: 'ghotki'
  },
  {
    label: 'Gilgit',
    value: 'gilgit'
  },
  {
    label: 'Gujranwala',
    value: 'gujranwala'
  },
  {
    label: 'Gujrat',
    value: 'gujrat'
  },
  {
    label: 'Gupis-Yasin',
    value: 'gupis-yasin'
  },
  {
    label: 'Gwadar',
    value: 'gwadar'
  },
  {
    label: 'Hafizabad',
    value: 'hafizabad'
  },
  {
    label: 'Hangu',
    value: 'hangu'
  },
  {
    label: 'Haripur',
    value: 'haripur'
  },
  {
    label: 'Harnai',
    value: 'harnai'
  },
  {
    label: 'Hattian Bala',
    value: 'hattian bala'
  },
  {
    label: 'Haveli',
    value: 'haveli'
  },
  {
    label: 'Hub',
    value: 'hub'
  },
  {
    label: 'Hunza',
    value: 'hunza'
  },
  {
    label: 'Hyderabad',
    value: 'hyderabad'
  },
  {
    label: 'Islamabad',
    value: 'islamabad'
  },
  {
    label: 'Jacobabad',
    value: 'jacobabad'
  },
  {
    label: 'Jafarabad',
    value: 'jafarabad'
  },
  {
    label: 'Jamshoro',
    value: 'jamshoro'
  },
  {
    label: 'Jhal Magsi',
    value: 'jhal magsi'
  },
  {
    label: 'Jhang',
    value: 'jhang'
  },
  {
    label: 'Jhelum',
    value: 'jhelum'
  },
  {
    label: 'Kachhi',
    value: 'kachhi'
  },
  {
    label: 'Kalat',
    value: 'kalat'
  },
  // {
  //   label: 'Karachi Central',
  //   value: 'karachi central'
  // },
  // {
  //   label: 'Karachi East',
  //   value: 'karachi east'
  // },
  // {
  //   label: 'Karachi South',
  //   value: 'karachi south'
  // },
  // {
  //   label: 'Karachi West',
  //   value: 'karachi west'
  // },
  {
    label: 'Karachi',
    value: 'karachi'
  },
  {
    label: 'Karak',
    value: 'karak'
  },
  {
    label: 'Kashmore',
    value: 'kashmore'
  },
  {
    label: 'Kasur',
    value: 'kasur'
  },
  {
    label: 'Keamari',
    value: 'keamari'
  },
  {
    label: 'Kech',
    value: 'kech'
  },
  {
    label: 'Khairpur',
    value: 'khairpur'
  },
  {
    label: 'Khanewal',
    value: 'khanewal'
  },
  {
    label: 'Kharan',
    value: 'kharan'
  },
  {
    label: 'Kharmang',
    value: 'kharmang'
  },
  {
    label: 'Khushab',
    value: 'khushab'
  },
  {
    label: 'Khuzdar',
    value: 'khuzdar'
  },
  {
    label: 'Khyber',
    value: 'khyber'
  },
  {
    label: 'Kohat',
    value: 'kohat'
  },
  {
    label: 'Kohlu',
    value: 'kohlu'
  },
  {
    label: 'Kolai-Palas',
    value: 'kolai-palas'
  },
  {
    label: 'Korangi',
    value: 'korangi'
  },
  {
    label: 'Kot Addu',
    value: 'kot addu'
  },
  {
    label: 'Kotli',
    value: 'kotli'
  },
  {
    label: 'Kurram',
    value: 'kurram'
  },
  {
    label: 'Lahore',
    value: 'lahore'
  },
  {
    label: 'Lakki Marwat',
    value: 'lakki marwat'
  },
  {
    label: 'Larkana',
    value: 'larkana'
  },
  {
    label: 'Lasbela',
    value: 'lasbela'
  },
  {
    label: 'Layyah',
    value: 'layyah'
  },
  {
    label: 'Lodhran',
    value: 'lodhran'
  },
  {
    label: 'Loralai',
    value: 'loralai'
  },
  {
    label: 'Lower Chitral',
    value: 'lower chitral'
  },
  {
    label: 'Lower Dir',
    value: 'lower dir'
  },
  {
    label: 'Lower Kohistan',
    value: 'lower kohistan'
  },
  {
    label: 'Lower South Waziristan',
    value: 'lower south waziristan'
  },
  {
    label: 'Malakand',
    value: 'malakand'
  },
  {
    label: 'Malir',
    value: 'malir'
  },
  {
    label: 'Mandi Bahauddin',
    value: 'mandi bahauddin'
  },
  {
    label: 'Mansehra',
    value: 'mansehra'
  },
  {
    label: 'Mardan',
    value: 'mardan'
  },
  {
    label: 'Mastung',
    value: 'mastung'
  },
  {
    label: 'Matiari',
    value: 'matiari'
  },
  {
    label: 'Mianwali',
    value: 'mianwali'
  },
  {
    label: 'Mirpur',
    value: 'mirpur'
  },
  {
    label: 'Mirpur Khas',
    value: 'mirpur khas'
  },
  {
    label: 'Mohmand',
    value: 'mohmand'
  },
  {
    label: 'Multan',
    value: 'multan'
  },
  {
    label: 'Murree',
    value: 'murree'
  },
  {
    label: 'Musakhel',
    value: 'musakhel'
  },
  {
    label: 'Muzaffarabad',
    value: 'muzaffarabad'
  },
  {
    label: 'Muzaffargarh',
    value: 'muzaffargarh'
  },
  {
    label: 'Nagar',
    value: 'nagar'
  },
  {
    label: 'Nankana Sahib',
    value: 'nankana sahib'
  },
  {
    label: 'Narowal',
    value: 'narowal'
  },
  {
    label: 'Nasirabad',
    value: 'nasirabad'
  },
  {
    label: 'Naushahro Feroze',
    value: 'naushahro feroze'
  },
  {
    label: 'Neelum',
    value: 'neelum'
  },
  {
    label: 'North Waziristan',
    value: 'north waziristan'
  },
  {
    label: 'Nowshera',
    value: 'nowshera'
  },
  {
    label: 'Nushki',
    value: 'nushki'
  },
  {
    label: 'Okara',
    value: 'okara'
  },
  {
    label: 'Orakzai',
    value: 'orakzai'
  },
  {
    label: 'Pakpattan',
    value: 'pakpattan'
  },
  {
    label: 'Panjgur',
    value: 'panjgur'
  },
  {
    label: 'Peshawar',
    value: 'peshawar'
  },
  {
    label: 'Pishin',
    value: 'pishin'
  },
  {
    label: 'Poonch',
    value: 'poonch'
  },
  {
    label: 'Qambar Shahdadkot',
    value: 'qambar shahdadkot'
  },
  {
    label: 'Qila Abdullah',
    value: 'qila abdullah'
  },
  {
    label: 'Qila Saifullah',
    value: 'qila saifullah'
  },
  {
    label: 'Quetta',
    value: 'quetta'
  },
  {
    label: 'Rahim Yar Khan',
    value: 'rahim yar khan'
  },
  {
    label: 'Rajanpur',
    value: 'rajanpur'
  },
  {
    label: 'Rawalpindi',
    value: 'rawalpindi'
  },
  {
    label: 'Roundu',
    value: 'roundu'
  },
  {
    label: 'Sahiwal',
    value: 'sahiwal'
  },
  {
    label: 'Sanghar',
    value: 'sanghar'
  },
  {
    label: 'Sargodha',
    value: 'sargodha'
  },
  {
    label: 'Shaheed Benazirabad',
    value: 'shaheed benazirabad'
  },
  {
    label: 'Shangla',
    value: 'shangla'
  },
  {
    label: 'Sheikhupura',
    value: 'sheikhupura'
  },
  {
    label: 'Sherani',
    value: 'sherani'
  },
  {
    label: 'Shigar',
    value: 'shigar'
  },
  {
    label: 'Shikarpur',
    value: 'shikarpur'
  },
  {
    label: 'Sialkot',
    value: 'sialkot'
  },
  {
    label: 'Sibi',
    value: 'sibi'
  },
  {
    label: 'Skardu',
    value: 'skardu'
  },
  {
    label: 'Sohbatpur',
    value: 'sohbatpur'
  },
  {
    label: 'Sudhanoti',
    value: 'sudhanoti'
  },
  {
    label: 'Sujawal',
    value: 'sujawal'
  },
  {
    label: 'Sukkur',
    value: 'sukkur'
  },
  {
    label: 'Surab',
    value: 'surab'
  },
  {
    label: 'Swabi',
    value: 'swabi'
  },
  {
    label: 'Swat',
    value: 'swat'
  },
  {
    label: 'Talagang',
    value: 'talagang'
  },
  {
    label: 'Tando Allahyar',
    value: 'tando allahyar'
  },
  {
    label: 'Tando Muhammad Khan',
    value: 'tando muhammad khan'
  },
  {
    label: 'Tangir',
    value: 'tangir'
  },
  {
    label: 'Tank',
    value: 'tank'
  },
  {
    label: 'Taunsa',
    value: 'taunsa'
  },
  {
    label: 'Tharparkar',
    value: 'tharparkar'
  },
  {
    label: 'Thatta',
    value: 'thatta'
  },
  {
    label: 'Toba Tek Singh',
    value: 'toba tek singh'
  },
  {
    label: 'Torghar',
    value: 'torghar'
  },
  {
    label: 'Umerkot',
    value: 'umerkot'
  },
  {
    label: 'Upper Chitral',
    value: 'upper chitral'
  },
  {
    label: 'Upper Dir',
    value: 'upper dir'
  },
  {
    label: 'Upper Kohistan',
    value: 'upper kohistan'
  },
  {
    label: 'Upper South Waziristan',
    value: 'upper south waziristan'
  },
  {
    label: 'Usta Muhammad',
    value: 'usta muhammad'
  },
  {
    label: 'Vehari',
    value: 'vehari'
  },
  {
    label: 'Washuk',
    value: 'washuk'
  },
  {
    label: 'Wazirabad',
    value: 'wazirabad'
  },
  {
    label: 'Zhob',
    value: 'zhob'
  },
  {
    label: 'Ziarat',
    value: 'ziarat'
  }
];

export const OPTIONS: Record<
  ScholarshipsFiltersKeys,
  { value: string; label: string; range?: string }[]
> = {
  degree_level: [
    { value: 'Bachelor', label: 'Bachelors' },
    { value: 'Master', label: 'Masters' },
    { value: 'PhD', label: 'PhD' }
    // { value: 'Associate', label: 'Associate' },
    // { value: 'Diploma', label: 'Diploma' }
  ],
  courseFormat: [
    { value: 'Online', label: 'Online' },
    { value: 'Onsite', label: 'Onsite' },
    { value: 'Hybrid', label: 'Hybrid' }
  ],
  majorCourse: [
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Business', label: 'Business' },
    { value: 'Design and Arts', label: 'Design and Arts' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Medicine', label: 'Medicine' }
  ],
  fee: [
    { value: 'Annual', label: 'Annual' },
    { value: 'Semester', label: 'Semester' },
    { value: 'Credit Hour', label: 'Credit Hour' }
  ],
  year: getNextTenYears(),
  intake: [
    { value: 'spring', label: 'Spring' },
    { value: 'fall', label: 'Fall' }
  ],
  cities: ALL_DISTRICTS
};

export const ADMISSION_REQUIREMENTS_DATA = [
  {
    label: 'Eligibility Criteria',
    heading: '1. Eligibility Criteria',
    content:
      'High school diploma or equivalent with a minimum GPA of 3.0 on a 4.0 scale.'
  },
  {
    label: 'Pre Requisite',
    heading: '2. Pre Requisite',
    content:
      'Submission of standardized test scores (SAT, ACT, GRE, GMAT) as per program requirements.'
  },
  {
    label: 'Entry Test',
    heading: '3. Entry Test',
    content: 'Successful completion of the university’s entrance examination.'
  },
  {
    label: 'Interviews',
    heading: '4. Interviews',
    content: 'Participation in an interview with the admissions committee.'
  }
];

// export const FEE_DATA = [
//   {
//     id: 1,
//     label: 'Per Semester',
//     amount: '$20,000',
//     description:
//       'The semester fee is a recurring charge paid by students at the beginning of each academic semester or term.  each academic semester or term'
//   },
//   {
//     id: 2,
//     label: 'Admission Fee',
//     amount: '$5000',
//     description:
//       "This fee is paid by students upon acceptance of their admission offer to the university or college. It covers administrative costs associated with processing the admission application and enrolling the student in the institution's system."
//   },
//   {
//     id: 3,
//     label: 'Tuition Fee',
//     amount: '$1000',
//     description:
//       'The tuition fee is charged based on the number of credit hours or courses a student enrolls in for a particular semester or academic term.'
//   }
// ];

export const RANKING_INFO_ITEMS = [
  { title: '34 Ranking', subtitle: 'World Wide' },
  { title: '24 Ranking', subtitle: 'HEC Rankinge' },
  { title: 'Campus', subtitle: 'Islamabad' },
  { title: 'Found In', subtitle: 'July 1995' }
];

export const PROGRAM_INFO = [
  { title: 'Masters', subtitle: 'Study Level' },
  { title: 'Online', subtitle: 'Study Mode' },
  { title: 'MSc', subtitle: 'Degree' },
  { title: 'Data Science', subtitle: 'Main Subject' }
];
