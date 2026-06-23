# Express.js Request Object Notes

## 1. req.body

### Purpose

Client dwara request body me bheja gaya data access karne ke liye.

### Mostly Used In

* POST
* PUT
* PATCH

### Example

Request:

```json
{
  "fullName": "Tanya Sahu",
  "email": "tanya@gmail.com"
}
```

Access:

```js
const { fullName, email } = req.body;
```

### Use Cases

* User Registration
* User Login
* Create Request
* Update Profile

---

## 2. req.params

### Purpose

URL ke dynamic values access karne ke liye.

### Route

```js
router.get("/:requestId", getRequestById);
```

### Request

```http
GET /api/v1/requests/12345
```

### Access

```js
const { requestId } = req.params;
```

Output:

```js
requestId = "12345";
```

### Use Cases

* Get Request By Id
* Get User By Id
* Delete Request
* Update Request

---

## 3. req.query

### Purpose

URL query parameters access karne ke liye.

### Request

```http
GET /api/v1/requests?status=pending&priority=high
```

### Access

```js
const { status, priority } = req.query;
```

Output:

```js
{
  status: "pending",
  priority: "high"
}
```

### Use Cases

* Filtering
* Searching
* Pagination
* Sorting

Example:

```http
GET /api/v1/requests?page=1&limit=10
```

---

## Quick Comparison

| Property   | Data Comes From    | Example           |
| ---------- | ------------------ | ----------------- |
| req.body   | Request Body       | Registration Form |
| req.params | URL Dynamic Values | /requests/:id     |
| req.query  | URL Query String   | ?status=pending   |

---

## Easy Trick

```text
req.body
↓
Form Data

req.params
↓
URL Dynamic Part

req.query
↓
Filter/Search Parameters
```

---

## Interview Question

### Difference between req.body, req.params and req.query?

Answer:

* req.body is used to receive data sent in the request body, usually in POST, PUT and PATCH requests.
* req.params is used to access dynamic values present in the URL path.
* req.query is used to access query string parameters generally used for filtering, searching, sorting and pagination.
