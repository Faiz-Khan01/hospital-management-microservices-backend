import React, { useState } from 'react';
import { toast } from 'react-toastify';

function HelpSupportPanel() {
  const [ticket, setTicket] = useState({
    subject: '',
    category: 'Technical Issue',
    description: ''
  });

  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const ticketId = Math.floor(10000 + Math.random() * 90000);
    const existing = JSON.parse(localStorage.getItem('hs_support_tickets') || '[]');
    existing.unshift({
      id: ticketId,
      ...ticket,
      createdAt: new Date().toISOString(),
      status: 'OPEN'
    });
    localStorage.setItem('hs_support_tickets', JSON.stringify(existing.slice(0, 50)));

    toast.success(
      `Support ticket #${ticketId} submitted! Help desk will respond within 15 mins.`
    );

    setTicket({
      subject: '',
      category: 'Technical Issue',
      description: ''
    });
  };

  const faqs = [
    {
      q: 'How do I schedule a new patient appointment?',
      a: 'Navigate to "Appointments" in the sidebar, click "Book Appointment", select the patient, attending doctor, and available date/time slot.'
    },
    {
      q: 'How do automated lab notifications work?',
      a: 'When a lab technician updates a report status to "COMPLETED" or "AVAILABLE", the notification service automatically dispatches an in-app alert.'
    },
    {
      q: 'Can I print invoices or prescriptions?',
      a: 'Yes. Every prescription and billing receipt includes a print action that generates a clean, printer-friendly document.'
    },
    {
      q: 'What happens if a microservice is offline?',
      a: 'The platform uses resilient fallback handlers and local state caching so that non-critical workflows remain accessible during temporary service interruptions.'
    }
  ];

  const categories = [
    {
      value: 'Technical Issue',
      icon: 'bi-bug',
      color: '#2563eb'
    },
    {
      value: 'Account & Permissions',
      icon: 'bi-shield-lock',
      color: '#7c3aed'
    },
    {
      value: 'Billing & Payment Query',
      icon: 'bi-credit-card',
      color: '#059669'
    },
    {
      value: 'Feature Request',
      icon: 'bi-stars',
      color: '#ea580c'
    }
  ];

  return (
    <div
      className="help-support-page"
      style={{
        minHeight: '100%',
        background:
          'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        padding: '24px',
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* Premium Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-3"
              style={{
                width: '38px',
                height: '38px',
                background:
                  'linear-gradient(135deg, #2563eb, #4f46e5)',
                color: '#fff',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)'
              }}
            >
              <i className="bi bi-headset fs-5"></i>
            </span>

            <span
              className="text-primary fw-bold text-uppercase"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.12em'
              }}
            >
              Support Center
            </span>
          </div>

          <h3
            className="fw-bold text-dark mb-1"
            style={{
              letterSpacing: '-0.035em',
              fontSize: '1.75rem'
            }}
          >
            Help & Technical Support
          </h3>

          <p className="text-muted mb-0">
            Get answers, troubleshoot issues, or connect with our hospital IT team.
          </p>
        </div>

        {/* Live Status */}
        <div
          className="d-flex align-items-center gap-3 px-3 py-2 rounded-pill"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)'
          }}
        >
          <span
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: '34px',
              height: '34px',
              background: '#dcfce7',
              color: '#16a34a'
            }}
          >
            <i className="bi bi-headset"></i>
          </span>

          <div>
            <div
              className="fw-bold text-dark"
              style={{ fontSize: '0.8rem' }}
            >
              Help Desk Live
            </div>
            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
              Average response · 15 min
            </div>
          </div>

          <span
            className="rounded-circle"
            style={{
              width: '9px',
              height: '9px',
              background: '#22c55e',
              boxShadow: '0 0 0 4px rgba(34,197,94,.12)'
            }}
          ></span>
        </div>
      </div>

      {/* Support Feature Cards */}
      <div className="row g-3 mb-4">
        {[
          {
            icon: 'bi-book-half',
            title: 'Knowledge Base',
            text: 'Browse common workflows and system guides.',
            color: '#2563eb',
            bg: '#eff6ff'
          },
          {
            icon: 'bi-lightning-charge-fill',
            title: 'Fast Resolution',
            text: 'Most technical requests are handled quickly.',
            color: '#d97706',
            bg: '#fffbeb'
          },
          {
            icon: 'bi-shield-check',
            title: 'Secure Support',
            text: 'Your hospital data remains protected.',
            color: '#059669',
            bg: '#ecfdf5'
          },
          {
            icon: 'bi-chat-dots-fill',
            title: 'Expert Assistance',
            text: 'Connect with the hospital IT support team.',
            color: '#7c3aed',
            bg: '#f5f3ff'
          }
        ].map((item, index) => (
          <div className="col-12 col-sm-6 col-xl-3" key={index}>
            <div
              className="h-100 p-3 rounded-4"
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                transition: 'all .25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow =
                  '0 14px 30px rgba(15, 23, 42, 0.09)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 8px 24px rgba(15, 23, 42, 0.05)';
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                style={{
                  width: '42px',
                  height: '42px',
                  background: item.bg,
                  color: item.color
                }}
              >
                <i className={`bi ${item.icon} fs-5`}></i>
              </div>

              <h6 className="fw-bold text-dark mb-1">{item.title}</h6>

              <p
                className="text-muted mb-0"
                style={{
                  fontSize: '0.78rem',
                  lineHeight: 1.5
                }}
              >
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* FAQ Section */}
        <div className="col-12 col-xl-7">
          <div
            className="card border-0 rounded-4 h-100"
            style={{
              background: '#fff',
              boxShadow: '0 12px 35px rgba(15, 23, 42, 0.07)',
              border: '1px solid #e5e7eb'
            }}
          >
            <div className="card-body p-4 p-lg-4">
              {/* Section Header */}
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <div
                    className="d-flex align-items-center gap-2 mb-2"
                    style={{ color: '#2563eb' }}
                  >
                    <i className="bi bi-book-half"></i>
                    <span
                      className="fw-bold text-uppercase"
                      style={{
                        fontSize: '0.68rem',
                        letterSpacing: '0.1em'
                      }}
                    >
                      Knowledge Base
                    </span>
                  </div>

                  <h5
                    className="fw-bold text-dark mb-1"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    Frequently Asked Questions
                  </h5>

                  <p className="text-muted small mb-0">
                    Quick answers to common HospitalSync questions.
                  </p>
                </div>

                <span
                  className="rounded-pill px-3 py-2"
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  {faqs.length} Articles
                </span>
              </div>

              {/* FAQ Items */}
              <div className="d-flex flex-column gap-2">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;

                  return (
                    <div
                      key={idx}
                      style={{
                        border: isOpen
                          ? '1px solid #bfdbfe'
                          : '1px solid #e5e7eb',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        background: isOpen ? '#f8fbff' : '#fff',
                        transition: 'all .2s ease'
                      }}
                    >
                      <button
                        type="button"
                        className="btn w-100 text-start border-0 shadow-none"
                        onClick={() =>
                          setActiveFaq(isOpen ? null : idx)
                        }
                        style={{
                          padding: '17px 18px',
                          background: 'transparent'
                        }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span
                            className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3"
                            style={{
                              width: '34px',
                              height: '34px',
                              background: isOpen
                                ? '#dbeafe'
                                : '#f1f5f9',
                              color: isOpen
                                ? '#2563eb'
                                : '#64748b'
                            }}
                          >
                            <i
                              className={`bi ${
                                isOpen
                                  ? 'bi-chevron-up'
                                  : 'bi-chevron-down'
                              }`}
                              style={{ fontSize: '0.75rem' }}
                            ></i>
                          </span>

                          <span
                            className="fw-semibold flex-grow-1"
                            style={{
                              color: '#1e293b',
                              fontSize: '0.9rem'
                            }}
                          >
                            {faq.q}
                          </span>
                        </div>
                      </button>

                      {isOpen && (
                        <div
                          className="px-4 pb-4"
                          style={{
                            paddingLeft: '65px !important',
                            color: '#64748b',
                            fontSize: '0.82rem',
                            lineHeight: 1.7
                          }}
                        >
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Form */}
        <div className="col-12 col-xl-5">
          <div
            className="card border-0 rounded-4 h-100 overflow-hidden"
            style={{
              background: '#fff',
              boxShadow: '0 12px 35px rgba(15, 23, 42, 0.07)',
              border: '1px solid #e5e7eb'
            }}
          >
            {/* Form Header */}
            <div
              className="p-4"
              style={{
                background:
                  'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)',
                color: '#fff'
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div
                    className="d-flex align-items-center gap-2 mb-2"
                    style={{
                      fontSize: '0.68rem',
                      letterSpacing: '0.1em',
                      opacity: 0.8
                    }}
                  >
                    <i className="bi bi-life-preserver"></i>
                    SUPPORT REQUEST
                  </div>

                  <h5 className="fw-bold mb-1">
                    Submit an IT Ticket
                  </h5>

                  <p
                    className="mb-0"
                    style={{
                      fontSize: '0.78rem',
                      opacity: 0.8
                    }}
                  >
                    Our support team is ready to help.
                  </p>
                </div>

                <div
                  className="d-flex align-items-center justify-content-center rounded-4"
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(255,255,255,.14)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <i className="bi bi-envelope-paper-heart fs-4"></i>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="vstack gap-3">
                  {/* Subject */}
                  <div>
                    <label className="form-label fw-semibold text-dark small">
                      Subject
                    </label>

                    <div className="position-relative">
                      <i
                        className="bi bi-pencil position-absolute"
                        style={{
                          left: '14px',
                          top: '12px',
                          color: '#94a3b8'
                        }}
                      ></i>

                      <input
                        type="text"
                        className="form-control rounded-3 ps-5"
                        placeholder="Briefly describe the issue"
                        value={ticket.subject}
                        onChange={(e) =>
                          setTicket({
                            ...ticket,
                            subject: e.target.value
                          })
                        }
                        required
                        style={{
                          height: '46px',
                          borderColor: '#e2e8f0',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="form-label fw-semibold text-dark small">
                      Issue Category
                    </label>

                    <div className="position-relative">
                      <i
                        className="bi bi-grid position-absolute"
                        style={{
                          left: '14px',
                          top: '12px',
                          color: '#94a3b8',
                          zIndex: 2
                        }}
                      ></i>

                      <select
                        className="form-select rounded-3 ps-5"
                        value={ticket.category}
                        onChange={(e) =>
                          setTicket({
                            ...ticket,
                            category: e.target.value
                          })
                        }
                        style={{
                          height: '46px',
                          borderColor: '#e2e8f0',
                          fontSize: '0.85rem'
                        }}
                      >
                        {categories.map((category) => (
                          <option
                            key={category.value}
                            value={category.value}
                          >
                            {category.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Category Preview */}
                  <div
                    className="d-flex align-items-center gap-3 rounded-3 p-3"
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: '38px',
                        height: '38px',
                        background:
                          categories.find(
                            (c) => c.value === ticket.category
                          )?.color + '12',
                        color:
                          categories.find(
                            (c) => c.value === ticket.category
                          )?.color
                      }}
                    >
                      <i
                        className={`bi ${
                          categories.find(
                            (c) => c.value === ticket.category
                          )?.icon
                        }`}
                      ></i>
                    </div>

                    <div>
                      <div
                        className="fw-semibold text-dark"
                        style={{ fontSize: '0.78rem' }}
                      >
                        {ticket.category}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: '0.7rem' }}
                      >
                        Selected support category
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="d-flex justify-content-between">
                      <label className="form-label fw-semibold text-dark small">
                        Description
                      </label>

                      <span
                        className="text-muted"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {ticket.description.length}/500
                      </span>
                    </div>

                    <textarea
                      className="form-control rounded-3"
                      rows={5}
                      maxLength={500}
                      placeholder="Describe what happened, what you expected, and any error message..."
                      value={ticket.description}
                      onChange={(e) =>
                        setTicket({
                          ...ticket,
                          description: e.target.value
                        })
                      }
                      required
                      style={{
                        borderColor: '#e2e8f0',
                        fontSize: '0.85rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn text-white fw-bold rounded-3 py-2"
                    style={{
                      background:
                        'linear-gradient(135deg, #2563eb, #4f46e5)',
                      boxShadow:
                        '0 8px 20px rgba(37, 99, 235, 0.22)',
                      border: 'none'
                    }}
                  >
                    <i className="bi bi-send-fill me-2"></i>
                    Submit Support Ticket
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>

                  <div
                    className="d-flex align-items-center justify-content-center gap-2 text-muted"
                    style={{ fontSize: '0.7rem' }}
                  >
                    <i className="bi bi-shield-check text-success"></i>
                    Your support request is securely transmitted
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Support Banner */}
      <div
        className="mt-4 rounded-4 p-4"
        style={{
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.14)'
        }}
      >
        <div className="row align-items-center g-3">
          <div className="col-md-8">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4 flex-shrink-0"
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa'
                }}
              >
                <i className="bi bi-chat-square-text-fill fs-5"></i>
              </div>

              <div>
                <h6 className="fw-bold mb-1">
                  Need immediate assistance?
                </h6>
                <p
                  className="mb-0"
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.78rem'
                  }}
                >
                  Submit a ticket and the IT operations team will
                  review your request.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 text-md-end">
            <span
              className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2"
              style={{
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#4ade80',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              <span
                className="rounded-circle"
                style={{
                  width: '7px',
                  height: '7px',
                  background: '#4ade80'
                }}
              ></span>
              Support team online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpSupportPanel;

