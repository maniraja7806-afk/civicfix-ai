# CivicFix AI
### *Report Smart. Resolve Faster. Build Better Communities.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Multimodal%20AI-orange.svg)](https://ai.google.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-OpenStreetMap-brightgreen.svg)](https://leafletjs.com/)
[![Smart India Hackathon](https://img.shields.io/badge/SIH-2026%20Finalist%20Ready-red.svg)](https://www.sih.gov.in/)

---

## 1. Project Title and Tagline
**CivicFix AI** – AI-Powered Smart Civic Issue Reporting & Resolution Platform  
*Tagline:* **Report Smart. Resolve Faster. Build Better Communities.**

---

## 2. Project Overview
CivicFix AI is an intelligent civic issue reporting and resolution platform that directly bridges citizens and municipal corporations. Rather than dealing with chaotic call centers or untracked social media posts, citizens can snap a photo of damaged public infrastructure, let multimodal AI analyze the issue, drop an exact GPS location pin, and track the complaint through an 8-stage verification lifecycle. Municipal authorities receive categorized, deduplicated, and prioritized tasks with clear explainability, eliminating administrative bottlenecks.

---

## 3. Real-World Problem Statement
Indian and global municipalities face recurring challenges with traditional civic complaint channels:
- **Repetitive Duplicate Workloads:** Multiple citizens report the same crater, broken pipe, or garbage dump within a 50-meter radius, resulting in fragmented tickets and redundant field visits.
- **Opaque Tracking & Broken Feedback Loops:** Citizens rarely know which department owns their ticket, leading to skepticism and disengagement.
- **Inconsistent Prioritization:** A lethal exposed 230V live wire in a school zone is often queued with the same priority as faded curb paint.
- **Lack of Verification Proof:** Contractors often mark issues "resolved" without transparent before-and-after photographic evidence.

---

## 4. Proposed Solution
CivicFix AI introduces:
1. **Google Gemini Multimodal Vision:** Automatically inspects uploaded photographs, tags the infrastructure defect, evaluates visible damage, and recommends the responsible department.
2. **Geospatial Duplicate Clustering:** Uses the Haversine formula and word-token similarity to identify duplicate reports within 30–150 meters, grouping them under a primary ticket without discarding citizen participation.
3. **Explainable AI Priority Engine:** Calculates priority scores (0–100) based on life safety risks, traffic volume, and school/hospital proximity.
4. **Closed-Loop Citizen Verification:** Tickets cannot be closed unilaterally by contractors; citizens confirm resolution quality with a 5-star rating or reopen the ticket with photographic evidence.
5. **Public Transparency Portal:** Publishes anonymized municipal performance data and live citywide GIS map markers.

---

## 5. Project Objectives
- Enable sub-60-second civic complaint reporting with automated computer vision assistance.
- Reduce municipal ticket duplication by over 70% using spatial and semantic clustering.
- Provide objective, explainable prioritization for emergency and high-hazard civic infrastructure.
- Deliver a production-grade full-stack architecture suitable for the Smart India Hackathon (SIH), university capstone presentations, and real-world municipal rollouts.

---

## 6. Target Users
- **Urban & Rural Citizens:** Commuters, pedestrians, and resident welfare associations (RWAs).
- **Municipal Field Officers:** Engineers, sanitary inspectors, road crews, and linemen from PWD, Jal Board, and DISCOMs.
- **City Administrators & Commissioners:** Municipal commissioners, ward councilors, and smart city operations center directors.

---

## 7. User Roles and Permissions
| Capability | Citizen | Municipal Officer | Administrator |
|---|:---:|:---:|:---:|
| Report Complaints with GPS & Photos | ✅ | ✅ | ✅ |
| Run Gemini AI Multimodal Analysis | ✅ | ✅ | ✅ |
| Track Complaints via CFA ID & Timeline | ✅ | ✅ | ✅ |
| Verify Resolution & Rate 1–5 Stars | ✅ (Owner) | ❌ | ✅ |
| Accept/Reject Field Assignments | ❌ | ✅ | ✅ |
| Upload After-Repair Photographic Evidence | ❌ | ✅ | ✅ |
| Reassign Departments & Override Priority | ❌ | ❌ | ✅ |
| Configure Departments & SLA Hours | ❌ | ❌ | ✅ |
| Manage User Roles & Deactivate Accounts | ❌ | ❌ | ✅ |
| Export Official CSV Audit Reports | ❌ | ❌ | ✅ |

---

## 8. Features
- **Intelligent Complaint Reporting:** Camera capture, multi-image upload, Leaflet map pin placement, "Use My Current GPS" button, and offline draft recovery.
- **Multimodal AI Vision:** Powered by Google Gemini 2.5 Flash for damage detection, safety advisories, and category recommendation.
- **AI Priority Engine:** Scores issues (Critical, High, Medium, Low) with explainable risk breakdown.
- **Intelligent Duplicate Detection:** Proximity radius detection + semantic similarity alerts.
- **Interactive Civic Map:** Color-coded priority pins (Red, Orange, Yellow, Green, Gray), search filters, and popups.
- **Real-Time Tracking & Socket Engine:** 8-stage visual timeline with live Socket.IO push updates.
- **Department Recommendation Engine:** Configurable routing rules matching complaint keywords to departments.
- **Officer Field Portal:** Task queues, before-and-after proof uploads, and workload analytics.
- **Admin Command Center:** Recharts trends, department SLA scorecards, user directory, and CSV report export.
- **Public Transparency Dashboard:** Anonymized city metrics and sanitized public map view.

---

## 9. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript & Vite
- **Styling:** Tailwind CSS with custom civic color palettes
- **Animation & Transitions:** Framer Motion
- **Icons:** Lucide React
- **Mapping:** Leaflet & OpenStreetMap (`leaflet`, `@types/leaflet`)
- **Charts:** Recharts
- **Forms & Validation:** React Hook Form & Zod
- **Networking:** Axios with JWT interceptors
- **Real-Time WebSockets:** Socket.IO Client
- **Celebration Effects:** Canvas Confetti

### Backend
- **Runtime:** Node.js (v20+) & Express.js with TypeScript
- **Security:** Helmet, CORS, Express Rate Limit, bcryptjs, JWT
- **Validation:** Zod schemas
- **File Uploads:** Multer with MIME verification and size caps
- **Real-Time Engine:** Socket.IO Server
- **AI SDK:** `@google/generative-ai` (Google Gemini 2.5 Flash)
- **Database ODM:** Mongoose with `2dsphere` geospatial indexing
- **Zero-Config Execution:** Automatic In-Memory fallback store with realistic seed data if MongoDB is offline

---

## 10. System Architecture
```
[ Citizen App / Leaflet UI ] <---> [ REST API + Socket.IO Server ] <---> [ MongoDB / In-Memory Store ]
                                                 |
                                                 v
                                  [ Google Gemini Multimodal AI ]
```
*For detailed component diagrams, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).*

---

## 11. Application Workflow
`CITIZEN REPORTS ISSUE` → `AI INSPECTS IMAGE` → `DUPLICATE PROXIMITY CHECKED` → `PRIORITY COMPUTED` → `DEPARTMENT ASSIGNED` → `OFFICER CONDUCTS FIELD REPAIR` → `EVIDENCE UPLOADED` → `CITIZEN VERIFIES & RATES 1-5 STARS` → `CLOSED`

---

## 12. AI Image Analysis Workflow
1. Citizen selects photo (road cavity, water leak, garbage dump, tilting pole).
2. Image buffer is sent to Gemini Multimodal Vision (`gemini-2.5-flash`).
3. Model extracts visible damage, urgency rationale, suggested category, and precautionary safety advice.
4. Privacy guardrail: Human faces, names, and vehicle registration numbers are never identified.
5. Results populate the reporting form for citizen review and editing.

---

## 13. Duplicate Detection Workflow
1. Coordinates and category are indexed on submission.
2. System queries unresolved issues within 150m.
3. Computes geodesic distance via the Haversine equation and text similarity via token intersection.
4. If confidence exceeds 65%, a duplicate alert is displayed, and the ticket is grouped for officer review.

---

## 14. Geospatial Processing
- Location stored as GeoJSON: `{ type: "Point", coordinates: [longitude, latitude] }`.
- Indexed using Mongoose `2dsphere` index for fast sub-millisecond spherical `$near` queries.
- Haversine formula implemented in TypeScript for standalone and in-memory execution.

---

## 15. Real-Time Notification Architecture
- Built on Socket.IO with distinct channels:
  - Personal Room: `user:<userId>`
  - Department Room: `dept:<departmentId>`
  - Admin Fleet Room: `admin:all`
  - Complaint Room: `complaint:<complaintId>`
- Emits events on status changes, field evidence uploads, and duplicate warnings.

---

## 16. Database Schema
- **User:** name, email, passwordHash, phone, role (`citizen`, `officer`, `admin`), address, departmentId.
- **Complaint:** complaintId (e.g. `CFA-2026-000101`), citizenId, title, description, category, images, location (GeoJSON Point), priority, priorityScore, status, assignedDepartmentId, assignedOfficerId, aiAnalysis, resolutionEvidence, citizenFeedback.
- **Department:** name, code, description, categoryMappings, slaHours, headOfficerName.
- **ComplaintUpdate:** complaintId, updatedBy, previousStatus, newStatus, comment, evidenceImages, actionType.
- **Notification:** userId, title, message, type, isRead, relatedComplaintId.
- **DuplicateGroup:** primaryComplaintId, complaintIds, similarityScore, geographicalDistance, status.
- **AuditLog:** userId, action, resourceType, timestamp.

---

## 17. Folder Structure
```text
civicfix-ai/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/       # Common, AI Analyzer, CivicMap, Layout
│   │   ├── pages/            # 12+ Pages (Landing, Dashboards, Report, Map, Admin)
│   │   ├── layouts/          # MainLayout, DashboardLayout
│   │   ├── context/          # AuthContext, SocketContext
│   │   ├── services/         # Axios API Services (Auth, Complaint, AI, Admin)
│   │   ├── types/            # TypeScript interfaces
│   │   └── utils/            # Formatters, PriorityColors, Offline Draft Storage
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/           # Database, Env, Gemini, Cloudinary
│   │   ├── controllers/      # Auth, Complaint, AI, Officer, Admin, Public
│   │   ├── middleware/       # Auth JWT, Role RBAC, Multer, Error Handler
│   │   ├── models/           # Mongoose Models (GeoJSON 2dsphere)
│   │   ├── routes/           # Express API Route Modules
│   │   ├── services/         # Gemini, Priority Engine, Duplicate Detection
│   │   ├── sockets/          # Socket.IO Real-time Handler
│   │   └── utils/            # Logger, InMemoryStore, SeedData
│   └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   └── SECURITY.md
│
├── docker-compose.yml
└── README.md
```

---

## 18. Installation Prerequisites
- **Node.js:** v20.x or v22.x or v24.x
- **npm:** v10.x or v11.x
- **Git**
- Optional: MongoDB Atlas connection string (CivicFix AI boots with zero-config in-memory mode if omitted)
- Optional: Google Gemini API Key (Free tier from Google AI Studio)

---

## 19. Clone Instructions
```bash
git clone https://github.com/your-username/civicfix-ai.git
cd civicfix-ai
```

---

## 20. Frontend Installation
```bash
cd client
npm install
```

---

## 21. Backend Installation
```bash
cd ../server
npm install
```

---

## 22. MongoDB Atlas Setup (Optional)
CivicFix AI connects to MongoDB Atlas or local MongoDB when configured:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allow your IP address in Network Access.
3. Copy your connection URI into `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/civicfix_ai?retryWrites=true&w=majority
   ```
*Note: If `MONGODB_URI` is omitted or local MongoDB is not running, CivicFix AI automatically operates in fast In-Memory mode with complete seed data!*

---

## 23. Gemini API Configuration
1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Open `server/.env` and paste your key:
   ```env
   GEMINI_API_KEY=AIzaSy...your_gemini_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
*Note: If no API key is provided, CivicFix AI uses an intelligent heuristic vision simulator so you can test image uploads offline.*

---

## 24. Cloudinary Setup (Optional)
To upload photos directly to cloud object storage:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
*If omitted, files are stored locally in `server/uploads` and served automatically.*

---

## 25. Environment Variable Explanations
### Server (`server/.env`):
- `PORT`: HTTP server port (default: `5000`)
- `CLIENT_URL`: URL of the frontend client (default: `http://localhost:5173`)
- `JWT_SECRET`: Secret key for JWT signature
- `JWT_EXPIRES_IN`: Session token lifetime (default: `7d`)
- `GEMINI_API_KEY`: Google AI Studio Gemini API key
- `GEMINI_MODEL`: Model identifier (default: `gemini-2.5-flash`)

### Client (`client/.env`):
- `VITE_API_BASE_URL`: Backend REST API URL (`http://localhost:5000/api`)
- `VITE_SOCKET_URL`: Socket.IO Server URL (`http://localhost:5000`)

---

## 26. Running the Application

### Option A: Run Server & Client Independently
**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```
Server runs on: `http://localhost:5000`

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
Client runs on: `http://localhost:5173`

### Option B: Docker Compose
```bash
docker-compose up --build
```

---

## 27. API Documentation
Comprehensive endpoint definitions, sample payloads, and responses are documented in [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

---

## 28. Authentication and Authorization
- Passwords hashed with `bcryptjs` (10 rounds).
- Stateless JWT Bearer tokens passed via `Authorization: Bearer <token>`.
- Protected routes guarded with role-based middleware (`citizen`, `officer`, `admin`).

---

## 29. Security Practices
- Helmet HTTP security headers enabled.
- Express rate limiting active on `/api` routes (300 req / 15 min).
- Multer strict MIME-type and 10MB file size validation.
- Citizen private details masked on public endpoints.
- Read more in [docs/SECURITY.md](docs/SECURITY.md).

---

## 30. Testing Instructions
### Health Check Test
```bash
curl http://localhost:5000/api/health
```

### Public Transparency Test
```bash
curl http://localhost:5000/api/public/transparency
```

### Full Frontend Test Build
```bash
cd client
npm run build
```

---

## 31. Troubleshooting
- **Port 5000 or 5173 already in use:** Modify `PORT=5001` in `server/.env` and `VITE_API_BASE_URL` in `client/.env`.
- **EPERM error on Windows:** Re-run `npm run build` or ensure `preserveSymlinks: true` is configured in `vite.config.ts`.
- **MongoDB connection timeout:** CivicFix AI automatically switches to Zero-Config In-Memory mode without crashing.

---

## 32. Deployment Instructions
- **Frontend (Vercel):** Connect GitHub repo, set root directory to `client`, build command `npm run build`, output directory `dist`.
- **Backend (Render / Railway):** Set root directory to `server`, build command `npm install && npm run build`, start command `npm start`.

---

## 33. Screenshots Section
1. **Interactive Civic Issue Map:** Fullscreen GIS visualization of city complaints with color-coded priority markers.
2. **AI Multimodal Vision Inspection:** Gemini AI detecting asphalt road potholes, estimating urgency, and suggesting departments.
3. **Admin Command Center:** Recharts trends, monthly resolution curves, and SLA scorecards.
4. **8-Stage Real-Time Timeline:** End-to-end tracking from submission to citizen 5-star resolution verification.

---

## 34. Demo Account Setup Instructions
CivicFix AI features a **1-Click Demo Login bar** on both the Navbar and Login page:

| Role | Name | Email | Password |
|---|---|---|---|
| **Citizen** | Aarav Sharma | `citizen@civicfix.gov.in` | `CivicFix@2026` |
| **Municipal Officer** | Rajesh Kumar (PWD) | `officer@civicfix.gov.in` | `CivicFix@2026` |
| **City Commissioner** | Pooja Verma (Admin) | `admin@civicfix.gov.in` | `CivicFix@2026` |

*Pre-loaded with realistic complaints in New Delhi (Connaught Place, Lajpat Nagar, Karol Bagh, Model Town).*

---

## 35. Future Scope
- WhatsApp Chatbot integration for low-bandwidth rural complaint reporting.
- Multilingual voice support (Hindi, Tamil, Telugu, Bengali) using Gemini Audio understanding.
- Automated municipal contractor penalty calculation when SLA resolution thresholds are breached.

---

## 36. Known Limitations
- Geolocation precision relies on user hardware GPS or OpenStreetMap search accuracy.
- Gemini image analysis requires network connectivity to Google AI Studio; offline mode uses realistic heuristic simulations.

---

## 37. Contribution Guidelines
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/SmartRouting`).
3. Commit your changes (`git commit -m 'feat: Add dynamic smart routing'`).
4. Push to the branch (`git push origin feature/SmartRouting`).
5. Open a Pull Request.

---

## 38. License
This project is open-source and distributed under the **MIT License**.
