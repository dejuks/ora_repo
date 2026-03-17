# ORA eBook Publishing role-by-role permissions

## 1. Author / Researcher
- ebook.dashboard.author
- ebook.submission.create
- ebook.submission.view
- ebook.submission.update
- ebook.submission.submit
- ebook.submission.resubmit
- ebook.workflow.view
- ebook.file.upload

## 2. Book Editor
- ebook.dashboard.editor
- ebook.submission.view
- ebook.workflow.view
- ebook.editor.screen
- ebook.reviewer.assign
- ebook.review.assignment.view
- ebook.decision.make
- ebook.publication.view

## 3. Peer Reviewer
- ebook.dashboard.reviewer
- ebook.workflow.view
- ebook.review.assignment.view
- ebook.review.respond
- ebook.review.submit

## 4. Digital Content Manager
- ebook.dashboard.production
- ebook.workflow.view
- ebook.file.upload
- ebook.production.manage
- ebook.production.metadata.manage
- ebook.publication.view
- ebook.publication.release
- ebook.publication.access.manage
- ebook.publication.analytics.view

## 5. Finance & Operations Officer
- ebook.dashboard.finance
- ebook.workflow.view
- ebook.finance.clear
- ebook.finance.waiver.manage

## 6. System Administrator
- all ebook.* permissions

## 7. Reader / Public User
- no authenticated app permission required for public catalog
- access controlled by `ebook_publications.access_level` and `embargo_until`
