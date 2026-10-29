-- ============================================================
--  HospitalSync Pro Suite v2.5 — Master Database Schema
--  Complete 24-Table Design for Microservices Architecture
--  Generated: 2026-09-03
--  Database: MySQL 8.x
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ============================================================
-- 1. ROLES  (role-service — port 8088)
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE COMMENT 'e.g. ADMIN, DOCTOR, RECEPTIONIST, NURSE',
    description VARCHAR(255),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='RBAC role definitions';

INSERT IGNORE INTO roles (name, description) VALUES
    ('ADMIN',         'Full system access — executive & IT administration'),
    ('DOCTOR',        'Clinical operations — patient care & prescriptions'),
    ('RECEPTIONIST',  'Front-desk — appointments & patient registration'),
    ('NURSE',         'Ward & bed management, vitals recording'),
    ('LAB_TECH',      'Lab test order processing & report generation'),
    ('PHARMACIST',    'Medicine inventory & dispensing');

-- ============================================================
-- 2. USERS  (user-service — port 8087 | auth-service — port 8086)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id               BIGINT       AUTO_INCREMENT PRIMARY KEY,
    username         VARCHAR(80)  NOT NULL UNIQUE,
    name             VARCHAR(150),
    email            VARCHAR(150) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL COMMENT 'BCrypt hashed',
    first_name       VARCHAR(80),
    last_name        VARCHAR(80),
    phone            VARCHAR(20),
    role             VARCHAR(50)  NOT NULL DEFAULT 'RECEPTIONIST',
    status           ENUM('ACTIVE','INACTIVE','BLOCKED','PENDING_APPROVAL') NOT NULL DEFAULT 'ACTIVE',
    enabled          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by       VARCHAR(80),
    last_modified_by VARCHAR(80),
    INDEX idx_usr_username (username),
    INDEX idx_usr_email    (email),
    INDEX idx_usr_role     (role, status)
) ENGINE=InnoDB COMMENT='Authenticated platform users';

-- ============================================================
-- 3. DEPARTMENTS  (department-service — port 8089)
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE COMMENT 'e.g. Cardiology, Orthopedics',
    description VARCHAR(500),
    head_doctor_id BIGINT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Hospital clinical departments & specialties';

INSERT IGNORE INTO departments (name, description) VALUES
    ('Cardiology',     'Heart & cardiovascular disease management'),
    ('Orthopedics',    'Bone, joint & muscle treatment'),
    ('Neurology',      'Brain, spine & nervous system disorders'),
    ('Pediatrics',     'Child healthcare — birth to 18 years'),
    ('Oncology',       'Cancer diagnosis & treatment'),
    ('Emergency',      '24/7 critical care & trauma');

-- ============================================================
-- 4. DOCTORS  (doctor-service — port 8082)
-- ============================================================
CREATE TABLE IF NOT EXISTS doctors (
    id              BIGINT       AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    specialization  VARCHAR(100),
    qualification   VARCHAR(200),
    department_id   BIGINT,
    contact_number  VARCHAR(20),
    email           VARCHAR(150),
    user_id         BIGINT COMMENT 'FK to users.id for login account',
    experience_years INT DEFAULT 0,
    available       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_doc_dept      (department_id),
    INDEX idx_doc_spec      (specialization),
    CONSTRAINT fk_doctors_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Physician profiles & specializations';

-- ============================================================
-- 5. DOCTOR_SCHEDULES  (doctor-service — port 8082)
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id            BIGINT      AUTO_INCREMENT PRIMARY KEY,
    doctor_id     BIGINT      NOT NULL,
    day_of_week   ENUM('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') NOT NULL,
    start_time    TIME        NOT NULL COMMENT 'Shift start e.g. 09:00',
    end_time      TIME        NOT NULL COMMENT 'Shift end   e.g. 17:00',
    max_patients  INT         DEFAULT 20 COMMENT 'Max appointments per slot',
    is_active     BOOLEAN     DEFAULT TRUE,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sched_doc   (doctor_id),
    INDEX idx_sched_day   (day_of_week),
    CONSTRAINT fk_sched_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Weekly shift schedule for each doctor';

-- ============================================================
-- 6. PATIENTS  (patient-service — port 8081)
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
    id             BIGINT       AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    age            INT,
    date_of_birth  DATE,
    gender         ENUM('MALE','FEMALE','OTHER'),
    blood_group    VARCHAR(5),
    contact_number VARCHAR(20)  NOT NULL,
    email          VARCHAR(150),
    address        VARCHAR(500),
    disease        VARCHAR(255) COMMENT 'Primary presenting complaint',
    emergency_contact_name   VARCHAR(150),
    emergency_contact_phone  VARCHAR(20),
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pat_name    (name),
    INDEX idx_pat_contact (contact_number)
) ENGINE=InnoDB COMMENT='Patient demographic & contact records';

