# getRequestById Controller

## Purpose

The `getRequestById()` controller is used to fetch a specific disaster relief request from the database using its MongoDB ObjectId.

---

## Endpoint

```http
GET /api/v1/requests/:requestId
```

Example:

```http
GET /api/v1/requests/6a2bee5484f30f2015b7bd60
```

---

## Route

```js
router.get(
  "/:requestId",
  verifyJWT,
  getRequestById
);
```

This is a protected route, so the user must be logged in.

---

## Workflow

```text
Client Request
      ↓
verifyJWT Middleware
      ↓
Extract requestId from req.params
      ↓
Validate MongoDB ObjectId
      ↓
Find Request in Database
      ↓
Populate Creator Details
      ↓
Check Request Exists
      ↓
Return Response
```

---

## Extract ID

```js
const { requestId } = req.params;
```

Example:

```http
GET /api/v1/requests/6a2bee5484f30f2015b7bd60
```

Output:

```js
requestId = "6a2bee5484f30f2015b7bd60";
```

---

## Validate ObjectId

```js
if (!mongoose.Types.ObjectId.isValid(requestId.trim())) {
  throw new ApiError(400, "Invalid Request ID");
}
```

### Why?

* Prevent invalid database queries
* Avoid Mongoose CastError
* Improve API reliability

---

## Fetch Request

```js
const request = await Request.findById(requestId)
  .populate("createdBy", "fullName email role");
```

### Why populate()?

Without populate:

```json
{
  "createdBy": "6a2b09e6d27424f65f00d795"
}
```

With populate:

```json
{
  "createdBy": {
    "fullName": "Tanya Sahu",
    "email": "tanya@gmail.com",
    "role": "victim"
  }
}
```

---

## Check Request Exists

```js
if (!request) {
  throw new ApiError(
    404,
    "No request found with given ID"
  );
}
```

---

## Return Response

```js
return res.status(200).json(
  new ApiResponse(
    200,
    request,
    "Request found successfully"
  )
);
```

---

## HTTP Status Codes

| Status Code | Meaning            |
| ----------- | ------------------ |
| 200         | Request Found      |
| 400         | Invalid MongoDB ID |
| 401         | User Not Logged In |
| 404         | Request Not Found  |

---

## Concepts Learned

* req.params
* Dynamic Routes
* MongoDB ObjectId
* mongoose.Types.ObjectId.isValid()
* findById()
* populate()
* Protected Routes
* Error Handling
* API Response Structure

---

## Interview Explanation

The `getRequestById()` controller fetches a specific disaster relief request using its MongoDB ObjectId. First, the ID is extracted from URL parameters and validated. Then the request is fetched using `findById()`, creator details are populated using `populate()`, and appropriate responses are returned based on whether the request exists or not.
