# Get All Disasters

## Purpose
Fetch all disasters from the database.

## Endpoint
GET /api/v1/disasters

## Access
- Admin
- NGO
- Volunteer
- Victim

## Workflow

1. Fetch all disasters
2. Sort by latest first
3. Return disaster array

## Response

Status: 200 OK

Data:
[
  {
    "title": "Flood in Lucknow",
    "type": "flood",
    "status": "active"
  }
]

## Important

- Returns an array of disasters.
- Empty array is returned if no disasters exist.
- No 404 error for empty results.