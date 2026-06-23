```http
1. createDisaster()        ✅ Admin/NGO
2. getAllDisasters()       ✅ Everyone
3. getDisasterById()       ✅ Everyone
4. resolveDisaster()       ✅ Admin/NGO
5. getActiveDisasters()    ✅ Everyone
````


# Create Disaster API

## Purpose
Allows Admin or NGO to declare a new disaster in the system.

---

## Endpoint

POST /api/v1/disasters/create

---

## Authorization

Required: Access Token

Allowed Roles:
- admin
- ngo

Not Allowed:
- victim
- volunteer

---

## Request Body

{
  "title": "Flood in Lucknow",
  "type": "flood",
  "location": "Lucknow",
  "severity": "high",
  "description": "Heavy rainfall caused flooding",
  "startDate": "2026-06-15",
  "affectedPeople": 5000
}

---

## Validations

### Required Fields
- title
- type
- location
- startDate

### Role Check
Only Admin or NGO can create a disaster.

### Duplicate Check
Prevent creation of an already active disaster with the same:
- type
- location
- startDate

---

## Workflow

1. Receive disaster details from req.body
2. Validate required fields
3. Verify user role (admin/ngo)
4. Check for duplicate active disaster
5. Create disaster document
6. Return success response

---

## Success Response

Status Code: 201 Created

{
  "success": true,
  "message": "Disaster declared successfully"
}

---

## Possible Errors

400 - Missing required fields

403 - User is not Admin/NGO

409 - Disaster already exists

500 - Server Error

---

## Concepts Used

- req.body
- Authentication (verifyJWT)
- Authorization (Role-Based Access Control)
- MongoDB findOne()
- MongoDB create()
- Async/Await
- Error Handling
- REST API Design