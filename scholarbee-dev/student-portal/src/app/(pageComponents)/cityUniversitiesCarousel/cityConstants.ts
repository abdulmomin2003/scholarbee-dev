export interface CityData {
  name: string;
  imageUrl: string;
  label: string;
}

export const POPULAR_CITIES: CityData[] = [
  {
    name: 'Islamabad',
    imageUrl: '/assets/jpeg/islamabad-place.jpg',
    label: 'Apply in Islamabad'
  },
  {
    name: 'Lahore',
    imageUrl: '/assets/jpeg/lahore-place.jpg',
    label: 'Apply in Lahore'
  },
  {
    name: 'Karachi',
    imageUrl: '/assets/jpeg/karachi-place.jpg',
    label: 'Apply in Karachi'
  },
  {
    name: 'Peshawar',
    imageUrl: '/assets/jpeg/peshawar-place.jpg',
    label: 'Apply in Peshawar'
  },
  {
    name: 'Quetta',
    imageUrl: '/assets/jpeg/quetta-place.jpg',
    label: 'Apply in Quetta'
  }
];
