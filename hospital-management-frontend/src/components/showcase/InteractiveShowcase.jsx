import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { springSmooth, springSnappy, cardHover, buttonPress, fadeUp, staggerContainer, staggerItem } from '../../animations/motionConfig';

gsap.registerPlugin(ScrollTrigger);

// =========================================================================
// 3D Canvas Component: Interactive Microservices & Medical Neural Mesh
// =========================================================================
function ThreeHeroCanvas({ darkMode }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 22;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Central Icosahedron Wireframe Core (Microservices Backbone)
    const coreGeo = new THREE.IcosahedronGeometry(7, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: darkMode ? 0x38bdf8 : 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // 3. Inner Orbiting Medical Helix Nodes
    const particleCount = 180;
    const posArray = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(darkMode ? 0x38bdf8 : 0x0ea5e9); // Electric Blue
    const c2 = new THREE.Color(0xa855f7); // Lavender/Purple
    const c3 = new THREE.Color(0x10b981); // Emerald Health

    for (let i = 0; i < particleCount; i++) {
      const theta = (i / particleCount) * Math.PI * 8;
      const radius = 5.5 + Math.sin(theta * 3) * 1.5;
      const y = ((i / particleCount) - 0.5) * 16;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;

      const mixed = (i % 3 === 0) ? c1 : (i % 3 === 1 ? c2 : c3);
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.42,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // 4. Floating Microservice Orbiting Spheres (Spring Gateway, Eureka, Redis, DB)
    const microserviceNodes = [
      { name: 'Gateway', color: 0x3b82f6, radius: 9, speed: 0.015, phase: 0 },
      { name: 'Eureka', color: 0x10b981, radius: 9.5, speed: -0.012, phase: 1.5 },
      { name: 'Redis Cache', color: 0xef4444, radius: 10, speed: 0.018, phase: 3.0 },
      { name: 'Kafka Bus', color: 0xa855f7, radius: 10.5, speed: -0.014, phase: 4.5 },
      { name: 'EMR DB', color: 0x06b6d4, radius: 8.5, speed: 0.02, phase: 2.2 },
    ];

    const nodeMeshes = microserviceNodes.map(node => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 16),
        new THREE.MeshBasicMaterial({ color: node.color })
      );
      scene.add(mesh);
      return { ...node, mesh };
    });

    // 5. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 6. Animation Loop
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate core & particles
      coreMesh.rotation.y = elapsedTime * 0.25;
      coreMesh.rotation.x = elapsedTime * 0.15;
      particles.rotation.y = -elapsedTime * 0.35;

      // Animate orbiting nodes
      nodeMeshes.forEach(item => {
        const angle = elapsedTime * item.speed * 20 + item.phase;
        item.mesh.position.x = Math.cos(angle) * item.radius;
        item.mesh.position.z = Math.sin(angle) * item.radius;
        item.mesh.position.y = Math.sin(angle * 2) * 2.5;
      });

      // Smooth camera tilt towards mouse
      camera.position.x += (mouseX * 4 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 4 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // 7. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
    };
  }, [darkMode]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '460px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab'
      }}
    />
  );
}

