# 🌍 Disaster Relief Platform System

An advanced, highly secure, and real-time MERN stack ecosystem designed to streamline crisis management and disaster response logistics. The platform features strict Role-Based Access Control (RBAC), secure authentication pipelines, and atomic data synchronization to efficiently bridge the gap between disaster victims, non-governmental organizations (NGOs), and ground volunteers.

---

## 🚀 System Architecture & Core Workflow

The platform automates the entire supply chain of disaster relief, ensuring that resources reach the right people without data mismatch or double-allocation issues.




+---------------------------+
|   Victim Dashboard        |  <-- Raises a structured relief request
+-------------+-------------+
|
▼
+---------------------------+
|     NGO Dashboard         |  <-- Reviews live requests & matches with inventory
+-------------+-------------+      (Deducts stock atomically using MongoDB Sessions)
|
▼
+---------------------------+
|   Volunteer Dashboard     |  <-- Claims Partially/Fully Fulfilled requests
+---------------------------+      for last-mile transit and delivery



---

## 👥 Role-Based Interactive Dashboards

The application dynamically renders three isolated, feature-rich dashboards based on the authenticated user's role:

### 1. 🛑 Victim Dashboard (Need Generation)
* **Emergency Request Lifecycle:** Allows affected individuals to instantly raise structured relief requests specifying types of goods (Food, Water, Medical Supplies, Clothing) and crisis severity levels.
* **Live Status Tracking:** Displays a real-time historical ledger for victims to monitor whether their request is *Pending*, *Partially Fulfilled*, or *Dispatched*.

### 🏢 NGO Dashboard (Resource Allocation & Inventory Management)
* **Central Command Control:** A comprehensive administrative feed showing all live, unfulfilled emergency requests filtering in from disaster zones.
* **Atomic Inventory Fulfillment:** One-click approval mechanism that automatically cross-checks requested items against current warehouse stock.
* **ACID Transactions (Mongo Sessions):** Guarantees that resource deduction from the NGO's stock inventory and request state updates happen **simultaneously**. If any part of the process fails, the database automatically rolls back to prevent data corruption.

### 🏃‍♂️ Volunteer Dashboard (Last-Mile Logistics)
* **Logistics Dispatch Feed:** Active field volunteers receive a dynamic feed populated exclusively with *Partially Fulfilled* and *Fully Fulfilled* resource orders.
* **Job Acceptance:** Volunteers can claim a shipment transit task, instantly linking their driver profile to the respective dispatch NGO and destination Victim.

---

## ⚙️ Technical Stack & Implementation Details

* **Frontend:** React.js, Vite, Tailwind CSS, Axios (Configured with global credential tracking)
* **Backend:** Node.js, Express.js (RESTful APIs, Custom Auth & RBAC Middlewares)
* **Database:** MongoDB Atlas (Mongoose ODM, utilizing Native Multi-Document ACID Transactions)
* **Security & Session Management:** JSON Web Tokens (JWT) signed via robust cryptographic algorithms, transmitted safely using encrypted, cross-site HTTP-Only Cookies (`sameSite: "none"`, `secure: true`).
* **Deployment:** Distributed production environment with the Frontend hosted on **Vercel** and the Production API hosted on **Render**.

---

## 🛠️ Future Roadmap & Upcoming Milestones

The platform is scaling quickly. The following micro-services and features are actively under development:

- [ ] **📦 Live Delivery Tracker:** Real-time state transitions for volunteers to update logistics progress (*Dispatched* ➔ *In-Transit* ➔ *Delivered*).
- [ ] **📧 Automated Email Verification:** Secure, verification-link or OTP-based user onboarding powered by Nodemailer.
- [ ] **🔔 Real-time Notification Engine:** Instant in-app alerts and email dispatches triggered by status changes using WebSocket architectures.
- [ ] **📍 Geospatial Map Integration:** Google Maps / Leaflet API routing to map disaster zones and calculate optimal transit routes for volunteers.
- [ ] **🤝 Multi-NGO Crowdfunded Resource Allocation:** Collaborative pooling systems allowing multiple smaller NGOs to collectively fulfill massive relief demands.

---

## 🚀 Local Installation & Setup Guide

### 1. Clone the Repository
```bash
git clone [https://github.com/tanya80/disaster-relief-platform.git](https://github.com/tanya80/disaster-relief-platform.git)
cd disaster-relief-platform