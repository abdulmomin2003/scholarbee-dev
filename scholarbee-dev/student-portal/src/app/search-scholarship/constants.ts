export const StipendAmountOptions = [
  { label: 'PKR 0 - 50,000', value: '0-50000' },
  { label: 'PKR 50,000 - 1,00,000', value: '50000-100000' },
  { label: 'PKR 100,000 - 150,000', value: '100000-150000' },
  { label: 'PKR 150,000 - 200,000', value: '150000-200000' },
  { label: 'PKR 200,000 - 250,000', value: '200000-250000' },
  { label: 'PKR 250,000 - 300,000', value: '250000-300000' },
  { label: 'PKR 300,000 - 350,000', value: '300000-350000' },
  { label: 'PKR 350,000 - 400,000', value: '350000-400000' },
  { label: 'PKR 400,000 - 450,000', value: '400000-450000' },
  { label: 'PKR 450,000 - 500,000', value: '450000-500000' }
];

export const FILTER_FIELDS = [
  {
    name: 'degree_level',
    label: 'Study Level',
    options: [
      { label: 'Matriculation', value: 'Matriculation' },
      { label: 'Intermediate', value: 'Intermediate' },
      { label: 'Bachelors', value: 'Bachelors' },
      { label: 'Masters', value: 'Masters' },
      { label: 'PhD', value: 'PhD' }
    ]
  },
  {
    name: 'scholarship_type',
    label: 'Scholarship Type',
    options: [
      { label: 'Merit', value: 'merit' },
      { label: 'Need', value: 'need' }
    ]
  },
  {
    name: 'location',
    label: 'Location',
    options: [
      { label: 'Local', value: 'local' },
      { label: 'International', value: 'international' }
    ]
  },
  {
    name: 'amount',
    label: 'Stipend Amount',
    options: StipendAmountOptions
  },
  // {
  //   name: 'status',
  //   label: 'Status',
  //   options: [
  //     { label: 'Open', value: 'open' },
  //     { label: 'Closed', value: 'closed' }
  //   ]
  // },
  {
    name: 'deadline_status',
    label: 'Status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Expired', value: 'expired' }
    ]
  }
  // {
  //   name: 'rating',
  //   label: 'Rating',
  //   options: [
  //     { label: '1', value: '1' },
  //     { label: '2', value: '2' },
  //     { label: '3', value: '3' },
  //     { label: '4', value: '4' },
  //     { label: '5', value: '5' }
  //   ]
  // }
];
