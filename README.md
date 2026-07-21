# 🏥 Hospital Management System – Microservices Architecture

A scalable **Hospital Management System** built using **Spring Boot Microservices, Spring Cloud, React, and MySQL**. The application is designed to streamline hospital operations by managing patients, doctors, appointments, prescriptions, billing, and authentication through independent microservices.

The system follows a cloud-ready microservices architecture using **Spring Cloud Gateway**, **Netflix Eureka**, and **OpenFeign** for service discovery and inter-service communication. Secure authentication is implemented using **JWT** with role-based access control for **Admin**, **Doctor**, and **Patient** users.

---

# 🚀 Features

* 🏥 Patient Management
* 🧑‍⚕️ Doctor Management
* 📅 Appointment Booking
* 💊 Digital Prescription Management
* 💳 Billing & Payment Management
* 🔐 JWT Authentication & Authorization
* 👥 Role-Based Access Control
* 🌐 API Gateway
* 🔍 Service Discovery with Eureka
* 🔗 Inter-Service Communication using OpenFeign
* 📱 Responsive React Frontend
* ⚡ Secure RESTful APIs
* ☁️ Cloud-Ready Microservices Architecture

---

# 🛠️ Tech Stack

## Frontend

* React
* Vite
* JavaScript
* Axios
* Tailwind CSS

## Backend

* Java
* Spring Boot
* Spring Security
* Spring Cloud Gateway
* Netflix Eureka Server
* OpenFeign
* Spring Data JPA
* Hibernate
* REST APIs
* Maven

## Database

* MySQL

## Authentication & Security

* JWT Authentication
* Role-Based Authorization
* Spring Security
* Protected REST APIs

## Tools

* Git & GitHub
* Postman
* IntelliJ IDEA
* VS Code

---

# 🏗️ Microservices Architecture

```text
                        Client (React)
                              │
                              ▼
                    Spring Cloud Gateway
                              │
 ┌───────────────┬────────────┼──────────────┬──────────────┬──────────────┐
 ▼               ▼            ▼              ▼              ▼
Auth Service  Patient     Doctor       Appointment     Billing
               Service     Service        Service       Service
                                   │
                                   ▼
                          Prescription Service

                 Eureka Server (Service Discovery)

             OpenFeign (Inter-Service Communication)
```

---

# 📚 Microservices

## 🔐 Authentication Service

Responsibilities

* User Registration
* User Login
* JWT Token Generation
* Role-Based Authorization
* API Security

---

## 🏥 Patient Service

Features

* Register Patients
* Update Patient Details
* Medical History Management
* Patient Search

---

## 🧑‍⚕️ Doctor Service

Features

* Doctor Profiles
* Department Management
* Availability Scheduling
* Doctor Information

---

## 📅 Appointment Service

Features

* Book Appointment
* Update Appointment
* Cancel Appointment
* Appointment History

---

## 💊 Prescription Service

Features

* Generate Digital Prescription
* Medicine Details
* Treatment Notes
* Prescription History

---

## 💳 Billing Service

Features

* Bill Generation
* Payment Status
* Invoice Management
* Payment History

---

# 🔒 Security

* JWT Authentication
* Role-Based Authorization
* Spring Security
* Protected REST APIs
* Secure API Gateway
* Token Validation Across Services

---

# 🌐 Spring Cloud Components

### API Gateway

* Centralized API routing
* Authentication filtering
* Request forwarding
* Cross-Origin (CORS) configuration

### Eureka Server

* Automatic service registration
* Service discovery
* Load balancing support

### OpenFeign

* Declarative REST client
* Service-to-service communication
* Reduced boilerplate code

---

# 🌐 REST APIs

The system exposes REST APIs for:

* Authentication
* Patient Management
* Doctor Management
* Appointment Scheduling
* Prescription Management
* Billing

Example Endpoints

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| POST   | `/auth/register` | Register User       |
| POST   | `/auth/login`    | User Login          |
| GET    | `/patients`      | Get Patients        |
| POST   | `/appointments`  | Book Appointment    |
| GET    | `/doctors`       | Get Doctors         |
| POST   | `/prescriptions` | Create Prescription |
| POST   | `/billing`       | Generate Bill       |

---

# 📈 Project Highlights

* ✅ Spring Boot Microservices Architecture
* ✅ Spring Cloud Gateway
* ✅ Netflix Eureka Service Discovery
* ✅ OpenFeign Communication
* ✅ JWT Authentication
* ✅ Role-Based Access Control
* ✅ REST API Development
* ✅ React Frontend Integration
* ✅ Modular & Scalable Design
* ✅ Cloud-Ready Architecture

---

# 📂 Project Structure

```text
hospital-management-microservices
│
├── api-gateway
├── eureka-server
├── auth-service
├── patient-service
├── doctor-service
├── appointment-service
├── prescription-service
├── billing-service
├── frontend
└── README.md
```

---

# ⚙️ Installation

## Prerequisites

* Java 17+
* Maven
* Node.js
* MySQL

### Clone Repository

```bash
git clone https://github.com/Faiz-Khan01/hospital-management-microservices.git
```

### Start Services

1. Start Eureka Server
2. Start API Gateway
3. Start all Microservices
4. Start the React Frontend

---

# 🔮 Future Enhancements

* Email & SMS Notifications
* Video Consultation
* Laboratory Management
* Pharmacy Management
* Medical Reports Upload
* Docker & Docker Compose
* Kubernetes Deployment
* CI/CD Pipeline
* Monitoring with Spring Boot Actuator & Prometheus/Grafana

---

# 👨‍💻 Author

**Faiz Khan**

Java Backend Developer | Spring Boot & Microservices Enthusiast

---

# 🤝 Contributing

Contributions, suggestions, and feedback are welcome.

If you found this project useful, consider giving it a ⭐ on GitHub.
