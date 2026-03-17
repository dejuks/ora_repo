import React from "react";
import MasterDataPage from "./MasterDataPage";
import {
  getLibraryBranches,
  createLibraryBranch,
  updateLibraryBranch,
  deleteLibraryBranch,
} from "../../../api/library.api";

export default function BranchesPage() {
  return (
    <MasterDataPage
      title="Library Branches"
      loadFn={getLibraryBranches}
      createFn={createLibraryBranch}
      updateFn={updateLibraryBranch}
      deleteFn={deleteLibraryBranch}
      idField="branch_id"
      nameField="name"
      descriptionField="description"
      extraFields={[
        { name: "code", label: "Code", type: "text", required: true, defaultValue: "" },
        { name: "address", label: "Address", type: "text", defaultValue: "" },
        { name: "phone", label: "Phone", type: "text", defaultValue: "" },
        { name: "email", label: "Email", type: "email", defaultValue: "" },
        { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
      ]}
    />
  );
}
