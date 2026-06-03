import { cookies } from 'next/headers';
import { API_BASE_URL_DEV } from '@/config/config';

export async function fetchScholarshipDetailsServer(
  id: string
): Promise<any | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL_DEV}/scholarships/${id}`;
    const response = await fetch(url, {
      headers,
      cache: 'no-store' // Ensure fresh data on each request
    });

    if (!response.ok) {
      console.error(
        'Failed to fetch scholarship details:',
        response.statusText
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching scholarship details:', error);
    return null;
  }
}
