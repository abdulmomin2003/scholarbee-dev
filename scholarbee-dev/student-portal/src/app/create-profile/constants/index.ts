import meezanIcon from '@public/assets/svg/meezan.svg';
import hblIcon from '@public/assets/svg/HBL.svg';
import bopIcon from '@public/assets/svg/BOP.svg';
import mcbIcon from '@public/assets/svg/MCB.svg';
import sbpIcon from '@public/assets/svg/SBP.svg';

export const PERSONAL_INFO_FIELDS = [
  {
    name: 'first_name',
    label: 'First Name',
    type: 'text',
    value: '',
    required: true,
    placeholder: 'Enter your first name'
  },
  {
    name: 'last_name',
    label: 'Last Name',
    type: 'text',
    value: '',
    required: true,
    placeholder: 'Enter your last name'
  },
  {
    name: 'date_of_birth',
    label: 'Date Of Birth',
    type: 'date',
    value: '',
    required: true,
    placeholder: 'Select your date of birth'
  },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    value: 'Male',
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Other', label: 'Other' }
    ],
    required: true,
    placeholder: 'Select your gender'
  },
  {
    name: 'nationality',
    label: 'Nationality/Country of Residence',
    type: 'select',
    value: 'Pakistan',
    options: [
      { value: 'Afghanistan', label: 'Afghanistan' },
      { value: 'Albania', label: 'Albania' },
      { value: 'Algeria', label: 'Algeria' },
      { value: 'Andorra', label: 'Andorra' },
      { value: 'Angola', label: 'Angola' },
      { value: 'Antigua and Barbuda', label: 'Antigua and Barbuda' },
      { value: 'Argentina', label: 'Argentina' },
      { value: 'Armenia', label: 'Armenia' },
      { value: 'Australia', label: 'Australia' },
      { value: 'Austria', label: 'Austria' },
      { value: 'Azerbaijan', label: 'Azerbaijan' },
      { value: 'Bahamas', label: 'Bahamas' },
      { value: 'Bahrain', label: 'Bahrain' },
      { value: 'Bangladesh', label: 'Bangladesh' },
      { value: 'Barbados', label: 'Barbados' },
      { value: 'Belarus', label: 'Belarus' },
      { value: 'Belgium', label: 'Belgium' },
      { value: 'Belize', label: 'Belize' },
      { value: 'Benin', label: 'Benin' },
      { value: 'Bhutan', label: 'Bhutan' },
      { value: 'Bolivia', label: 'Bolivia' },
      { value: 'Bosnia and Herzegovina', label: 'Bosnia and Herzegovina' },
      { value: 'Botswana', label: 'Botswana' },
      { value: 'Brazil', label: 'Brazil' },
      { value: 'Brunei', label: 'Brunei' },
      { value: 'Bulgaria', label: 'Bulgaria' },
      { value: 'Burkina Faso', label: 'Burkina Faso' },
      { value: 'Burundi', label: 'Burundi' },
      { value: 'Cabo Verde', label: 'Cabo Verde' },
      { value: 'Cambodia', label: 'Cambodia' },
      { value: 'Cameroon', label: 'Cameroon' },
      { value: 'Canada', label: 'Canada' },
      { value: 'Central African Republic', label: 'Central African Republic' },
      { value: 'Chad', label: 'Chad' },
      { value: 'Chile', label: 'Chile' },
      { value: 'China', label: 'China' },
      { value: 'Colombia', label: 'Colombia' },
      { value: 'Comoros', label: 'Comoros' },
      { value: 'Congo', label: 'Congo' },
      { value: 'Costa Rica', label: 'Costa Rica' },
      { value: 'Croatia', label: 'Croatia' },
      { value: 'Cuba', label: 'Cuba' },
      { value: 'Cyprus', label: 'Cyprus' },
      { value: 'Czech Republic', label: 'Czech Republic' },
      { value: 'Denmark', label: 'Denmark' },
      { value: 'Djibouti', label: 'Djibouti' },
      { value: 'Dominica', label: 'Dominica' },
      { value: 'Dominican Republic', label: 'Dominican Republic' },
      { value: 'Ecuador', label: 'Ecuador' },
      { value: 'Egypt', label: 'Egypt' },
      { value: 'El Salvador', label: 'El Salvador' },
      { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
      { value: 'Eritrea', label: 'Eritrea' },
      { value: 'Estonia', label: 'Estonia' },
      { value: 'Eswatini', label: 'Eswatini' },
      { value: 'Ethiopia', label: 'Ethiopia' },
      { value: 'Fiji', label: 'Fiji' },
      { value: 'Finland', label: 'Finland' },
      { value: 'France', label: 'France' },
      { value: 'Gabon', label: 'Gabon' },
      { value: 'Gambia', label: 'Gambia' },
      { value: 'Georgia', label: 'Georgia' },
      { value: 'Germany', label: 'Germany' },
      { value: 'Ghana', label: 'Ghana' },
      { value: 'Greece', label: 'Greece' },
      { value: 'Grenada', label: 'Grenada' },
      { value: 'Guatemala', label: 'Guatemala' },
      { value: 'Guinea', label: 'Guinea' },
      { value: 'Guinea-Bissau', label: 'Guinea-Bissau' },
      { value: 'Guyana', label: 'Guyana' },
      { value: 'Haiti', label: 'Haiti' },
      { value: 'Honduras', label: 'Honduras' },
      { value: 'Hungary', label: 'Hungary' },
      { value: 'Iceland', label: 'Iceland' },
      { value: 'India', label: 'India' },
      { value: 'Indonesia', label: 'Indonesia' },
      { value: 'Iran', label: 'Iran' },
      { value: 'Iraq', label: 'Iraq' },
      { value: 'Ireland', label: 'Ireland' },
      { value: 'Israel', label: 'Israel' },
      { value: 'Italy', label: 'Italy' },
      { value: 'Jamaica', label: 'Jamaica' },
      { value: 'Japan', label: 'Japan' },
      { value: 'Jordan', label: 'Jordan' },
      { value: 'Kazakhstan', label: 'Kazakhstan' },
      { value: 'Kenya', label: 'Kenya' },
      { value: 'Kiribati', label: 'Kiribati' },
      { value: 'Kuwait', label: 'Kuwait' },
      { value: 'Kyrgyzstan', label: 'Kyrgyzstan' },
      { value: 'Laos', label: 'Laos' },
      { value: 'Latvia', label: 'Latvia' },
      { value: 'Lebanon', label: 'Lebanon' },
      { value: 'Lesotho', label: 'Lesotho' },
      { value: 'Liberia', label: 'Liberia' },
      { value: 'Libya', label: 'Libya' },
      { value: 'Liechtenstein', label: 'Liechtenstein' },
      { value: 'Lithuania', label: 'Lithuania' },
      { value: 'Luxembourg', label: 'Luxembourg' },
      { value: 'Madagascar', label: 'Madagascar' },
      { value: 'Malawi', label: 'Malawi' },
      { value: 'Malaysia', label: 'Malaysia' },
      { value: 'Maldives', label: 'Maldives' },
      { value: 'Mali', label: 'Mali' },
      { value: 'Malta', label: 'Malta' },
      { value: 'Marshall Islands', label: 'Marshall Islands' },
      { value: 'Mauritania', label: 'Mauritania' },
      { value: 'Mauritius', label: 'Mauritius' },
      { value: 'Mexico', label: 'Mexico' },
      { value: 'Micronesia', label: 'Micronesia' },
      { value: 'Moldova', label: 'Moldova' },
      { value: 'Monaco', label: 'Monaco' },
      { value: 'Mongolia', label: 'Mongolia' },
      { value: 'Montenegro', label: 'Montenegro' },
      { value: 'Morocco', label: 'Morocco' },
      { value: 'Mozambique', label: 'Mozambique' },
      { value: 'Myanmar', label: 'Myanmar' },
      { value: 'Namibia', label: 'Namibia' },
      { value: 'Nauru', label: 'Nauru' },
      { value: 'Nepal', label: 'Nepal' },
      { value: 'Netherlands', label: 'Netherlands' },
      { value: 'New Zealand', label: 'New Zealand' },
      { value: 'Nicaragua', label: 'Nicaragua' },
      { value: 'Niger', label: 'Niger' },
      { value: 'Nigeria', label: 'Nigeria' },
      { value: 'North Korea', label: 'North Korea' },
      { value: 'North Macedonia', label: 'North Macedonia' },
      { value: 'Norway', label: 'Norway' },
      { value: 'Oman', label: 'Oman' },
      { value: 'Pakistan', label: 'Pakistan' },
      { value: 'Palau', label: 'Palau' },
      { value: 'Palestine', label: 'Palestine' },
      { value: 'Panama', label: 'Panama' },
      { value: 'Papua New Guinea', label: 'Papua New Guinea' },
      { value: 'Paraguay', label: 'Paraguay' },
      { value: 'Peru', label: 'Peru' },
      { value: 'Philippines', label: 'Philippines' },
      { value: 'Poland', label: 'Poland' },
      { value: 'Portugal', label: 'Portugal' },
      { value: 'Qatar', label: 'Qatar' },
      { value: 'Romania', label: 'Romania' },
      { value: 'Russia', label: 'Russia' },
      { value: 'Rwanda', label: 'Rwanda' },
      { value: 'Saint Kitts and Nevis', label: 'Saint Kitts and Nevis' },
      { value: 'Saint Lucia', label: 'Saint Lucia' },
      {
        value: 'Saint Vincent and the Grenadines',
        label: 'Saint Vincent and the Grenadines'
      },
      { value: 'Samoa', label: 'Samoa' },
      { value: 'San Marino', label: 'San Marino' },
      { value: 'Sao Tome and Principe', label: 'Sao Tome and Principe' },
      { value: 'Saudi Arabia', label: 'Saudi Arabia' },
      { value: 'Senegal', label: 'Senegal' },
      { value: 'Serbia', label: 'Serbia' },
      { value: 'Seychelles', label: 'Seychelles' },
      { value: 'Sierra Leone', label: 'Sierra Leone' },
      { value: 'Singapore', label: 'Singapore' },
      { value: 'Slovakia', label: 'Slovakia' },
      { value: 'Slovenia', label: 'Slovenia' },
      { value: 'Solomon Islands', label: 'Solomon Islands' },
      { value: 'Somalia', label: 'Somalia' },
      { value: 'South Africa', label: 'South Africa' },
      { value: 'South Korea', label: 'South Korea' },
      { value: 'South Sudan', label: 'South Sudan' },
      { value: 'Spain', label: 'Spain' },
      { value: 'Sri Lanka', label: 'Sri Lanka' },
      { value: 'Sudan', label: 'Sudan' },
      { value: 'Suriname', label: 'Suriname' },
      { value: 'Sweden', label: 'Sweden' },
      { value: 'Switzerland', label: 'Switzerland' },
      { value: 'Syria', label: 'Syria' },
      { value: 'Taiwan', label: 'Taiwan' },
      { value: 'Tajikistan', label: 'Tajikistan' },
      { value: 'Tanzania', label: 'Tanzania' },
      { value: 'Thailand', label: 'Thailand' },
      { value: 'Timor-Leste', label: 'Timor-Leste' },
      { value: 'Togo', label: 'Togo' },
      { value: 'Tonga', label: 'Tonga' },
      { value: 'Trinidad and Tobago', label: 'Trinidad and Tobago' },
      { value: 'Tunisia', label: 'Tunisia' },
      { value: 'Turkey', label: 'Turkey' },
      { value: 'Turkmenistan', label: 'Turkmenistan' },
      { value: 'Tuvalu', label: 'Tuvalu' },
      { value: 'Uganda', label: 'Uganda' },
      { value: 'Ukraine', label: 'Ukraine' },
      { value: 'United Arab Emirates', label: 'United Arab Emirates' },
      { value: 'United Kingdom', label: 'United Kingdom' },
      { value: 'United States', label: 'United States' },
      { value: 'Uruguay', label: 'Uruguay' },
      { value: 'Uzbekistan', label: 'Uzbekistan' },
      { value: 'Vanuatu', label: 'Vanuatu' },
      { value: 'Vatican City', label: 'Vatican City' },
      { value: 'Venezuela', label: 'Venezuela' },
      { value: 'Vietnam', label: 'Vietnam' },
      { value: 'Yemen', label: 'Yemen' },
      { value: 'Zambia', label: 'Zambia' },
      { value: 'Zimbabwe', label: 'Zimbabwe' }
    ],
    // required: true,
    placeholder: 'Select your nationality'
  },
  {
    name: 'father_name',
    label: "Father's Name",
    type: 'text',
    value: '',
    placeholder: "Enter your father's name"
  },
  {
    name: 'father_status',
    label: "Father's Status",
    type: 'select',
    value: 'Alive',
    options: [
      { value: 'alive', label: 'Alive' },
      { value: 'deceased', label: 'Deceased' }
    ],
    placeholder: "Select your father's status"
  },
  {
    name: 'father_profession',
    label: "Father's Profession",
    type: 'test',
    value: '',
    placeholder: "Enter your father's profession"
  },
  {
    name: 'father_income',
    label: "Father's Income",
    type: 'number',
    value: '',
    placeholder: "Enter your father's income"
  },
  {
    name: 'mother_name',
    label: "Mother's Name",
    type: 'text',
    value: '',
    placeholder: "Enter your mother's name"
  },
  {
    name: 'mother_status',
    label: "Mother's Status",
    type: 'select',
    value: 'Alive',
    options: [
      { value: 'alive', label: 'Alive' },
      { value: 'deceased', label: 'Deceased' }
    ],
    placeholder: "Select your mother's status"
  },
  {
    name: 'mother_profession',
    label: "Mother's Profession",
    type: 'test',
    value: '',
    placeholder: "Enter your mother's profession"
  },
  {
    name: 'mother_income',
    label: "Mother's Income",
    type: 'number',
    value: '',
    placeholder: "Enter your mother's income"
  },
  {
    name: 'religion',
    label: 'Religion',
    type: 'select',
    value: '',
    options: [
      { value: 'Islam', label: 'Islam' },
      { value: 'Christianity', label: 'Christian' },
      { value: 'Hinduism', label: 'Hindu' },
      { value: 'Buddhism', label: 'Buddhist' },
      { value: 'Sikhism', label: 'Sikh' },
      { value: 'Judaism', label: 'Jewish' },
      { value: 'Other', label: 'Other' }
    ],
    placeholder: 'Select your religion'
  },
  {
    name: 'special_person',
    label: 'Are You a Special Person?',
    type: 'select',
    value: '',
    required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ],
    placeholder: 'Select your special person'
  }
];

