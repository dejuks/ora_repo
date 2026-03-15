1) Digital Librarian

Should have

library.digital.resource.view

library.digital.resource.create

library.digital.resource.update

library.digital.resource.delete

library.digital.resource.submit

library.digital.resource.approve

library.digital.resource.reject

library.digital.resource.publish

library.digital.resource.metadata.manage

library.digital.file.upload

library.digital.file.view

library.digital.file.create

library.digital.file.update

library.digital.file.delete

library.digital.collection.manage

library.digital.access.manage

library.digital.accessrule.view

library.digital.accessrule.create

library.digital.accessrule.update

library.digital.accessrule.delete

library.digital.license.manage

library.digital.drm.manage

library.digital.usage.view

library.reports.digital.view

library.notification.view

Possible missing permissions

library.digital.resource.preview

library.digital.collection.view

library.digital.submission.view

library.digital.submission.review.approve

library.digital.submission.review.reject

library.digital.compliance.review

library.digital.quality.review

Reason: approval and compliance actions exist logically, but the permissions are spread across resource/review/publication tables rather than clear workflow permissions.

2) Member / User / Student

Should have

library.catalog.search

library.book.view

library.catalog.record.view

library.loan.request

library.loan.view.my

library.loan.renew.my

library.hold.create

library.hold.cancel.my

library.hold.view.my

library.fine.view.my

library.history.view.my

account.view.my

library.digital.resource.view

library.digital.resource.download

library.digital.usage.view.own

Possible missing permissions

account.update.my

library.notification.view.my

library.digital.resource.preview

library.digital.resource.read

library.member.profile.view.my

library.member.profile.update.my

Reason: members can view their account, but there is no self-update permission. Also there is no explicit preview/read permission for online reading.

3) Admin

Should have

users.create

users.view

users.update

users.delete

roles.create

roles.view

roles.update

roles.delete

permissions.view

permissions.assign

system.settings.view

system.settings.update

system.logs.view

system.backup.manage

system.security.manage

module.access.manage

library.auditlog.view

library.reports.system.view

library.notification.view

library.notification.create

library.notification.update

library.notification.delete

Possible missing permissions

system.backup.view

system.backup.restore

system.audit.security.view

system.audit.security.manage

system.user.session.manage

system.role.assign

system.permission.assign

Reason: admin tasks mention backups, security, and audit oversight, but the SQL only has broad manage permissions, not more precise restore/security-alert operations.

4) Content Uploader

Should have

library.digital.resource.view

library.digital.resource.create

library.digital.resource.update.own

library.digital.resource.submit

library.digital.metadata.create

library.digital.metadata.update.own

library.digital.file.upload

library.digital.file.replace.own

library.digital.submission.file.view

library.digital.submission.file.create

library.digital.submission.history.view

library.digital.usage.view.own

Possible missing permissions

library.digital.resource.view.own

library.digital.resource.delete.own

library.digital.submission.view.own

library.digital.submission.update.own

library.digital.submission.resubmit

library.digital.submission.withdraw.own

Reason: uploader workflow includes correction and resubmission, but there is no explicit resubmit permission in the SQL. That is one of the clearest missing permissions.

5) External Publisher

Should have

library.digital.package.upload

library.digital.license.manage

library.digital.drm.manage

library.digital.issue.update

library.digital.edition.update

maybe limited library.digital.resource.create

maybe limited library.digital.file.upload

Possible missing permissions

library.digital.package.view

library.digital.package.update

library.digital.package.delete

library.digital.package.submit

library.digital.package.history.view

library.digital.resource.create.external

library.digital.resource.update.external

library.digital.usage.report.view.external

Reason: external publisher workflow is under-modeled in the permission file. Upload is present, but package lifecycle permissions are missing.

6) Librarian

Should have

library.loan.create

library.loan.issue

library.loan.return

library.loan.renew

library.loan.view

library.hold.fulfill

library.hold.cancel

library.hold.view

library.fine.create

library.fine.collect

library.fine.waive

library.fine.view

library.fine.payment.create

library.fine.payment.view

