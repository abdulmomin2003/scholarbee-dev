import { cookies } from 'next/headers';
import { API_BASE_URL_DEV } from '@/config/config';

export async function fetchUniversityProfileServer(
  universityName: string,
  citySlug: string
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

    // const url = `${API_BASE_URL_DEV}/universities/detail-list?slug=${universityName}&city=${citySlug}`;
    const url = `${API_BASE_URL_DEV}/campuses/slug/{slug}?slug=${universityName}&city=${citySlug}`;

    const response = await fetch(url, {
      headers,
      cache: 'no-store' // Ensure fresh data on each request
    });

    if (!response.ok) {
      console.error('Failed to fetch university profile:', response.statusText);
      return null;
    }

    const data = await response.json();
    return Array.isArray(data) ? (data[0] ?? null) : data;
  } catch (error) {
    console.error('Error fetching university profile:', error);
    return null;
  }
}
