```http
🧠 save() middleware kab use karte hain?
🔐 Data modify karna before save (e.g. password hash, formatting)
⏱️ Auto fields set karna (updatedAt, createdAt, slug)
🧾 Logging / audit trail (kaunse document save hua)
🚨 Validation beyond schema rules (custom checks before saving)
🔄 Related data update karna (e.g. request save ho to user stats update)
📡 Side effects trigger karna (email send, notification, webhook)
❌ Kab nahi use karna chahiye
simple CRUD save ho raha ho
sirf field update karna ho (direct assignment + save enough)
unnecessary complexity add karna ho


Interview Question

Q: Why didn't you throw 404 when no requests were found?

Answer:

Because the API executed successfully. The user simply has no requests yet. An empty array is a valid result, not an error condition.
```
