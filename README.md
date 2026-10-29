# 🏥 HospitalSync Pro Suite v2.5
### Enterprise-Grade Microservices Healthcare Operating Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg?style=for-the-badge&logo=github-actions)](#)
[![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue.svg?style=for-the-badge&logo=spring)](#-system-architecture)
[![Java](https://img.shields.io/badge/Java-17%20LTS-orange.svg?style=for-the-badge&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2024.0.0-blue.svg?style=for-the-badge&logo=spring)](https://spring.io/projects/spring-cloud)
[![React](https://img.shields.io/badge/React-19.2.6-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0.12-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose%20v2-2496ED.svg?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7%20Alpine-DC382D.svg?style=for-the-badge&logo=redis)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Compliance](https://img.shields.io/badge/Compliance-HIPAA%20Audit%20Ready-emerald.svg?style=for-the-badge)](#-security--hipaa-compliance)

---

> **HospitalSync Pro Suite** is a full-stack, distributed, cloud-native Hospital Information System (HIS) and Electronic Health Records (EHR) platform. It orchestrates **18 Spring Boot services** behind a reactive API Gateway and Eureka Service Discovery cluster, with resilient OpenFeign inter-service events, distributed Redis caching, MySQL relational persistence across 25 normalized tables, and an **Aura Mesh Gradient & Glassmorphic React 19** executive web application.

---

## 📑 Table of Contents

1. [Executive Overview](#-executive-overview)
2. [System Architecture](#-system-architecture)
3. [Technology Stack](#-technology-stack)
4. [Microservices & Network Topology (18 Services)](#-microservices--network-topology-18-services)
5. [Role-Based Access Control (RBAC) Matrix](#-role-based-access-control-rbac-matrix)
6. [Frontend UI & Design System](#-frontend-ui--design-system)
7. [Inter-Service Workflows & OpenFeign](#-inter-service-workflows--openfeign)
8. [Database Architecture & Schema (25 Tables)](#-database-architecture--schema-25-tables)
9. [Security, Audit Trail & HIPAA Compliance](#-security-audit-trail--hipaa-compliance)
10. [Quick Start & Deployment](#-quick-start--deployment)
    - [Option 1: Docker Compose Deployment (Recommended)](#option-1-docker-compose-deployment-recommended)
    - [Option 2: Local Developer Mode](#option-2-local-developer-mode)
11. [Automated Testing & Quality Assurance](#-automated-testing--quality-assurance)
12. [Seeded Credentials & Personas](#-seeded-credentials--personas)
13. [Future Roadmap & Enhancements](#-future-roadmap--enhancements)
14. [License & Acknowledgements](#-license--acknowledgements)

---

## 🌟 Executive Overview

HospitalSync Pro Suite is engineered to eliminate operational bottlenecks across hospital admissions, outpatient consultations, diagnostic laboratory pipelines, clinical pharmacy inventory, and medical billing:

- **18 Independent Spring Boot Services**: Clean separation of bounded domains per Domain-Driven Design (DDD).
- **Edge Gateway & Discovery**: Single ingress via Spring Cloud Gateway with Netty non-blocking I/O and Eureka heartbeats.
- **Fail-Safe Inter-Service Communication**: OpenFeign clients with non-blocking resilience safeguards preventing cascading rollbacks.
- **Real-Time Inpatient & Bed Tracking**: Live bed allocation matrix across General, ICU, NICU, Maternity, and Isolation wards.
- **Auditing & HIPAA Ready**: Structured immutable audit trail capturing actor, entity state snapshots, IP, and timestamp.
- **Glassmorphic React 19 SPA**: Aura mesh gradient design system with live KPI metrics, dynamic drawers, and mobile-responsive navigation.

---

## 📐 System Architecture

```mermaid
graph TD
    subgraph Client Layer
        WebClient["🖥️ Web Client (React 19 / Vite 8 :5173 / :80)"]
    end

    subgraph Edge & Discovery
        Gateway["🌐 Spring Cloud API Gateway (Port 8080)"]
        Eureka["🔎 Eureka Service Discovery (Port 8761)"]
    end

    WebClient --> Gateway
    Gateway --> Eureka

    subgraph Core Domain Microservices
        Gateway --> Auth["🔐 auth-service (:8086)"]
        Gateway --> User["👤 user-service (:8087)"]
        Gateway --> Role["🔑 role-service (:8088)"]
        Gateway --> Dept["🏢 department-service (:8089)"]
        Gateway --> Patient["👥 patient-service (:8081)"]
        Gateway --> Doctor["🩺 doctor-service (:8082)"]
        Gateway --> Appt["📅 appointment-service (:8083)"]
        Gateway --> Admission["🛏️ admission-service (:8096)"]
        Gateway --> Rx["💊 prescription-service (:8085)"]
        Gateway --> EHR["📋 medical-record-service (:8090)"]
        Gateway --> LabTest["🧪 lab-test-service (:8092)"]
        Gateway --> LabReport["📄 lab-report-service (:8093)"]
        Gateway --> Med["💊 medicine-service (:8091)"]
        Gateway --> Bill["🧾 billing-service (:8084)"]
        Gateway --> Pay["💳 payment-service (:8094)"]
        Gateway --> Notif["🔔 notification-service (:8095)"]
    end

    subgraph Persistence & Caching
        MySQL[("🗄️ MySQL 8.0 (:3306)")]
        Redis[("⚡ Redis 7 Cache (:6379)")]
    end

    User --> Redis
    Patient --> Redis
    Doctor --> Redis
    Core Domain Microservices --> MySQL

    %% Inter-Service Communication via OpenFeign
    Appt -. "OpenFeign (Booking Event)" .-> Notif
    Pay -. "OpenFeign (Payment Receipt)" .-> Notif
    LabReport -. "OpenFeign (Report Released)" .-> Notif
    Rx -. "OpenFeign (Prescription Created)" .-> Notif
```

---

## 🛠️ Technology Stack

| Layer | Component | Version / Library | Highlights |
|:---|:---|:---:|:---|
| **Backend Core** | Java | `17 LTS` | Modern Java syntax, sealed types, pattern matching |
| **Microservices** | Spring Boot | `3.4.2` | Production-ready actuators, embedded Netty & Tomcat |
| **Cloud Routing** | Spring Cloud | `2024.0.0` | Gateway, Eureka Discovery, OpenFeign, LoadBalancer |
| **Resilience** | Resilience4j | `2.x` | Circuit breakers and fallbacks for inter-service calls |
| **Security** | Spring Security & JJWT | `0.12.6` | Stateless bearer token authentication, BCrypt hashing |
| **Database** | MySQL Server | `8.0` | 25 relational tables, foreign key integrity, indexing |
| **Caching** | Redis | `7 Alpine` | Spring Data Redis, Lettuce driver, sub-millisecond lookups |
| **API Docs** | Springdoc OpenAPI | `2.8.6` | Swagger UI auto-generation at `/swagger-ui.html` |
| **Frontend** | React | `19.2.6` | React 19 concurrent features, lazy loading, hooks |
| **Build Tooling** | Vite | `8.0.12` | Instant Hot Module Replacement (HMR), Rollup bundling |
| **UI Framework** | Bootstrap | `5.3.8` | Custom glassmorphic styles, Aura mesh theme, Bootstrap Icons |
| **Payments** | Razorpay SDK | Java SDK | Online payment order creation and receipt generation |
| **Containerization**| Docker & Compose | Compose v2 | Multi-stage container builds on bridge network `hospital-network` |

---

## 🗺️ Microservices & Network Topology (18 Services)

All client requests route through the **API Gateway** on Port `8080`. Individual microservices are isolated inside the virtual private network and discoverable via **Eureka**:

| Port | Service Name | Category | Primary Responsibility | Primary API Base Route | Actuator Health |
|:---:|:---|:---|:---|:---|:---:|
| **8761** | `naming-server` | Infrastructure | Service Discovery Registry & Heartbeat Health Monitor | `/eureka/**` | [`/actuator/health`](http://localhost:8761/actuator/health) |
| **8080** | `api-gateway` | Infrastructure | Centralized Edge Routing, Rate Limiting & Global CORS | `/api/v1/**` | [`/actuator/health`](http://localhost:8080/actuator/health) |
| **8086** | `auth-service` | Identity | User Registration, Login, JWT Token Issuance & Refresh | `/api/v1/auth/**` | [`/actuator/health`](http://localhost:8086/actuator/health) |
| **8087** | `user-service` | Identity | User Management, Role Mapping, Admin KPI Aggregator | `/api/v1/users/**` | [`/actuator/health`](http://localhost:8087/actuator/health) |
| **8088** | `role-service` | Identity | RBAC Role Definitions & Permission Assignment Matrix | `/api/v1/roles/**` | [`/actuator/health`](http://localhost:8088/actuator/health) |
| **8089** | `department-service` | Clinical Ops | Clinical Specialties (Cardiology, Orthopedics, Oncology) | `/api/v1/departments/**`| [`/actuator/health`](http://localhost:8089/actuator/health) |
| **8081** | `patient-service` | Clinical Ops | Patient Intake, Demographic Records & Emergency Contacts | `/api/v1/patients/**` | [`/actuator/health`](http://localhost:8081/actuator/health) |
| **8082** | `doctor-service` | Clinical Ops | Physician Profiles, Shift Calendars & Specializations | `/api/v1/doctors/**` | [`/actuator/health`](http://localhost:8082/actuator/health) |
| **8083** | `appointment-service` | Clinical Ops | Outpatient Slot Scheduling & Feign Notification Events | `/api/v1/appointments/**`| [`/actuator/health`](http://localhost:8083/actuator/health) |
| **8096** | `admission-service` | Inpatient Care | Inpatient Admissions, Ward Management & Live Bed Matrix | `/api/v1/admissions/**` | [`/actuator/health`](http://localhost:8096/actuator/health) |
| **8085** | `prescription-service` | Clinical Ops | Electronic Prescriptions (e-Rx), Dosages & Notes | `/api/v1/prescriptions/**`| [`/actuator/health`](http://localhost:8085/actuator/health) |
| **8090** | `medical-record-service`| Clinical Ops | Electronic Health Records (EHR), Diagnoses & Clinical Notes| `/api/v1/medical-records/**`| [`/actuator/health`](http://localhost:8090/actuator/health) |
| **8091** | `medicine-service` | Pharmacy | Drug Catalog, Batch Tracking, Inventory & Expiry Alerts | `/api/v1/medicines/**` | [`/actuator/health`](http://localhost:8091/actuator/health) |
| **8092** | `lab-test-service` | Diagnostic | Diagnostic Test Catalog, Specimen Types & Price Lists | `/api/v1/lab-tests/**` | [`/actuator/health`](http://localhost:8092/actuator/health) |
| **8093** | `lab-report-service` | Diagnostic | Completed Diagnostic Results, Findings & Patient Reports | `/api/v1/lab-reports/**`| [`/actuator/health`](http://localhost:8093/actuator/health) |
| **8084** | `billing-service` | Finance | Medical Invoices, Itemized Ledger, Insurance Policies | `/api/v1/billing/**` | [`/actuator/health`](http://localhost:8084/actuator/health) |
| **8094** | `payment-service` | Finance | Transaction Processing, Razorpay Integration & Receipts | `/api/v1/payments/**` | [`/actuator/health`](http://localhost:8094/actuator/health) |
| **8095** | `notification-service` | Engagement | In-App Alerts, Unread Counters, Email & SMS Dispatch | `/api/v1/notifications/**`| [`/actuator/health`](http://localhost:8095/actuator/health) |

---

## 🔑 Role-Based Access Control (RBAC) Matrix

The system implements strict Role-Based Access Control enforcing least-privilege principles across frontend panels and backend endpoints:

| UI Module / Endpoint | `ADMIN` | `DOCTOR` | `RECEPTIONIST` | `NURSE` | `LAB_TECH` | `PHARMACIST` | `PATIENT` |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Executive Analytics Dashboard** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Doctor / Clinical Dashboard** | ✅ Full | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Receptionist Scheduling Hub** | ✅ Full | ❌ | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Patient Registration & Directory** | ✅ Full | 👁️ View | ✅ Full | 👁️ View | ❌ | ❌ | ❌ |
| **Doctor Directory & Shifts** | ✅ Full | 👁️ View | ✅ Manage | 👁️ View | ❌ | ❌ | 👁️ View |
| **Appointment Booking & Slots** | ✅ Full | ✅ Consult | ✅ Full | 👁️ View | ❌ | ❌ | ✅ Self |
| **Inpatient Bed & Ward Management** | ✅ Full | 👁️ View | 👁️ View | ✅ Manage | ❌ | ❌ | ❌ |
| **Electronic Prescriptions (e-Rx)** | ✅ Full | ✅ Create | ❌ | 👁️ View | ❌ | 👁️ Dispense | 👁️ Self |
| **Medical Records (EHR) & Vitals** | ✅ Full | ✅ Full | ❌ | ✅ Vitals | ❌ | ❌ | 👁️ Self |
| **Lab Diagnostics & Test Orders** | ✅ Full | ✅ Order | ❌ | ❌ | ✅ Process | ❌ | 👁️ Self |
| **Pharmacy & Medicine Inventory** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ✅ Full | ❌ |
| **Billing, Invoices & Insurance** | ✅ Full | ❌ | ✅ Invoice | ❌ | ❌ | ❌ | 👁️ Self |
| **Payments & Razorpay Ledger** | ✅ Full | ❌ | ✅ Accept | ❌ | ❌ | ❌ | ✅ Pay |
| **System Settings & Audit Logs** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🎨 Frontend UI & Design System

The frontend is constructed using **React 19**, **Vite 8**, **Bootstrap 5.3**, and an **Aura Mesh Gradient & Glassmorphism** design architecture:

- **Aura Mesh Ambient Glow**: Soft radial gradients combining Electric Blue (`#0ea5e9`), Lavender Purple (`#a855f7`), Warm Peach, and Emerald Mint on an ultra-clean slate base.
- **Glassmorphic Cards**: Semi-transparent frosted cards (`backdrop-filter: blur(24px)`), hairline borders (`rgba(226, 232, 240, 0.8)`), and soft elevation shadows.
- **Live Notification Center**: Live header bell counter with real-time polling drawer for appointment alerts, payment confirmations, and lab releases.
- **Dynamic View Modules**:
  1. 📊 **Executive Dashboard**: Live KPI metric cards, Department Consultation donut chart, Operations Snapshot, Admissions Funnel, and 24h Heatmap.
  2. 👥 **Patient Registry**: Intake forms, medical history modals, contact cards, and search filters.
  3. 🩺 **Physician Directory**: Department associations, doctor qualifications, and shift management.
  4. 📅 **Consultation Calendar**: Multi-status appointment workflows (`SCHEDULED`, `COMPLETED`, `CANCELLED`).
  5. 🛏️ **Bed & Ward Control Board**: Visual occupancy grid (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`) with ward-level breakdown.
  6. 💊 **e-Prescription Hub**: Structured drug dosages, frequencies, treatment duration, and doctor instructions.
  7. 📋 **EHR Longitudinal Timeline**: Complete patient clinical timeline, vital signs history, and diagnosis logs.
  8. 🧪 **Diagnostics Laboratory**: Diagnostic test price catalog and structured lab report entry.
  9. 📦 **Pharmacy Inventory**: Real-time stock status (🔴 Critical, 🟡 Low, 🟢 In Stock), batch numbers, and 90-day expiry notifications.
  10. 🧾 **Itemized Billing**: Invoicing with consultation, medicine, lab, and bed room charges.
  11. 💳 **Financial Ledger**: Multi-channel payment recording (Cash, Card, UPI, Insurance, Net Banking, Razorpay).
  12. 👤 **Profile & Security**: User credentials, role badges, and authenticated password changes.
  13. ⚙️ **Platform Settings**: Hospital branch info, notification toggles, and session policies.
  14. ❓ **Help Desk**: Searchable FAQ accordions and direct IT support ticket submission.

---

## 🔄 Inter-Service Workflows & OpenFeign

HospitalSync uses Spring Cloud OpenFeign to choreograph synchronous workflows while guaranteeing transactional resilience:

```text
1. Appointment Booked ────► appointment-service ──(Feign)──► notification-service (APPOINTMENT_CONFIRMATION)
2. Payment Processed ─────► payment-service ─────(Feign)──► notification-service (PAYMENT_CONFIRMATION)
3. Lab Report Released ───► lab-report-service ──(Feign)──► notification-service (LAB_REPORT_AVAILABLE)
4. Prescription Issued ───► prescription-service ──(Feign)──► notification-service (PRESCRIPTION_CREATED)
```

> **Resilience Guarantee**: All Feign client invocations are wrapped in non-blocking try/catch execution handlers. If the notification service experiences latency or is undergoing maintenance, primary database commits (such as scheduling appointments or recording payments) complete successfully without rollback.

---

## 🗄️ Database Architecture & Schema (25 Tables)

The master SQL schema is available in [`database/schema.sql`](database/schema.sql). The relational architecture comprises **25 normalized tables** with strict constraints and foreign keys:

| # | Table Name | Owning Microservice | Primary Key | Key Foreign Keys & Description |
|:--:|:---|:---|:---:|:---|
| 1 | `roles` | `role-service` | `id` | Standard RBAC definitions (`ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`) |
| 2 | `users` | `user-service` / `auth-service` | `id` | Authenticated platform credentials, emails, and account status |
| 3 | `departments` | `department-service` | `id` | Hospital clinical departments and specialty director bindings |
| 4 | `doctors` | `doctor-service` | `id` | `department_id -> departments(id)`, `user_id -> users(id)` |
| 5 | `doctor_schedules` | `doctor-service` | `id` | `doctor_id -> doctors(id)`: Weekly shift hours and consultation slots |
| 6 | `patients` | `patient-service` | `id` | Patient demographics, medical history, blood group, emergency contact |
| 7 | `appointments` | `appointment-service` | `id` | `patient_id -> patients(id)`, `doctor_id -> doctors(id)` |
| 8 | `medical_records` | `medical-record-service`| `id` | `patient_id -> patients(id)`, `doctor_id -> doctors(id)`: EHR clinical history |
| 9 | `prescriptions` | `prescription-service` | `id` | `patient_id -> patients(id)`, `doctor_id -> doctors(id)`: Consultation Rx header |
| 10 | `prescription_items` | `prescription-service` | `id` | `prescription_id -> prescriptions(id)`: Specific drug dosage line items |
| 11 | `medicines` | `medicine-service` | `id` | Drug catalog, generic formulations, strength, and manufacturers |
| 12 | `medicine_inventory` | `medicine-service` | `id` | `medicine_id -> medicines(id)`: Batch numbers, expiry dates, shelf units |
| 13 | `lab_tests` | `lab-test-service` | `id` | Diagnostic test catalog, category codes, specimen types, and pricing |
| 14 | `lab_orders` | `lab-test-service` | `id` | `patient_id -> patients(id)`, `doctor_id -> doctors(id)`: Test orders |
| 15 | `lab_reports` | `lab-report-service` | `id` | `lab_test_id -> lab_tests(id)`: Diagnostic findings, values, and normal ranges |
| 16 | `wards` | `admission-service` | `id` | `department_id -> departments(id)`: Ward sections (`GENERAL`, `ICU`, etc.) |
| 17 | `beds` | `admission-service` | `id` | `ward_id -> wards(id)`: Individual beds and live availability status |
| 18 | `admissions` | `admission-service` | `id` | `patient_id -> patients(id)`, `bed_id -> beds(id)`: Inpatient admissions |
| 19 | `discharges` | `admission-service` | `id` | `admission_id -> admissions(id)`: Discharge summaries and follow-up care |
| 20 | `bills` | `billing-service` | `id` | `patient_id -> patients(id)`: Master invoice header and payment status |
| 21 | `bill_items` | `billing-service` | `id` | `bill_id -> bills(id)`: Itemized charges (consultation, lab, pharmacy, room) |
| 22 | `payments` | `payment-service` | `id` | `patient_id -> patients(id)`, `billing_id -> bills(id)`: Transaction receipts |
| 23 | `insurance` | `billing-service` | `id` | `patient_id -> patients(id)`: Patient insurance policies and coverage caps |
| 24 | `notifications` | `notification-service` | `id` | `user_id -> users(id)`: In-app alerts, email logs, and read markers |
| 25 | `audit_logs` | `user-service` | `id` | HIPAA audit trail: Actor, action, entity snapshots (JSON), IP, timestamp |

To initialize or reset the schema manually in MySQL:

```bash
mysql -u root -p < database/schema.sql
```

---

## 🔒 Security, Audit Trail & HIPAA Compliance

HospitalSync Pro Suite embeds healthcare data protection standards directly into its architectural primitives:

1. **Stateless JWT Authentication**: Tokens signed with HS256/HS512 algorithms carrying user roles and expiration claims; zero session state stored in gateway memory.
2. **Centralized Edge Filtering**: All routes behind API Gateway require valid bearer tokens (except `/api/v1/auth/**`), preventing unauthorized access to domain microservices.
3. **Cryptographic Password Protection**: BCrypt hashing with custom salt rounds; plaintext passwords are never logged or stored.
4. **HIPAA Audit Log Matrix (`audit_logs`)**:
   - Every state-altering action generates an immutable audit record:
     - `user_id` / `username`: Who performed the action.
     - `action`: Specific operation (`CREATE_PATIENT`, `DISCHARGE_PATIENT`, `UPDATE_BILL`, etc.).
     - `entity_type` & `entity_id`: Target resource.
     - `old_value` & `new_value`: Full JSON snapshots before and after the change for differential auditing.
     - `ip_address` & `user_agent`: Client network fingerprints.
     - `created_at`: Microsecond timestamp.

---

## ⚡ Quick Start & Deployment

### Prerequisites

- **Docker Engine** 24.0+ & **Docker Compose** v2 — *for containerized deployment*
- **Java 17 JDK** & **Apache Maven 3.9+** — *for local backend development*
- **Node.js 18+** & **npm 9+** — *for local frontend development*
- **MySQL 8.0+** & **Redis 7+** — *for local developer mode*

---

### Option 1: Docker Compose Deployment (Recommended)

Boot up all 20+ containers (MySQL, Redis, Eureka, API Gateway, 16 Spring Boot Microservices, and Nginx React Frontend) with a single command:

```bash
# 1. Clone repository
git clone https://github.com/your-username/Hospital_tech.git
cd Hospital_tech

# 2. Set environment variables (or export them in your shell)
export JWT_SECRET=HospitalSyncSecretKey2026SecureJwtSigningKeyString
export RAZORPAY_KEY_ID=rzp_test_placeholder
export RAZORPAY_KEY_SECRET=rzp_secret_placeholder

# 3. Build images and launch containers
docker compose up -d

# 4. Verify running health
docker compose ps
```

#### Live Service Endpoints:
- **HospitalSync Web Application**: `http://localhost` (or `http://localhost:5173`)
- **API Gateway**: `http://localhost:8080`
- **Eureka Service Registry**: `http://localhost:8761`
- **MySQL Database**: `localhost:3306` (`root` / `Password`)
- **Redis Cache**: `localhost:6379`

To tail logs for any service:
```bash
docker compose logs -f api-gateway
docker compose logs -f auth-service
```

---

### Option 2: Local Developer Mode

Run individual services on your workstation for active feature development:

#### Step 1: Start MySQL & Redis
Ensure MySQL 8.0 is running on port 3306 and Redis is on port 6379. Initialize database tables:
```bash
mysql -u root -p < database/schema.sql
```

#### Step 2: Set Environment Variables
```powershell
$env:JWT_SECRET = "HospitalSyncSecretKey2026SecureJwtSigningKeyString"
```

#### Step 3: Start Eureka Discovery Server (Port 8761)
```bash
cd hospital-management-backend/naming-server/naming-server
mvn spring-boot:run
```
*Wait until Eureka dashboard is accessible at `http://localhost:8761`.*

#### Step 4: Start Spring Cloud API Gateway (Port 8080)
```bash
cd hospital-management-backend/api-gateway/api-gateway
mvn spring-boot:run
```

#### Step 5: Start Domain Microservices
In separate terminal sessions, launch the microservices as required:
```bash
# Identity & Clinical Ops
cd hospital-management-backend/auth-service/auth-service && mvn spring-boot:run
cd hospital-management-backend/user-service && mvn spring-boot:run
cd hospital-management-backend/role-service && mvn spring-boot:run
cd hospital-management-backend/department-service && mvn spring-boot:run
cd hospital-management-backend/patient-service/patient-service && mvn spring-boot:run
cd hospital-management-backend/doctor-service/doctor-service && mvn spring-boot:run
cd hospital-management-backend/appointment-service/appointment-service && mvn spring-boot:run
cd hospital-management-backend/admission-service && mvn spring-boot:run
cd hospital-management-backend/prescription-service/prescription-service && mvn spring-boot:run
cd hospital-management-backend/medical-record-service && mvn spring-boot:run

# Diagnostics, Pharmacy & Financial Ops
cd hospital-management-backend/lab-test-service && mvn spring-boot:run
cd hospital-management-backend/lab-report-service && mvn spring-boot:run
cd hospital-management-backend/medicine-service && mvn spring-boot:run
cd hospital-management-backend/billing-service/billing-service && mvn spring-boot:run
cd hospital-management-backend/payment-service && mvn spring-boot:run
cd hospital-management-backend/notification-service && mvn spring-boot:run
```

#### Step 6: Start React Frontend
```bash
cd hospital-management-frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing & Quality Assurance

### PowerShell Smoke Test Runner
The root directory includes an automated API route verification script compatible with Windows PowerShell 5.1+:

```powershell
# Run from repository root
.\smoke-test.ps1
```

The smoke suite verifies:
- Eureka discovery status and `/actuator/health`
- Auth service authentication and JWT token acquisition
- Edge gateway routing across Patients, Doctors, Appointments, Prescriptions, and Billing
- Clinical endpoints across Medical Records, Beds, Lab Tests, Lab Reports, Medicines, and Payments
- Support services and Admin Dashboard KPI aggregation

### Postman Collection v2.1
Import [`hospital_management_postman_collection.json`](hospital_management_postman_collection.json) into Postman:
1. Set the environment variable: `BASE_URL = http://localhost:8080`.
2. Run request **1. Authentication > Login (Get JWT Token)**.
3. The embedded post-response test script automatically stores the token in `{{TOKEN}}` and injects it into all 12 test folders.

### Maven Test Execution
Run automated unit and context integration tests on any backend service:
```bash
cd hospital-management-backend/auth-service/auth-service
mvn test -Dtest=AuthServiceApplicationTests -DJWT_SECRET=HospitalSyncSecretKey2026SecureJwtSigningKeyString
```

---

## 🔑 Seeded Credentials & Personas

The system includes pre-configured personas for role verification:

| Role | Username | Default Password | Primary Dashboard & Access Scope |
|:---|:---|:---|:---|
| **Admin** | `admin.director` *(or `admin`)* | `password123` *(or `admin123`)* | Executive KPI Dashboard, user management, hospital settings |
| **Doctor** | `dr.sharma` | `Doctor@123` | Doctor Dashboard, appointments, e-Prescriptions, EHR history |
| **Receptionist** | `receptionist1` | `password123` | Patient intake, slot scheduling, doctor directory |
| **Nurse** | `nurse.lead` | `password123` | Ward control board, bed status, vitals recording |
| **Lab Tech** | `labtech1` | `password123` | Diagnostic test orders and lab report entry |
| **Pharmacist** | `pharmacist1` | `password123` | Drug catalog, inventory batches, 90-day expiry tracker |
| **Patient** | `patient.demo` | `password123` | Outpatient bookings, lab reports, e-Rx notes, invoice settlement |

---

## 🚀 Future Roadmap & Enhancements

- **Event-Driven Messaging (Apache Kafka / RabbitMQ)**: Decouple Feign synchronous calls into event topics (`PatientAdmittedEvent`, `PaymentSuccessEvent`, `LabReportReadyEvent`).
- **Distributed Tracing & APM**: Integrate OpenTelemetry / Micrometer with Zipkin or Grafana Tempo for end-to-end request latency profiling.
- **Smart Clinical AI Assistant**: LLM-assisted EHR record summarization and real-time Drug-Drug Interaction (DDI) contraindication checks during prescription drafting.
- **Telemedicine Suite**: WebRTC-based peer-to-peer secure video consultations directly within doctor and patient portals.
- **Healthcare Interoperability (HL7 / FHIR)**: Implement FHIR REST APIs for insurance data exchange and national health portal (ABHA) integration.
- **Kubernetes (K8s) Helm Charts**: Production cloud deployment manifests with Horizontal Pod Autoscaling (HPA) and cert-manager TLS.

---

## 📄 License & Acknowledgements

- **Platform Version**: HospitalSync Pro Suite v2.5
- **License**: Released under the [MIT License](LICENSE)
- **Architectural Reference**: Built according to microservice distributed systems best practices, HIPAA audit logging principles, and reactive edge routing.

