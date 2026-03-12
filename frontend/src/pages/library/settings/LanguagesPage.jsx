import React from "react";
import MasterDataPage from "./MasterDataPage";
import {
  getLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from "../../../api/library.api";

export default function LanguagesPage() {
  return (
    <MasterDataPage
      title="Languages"
      loadFn={getLanguages}
      createFn={createLanguage}
      updateFn={updateLanguage}
      deleteFn={deleteLanguage}
      idField="language_id"
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
      ]}
    />
  );
}