library.fine.waiver.create

library.fine.waiver.view

member.assist

library.copy.view

library.inventory.update.basic

library.catalog.search

Possible missing permissions

library.purchase.request.view

library.purchase.request.update

library.member.note.create

library.member.note.view

library.member.issue.escalate

Reason: the librarian workflow includes patron purchase requests and issue escalation, but those permissions do not appear clearly in the SQL. Only library.purchase.request.create exists.

7) Library Manager

Should have

library.reports.view

library.reports.circulation.view

library.reports.inventory.view

library.reports.digital.view

library.policy.view

library.policy.update

staff.supervise

library.acquisition.request.view

library.acquisition.request.approve

library.acquisition.order.view

library.cataloging.job.view

library.inventory.audit.view

library.auditlog.view

Possible missing permissions

library.policy.create

library.policy.delete

library.budget.view

library.budget.update

library.staff.assignment.manage

library.dashboard.manager.view

Reason: manager responsibilities include policy setting and oversight, but policy only has view and update. No create/delete is defined.

8) Acquisition Officer

Should have

library.acquisition.request.create

library.acquisition.request.view

library.acquisition.order.create

library.acquisition.order.view

library.acquisition.order.update

library.acquisition.delivery.receive

library.acquisition.delivery.inspect

library.vendor.create

library.vendor.view

library.vendor.update

library.vendor.contact.manage

library.book.procurement.manage

library.purchase.tracking.view

library.purchase.request.create

library.purchase.order.item.create

library.purchase.order.item.view

library.purchase.order.item.update

library.acquisition.receipt.item.create

library.acquisition.receipt.item.view

library.acquisition.receipt.item.update

Possible missing permissions

library.acquisition.request.update

library.acquisition.request.delete

library.vendor.delete

library.vendor.performance.view

library.acquisition.receipt.create

library.acquisition.receipt.view

library.acquisition.receipt.update

Reason: there are receipt item permissions, but not clear receipt header permissions. That is a likely gap.

9) Cataloger

Should have

library.catalog.record.create

library.catalog.record.view

library.catalog.record.update

library.catalog.record.delete

library.catalog.classification.assign

library.catalog.callnumber.assign

library.catalog.subject.assign

library.catalog.metadata.manage

library.book.create

library.book.view

library.book.update

library.material.contributor.create

library.material.contributor.view

library.material.contributor.update

library.material.subject.create

library.material.subject.view

library.material.subject.update

library.copy.create

library.copy.view

library.copy.update

library.barcode.assign

library.rfid.assign

library.cataloging.job.view

library.cataloging.job.update

Possible missing permissions

library.catalog.ddc.suggest

library.catalog.lcc.suggest

library.barcode.generate

library.barcode.print

library.copy.status.update

library.catalog.edition.manage

Reason: your workflow includes classification tools and barcode generation, but the SQL only has assign-level permissions, not explicit generate/print/suggest permissions.

10) Inventory Manager

Should have

library.inventory.update.basic

library.inventory.audit.create

library.inventory.audit.view

library.inventory.audit.update

library.inventory.stocktake.manage

library.inventory.shelfreading.manage

library.inventory.missing.report

library.inventory.damaged.report

library.inventory.tag.manage

library.inventory.reconciliation.manage

library.inventory.audit.item.create

library.inventory.audit.item.view

library.inventory.audit.item.update

library.copy.view

library.copy.update

library.inventory.location.update

Possible missing permissions

library.inventory.report.view

library.inventory.audit.close

library.inventory.audit.delete

library.inventory.missing.resolve

library.inventory.damaged.resolve

library.inventory.tag.print

Reason: reporting and reconciliation are implied, but not all audit lifecycle and issue resolution permissions are explicit.

11) System Administrator

Should have

users.view

users.update

roles.view

permissions.view

module.access.manage

system.settings.view

system.settings.update

system.logs.view

system.backup.manage

system.security.manage

library.auditlog.view

Possible missing permissions

system.restore.manage

system.monitoring.view

system.integration.manage

system.health.view

system.cache.manage

system.job.manage