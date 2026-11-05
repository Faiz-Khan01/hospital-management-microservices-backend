import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  springSmooth,
  cardHover,
  buttonPress,
  fadeUp,
  staggerItem,
} from '../../animations/motionConfig';

gsap.registerPlugin(ScrollTrigger);

// =========================================================================
// Stagger container preset (plain object – not a factory call in JSX)
// =========================================================================
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const staggerItemVariant = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: springSmooth },
};

// =========================================================================
// WebGL availability check
// =========================================================================
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// =========================================================================
// Three.js Canvas – Interactive Microservices & Medical Neural Mesh
// =========================================================================
function ThreeHeroCanvas({ darkMode }) {
  const mountRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── WebGL fallback ──────────────────────────────────────────────────
    if (!isWebGLAvailable()) {
      container.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;font-size:0.9rem;">3D visualization requires WebGL</div>';
      return;
    }

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // ── 1. Scene, Camera, Renderer ─────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power', // GPU-friendly default
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // cap at 1.5× (was 2×)
    container.appendChild(renderer.domElement);

    // ── 2. Central Icosahedron Wireframe Core ──────────────────────────
    const coreGeo = new THREE.IcosahedronGeometry(7, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: darkMode ? 0x38bdf8 : 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // ── 3. Helix Particle Stream ───────────────────────────────────────
    const particleCount = 160; // reduced from 180 for perf
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(darkMode ? 0x38bdf8 : 0x0ea5e9);
    const c2 = new THREE.Color(0xa855f7);
    const c3 = new THREE.Color(0x10b981);

    for (let i = 0; i < particleCount; i++) {
      const theta = (i / particleCount) * Math.PI * 8;
      const radius = 5.5 + Math.sin(theta * 3) * 1.5;
      posArray[i * 3] = Math.cos(theta) * radius;
      posArray[i * 3 + 1] = ((i / particleCount) - 0.5) * 16;
      posArray[i * 3 + 2] = Math.sin(theta) * radius;

      const mixed = i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : c3;
      colorArray[i * 3] = mixed.r;
      colorArray[i * 3 + 1] = mixed.g;
      colorArray[i * 3 + 2] = mixed.b;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // ── 4. Orbiting Microservice Nodes ─────────────────────────────────
    const microserviceNodes = [
      { color: 0x3b82f6, radius: 9,    speed: 0.015, phase: 0   },
      { color: 0x10b981, radius: 9.5,  speed: -0.012, phase: 1.5 },
      { color: 0xef4444, radius: 10,   speed: 0.018,  phase: 3.0 },
      { color: 0xa855f7, radius: 10.5, speed: -0.014, phase: 4.5 },
      { color: 0x06b6d4, radius: 8.5,  speed: 0.02,   phase: 2.2 },
    ];

    const nodeMeshes = microserviceNodes.map((node) => {
      const geo = new THREE.SphereGeometry(0.5, 12, 12); // reduced segments
      const mat = new THREE.MeshBasicMaterial({ color: node.color });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      return { ...node, mesh, geo, mat };
    });

    // ── 5. Mouse Parallax (velocity-damped) ───────────────────────────
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / (rect.width  || 1) - 0.5) * 2;
      targetMouseY = -((e.clientY - rect.top)  / (rect.height || 1) - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ── 6. Responsive canvas via ResizeObserver ────────────────────────
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // ── 7. Animation Loop ──────────────────────────────────────────────
    const rafIdRef = { current: null };
    const clock = new THREE.Clock();
    // Rotation speed factor – halved when user prefers reduced motion
    const speedFactor = prefersReducedMotion ? 0.3 : 1;

    const animate = () => {
      rafIdRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      coreMesh.rotation.y = t * 0.25 * speedFactor;
      coreMesh.rotation.x = t * 0.15 * speedFactor;
      particles.rotation.y = -t * 0.35 * speedFactor;

      nodeMeshes.forEach((item) => {
        const angle = t * item.speed * 20 * speedFactor + item.phase;
        item.mesh.position.x = Math.cos(angle) * item.radius;
        item.mesh.position.z = Math.sin(angle) * item.radius;
        item.mesh.position.y = Math.sin(angle * 2) * 2.5;
      });

      // Smooth lerp camera toward mouse (velocity damping)
      const lerpFactor = prefersReducedMotion ? 0 : 0.045;
      currentMouseX += (targetMouseX - currentMouseX) * lerpFactor;
      currentMouseY += (targetMouseY - currentMouseY) * lerpFactor;
      camera.position.x = currentMouseX * 3.5;
      camera.position.y = currentMouseY * 3.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // ── 8. Cleanup ─────────────────────────────────────────────────────
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(rafIdRef.current);

      // Dispose node geometries and materials
      nodeMeshes.forEach(({ geo, mat }) => {
        geo.dispose();
        mat.dispose();
      });
      coreGeo.dispose();
      coreMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [darkMode, prefersReducedMotion]);

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
        cursor: 'grab',
      }}
    />
  );
}