export const CONTACT_INFO_FIELDS = [
  {
    name: 'email',
    label: 'Email Address',
    type: 'text',
    required: true,
    notEditable: true,
    placeholder: 'Enter your email address'
  },
  {
    name: 'phone_number',
    label: 'Phone Number',
    type: 'number',
    required: true,
    placeholder: 'Enter your phone number'
  },
  {
    name: 'fatherEmailAddress',
    label: "Father's Email Address",
    type: 'text',
    placeholder: "Enter your father's email address"
  },
  {
    name: 'fatherPhoneNumber',
    label: "Father's Phone Number",
    type: 'text',
    placeholder: "Enter your father's phone number"
  },
  {
    name: 'provinceOfDomicile',
    label: 'Province of Domicile',
    type: 'select',
    options: [
      { value: 'punjab', label: 'Punjab' },
      { value: 'sindh', label: 'Sindh' },
      { value: 'balochistan', label: 'Balochistan' },
      { value: 'khyber_pakhtunkhwa', label: 'Khyber Pakhtunkhwa' },
      { value: 'gilgit', label: 'Gilgit-Baltistan' },
      { value: 'kashmir', label: 'Azad Kashmir' },
      { value: 'islamabad', label: 'Islamabad Capital Territory' }
    ],
    required: true,
    placeholder: 'Select your province of domicile'
  },
  {
    name: 'districtOfDomicile',
    label: 'District of Domicile',
    type: 'text',
    required: true,
    placeholder: 'Enter your district of domicile'
  },
  {
    name: 'stateOrProvince',
    label: 'State/Province',
    type: 'select',
    options: [
      { value: 'punjab', label: 'Punjab' },
      { value: 'sindh', label: 'Sindh' },
      { value: 'balochistan', label: 'Balochistan' },
      { value: 'khyber_pakhtunkhwa', label: 'Khyber Pakhtunkhwa' },
      { value: 'gilgit', label: 'Gilgit-Baltistan' },
      { value: 'kashmir', label: 'Azad Kashmir' },
      { value: 'islamabad', label: 'Islamabad Capital Territory' }
    ],
    required: true,
    placeholder: 'Select your state/province'
  },
  {
    name: 'city',
    label: 'City',
    type: 'text',
    required: true,
    placeholder: 'Enter your city'
  },
  {
    name: 'postalCode',
    label: 'Postal/Zip Code',
    type: 'text',
    required: true,
    placeholder: 'Enter your postal/zip code'
  },
  {
    name: 'streetAddress',
    label: 'Street Address',
    type: 'text',
    required: true,
    placeholder: 'Enter your street address'
  }
];

