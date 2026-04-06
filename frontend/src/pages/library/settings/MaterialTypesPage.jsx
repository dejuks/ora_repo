import React from "react";
import MasterDataPage from "./MasterDataPage.jsx";

import {
  getMaterialTypes,
  createMaterialType,
  updateMaterialType,
  deleteMaterialType,
} from "../../../api/library.api";

export default function MaterialTypesPage() {
  return (
    <MasterDataPage
      title="Material Types"
      loadFn={getMaterialTypes}
      createFn={createMaterialType}
      updateFn={updateMaterialType}
      deleteFn={deleteMaterialType}
      idField="material_type_id"
      nameField="name"
      descriptionField="description"
      extraFields={[
        {
          name: "code",
          label: "Code",
          type: "text",
          required: true,
          defaultValue: "",
        },
        {
          name: "is_borrowable",
          label: "Borrowable",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "is_digital_allowed",
          label: "Digital Allowed",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "is_physical_allowed",
          label: "Physical Allowed",
          type: "checkbox",
          defaultValue: true,
        },
      ]}
    />
  );
}