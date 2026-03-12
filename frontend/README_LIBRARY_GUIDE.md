# ORA Library Module Patch

This ZIP contains only the **library-related code** extracted from your uploaded backend and frontend, plus the files you need to wire it in.

## Included

### Backend
- `backend/src/library/` — library module controllers, routes, services, middleware, SQL
- `backend/src/server.js` — main server file so you can compare route mounting

### Frontend
- `frontend/src/pages/library/` — library pages
- `frontend/src/api/library.api.js` — library API client
- `frontend/src/App.js` — route wiring reference

## How to use

1. Extract this ZIP.
2. Copy `backend/src/library` into your backend project under `src/library`.
3. Compare `backend/src/server.js` with your current server and make sure library routes are mounted.
4. Copy `frontend/src/pages/library` into your frontend project under `src/pages/library`.
5. Copy `frontend/src/api/library.api.js` into `src/api/`.
6. Compare `frontend/src/App.js` with your current `App.js` and add the library routes.
7. Run the SQL files in `backend/src/library/sql/`.
8. Seed the library permissions from `ora_library_seed_permissions.sql`.

## What is covered

### Digital library actors
- Digital Librarian
- Member / Student
- Admin
- Content Uploader
- External Publisher (generic flow only)

### Physical library actors
- Librarian
- Library Manager (basic reporting / oversight)
- Cataloger (book metadata and copy setup)
- Inventory Manager (partial)
- Member / Library User
- System Administrator

## Notes
- This is a **library-only patch**, not the full application.
- It is much smaller than the full backend/frontend ZIPs, so it should download correctly.
- Some workflows are partial and may still need role/permission tuning in your live project.



ACQUISITION_OFFICER
CATALOGER
CONTENT_UPLOADER
INVENTORY_MANAGER
LIBRARIAN
LIBRARY_ADMIN
LIBRARY_MANAGER
LIBRARY_MEMBER

Below is the complete action + permission structure for each role according to your ORA Library logic.

1. LIBRARY_ADMIN
Description

Controls the entire library system configuration.

Actions

Create users

Assign roles

Manage permissions

Configure system

Manage backups

Monitor logs

Approve digital content

Permissions
users.create
users.update
users.delete
users.view

roles.create
roles.update
roles.delete
roles.view

permissions.create
permissions.assign
permissions.view

system.settings.update
system.logs.view
system.backup.manage

digital.resource.approve
digital.resource.reject
2. LIBRARY_MANAGER
Description

Supervises library operations and policies.

Actions

Monitor reports

Approve acquisitions

Manage catalog policies

Manage circulation policies

Oversee inventory

Permissions
reports.view
reports.inventory
reports.circulation
reports.digital

library.policy.update

book.view
book.create
book.update

acquisition.view
acquisition.approve

inventory.audit.view
3. LIBRARIAN
Description

Handles daily circulation operations.

Actions

Issue books

Accept returns

Renew books

Manage holds

Manage fines

Assist users

Permissions
book.view
copy.view

loan.create
loan.return
loan.renew
loan.view

hold.create
hold.cancel
hold.fulfill
hold.view

fine.create
fine.collect
fine.view
fine.waive
4. CATALOGER
Description

Responsible for cataloging books and materials.

Actions

Create catalog records

Update metadata

Assign call numbers

Assign barcodes

Manage book information

Permissions
book.create
book.update
book.view

catalog.metadata.create
catalog.metadata.update

copy.create
copy.update
copy.view
5. ACQUISITION_OFFICER
Description

Handles book procurement and vendor relations.

Actions

Identify books

Create purchase requests

Order books

Receive deliveries

Manage vendors

Permissions
acquisition.request.create
acquisition.request.view

acquisition.order.create
acquisition.order.view

acquisition.delivery.receive

vendor.create
vendor.view
vendor.update
6. INVENTORY_MANAGER
Description

Maintains physical inventory and audits.

Actions

Conduct stock audits

Manage RFID/barcodes

Track missing books

Track damaged books

Permissions
copy.view
copy.update

inventory.audit.create
inventory.audit.view

inventory.damage.report
inventory.missing.report

inventory.tag.manage
7. CONTENT_UPLOADER
Description

Uploads digital resources.

Actions

Upload ebooks

Upload research papers

Enter metadata

Submit for approval

Permissions
digital.resource.create
digital.resource.update
digital.resource.submit
digital.resource.view
8. LIBRARY_MEMBER
Description

Library user (student, staff, researcher).

Actions

Search catalog

Borrow books

Return books

Renew books

Reserve books

Download digital resources

View history

Permissions
catalog.search

book.view
digital.resource.view
digital.resource.download

loan.create
loan.renew
loan.view.my

hold.create
hold.cancel
hold.view.my

fine.view.my
Full Permission List (Recommended)

Your system should contain around 55 permissions:

catalog.search

book.create
book.update
book.view

copy.create
copy.update
copy.view

loan.create
loan.return
loan.renew
loan.view
loan.view.my

hold.create
hold.cancel
hold.fulfill
hold.view
hold.view.my

fine.create
fine.collect
fine.view
fine.view.my
fine.waive

digital.resource.create
digital.resource.update
digital.resource.submit
digital.resource.view
digital.resource.download
digital.resource.approve
digital.resource.reject

inventory.audit.create
inventory.audit.view
inventory.damage.report
inventory.missing.report
inventory.tag.manage

acquisition.request.create
acquisition.request.view
acquisition.order.create
acquisition.order.view
acquisition.delivery.receive

vendor.create
vendor.view
vendor.update

reports.view
reports.inventory
reports.circulation
reports.digital

library.policy.update

users.create
users.update
users.delete
users.view

roles.create
roles.update
roles.delete
roles.view

permissions.create
permissions.assign
permissions.view

system.settings.update
system.logs.view
system.backup.manage
Recommended Role Hierarchy
LIBRARY_ADMIN
        ↓
LIBRARY_MANAGER
        ↓
LIBRARIAN
        ↓
CATALOGER / INVENTORY_MANAGER / ACQUISITION_OFFICER
        ↓
CONTENT_UPLOADER
        ↓
LIBRARY_MEMBER