// =========================================================================
// Main Interactive Architecture Showcase View
// =========================================================================
export default function InteractiveShowcase({ onLaunchApp, darkMode }) {
  const [activeTab, setActiveTab] = useState('topology');
  const showcaseScrollRef = useRef(null);

  // Initialize smooth scrolling with Lenis strictly within the showcase container
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const microservices = [
    {
      id: 'gateway',
      name: 'Spring Cloud Gateway',
      port: ':8080',
      badge: 'Edge Layer',
      badgeColor: 'primary',
      desc: 'Central SSL/TLS reverse proxy with non-blocking Netty reactive routing, rate-limiting, and JWT validation.',
      metrics: 'Sub-12ms Routing',
      tech: 'Spring Cloud Gateway, Netty'
    },
    {
      id: 'eureka',
      name: 'Netflix Eureka Registry',
      port: ':8761',
      badge: 'Service Discovery',
      badgeColor: 'success',
      desc: 'High-availability service registry providing peer-aware heartbeats, health telemetry, and client-side load balancing.',
      metrics: 'Peer Heartbeat (30s)',
      tech: 'Spring Eureka Server'
    },
    {
      id: 'auth',
      name: 'Auth & RBAC Identity Service',
      port: ':8081',
      badge: 'Security',
      badgeColor: 'danger',
      desc: 'Stateless HMAC-SHA256 JWT token dispenser supporting 8 granular healthcare roles: ADMIN, DOCTOR, NURSE, PHARMACIST, LAB_TECH, RECEPTIONIST, ACCOUNTANT, PATIENT.',
      metrics: '100% Stateless Tokens',
      tech: 'Spring Security 6, JWT'
    },
    {
      id: 'patient-emr',
      name: 'Patient EHR & Master Patient Index',
      port: ':8082',
      badge: 'Clinical Core',
      badgeColor: 'info',
      desc: 'Federated longitudinal Electronic Health Record (EHR) covering clinical encounters, allergies, ICD-10 codes, and vitals.',
      metrics: 'HIPAA & ABDM Compliant',
      tech: 'Spring Data JPA, Hibernate'
    },
    {
      id: 'doctor-schedule',
      name: 'Doctor & Department Roster',
      port: ':8083',
      badge: 'Scheduling',
      badgeColor: 'warning',
      desc: 'Shift allocation, OPD consultation schedules, surgeon theatre calendars, and specialization routing.',
      metrics: 'Zero Double-Booking',
      tech: 'Spring Boot 3.4'
    },
    {
      id: 'telemetry-icu',
      name: 'ICU Telemetry & Bed Management',
      port: ':8084',
      badge: 'Critical Care',
      badgeColor: 'danger',
      desc: 'Real-time multi-bed allocation across General, Semi-Private, ICU, and Daycare Chemo bays with live oxygen/ventilator telemetry.',
      metrics: '<200ms Vitals Sync',
      tech: 'WebSocket & Redis Stream'
    },
    {
      id: 'chemo-oncology',
      name: 'Chemotherapy Dosimetry Desk',
      port: ':8085',
      badge: 'Oncology Unit',
      badgeColor: 'primary',
      desc: 'Mosteller Body Surface Area (BSA) algorithmic dosing, ASCO/ONS safety checklists, and extravasation risk alerts.',
      metrics: 'Automated m² Dosimetry',
      tech: 'Oncology Protocol Engine'
    },
    {
      id: 'billing-ledger',
      name: 'Revenue & Smart Ledger Hub',
      port: ':8086',
      badge: 'Financial Desk',
      badgeColor: 'success',
      desc: 'Consolidated OPD/IPD invoicing, TPA insurance claim reconciliation, Razorpay/Stripe checkout, and real-time ledger accounting.',
      metrics: 'Audited Financial Ledger',
      tech: 'Double-Entry Accounting'
    },
    {
      id: 'infrastructure',
      name: 'Distributed Data Backbone',
      port: 'Cluster',
      badge: 'Persistence',
      badgeColor: 'secondary',
      desc: 'MySQL 8.0 ACID relational stores paired with Redis 7 in-memory cache and Dockerized microservices orchestration.',
      metrics: 'Zero Data Loss',
      tech: 'MySQL 8, Redis 7, Docker'
    }
  ];

  const patientFlow = [
    { step: '01', title: 'Digital Patient Registration', icon: 'bi-person-badge', desc: 'Demographics captured with auto-generated MRN and ABDM ABHA ID.' },
    { step: '02', title: 'Triage & Bed Allocation', icon: 'bi-hospital', desc: 'Nurse vitals evaluation and automated bed reservation across ICU, Wards, or Chemo.' },
    { step: '03', title: 'Doctor Consultation & EHR', icon: 'bi-clipboard2-pulse', desc: 'Longitudinal clinical history review, digital e-prescription with drug-drug interaction warning.' },
    { step: '04', title: 'Diagnostic Lab & Imaging', icon: 'bi-virus', desc: 'LIS barcode dispatch, PACS DICOM review, and pathologist electronic sign-off.' },
    { step: '05', title: 'Pharmacy Dispensing', icon: 'bi-capsule', desc: 'Batch verification, expiry alerts, inventory deduction, and dosage labels.' },
    { step: '06', title: 'Smart Ledger & Discharge', icon: 'bi-receipt-cutoff', desc: 'Instant itemized invoice generation, TPA claim approval, and print-ready clearance slip.' }
  ];

  return (
    <div
      ref={showcaseScrollRef}
      className="container-fluid px-3 px-md-5 py-4"
      style={{
        minHeight: '100vh',
        color: darkMode ? '#f8fafc' : '#1e293b'
      }}
    >
      {/* ── Top Navigation Bar for Showcase ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="d-flex flex-wrap align-items-center justify-content-between p-3 mb-4 rounded-4"
        style={{
          background: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(16px)',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 text-white fw-bold shadow-sm"
            style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}
          >
            <i className="bi bi-hospital fs-5" />
          </div>
          <div>
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
              HospitalSync Pro Suite
              <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 fs-8 fw-semibold">
                v3.0 Architecture
              </span>
            </h5>
            <small className="text-muted">Enterprise Healthcare Operating Platform & Microservices Topology</small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
          <motion.button
            variants={buttonPress}
            whileHover="hover"
            whileTap="tap"
            onClick={onLaunchApp}
            className="btn btn-primary px-4 py-2 rounded-3 fw-semibold shadow-sm d-flex align-items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', border: 'none' }}
          >
            <i className="bi bi-speedometer2" />
            Launch Live Platform
          </motion.button>
        </div>
      </motion.div>

      {/* ── Hero Section with 3D Canvas ── */}
      <div className="row g-4 align-items-center my-2 my-lg-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="col-12 col-lg-6"
        >
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 rounded-pill"
            style={{
              background: darkMode ? 'rgba(56, 189, 248, 0.12)' : 'rgba(14, 165, 233, 0.12)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              color: '#0284c7'
            }}
          >
            <span className="spinner-grow spinner-grow-sm text-primary" role="status" />
            <span className="fw-semibold small">Spring Boot 3.4 • React 19 • Motion Engine</span>
          </div>

          <h1 className="display-5 fw-extrabold mb-3 tracking-tight" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Distributed Clinical Intelligence <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Engineered For Zero Latency.
            </span>
          </h1>

          <p className="lead mb-4" style={{ color: darkMode ? '#cbd5e1' : '#475569', fontSize: '1.05rem', lineHeight: 1.6 }}>
            HospitalSync Pro powers 18 mission-critical healthcare microservices—from real-time ICU telemetry and Mosteller chemotherapy dosimetry to longitudinal EMRs and automated smart billing—built on Spring Cloud Gateway, Redis 7, and Motion for React.
          </p>

          <div className="d-flex flex-wrap gap-3 mb-4">
            <motion.button
              variants={buttonPress}
              whileHover="hover"
              whileTap="tap"
              onClick={onLaunchApp}
              className="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow d-flex align-items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)', border: 'none' }}
            >
              <i className="bi bi-box-arrow-in-right fs-5" />
              Enter Clinical Desks
            </motion.button>

            <a
              href="#topology-section"
              className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2"
              style={{
                borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                color: darkMode ? '#e2e8f0' : '#334155'
              }}
            >
              <i className="bi bi-diagram-3-fill text-primary" />
              Explore Topology
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="row g-2 pt-2">
            {[
              { val: '18', label: 'Microservices', icon: 'bi-cpu' },
              { val: '25+', label: 'Database Entities', icon: 'bi-database' },
              { val: '<15ms', label: 'Gateway Latency', icon: 'bi-lightning-charge' },
              { val: '100%', label: 'RBAC Enforced', icon: 'bi-shield-check' }
            ].map((m, idx) => (
              <div key={idx} className="col-6 col-sm-3">
                <div
                  className="p-2 rounded-3 text-center"
                  style={{
                    background: darkMode ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.65)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <div className="fw-bold fs-5 text-primary">{m.val}</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>{m.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 3D Interactive Canvas Column */}
        <div className="col-12 col-lg-6">
          <div
            className="rounded-4 p-3 position-relative overflow-hidden"
            style={{
              background: darkMode ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(16px)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 20px 40px -10px rgba(14, 165, 233, 0.12)'
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2 px-2">
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">
                <i className="bi bi-badge-3d me-1" /> Interactive WebGL Canvas
              </span>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-arrows-move me-1" /> Drag & Rotate Mesh
              </small>
            </div>

            <ThreeHeroCanvas darkMode={darkMode} />

            <div className="d-flex flex-wrap justify-content-center gap-3 mt-2 small text-muted" style={{ fontSize: '0.78rem' }}>
              <span className="d-flex align-items-center gap-1">
                <span className="rounded-circle" style={{ width: '8px', height: '8px', background: '#3b82f6' }} /> Gateway Node
              </span>
              <span className="d-flex align-items-center gap-1">
                <span className="rounded-circle" style={{ width: '8px', height: '8px', background: '#10b981' }} /> Eureka Registry
              </span>
              <span className="d-flex align-items-center gap-1">
                <span className="rounded-circle" style={{ width: '8px', height: '8px', background: '#ef4444' }} /> Redis Cache
              </span>
              <span className="d-flex align-items-center gap-1">
                <span className="rounded-circle" style={{ width: '8px', height: '8px', background: '#a855f7' }} /> Kafka Event Bus
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Microservices Architecture Topology Grid ── */}
      <div id="topology-section" className="my-5">
        <div className="text-center mb-4">
          <span className="badge rounded-pill bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-1 mb-2">
            Spring Cloud Backbone
          </span>
          <h2 className="fw-bold tracking-tight">Microservices Architecture & Port Topology</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
            Every clinical desk operates as an isolated, containerized Spring Boot service with independent persistence and zero single points of failure.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="row g-3"
        >
          {microservices.map((svc) => (
            <motion.div
              key={svc.id}
              variants={staggerItem}
              className="col-12 col-md-6 col-lg-4"
            >
              <motion.div
                variants={cardHover}
                whileHover="hover"
                className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.78)',
                  backdropFilter: 'blur(12px)',
                  border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className={`badge bg-${svc.badgeColor} bg-opacity-10 text-${svc.badgeColor} border border-${svc.badgeColor} border-opacity-25 px-2 py-1`}>
                      {svc.badge}
                    </span>
                    <span className="font-monospace fw-semibold small text-muted">
                      {svc.port}
                    </span>
                  </div>
                  <h5 className="fw-bold mb-2">{svc.name}</h5>
                  <p className="text-muted small mb-3" style={{ lineHeight: 1.55 }}>
                    {svc.desc}
                  </p>
                </div>

                <div className="pt-3 border-top border-opacity-10 d-flex align-items-center justify-content-between">
                  <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-gear-fill me-1 text-primary" /> {svc.tech}
                  </span>
                  <span className="badge rounded-pill bg-light text-dark fw-normal border">
                    {svc.metrics}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Complete Patient Healthcare Journey ── */}
      <div className="my-5 p-4 p-md-5 rounded-4"
        style={{
          background: darkMode ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(16px)',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow: '0 12px 35px rgba(0,0,0,0.04)'
        }}
      >
        <div className="text-center mb-5">
          <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1 mb-2">
            Clinical Lifecycle
          </span>
          <h2 className="fw-bold">Longitudinal Patient Care Journey</h2>
          <p className="text-muted">
            End-to-end orchestration from OPD registration to multi-speciality clinical clearance.
          </p>
        </div>

        <div className="row g-4">
          {patientFlow.map((flow, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4">
              <div
                className="p-3 rounded-3 h-100"
                style={{
                  background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(226, 232, 240, 0.8)'
                }}
              >
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center text-primary fw-bold"
                    style={{ width: '38px', height: '38px', background: 'rgba(14, 165, 233, 0.12)' }}
                  >
                    {flow.step}
                  </div>
                  <h6 className="fw-bold mb-0">{flow.title}</h6>
                </div>
                <p className="text-muted small mb-0 ps-1">
                  {flow.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <motion.button
            variants={buttonPress}
            whileHover="hover"
            whileTap="tap"
            onClick={onLaunchApp}
            className="btn btn-primary btn-lg px-5 py-3 rounded-4 fw-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0284c7, #8b5cf6)', border: 'none' }}
          >
            <i className="bi bi-box-arrow-in-right me-2" />
            Enter Live Healthcare System
          </motion.button>
        </div>
      </div>
    </div>
  );
}
