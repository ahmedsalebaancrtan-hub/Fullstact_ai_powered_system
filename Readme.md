# 🧠 Instant Student Quiz Generator (Academic AI)

An advanced, AI-powered educational assessment platform designed to help students evaluate their learning retention instantly. By analyzing uploaded PDFs or text documents, the system leverages state-of-the-art Large Language Models (LLMs) to automatically generate high-quality, multi-format quizzes. Built with an elegant **Aura Glass** theme, micro-interactions, and high-performance engineering.

---



## Overview
QuizGen AI is a modern, high-performance Learning Management System (LMS) designed for educational institutions. It leverages AI to streamline quiz generation, material management, and role-based administration.

## System Architecture
This platform utilizes a robust full-stack architecture:
* **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion (Modern "Aura Glass" UI).
* **Backend:** Go (Golang) with Gin Framework.
* **Database:** PostgreSQL with GORM ORM.
* **Authentication:** JWT-based secure role-based access control (RBAC).

## Features
* **Role-Based Access Control (RBAC):** Strict separation of duties between Admins, Teachers, and Students.
* **Intelligent Admin Portal:** A central "Command Center" for platform monitoring, teacher management, and audit streaming.
* **Teacher Tools:** Efficient material uploading, quiz generation, and analytics tracking.
* **Student Experience:** Intuitive dashboard for viewing available assessments and tracking results.
* **Security:** Middleware-enforced route protection and database-level query scoping.

---
### 1. Welcome & Entry Point (`/`)
The **Get Started** page welcomes users with fluid animations, introducing the 3 core pillars of the system (Upload, Generate, Analyze) before offering a high-contrast transition button

<p align="center">
  <img src="./Frontend/assets/Getstarted.png" alt="Get Started Page" width="90%" />
</p>


2. Authentication Portal (`/login`)
A highly translucent glassmorphism login panel featuring high-contrast text fields, secure authentication, and optimized micro-interactions

<p align="center">
  <img src="./Frontend/assets/login.png" alt="Login Portal" width="90%" />
</p>

## Dashboard Previews

### 1. Admin Dashboard (Command Center)
*The central hub for superuser monitoring, educator management, and system audits.*
<p align="center">
  <img src="./Frontend/assets/admindashboard.png" alt="System Dashboard" width="90%" />
</p>

### 2. Teacher Dashboard
*Manage learning materials, generate AI-powered quizzes, and analyze student performance.*
<p align="center">
  <img src="./Frontend/assets/teacherdashboard.png" alt="System Dashboard" width="90%" />
</p>

### 3. Student Dashboard
*A personalized view of available assessments and academic progress.*
<p align="center">
  <img src="./Frontend/assets/studentdash.png" alt="System Dashboard" width="90%" />
</p>

---

## Technical Highlights

### Role-Based Security (Backend Bypass)
To ensure the Admin has full visibility while maintaining student privacy, we implemented a custom GORM Scope:
```go
// Example of Admin Bypass Logic
db.Scopes(middleware.GORMAdminBypass(c, "created_by_id", userID)).Find(&records)