---
name: detail-list-endpoints-v1
overview: Implement new filter-based detail list endpoints for admission programs and universities, replacing legacy ID/slug-based detail endpoints while preserving response schemas.
todos:
  - id: checkpoint-1-analyze-legacy
    content: "Checkpoint 1: Analyze legacy endpoints and document schemas"
    status: pending
  - id: checkpoint-2-create-dtos
    content: "Checkpoint 2: Create query DTOs with validation decorators"
    status: pending
  - id: checkpoint-3-add-controllers
    content: "Checkpoint 3: Add controller routes for detail-list endpoints"
    status: pending
  - id: checkpoint-4-implement-services
    content: "Checkpoint 4: Implement service methods with filter-based lookup"
    status: pending
  - id: checkpoint-5-tests-docs
    content: "Checkpoint 5: Add tests and API documentation"
    status: pending
isProject: false
---

## Goal

Implement two new `detail-list` endpoints that fetch a single resource via unique query filters, returning an array with at most one rich detail object, matching existing legacy schemas.

## Endpoints & Parameters


| Endpoint                                  | Query Parameters                                   | Count |
| ----------------------------------------- | -------------------------------------------------- | ----- |
| `GET /api/admission-programs/detail-list` | `university-name`, `major`, `degree_level`, `city` | 4     |
| `GET /api/universities/detail-list`       | `university-name`, `city`                          | 2     |


---

## Checkpoint Plan

- **Checkpoint 1**: Analyze legacy endpoints - Review existing admission program and university profile endpoints to capture response schemas and data-loading logic.
- **Checkpoint 2**: Create query DTOs - Define DTOs with `class-validator` decorators for both endpoints.
- **Checkpoint 3**: Add controller routes - Implement `@Get('detail-list')` handlers in both controllers.
- **Checkpoint 4**: Implement service methods - Create `getDetailList()` methods with `limit(1)` and schema mapping.
- **Checkpoint 5**: Add tests and documentation - Verify behavior and update API docs for frontend.

---

## Checkpoint Details

### Checkpoint 1: Analyze Legacy Endpoints

**Objective:** Discover and document the response schemas of existing detail endpoints.

**Tasks:**

- Locate admission program detail endpoint (`/api/admission-programs/slug/[slug]`)
  - Identify service method and Mongoose model
  - Document response shape including populated relations (`campus`, `university`, `admission_announcements`)
- Locate university profile endpoint (`/universities/slug/${universityId}/profile`)
  - Identify service method and schema
  - Document fields: `university_logo`, `city`, `state`, `country`, `established_date`, `accreditation`, `ranking`, `total_campuses`

**Files to Review:**

- [admission-programs.controller.ts](src/admission-programs/controllers/admission-programs.controller.ts)
- [universities.controller.ts](src/universities/universities.controller.ts)
- Related service files and schemas

---

### Checkpoint 2: Create Query DTOs

**Objective:** Define query parameter DTOs with validation.

**Admission Program DTO** (`AdmissionProgramDetailListQueryDto`):

```typescript
// Fields (all required): university-name, major, degree_level, city
// Decorators: @IsString(), @IsNotEmpty(), @ApiProperty()
```

**University DTO** (`UniversityDetailListQueryDto`):

```typescript
// Fields (all required): university-name, city
// Decorators: @IsString(), @IsNotEmpty(), @ApiProperty()
```

**Placement:**

- `src/admission-programs/dto/admission-program-detail-list-query.dto.ts`
- `src/universities/dto/university-detail-list-query.dto.ts`

---

### Checkpoint 3: Add Controller Routes

**Objective:** Implement new `detail-list` GET handlers.

**Admission Programs Controller:**

```typescript
@Get('detail-list')
async getDetailList(@Query() query: AdmissionProgramDetailListQueryDto) {
  return this.admissionProgramsService.getDetailList(query);
}
```

**Universities Controller:**

```typescript
@Get('detail-list')
async getDetailList(@Query() query: UniversityDetailListQueryDto) {
  return this.universitiesService.getDetailList(query);
}
```

**Requirements:**

- Add OpenAPI/Swagger decorators for documentation
- Return type: `Promise<DetailDto[]>` (array with at most one element)

---

### Checkpoint 4: Implement Service Methods

**Objective:** Create filter-based lookup methods with `limit(1)`.

**Admission Programs Service:**

- Build filter from: `university-name`, `major`, `degree_level`, `city`
- Apply `limit(1)` and necessary `populate`/`join`
- Return `[record]` or `[]`

**Universities Service:**

- Build filter from: `university-name`, `city`
- Apply `limit(1)` with aggregations for derived fields
- Return `[profile]` or `[]`

**Key Requirements:**

- Match legacy schema exactly
- Always return array (frontend uses `response[0]`)

---

### Checkpoint 5: Add Tests and Documentation

**Objective:** Verify behavior and document for frontend.

**Testing:**

- Service unit tests for filter construction and `limit(1)`
- Controller/e2e tests for query param handling
- Verify array wrapping and schema parity

**Documentation:**

- Update OpenAPI descriptions
- Document new endpoints as source of truth for detail views
- Note: responses are arrays with at most one entry

**Manual Verification URLs:**

- `GET /api/admission-programs/detail-list?university-name=...&major=...&degree_level=...&city=...`
- `GET /api/universities/detail-list?university-name=...&city=...`

