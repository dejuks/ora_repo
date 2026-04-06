import React from "react";
import ResourcePage from "../../../components/library/ResourcePage.jsx";

const contributorTypes = [
  { id: "author", name: "Author" },
  { id: "editor", name: "Editor" },
  { id: "translator", name: "Translator" },
  { id: "publisher", name: "Publisher Representative" },
  { id: "institution", name: "Institution" },
  { id: "other", name: "Other" },
];

export default function ContributorsPage() {
  return (
    <ResourcePage
      title="Contributors"
      subtitle="Maintain authors, editors, translators, institutions, and other contributors."
      resource="contributors"
      idField="contributor_id"
      columns={[
        { key: "full_name", label: "Full Name" },
        { key: "organization_name", label: "Organization" },
        { key: "contributor_type", label: "Type" },
        { key: "email", label: "Email" },
        { key: "orcid", label: "ORCID" },
      ]}
      fields={[
        { name: "full_name", label: "Full Name" },
        { name: "organization_name", label: "Organization" },
        { name: "contributor_type", label: "Contributor Type", type: "select", options: contributorTypes },
        { name: "email", label: "Email", type: "email" },
        { name: "orcid", label: "ORCID" },
        { name: "bio", label: "Biography / Notes", type: "textarea" },
      ]}
    />
  );
}