export const EDUCATIONAL_BG_FIELDS = [
  {
    name: 'education_level',
    label: 'Education Level',
    type: 'select',
    value: '',
    options: [
      { value: 'Matriculation', label: 'Matriculation' },
      { value: 'Intermediate', label: 'Intermediate/FSc/FA' },
      { value: 'Bachelors', label: 'Bachelors' },
      { value: 'Masters', label: 'Masters' },
      { value: 'PhD', label: 'PhD' }
    ],
    required: true
  },
  {
    name: 'school_college_university',
    label: 'School/College/University',
    type: 'text',
    value: '',
    required: true
  },
  {
    name: 'field_of_study',
    label: 'Field of Study',
    type: 'select',
    value: '',
    options: [
      { value: 'Computer Science', label: 'Computer Science' },
      { value: 'Engineering', label: 'Engineering' },
      { value: 'Medicine', label: 'Medicine' },
      { value: 'Business', label: 'Business' }
    ],
    required: true
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
    options: [
      { value: '2010', label: '2010' },
      { value: '2011', label: '2011' },
      { value: '2012', label: '2012' },
      { value: '2013', label: '2013' },
      { value: '2014', label: '2014' },
      { value: '2015', label: '2015' },
      { value: '2016', label: '2016' },
      { value: '2017', label: '2017' },
      { value: '2018', label: '2018' },
      { value: '2019', label: '2019' },
      { value: '2020', label: '2020' },
      { value: '2021', label: '2021' },
      { value: '2022', label: '2022' },
      { value: '2023', label: '2023' },
      { value: '2024', label: '2024' }
    ],
    required: true
  },
  {
    name: 'board',
    label: 'Board',
    type: 'text',
    value: '',
    required: true
  },
  {
    name: 'transcript',
    label: 'Transcript',
    type: 'file',
    value: '',
    required: true,
    fullWidth: true,
    placeholder: 'Upload Transcript (Required)'
  }
];

