import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout.jsx';
import CrudModal from '../shared/CrudModal.jsx';
import libraryApi from '../../../api/library.api';
import { getRows, loadResource } from '../shared/libraryHelpers.js';

const emptyCollection = { name: '', slug: '', description: '', visibility: 'internal', is_active: true };
const visibilityOptions = [
  { id: 'public', name: 'Public' },
  { id: 'internal', name: 'Internal' },
  { id: 'restricted', name: 'Restricted' },
];

export default function DigitalCollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [resources, setResources] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [collectionLinks, setCollectionLinks] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [collectionForm, setCollectionForm] = useState(emptyCollection);
  const [editing, setEditing] = useState(null);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [linkForm, setLinkForm] = useState({ digital_resource_id: '', sort_order: 0, note: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadCollections = async () => {
    const res = await libraryApi.list('digital-collections');
    const rows = getRows(res);
    setCollections(rows);
    if (!selectedCollectionId && rows[0]?.collection_id) setSelectedCollectionId(rows[0].collection_id);
    return rows;
  };

  const loadLinks = async (collectionId) => {
    if (!collectionId) {
      setCollectionLinks([]);
      return;
    }
    const res = await libraryApi.getDigitalCollectionResources(collectionId);
    setCollectionLinks(getRows(res));
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [collectionRows, resourcesRes, materialsRes] = await Promise.all([
        loadCollections(),
        loadResource('digital-resources'),
        loadResource('materials'),
      ]);
      setResources(getRows(resourcesRes));
      setMaterials(getRows(materialsRes));
      const activeCollectionId = selectedCollectionId || collectionRows[0]?.collection_id || '';
      if (activeCollectionId) await loadLinks(activeCollectionId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load digital collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadLinks(selectedCollectionId).catch((err) => setError(err?.response?.data?.message || 'Failed to load collection resources')); }, [selectedCollectionId]);

  const resourceMap = useMemo(() => Object.fromEntries(resources.map((row) => [row.digital_resource_id, row])), [resources]);
  const materialMap = useMemo(() => Object.fromEntries(materials.map((row) => [row.material_id, row])), [materials]);
  const selectedCollection = collections.find((row) => row.collection_id === selectedCollectionId) || null;

  const startCreate = () => {
    setEditing(null);
    setCollectionForm(emptyCollection);
    setCollectionModalOpen(true);
  };

  const saveCollection = async (e) => {
    e?.preventDefault?.();
    setError('');
    setNotice('');
    try {
      if (editing) {
        await libraryApi.update('digital-collections', editing.collection_id, collectionForm);
        setNotice('Collection updated successfully.');
      } else {
        await libraryApi.create('digital-collections', collectionForm);
        setNotice('Collection created successfully.');
      }
      setCollectionForm(emptyCollection);
      setEditing(null);
      setCollectionModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save collection');
    }
  };

  const startEdit = (row) => {
    setEditing(row);
    setCollectionForm({
      name: row.name || '',
      slug: row.slug || '',
      description: row.description || '',
      visibility: row.visibility || 'internal',
      is_active: Boolean(row.is_active),
    });
    setCollectionModalOpen(true);
  };

  const deleteCollection = async (row) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await libraryApi.remove('digital-collections', row.collection_id);
      setNotice('Collection deleted successfully.');
      if (selectedCollectionId === row.collection_id) setSelectedCollectionId('');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete collection');
    }
  };

  const addResource = async (e) => {
    e.preventDefault();
    if (!selectedCollectionId) return;
    try {
      await libraryApi.addDigitalCollectionResource(selectedCollectionId, {
        digital_resource_id: linkForm.digital_resource_id,
        sort_order: Number(linkForm.sort_order || 0),
        note: linkForm.note,
      });
      setNotice('Resource added to collection.');
      setLinkForm({ digital_resource_id: '', sort_order: 0, note: '' });
      await loadLinks(selectedCollectionId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add resource');
    }
  };

  const removeResource = async (digitalResourceId) => {
    if (!window.confirm('Remove this resource from the collection?')) return;
    try {
      await libraryApi.removeDigitalCollectionResource(selectedCollectionId, digitalResourceId);
      setNotice('Resource removed from collection.');
      await loadLinks(selectedCollectionId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove resource');
    }
  };

  return (
    <MainLayout>
      <section className="content-header"><div className="container-fluid"><h1>Digital Collections</h1><p className="text-muted mb-0">Create collections and group digital resources for discovery.</p></div></section>
      <section className="content"><div className="container-fluid">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {notice ? <div className="alert alert-success">{notice}</div> : null}

        <div className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap"><h3 className="card-title">Collections</h3><button className="btn btn-primary" type="button" onClick={startCreate}>Create Collection</button></div>
          <div className="card-body table-responsive p-0">
            <table className="table table-striped table-hover mb-0"><thead><tr><th>Name</th><th>Slug</th><th>Visibility</th><th>Status</th><th>Actions</th></tr></thead><tbody>
              {loading ? <tr><td colSpan="5" className="text-center p-4">Loading...</td></tr> : null}
              {!loading && collections.length === 0 ? <tr><td colSpan="5" className="text-center p-4">No collections found.</td></tr> : null}
              {!loading && collections.map((row) => <tr key={row.collection_id} className={selectedCollectionId === row.collection_id ? 'table-primary' : ''}><td>{row.name}</td><td>{row.slug}</td><td>{row.visibility}</td><td>{row.is_active ? 'Active' : 'Inactive'}</td><td><button className="btn btn-info btn-sm mr-2" onClick={() => setSelectedCollectionId(row.collection_id)}>Open</button><button className="btn btn-primary btn-sm mr-2" onClick={() => startEdit(row)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => deleteCollection(row)}>Delete</button></td></tr>)}
            </tbody></table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Collection resources {selectedCollection ? `- ${selectedCollection.name}` : ''}</h3></div>
          <div className="card-body">
            <form onSubmit={addResource} className="mb-3">
              <div className="form-row">
                <div className="form-group col-md-6"><label>Digital resource</label><select className="form-control" value={linkForm.digital_resource_id} onChange={(e) => setLinkForm((p) => ({ ...p, digital_resource_id: e.target.value }))} required disabled={!selectedCollectionId}><option value="">Select resource</option>{resources.map((row) => <option key={row.digital_resource_id} value={row.digital_resource_id}>{materialMap[row.material_id]?.title || row.digital_resource_id}</option>)}</select></div>
                <div className="form-group col-md-2"><label>Order</label><input type="number" className="form-control" value={linkForm.sort_order} onChange={(e) => setLinkForm((p) => ({ ...p, sort_order: e.target.value }))} /></div>
                <div className="form-group col-md-4"><label>Note</label><input className="form-control" value={linkForm.note} onChange={(e) => setLinkForm((p) => ({ ...p, note: e.target.value }))} /></div>
              </div>
              <button className="btn btn-primary btn-sm" type="submit" disabled={!selectedCollectionId}>Add to collection</button>
            </form>

            <div className="table-responsive">
              <table className="table table-sm table-striped mb-0"><thead><tr><th>Title</th><th>Access</th><th>Download</th><th>Order</th><th>Note</th><th /></tr></thead><tbody>
                {!selectedCollectionId ? <tr><td colSpan="6" className="text-center">Select a collection first.</td></tr> : null}
                {selectedCollectionId && collectionLinks.length === 0 ? <tr><td colSpan="6" className="text-center">No resources in this collection.</td></tr> : null}
                {selectedCollectionId && collectionLinks.map((row) => <tr key={row.collection_resource_id}><td>{row.title || materialMap[resourceMap[row.digital_resource_id]?.material_id]?.title || row.digital_resource_id}</td><td>{row.access_level || '-'}</td><td>{row.is_downloadable ? 'Allowed' : 'No'}</td><td>{row.sort_order}</td><td>{row.note || '-'}</td><td><button className="btn btn-danger btn-xs" onClick={() => removeResource(row.digital_resource_id)}>Remove</button></td></tr>)}
              </tbody></table>
            </div>
          </div>
        </div>

        <CrudModal open={collectionModalOpen} title={editing ? 'Edit collection' : 'Create collection'} onClose={() => setCollectionModalOpen(false)} footer={<><button type="button" className="btn btn-secondary" onClick={() => setCollectionModalOpen(false)}>Close</button><button type="button" className="btn btn-primary" onClick={saveCollection}>{editing ? 'Update' : 'Create'}</button></>}>
          <form onSubmit={saveCollection}>
            <div className="form-group"><label>Name</label><input className="form-control" value={collectionForm.name} onChange={(e) => setCollectionForm((p) => ({ ...p, name: e.target.value }))} required /></div>
            <div className="form-group"><label>Slug</label><input className="form-control" value={collectionForm.slug} onChange={(e) => setCollectionForm((p) => ({ ...p, slug: e.target.value }))} placeholder="leave blank to auto-generate" /></div>
            <div className="form-group"><label>Description</label><textarea className="form-control" rows="3" value={collectionForm.description} onChange={(e) => setCollectionForm((p) => ({ ...p, description: e.target.value }))} /></div>
            <div className="form-group"><label>Visibility</label><select className="form-control" value={collectionForm.visibility} onChange={(e) => setCollectionForm((p) => ({ ...p, visibility: e.target.value }))}>{visibilityOptions.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></div>
            <div className="form-group form-check"><input type="checkbox" className="form-check-input" checked={Boolean(collectionForm.is_active)} onChange={(e) => setCollectionForm((p) => ({ ...p, is_active: e.target.checked }))} /><label className="form-check-label">Active</label></div>
          </form>
        </CrudModal>
      </div></section>
    </MainLayout>
  );
}
