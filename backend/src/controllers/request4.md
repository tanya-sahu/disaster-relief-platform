# Get Request By ID Controller

## Purpose

Fetch a specific disaster relief request using its unique ID.

---

## Endpoint

```http
GET /api/v1/requests/:requestId
```

Example:

```http
GET /api/v1/requests/687ab12
```

---

## Authentication

Protected Route

```js
router.get(
  "/:requestId",
  verifyJWT,
  getRequestById
);
```

Only authenticated users can access this endpoint.

---

## Workflow

```text
Client Request
      ↓
verifyJWT Middleware
      ↓
Extract requestId from URL
      ↓
Find Request in MongoDB
      ↓
Populate User Information
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
GET /api/v1/requests/687ab12
```

Output:

```js
requestId = "687ab12";
```

---

## Database Query

```js
const request = await Request.findById(requestId)
  .populate("createdBy", "fullName email role");
```

---

## Why populate()?

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

---

## Not Found Handling

```js
if (!request) {
  throw new ApiError(
    404,
    "No request found with given ID"
  );
}
```

---

## Success Response

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

## Concepts Learned

* req.params
* Dynamic Routes
* MongoDB findById()
* MongoDB populate()
* Protected Routes
* 404 Error Handling

---

## Interview Question

### Difference between findById() and findOne()?

```js
Request.findById(id)
```

is equivalent to:

```js
Request.findOne({ _id: id })
```

But `findById()` is cleaner and specifically designed for MongoDB ObjectIds.
