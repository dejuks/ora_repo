import React from "react";
import EbookAuthorStageListPage from "./EbookAuthorStageListPage.jsx";

export default function EbookAuthorMySubmissionsPage({ stage = "all" }) {
  return <EbookAuthorStageListPage stage={stage} />;
}