export const NATIONAL_ID_FIELDS = [
  {
    name: 'front_side',
    label: 'Front Side',
    type: 'file',
    value: '',
    required: false,
    placeholder: 'JPG/PNG and Size: 2 MB Max',
    fullWidth: false
  },
  {
    name: 'back_side',
    label: 'Back Side',
    type: 'file',
    value: '',
    required: false,
    placeholder: 'JPG/PNG and Size: 2 MB Max',
    fullWidth: false
  }
];

export const PROGRAM_PREFERENCE_FIELDS = [
  {
    label: 'SINES-R665 Bachelor of Science in Computer Science (BSCS)',
    value: 'SINES-R665 Bachelor of Science in Computer Science (BSCS)'
  },
  {
    label: 'SINES-R665 Bachelor of Science in Software Engineering (BSSE)',
    value: 'SINES-R665 Bachelor of Science in Software Engineering (BSSE)'
  },
  {
    label: 'SINES-R665 Bachelor of Science in Data Science (BSDS)',
    value: 'SINES-R665 Bachelor of Science in Data Science (BSDS)'
  },
  {
    label: 'SINES-R665 Bachelor of Science in Artificial Intelligence (BSAI)',
    value: 'SINES-R665 Bachelor of Science in Artificial Intelligence (BSAI)'
  },
  {
    label: 'SINES-R665 Bachelor of Science in Cyber Security (BSCS)',
    value: 'SINES-R665 Bachelor of Science in Cyber Security (BSCS)'
  }
];