// =========================================================================
// Main Interactive Architecture Showcase View
// =========================================================================
export default function InteractiveShowcase({ onLaunchApp, darkMode }) {
  const prefersReducedMotion = useReducedMotion();

  // Scroll-triggered section refs
  const topologyRef      = useRef(null);
  const journeyRef       = useRef(null);
  const topologyHeadRef  = useRef(null);
  const journeyHeadRef   = useRef(null);

  // Lenis smooth scroll – showcase container only
  useEffect(() => {
    // Respect prefers-reduced-motion
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    // Single RAF loop – synced with GSAP ticker to avoid duplicate loops
    const gsapTicker = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(gsapTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(gsapTicker);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  // GSAP ScrollTrigger section reveals
  useEffect(() => {
    if (prefersReducedMotion) return;

    const timelines = [];

    // Topology section heading reveal
    if (topologyHeadRef.current) {
      const tl = gsap.fromTo(
        topologyHeadRef.current,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: topologyHeadRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
      timelines.push(tl);
    }

    // Journey section heading reveal
    if (journeyHeadRef.current) {
      const tl = gsap.fromTo(
        journeyHeadRef.current,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: journeyHeadRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
      timelines.push(tl);
    }

    // Journey step cards stagger reveal
    if (journeyRef.current) {
      const cards = journeyRef.current.querySelectorAll('.journey-card');
      if (cards.length > 0) {
        const tl = gsap.fromTo(
          cards,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: journeyRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
        timelines.push(tl);
      }
    }

    return () => {
      // Kill all timelines and their ScrollTrigger instances cleanly
      timelines.forEach((tl) => {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
      });
      ScrollTrigger.refresh();
    };
  }, [prefersReducedMotion]);

  const microservices = [
    {
      id: 'gateway',
      name: 'Spring Cloud Gateway',
      port: ':8080',
      badge: 'Edge Layer',
      badgeColor: 'primary',
      desc: 'Central SSL/TLS reverse proxy with non-blocking Netty reactive routing, rate-limiting, and JWT validation.',
      metrics: 'Sub-12ms Routing',
      tech: 'Spring Cloud Gateway, Netty',
    },
    {
      id: 'eureka',
      name: 'Netflix Eureka Registry',
      port: ':8761',
      badge: 'Service Discovery',
      badgeColor: 'success',
      desc: 'High-availability service registry providing peer-aware heartbeats, health telemetry, and client-side load balancing.',
      metrics: 'Peer Heartbeat (30s)',
      tech: 'Spring Eureka Server',
    },
    {
      id: 'auth',
      name: 'Auth & RBAC Identity Service',
      port: ':8081',
      badge: 'Security',
      badgeColor: 'danger',
      desc: 'Stateless HMAC-SHA256 JWT token dispenser supporting 8 granular healthcare roles: ADMIN, DOCTOR, NURSE, PHARMACIST, LAB_TECH, RECEPTIONIST, ACCOUNTANT, PATIENT.',
      metrics: '100% Stateless Tokens',
      tech: 'Spring Security 6, JWT',
    },
    {
      id: 'patient-emr',
      name: 'Patient EHR & Master Patient Index',
      port: ':8082',
      badge: 'Clinical Core',
      badgeColor: 'info',
      desc: 'Federated longitudinal Electronic Health Record (EHR) covering clinical encounters, allergies, ICD-10 codes, and vitals.',
      metrics: 'HIPAA & ABDM Compliant',
      tech: 'Spring Data JPA, Hibernate',
    },
    {
      id: 'doctor-schedule',
      name: 'Doctor & Department Roster',
      port: ':8083',
      badge: 'Scheduling',
      badgeColor: 'warning',
      desc: 'Shift allocation, OPD consultation schedules, surgeon theatre calendars, and specialization routing.',
      metrics: 'Zero Double-Booking',
      tech: 'Spring Boot 3.4',
    },
    {
      id: 'telemetry-icu',
      name: 'ICU Telemetry & Bed Management',
      port: ':8084',
      badge: 'Critical Care',
      badgeColor: 'danger',
      desc: 'Real-time multi-bed allocation across General, Semi-Private, ICU, and Daycare Chemo bays with live oxygen/ventilator telemetry.',
      metrics: '<200ms Vitals Sync',
      tech: 'WebSocket & Redis Stream',
    },
    {
      id: 'chemo-oncology',
      name: 'Chemotherapy Dosimetry Desk',
      port: ':8085',
      badge: 'Oncology Unit',
      badgeColor: 'primary',
      desc: 'Mosteller Body Surface Area (BSA) algorithmic dosing, ASCO/ONS safety checklists, and extravasation risk alerts.',
      metrics: 'Automated m² Dosimetry',
      tech: 'Oncology Protocol Engine',
    },
    {
      id: 'billing-ledger',
      name: 'Revenue & Smart Ledger Hub',
      port: ':8086',
      badge: 'Financial Desk',
      badgeColor: 'success',
      desc: 'Consolidated OPD/IPD invoicing, TPA insurance claim reconciliation, Razorpay/Stripe checkout, and real-time ledger accounting.',
      metrics: 'Audited Financial Ledger',
      tech: 'Double-Entry Accounting',
    },
    {
      id: 'infrastructure',
      name: 'Distributed Data Backbone',
      port: 'Cluster',
      badge: 'Persistence',
      badgeColor: 'secondary',
      desc: 'MySQL 8.0 ACID relational stores paired with Redis 7 in-memory cache and Dockerized microservices orchestration.',
      metrics: 'Zero Data Loss',
      tech: 'MySQL 8, Redis 7, Docker',
    },
  ];

  const patientFlow = [
    { step: '01', title: 'Digital Patient Registration', icon: 'bi-person-badge', desc: 'Demographics captured with auto-generated MRN and ABDM ABHA ID.' },
    { step: '02', title: 'Triage & Bed Allocation', icon: 'bi-hospital', desc: 'Nurse vitals evaluation and automated bed reservation across ICU, Wards, or Chemo.' },
    { step: '03', title: 'Doctor Consultation & EHR', icon: 'bi-clipboard2-pulse', desc: 'Longitudinal clinical history review, digital e-prescription with drug-drug interaction warning.' },
    { step: '04', title: 'Diagnostic Lab & Imaging', icon: 'bi-virus', desc: 'LIS barcode dispatch, PACS DICOM review, and pathologist electronic sign-off.' },
    { step: '05', title: 'Pharmacy Dispensing', icon: 'bi-capsule', desc: 'Batch verification, expiry alerts, inventory deduction, and dosage labels.' },
    { step: '06', title: 'Smart Ledger & Discharge', icon: 'bi-receipt-cutoff', desc: 'Instant itemized invoice generation, TPA claim approval, and print-ready clearance slip.' },
  ];

  // Shared card hover – disable hover elevation for reduced motion
  const safeCardHover = prefersReducedMotion ? {} : cardHover;
  const safeButtonPress = prefersReducedMotion
    ? {}
    : { whileHover: buttonPress.whileHover, whileTap: buttonPress.whileTap };

  return (
    <div
      className="container-fluid px-3 px-md-5 py-4"
      style={{ minHeight: '100vh', color: darkMode ? '#f8fafc' : '#1e293b' }}
    >
      {/* ── Top Navigation Bar ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="d-flex flex-wrap align-items-center justify-content-between p-3 mb-4 rounded-4"
        style={{
          background: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(16px)',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
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
            <small className="text-muted">Enterprise Healthcare Operating Platform &amp; Microservices Topology</small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
          <motion.button
            {...safeButtonPress}
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
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 rounded-pill"
            style={{
              background: darkMode ? 'rgba(56, 189, 248, 0.12)' : 'rgba(14, 165, 233, 0.12)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              color: '#0284c7',
            }}
          >
            <span className="spinner-grow spinner-grow-sm text-primary" role="status" />
            <span className="fw-semibold small">Spring Boot 3.4 • React 19 • Motion Engine</span>
          </div>

          <h1
            className="display-5 fw-extrabold mb-3 tracking-tight"
            style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}
          >
            Distributed Clinical Intelligence <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Engineered For Zero Latency.
            </span>
          </h1>

          <p
            className="lead mb-4"
            style={{ color: darkMode ? '#cbd5e1' : '#475569', fontSize: '1.05rem', lineHeight: 1.6 }}
          >
            HospitalSync Pro powers 18 mission-critical healthcare microservices—from real-time ICU telemetry and
            Mosteller chemotherapy dosimetry to longitudinal EMRs and automated smart billing—built on Spring Cloud
            Gateway, Redis 7, and Motion for React.
          </p>

          <div className="d-flex flex-wrap gap-3 mb-4">
            <motion.button
              {...safeButtonPress}
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
                color: darkMode ? '#e2e8f0' : '#334155',
              }}
            >
              <i className="bi bi-diagram-3-fill text-primary" />
              Explore Topology
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="row g-2 pt-2">
            {[
              { val: '18',    label: 'Microservices',      icon: 'bi-cpu' },
              { val: '25+',   label: 'Database Entities',  icon: 'bi-database' },
              { val: '<15ms', label: 'Gateway Latency',    icon: 'bi-lightning-charge' },
              { val: '100%',  label: 'RBAC Enforced',      icon: 'bi-shield-check' },
            ].map((m, idx) => (
              <div key={idx} className="col-6 col-sm-3">
                <div
                  className="p-2 rounded-3 text-center"
                  style={{
                    background: darkMode ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.65)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(8px)',
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
              boxShadow: '0 20px 40px -10px rgba(14, 165, 233, 0.12)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2 px-2">
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">
                <i className="bi bi-badge-3d me-1" /> Interactive WebGL Canvas
              </span>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-arrows-move me-1" /> Drag &amp; Rotate Mesh
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
      <div id="topology-section" ref={topologyRef} className="my-5">
        <div ref={topologyHeadRef} className="text-center mb-4">
          <span className="badge rounded-pill bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-1 mb-2">
            Spring Cloud Backbone
          </span>
          <h2 className="fw-bold tracking-tight">Microservices Architecture &amp; Port Topology</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
            Every clinical desk operates as an isolated, containerized Spring Boot service with independent persistence and zero single points of failure.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="row g-3"
        >
          {microservices.map((svc) => (
            <motion.div
              key={svc.id}
              variants={staggerItemVariant}
              className="col-12 col-md-6 col-lg-4"
            >
              <motion.div
                variants={safeCardHover}
                initial="rest"
                whileHover="hover"
                className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.78)',
                  backdropFilter: 'blur(12px)',
                  border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className={`badge bg-${svc.badgeColor} bg-opacity-10 text-${svc.badgeColor} border border-${svc.badgeColor} border-opacity-25 px-2 py-1`}>
                      {svc.badge}
                    </span>
                    <span className="font-monospace fw-semibold small text-muted">{svc.port}</span>
                  </div>
                  <h5 className="fw-bold mb-2">{svc.name}</h5>
                  <p className="text-muted small mb-3" style={{ lineHeight: 1.55 }}>{svc.desc}</p>
                </div>

                <div className="pt-3 border-top border-opacity-10 d-flex align-items-center justify-content-between">
                  <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-gear-fill me-1 text-primary" /> {svc.tech}
                  </span>
                  <span className="badge rounded-pill bg-light text-dark fw-normal border">{svc.metrics}</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Complete Patient Healthcare Journey ── */}
      <div
        ref={journeyRef}
        className="my-5 p-4 p-md-5 rounded-4"
        style={{
          background: darkMode ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(16px)',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow: '0 12px 35px rgba(0,0,0,0.04)',
        }}
      >
        <div ref={journeyHeadRef} className="text-center mb-5">
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
                className="p-3 rounded-3 h-100 journey-card"
                style={{
                  background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(226, 232, 240, 0.8)',
                  // Initial opacity set for GSAP animation; fallback to visible if reduced motion
                  opacity: prefersReducedMotion ? 1 : undefined,
                }}
              >
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center text-primary fw-bold"
                    style={{ width: '38px', height: '38px', background: 'rgba(14, 165, 233, 0.12)', flexShrink: 0 }}
                  >
                    {flow.step}
                  </div>
                  <h6 className="fw-bold mb-0">{flow.title}</h6>
                </div>
                <p className="text-muted small mb-0 ps-1">{flow.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <motion.button
            {...safeButtonPress}
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
