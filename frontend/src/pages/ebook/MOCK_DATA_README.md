# ORA eBook mock-data package

This folder was updated to use local mock data only inside `src/pages/ebook`.

What was changed:
- Replaced `ebookApi` imports with `./mock/ebookMockApi.js` in the eBook pages.
- Added workflow-based mock data covering the 9 ORA eBook Publishing steps.
- Cleaned the package by excluding `__MACOSX` files from the new zip.

What was not changed here:
- Global login page files outside `src/pages/ebook`
- Global sidebar/menu files outside `src/pages/ebook`

Those files were not included in the uploaded folder zip.
