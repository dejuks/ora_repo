INSERT INTO permissions (name, module_group) VALUES
-- ===============================
-- LIBRARY STRUCTURE / MASTER DATA
-- ===============================
('library.branch.create', 'Library Management'),
('library.branch.view', 'Library Management'),
('library.branch.update', 'Library Management'),
('library.branch.delete', 'Library Management'),

('library.location.create', 'Library Management'),
('library.location.view', 'Library Management'),
('library.location.update', 'Library Management'),
('library.location.delete', 'Library Management'),

('library.materialtype.create', 'Library Management'),
('library.materialtype.view', 'Library Management'),
('library.materialtype.update', 'Library Management'),
('library.materialtype.delete', 'Library Management'),

('library.language.create', 'Library Management'),
('library.language.view', 'Library Management'),
('library.language.update', 'Library Management'),
('library.language.delete', 'Library Management'),

('library.publisher.create', 'Library Management'),
('library.publisher.view', 'Library Management'),
('library.publisher.update', 'Library Management'),
('library.publisher.delete', 'Library Management'),

('library.contributor.create', 'Library Management'),
('library.contributor.view', 'Library Management'),
('library.contributor.update', 'Library Management'),
('library.contributor.delete', 'Library Management'),

('library.membertype.create', 'Library Management'),
('library.membertype.view', 'Library Management'),
('library.membertype.update', 'Library Management'),
('library.membertype.delete', 'Library Management'),

('library.member.create', 'Library Management'),
('library.member.view', 'Library Management'),
('library.member.update', 'Library Management'),
('library.member.delete', 'Library Management'),

('library.member.status.view', 'Library Management'),
('library.member.status.create', 'Library Management'),
('library.member.status.update', 'Library Management'),
('library.member.status.delete', 'Library Management'),

-- ===============================
-- CATALOG
-- ===============================
('library.catalog.search', 'Library Management'),
('library.catalog.record.create', 'Library Management'),
('library.catalog.record.view', 'Library Management'),
('library.catalog.record.update', 'Library Management'),
('library.catalog.record.delete', 'Library Management'),
('library.catalog.classification.assign', 'Library Management'),
('library.catalog.callnumber.assign', 'Library Management'),
('library.catalog.subject.assign', 'Library Management'),
('library.catalog.metadata.manage', 'Library Management'),

('library.book.create', 'Library Management'),
('library.book.view', 'Library Management'),
('library.book.update', 'Library Management'),
('library.book.delete', 'Library Management'),

('library.material.contributor.create', 'Library Management'),
('library.material.contributor.view', 'Library Management'),
('library.material.contributor.update', 'Library Management'),
('library.material.contributor.delete', 'Library Management'),

('library.material.subject.create', 'Library Management'),
('library.material.subject.view', 'Library Management'),
('library.material.subject.update', 'Library Management'),
('library.material.subject.delete', 'Library Management'),

-- ===============================
-- COPIES / INVENTORY BASICS
-- ===============================
('library.copy.create', 'Library Management'),
('library.copy.view', 'Library Management'),
('library.copy.update', 'Library Management'),
('library.copy.delete', 'Library Management'),
('library.barcode.assign', 'Library Management'),
('library.rfid.assign', 'Library Management'),
('library.inventory.location.update', 'Library Management'),

-- ===============================
-- LOAN / CIRCULATION
-- ===============================
('library.loan.request', 'Library Management'),
('library.loan.create', 'Library Management'),
('library.loan.issue', 'Library Management'),
('library.loan.return', 'Library Management'),
('library.loan.renew', 'Library Management'),
('library.loan.view', 'Library Management'),
('library.loan.view.my', 'Library Management'),
('library.loan.renew.my', 'Library Management'),

('library.loan.renewal.create', 'Library Management'),
('library.loan.renewal.view', 'Library Management'),
('library.loan.renewal.update', 'Library Management'),
('library.loan.renewal.delete', 'Library Management'),

('library.hold.create', 'Library Management'),
('library.hold.fulfill', 'Library Management'),
('library.hold.cancel', 'Library Management'),
('library.hold.cancel.my', 'Library Management'),
('library.hold.view', 'Library Management'),
('library.hold.view.my', 'Library Management'),

('library.fine.create', 'Library Management'),
('library.fine.collect', 'Library Management'),
('library.fine.waive', 'Library Management'),
('library.fine.view', 'Library Management'),
('library.fine.view.my', 'Library Management'),
('library.history.view.my', 'Library Management'),

('library.fine.payment.create', 'Library Management'),
('library.fine.payment.view', 'Library Management'),
('library.fine.payment.update', 'Library Management'),
('library.fine.payment.delete', 'Library Management'),

('library.fine.waiver.create', 'Library Management'),
('library.fine.waiver.view', 'Library Management'),
('library.fine.waiver.update', 'Library Management'),
('library.fine.waiver.delete', 'Library Management'),

-- ===============================
-- DIGITAL LIBRARY
-- ===============================
('library.digital.resource.view', 'Library Management'),
('library.digital.resource.create', 'Library Management'),
('library.digital.resource.update', 'Library Management'),
('library.digital.resource.update.own', 'Library Management'),
('library.digital.resource.delete', 'Library Management'),
('library.digital.resource.submit', 'Library Management'),
('library.digital.resource.approve', 'Library Management'),
('library.digital.resource.reject', 'Library Management'),
('library.digital.resource.publish', 'Library Management'),
('library.digital.resource.download', 'Library Management'),
('library.digital.resource.metadata.manage', 'Library Management'),

('library.digital.metadata.create', 'Library Management'),
('library.digital.metadata.update.own', 'Library Management'),

