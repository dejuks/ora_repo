import React from 'react';
import MasterDataPage from './MasterDataPage';
import MainLayout from '../../../components/layout/MainLayout';
import { libraryApi } from '../../../api/library.api';

const loadFn = () => libraryApi.list('subjects');
const createFn = (payload) => libraryApi.create('subjects', payload);
const updateFn = (id, payload) => libraryApi.update('subjects', id, payload);
const deleteFn = (id) => libraryApi.remove('subjects', id);

export default function SubjectsPage() {
  return (
    <MainLayout>
      <MasterDataPage
        title="Subjects"
        loadFn={loadFn}
        createFn={createFn}
        updateFn={updateFn}
        deleteFn={deleteFn}
        idField="subject_id"
        nameField="name"
        descriptionField="description"
        extraFields={[
          { name: 'code', label: 'Code', type: 'text', defaultValue: '' },
          { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
        ]}
      />
    </MainLayout>
  );
}
