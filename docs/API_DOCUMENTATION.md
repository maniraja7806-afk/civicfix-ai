# CivicFix AI – REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### POST `/auth/register`
Register a new citizen or officer account.

**Request Body:**
```json
{
  "name": "Aarav Sharma",
  "email": "aarav.sharma@gmail.com",
  "password": "SecurePassword123",
  "phone": "+91 98765 43210",
  "role": "citizen",
  "address": "Connaught Place, New Delhi"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "673f1a2b...",
    "name": "Aarav Sharma",
    "email": "aarav.sharma@gmail.com",
    "role": "citizen"
  }
}
```

### POST `/auth/login`
Authenticate with email and password.

### POST `/auth/demo-login`
One-click demo login for hackathons and academic evaluations.
```json
{
  "role": "citizen" // or "officer", "admin"
}
```

### GET `/auth/me`
Retrieve currently authenticated user profile.
Headers: `Authorization: Bearer <token>`

---

## 2. Complaint Endpoints

### POST `/complaints`
Report a new civic issue with images and GPS coordinates.
Headers: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Form Data Parameters:**
- `title`: string (min 5 chars)
- `description`: string (min 10 chars)
- `category`: string (e.g. "Roads & Potholes")
- `latitude`: number (-90 to 90)
- `longitude`: number (-180 to 180)
- `address`: string
- `landmark`: string (optional)
- `reportedPriority`: string ("Critical", "High", "Medium", "Low")
- `images`: file[] (up to 5 images)
- `aiAnalysisData`: JSON string (optional, output from AI inspection)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Complaint reported successfully.",
  "complaint": {
    "complaintId": "CFA-2026-000125",
    "title": "Severe Road Pothole near Exit 3",
    "category": "Roads & Potholes",
    "priority": "High",
    "status": "Submitted",
    "location": {
      "type": "Point",
      "coordinates": [77.2185, 28.6328]
    }
  }
}
```

### GET `/complaints`
List civic complaints with filtering and pagination.
**Query Parameters:**
- `category`: Filter by category
- `status`: Filter by status
- `priority`: Filter by priority
- `citizenId`: Filter by citizen owner
- `departmentId`: Filter by assigned department
- `search`: Keyword search in title, description, address, or ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### GET `/complaints/:id`
Fetch complaint details, full 8-stage audit timeline, and duplicate group information.

### PATCH `/complaints/:id`
Update complaint details or submit citizen resolution feedback.
```json
{
  "citizenFeedback": {
    "rating": 5,
    "comment": "Swift repair completed by PWD team.",
    "isSatisfied": true
  }
}
```

### GET `/complaints/nearby`
Search for complaints within a specified radius.
**Query Parameters:**
- `lat`: latitude
- `lng`: longitude
- `radiusKm`: radius in kilometers (default: 5)

---

## 3. AI Endpoints

### POST `/ai/analyze-image`
Upload a civic issue photograph for Gemini multimodal analysis.
Headers: `Content-Type: multipart/form-data`
Body: `image` (file), `userNotes` (optional string)

**Response (200 OK):**
```json
{
  "success": true,
  "analysis": {
    "detectedIssue": "Severe Road Pothole and Asphalt Cavity",
    "suggestedTitle": "Hazardous Road Pothole on High-Traffic Lane",
    "suggestedCategory": "Roads & Potholes",
    "suggestedPriority": "High",
    "suggestedDepartment": "Public Works Department",
    "confidenceScore": 94,
    "visualDamage": "Asphalt crater approx. 15cm depth causing vehicular swerving.",
    "urgencyExplanation": "High risk of two-wheeler skidding during peak traffic.",
    "safetyAdvisory": "Motorists advised to reduce speed to 20 km/h in this lane."
  }
}
```

### POST `/ai/classify-complaint`
Evaluate priority factors and urgency based on issue specifications.

### POST `/ai/detect-duplicates`
Detect duplicate issues within spatial proximity and semantic similarity.

---

## 4. Municipal Officer Endpoints

### GET `/officer/assignments`
Fetch complaints assigned to the logged-in officer or their department.

### PATCH `/officer/complaints/:id/status`
Update complaint status (e.g. `In Progress`, `Resolved`).

### POST `/officer/complaints/:id/evidence`
Upload photographic proof and resolution description after completing field repairs.
Headers: `Content-Type: multipart/form-data`
Parameters:
- `description`: Work summary
- `evidence`: file[] (up to 4 images)

---

## 5. Administrative Endpoints

### GET `/admin/overview`
High-level KPIs: total complaints, resolution percentage, pending tickets, active officers.

### GET `/admin/analytics`
Recharts analytics datasets: monthly resolution trends, category breakdown, department performance.

### POST `/admin/assign-complaint`
Reassign department, officer, and priority override.

### GET `/admin/departments`
List municipal departments and configured SLAs.

### POST `/admin/departments`
Register a new department with category mappings.

### GET `/admin/export-csv`
Download complaints report formatted as CSV.

---

## 6. Public Transparency Endpoints

### GET `/public/transparency`
Open municipal data: resolution metrics, department performance, and sanitized map coordinates (with private citizen identities stripped).
