import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import CrudModal from '../shared/CrudModal';
import libraryApi from '../../../api/library.api';
import { getRows } from '../shared/libraryHelpers';

const contributorRoleOptions = [
  { id: 'author', name: 'Author' },
  { id: 'editor', name: 'Editor' },
  { id: 'translator', name: 'Translator' },
  { id: 'compiler', name: 'Compiler' },
  { id: 'reviewer', name: 'Reviewer' },
];

export default function CatalogMetadataPage() {
  const [materials, setMaterials] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [materialContributors, setMaterialContributors] = useState([]);
  const [materialSubjects, setMaterialSubjects] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [contributorForm, setContributorForm] = useState({ contributor_id: '', role_name: 'author', sequence_no: 1 });
  const [subjectForm, setSubjectForm] = useState({ subject_id: '' });
  const [contributorModalOpen, setContributorModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [materialsRes, contributorsRes, subjectsRes, materialContributorsRes, materialSubjectsRes] = await Promise.all([
        libraryApi.list('materials', { limit: 500 }),
        libraryApi.list('contributors', { limit: 500 }),
        libraryApi.list('subjects', { limit: 500 }),
        libraryApi.list('material-contributors', { limit: 1000 }),
        libraryApi.list('material-subjects', { limit: 1000 }),
      ]);
      const materialRows = getRows(materialsRes);
      setMaterials(materialRows);
      setContributors(getRows(contributorsRes));
      setSubjects(getRows(subjectsRes));
      setMaterialContributors(getRows(materialContributorsRes));
      setMaterialSubjects(getRows(materialSubjectsRes));
      if (!selectedMaterialId && materialRows[0]?.material_id) setSelectedMaterialId(materialRows[0].material_id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load catalog metadata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const materialMap = useMemo(() => Object.fromEntries(materials.map((row) => [row.material_id, row])), [materials]);
  const contributorMap = useMemo(() => Object.fromEntries(contributors.map((row) => [row.contributor_id, row])), [contributors]);
  const subjectMap = useMemo(() => Object.fromEntries(subjects.map((row) => [row.subject_id, row])), [subjects]);

  const selectedContributors = useMemo(
    () => materialContributors.filter((row) => row.material_id === selectedMaterialId).sort((a, b) => Number(a.sequence_no || 0) - Number(b.sequence_no || 0)),
    [materialContributors, selectedMaterialId]
  );
  const selectedSubjects = useMemo(
    () => materialSubjects.filter((row) => row.material_id === selectedMaterialId),
    [materialSubjects, selectedMaterialId]
  );

  const addContributor = async (e) => {
    e?.preventDefault?.();
    setError('');
    setNotice('');
    try {
      await libraryApi.create('material-contributors', {
        material_id: selectedMaterialId,
        contributor_id: contributorForm.contributor_id,
        role_name: contributorForm.role_name,
        sequence_no: Number(contributorForm.sequence_no || 1),
      });
      setContributorForm({ contributor_id: '', role_name: 'author', sequence_no: 1 });
      setContributorModalOpen(false);
      setNotice('Contributor linked to material.');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add contributor');
    }
  };

  const addSubject = async (e) => {
    e?.preventDefault?.();
    setError('');
    setNotice('');
    try {
      await libraryApi.create('material-subjects', {
        material_id: selectedMaterialId,
        subject_id: subjectForm.subject_id,
      });
      setSubjectForm({ subject_id: '' });
      setSubjectModalOpen(false);
      setNotice('Subject linked to material.');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add subject');
    }
  };

  const removeContributor = async (row) => {
    if (!window.confirm('Remove this contributor from the material?')) return;
    try {
      await libraryApi.remove('material-contributors', row.material_contributor_id);
      setNotice('Contributor removed.');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove contributor');
    }
  };

  const removeSubject = async (row) => {
    if (!window.confirm('Remove this subject from the material?')) return;
    try {
      await libraryApi.remove('material-subjects', row.material_subject_id);
      setNotice('Subject removed.');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove subject');
    }
  };

  const currentMaterial = materialMap[selectedMaterialId];

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>Catalog Metadata Assignment</h1><p className="text-muted mb-0">Attach contributors and subjects to catalog materials.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}
        <div className="card mb-3"><div className="card-header"><h3 className="card-title">Select material</h3></div><div className="card-body"><div className="form-group mb-3"><label>Catalog material</label><select className="form-control" value={selectedMaterialId} onChange={(e) => setSelectedMaterialId(e.target.value)}><option value="">Select material</option>{materials.map((row) => <option key={row.material_id} value={row.material_id}>{row.title}{row.publication_year ? ` (${row.publication_year})` : ''}</option>)}</select></div>{currentMaterial ? <div className="alert alert-light mb-0"><strong>{currentMaterial.title}</strong><br /><small>{currentMaterial.isbn || currentMaterial.call_number || 'No identifier'}</small></div> : null}</div></div>

        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center flex-wrap"><h3 className="card-title">Contributors</h3><button className="btn btn-primary btn-sm" type="button" disabled={!selectedMaterialId} onClick={() => setContributorModalOpen(true)}>Add Contributor</button></div>
              <div className="card-body table-responsive p-0">
                <table className="table table-sm table-striped mb-0"><thead><tr><th>Name</th><th>Role</th><th>Order</th><th /></tr></thead><tbody>
                  {loading ? <tr><td colSpan="4" className="text-center">Loading...</td></tr> : null}
                  {!loading && selectedContributors.length === 0 ? <tr><td colSpan="4" className="text-center">No contributors linked.</td></tr> : null}
                  {!loading && selectedContributors.map((row) => <tr key={row.material_contributor_id}><td>{contributorMap[row.contributor_id]?.full_name || contributorMap[row.contributor_id]?.organization_name || '-'}</td><td>{row.role_name}</td><td>{row.sequence_no}</td><td><button className="btn btn-danger btn-xs" onClick={() => removeContributor(row)}>Remove</button></td></tr>)}
                </tbody></table>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center flex-wrap"><h3 className="card-title">Subjects</h3><button className="btn btn-primary btn-sm" type="button" disabled={!selectedMaterialId} onClick={() => setSubjectModalOpen(true)}>Add Subject</button></div>
              <div className="card-body table-responsive p-0">
                <table className="table table-sm table-striped mb-0"><thead><tr><th>Subject</th><th /></tr></thead><tbody>
                  {loading ? <tr><td colSpan="2" className="text-center">Loading...</td></tr> : null}
                  {!loading && selectedSubjects.length === 0 ? <tr><td colSpan="2" className="text-center">No subjects linked.</td></tr> : null}
                  {!loading && selectedSubjects.map((row) => <tr key={row.material_subject_id}><td>{subjectMap[row.subject_id]?.name || '-'}</td><td><button className="btn btn-danger btn-xs" onClick={() => removeSubject(row)}>Remove</button></td></tr>)}
                </tbody></table>
              </div>
            </div>
          </div>
        </div>

        <CrudModal open={contributorModalOpen} title="Add contributor" onClose={() => setContributorModalOpen(false)} size="md" footer={<><button type="button" className="btn btn-secondary" onClick={() => setContributorModalOpen(false)}>Close</button><button type="button" className="btn btn-primary" onClick={addContributor}>Add Contributor</button></>}>
          <form onSubmit={addContributor}>
            <div className="form-group"><label>Contributor</label><select className="form-control" value={contributorForm.contributor_id} onChange={(e) => setContributorForm((p) => ({ ...p, contributor_id: e.target.value }))} required disabled={!selectedMaterialId}><option value="">Select contributor</option>{contributors.map((row) => <option key={row.contributor_id} value={row.contributor_id}>{row.full_name || row.organization_name}</option>)}</select></div>
            <div className="form-row"><div className="form-group col-md-8"><label>Role</label><select className="form-control" value={contributorForm.role_name} onChange={(e) => setContributorForm((p) => ({ ...p, role_name: e.target.value }))}>{contributorRoleOptions.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></div><div className="form-group col-md-4"><label>Order</label><input type="number" min="1" className="form-control" value={contributorForm.sequence_no} onChange={(e) => setContributorForm((p) => ({ ...p, sequence_no: e.target.value }))} /></div></div>
          </form>
        </CrudModal>

        <CrudModal open={subjectModalOpen} title="Add subject" onClose={() => setSubjectModalOpen(false)} size="md" footer={<><button type="button" className="btn btn-secondary" onClick={() => setSubjectModalOpen(false)}>Close</button><button type="button" className="btn btn-primary" onClick={addSubject}>Add Subject</button></>}>
          <form onSubmit={addSubject}>
            <div className="form-group"><label>Subject</label><select className="form-control" value={subjectForm.subject_id} onChange={(e) => setSubjectForm({ subject_id: e.target.value })} required disabled={!selectedMaterialId}><option value="">Select subject</option>{subjects.map((row) => <option key={row.subject_id} value={row.subject_id}>{row.name}</option>)}</select></div>
          </form>
        </CrudModal>
      </div></section>
    </MainLayout>
  );
}
