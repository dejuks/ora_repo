 CREATE TYPE member_status AS ENUM (
  'active',
  'inactive',
  'suspended',
  'expired',
  'blocked'
);

CREATE TYPE material_format AS ENUM (
  'physical',
  'digital',
  'hybrid'
);

CREATE TYPE copy_status AS ENUM (
  'available',
  'borrowed',
  'reserved',
  'processing',
  'lost',
  'damaged',
  'withdrawn',
  'in_repair'
);

CREATE TYPE loan_status AS ENUM (
  'active',
  'overdue',
  'returned',
  'lost',
  'closed'
);

CREATE TYPE hold_status AS ENUM (
  'queued',
  'ready_for_pickup',
  'fulfilled',
  'cancelled',
  'expired'
);

CREATE TYPE fine_status AS ENUM (
  'unpaid',
  'partial',
  'paid',
  'waived',
  'cancelled'
);

CREATE TYPE acquisition_request_status AS ENUM (
  'draft',
  'submitted',
  'approved',
  'rejected',
  'ordered',
  'partially_received',
  'received',
  'cancelled'
);

CREATE TYPE purchase_order_status AS ENUM (
  'draft',
  'approved',
  'sent',
  'partially_received',
  'received',
  'cancelled'
);

CREATE TYPE digital_submission_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'correction_requested',
  'approved',
  'rejected',
  'published',
  'archived'
);

CREATE TYPE digital_access_level AS ENUM (
  'public',
  'registered_users',
  'students_only',
  'staff_only',
  'institution_only',
  'restricted'
);

CREATE TYPE review_decision AS ENUM (
  'pending',
  'approved',
  'rejected',
  'correction_requested'
);

CREATE TYPE resource_file_role AS ENUM (
  'main',
  'cover',
  'supplement',
  'preview',
  'license',
  'metadata'
);

