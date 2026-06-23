# Get All Requests Controller

## Purpose

The `getAllRequests()` controller is used to fetch all disaster relief requests from the database.

This API helps volunteers, NGOs, and admins view active requests and decide where help is needed.

---

## Endpoint

```http
GET /api/v1/requests
```

---

## Authentication

This route is protected using the `verifyJWT` middleware.

```js
router.get("/", verifyJWT, getAllRequest);
```

Only authenticated users can access this endpoint.

---

## Workflow

```text
Client Request
      ↓
verifyJWT Middleware
      ↓
User Authenticated
      ↓
Fetch Requests from MongoDB
      ↓
Populate User Information
      ↓
Sort by Latest First
      ↓
Send Response
```

---

## Database Query

```js
const requests = await Request.find()
  .populate("createdBy", "fullName email role")
  .sort({ createdAt: -1 });
```

### Explanation

### Request.find()

Fetches all request documents from the database.

Returns:

```js
[]
```

if no requests exist.

---

### populate()

```js
.populate("createdBy", "fullName email role")
```

The Request model stores only the User ObjectId.

Without populate:

```js
{
  createdBy: "687ab12..."
}
```

With populate:

```js
{
  createdBy: {
    fullName: "Tanya Sahu",
    email: "tanya@gmail.com",
    role: "victim"
  }
}
```

This makes the API more useful for volunteers and admins.

---

### sort()

```js
.sort({ createdAt: -1 })
```

Returns newest requests first.

Example:

```text
Newest Request
Older Request
Oldest Request
```

---

## Response

```js
return res.status(200).json(
  new ApiResponse(
    200,
    requests,
    "All requests fetched successfully"
  )
);
```

Success Response:

```json
{
  "statusCode": 200,
  "data": [],
  "message": "All requests fetched successfully"
}
```

---

## Why Not Return 404 When No Requests Exist?

Bad Approach:

```js
if (requests.length === 0) {
  throw new ApiError(404, "No requests found");
}
```

Reason:

An empty list is not an error.

Examples:

* No Instagram followers
* No Amazon orders
* No LinkedIn notifications

All return:

```js
[]
```

instead of 404.

Therefore:

```text
GET Collection + No Data
=
200 OK + []
```

---

## Interview Question

### Why did you use populate()?

Answer:

The Request document stores only the creator's ObjectId. Using populate() allows me to retrieve selected user information such as full name, email, and role in the same API response, making the data more useful for volunteers, NGOs, and admins.

---

## Concepts Learned

* Protected Routes
* JWT Authentication
* Middleware Flow
* MongoDB find()
* MongoDB populate()
* MongoDB sort()
* REST API Design
* API Response Structure
* Error Handling