export const PAYMENT_OPTIONS = [
  {
    title: 'Payment through Credit Card',
    description: `Candidate can pay their application process fee through Credit
                  Card. Please click the “Pay With Credit Card” and follow
                  the instructions.`,
    buttonText: 'Pay with Credit Card',
    note: 'NOTE: Bank service charges 2.75% + FED (16%) will be charged separately.'
  },
  {
    title: 'Payment through Fee Invoice',
    description: `Candidate is required to print the fee invoice and deposit the
                  amount in any online branch of the listed banks. Kindly note
                  that the bank will give you stamped “CANDIDATE’s COPY” only.`,
    buttonText: 'Print Fee Invoice',
    note: 'NOTE: Payment through transfer from Bank Account or ATM will not be accepted.'
  }
];

export const BANKS = [meezanIcon, bopIcon, sbpIcon, mcbIcon, hblIcon];

export const ALL_SECTIONS_INFO = [
  {
    step: 0,
    title: 'Personal Information',
    description:
      'Full Name, Date Of Birth, Gender and Nationality/Country of Residence'
  },
  {
    step: 1,
    title: 'Contact Information',
    description:
      'Email, Phone Number, State/Province, City, Postal/Zip Code andStreet Address '
  },
  {
    step: 2,
    title: 'Educational Background',
    description:
      'Current School/College/University, Education Level, Field of Study, GPA and Academic Achievements'
  },
  {
    step: 0,
    title: 'Financial Information',
    description: 'Household Income and Financial Aid'
  },
  {
    step: 3,
    title: 'National ID Card',
    description: 'Front Side and Back Side'
  }
];

