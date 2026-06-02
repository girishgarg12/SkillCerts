# SkillCerts — Skill-Based Learning & Certification Platform

SkillCerts is a professional MERN stack application designed as an e-learning and certification platform. Instructors can seamlessly create, price, and manage courses, while learners can register, purchase courses securely, and earn verification certificates upon completion.

---

## 🚀 Key Features

*   **Role-Based Access Control:** Separate dashboards and workflows for **Instructors** (creation, analytics, management) and **Learners** (learning, certificate tracking).
*   **Course Management:** Rich course editor allowing curriculum building, video content upload, and pricing controls.
*   **Secure Payment Integration:** Integrated with Razorpay checkout for seamless and safe transaction processing.
*   **Certificate Generation:** Automatic, cryptographically verifiable PDF certificate generation upon course completion.
*   **CI/CD Automated Pipelines:** Fully automated build, test, and release cycle targeting AWS cloud containerized nodes.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Library/Plugin |
|:---|:---|:---|
| **Frontend** | React, Vite | React Router, TailwindCSS / Vanilla CSS |
| **Backend** | Node.js, Express.js | JWT (Auth), Razorpay SDK, Resend Mail SDK |
| **Database** | MongoDB | Mongoose (Object Data Modeling) |
| **Containers** | Docker, Docker Compose | Multi-stage builder images, Nginx static host |
| **DevOps** | GitHub Actions, Jenkins | SSH Webhooks, Docker-in-Docker agents |
| **Cloud Hosting**| AWS EC2 | gp3 high-speed storage, 2GB Swap extension |

---

## 📦 Architecture & Setup

### Infrastructure Layout
The application uses Docker Compose to run a multi-container architecture inside a dedicated bridge network:

```
                  ┌──────────────────────────────────────────────┐
                  │                   EC2 Host                   │
                  │  ┌──────────────┐          ┌──────────────┐  │
  HTTP (Port 80) ─┼─►│   Frontend   ├─────────►│   Backend    │  │
                  │  │  (Nginx/Vite)│  (3000)  │ (Node/Exp.)  │  │
                  │  └──────────────┘          └──────┬───────┘  │
                  │                                   │          │
                  │                                   ▼          │
                  │                            ┌──────────────┐  │
                  │                            │   Database   │  │
                  │                            │  (MongoDB)   │  │
                  │                            └──────────────┘  │
                  └──────────────────────────────────────────────┘
```

---

## 💻 Local Development Setup

To run the full stack locally with hot-reloading:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/girishgarg12/SkillCerts.git
   cd SkillCerts
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root folder based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. **Start the containers:**
   ```bash
   docker-compose up -d --build
   ```
   * The frontend will be available at: `http://localhost:80`
   * The backend will be available at: `http://localhost:3000`

---

## 🚀 CI/CD Pipeline Workflow

The project uses a hybrid CI/CD pipeline combining the strengths of **GitHub Actions** and **Jenkins**:

```
[ Push to Main ] ────► [ GitHub Actions ] ────► [ Docker Hub ]
                              │
                      (Secure API Webhook)
                              ▼
                       [ AWS EC2 Jenkins ] ──► [ Deploy to Live Server ]
```

1. **Continuous Integration (GitHub Actions):**
   * Automatically triggered on every push to the `main` branch.
   * Runs ESLint formatting checks and backend test suites.
   * Compiles the React production bundle, builds backend/frontend Docker images, and pushes them to **Docker Hub**.
   * Triggers the Jenkins CD job via a secure POST webhook.

2. **Continuous Deployment (Jenkins):**
   * Jenkins (running in Docker on EC2) intercepts the webhook.
   * Pulls the latest production images from Docker Hub.
   * Swaps the running containers on the EC2 server with zero downtime.
   * Runs automated HTTP health checks to verify that services are successfully running.
