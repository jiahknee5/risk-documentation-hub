-- Seed data for Risk Documentation Hub
-- Run this after init-database.sql to add sample data

-- First, let's create properly hashed passwords
-- These are bcrypt hashes for the passwords shown in comments
-- admin@example.com: Admin123! (hash: $2a$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/FeC9.gOMxlYaci)
-- user@example.com: User123! (hash: $2a$10$xGqiIBe1Kj9dvDP.1K1mVuqxUau2kCCQQvMYpGz8YFYK8yXFuXfLy)
-- manager@example.com: Manager123! (hash: $2a$10$L6X6Rwh3FKDBPrUa.KGMa.FW/tHieJSVRdRMGmP3KLzHWEMVvZsG2)

-- Clear existing data (optional - comment out if you want to keep existing data)
TRUNCATE TABLE "compliance_checks", "comments", "approvals", "audit_logs", "document_access", "document_versions", "documents", "users" CASCADE;

-- Insert demo users
INSERT INTO "users" ("id", "email", "name", "password", "role", "department", "isActive") VALUES
    ('usr_admin_001', 'admin@example.com', 'John Admin', '$2a$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/FeC9.gOMxlYaci', 'ADMIN', 'IT Security', true),
    ('usr_mgr_001', 'manager@example.com', 'Jane Smith', '$2a$10$L6X6Rwh3FKDBPrUa.KGMa.FW/tHieJSVRdRMGmP3KLzHWEMVvZsG2', 'MANAGER', 'Compliance', true),
    ('usr_user_001', 'user@example.com', 'Bob Johnson', '$2a$10$xGqiIBe1Kj9dvDP.1K1mVuqxUau2kCCQQvMYpGz8YFYK8yXFuXfLy', 'USER', 'Operations', true),
    ('usr_viewer_001', 'viewer@example.com', 'Alice Brown', '$2a$10$xGqiIBe1Kj9dvDP.1K1mVuqxUau2kCCQQvMYpGz8YFYK8yXFuXfLy', 'VIEWER', 'Finance', true);

-- Insert sample documents
INSERT INTO "documents" (
    "id", "title", "description", "category", "subCategory", 
    "filePath", "fileName", "fileSize", "mimeType", "version",
    "riskLevel", "complianceStatus", "tags", "content", "summary", "keyPoints",
    "uploadedBy", "approvedBy", "approvedAt", "isActive"
) VALUES
    (
        'doc_001',
        'Information Security Policy 2024',
        'Comprehensive information security policy outlining data protection standards and procedures.',
        'POLICY',
        'Security',
        '/uploads/info_security_policy_2024.pdf',
        'info_security_policy_2024.pdf',
        524288,
        'application/pdf',
        1,
        'HIGH',
        'APPROVED',
        '["security", "policy", "data-protection", "2024"]',
        'This document outlines our comprehensive information security policy...',
        'Company-wide security policy covering access controls, data classification, and incident response.',
        '["Multi-factor authentication required", "Data classification: Public, Internal, Confidential, Restricted", "24/7 incident response team", "Quarterly security training mandatory"]',
        'usr_admin_001',
        'usr_mgr_001',
        NOW() - INTERVAL '7 days',
        true
    ),
    (
        'doc_002',
        'GDPR Compliance Procedures',
        'Detailed procedures for ensuring GDPR compliance including data subject rights.',
        'COMPLIANCE',
        'Privacy',
        '/uploads/gdpr_procedures.pdf',
        'gdpr_procedures.pdf',
        612352,
        'application/pdf',
        1,
        'HIGH',
        'APPROVED',
        '["gdpr", "compliance", "privacy", "data-rights"]',
        'GDPR compliance procedures covering data subject rights and breach notification...',
        'GDPR compliance guide with data rights procedures and breach protocols.',
        '["30-day response for data requests", "72-hour breach notification", "Privacy by design principles", "Regular privacy audits"]',
        'usr_mgr_001',
        'usr_admin_001',
        NOW() - INTERVAL '14 days',
        true
    ),
    (
        'doc_003',
        'Cybersecurity Incident Response Plan',
        'Step-by-step incident response procedures for cybersecurity incidents.',
        'CYBERSECURITY',
        'Incident Response',
        '/uploads/incident_response_plan.pdf',
        'incident_response_plan.pdf',
        819200,
        'application/pdf',
        1,
        'CRITICAL',
        'APPROVED',
        '["incident-response", "cybersecurity", "emergency", "procedures"]',
        'Detailed incident response playbook for various cyber incidents...',
        'Comprehensive IR plan with escalation procedures and contact lists.',
        '["15-minute response SLA", "Defined incident severity levels", "Forensics procedures", "Communication templates"]',
        'usr_admin_001',
        'usr_mgr_001',
        NOW() - INTERVAL '3 days',
        true
    ),
    (
        'doc_004',
        'Financial Risk Assessment Q4 2024',
        'Quarterly financial risk assessment report.',
        'FINANCIAL_RISK',
        'Quarterly Report',
        '/uploads/financial_risk_q4_2024.pdf',
        'financial_risk_q4_2024.pdf',
        409600,
        'application/pdf',
        1,
        'MEDIUM',
        'UNDER_REVIEW',
        '["financial", "risk", "quarterly", "2024-Q4"]',
        'Q4 2024 financial risk assessment covering market, credit, and liquidity risks...',
        'Q4 financial risk report highlighting key risk indicators.',
        '["Market risk within tolerance", "Credit exposure increased 5%", "Liquidity ratio: 1.8", "Recommend hedging strategies"]',
        'usr_user_001',
        NULL,
        NULL,
        true
    ),
    (
        'doc_005',
        'Business Continuity Plan',
        'Enterprise business continuity and disaster recovery plan.',
        'OPERATIONAL_RISK',
        'BCP/DR',
        '/uploads/bcp_plan_2024.pdf',
        'bcp_plan_2024.pdf',
        1048576,
        'application/pdf',
        1,
        'CRITICAL',
        'APPROVED',
        '["bcp", "disaster-recovery", "continuity", "critical"]',
        'Business continuity plan covering all critical business functions...',
        'Enterprise BCP with recovery strategies and contact information.',
        '["RTO: 4 hours for critical systems", "RPO: 1 hour", "Alternate site ready", "Annual DR tests required"]',
        'usr_mgr_001',
        'usr_admin_001',
        NOW() - INTERVAL '30 days',
        true
    );

