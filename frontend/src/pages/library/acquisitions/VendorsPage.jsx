import React from "react";
import ResourcePage from "../../../components/library/ResourcePage.jsx";

export default function VendorsPage() {
  return (
    <ResourcePage
      title="Vendors"
      subtitle="Maintain approved suppliers and procurement contacts."
      resource="vendors"
      idField="vendor_id"
      columns={[
        { key: "name", label: "Vendor" },
        { key: "contact_person", label: "Contact" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "is_active", label: "Active", render: (row) => (row.is_active ? 'Yes' : 'No') },
      ]}
      fields={[
        { name: "name", label: "Vendor Name" },
        { name: "contact_person", label: "Contact Person" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone" },
        { name: "address", label: "Address", type: "textarea" },
        { name: "website", label: "Website" },
        { name: "tax_id", label: "Tax ID" },
        { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
      ]}
    />
  );
}
