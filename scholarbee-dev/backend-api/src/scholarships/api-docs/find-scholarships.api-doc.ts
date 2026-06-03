import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import {
    ScholarshipTypeEnum,
    ScholarshipStatusEnum,
    ScholarshipLocationEnum,
    DegreeLevelEnum,
} from 'src/common/constants/shared.constants';
import { ScholarshipDeadlineStatusEnum } from '../dto/query-scholarship.dto';

export function FindScholarshipsApiDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'List scholarships',
            description: `Returns a paginated list of scholarships using filter and search query parameters.

**Important Behaviors:**

1. **Deadline-Based Sorting (Always Active)**: 
   - Scholarships with open application deadlines (application_deadline >= current date or null/missing) are displayed at the top of the listing.
   - Scholarships with expired application deadlines (application_deadline < current date) are displayed at the bottom of the listing.
   - This sorting behavior applies regardless of whether filters are applied or not.
   - After deadline status sorting, results are further sorted by the specified \`sortBy\` and \`sortOrder\` parameters.

2. **Grouping by Organization/University (When No Filters Applied)**:
   - When no filters are applied (except pagination and default parameters like \`page\`, \`limit\`, \`sortBy\`, \`sortOrder\`, \`populate\`), scholarships are automatically grouped by organization_id AND university_id combination.
   - Only one scholarship per unique organization/university combination is displayed in the main listing.
   - This prevents results from being overwhelmed by multiple scholarships from the same organization or university.
   - The totalDocs count reflects the total number of documents before grouping, but the actual available results are limited to unique organization/university combinations.
   - When any filter is applied, all matching scholarships are returned without grouping.

3. **Consistency**:
   - Grouping and sorting behavior remains consistent across page refreshes and sessions.
   - Newly added scholarships follow the same rules automatically.`
        }),
        // Search and text filters
        ApiQuery({
            name: 'search',
            required: false,
            description: 'Search text to match against scholarship_name or scholarship_description (case-insensitive)'
        }),
        ApiQuery({
            name: 'scholarship_name',
            required: false,
            description: 'Filter by scholarship name (case-insensitive regex match)'
        }),
        ApiQuery({
            name: 'major',
            required: false,
            description: 'Filter by major field (case-insensitive regex match)'
        }),

        // Enum filters
        ApiQuery({
            name: 'scholarship_type',
            required: false,
            enum: ScholarshipTypeEnum,
            description: 'Filter by scholarship type: merit, need, or sports'
        }),
        ApiQuery({
            name: 'status',
            required: false,
            enum: ScholarshipStatusEnum,
            description: 'Filter by scholarship status: open or closed'
        }),
        ApiQuery({
            name: 'location',
            required: false,
            enum: ScholarshipLocationEnum,
            description: 'Filter by scholarship location: local or international'
        }),
        ApiQuery({
            name: 'degree_level',
            required: false,
            enum: DegreeLevelEnum,
            description: 'Filter by degree level: ' + Object.values(DegreeLevelEnum).join(', ')
        }),

        // ID filters
        ApiQuery({
            name: 'university_id',
            required: false,
            description: 'Filter by university ID (MongoDB ObjectId)'
        }),
        ApiQuery({
            name: 'campus_id',
            required: false,
            description: 'Filter by campus ID (MongoDB ObjectId). Matches scholarships where campus_ids array contains this ID.'
        }),
        ApiQuery({
            name: 'country',
            required: false,
            description: 'Filter by country ID (MongoDB ObjectId)'
        }),
        ApiQuery({
            name: 'region',
            required: false,
            description: 'Filter by region ID (MongoDB ObjectId)'
        }),

        // Deadline filters
        ApiQuery({
            name: 'deadline_status',
            required: false,
            enum: ScholarshipDeadlineStatusEnum,
            description: 'Filter by deadline status: active (application_deadline >= current date or null) or expired (application_deadline < current date). Cannot be used with deadline_from or deadline_to.'
        }),
        ApiQuery({
            name: 'deadline_from',
            required: false,
            type: String,
            description: 'Filter scholarships with application_deadline >= this date (ISO 8601 format). Cannot be used with deadline_status.'
        }),
        ApiQuery({
            name: 'deadline_to',
            required: false,
            type: String,
            description: 'Filter scholarships with application_deadline <= this date (ISO 8601 format). Cannot be used with deadline_status.'
        }),

        // Amount filters
        ApiQuery({
            name: 'amountMin',
            required: false,
            type: Number,
            description: 'Filter scholarships with amount >= this value'
        }),
        ApiQuery({
            name: 'amountMax',
            required: false,
            type: Number,
            description: 'Filter scholarships with amount <= this value'
        }),

        // Rating filter
        ApiQuery({
            name: 'rating',
            required: false,
            type: Number,
            description: 'Filter scholarships with rating >= this value'
        }),

        // Favorites filter
        ApiQuery({
            name: 'favouriteBy',
            required: false,
            type: [String],
            description: 'Filter scholarships favorited by user IDs (array of MongoDB ObjectIds)'
        }),

        // Pagination and sorting
        ApiQuery({
            name: 'page',
            required: false,
            type: Number,
            description: 'Page number (default: 1)'
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            type: Number,
            description: 'Number of results per page (default: 10)'
        }),
        ApiQuery({
            name: 'sortBy',
            required: false,
            type: String,
            description: 'Field to sort by (default: created_at). Applied after deadline status sorting.'
        }),
        ApiQuery({
            name: 'sortOrder',
            required: false,
            enum: ['asc', 'desc'],
            description: 'Sort order: asc or desc (default: desc)'
        }),
        ApiQuery({
            name: 'populate',
            required: false,
            type: Boolean,
            description: 'Whether to populate referenced fields (university_id, region, organization_id). Default: true'
        }),

        ApiResponse({
            status: 200,
            description: 'Paginated scholarships list',
            schema: {
                example: {
                    data: [{
                        _id: '617f1f77bcf86cd799439099',
                        scholarship_name: 'Merit Scholarship 2025',
                        scholarship_description: 'Full tuition for top students',
                        amount: 1000,
                        application_deadline: '2025-12-31T23:59:59.000Z',
                        scholarship_type: 'merit',
                        status: 'open',
                        location: 'local',
                        degree_level: 'Bachelors'
                    }],
                    meta: {
                        total: 1,
                        groupedTotal: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1
                    }
                }
            }
        }),
    );
}
