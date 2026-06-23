# Mongoose .lean() - Quick Notes

- Returns plain JavaScript objects instead of Mongoose documents.
- Improves query performance.
- Uses less memory.
- Best for read-only APIs (GET requests).
- No Mongoose methods available (save(), validate(), etc.).

## Use

```http
Good For
Get All Disasters
Get All Requests
Get Users
Dashboard APIs
Avoid For
Create APIs
Update APIs
Delete APIs
When using document.save()
Rule

GET APIs → Use .lean()

UPDATE/CREATE APIs → Don't use .lean()

```

```js
const disasters = await Disaster.find().lean();
```