CREATE TYPE inventory_audit_status AS ENUM (
  'draft',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE damage_severity AS ENUM (
  'minor',
  'moderate',
  'severe'
);
1. Master data tables

These tables are shared by physical and digital library modules.

4.1 Branches
CREATE TABLE library_branches (
  branch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(30),
  email VARCHAR(120),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
4.2. Locations
CREATE TABLE library_locations (
  location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES library_branches(branch_id) ON DELETE CASCADE,
  parent_location_id UUID REFERENCES library_locations(location_id) ON DELETE SET NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  location_type VARCHAR(50), -- room, shelf, rack, cabinet, section
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(branch_id, code)
);
4.3. Material Types
CREATE TABLE material_types (
  material_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_borrowable BOOLEAN NOT NULL DEFAULT TRUE,
  is_digital_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  is_physical_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
4.4. Categories
CREATE TABLE library_categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_category_id UUID REFERENCES library_categories(category_id) ON DELETE SET NULL,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
4.5. Subjects
CREATE TABLE library_subjects (
  subject_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
4.6. Languages
CREATE TABLE languages (
  language_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL, -- en, am, or
  name VARCHAR(80) NOT NULL
);
4.7. Publishers 
CREATE TABLE publishers (
  publisher_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  city VARCHAR(120),
  country VARCHAR(120),
  website VARCHAR(255),
  contact_email VARCHAR(120),
  contact_phone VARCHAR(30),
  is_external_provider BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
4.8. Authors / contributors

CREATE TABLE contributors (
  contributor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(200) NOT NULL,
  organization_name VARCHAR(200),
  contributor_type VARCHAR(50) NOT NULL DEFAULT 'person', -- person, organization
  bio TEXT,
  email VARCHAR(120),
  orcid VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

5. Member library profile

You already have users. This adds library-specific profile data.

5.1 Member types
CREATE TABLE member_types (
  member_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  max_active_loans INT NOT NULL DEFAULT 3,
  max_hold_requests INT NOT NULL DEFAULT 3,
  loan_period_days INT NOT NULL DEFAULT 14,
  renewal_limit INT NOT NULL DEFAULT 1,
  fine_per_day NUMERIC(10,2) NOT NULL DEFAULT 0,
  grace_period_days INT NOT NULL DEFAULT 0,
  can_access_digital BOOLEAN NOT NULL DEFAULT TRUE,
  can_download_digital BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
5.2. Members
CREATE TABLE library_members (
  member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(uuid) ON DELETE CASCADE,
  member_type_id UUID NOT NULL REFERENCES member_types(member_type_id),
  member_code VARCHAR(50) UNIQUE NOT NULL,
  branch_id UUID REFERENCES library_branches(branch_id) ON DELETE SET NULL,
  department VARCHAR(150),
  program VARCHAR(150),
  admission_year INT,
  expiry_date DATE,
  status member_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
5.3. Member status history
CREATE TABLE member_status_history (
  history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES library_members(member_id) ON DELETE CASCADE,
  old_status member_status,
  new_status member_status NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

6. Bibliographic catalog

This is the title-level record, not the copy.

6.1 Catalog materials
CREATE TABLE catalog_materials (
  material_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type_id UUID NOT NULL REFERENCES material_types(material_type_id),
  category_id UUID REFERENCES library_categories(category_id) ON DELETE SET NULL,
  publisher_id UUID REFERENCES publishers(publisher_id) ON DELETE SET NULL,
  language_id UUID REFERENCES languages(language_id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500),
  edition VARCHAR(100),
  isbn VARCHAR(30),
  issn VARCHAR(30),
  publication_year INT,
  publication_place VARCHAR(150),
  abstract TEXT,
  description TEXT,
  table_of_contents TEXT,
  keywords TEXT[],
  classification_code VARCHAR(100),   -- DDC/LCC number
  call_number VARCHAR(150),           -- general call number
  material_format material_format NOT NULL DEFAULT 'physical',
  is_reference_only BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
6.2. Material contributors (authors, editors, etc.)
CREATE TABLE catalog_material_contributors (
  material_contributor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES catalog_materials(material_id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES contributors(contributor_id) ON DELETE CASCADE,
  role_name VARCHAR(80) NOT NULL, -- author, editor, translator, compiler
  sequence_no INT NOT NULL DEFAULT 1,
  UNIQUE(material_id, contributor_id, role_name, sequence_no)
);
6.3. Material subjects
CREATE TABLE catalog_material_subjects (
  material_subject_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES catalog_materials(material_id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES library_subjects(subject_id) ON DELETE CASCADE,
  UNIQUE(material_id, subject_id)
);

7. Physical copies

This is the actual borrowable unit.

7.1 Material copies

CREATE TABLE material_copies (
  copy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES catalog_materials(material_id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES library_branches(branch_id) ON DELETE RESTRICT,
  location_id UUID REFERENCES library_locations(location_id) ON DELETE SET NULL,
  accession_number VARCHAR(80) UNIQUE NOT NULL,
  barcode VARCHAR(80) UNIQUE,
  rfid_tag VARCHAR(80) UNIQUE,
  copy_number INT NOT NULL DEFAULT 1,
  purchase_price NUMERIC(12,2),
  replacement_cost NUMERIC(12,2),
  acquisition_date DATE,
  condition_note TEXT,
  status copy_status NOT NULL DEFAULT 'available',
  is_circulation_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  withdrawn_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

8. Circulation policy

These rules control borrow, renew, and fines.

8.1 Circulation policies
CREATE TABLE circulation_policies (
  policy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  member_type_id UUID REFERENCES member_types(member_type_id) ON DELETE CASCADE,
  material_type_id UUID REFERENCES material_types(material_type_id) ON DELETE CASCADE,
  max_active_loans INT NOT NULL DEFAULT 3,
  loan_period_days INT NOT NULL DEFAULT 14,
  renewal_limit INT NOT NULL DEFAULT 1,
  grace_period_days INT NOT NULL DEFAULT 0,
  fine_per_day NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_fine_amount NUMERIC(10,2),
  allow_holds BOOLEAN NOT NULL DEFAULT TRUE,
  allow_renewal BOOLEAN NOT NULL DEFAULT TRUE,
  allow_reference_checkout BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_type_id, material_type_id)
);

9. Physical circulation transactions
9.1 Loans
CREATE TABLE loans (
  loan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES library_members(member_id) ON DELETE RESTRICT,
  copy_id UUID NOT NULL REFERENCES material_copies(copy_id) ON DELETE RESTRICT,
  issued_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  returned_to UUID REFERENCES users(uuid) ON DELETE SET NULL,
  policy_id UUID REFERENCES circulation_policies(policy_id) ON DELETE SET NULL,
  loan_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  return_date TIMESTAMPTZ,
  renewal_count INT NOT NULL DEFAULT 0,
  status loan_status NOT NULL DEFAULT 'active',
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT one_active_loan_per_copy UNIQUE (copy_id, status)
    DEFERRABLE INITIALLY DEFERRED
);
-- The unique constraint above is not ideal because status changes. A better production approach is a partial unique index:

CREATE UNIQUE INDEX uq_active_loan_per_copy
ON loans(copy_id)
WHERE status IN ('active', 'overdue');

9.2 Renewals
CREATE TABLE loan_renewals (
  renewal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(loan_id) ON DELETE CASCADE,
  renewed_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  old_due_date TIMESTAMPTZ NOT NULL,
  new_due_date TIMESTAMPTZ NOT NULL,
  renewal_no INT NOT NULL,
  note TEXT,
  renewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(loan_id, renewal_no)
);

9.3 Holds / reservations
CREATE TABLE hold_requests (
  hold_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES library_members(member_id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES catalog_materials(material_id) ON DELETE CASCADE,
  copy_id UUID REFERENCES material_copies(copy_id) ON DELETE SET NULL,
  queue_position INT,
  status hold_status NOT NULL DEFAULT 'queued',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ready_at TIMESTAMPTZ,
  expiry_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

10. Fines and payments
10.1 Fines
CREATE TABLE fines (
  fine_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES library_members(member_id) ON DELETE CASCADE,
  loan_id UUID REFERENCES loans(loan_id) ON DELETE SET NULL,
  copy_id UUID REFERENCES material_copies(copy_id) ON DELETE SET NULL,
  reason VARCHAR(100) NOT NULL, -- overdue, lost, damage, manual_penalty
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  waived_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (waived_amount >= 0),
  status fine_status NOT NULL DEFAULT 'unpaid',
  assessed_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  due_date DATE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

10.2 Fine payments
CREATE TABLE fine_payments (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fine_id UUID NOT NULL REFERENCES fines(fine_id) ON DELETE CASCADE,
  received_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(50), -- cash, bank, mobile, waived
  reference_no VARCHAR(100),
  note TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

10.3 Fine waivers
CREATE TABLE fine_waivers (
  waiver_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fine_id UUID NOT NULL REFERENCES fines(fine_id) ON DELETE CASCADE,
  approved_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,
  waived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

11. Lost and damaged items
11.1 Damage reports
CREATE TABLE damage_reports (
  damage_report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id UUID NOT NULL REFERENCES material_copies(copy_id) ON DELETE CASCADE,
  loan_id UUID REFERENCES loans(loan_id) ON DELETE SET NULL,
  reported_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  severity damage_severity NOT NULL,
  description TEXT NOT NULL,
  estimated_cost NUMERIC(12,2),
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_note TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

11.2 Lost item reports
CREATE TABLE lost_item_reports (
  lost_report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id UUID NOT NULL REFERENCES material_copies(copy_id) ON DELETE CASCADE,
  loan_id UUID REFERENCES loans(loan_id) ON DELETE SET NULL,
  reported_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  description TEXT,
  replacement_cost NUMERIC(12,2),
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_note TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

12. Acquisition
12.1 Vendors
CREATE TABLE vendors (
  vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(150),
  email VARCHAR(120),
  phone VARCHAR(30),
  address TEXT,
  website VARCHAR(255),
  tax_id VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

12.2 Acquisition requests

CREATE TABLE acquisition_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  material_type_id UUID REFERENCES material_types(material_type_id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  author_text VARCHAR(300),
  publisher_text VARCHAR(200),
  publication_year INT,
  isbn VARCHAR(30),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  estimated_price NUMERIC(12,2),
  justification TEXT,
  status acquisition_request_status NOT NULL DEFAULT 'draft',
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

12.3 Purchase orders

CREATE TABLE purchase_orders (
  purchase_order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES acquisition_requests(request_id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES vendors(vendor_id) ON DELETE SET NULL,
  po_number VARCHAR(80) UNIQUE NOT NULL,
  ordered_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  order_date DATE,
  expected_delivery_date DATE,
  total_amount NUMERIC(12,2),
  status purchase_order_status NOT NULL DEFAULT 'draft',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

12.4 Purchase order items
CREATE TABLE purchase_order_items (
  po_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(purchase_order_id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  author_text VARCHAR(300),
  isbn VARCHAR(30),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2),
  total_price NUMERIC(12,2),
  material_type_id UUID REFERENCES material_types(material_type_id) ON DELETE SET NULL
);

12.5 Deliveries / receipts
CREATE TABLE acquisitions_receipts (
  receipt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES purchase_orders(purchase_order_id) ON DELETE SET NULL,
  received_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  receipt_number VARCHAR(80),
  received_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

12.6 Receipt items

CREATE TABLE acquisitions_receipt_items (
  receipt_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES acquisitions_receipts(receipt_id) ON DELETE CASCADE,
  po_item_id UUID REFERENCES purchase_order_items(po_item_id) ON DELETE SET NULL,
  received_quantity INT NOT NULL CHECK (received_quantity >= 0),
  accepted_quantity INT NOT NULL CHECK (accepted_quantity >= 0),
  rejected_quantity INT NOT NULL DEFAULT 0 CHECK (rejected_quantity >= 0),
  condition_note TEXT
);


13. Cataloging intake

-- These tables help track the processing of newly received materials into catalog and copies.

13.1 Cataloging jobs
CREATE TABLE cataloging_jobs (
  cataloging_job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_item_id UUID REFERENCES acquisitions_receipt_items(receipt_item_id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(uuid) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
  note TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- This can help your Cataloger workflow.
14. Inventory and audits
14.1 Inventory audits
CREATE TABLE inventory_audits (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES library_branches(branch_id) ON DELETE SET NULL,
  location_id UUID REFERENCES library_locations(location_id) ON DELETE SET NULL,
  audit_name VARCHAR(200) NOT NULL,
  status inventory_audit_status NOT NULL DEFAULT 'draft',
  started_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  completed_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

14.2 Inventory audit items
CREATE TABLE inventory_audit_items (
  audit_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES inventory_audits(audit_id) ON DELETE CASCADE,
  copy_id UUID NOT NULL REFERENCES material_copies(copy_id) ON DELETE CASCADE,
  expected_location_id UUID REFERENCES library_locations(location_id) ON DELETE SET NULL,
  found_location_id UUID REFERENCES library_locations(location_id) ON DELETE SET NULL,
  was_found BOOLEAN,
  condition_note TEXT,
  discrepancy_note TEXT,
  checked_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  checked_at TIMESTAMPTZ,
  UNIQUE(audit_id, copy_id)
);

15. Digital library resources

-- This is the main digital content structure.

15.1 Digital resources
CREATE TABLE digital_resources (
  digital_resource_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES catalog_materials(material_id) ON DELETE SET NULL,
  publisher_id UUID REFERENCES publishers(publisher_id) ON DELETE SET NULL,
  access_level digital_access_level NOT NULL DEFAULT 'registered_users',
  drm_required BOOLEAN NOT NULL DEFAULT FALSE,
  license_start_date DATE,
  license_end_date DATE,
  embargo_until DATE,
  is_downloadable BOOLEAN NOT NULL DEFAULT TRUE,
  is_streamable BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- A digital resource is linked to catalog_materials, so your physical and digital records can share common metadata.

15.2 Digital resource files
CREATE TABLE digital_resource_files (
  file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  digital_resource_id UUID NOT NULL REFERENCES digital_resources(digital_resource_id) ON DELETE CASCADE,
  file_role resource_file_role NOT NULL DEFAULT 'main',
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  mime_type VARCHAR(120),
  file_size_bytes BIGINT,
  checksum_sha256 VARCHAR(128),
  version_no INT NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  uploaded_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

15.3 Digital resource access rules
CREATE TABLE digital_access_rules (
  rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  digital_resource_id UUID NOT NULL REFERENCES digital_resources(digital_resource_id) ON DELETE CASCADE,
  member_type_id UUID REFERENCES member_types(member_type_id) ON DELETE CASCADE,
  allow_view BOOLEAN NOT NULL DEFAULT TRUE,
  allow_download BOOLEAN NOT NULL DEFAULT TRUE,
  allow_print BOOLEAN NOT NULL DEFAULT FALSE,
  max_downloads_per_user INT,
  note TEXT,
  UNIQUE(digital_resource_id, member_type_id)
);

15.4 Digital usage logs
CREATE TABLE digital_usage_logs (
  usage_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  digital_resource_id UUID NOT NULL REFERENCES digital_resources(digital_resource_id) ON DELETE CASCADE,
  file_id UUID REFERENCES digital_resource_files(file_id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(uuid) ON DELETE SET NULL,
  member_id UUID REFERENCES library_members(member_id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- view, download, preview, denied
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

16. Digital submissions and approvals

This supports Digital Librarian, Content Uploader, and External Publisher workflows.

16.1 Digital submissions
CREATE TABLE digital_submissions (
  submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  publisher_id UUID REFERENCES publishers(publisher_id) ON DELETE SET NULL,
  material_type_id UUID REFERENCES material_types(material_type_id) ON DELETE SET NULL,
  category_id UUID REFERENCES library_categories(category_id) ON DELETE SET NULL,
  language_id UUID REFERENCES languages(language_id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500),
  abstract TEXT,
  keywords TEXT[],
  publication_year INT,
  isbn VARCHAR(30),
  issn VARCHAR(30),
  access_level digital_access_level NOT NULL DEFAULT 'registered_users',
  status digital_submission_status NOT NULL DEFAULT 'draft',
  note TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

16.2 Submission contributors
CREATE TABLE digital_submission_contributors (
  submission_contributor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES digital_submissions(submission_id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES contributors(contributor_id) ON DELETE CASCADE,
  role_name VARCHAR(80) NOT NULL,
  sequence_no INT NOT NULL DEFAULT 1,
  UNIQUE(submission_id, contributor_id, role_name, sequence_no)
);

16.3 Submission files
CREATE TABLE digital_submission_files (
  submission_file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES digital_submissions(submission_id) ON DELETE CASCADE,
  file_role resource_file_role NOT NULL DEFAULT 'main',
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  mime_type VARCHAR(120),
  file_size_bytes BIGINT,
  checksum_sha256 VARCHAR(128),
  uploaded_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
16.4 Submission reviews
CREATE TABLE digital_submission_reviews (
  review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES digital_submissions(submission_id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(uuid) ON DELETE SET NULL,
  decision review_decision NOT NULL DEFAULT 'pending',
  comments TEXT,
  internal_note TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

16.5 Submission status history

CREATE TABLE digital_submission_status_history (
  history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES digital_submissions(submission_id) ON DELETE CASCADE,
  old_status digital_submission_status,
  new_status digital_submission_status NOT NULL,
  changed_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  reason TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

16.6 Submission-to-resource publication mapping

CREATE TABLE digital_submission_publications (
  publication_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES digital_submissions(submission_id) ON DELETE CASCADE,
  material_id UUID REFERENCES catalog_materials(material_id) ON DELETE SET NULL,
  digital_resource_id UUID REFERENCES digital_resources(digital_resource_id) ON DELETE SET NULL,
  published_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

17. Notifications
CREATE TABLE library_notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(uuid) ON DELETE CASCADE,
  member_id UUID REFERENCES library_members(member_id) ON DELETE CASCADE,
  notification_type VARCHAR(80) NOT NULL, -- due_reminder, overdue, hold_ready, submission_reviewed
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  related_entity_type VARCHAR(80),
  related_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

18. Audit logs

-- You may already have this in your system. If not, add this:
CREATE TABLE library_audit_logs (
  audit_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(uuid) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

19. Helpful indexes

-- These improve performance.
CREATE INDEX idx_catalog_materials_title ON catalog_materials USING gin (to_tsvector('english', title));
CREATE INDEX idx_catalog_materials_keywords ON catalog_materials USING gin (keywords);
CREATE INDEX idx_material_copies_material_id ON material_copies(material_id);
CREATE INDEX idx_material_copies_status ON material_copies(status);
CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_copy_id ON loans(copy_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_hold_requests_member_id ON hold_requests(member_id);
CREATE INDEX idx_hold_requests_material_id ON hold_requests(material_id);
CREATE INDEX idx_fines_member_id ON fines(member_id);
CREATE INDEX idx_digital_resources_material_id ON digital_resources(material_id);
CREATE INDEX idx_digital_usage_logs_resource_id ON digital_usage_logs(digital_resource_id);
CREATE INDEX idx_digital_submissions_status ON digital_submissions(status);
CREATE INDEX idx_notifications_user_id ON library_notifications(user_id);
