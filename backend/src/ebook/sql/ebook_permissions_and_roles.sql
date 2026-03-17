-- eBook Publishing permissions
-- Module group: eBook Publishing

INSERT INTO permissions (name, module_group) VALUES
('ebook.dashboard.author', 'eBook Publishing'),
('ebook.dashboard.editor', 'eBook Publishing'),
('ebook.dashboard.reviewer', 'eBook Publishing'),
('ebook.dashboard.finance', 'eBook Publishing'),
('ebook.dashboard.production', 'eBook Publishing'),
('ebook.submission.create', 'eBook Publishing'),
('ebook.submission.view', 'eBook Publishing'),
('ebook.submission.update', 'eBook Publishing'),
('ebook.submission.delete', 'eBook Publishing'),
('ebook.submission.submit', 'eBook Publishing'),
('ebook.submission.resubmit', 'eBook Publishing'),
('ebook.workflow.view', 'eBook Publishing'),
('ebook.file.upload', 'eBook Publishing'),
('ebook.editor.screen', 'eBook Publishing'),
('ebook.reviewer.assign', 'eBook Publishing'),
('ebook.review.assignment.view', 'eBook Publishing'),
('ebook.review.respond', 'eBook Publishing'),
('ebook.review.submit', 'eBook Publishing'),
('ebook.decision.make', 'eBook Publishing'),
('ebook.finance.clear', 'eBook Publishing'),
('ebook.finance.waiver.manage', 'eBook Publishing'),
('ebook.production.manage', 'eBook Publishing'),
('ebook.production.metadata.manage', 'eBook Publishing'),
('ebook.publication.view', 'eBook Publishing'),
('ebook.publication.release', 'eBook Publishing'),
('ebook.publication.access.manage', 'eBook Publishing'),
('ebook.publication.analytics.view', 'eBook Publishing'),
('ebook.user.manage', 'eBook Publishing'),
('ebook.settings.manage', 'eBook Publishing')
ON CONFLICT DO NOTHING;

-- Suggested role-by-role permission mapping.
-- Adjust role names if your roles table stores different names.

