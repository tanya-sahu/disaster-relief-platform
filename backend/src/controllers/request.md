```js

Controller likhne ka standard flow generally ye hota hai:

Request Aayi
    ↓
Validate Input
    ↓
Check Authentication
    ↓
Business Logic
    ↓
Database Operation
    ↓
Response

Tumhare createRequest() ke case me:

Step 1: Required Fields Check
requestType
description
location

Ye aaye hain ya nahi?

Agar nahi:

throw new ApiError(400, "All fields are required");
Step 2: Check Login

Yaha direct check nahi karogi.

Ye kaam middleware karega.

POST /requests
      ↓
verifyJWT Middleware
      ↓
createRequest Controller

Agar middleware pass ho gaya to:

req.user

available hoga.

Matlab controller me dubara login check karne ki zarurat nahi.

Step 3: Create Request

Yaha important point:

createdBy: req.user._id

Use karogi.

Kabhi bhi:

createdBy: req.body.createdBy

nahi.

Kyun?

User kisi aur ka ID bhej sakta hai.

Security issue.
```


Thinking Like Interviewer

Agar interviewer puche:

How do you know which user created the request?

Best answer:

"I don't take createdBy from the request body. After JWT verification, the authenticated user's id is available in req.user, and I use req.user._id to set createdBy."