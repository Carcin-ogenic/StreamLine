# 🧠 Xeno CRM – Campaign & Segmentation Engine

Xeno CRM is a full-stack customer engagement platform that allows businesses to segment their customers intelligently, launch personalized marketing campaigns, and preview the impact of those campaigns in real-time. It also leverages AI tools to assist users in creating message content and parsing natural-language queries into structured filters.

---

## 🚀 Features

- 🔐 Google OAuth2 login using JWT
- 🎯 Segment builder using visual + AI-powered natural language query parsing
- 🧠 Campaign creator with AI-generated message suggestions (via Groq)
- 📊 Dashboard showing campaign/segment/customer metrics
- 📥 Seedable customer & order dataset for demo/testing
- 📚 Clean, developer-friendly backend with Express, MongoDB, and Mongoose

---

## 💠 Local Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/xeno-crm.git
cd xeno-crm
```

### 2. Install backend dependencies

```bash
cd Backend
npm install
```

### 3. Set up environment variables

Create a `.env` file in the `/Backend` folder:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<your-cluster-uri>
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=time
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_url
GROQ_API_KEY=your_groq_key
CLIENT_URL=http://localhost:5173
```

### 4. Run backend

```bash
npm run dev
```

### 5. Set up frontend

```bash
cd ../Frontend
npm install
```

Create a `.env` file in `/Frontend`:

```env
VITE_API_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

### 6. Run frontend

```bash
npm run dev
```

Now visit `http://localhost:5173` to start using the app.

---

## 🧱 Architecture Diagram

```plaintext
+-------------------+      +---------------------+
|                   |      |                     |
|   React Frontend  | ---> |  Express Backend    |
|                   |      |                     |
+-------------------+      +---------------------+
         |                           |
         | JWT / Axios               | REST APIs
         |                           |
         v                           v
+-----------------------------------------------------+
|                    MongoDB Atlas                    |
|  - Users   - Customers   - Segments   - Campaigns   |
+-----------------------------------------------------+

         ↖                             ↙
          ↖--- Groq AI (LLM API) -----↙
```

---

## 🧠 Tech Stack & AI Tools Used

| Layer      | Technology                                                    |
| ---------- | ------------------------------------------------------------- |
| Frontend   | React (Vite), Tailwind CSS, Ant Design, React Query Builder   |
| Auth       | Google OAuth2 via `passport-google-oauth20`, JWT with cookies |
| Backend    | Node.js, Express, Mongoose (MongoDB)                          |
| AI Tool    | **Groq SDK + LLaMA 3.3** for:                                 |
|            | - ✨ Natural language → query filter translation              |
|            | - ✍️ Campaign message suggestions                             |
| Data Store | MongoDB Atlas                                                 |
| Dev Tools  | ESLint, Vite, Dotenv, Axios                                   |

---

## ⚠ Known Limitations / Assumptions

- ✏️ Only basic customer segmentation fields are supported (`totalSpend`, `tags`, `lastVisit`)
- 🚩 No real email delivery — campaign messages are stored but **not sent**
- 🔒 Admin management, campaign editing, and deletion features are not included
- 💬 LLM prompts are basic and can return inconsistent JSON on failure
- 🧪 Error handling is present but not fully UX-polished

---

## ✅ To Do / Future Improvements

1. Email/SMS integrations (SendGrid, Twilio)
2. A/B testing for campaigns
3. CSV import for customers
4. Better error UI with retry flow
5. Campaign scheduling

---

## 🧑‍💼 Author

Made with ❤️ by Rohit Arora
