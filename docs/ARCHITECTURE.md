# CivicFix AI – System Architecture Documentation

## 1. Executive Summary

**CivicFix AI** is an intelligent civic issue reporting and resolution platform engineered to streamline communication between citizens and municipal authorities. By leveraging Google Gemini multimodal vision, geospatial duplicate clustering, and explainable AI prioritization, CivicFix AI transitions municipal grievance management from a reactive, opaque process to a proactive, transparent, and data-driven ecosystem.

---

## 2. System Architecture Diagram

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT LAYER                                       |
|                                                                                       |
|   React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion + Leaflet + Recharts   |
|                                                                                       |
|   +--------------------+  +--------------------+  +-------------------------------+   |
|   |  Citizen Portal    |  |  Officer Portal    |  |  Admin Command Center         |   |
|   |  - Camera/Upload   |  |  - Task Dispatch   |  |  - Recharts KPI Analytics     |   |
|   |  - GPS Pinning     |  |  - Field Repairs   |  |  - SLA Compliance Table       |   |
|   |  - Realtime Track  |  |  - Evidence Proof  |  |  - Department Configuration   |   |
|   |  - 5-Star Feedback |  |  - Area Map        |  |  - Official CSV Export        |   |
|   +--------------------+  +--------------------+  +-------------------------------+   |
+-------------------------------------------+-------------------------------------------+
                                            |
                         HTTPS REST API & WebSocket (Socket.IO)
                                            |
+-------------------------------------------v-------------------------------------------+
|                                 APPLICATION SERVER                                    |
|                                                                                       |
|   Node.js + Express.js + TypeScript + Helmet + CORS + RateLimiter + Zod Validation   |
|                                                                                       |
|   +-------------------+  +---------------------+  +-------------------------------+   |
|   | Auth Controller   |  | Complaint Controller|  | AI Controller                 |   |
|   | - JWT Token Gen   |  | - Spatial Search    |  | - Gemini Multimodal Vision    |   |
|   | - bcrypt Hash     |  | - Lifecycle Manager |  | - Heuristic Simulation Fallback|  |
|   | - RBAC Guard      |  | - Multer Upload     |  | - Explainable Priority Engine |   |
|   +-------------------+  +---------------------+  +-------------------------------+   |
|                                                                                       |
|   +-------------------+  +---------------------+  +-------------------------------+   |
|   | Officer Controller|  | Admin Controller    |  | Socket.IO Real-time Engine    |   |
|   | - Evidence Submit |  | - Multi-Dept SLA    |  | - User Personal Rooms         |   |
|   | - Status Mutator  |  | - CSV Generator     |  | - Department Fleet Rooms      |   |
|   | - Workload Stats  |  | - User Management   |  | - Live Ticket Broadcasts      |   |
|   +-------------------+  +---------------------+  +-------------------------------+   |
+-------------------------------------------+-------------------------------------------+
                                            |
                    Mongoose ODM (2dsphere Geospatial Indexing)
                                            |
+-------------------------------------------v-------------------------------------------+
|                                   DATA LAYER                                          |
|                                                                                       |
|   MongoDB Atlas / Local MongoDB (with Seamless Zero-Config In-Memory Fallback)        |
|                                                                                       |
|   - Users (Citizen, Officer, Admin)                                                   |
|   - Complaints (GeoJSON Point [lng, lat], CFA IDs, AI Metadata, Evidence)            |
|   - Departments (Purview categories, SLA thresholds, officer rosters)                 |
|   - ComplaintUpdates (Immutable 8-stage audit timeline history)                       |
|   - DuplicateGroups (Proximity clusters with distance & similarity scores)            |
|   - Notifications (Persistent user alerts with read states)                           |
+---------------------------------------------------------------------------------------+
```

---

## 3. Data Models & GeoJSON Schema

### Geospatial `2dsphere` Indexing
All civic issue locations are stored as GeoJSON `Point` objects:

```json
{
  "type": "Point",
  "coordinates": [77.2185, 28.6328]
}
```
*Note: GeoJSON coordinates follow the standard order: `[longitude, latitude]`.*

### Spatial Query Execution
Geospatial queries use MongoDB `$near` spherical operators:

$$\text{Distance} = 2R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)} \right)$$

---

## 4. AI Image Analysis Workflow

```
[ Citizen Uploads Photograph ]
             |
             v
[ Multer Validates MIME Type (JPG, PNG, WebP) & Size (< 10MB) ]
             |
             v
[ Google Gemini Multimodal Vision API (gemini-2.5-flash) ]
             |
             +---> Factual Damage Inspection (Crater depth, exposed wire, waste volume)
             +---> Category Classification (Roads, Sanitation, Electrical, Water, Drainage)
             +---> Ethical Safeguard Guardrail (Human identities redacted, no interior claims)
             +---> Safety Advisory Generation (Immediate precautionary guidance for motorists/pedestrians)
             |
             v
[ Structured JSON Delivered to Frontend -> Citizen Accepts / Edits Suggestions ]
```

---

## 5. Duplicate Detection & Proximity Clustering

When a citizen pins a location, CivicFix AI scans existing unresolved issues in the same category within a 150-meter threshold:

1. **Spatial Proximity:** Calculates exact geodesic distance using the Haversine equation.
2. **Semantic Similarity:** Computes word-token intersection and Jaccard coefficient between complaint titles and descriptions:

$$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$

3. **Combined Confidence:**

$$\text{Confidence} = \text{round}\left( \left( \left(1 - \frac{d}{d_{\text{max}}}\right) \times 0.6 + \text{TextSimilarity} \times 0.4 \right) \times 100 \right)$$

If $\text{Confidence} \ge 65\%$ or distance $\le 75\text{m}$, the system flags a duplicate candidate and links them under a `DuplicateGroup` for municipal officer review.

---

## 6. Priority Scoring Engine (Explainable AI)

The priority engine calculates an objective score ($S \in [0, 100]$):

$$S = S_{\text{safety}} + S_{\text{health}} + S_{\text{traffic}} + S_{\text{recurrence}} + S_{\text{density}}$$

Where:
- $S_{\text{safety}} \in [0, 30]$: Direct threat of electrocution, falling into open manholes, or vehicular crashes.
- $S_{\text{health}} \in [0, 25]$: Risk of airborne pathogen transmission, solid waste accumulation, or water contamination.
- $S_{\text{traffic}} \in [0, 20]$: Blockage on arterial roads, highways, or bus routes.
- $S_{\text{recurrence}} \in [0, 15]$: Frequency of repeated citizen reports in the same sector.
- $S_{\text{density}} \in [0, 10]$: Proximity to vulnerable zones (schools, hospitals, transit terminals).

### Classification Thresholds:
- **Critical:** Score $\ge 80$ or $S_{\text{safety}} \ge 28$
- **High:** Score $\ge 60$
- **Medium:** Score $\ge 35$
- **Low:** Score $< 35$

Officers can inspect the factor breakdown and override priority with an audit trail note.
