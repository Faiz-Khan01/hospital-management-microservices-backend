-- ============================================================
-- HospitalSync Super Speciality Hospital — 1-Click Init & Seed DB
-- Microservices Database Initialization Script for Docker Compose
-- ============================================================

CREATE DATABASE IF NOT EXISTS hospital_auth_db;
CREATE DATABASE IF NOT EXISTS patient_db;
CREATE DATABASE IF NOT EXISTS doctor_db;
CREATE DATABASE IF NOT EXISTS appointment_db;
CREATE DATABASE IF NOT EXISTS billing_db;
CREATE DATABASE IF NOT EXISTS prescription_db;
CREATE DATABASE IF NOT EXISTS user_db;
CREATE DATABASE IF NOT EXISTS role_db;
CREATE DATABASE IF NOT EXISTS department_db;
CREATE DATABASE IF NOT EXISTS medical_record_db;
CREATE DATABASE IF NOT EXISTS medicine_db;
CREATE DATABASE IF NOT EXISTS lab_test_db;
CREATE DATABASE IF NOT EXISTS lab_report_db;
CREATE DATABASE IF NOT EXISTS payment_db;
CREATE DATABASE IF NOT EXISTS notification_db;
CREATE DATABASE IF NOT EXISTS admission_db;

GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
FLUSH PRIVILEGES;

-- ------------------------------------------------------------
-- 1. SEED: DOCTOR_DB
-- ------------------------------------------------------------
USE doctor_db;

CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255),
    contact_number VARCHAR(50),
    email VARCHAR(255),
    experience INT DEFAULT 0
) ENGINE=InnoDB;

INSERT IGNORE INTO doctors (id, name, specialization, contact_number, email, experience) VALUES
(1, 'Dr. Sarah Jenkins', 'Cardiology', '+91 98101 23456', 'sarah.jenkins@hospitalsync.org', 14),
(2, 'Dr. Vikram Patel', 'Orthopedics & Joint Replacement', '+91 98102 34567', 'vikram.patel@hospitalsync.org', 12),
(3, 'Dr. Priya Nair', 'Neurology & Stroke Care', '+91 98103 45678', 'priya.nair@hospitalsync.org', 10),
(4, 'Dr. Amit Sharma', 'General Medicine & Diabetology', '+91 98104 56789', 'amit.sharma@hospitalsync.org', 13),
(5, 'Dr. Rajesh Verma', 'Pediatrics & Neonatology', '+91 98105 67890', 'rajesh.verma@hospitalsync.org', 9),
(6, 'Dr. Ananya Sen', 'Emergency Medicine & Critical Care', '+91 98106 78901', 'ananya.sen@hospitalsync.org', 11);

-- ------------------------------------------------------------
-- 2. SEED: ADMISSION_DB (Wards & Beds)
-- ------------------------------------------------------------
USE admission_db;

CREATE TABLE IF NOT EXISTS wards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    ward_type VARCHAR(100),
    department_id BIGINT,
    floor_number INT,
    total_beds INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS beds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ward_id BIGINT NOT NULL,
    bed_number VARCHAR(50) NOT NULL,
    bed_type VARCHAR(50) DEFAULT 'STANDARD',
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_bed_ward_num UNIQUE (ward_id, bed_number)
) ENGINE=InnoDB;

INSERT IGNORE INTO wards (id, name, ward_type, floor_number, total_beds) VALUES
(1, 'Emergency Trauma Ward', 'ICU', 1, 6),
(2, 'Intensive Care Unit (ICU)', 'ICU', 2, 6),
(3, 'General Medicine Ward A', 'GENERAL', 3, 6),
(4, 'Surgical Inpatient Wing', 'SURGICAL', 3, 6);

INSERT IGNORE INTO beds (id, ward_id, bed_number, bed_type, status) VALUES
(1, 1, 'EM-01', 'ICU', 'AVAILABLE'),
(2, 1, 'EM-02', 'ICU', 'AVAILABLE'),
(3, 1, 'EM-03', 'ICU', 'AVAILABLE'),
(4, 1, 'EM-04', 'ICU', 'AVAILABLE'),
(5, 1, 'EM-05', 'ICU', 'AVAILABLE'),
(6, 1, 'EM-06', 'ICU', 'AVAILABLE'),
(7, 2, 'ICU-01', 'ICU', 'AVAILABLE'),
(8, 2, 'ICU-02', 'ICU', 'AVAILABLE'),
(9, 2, 'ICU-03', 'ICU', 'AVAILABLE'),
(10, 2, 'ICU-04', 'ICU', 'AVAILABLE'),
(11, 2, 'ICU-05', 'ICU', 'AVAILABLE'),
(12, 2, 'ICU-06', 'ICU', 'AVAILABLE'),
(13, 3, 'GW-101', 'STANDARD', 'AVAILABLE'),
(14, 3, 'GW-102', 'STANDARD', 'AVAILABLE'),
(15, 3, 'GW-103', 'STANDARD', 'AVAILABLE'),
(16, 3, 'GW-104', 'STANDARD', 'AVAILABLE'),
(17, 3, 'GW-105', 'STANDARD', 'AVAILABLE'),
(18, 3, 'GW-106', 'STANDARD', 'AVAILABLE'),
(19, 4, 'SW-201', 'STANDARD', 'AVAILABLE'),
(20, 4, 'SW-202', 'STANDARD', 'AVAILABLE'),
(21, 4, 'SW-203', 'STANDARD', 'AVAILABLE'),
(22, 4, 'SW-204', 'STANDARD', 'AVAILABLE');