-- ============================================================
-- 7. APPOINTMENTS  (appointment-service — port 8083)
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
    id               BIGINT      AUTO_INCREMENT PRIMARY KEY,
    patient_id       BIGINT      NOT NULL,
    doctor_id        BIGINT      NOT NULL,
    department_id    BIGINT,
    appointment_date DATE        NOT NULL,
    appointment_time TIME,
    status           ENUM('SCHEDULED','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW') DEFAULT 'SCHEDULED',
    reason           VARCHAR(500),
    notes            VARCHAR(1000),
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_appt_patient   (patient_id),
    INDEX idx_appt_doctor    (doctor_id),
    INDEX idx_appt_date      (appointment_date),
    INDEX idx_appt_status    (status),
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_appt_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctors(id)  ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Doctor-patient consultation bookings';

-- ============================================================
-- 8. MEDICAL_RECORDS (EHR)  (medical-record-service — port 8090)
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_records (
    id              BIGINT       AUTO_INCREMENT PRIMARY KEY,
    patient_id      BIGINT       NOT NULL,
    doctor_id       BIGINT,
    appointment_id  BIGINT,
    visit_date      DATE,
    diagnosis       TEXT,
    symptoms        TEXT,
    treatment_notes TEXT,
    follow_up_date  DATE,
    vital_bp        VARCHAR(20)  COMMENT 'Blood pressure e.g. 120/80',
    vital_pulse     INT          COMMENT 'Heart rate bpm',
    vital_temp      DECIMAL(4,1) COMMENT 'Temperature °C',
    vital_spo2      INT          COMMENT 'SpO2 %',
    vital_weight    DECIMAL(5,1) COMMENT 'Weight kg',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ehr_patient (patient_id),
    INDEX idx_ehr_doctor  (doctor_id),
    CONSTRAINT fk_ehr_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Electronic Health Records — clinical visit history';

-- ============================================================
-- 9. MEDICINES  (medicine-service — port 8091)
-- ============================================================
CREATE TABLE IF NOT EXISTS medicines (
    id              BIGINT        AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200)  NOT NULL,
    generic_name    VARCHAR(200),
    manufacturer    VARCHAR(150),
    category        VARCHAR(100)  COMMENT 'e.g. Antibiotic, Analgesic, Antihypertensive',
    form            ENUM('TABLET','CAPSULE','SYRUP','INJECTION','OINTMENT','DROPS','INHALER') DEFAULT 'TABLET',
    strength        VARCHAR(50)   COMMENT 'e.g. 500mg, 10ml',
    price           DECIMAL(10,2),
    stock_quantity  INT           DEFAULT 0,
    expiry_date     DATE,
    requires_rx     BOOLEAN       DEFAULT FALSE COMMENT 'Prescription required?',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_med_name     (name),
    INDEX idx_med_category (category),
    INDEX idx_med_expiry   (expiry_date)
) ENGINE=InnoDB COMMENT='Pharmacy drug & medicine catalog';

