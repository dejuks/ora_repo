import React from "react";
import ResourcePage from "../../../components/library/ResourcePage.jsx";

export default function DigitalMetadataPage() {
  return (
    <ResourcePage
      title="Digital Metadata"
      subtitle="Edit uploaded submission metadata before review and publication."
      resource="digital-submissions"
      idField="submission_id"
      columns={[
        { key: "title", label: "Title" },
        { key: "publication_year", label: "Year" },
        { key: "access_level", label: "Access" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "title", label: "Title" },
        { name: "subtitle", label: "Subtitle" },
        { name: "abstract", label: "Abstract", type: "textarea" },
        { name: "publication_year", label: "Publication Year", type: "number" },
        { name: "isbn", label: "ISBN" },
        { name: "issn", label: "ISSN" },
        { name: "access_level", label: "Access Level", type: "select", options: [{id:'public',name:'Public'},{id:'registered_users',name:'Registered Users'},{id:'students_only',name:'Students Only'},{id:'staff_only',name:'Staff Only'},{id:'restricted',name:'Restricted'}], valueKey:'id', labelKey:'name' },
        { name: "status", label: "Status", type: "select", options: [{id:'draft',name:'Draft'},{id:'submitted',name:'Submitted'},{id:'under_review',name:'Under Review'},{id:'correction_requested',name:'Correction Requested'},{id:'approved',name:'Approved'},{id:'rejected',name:'Rejected'}], valueKey:'id', labelKey:'name' },
      ]}
    />
  );
}
