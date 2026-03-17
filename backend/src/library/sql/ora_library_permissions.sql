
-- ORA Library Management System
-- Missing permissions + role-by-role permission assignment seed

BEGIN;

INSERT INTO permissions (name, module_group) VALUES
('library.digital.resource.preview', 'Library Management'),
('library.digital.resource.read', 'Library Management'),
('library.digital.collection.view', 'Library Management'),
('library.digital.submission.view', 'Library Management'),
('library.digital.submission.view.own', 'Library Management'),
('library.digital.submission.update.own', 'Library Management'),
('library.digital.submission.resubmit', 'Library Management'),
('library.digital.submission.withdraw.own', 'Library Management'),
('library.digital.package.view', 'Library Management'),
('library.digital.package.update', 'Library Management'),
('library.digital.package.delete', 'Library Management'),
('account.update.my', 'Library Management'),
('system.backup.view', 'Library Management'),
('system.backup.restore', 'Library Management'),
('system.monitoring.view', 'Library Management'),
('library.policy.create', 'Library Management'),
('library.policy.delete', 'Library Management'),
('library.barcode.generate', 'Library Management'),
('library.barcode.print', 'Library Management'),
('library.inventory.report.view', 'Library Management'),
('library.inventory.audit.close', 'Library Management'),
('library.inventory.missing.resolve', 'Library Management'),
('library.inventory.damaged.resolve', 'Library Management')
ON CONFLICT (name) DO NOTHING;

COMMIT;
