# 🛡️ PrepZone - AI-Powered JECA Preparation Tracker

PrepZone is a premium, **gamified learning ecosystem** designed for JECA (MCA Entrance) aspirants. It transforms traditional study tracking into a competitive "Scholar's Journey," leveraging **Mistral AI** to generate intelligent study optimizations and the **MERN stack** to provide a high-focus, distraction-free environment.

[![Status](https://img.shields.io/badge/Status-Active-brightgreen)](https://github.com/Ramiz1323/PrepZone)
[![Tech](https://img.shields.io/badge/Stack-MERN-red)](https://github.com/Ramiz1323/PrepZone)
[![AI](https://img.shields.io/badge/AI-Mistral-blue)](https://mistral.ai/)
[![UI](https://img.shields.io/badge/UI-Glassmorphism-gold)](https://github.com/Ramiz1323/PrepZone)

---

## ✨ Core Pillars

### 🧠 AI Roadmap Architect
Powered by **Mistral AI**, PrepZone doesn't just track data—it understands it.
*   **Performance Diagnostics**: Analyzes your MCQ accuracy and study sessions to identify hidden weak points.
*   **Dynamic Optimization**: Generates personalized suggestions to refine your roadmap for maximum efficiency.
*   **Adaptive Learning**: Updates your projected path based on your real-time speed and recall rates.

### 🏆 The Scholar’s Journey (Gamification)
Turn your preparation into a game where progress is the prize.
*   **XP Engine**: Earn experience points for every minute studied and every MCQ solved.
*   **Dynamic Tiers**: Progress through levels—from **Bronze Novice** to **Grandmaster Scholar**.
*   **Consistency Badges**: Features an interactive **Streak Fire Badge** that visually grows as you maintain your daily consistency.

### 📊 Intelligent Analytics & MCQ Master
*   **Visual Dashboards**: Real-time charts powered by Recharts for productivity mapping and subject distribution.
*   **MCQ Simulation**: A dedicated testing environment for large-scale practice with instant feedback.
*   **Active Recall Queue**: A "Mistake Bank" where errors are automatically logged for scheduled revision intervals.

---

## 🏗️ Technical Architecture

### 📂 Frontend (React 19 + Vite)
- **Design System**: A custom-built **Glassmorphism** system with high-end Sass design tokens (modern Sass 3+ module logic).
- **State Management**: Scalable architecture using **Redux Toolkit** (slices for Auth, Tracker, Practice, and Analytics).
- **Responsive Mastery**: Tailored layouts for both Desktop (multi-column roadmap) and Mobile (streamlined focus-first lists).

### 📂 Backend (Node.js + Express)
- **Controller-Service pattern**: Clean separation of concerns for maintainable enterprise-grade logic.
- **Mistral AI Integration**: Asynchronous suggestion engine for AI-driven performance diagnostics.
- **Security Protocols**: JWT authentication with httpOnly cookie storage, rate-limiting, and Winston-powered logging.

---

## 🛠️ Tech Stack

| Domain | Technolgoy |
| :-- | :-- |
| **Frontend** | React 19, Redux Toolkit, Vite, Sass (Modern Module Syntax), Recharts |
| **Backend** | Node.js, Express, Mongoose, Mistral AI SDK |
| **Database** | MongoDB Atlas (Cloud) |
| **DevOps** | Render (API), DigitalOcean VPS (Frontend) |

---

## 💻 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Mistral AI API Key

### Local Environment
1. **Clone the repo**:
   ```bash
   git clone https://github.com/Ramiz1323/PrepZone.git
   ```
2. **Setup Backend**: 
   - `cd Backend && npm install`
   - Create a `.env` file with: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `MISTRAL_API_KEY`.
   - Run: `npm run dev`
3. **Setup Frontend**:
   - `cd Frontend && npm install`
   - Create a `.env` file with: `VITE_API_URL`.
   - Run: `npm run dev`

---

## 🚀 Deployment Strategy
PrepZone is architected for high-performance production hosting:
*   **API Hosting**: Deployed on **Render** (Auto-sync with Main branch).
*   **Frontend Hosting**: Hosted on a **DigitalOcean VPS** behind an Nginx reverse proxy.
*   **Modernization**: Codebase is fully modernized to ensure zero build-time deprecation warnings on CI/CD pipelines.

---

*Built with ❤️ for aspirants by PrepZone Team.*
