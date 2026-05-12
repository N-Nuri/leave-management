# 🏖️ Employees Leave Management System

A full-stack web application for managing employee leave requests, built with **Java Spring Boot** and a **Relational Database**. Developed as part of an Agile/Scrum course project in collaboration with [Axon Active Vietnam](https://www.axonactive.com).

---

## 📋 Table of Contents

- [Vision](#vision)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Team](#team)
- [License](#license)

---

## 🎯 Vision

A transparent, automated leave management tool that helps employees track their leave days and allows managers to review requests efficiently — fully compliant with labor law requirements.

**Key business rules:**
- Each employee has a default of **12 leave days per year**
- Unused leave days at year-end are **accumulated (carried over)** to the next year (max 6 days)
- Managers can **approve or reject** leave requests with notes
- Automated **year-end accumulation job** runs on January 1st at 00:00

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17+, Spring Boot 3.x |
| Security | Spring Security, JWT |
| Database | Supabase (PostgreSQL) |
| DB Migration | Flyway |
| Build Tool | Maven |
| Frontend | React.js / Angular |
| API Testing | Postman |
| Containerization | Docker, Docker Compose |
| Version Control | Git, GitHub |
| Project Management | JIRA |

---

## ✨ Features

### Employee
- 🔐 Login with JWT authentication
- 📅 Submit leave requests (with date range, type, and reason)
- 👀 View personal leave balance (total, used, remaining, carried over)
- 📋 View leave request history with status tracking
- ❌ Cancel pending leave requests

### Manager
- ✅ Approve or reject leave requests (with mandatory note on rejection)
- 👥 View team members' leave balances
- 📊 View all pending requests in one place
- 🗓️ Team leave calendar overview

### System (Automated)
- 🔄 Scheduled year-end accumulation job (every Jan 1st at 00:00)
- 📧 Email notifications for request submission, approval, and rejection
- 📝 Full audit log for all accumulation events

---

## 📁 Project Structure

```
leave-management-system/
├── backend/
│   ├── src/
│   │   ├── main/java/com/axonactive/leave/
│   │   │   ├── auth/           # JWT, Spring Security config
│   │   │   ├── user/           # User entity, repository, service
│   │   │   ├── leave/
│   │   │   │   ├── request/    # LeaveRequest CRUD, state machine
│   │   │   │   └── balance/    # LeaveBalance, accumulation logic
│   │   │   └── scheduler/      # Year-end accumulation job
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/   # Flyway SQL scripts
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/           # API call layer (axios)
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Java 17 or higher (`java -version`)
- Node.js 18+ (`node -v`)
- Maven (`mvn -version`)
- Docker & Docker Compose (optional, for containerized setup)
- A [Supabase](https://supabase.com) account and project (free tier is sufficient)

### Option 1 — Run with Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/leave-management-system.git
cd leave-management-system

# Start all services (backend + frontend + database)
docker-compose up --build
```

App will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`

> Database is hosted on Supabase — no local DB container needed.

### Option 2 — Run Manually

**1. Get your Supabase connection string**

1. Go to [supabase.com](https://supabase.com) → your project → **Settings → Database**
2. Under **Connection string**, select **JDBC**
3. Copy the connection string — it looks like:
   ```
   jdbc:postgresql://db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```

**2. Configure environment variables**

Create `backend/src/main/resources/application-local.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.xxxxxxxxxxxx.supabase.co:5432/postgres
    username: postgres
    password: your-supabase-db-password
  jpa:
    hibernate:
      ddl-auto: validate

app:
  jwt:
    secret: your-secret-key-min-256-bits
    expiration: 28800000  # 8 hours in ms
```

> ⚠️ **Security note:** Never commit `application-local.yml` to Git. It is already listed in `.gitignore`.  
> The Supabase `anon key` and `service_role key` are **not needed** in Spring Boot — those are for direct frontend API calls only.

**3. Run the backend**

```bash
cd backend
mvn spring-boot:run -Dspring.profiles.active=local
```

**4. Run the frontend**

```bash
cd frontend
npm install
npm start
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT token | ❌ |
| POST | `/api/auth/logout` | Invalidate token | ✅ |

### Leave Requests
| Method | Endpoint | Description | Role |
|---|---|---|---|
| POST | `/api/leave-requests` | Submit a new leave request | Employee |
| GET | `/api/leave-requests` | Get own leave requests | Employee |
| GET | `/api/leave-requests/{id}` | Get request details | All |
| PUT | `/api/leave-requests/{id}/cancel` | Cancel a PENDING request | Employee |
| PUT | `/api/leave-requests/{id}/approve` | Approve a request | Manager |
| PUT | `/api/leave-requests/{id}/reject` | Reject a request (note required) | Manager |
| GET | `/api/leave-requests/pending` | List all pending requests | Manager |
| GET | `/api/leave-requests/team` | List all team requests | Manager |

### Leave Balance
| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/api/leave-balance/me` | Get own leave balance | Employee |
| GET | `/api/leave-balance/team` | Get team balances | Manager |
| GET | `/api/leave-balance/{userId}` | Get a specific employee's balance | Manager |

---

## 🗄️ Database Schema

```
users
  ├── id (UUID PK)
  ├── email (UNIQUE)
  ├── password_hash
  ├── full_name
  ├── role (EMPLOYEE | MANAGER)
  └── manager_id (FK → users.id)

leave_balances
  ├── id (UUID PK)
  ├── user_id (FK → users.id)
  ├── year
  ├── total_days (default: 12.0)
  ├── used_days
  └── carried_over_days

leave_requests
  ├── id (UUID PK)
  ├── employee_id (FK → users.id)
  ├── start_date / end_date
  ├── days_count
  ├── leave_type (ANNUAL | SICK | UNPAID | OTHER)
  ├── reason
  ├── status (PENDING | APPROVED | REJECTED | CANCELLED)
  ├── reviewed_by (FK → users.id)
  └── review_note

leave_accumulation_logs
  ├── id (UUID PK)
  ├── user_id (FK → users.id)
  ├── from_year / to_year
  ├── days_carried
  └── days_expired
```

---

## 👥 Team

| Role | Responsibility |
|---|---|
| Product Owner | Define requirements, prioritize backlog, liaise with Axon Active |
| Scrum Master | Facilitate ceremonies, remove blockers, track Sprint progress |
| Dev 1 | Backend — Auth & Security (Spring Security, JWT) |
| Dev 2 | Backend — Leave Request CRUD & State Machine |
| Dev 3 | Backend — Leave Balance & Accumulation Job |
| Dev 4 | Database design, Flyway migrations, Docker setup |
| Dev 5 | Frontend — Employee features |
| Dev 6 | Frontend — Manager features |
| Dev 7 | Testing, integration, Postman collection |

---

## 📄 License

This project is developed for educational purposes as part of the **Information Technology Enterprise** course.  
Client requirements provided by **Axon Active Vietnam Co., Ltd.**

---

> Built with ☕ Java, 🌱 Spring Boot, and the Scrum framework.