-- Insert document access permissions
INSERT INTO "document_access" ("id", "documentId", "userId", "accessType", "grantedBy", "isActive") VALUES
    (gen_random_uuid()::text, 'doc_001', 'usr_user_001', 'VIEW', 'usr_admin_001', true),
    (gen_random_uuid()::text, 'doc_001', 'usr_viewer_001', 'VIEW', 'usr_admin_001', true),
    (gen_random_uuid()::text, 'doc_002', 'usr_user_001', 'EDIT', 'usr_mgr_001', true),
    (gen_random_uuid()::text, 'doc_003', 'usr_user_001', 'VIEW', 'usr_admin_001', true),
    (gen_random_uuid()::text, 'doc_004', 'usr_mgr_001', 'ADMIN', 'usr_admin_001', true);

-- Insert audit logs
INSERT INTO "audit_logs" ("id", "userId", "documentId", "action", "details", "ipAddress", "userAgent") VALUES
    (gen_random_uuid()::text, 'usr_admin_001', NULL, 'LOGIN', '{"method": "credentials"}', '192.168.1.100', 'Mozilla/5.0 Chrome/120.0'),
    (gen_random_uuid()::text, 'usr_admin_001', 'doc_001', 'DOCUMENT_UPLOAD', '{"title": "Information Security Policy 2024"}', '192.168.1.100', 'Mozilla/5.0 Chrome/120.0'),
    (gen_random_uuid()::text, 'usr_mgr_001', 'doc_001', 'DOCUMENT_APPROVE', '{"previousStatus": "PENDING"}', '192.168.1.101', 'Mozilla/5.0 Chrome/120.0'),
    (gen_random_uuid()::text, 'usr_user_001', 'doc_001', 'DOCUMENT_VIEW', '{"page": 1}', '192.168.1.102', 'Mozilla/5.0 Firefox/120.0'),
    (gen_random_uuid()::text, 'usr_mgr_001', 'doc_002', 'DOCUMENT_UPLOAD', '{"title": "GDPR Compliance Procedures"}', '192.168.1.101', 'Mozilla/5.0 Chrome/120.0');

-- Insert sample comments
INSERT INTO "comments" ("id", "documentId", "userId", "content", "isResolved") VALUES
    (gen_random_uuid()::text, 'doc_001', 'usr_mgr_001', 'Great policy document. Approved for implementation.', true),
    (gen_random_uuid()::text, 'doc_002', 'usr_admin_001', 'Please ensure all departments are trained on these procedures.', false),
    (gen_random_uuid()::text, 'doc_004', 'usr_mgr_001', 'Need more details on hedging strategies before approval.', false);

-- Insert compliance checks
INSERT INTO "compliance_checks" ("id", "documentId", "checkType", "status", "findings", "nextCheckDue") VALUES
    (gen_random_uuid()::text, 'doc_001', 'ISO_27001', 'APPROVED', '["All controls implemented", "No major findings"]', NOW() + INTERVAL '90 days'),
    (gen_random_uuid()::text, 'doc_002', 'GDPR', 'APPROVED', '["Compliant with Articles 15-22", "DPO contact updated"]', NOW() + INTERVAL '180 days'),
    (gen_random_uuid()::text, 'doc_005', 'CUSTOM', 'APPROVED', '["DR test successful", "All contacts verified"]', NOW() + INTERVAL '365 days');

-- Update system config with actual values
UPDATE "system_config" SET "value" = 'Risk Documentation Hub - Production' WHERE "key" = 'app_name';

COMMIT;