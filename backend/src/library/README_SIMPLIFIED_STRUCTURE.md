Simplified Library Module Structure

library/
 ├── controllers/
 │    ├── physicalLibrary.controller.js
 │    └── digitalLibrary.controller.js
 │
 ├── models/
 │    ├── base.model.js
 │    ├── physicalLibrary.model.js
 │    └── digitalLibrary.model.js
 │
 ├── services/
 │    ├── physicalLibrary.service.js
 │    └── digitalLibrary.service.js
 │
 ├── validation/
 │    ├── physicalLibrary.validation.js
 │    └── digitalLibrary.validation.js
 │
 ├── utils/
 │    └── responseFormatter.js
 │
 ├── middleware/
 │    └── validateRequest.js
 │
 └── routes/
      ├── physicalLibrary.routes.js
      ├── digitalLibrary.routes.js
      └── library.routes.js

Physical library now handles:
- material CRUD
- copy CRUD
- borrow / return / renew
- holds
- fines
- missing / damaged reporting
- inventory audit start
- acquisition receiving
- usage & inventory reports

Digital library now handles:
- material CRUD
- resource file management during create/update
- submit / approve / reject / publish / unpublish
- access rights
- license / DRM settings
- usage tracking
- usage reports
