# Elasticsearch Implementation for Admission Programs

## Overview

This document describes the implementation of Elasticsearch-based search functionality for admission programs, replacing the MongoDB-based `findWithFilters` method with a more performant and feature-rich Elasticsearch implementation.

## Implementation Details

### Service Method: `findWithFiltersV2`

The new `findWithFiltersV2` method in `AdmissionProgramsService` provides:

- **Same Interface**: Uses the same `FilterAdmissionProgramDto` and returns the same response structure
- **Enhanced Search**: Fuzzy matching, better relevance scoring, and improved performance
- **Fallback Mechanism**: Automatically falls back to MongoDB if Elasticsearch fails
- **Pagination Support**: Full pagination support with the same interface

### Key Features

#### 1. **Fuzzy Search**
- Program title searches use fuzzy matching with `fuzziness: 'AUTO'`
- Handles typos and slight variations in search terms
- Boosted scoring for program title matches

#### 2. **Filter Support**
- **Text Filters**: `major`, `programName` with fuzzy matching
- **Exact Filters**: `university`, `campusId`, `intake`, `degree_level`, `courseForm`
- **Range Filters**: `min_fee`, `max_fee`, `year` (admission start date)
- **Legacy Support**: Backward compatibility with `fee` parameter

#### 3. **Sorting**
- Results sorted by relevance score (descending)
- Secondary sort by program title (ascending)

#### 4. **Pagination**
- Full pagination support with `page` and `limit` parameters
- Returns comprehensive pagination metadata

### Elasticsearch Query Structure

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "data.program_title": {
              "query": "computer science",
              "fuzziness": "AUTO",
              "boost": 2.0
            }
          }
        }
      ],
      "filter": [
        {
          "range": {
            "data.tuition_fee": {
              "gte": 10000,
              "lte": 50000
            }
          }
        },
        {
          "term": {
            "data.study_mode.keyword": "Onsite"
          }
        }
      ]
    }
  },
  "from": 0,
  "size": 10,
  "sort": [
    { "_score": { "order": "desc" } },
    { "data.program_title.keyword": { "order": "asc" } }
  ]
}
```

### Data Transformation

The service transforms Elasticsearch results to match the expected MongoDB response format:

```typescript
const docs = hits.map((hit: any) => {
  const source = hit._source;
  return {
    _id: source.data._id,
    admission: source.data.admission_id,
    program_id: source.data.program_id,
    fee_structures: [{
      tuition_fee: source.data.tuition_fee,
      currency: source.data.currency || 'USD'
    }],
    program: {
      name: source.data.program_title,
      campus_id: source.data.campus_id,
      degree_level: source.data.degree_level,
      mode_of_study: source.data.study_mode,
      intake_periods: [{
        intake_period: source.data.intake_period
      }]
    },
    admission: {
      university_id: source.data.university_id,
      admission_startdate: source.data.admission_startdate,
      admission_enddate: source.data.admission_enddate
    }
  };
});
```

### Error Handling

The implementation includes robust error handling:

1. **Elasticsearch Failures**: Logs errors and falls back to MongoDB
2. **Connection Issues**: Graceful degradation to MongoDB
3. **Query Errors**: Detailed error logging for debugging

### Controller Integration

The controller has been updated to use the new v2 method:

```typescript
@Get('with-filters')
async findWithFilters(
  @Query() filterDto: FilterAdmissionProgramDto,
  @Req() req: Request,
) {
  await this.admissionProgramsService.indexAdmissionProgramSearchHistory(
    req.user?.['sub'],
    filterDto,
  );
  
  // Use the new Elasticsearch-based v2 service method
  // Comment out the old MongoDB-based method for now
  // const result = await this.admissionProgramsService.findWithFilters(filterDto);
  
  // Use the new v2 method with Elasticsearch
  const result = await this.admissionProgramsService.findWithFiltersV2(filterDto);
  return result;
}
```

## Configuration

### Required Dependencies

The service requires the following dependencies:

```typescript
constructor(
  @InjectModel(AdmissionProgram.name)
  private admissionProgramModel: Model<AdmissionProgramDocument>,
  private readonly admissionProgramsGateway: AdmissionProgramsGateway,
  private readonly searchHistoryAnalyticsService: SearchHistoryAnalyticsService,
  private readonly elasticsearchService: ElasticsearchService, // New dependency
  @InjectModel(Application.name)
  private applicationModel: Model<ApplicationDocument>,
  @InjectModel(ExternalApplication.name)
  private externalApplicationModel: Model<ExternalApplicationDocument>,
) {}
```

### Module Configuration

The `AdmissionProgramsModule` already includes the `ElasticsearchModule`:

```typescript
@Module({
  imports: [
    // ... other imports
    ElasticsearchModule, // Already included
  ],
  // ... rest of module config
})
```

## Index Structure

The Elasticsearch index `admission-programs` contains documents with the following structure:

```json
{
  "data": {
    "_id": "admission_program_id",
    "program_title": "Computer Science",
    "tuition_fee": 25000,
    "study_mode": "Onsite",
    "location": "Islamabad, Pakistan",
    "university_id": "university_id",
    "campus_id": "campus_id",
    "degree_level": "Bachelors",
    "intake_period": "Fall",
    "admission_startdate": "2024-09-01T00:00:00.000Z",
    "admission_enddate": "2024-12-31T23:59:59.000Z",
    "currency": "USD"
  },
  "missing_fields": ["field1", "field2"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Performance Benefits

1. **Faster Search**: Elasticsearch is optimized for full-text search
2. **Fuzzy Matching**: Handles typos and variations automatically
3. **Relevance Scoring**: Better ranking of search results
4. **Scalability**: Can handle large datasets efficiently
5. **Real-time Search**: Near-instant search results

## Migration Strategy

1. **Gradual Rollout**: The v2 method is used alongside the original method
2. **Fallback Support**: Automatic fallback to MongoDB if Elasticsearch fails
3. **Same Interface**: No breaking changes for frontend applications
4. **Monitoring**: Error logging helps identify and resolve issues

## Future Enhancements

1. **Aggregations**: Add support for faceted search and analytics
2. **Suggestions**: Implement search suggestions and autocomplete
3. **Highlighting**: Add search result highlighting
4. **Advanced Filters**: Support for more complex filter combinations
5. **Performance Optimization**: Query optimization and caching strategies

## Testing

To test the implementation:

1. **Unit Tests**: Test individual query building logic
2. **Integration Tests**: Test with actual Elasticsearch instance
3. **Fallback Tests**: Verify MongoDB fallback works correctly
4. **Performance Tests**: Compare response times with MongoDB

## Monitoring

Monitor the following metrics:

1. **Search Performance**: Response times and throughput
2. **Error Rates**: Elasticsearch connection and query errors
3. **Fallback Usage**: Frequency of MongoDB fallback
4. **User Experience**: Search result relevance and accuracy

This implementation provides a robust, scalable search solution while maintaining backward compatibility and providing a smooth migration path.
