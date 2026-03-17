import React from "react";
import MasterDataPage from "./MasterDataPage";
import {
  getLibraryCategories,
  createLibraryCategory,
  updateLibraryCategory,
  deleteLibraryCategory,
} from "../../../api/library.api";

export default function CategoriesPage() {
  return (
    <MasterDataPage
      title="Categories"
      loadFn={getLibraryCategories}
      createFn={createLibraryCategory}
      updateFn={updateLibraryCategory}
      deleteFn={deleteLibraryCategory}
      idField="category_id"
      nameField="name"
      descriptionField="description"
    />
  );
}