-- ============================================================
-- 10. MEDICINE_INVENTORY  (medicine-service — port 8091)
-- ============================================================
CREATE TABLE IF NOT EXISTS medicine_inventory (
    id             BIGINT        AUTO_INCREMENT PRIMARY KEY,
    medicine_id    BIGINT        NOT NULL,
    batch_number   VARCHAR(100),
    quantity       INT           NOT NULL DEFAULT 0,
    unit_cost      DECIMAL(10,2),
    supplier_name  VARCHAR(150),
    received_date  DATE,
    expiry_date    DATE,
    location       VARCHAR(100)  COMMENT 'Shelf / rack / bin reference',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_inv_medicine (medicine_id),
    INDEX idx_inv_expiry   (expiry_date),
    INDEX idx_inv_batch    (batch_number),
    CONSTRAINT fk_inv_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Pharmacy stock batches & shelf management';

-- ============================================================
-- 11. PRESCRIPTIONS  (prescription-service — port 8085)
-- ============================================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id              BIGINT       AUTO_INCREMENT PRIMARY KEY,
    patient_id      BIGINT       NOT NULL,
    doctor_id       BIGINT,
    appointment_id  BIGINT,
    diagnosis_note  TEXT,
    instructions    TEXT,
    status          ENUM('ACTIVE','DISPENSED','EXPIRED','CANCELLED') DEFAULT 'ACTIVE',
    prescribed_date DATE,
    valid_until     DATE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rx_patient (patient_id),
    INDEX idx_rx_doctor  (doctor_id),
    CONSTRAINT fk_rx_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Doctor prescriptions header record';

-- ============================================================
-- 12. PRESCRIPTION_ITEMS  (prescription-service — port 8085)
-- ============================================================
CREATE TABLE IF NOT EXISTS prescription_items (
    id              BIGINT       AUTO_INCREMENT PRIMARY KEY,
    prescription_id BIGINT       NOT NULL,
    medicine_id     BIGINT,
    medicine_name   VARCHAR(200) COMMENT 'Denormalized for offline reference',
    dosage          VARCHAR(100) COMMENT 'e.g. 500mg',
    frequency       VARCHAR(100) COMMENT 'e.g. Twice daily after food',
    duration        VARCHAR(100) COMMENT 'e.g. 7 days',
    quantity        INT,
    notes           VARCHAR(500),
    CONSTRAINT fk_rxitem_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    INDEX idx_rxitem_rx (prescription_id)
) ENGINE=InnoDB COMMENT='Individual drug line items within a prescription';

-- ============================================================
-- 13. LAB_TESTS  (lab-test-service — port 8092)
-- ============================================================
CREATE TABLE IF NOT EXISTS lab_tests (
    id            BIGINT        AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(200)  NOT NULL,
    description   TEXT,
    category      VARCHAR(100)  COMMENT 'e.g. Hematology, Biochemistry, Microbiology, Imaging',
    price         DECIMAL(10,2),
    turnaround_hours INT        DEFAULT 24 COMMENT 'Expected result TAT in hours',
    requires_fasting BOOLEAN    DEFAULT FALSE,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_labtest_name     (name),
    INDEX idx_labtest_category (category)
) ENGINE=InnoDB COMMENT='Diagnostic test catalog with pricing';

-- ============================================================
-- 14. LAB_ORDERS  (lab-test-service — port 8092)
-- ============================================================
CREATE TABLE IF NOT EXISTS lab_orders (
    id           BIGINT  AUTO_INCREMENT PRIMARY KEY,
    patient_id   BIGINT  NOT NULL,
    doctor_id    BIGINT,
    lab_test_id  BIGINT  NOT NULL,
    ordered_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status       ENUM('ORDERED','SAMPLE_COLLECTED','PROCESSING','COMPLETED','CANCELLED') DEFAULT 'ORDERED',
    priority     ENUM('ROUTINE','URGENT','STAT') DEFAULT 'ROUTINE',
    notes        VARCHAR(500),
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_laborder_patient (patient_id),
    INDEX idx_laborder_test    (lab_test_id),
    INDEX idx_laborder_status  (status),
    CONSTRAINT fk_laborder_patient FOREIGN KEY (patient_id)  REFERENCES patients(id)  ON DELETE CASCADE,
    CONSTRAINT fk_laborder_test    FOREIGN KEY (lab_test_id) REFERENCES lab_tests(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Doctor-ordered diagnostic test requests';

-- ============================================================
-- 15. LAB_REPORTS  (lab-report-service — port 8093)
-- ============================================================
CREATE TABLE IF NOT EXISTS lab_reports (
    id             BIGINT       AUTO_INCREMENT PRIMARY KEY,
    patient_id     BIGINT       NOT NULL,
    lab_order_id   BIGINT,
    lab_test_id    BIGINT,
    test_name      VARCHAR(200) COMMENT 'Denormalized',
    result_value   TEXT         COMMENT 'Numeric or descriptive result',
    reference_range VARCHAR(200),
    unit           VARCHAR(50),
    status         ENUM('PENDING','PROCESSING','COMPLETED','AVAILABLE','ABNORMAL') DEFAULT 'PENDING',
    report_date    DATE,
    technician_id  BIGINT,
    remarks        TEXT,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_labr_patient (patient_id),
    INDEX idx_labr_status  (status),
    CONSTRAINT fk_labr_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Completed diagnostic test results & reports';

-- ============================================================
-- 16. WARDS  (ward-service — logical domain in patient-service)
-- ============================================================
CREATE TABLE IF NOT EXISTS wards (
    id           BIGINT       AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL UNIQUE COMMENT 'e.g. General Ward A, ICU, Maternity',
    ward_type    ENUM('GENERAL','ICU','NICU','MATERNITY','SURGICAL','PEDIATRIC','ISOLATION') DEFAULT 'GENERAL',
    department_id BIGINT,
    floor_number INT,
    total_beds   INT          DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ward_dept (department_id),
    CONSTRAINT fk_ward_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Hospital ward sections by specialty';

INSERT IGNORE INTO wards (name, ward_type, floor_number, total_beds) VALUES
    ('General Ward A',  'GENERAL',   1, 30),
    ('ICU',             'ICU',        2, 10),
    ('NICU',            'NICU',       2,  8),
    ('Maternity Ward',  'MATERNITY',  1, 20),
    ('Surgical Ward',   'SURGICAL',   3, 15),
    ('Isolation Ward',  'ISOLATION',  4, 10);

-- ============================================================
-- 17. BEDS  (patient-service — port 8081)
-- ============================================================
CREATE TABLE IF NOT EXISTS beds (
    id          BIGINT      AUTO_INCREMENT PRIMARY KEY,
    ward_id     BIGINT      NOT NULL,
    bed_number  VARCHAR(20) NOT NULL,
    bed_type    ENUM('STANDARD','DELUXE','ICU','SEMI_PRIVATE','PRIVATE') DEFAULT 'STANDARD',
    status      ENUM('AVAILABLE','OCCUPIED','RESERVED','MAINTENANCE') DEFAULT 'AVAILABLE',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bed_ward   (ward_id),
    INDEX idx_bed_status (status),
    UNIQUE KEY uq_bed_ward_num (ward_id, bed_number),
    CONSTRAINT fk_bed_ward FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Individual bed records within wards';

-- ============================================================
-- 18. ADMISSIONS  (patient-service — port 8081)
-- ============================================================
CREATE TABLE IF NOT EXISTS admissions (
    id              BIGINT  AUTO_INCREMENT PRIMARY KEY,
    patient_id      BIGINT  NOT NULL,
    doctor_id       BIGINT,
    ward_id         BIGINT,
    bed_id          BIGINT,
    admission_date  DATETIME DEFAULT CURRENT_TIMESTAMP,
    reason          TEXT,
    diagnosis       TEXT,
    status          ENUM('ADMITTED','DISCHARGED','TRANSFERRED') DEFAULT 'ADMITTED',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_adm_patient (patient_id),
    INDEX idx_adm_status  (status),
    INDEX idx_adm_bed     (bed_id),
    CONSTRAINT fk_adm_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_adm_bed     FOREIGN KEY (bed_id)     REFERENCES beds(id)     ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Inpatient admission records';

-- ============================================================
-- 19. DISCHARGES  (patient-service — port 8081)
-- ============================================================
CREATE TABLE IF NOT EXISTS discharges (
    id               BIGINT  AUTO_INCREMENT PRIMARY KEY,
    admission_id     BIGINT  NOT NULL UNIQUE,
    patient_id       BIGINT  NOT NULL,
    doctor_id        BIGINT,
    discharge_date   DATETIME,
    discharge_type   ENUM('RECOVERED','TRANSFERRED','AMA','EXPIRED','DISCHARGE_ON_REQUEST') DEFAULT 'RECOVERED',
    discharge_notes  TEXT,
    follow_up_date   DATE,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dis_patient   (patient_id),
    INDEX idx_dis_admission (admission_id),
    CONSTRAINT fk_dis_admission FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_dis_patient   FOREIGN KEY (patient_id)   REFERENCES patients(id)   ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Inpatient discharge summary records';

-- ============================================================
-- 20. BILLS  (billing-service — port 8084)
-- ============================================================
CREATE TABLE IF NOT EXISTS bills (
    id              BIGINT        AUTO_INCREMENT PRIMARY KEY,
    patient_id      BIGINT        NOT NULL,
    admission_id    BIGINT,
    appointment_id  BIGINT,
    bill_date       DATE          DEFAULT (CURDATE()),
    due_date        DATE,
    subtotal        DECIMAL(12,2) DEFAULT 0.00,
    tax_amount      DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    paid_amount     DECIMAL(12,2) DEFAULT 0.00,
    status          ENUM('DRAFT','PENDING','PARTIALLY_PAID','PAID','OVERDUE','CANCELLED') DEFAULT 'PENDING',
    notes           TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bill_patient (patient_id),
    INDEX idx_bill_status  (status),
    INDEX idx_bill_date    (bill_date),
    CONSTRAINT fk_bill_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Patient invoice header records';

-- ============================================================
-- 21. BILL_ITEMS  (billing-service — port 8084)
-- ============================================================
CREATE TABLE IF NOT EXISTS bill_items (
    id           BIGINT        AUTO_INCREMENT PRIMARY KEY,
    bill_id      BIGINT        NOT NULL,
    item_type    ENUM('CONSULTATION','MEDICINE','LAB_TEST','PROCEDURE','ROOM_CHARGE','NURSING','OTHER') NOT NULL,
    description  VARCHAR(500),
    quantity     INT           DEFAULT 1,
    unit_price   DECIMAL(10,2) NOT NULL,
    total_price  DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    ref_id       BIGINT        COMMENT 'Reference to medicine_id / lab_test_id etc.',
    INDEX idx_billitem_bill (bill_id),
    CONSTRAINT fk_billitem_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Line items on patient invoice';

-- ============================================================
-- 22. PAYMENTS  (payment-service — port 8094)
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id              BIGINT        AUTO_INCREMENT PRIMARY KEY,
    patient_id      BIGINT        NOT NULL,
    billing_id      BIGINT,
    amount          DECIMAL(12,2),
    payment_method  ENUM('CASH','CARD','UPI','NET_BANKING','INSURANCE','CHEQUE') DEFAULT 'CASH',
    transaction_id  VARCHAR(200)  UNIQUE,
    status          ENUM('PENDING','COMPLETED','FAILED','REFUNDED') DEFAULT 'PENDING',
    payment_date    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    gateway_ref     VARCHAR(200)  COMMENT 'Payment gateway reference code',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pay_patient   (patient_id),
    INDEX idx_pay_billing   (billing_id),
    INDEX idx_pay_status    (status),
    INDEX idx_pay_txn       (transaction_id),
    CONSTRAINT fk_pay_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Payment transactions & receipts';

-- ============================================================
-- 23. INSURANCE  (billing-service — port 8084)
-- ============================================================
CREATE TABLE IF NOT EXISTS insurance (
    id               BIGINT       AUTO_INCREMENT PRIMARY KEY,
    patient_id       BIGINT       NOT NULL,
    provider_name    VARCHAR(200) NOT NULL,
    policy_number    VARCHAR(100) NOT NULL,
    group_number     VARCHAR(100),
    coverage_amount  DECIMAL(12,2),
    valid_from       DATE,
    valid_to         DATE,
    status           ENUM('ACTIVE','EXPIRED','SUSPENDED','CLAIMED') DEFAULT 'ACTIVE',
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ins_patient (patient_id),
    INDEX idx_ins_policy  (policy_number),
    CONSTRAINT fk_ins_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Patient insurance policies & claims tracking';

-- ============================================================
-- 24. NOTIFICATIONS  (notification-service — port 8095)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id               BIGINT       AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT,
    recipient_email  VARCHAR(150),
    recipient_phone  VARCHAR(20),
    type             VARCHAR(50)  NOT NULL COMMENT 'APPOINTMENT_CONFIRMATION, PAYMENT_CONFIRMATION, LAB_REPORT_AVAILABLE etc.',
    channel          VARCHAR(20)  NOT NULL DEFAULT 'IN_APP' COMMENT 'IN_APP, EMAIL, SMS',
    title            VARCHAR(255) NOT NULL,
    message          TEXT         NOT NULL,
    metadata         TEXT         COMMENT 'JSON extra payload',
    status           VARCHAR(20)  DEFAULT 'PENDING',
    is_read          BOOLEAN      DEFAULT FALSE,
    sent_at          DATETIME,
    read_at          DATETIME,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_notif_user_id   (user_id),
    INDEX idx_notif_type      (type),
    INDEX idx_notif_user_read (user_id, is_read),
    INDEX idx_notif_status    (status)
) ENGINE=InnoDB COMMENT='In-app, email & SMS notification log';

-- ============================================================
-- 25. AUDIT_LOGS  (user-service — cross-cutting concern)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGINT       AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT,
    username     VARCHAR(80),
    action       VARCHAR(100) NOT NULL COMMENT 'e.g. LOGIN, CREATE_PATIENT, UPDATE_APPOINTMENT',
    entity_type  VARCHAR(100) COMMENT 'e.g. Patient, Appointment, Bill',
    entity_id    BIGINT,
    old_value    TEXT         COMMENT 'JSON snapshot before change',
    new_value    TEXT         COMMENT 'JSON snapshot after change',
    ip_address   VARCHAR(50),
    user_agent   VARCHAR(500),
    status       ENUM('SUCCESS','FAILURE') DEFAULT 'SUCCESS',
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user    (user_id),
    INDEX idx_audit_action  (action),
    INDEX idx_audit_entity  (entity_type, entity_id),
    INDEX idx_audit_date    (created_at)
) ENGINE=InnoDB COMMENT='HIPAA-compliant full audit trail of all system actions';

-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
-- End of HospitalSync Master Schema
-- ============================================================
