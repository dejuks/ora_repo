# Separate Submission Detail Views (All Roles)

This package now includes a corrected `EbookSubmissionDetailPage.jsx` that renders the submission detail page differently depending on the logged-in role stored in `localStorage.user.roles`.

## Supported role views
- Author (`EBOOK_AUTHOR`)
- Editor (`EBOOK_EDITOR`, `BOOK_EDITOR`)
- Reviewer (`EBOOK_REVIEWER`, `PEER_REVIEWER`)
- Finance (`EBOOK_FINANCE`, `FINANCE_OFFICER`)
- Production / Digital Content Manager (`EBOOK_PRODUCTION`, `DIGITAL_CONTENT_MANAGER`, `CONTENT_MANAGER`)
- Admin (`EBOOK_ADMIN`, `ADMIN`, `SUPER_ADMIN`)

## What changed
- One detail page now adapts its content by role.
- Each role gets its own title, subtitle, back route, and visibility rules.
- Reviewer view hides other-reviewer/editor-private information.
- Finance view shows payment/BPC/invoice summary.
- Production view shows DOI/ISBN/publication readiness fields.
- Admin view keeps full audit visibility.
- Author view keeps continue-submit behavior for draft submissions.

## Main file
- `ebook/EbookSubmissionDetailPage.jsx`

## Notes for integration
If your router already points to the submission detail page, no new route is required. The page detects the role from the current logged-in user and switches the visible sections automatically.
