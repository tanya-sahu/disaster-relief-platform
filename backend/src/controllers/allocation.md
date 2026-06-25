# MongoDB Transactions in Mongoose

## What is a Transaction?

A transaction allows multiple database operations to be treated as a single unit of work.

* If all operations succeed → Save changes (`commitTransaction`)
* If any operation fails → Undo all changes (`abortTransaction`)

This helps maintain data consistency.

---

## Starting a Transaction

```javascript
const session = await mongoose.startSession();
session.startTransaction();
```

### `mongoose.startSession()`

Creates a session object that tracks all operations inside the transaction.

```javascript
const session = await mongoose.startSession();
```

### `session.startTransaction()`

Starts a new transaction.

```javascript
session.startTransaction();
```

After this, all database operations should use the same session.

---

# Real-Life Example: Bank Transfer

Suppose:

* Account A = ₹1000
* Account B = ₹500

A wants to send ₹200 to B.

Without a transaction:

```javascript
await Account.updateOne(
  { name: "A" },
  { $inc: { balance: -200 } }
);
```

If the next query fails:

```javascript
await Account.updateOne(
  { name: "B" },
  { $inc: { balance: 200 } }
);
```

Result:

* A = ₹800
* B = ₹500

Money disappeared due to failure.

This creates inconsistent data.

---

# Using a Transaction

```javascript
const session = await mongoose.startSession();

try {
  session.startTransaction();

  await Account.updateOne(
    { name: "A" },
    { $inc: { balance: -200 } },
    { session }
  );

  await Account.updateOne(
    { name: "B" },
    { $inc: { balance: 200 } },
    { session }
  );

  await session.commitTransaction();

} catch (error) {

  await session.abortTransaction();

} finally {

  session.endSession();
}
```

---

## commitTransaction()

```javascript
await session.commitTransaction();
```

Used when all operations succeed.

Changes become permanent.

Example:

```text
A: 1000 → 800
B: 500 → 700
```

---

## abortTransaction()

```javascript
await session.abortTransaction();
```

Used when any operation fails.

All previous changes are rolled back.

Example:

```text
A: 1000 → 800
B update failed
```

After rollback:

```text
A: 1000
B: 500
```

Database returns to its original state.

---

## Passing Session to Queries

Every query inside the transaction must receive the session.

```javascript
await User.create([data], { session });

await User.findByIdAndUpdate(
  id,
  update,
  { session }
);
```

Wrong:

```javascript
await User.create(data);
```

This query will not be part of the transaction.

---

# Transaction Flow

```text
Start Session
      ↓
Start Transaction
      ↓
Run Queries
      ↓
All Success?
   /       \
 Yes       No
  ↓         ↓
Commit    Abort
  ↓         ↓
Save     Rollback
```

---

# Interview Definition

A transaction in MongoDB ensures that multiple database operations execute as a single atomic unit. If all operations succeed, the transaction is committed; otherwise, all changes are rolled back to maintain data consistency.

---

# Common Use Cases

1. Bank Transfers
2. Payment Systems
3. E-Commerce Orders
4. Ticket Booking Systems
5. Wallet Transactions
6. Disaster Relief Platform Projects
7. Inventory Management Systems

Transactions are mainly used whenever multiple database operations must either succeed together or fail together.
