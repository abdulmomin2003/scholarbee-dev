import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AdmissionProgramStatusEnum } from 'src/common/constants/shared.constants';

export function FindWithFiltersAdmissionProgramApiDocs() {

    return applyDecorators(
        ApiOperation({
            summary: 'Search admission programs with advanced filters',
            description: `Search and filter admission programs using Elasticsearch. Supports pagination and various filter criteria.

**IMPORTANT - Backend Strategy: Primitive Filters vs Pseudo-States**

The backend now provides PRIMITIVE FILTERS (receiving_applications, admission_startdate, admission_enddate) that allow the frontend to construct their own pseudo-states (Open, Closed, Closing Soon, Opening Soon, etc.). This separates concerns:

- **Frontend's responsibility**: Combine primitive filters to resolve UI states
- **Backend's responsibility**: Filter based on primitive parameters and return results

**Frontend Pseudo-State Examples:**

1. **"Open" programs**: ?receiving_applications=true&admission_enddate_from=2026-01-01 (future deadline)
2. **"Closed" programs**: ?admission_enddate_to=<current-date> (deadline in past)
3. **"Closing Soon"**: ?admission_enddate_from=<current-date>&admission_enddate_to=<current-date+10-days>
4. **"Opening Soon"**: ?admission_startdate_from=<current-date>&admission_startdate_to=<current-date+15-days>

**Important Behaviors:**

1. **Primitive Filters** (NEW - Recommended):
   - **receiving_applications**: Boolean filter. true = accepting, false = not accepting, undefined = all
   - **admission_startdate_from/to**: Filter by program admission start dates (ISO 8601 format)
   - **admission_enddate_from/to**: Filter by program admission deadlines (ISO 8601 format)
   - Use combinations of these to express any admission state your frontend needs

2. **Status Filter** (DEPRECATED - Legacy support only):
   - Use the "status" parameter to filter by admission status (kept for backward compatibility)
   - "open": Programs with active or upcoming admission deadlines
   - "closed": Programs with expired admission deadlines
   - "closingSoon": Programs with deadlines within 10 days
   - "openingSoon": Programs with start dates within 15 days
   - Not provided: Both open and closed programs (closed ranked lower)

3. **Expired Programs (when no deadline filter applied)**: Programs with expired admission_enddate are included but ranked lower and appear at the end of results. Programs without admission_enddate are not penalized.

4. **Campus Grouping (Collapse)**: When no filters are applied, results are automatically grouped by campus_id to return only one program per campus. When filters are applied, all matching programs are returned without grouping.`,
        }),
        ApiQuery({
            name: 'major',
            required: false,
            type: String,
            description: 'Filter by program major'
        }),
        ApiQuery({
            name: 'min_fee',
            required: false,
            type: Number,
            description: 'Minimum admission fee'
        }),
        ApiQuery({
            name: 'max_fee',
            required: false,
            type: Number,
            description: 'Maximum admission fee'
        }),
        ApiQuery({
            name: 'year',
            required: false,
            type: String,
            description: 'Academic year. Filters programs where EITHER admission_startdate OR admission_enddate falls within the specified year. For example, year="2024" will include programs that start in 2024, end in 2024, or both.'
        }),
        ApiQuery({
            name: 'intake',
            required: false,
            type: String,
            description: 'Intake period'
        }),
        ApiQuery({
            name: 'session_term',
            required: false,
            type: String,
            description: 'Session term (e.g., fall, spring)'
        }),
        ApiQuery({
            name: 'programName',
            required: false,
            type: String,
            description: 'Name of the program'
        }),
        ApiQuery({
            name: 'university',
            required: false,
            type: String,
            description: 'University name',
            // minLength: 1
        }),
        ApiQuery({
            name: 'degree_level',
            required: false,
            enum: ['BACHELORS', 'MASTERS', 'DOCTORATE', 'DIPLOMA'],
            description: 'Level of degree'
        }),
        ApiQuery({
            name: 'courseForm',
            required: false,
            type: String,
            description: 'Form of course delivery'
        }),
        ApiQuery({
            name: 'campusId',
            required: false,
            type: String,
            description: 'ID of the campus'
        }),
        ApiQuery({
            name: 'city',
            required: false,
            type: String,
            description: 'City location (exact match). When provided along with the "area" parameter, this filter overrides/narrows the area search for the city field. The area search uses fuzzy matching while this uses exact matching, so the city filter takes precedence.'
        }),
        ApiQuery({
            name: 'state',
            required: false,
            type: String,
            description: 'State/Province location (exact match). When provided along with the "area" parameter, this filter overrides/narrows the area search for the state field. The area search uses fuzzy matching while this uses exact matching, so the state filter takes precedence.'
        }),
        ApiQuery({
            name: 'country',
            required: false,
            type: String,
            description: 'Country location (exact match). When provided along with the "area" parameter, this filter overrides/narrows the area search for the country field. The area search uses fuzzy matching while this uses exact matching, so the country filter takes precedence.'
        }),
        ApiQuery({
            name: 'area',
            required: false,
            type: String,
            description: 'General area search (searches across city/state/country/address with fuzzy matching). Note: If specific city, state, or country filters are also provided, those exact-match filters will override/narrow the area search for their respective fields. For example, area="New York" + city="Boston" will only return programs in Boston (city filter takes precedence).'
        }),
        ApiQuery({
            name: 'receiving_applications',
            required: false,
            type: Boolean,
            description: '[PRIMITIVE FILTER] Filter by whether programs are receiving applications. true = only programs accepting applications, false = only programs NOT accepting applications, undefined/not provided = all programs regardless of status. Frontend should use this with date filters to construct pseudo-states (Open, Closed, Closing Soon, etc.).'
        }),
        ApiQuery({
            name: 'admission_startdate_from',
            required: false,
            type: String,
            description: '[PRIMITIVE FILTER] Filter by admission start date (from). ISO 8601 format (e.g., "2026-01-01"). Returns programs with admission_startdate >= this date.'
        }),
        ApiQuery({
            name: 'admission_startdate_to',
            required: false,
            type: String,
            description: '[PRIMITIVE FILTER] Filter by admission start date (to). ISO 8601 format (e.g., "2026-12-31"). Returns programs with admission_startdate <= this date.'
        }),
        ApiQuery({
            name: 'admission_enddate_from',
            required: false,
            type: String,
            description: '[PRIMITIVE FILTER] Filter by admission end date/deadline (from). ISO 8601 format (e.g., "2026-01-01"). Returns programs with admission_enddate >= this date. Use to find programs with future deadlines.'
        }),
        ApiQuery({
            name: 'admission_enddate_to',
            required: false,
            type: String,
            description: '[PRIMITIVE FILTER] Filter by admission end date/deadline (to). ISO 8601 format (e.g., "2026-05-01"). Returns programs with admission_enddate <= this date. Use to find programs with deadlines before a certain date (e.g., closed programs when set to now).'
        }),
        ApiQuery({
            name: 'status',
            required: false,
            deprecated: true,
            enum: AdmissionProgramStatusEnum,
            description: '[DEPRECATED] Use primitive filters instead: receiving_applications + admission_startdate/admission_enddate. Frontend should construct pseudo-states from primitive parameters. Legacy support: "open" returns programs with active/upcoming deadlines. "closed" returns expired programs. "closingSoon" returns deadlines within 10 days. "openingSoon" returns start dates within 15 days.'
        }),
        ApiQuery({
            name: 'page',
            required: false,
            type: Number,
            description: 'Page number for pagination',
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            type: Number,
            description: 'Number of items per page',
        }),
        ApiResponse({
            status: 200,
            description: 'Successfully retrieved admission programs',
            schema: {
                example: {
                    docs: [{
                        _id: '507f1f77bcf86cd799439011',
                        doc_id: '507f1f77bcf86cd799439011',
                        program_title: 'Computer Science',
                        major: 'Computer Science',
                        degree_level: 'BACHELORS',
                        admission_fee: 50000,
                        isFavorite: false
                    }],
                    pagination: {
                        totalDocs: 150,
                        limit: 10,
                        totalPages: 15,
                        page: 1,
                        pagingCounter: 1,
                        hasPrevPage: false,
                        hasNextPage: true,
                        prevPage: null,
                        nextPage: 2,
                        currentPageDocs: 10
                    }
                }
            }
        }),
    );
}