-- ------------------------------------------------------------
-- 3. SEED: MEDICINE_DB
-- ------------------------------------------------------------
USE medicine_db;

CREATE TABLE IF NOT EXISTS medicines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    category VARCHAR(255),
    price DECIMAL(10, 2),
    stock_quantity INT DEFAULT 0,
    expiry_date DATE
) ENGINE=InnoDB;

INSERT IGNORE INTO medicines (id, name, manufacturer, category, price, stock_quantity, expiry_date) VALUES
(1, 'Paracetamol 650mg', 'Cipla Health', 'Analgesic / Antipyretic', 30.00, 500, '2028-12-31'),
(2, 'Augmentin 625 Duo (Amoxicillin + Clavulanate)', 'GSK Pharma', 'Antibiotic', 195.00, 250, '2028-06-30'),
(3, 'Pantocid 40mg (Pantoprazole)', 'Sun Pharma', 'Gastrointestinal', 95.00, 400, '2028-10-31'),
(4, 'Atorva 20mg (Atorvastatin)', 'Zydus Cadila', 'Cardiovascular / Statin', 145.00, 300, '2028-11-30'),
(5, 'Glycomet GP2 (Metformin + Glimepiride)', 'USV Limited', 'Antidiabetic', 110.00, 350, '2028-09-30'),
(6, 'Normal Saline 0.9% IV 500ml', 'Fresenius Kabi', 'Critical Care / IV Fluid', 45.00, 200, '2029-01-31'),
(7, 'Ringer Lactate IV Infusion 500ml', 'Baxter India', 'Critical Care / Resuscitation', 55.00, 150, '2029-01-31'),
(8, 'Azithral 500mg (Azithromycin)', 'Alembic Pharma', 'Antibiotic', 125.00, 180, '2028-08-31'),
(9, 'Ecosprin 75mg (Aspirin Enteric Coated)', 'USV Limited', 'Antiplatelet', 15.00, 600, '2029-03-31');

-- ------------------------------------------------------------
-- 4. SEED: LAB_TEST_DB
-- ------------------------------------------------------------
USE lab_test_db;

CREATE TABLE IF NOT EXISTS lab_tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_name VARCHAR(255) NOT NULL UNIQUE,
    test_code VARCHAR(100),
    description VARCHAR(500),
    price DECIMAL(10, 2),
    normal_range VARCHAR(255)
) ENGINE=InnoDB;

INSERT IGNORE INTO lab_tests (id, test_name, test_code, description, price, normal_range) VALUES
(1, 'Complete Blood Count (CBC) with ESR', 'HEM-01', 'Automated 5-Part Differential Analyzer (RBC, WBC, Platelets, Hb)', 350.00, 'Hb: 12-16 g/dL, Platelets: 1.5-4.5 Lakhs'),
(2, 'Comprehensive Lipid Profile', 'BIO-02', 'Total Cholesterol, Triglycerides, HDL, LDL, VLDL Chol/HDL Ratio', 750.00, 'Cholesterol < 200 mg/dL, Triglycerides < 150 mg/dL'),
(3, 'High Sensitivity Cardiac Troponin-I (hs-cTnI)', 'CRD-03', 'Quantitative Rapid Myocardial Infarction Marker', 1200.00, '< 0.04 ng/mL'),
(4, 'Liver Function Test (LFT Profile)', 'BIO-04', 'Bilirubin, SGOT/AST, SGPT/ALT, Alkaline Phosphatase, Total Protein', 650.00, 'SGOT: 10-40 U/L, SGPT: 7-56 U/L'),
(5, 'Kidney / Renal Function Test (KFT Profile)', 'BIO-05', 'Serum Creatinine, Blood Urea Nitrogen, Uric Acid, Electrolytes', 600.00, 'Creatinine: 0.7-1.3 mg/dL, BUN: 7-20 mg/dL'),
(6, 'HbA1c Glycated Hemoglobin', 'DIA-06', 'High Performance Liquid Chromatography (HPLC) 3-Month Glucose', 450.00, 'Non-Diabetic: < 5.7%, Good Control: < 7.0%'),
(7, 'Digital Chest Radiography (X-Ray PA View)', 'RAD-07', 'High Resolution Flat Panel Digital Chest PA View', 500.00, 'Normal lung parenchyma and cardiothoracic silhouette');

-- ------------------------------------------------------------
-- 5. SEED: PATIENT_DB
-- ------------------------------------------------------------
USE patient_db;

CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_user_id BIGINT,
    name VARCHAR(255) NOT NULL,
    age INT,
    date_of_birth DATE,
    gender VARCHAR(50),
    blood_group VARCHAR(10),
    contact_number VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address VARCHAR(500),
    disease VARCHAR(255),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO patients (id, name, age, date_of_birth, gender, blood_group, contact_number, email, address, disease) VALUES
(1, 101, 'Rahul Sharma', 42, '1984-05-14', 'Male', 'O+', '+91 98765 43210', 'rahul.sharma@example.com', 'Flat 402, Lotus Apartments, Sector 18, New Delhi', 'Hypertension & CAD Evaluation'),
(2, 102, 'Anita Verma', 36, '1990-08-22', 'Female', 'B+', '+91 98765 43211', 'anita.verma@example.com', 'Tower B, Galaxy Enclave, Gurgaon', 'Type 2 Diabetes Mellitus'),
(3, 103, 'Vikram Malhotra', 58, '1968-11-03', 'Male', 'A+', '+91 98765 43212', 'vikram.m@example.com', 'Pocket C, Mayur Vihar Phase 1, Delhi', 'Osteoarthritis Right Knee');
