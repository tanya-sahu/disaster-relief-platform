````http
🔥 Final combined meaning
{ new: true, runValidators: true }
👉 This means:
Update karo document ko
Updated version return karo
Schema validation strictly apply karo






🧠 Real-world understanding
🔵 1. save()
const user = await User.findById(id);
user.name = "Tanya";
await user.save();

👉 Best when:

You want middleware (pre/post hooks)
You want validation always enforced
You are doing logic-based updates

✔️ Example: password hashing, logging, computed fields

🔵 2. findByIdAndUpdate()
await User.findByIdAndUpdate(id, { name: "Tanya" }, { new: true });

👉 Best when:

You already know the ID
You want fast update
You want updated document back

✔️ Example: profile update, admin edits

🔵 3. updateOne()
await User.updateOne(
  { email: "test@gmail.com" },
  { $set: { name: "Tanya" } }
);

👉 Best when:

You are updating using filters
You don’t need the document back
You want bulk or simple updates

✔️ Example: mark user active/inactive

⚡ Super Quick Memory Trick
save() → “I fetched it first, then changed it”
findByIdAndUpdate() → “Update by ID in one shot”
updateOne() → “Update by filter, no return needed”
🚀 Pro Tip (Interview gold)

👉 Most production APIs use:

findByIdAndUpdate() → REST updates
save() → business logic heavy updates
updateOne() → bulk/admin operations
````