('library.digital.file.upload', 'Library Management'),
('library.digital.file.replace.own', 'Library Management'),
('library.digital.file.view', 'Library Management'),
('library.digital.file.create', 'Library Management'),
('library.digital.file.update', 'Library Management'),
('library.digital.file.delete', 'Library Management'),

('library.digital.collection.manage', 'Library Management'),
('library.digital.access.manage', 'Library Management'),
('library.digital.license.manage', 'Library Management'),
('library.digital.drm.manage', 'Library Management'),
('library.digital.issue.update', 'Library Management'),
('library.digital.edition.update', 'Library Management'),
('library.digital.package.upload', 'Library Management'),
('library.digital.usage.view', 'Library Management'),
('library.digital.usage.view.own', 'Library Management'),

('library.digital.accessrule.view', 'Library Management'),
('library.digital.accessrule.create', 'Library Management'),
('library.digital.accessrule.update', 'Library Management'),
('library.digital.accessrule.delete', 'Library Management'),

('library.digital.submission.file.view', 'Library Management'),
('library.digital.submission.file.create', 'Library Management'),
('library.digital.submission.file.update', 'Library Management'),
('library.digital.submission.file.delete', 'Library Management'),

('library.digital.submission.review.view', 'Library Management'),
('library.digital.submission.review.create', 'Library Management'),
('library.digital.submission.review.update', 'Library Management'),
('library.digital.submission.review.delete', 'Library Management'),

('library.digital.submission.history.view', 'Library Management'),
('library.digital.submission.history.create', 'Library Management'),
('library.digital.submission.history.update', 'Library Management'),
('library.digital.submission.history.delete', 'Library Management'),

('library.digital.submission.publication.view', 'Library Management'),
('library.digital.submission.publication.create', 'Library Management'),
('library.digital.submission.publication.update', 'Library Management'),
('library.digital.submission.publication.delete', 'Library Management'),

-- ===============================
-- ACQUISITION
-- ===============================
('library.acquisition.request.create', 'Library Management'),
('library.acquisition.request.view', 'Library Management'),
('library.acquisition.request.approve', 'Library Management'),

('library.acquisition.order.create', 'Library Management'),
('library.acquisition.order.view', 'Library Management'),
('library.acquisition.order.update', 'Library Management'),

('library.acquisition.delivery.receive', 'Library Management'),
('library.acquisition.delivery.inspect', 'Library Management'),

('library.vendor.create', 'Library Management'),
('library.vendor.view', 'Library Management'),
('library.vendor.update', 'Library Management'),
('library.vendor.contact.manage', 'Library Management'),

('library.book.procurement.manage', 'Library Management'),
('library.purchase.tracking.view', 'Library Management'),
('library.purchase.request.create', 'Library Management'),

('library.purchase.order.item.create', 'Library Management'),
('library.purchase.order.item.view', 'Library Management'),
('library.purchase.order.item.update', 'Library Management'),
('library.purchase.order.item.delete', 'Library Management'),

('library.acquisition.receipt.item.create', 'Library Management'),
('library.acquisition.receipt.item.view', 'Library Management'),
('library.acquisition.receipt.item.update', 'Library Management'),
('library.acquisition.receipt.item.delete', 'Library Management'),

('library.cataloging.job.create', 'Library Management'),
('library.cataloging.job.view', 'Library Management'),
('library.cataloging.job.update', 'Library Management'),
('library.cataloging.job.delete', 'Library Management'),

-- ===============================
-- INVENTORY
-- ===============================
('library.inventory.update.basic', 'Library Management'),
('library.inventory.audit.create', 'Library Management'),
('library.inventory.audit.view', 'Library Management'),
('library.inventory.audit.update', 'Library Management'),
('library.inventory.stocktake.manage', 'Library Management'),
('library.inventory.shelfreading.manage', 'Library Management'),
('library.inventory.missing.report', 'Library Management'),
('library.inventory.damaged.report', 'Library Management'),
('library.inventory.tag.manage', 'Library Management'),
('library.inventory.reconciliation.manage', 'Library Management'),

('library.inventory.audit.item.create', 'Library Management'),
('library.inventory.audit.item.view', 'Library Management'),
('library.inventory.audit.item.update', 'Library Management'),
('library.inventory.audit.item.delete', 'Library Management'),

-- ===============================
-- NOTIFICATIONS / AUDIT / REPORTS / POLICY
-- ===============================
('library.notification.view', 'Library Management'),
('library.notification.create', 'Library Management'),
('library.notification.update', 'Library Management'),
('library.notification.delete', 'Library Management'),

('library.auditlog.view', 'Library Management'),

('library.reports.view', 'Library Management'),
('library.reports.system.view', 'Library Management'),
('library.reports.digital.view', 'Library Management'),
('library.reports.circulation.view', 'Library Management'),
('library.reports.inventory.view', 'Library Management'),

('library.policy.view', 'Library Management'),
('library.policy.update', 'Library Management'),

-- ===============================
-- LIBRARY ADMIN SUPPORT
-- ===============================
('users.create', 'Library Management'),
('users.view', 'Library Management'),
('users.update', 'Library Management'),
('users.delete', 'Library Management'),

('roles.create', 'Library Management'),
('roles.view', 'Library Management'),
('roles.update', 'Library Management'),
('roles.delete', 'Library Management'),

('permissions.view', 'Library Management'),
('permissions.assign', 'Library Management'),

('system.settings.view', 'Library Management'),
('system.settings.update', 'Library Management'),
('system.logs.view', 'Library Management'),
('system.backup.manage', 'Library Management'),
('system.security.manage', 'Library Management'),
('module.access.manage', 'Library Management'),
('staff.supervise', 'Library Management'),
('member.assist', 'Library Management'),
('account.view.my', 'Library Management')

ON CONFLICT (name) DO NOTHING;