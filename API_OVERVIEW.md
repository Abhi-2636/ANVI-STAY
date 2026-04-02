# 🏢 ANVI STAY – Technical Project Overview & API Documentation

This document provides a comprehensive breakdown of the **ANVI STAY** backend architecture, API endpoints, and the specific Node.js functions used for each task. This is designed to be presented to an invigilator for technical evaluation.

---

## 🛠️ 1. Technical Stack & Core Modules
The backend is built on a **Node.js (LTS)** runtime environment using the **Express.js** framework and **MongoDB** with **Mongoose ODM**.

### 📦 Key Node.js Core Modules Used:
| Module | Task / Purpose | Specific Implementation Example |
| :--- | :--- | :--- |
| **`fs`** (File System) | Handling file operations (upload, delete, directory creation) | `fs.mkdirSync()` for upload folders, `fs.unlinkSync()` to delete files. |
| **`path`** | Managing file and directory paths across different OS environments | `path.join(__dirname, '..', 'uploads')` for cross-platform compatibility. |
| **`crypto`** | Secure hashing and token generation | `crypto.createHash('sha256')` for secure password reset tokens. |
| **`os` / `process`** | Accessing system resources and environment variables | `process.env.MONGO_URI` to fetch configuration from `.env` files. |
| **`http/https`** | Standard web protocol handling (via Express) | Underlying engine for all `app.get()`, `app.post()` requests. |

### 📚 Essential 3rd-Party Libraries:
- **`jsonwebtoken (JWT)`**: For stateless authentication and session management.
- **`mongoose`**: For NoSQL database modeling, querying, and schema validation.
- **`multer`**: Middleware for handling `multipart/form-data` (file uploads like photos/PDFs).
- **`bcryptjs`**: Industry-standard password hashing (one-way encryption).
- **`nodemailer`**: For automated email notifications (password resets, receipts).
- **`node-cron`**: For scheduling background tasks (daily reminders, monthly billing).
- **`axios`**: To interact with external services (e.g., WhatsApp Gateway, simulated in `whatsapp.js`).

---

## 🌐 2. Comprehensive API Documentation
The API is structured around RESTful principles. Each "Work Unit" (task) is mapped to its corresponding endpoint.

### 🔑 A. Admin & Authentication (Security Layer)
| Task / Work | HTTP Method | API Endpoint | Node.js / Package Function Used |
| :--- | :--- | :--- | :--- |
| **Admin Login** | `POST` | `/api/admin/login` | `Admin.findOne()`, `admin.matchPassword()` (Bcrypt). |
| **Secure Token Refresh** | `POST` | `/api/admin/refresh-token` | `jwt.verify()`, `jwt.sign()`. |
| **Password Reset (Email)** | `POST` | `/api/admin/forgot-password` | `crypto.randomBytes()`, `nodemailer.sendMail()`. |
| **Self Profile Update** | `PUT` | `/api/admin/me` | `Admin.findById()`, `admin.save()`. |
| **Account Management** | `POST` | `/api/admin/users` | `Admin.create()`, `logAction()` (Audit service). |

### 🏠 B. Room & Tenancy Management
| Task / Work | HTTP Method | API Endpoint | Node.js / Package Function Used |
| :--- | :--- | :--- | :--- |
| **List Available Rooms** | `GET` | `/api/rooms/availability` | `Room.aggregate()` (MongoDB Pipeline). |
| **Add / Update Room** | `PUT` | `/api/rooms/:building/:no` | `Room.findOneAndUpdate()` with `{ upsert: true }`. |
| **Tenant Portal Login** | `POST` | `/api/rooms/tenant-login` | `Room.findOne()`, `matchPassword()`, `req.body` parsing. |
| **Tenant Room Swap** | `POST` | `/api/rooms/swap` | `Promise.all([roomA.save(), roomB.save()])` (Atomic update). |
| **Dashboard Statistics** | `GET` | `/api/rooms/dashboard-stats`| `Room.countDocuments()`, `Array.forEach()`. |

### 💰 C. Payments & Billing
| Task / Work | HTTP Method | API Endpoint | Node.js / Package Function Used |
| :--- | :--- | :--- | :--- |
| **Submit UPI Payment** | `POST` | `/api/rooms/:id/upi-verify` | `room.pendingPayments.push()`, `res.status(201)`. |
| **Approve Payment** | `PUT` | `/api/rooms/:id/upi-verify/:pid` | `Array.find()`, `sendWhatsAppReceipt()` (Utility). |
| **Monthly Bill Gen** | (Scheduled) | Internal Cron | `node-cron.schedule()`, `Math.max()` for units calculation. |
| **Download Receipt** | `GET` | `/api/rooms/receipt/:id` | `fs.createReadStream()` / `res.download()`. |

### 🛠️ D. Housekeeping & Maintenance
| Task / Work | HTTP Method | API Endpoint | Node.js / Package Function Used |
| :--- | :--- | :--- | :--- |
| **Report Complaint** | `POST` | `/api/maintenance` | `Maintenance.create()`, `req.ip` for logging. |
| **Assign Work** | `PUT` | `/api/maintenance/:id` | `Maintenance.findByIdAndUpdate()`. |
| **Upload Photo Evidence** | `POST` | `/api/uploads/photos` | `multer.single()`, `path.extname()` for validation. |

---

## ⚡ 3. Logic & Functionality Deep-Dive

### 📂 File Management System (Node.js `fs` + `path`)
For every file uploaded (Aadhaar, Photos, Receipts), the project executes:
1. **Validation**: Check file extension using `path` and `Regex`.
2. **Directory Check**: Use `fs.existsSync()` to verify the target folder path.
3. **Storage**: Stream the file buffer to disk using `multer`.
4. **Clean up**: When a room is vacated, `fs.unlink()` is used to permanently remove sensitive documents from the server.

### 🕒 Automated Background Jobs (`node-cron`)
Node.js keeps a "watch" on the system clock. At precisely **10:00 AM daily**, the server:
- Executes `Room.find({ status: 'Occupied' })`.
- Iterates over tenants to check `rentPaid` status.
- Triggers `sendWhatsAppReminder()` via `axios` if dues are pending.

### 🛡️ Security & Middleware Logic
Every request passes through an **Express Middleware Pipeline**:
1. **`Helmet`**: Adds 11+ security headers to prevent common web attacks.
2. **`CORS`**: Restricts API access only to the official frontend domain.
3. **`MongoSanitize`**: Scans `req.body` and removes characters like `$` and `.` to prevent NoSQL Injection.
4. **`JWT Auth`**: Decodes the `Authorization` header to confirm "Who is this user?" before allowing access to sensitive data.

---

## 📊 Summary for Invigilator
*   **Runtime**: Node.js v18+ (LTS)
*   **Framework**: Express.js (MVC Pattern - Routes & Controllers)
*   **DB**: MongoDB (Cloud Atlas)
*   **Key Skill Demonstrated**: Full CRUD operational logic, Token-based Security, Automated Cron Jobs, and File System handling.