export const DEPOSIT_DETAILS_FIELDS = [
  {
    name: 'bankName',
    label: 'Bank Name',
    type: 'select',
    options: [
      { value: 'meezan', label: 'Meezan Bank Limited' },
      { value: 'hbl', label: 'Habib Bank Limited' },
      { value: 'ubl', label: 'United Bank Limited' },
      { value: 'bop', label: 'Bank of Punjab' }
    ],
    required: true,
    placeholder: 'Select Bank'
  },
  {
    name: 'depositDate',
    label: 'Date Of Deposit',
    type: 'date',
    required: true,
    placeholder: 'Select Date'
  },
  {
    name: 'depositAmount',
    label: 'Deposited Amount',
    type: 'text',
    required: true,
    placeholder: 'Enter Amount'
  },
  {
    name: 'branchAddress',
    label: 'Branch Address',
    type: 'text',
    required: true,
    placeholder: 'Branch Address'
  }
];

// export const TERMS_AND_CONDITIONS = [
//   {
//     title: 'Introduction',
//     content: `Welcome to ScholarBee! This page outlines the terms and conditions ("Terms") governing your use of our platform and services. By accessing or using ScholarBee, you agree to comply with these Terms. Please read them carefully before proceeding.`
//   },
//   {
//     title: '1. Acceptance of Terms',
//     content: `By accessing or using ScholarBee, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, please refrain from using our platform.`
//   },
//   {
//     title: '2. Eligibility',
//     content: `You must be at least 18 years old to use ScholarBee. By accessing or using our platform, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.`
//   },
//   {
//     title: '3. Privacy Policy',
//     content: `Our Privacy Policy outlines how we collect, use, and disclose your personal information. By using ScholarBee, you consent to the collection, use, and disclosure of your personal information as described in our Privacy Policy.`
//   },
//   {
//     title: '4. Account Registration',
//     content: `To access certain features of ScholarBee, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.`
//   },
//   {
//     title: '5. Use of Information',
//     content: `By providing information to ScholarBee, you consent to us using this information to match you with relevant scholarship opportunities. We may also use your information to improve our platform and services.`
//   },
//   {
//     title: '6. Intellectual Property Rights',
//     content: `All content and materials on ScholarBee, including text, graphics, logos, images, are owned or licensed by us and are protected by copyright and other intellectual property laws.`
//   },
//   {
//     title: '7. Limitation of Liability',
//     content: `ScholarBee is provided on an "as is" and "as available" basis. We do not warrant that our platform will be error-free or uninterrupted. In no event shall ScholarBee be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our platform.`
//   },
//   {
//     title: '8. Governing Law',
//     content: `These Terms shall be governed by and construed in accordance with the laws of Article 474, Constitution of Pakistan. Any disputes arising out of or in connection with these Terms shall be resolved through arbitration in Islamabad, Pakistan.`
//   }
// ];

