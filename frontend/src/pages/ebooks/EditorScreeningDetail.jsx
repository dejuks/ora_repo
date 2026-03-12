import React from "react";

// This file exists for backward compatibility.
// App.js routes to /editor/screening/:id expecting EditorScreeningDetail.
// We reuse the existing ManuscriptDetail page which already loads the ebook by :id.

import ManuscriptDetail from "./ManuscriptDetail";

export default function EditorScreeningDetail() {
  return <ManuscriptDetail />;
}
