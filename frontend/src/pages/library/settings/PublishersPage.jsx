import React from "react";
import MasterDataPage from "./MasterDataPage.jsx";
import {
  getPublishers,
  createPublisher,
  updatePublisher,
  deletePublisher,
} from "../../../api/library.api";

export default function PublishersPage() {
  return (
    <MasterDataPage
      title="Publishers"
      loadFn={getPublishers}
      createFn={createPublisher}
      updateFn={updatePublisher}
      deleteFn={deletePublisher}
      idField="publisher_id"
      nameField="name"
      descriptionField="description"
    />
  );
}