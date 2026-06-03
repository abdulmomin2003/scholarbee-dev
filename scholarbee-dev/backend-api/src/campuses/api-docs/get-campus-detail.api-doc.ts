import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function GetCampusDetailApiDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get campus detail profile by campus slug',
      description: 'Retrieves comprehensive campus details including metadata, overview, selected campus information, and other campuses from the same university. Mirrors the university detail-list API response structure but identified by campus slug.',
    }),
    ApiQuery({
      name: 'city',
      required: false,
      type: String,
      description: 'Optional city filter (case-insensitive). Validates that campus is in this city.',
      example: 'Peshawar',
    }),
    ApiResponse({
      status: 200,
      description: 'Campus detail profile with metadata, overview, selected campus, and other campuses',
      schema: {
        example: {
          metadata: {
            university_name: 'FAST - National University for Computer & Emerging Sciences',
            university_logo: 'https://storage.googleapis.com/scholarbee-general-assets/fast-logo.png',
            city: 'Peshawar',
            state: 'KPK',
            country: 'Pakistan',
            established_date: '2002-01-15',
            accreditation: ['HEC Approved', 'BZU Affiliated'],
            ranking: {
              qs_ranking: 801,
              world_ranking: 2500,
            },
            total_campuses: 5,
          },
          overview: {
            description: 'FAST-NUCES is a leading institution offering quality education in computer and emerging sciences...',
          },
          selectedCampus: {
            id: '651234abcd5678ef9012c001',
            name: 'FAST - NUCES Peshawar Campus',
            faculty: 45,
            area: '5 acres',
            housing_available: true,
            website: 'https://peshawar.fast.edu.pk',
            address: {
              _id: '651234abcd5678ef9012a001',
              address_line_1: 'Plot 24-A, Peshawar Road',
              city: 'Peshawar',
              state: 'KPK',
              country: 'Pakistan',
              postal_code: '25000',
              latitude: 34.0195,
              longitude: 71.5769,
              created_at: '2025-01-01T00:00:00.000Z',
              createdAt: '2025-01-01T00:00:00.000Z',
              updatedAt: '2025-01-01T00:00:00.000Z',
              __v: 0,
            },
            pictures: [
              {
                url: 'https://storage.googleapis.com/scholarbee-general-assets/fast-peshawar-1.jpg',
              },
              {
                url: 'https://storage.googleapis.com/scholarbee-general-assets/fast-peshawar-2.jpg',
              },
            ],
            primary_picture: 'https://storage.googleapis.com/scholarbee-general-assets/fast-peshawar-logo.png',
            scholarbee_verified: true,
          },
          otherCampuses: [
            {
              id: '651234abcd5678ef9012c002',
              name: 'FAST - NUCES Islamabad Campus',
              faculty: 52,
              area: '8 acres',
              housing_available: true,
              website: 'https://islamabad.fast.edu.pk',
              address: {
                _id: '651234abcd5678ef9012a002',
                address_line_1: 'H-8/4, Opposite Adiala Road',
                city: 'Islamabad',
                state: 'Punjab',
                country: 'Pakistan',
                postal_code: '44000',
                latitude: 33.7323,
                longitude: 73.2075,
                created_at: '2025-01-01T00:00:00.000Z',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z',
                __v: 0,
              },
              pictures: [
                {
                  url: 'https://storage.googleapis.com/scholarbee-general-assets/fast-islamabad-1.jpg',
                },
              ],
              primary_picture: 'https://storage.googleapis.com/scholarbee-general-assets/fast-islamabad-logo.png',
              scholarbee_verified: true,
            },
            {
              id: '651234abcd5678ef9012c003',
              name: 'FAST - NUCES Karachi Campus',
              faculty: 38,
              area: '4.5 acres',
              housing_available: false,
              website: 'https://karachi.fast.edu.pk',
              address: {
                _id: '651234abcd5678ef9012a003',
                address_line_1: 'Block-B, North Nazimabad',
                city: 'Karachi',
                state: 'Sindh',
                country: 'Pakistan',
                postal_code: '74600',
                latitude: 24.9556,
                longitude: 67.1243,
                created_at: '2025-01-01T00:00:00.000Z',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z',
                __v: 0,
              },
              pictures: [],
              primary_picture: 'https://storage.googleapis.com/scholarbee-general-assets/fast-karachi-logo.png',
              scholarbee_verified: true,
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Campus not found with the given campus slug',
      schema: {
        example: {
          statusCode: 404,
          message: 'Campus not found with slug "nonexistent-campus"',
        },
      },
    }),
  );
}
