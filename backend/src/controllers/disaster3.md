# Get All Disasters (With Query Filters)

## Endpoint

GET /api/v1/disasters

## Query Parameters

| Query | Example |
|---------|---------|
| status | active |
| severity | critical |
| type | flood |
| location | Lucknow |

## Examples

GET /api/v1/disasters

GET /api/v1/disasters?status=active

GET /api/v1/disasters?severity=critical

GET /api/v1/disasters?type=flood

GET /api/v1/disasters?location=Lucknow

GET /api/v1/disasters?status=active&type=flood&location=Lucknow

## Benefits

- Single API for multiple filters
- Cleaner backend design
- Industry-standard approach
- Easy to extend in future
- Case-insensitive location search

## Concepts Used

- req.query
- Dynamic MongoDB Filters
- Regex Search
- Sorting
- REST APIs