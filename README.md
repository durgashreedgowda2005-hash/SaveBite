🍃 SaveBite – Food Donation & Redistribution Platform

SaveBite is a MERN-stack web application that connects food donors with people and organizations in need. It helps reduce food waste by making surplus food available for redistribution through a simple, role-based platform.

The platform allows donors to share surplus food, recipients to request food, and administrators to manage users, food listings, and recipient verification.

✨ Features

👤 User Authentication

- User registration and login.
- Role-based accounts for Donors and Recipients.
- Secure authentication using JSON Web Tokens (JWT).
- Protected routes and role-based access control.

🥗 Donor Dashboard

- Add surplus food listings with images.
- Specify food details, quantity, category, pickup address and expiry date.
- Manage personal food listings.
- Delete food listings.
- View recipient requests.
- Approve or reject food requests.
- Mark approved food as collected.

🧑‍🤝‍🧑 Recipient Dashboard

- Browse available food listings.
- View food details and quantities.
- Request food and specify the required quantity.
- Send optional messages to donors.
- Track food request status.
- Submit account verification applications.
- Resubmit verification applications when additional information is requested.

🛡️ Admin Dashboard

- Manage recipient verification applications.
- Approve or reject applications.
- Request additional information from recipients.
- Review recipient application details.
- Manage verification statuses.

📋 Recipient Verification System

- Verification for individuals and organizations.
- Application status tracking.
- Admin feedback system.
- Information update and resubmission functionality.

🖼️ Food Image Uploads

- Upload food images when creating listings.
- Display food images in the application.
- Image upload validation.

🛠️ Tech Stack

Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Vite

Backend

- Node.js
- Express.js

Database

- MongoDB
- Mongoose

Authentication & Security

- JSON Web Token (JWT)
- Role-based authorization
- Middleware-based route protection

📁 Project Structure

SaveBite/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── uploads/
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── admin/
│       ├── donor/
│       ├── recipient/
│       ├── pages/
│       └── App.jsx
│
└── README.md

🚀 Getting Started

1. Clone the repository

git clone https://github.com/durgashreedgowda2005-hash/SaveBite.git

cd SaveBite

2. Install backend dependencies

cd backend
npm install

3. Configure environment variables

Create a ".env" file inside the "backend" folder.

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Replace the placeholders with your own configuration.

4. Start the backend

npm run dev

5. Install frontend dependencies

Open another terminal:

cd frontend
npm install

6. Start the frontend

npm run dev

Open the local URL provided by Vite in your browser.

🌱 Project Goal

SaveBite aims to bridge the gap between surplus food and people who need it. By providing a platform for food donation, request management and recipient verification, the project encourages responsible food redistribution and contributes to reducing food waste.

👩‍💻 Developed With

Built as a MERN-stack project using React, Node.js, Express and MongoDB.

---

SaveBite – Share Food. Reduce Waste. Make a Difference. 🌿
