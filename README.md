# 🛡️ PrepZone - JECA Preparation Tracker

PrepZone is a premium, **gamified learning ecosystem** designed for JECA aspirants. It transforms mundane study tracking into a competitive "Scholar's Journey," leveraging the **MERN stack** to provide real-time progression, intelligent analytics, and an interactive revision queue.

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Tech](https://img.shields.io/badge/Stack-MERN-red)
![Gamification](https://img.shields.io/badge/Gamified-XP--System-gold)

---

## ✨ Highlighted Features

### 🏆 Scholar’s Journey (Gamification)
*   **XP Engine**: Earn XP based on study minutes, MCQs solved, and accuracy.
*   **Game Tiers**: Climb the ranks from **Bronze** to **Grandmaster**.
*   **Streak Fire Badge**: Interactive flickering flame that tracks your daily consistency.

### 📊 Intelligent Analytics
*   **Productivity Mapping**: Visualized study sessions using Recharts.
*   **Subject-wise Distribution**: Break down your focus areas across different subjects.
*   **Accuracy Tracking**: Monitor your mistake rate over time.

### 🧠 Mistake Bank & Revision Queue
*   **Active Recall**: A specialized system to log errors and schedule them for revision.
*   **Status Management**: Tag items as Pending or Completed to stay organized.

---

## 🏗️ Project Architecture

### 📂 Frontend (React + Vite)
- **Modular Store**: State management powered by **Redux Toolkit** with sliced logic for Auth, Tracker, and Analytics.
- **Glassmorphic UI**: Premium design system built with **Sass** and consistent variable-driven tokens.
- **Unified API Layer**: Centralized custom Axios service with interceptors for seamless Backend interaction.

### 📂 Backend (Node.js + Express)
- **Controller-Service-Model**: Industry-standard design pattern for clean, maintainable logic.
- **Real-time Gamification Service**: Automated XP and level calculation triggered on session logs.
- **Security**: JWT-based authentication with secure cookie storage and rate-limiting.

---

## 🛠️ Tech Stack
| Tier | Technology |
| :--- | :--- |
| **Frontend** | React 19, Redux Toolkit, Vite, Sass, Recharts |
| **Backend** | Node.js, Express, Mongoose, JWT |
| **Database** | MongoDB Atlas |
| **AI Integration** | Mistral AI API |

---

## 🚀 Use Cases
1.  **Preparation Tracking**: Daily logging of MCQ practice and study duration.
2.  **Performance Visualization**: Identifying weak subjects through data dashboards.
3.  **Revision Management**: Ensuring that no mistake goes unreviewed through the Revision Queue.
4.  **Stay Motivated**: Competing against yourself to reach the next "Rank" tier.

---

## 💻 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account

### Local Environment
1. Clone the repo: `git clone https://github.com/Ramiz1323/PrepZone.git`
2. **Backend**: 
   - `cd Backend && npm install`
   - Create `.env` and add: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`.
   - Start: `npm run dev`
3. **Frontend**:
   - `cd Frontend && npm install`
   - Create `.env` and add: `VITE_API_URL`.
   - Start: `npm run dev`

---

## 🌐 Deployment
This project is configured for optimal deployment on a VPS:
- **Proxy**: Nginx configured to serve Frontend static builds and proxy `/api/*` to Backend.
- **Process Management**: PM2 is recommended for the Node.js backend.
- **Security**: SSL certificates via Certbot.

---

*Built with ❤️ for JECA Aspirants by PrepZone.*