export const TERMS_AND_CONDITIONS = [
  {
    title: 'Privacy Policy',
    content: `At Scholar Bee, we are committed to protecting your privacy. This Privacy Policy outlines the types of personal information we collect, how we use, disclose, and safeguard that information when you visit our website or use our services. By using our website or services, you agree to the practices described in this Privacy Policy.`
  },
  {
    title: '1. Information We Collect',
    content: `We collect different types of information to provide and improve our services:
    • Personal Information: Name, email address, phone number, academic background, and other details you provide.
    • Usage Data: Information about how you interact with our website, including IP addresses, browser types, pages visited, and time spent.
    • Cookies and Tracking Technologies: Used to enhance your experience and track user behavior and preferences.`
  },
  {
    title: '2. How We Use Your Information',
    content: `• To provide, personalize, and improve our services
    • To communicate about updates, opportunities, or changes
    • To analyze usage patterns and improve functionality
    • To ensure compliance with legal obligations and prevent fraud`
  },
  {
    title: '3. Data Security',
    content: `We take reasonable measures to protect your personal information from unauthorized access, alteration, or disclosure. While we strive to protect your data, we cannot guarantee absolute security.`
  },
  {
    title: 'Terms of Service',
    content: `These Terms of Service ("Terms") govern your access to and use of the Scholar Bee website and services. By using our website or services, you agree to comply with and be bound by these Terms.`
  },
  {
    title: '4. Services Provided',
    content: `Scholar Bee provides a platform for students to discover scholarship opportunities from universities worldwide. You agree to use our services for lawful purposes only and are prohibited from:
    • Using the platform for any illegal or harmful activities
    • Violating any applicable laws, regulations, or third-party rights
    • Uploading or distributing harmful content
    • Disrupting platform operations`
  },
  {
    title: '5. User Accounts',
    content: `To access certain features, you must create an account with accurate information. You are solely responsible for maintaining account confidentiality and all activities conducted under your account.`
  },
  {
    title: '6. Content Ownership',
    content: `All content available on Scholar Bee, including text, images, logos, and other materials, is the property of Scholar Bee or its licensors and is protected by intellectual property laws.`
  },
  {
    title: '7. Limitation of Liability',
    content: `To the fullest extent permitted by law, Scholar Bee and its affiliates shall not be liable for any direct, indirect, incidental, special, or consequential damages arising out of your use of the website or services.`
  },
  {
    title: '8. Changes to Terms',
    content: `We may update these Terms from time to time. When we make changes, we will post the updated Terms with a new effective date. Continued use of the platform after any changes indicates your acceptance of the revised Terms.`
  }
];