WITH role_permissions(role_name, permission_name) AS (
  VALUES
  -- Author / Researcher
  ('EBOOK_AUTHOR', 'ebook.dashboard.author'),
  ('EBOOK_AUTHOR', 'ebook.submission.create'),
  ('EBOOK_AUTHOR', 'ebook.submission.view'),
  ('EBOOK_AUTHOR', 'ebook.submission.update'),
  ('EBOOK_AUTHOR', 'ebook.submission.submit'),
  ('EBOOK_AUTHOR', 'ebook.submission.resubmit'),
  ('EBOOK_AUTHOR', 'ebook.workflow.view'),
  ('EBOOK_AUTHOR', 'ebook.file.upload'),

  -- Book Editor
  ('EBOOK_EDITOR', 'ebook.dashboard.editor'),
  ('EBOOK_EDITOR', 'ebook.submission.view'),
  ('EBOOK_EDITOR', 'ebook.workflow.view'),
  ('EBOOK_EDITOR', 'ebook.editor.screen'),
  ('EBOOK_EDITOR', 'ebook.reviewer.assign'),
  ('EBOOK_EDITOR', 'ebook.review.assignment.view'),
  ('EBOOK_EDITOR', 'ebook.decision.make'),
  ('EBOOK_EDITOR', 'ebook.publication.view'),

  -- Peer Reviewer
  ('EBOOK_REVIEWER', 'ebook.dashboard.reviewer'),
  ('EBOOK_REVIEWER', 'ebook.workflow.view'),
  ('EBOOK_REVIEWER', 'ebook.review.assignment.view'),
  ('EBOOK_REVIEWER', 'ebook.review.respond'),
  ('EBOOK_REVIEWER', 'ebook.review.submit'),

  -- Digital Content Manager
  ('EBOOK_DIGITAL_CONTENT_MANAGER', 'ebook.dashboard.production'),
  ('EBOOK_DIGITAL_CONTENT_MANAGER', 'ebook.workflow.view'),
  ('EBOOK_DIGITAL_CONTENT_MANAGER', 'ebook.file.upload'),
  ('EBOOK_DIGITAL_CONTENT_MANAGER', 'ebook.production.manage'),
  ('EBOOK_DIGITAL_CONTENT_MANAGER', 'ebook.production.metadata.manage'),
  ('EBOOK_DIGITAL_CONTENT_MANAGER', 'ebook.publication.view'),
  ('EBOOK_DIGITAL_CONTENT_MANAGER', 'ebook.publication.release'),
  ('EBOOK_DIGITAL_CONTENT_MANAGER', 'ebook.publication.access.manage'),
  ('EBOOK_DIGITAL_CONTENT_MANAGER', 'ebook.publication.analytics.view'),

  -- Finance & Operations Officer
  ('EBOOK_FINANCE_OFFICER', 'ebook.dashboard.finance'),
  ('EBOOK_FINANCE_OFFICER', 'ebook.workflow.view'),
  ('EBOOK_FINANCE_OFFICER', 'ebook.finance.clear'),
  ('EBOOK_FINANCE_OFFICER', 'ebook.finance.waiver.manage'),

  -- System Administrator
  ('EBOOK_ADMIN', 'ebook.dashboard.author'),
  ('EBOOK_ADMIN', 'ebook.dashboard.editor'),
  ('EBOOK_ADMIN', 'ebook.dashboard.reviewer'),
  ('EBOOK_ADMIN', 'ebook.dashboard.finance'),
  ('EBOOK_ADMIN', 'ebook.dashboard.production'),
  ('EBOOK_ADMIN', 'ebook.submission.create'),
  ('EBOOK_ADMIN', 'ebook.submission.view'),
  ('EBOOK_ADMIN', 'ebook.submission.update'),
  ('EBOOK_ADMIN', 'ebook.submission.delete'),
  ('EBOOK_ADMIN', 'ebook.submission.submit'),
  ('EBOOK_ADMIN', 'ebook.submission.resubmit'),
  ('EBOOK_ADMIN', 'ebook.workflow.view'),
  ('EBOOK_ADMIN', 'ebook.file.upload'),
  ('EBOOK_ADMIN', 'ebook.editor.screen'),
  ('EBOOK_ADMIN', 'ebook.reviewer.assign'),
  ('EBOOK_ADMIN', 'ebook.review.assignment.view'),
  ('EBOOK_ADMIN', 'ebook.review.respond'),
  ('EBOOK_ADMIN', 'ebook.review.submit'),
  ('EBOOK_ADMIN', 'ebook.decision.make'),
  ('EBOOK_ADMIN', 'ebook.finance.clear'),
  ('EBOOK_ADMIN', 'ebook.finance.waiver.manage'),
  ('EBOOK_ADMIN', 'ebook.production.manage'),
  ('EBOOK_ADMIN', 'ebook.production.metadata.manage'),
  ('EBOOK_ADMIN', 'ebook.publication.view'),
  ('EBOOK_ADMIN', 'ebook.publication.release'),
  ('EBOOK_ADMIN', 'ebook.publication.access.manage'),
  ('EBOOK_ADMIN', 'ebook.publication.analytics.view'),
  ('EBOOK_ADMIN', 'ebook.user.manage'),
  ('EBOOK_ADMIN', 'ebook.settings.manage')
)
INSERT INTO role_permissions (role_uuid, permission_uuid)
SELECT DISTINCT r.uuid, p.uuid
FROM role_permissions rp
JOIN roles r ON UPPER(REPLACE(r.name, ' ', '_')) = rp.role_name
JOIN permissions p ON p.name = rp.permission_name
ON CONFLICT DO NOTHING;
