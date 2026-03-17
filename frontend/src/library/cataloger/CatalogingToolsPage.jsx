import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import libraryApi from '../../../api/library.api';
import { getRows } from '../shared/libraryHelpers';

export default function CatalogingToolsPage() {
  const [materials, setMaterials] = useState([]);
  const [copies, setCopies] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [classificationForm, setClassificationForm] = useState({ classification_code: '', call_number: '' });
  const [barcodePrefix, setBarcodePrefix] = useState('LIB');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [materialsRes, copiesRes] = await Promise.all([
        libraryApi.list('materials', { limit: 300 }),
        libraryApi.list('copies', { limit: 300 }),
      ]);
      const materialRows = getRows(materialsRes);
      const copyRows = getRows(copiesRes);
      setMaterials(materialRows);
      setCopies(copyRows);
      if (!selectedMaterialId && materialRows[0]?.material_id) {
        setSelectedMaterialId(materialRows[0].material_id);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load cataloging tools data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!selectedMaterialId) return;
    libraryApi.getCatalogClassificationSuggestion(selectedMaterialId)
      .then((data) => {
        setSuggestion(data);
        setClassificationForm({
          classification_code: data?.primarySuggestion?.classification_code || '',
          call_number: data?.primarySuggestion?.call_number || '',
        });
      })
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load classification suggestion'));
  }, [selectedMaterialId]);

  const copyMaterialMap = useMemo(() => Object.fromEntries(materials.map((row) => [row.material_id, row])), [materials]);
  const copiesMissingBarcode = useMemo(() => copies.filter((row) => !String(row.barcode || '').trim()), [copies]);

  const applyClassification = async (e) => {
    e.preventDefault();
    if (!selectedMaterialId) return;
    setError('');
    setNotice('');
    try {
      await libraryApi.applyCatalogClassification(selectedMaterialId, classificationForm);
      setNotice('Classification saved successfully.');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save classification');
    }
  };

  const generateBarcode = async (copyId) => {
    setError('');
    setNotice('');
    try {
      await libraryApi.generateCopyBarcode(copyId, { prefix: barcodePrefix, force: true });
      setNotice('Barcode generated successfully.');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate barcode');
    }
  };

  const generateBatch = async () => {
    setError('');
    setNotice('');
    try {
      const result = await libraryApi.generateMissingCopyBarcodes({ prefix: barcodePrefix, limit: 50 });
      setNotice(`Generated ${result?.count || 0} missing barcodes.`);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate missing barcodes');
    }
  };

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>Cataloging Tools</h1>
          <p className="text-muted mb-0">Apply DDC-style classification suggestions and generate copy barcodes for catalog records.</p>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          {error ? <div className="alert alert-danger">{error}</div> : null}
          {notice ? <div className="alert alert-success">{notice}</div> : null}
          <div className="row">
            <div className="col-lg-6">
              <div className="card card-primary">
                <div className="card-header"><h3 className="card-title">DDC classification helper</h3></div>
                <div className="card-body">
                  <div className="form-group">
                    <label>Catalog material</label>
                    <select className="form-control" value={selectedMaterialId} onChange={(e) => setSelectedMaterialId(e.target.value)}>
                      <option value="">Select material</option>
                      {materials.map((row) => <option key={row.material_id} value={row.material_id}>{row.title}</option>)}
                    </select>
                  </div>

                  {loading ? <p className="text-muted">Loading suggestion...</p> : null}
                  {suggestion?.material ? (
                    <>
                      <div className="mb-3 p-3 bg-light rounded">
                        <div><strong>Title:</strong> {suggestion.material.title}</div>
                        <div><strong>Current classification:</strong> {suggestion.material.classification_code || '-'}</div>
                        <div><strong>Current call number:</strong> {suggestion.material.call_number || '-'}</div>
                        <div><strong>Subjects:</strong> {(suggestion.material.subjects || []).join(', ') || '-'}</div>
                      </div>

                      <div className="alert alert-info">
                        <div><strong>Suggested DDC:</strong> {suggestion.primarySuggestion?.classification_code} — {suggestion.primarySuggestion?.label}</div>
                        <div><strong>Suggested call number:</strong> {suggestion.primarySuggestion?.call_number}</div>
                      </div>
                    </>
                  ) : null}

                  <form onSubmit={applyClassification}>
                    <div className="form-row">
                      <div className="form-group col-md-4">
                        <label>Classification code</label>
                        <input className="form-control" value={classificationForm.classification_code} onChange={(e) => setClassificationForm((p) => ({ ...p, classification_code: e.target.value }))} required />
                      </div>
                      <div className="form-group col-md-8">
                        <label>Call number</label>
                        <input className="form-control" value={classificationForm.call_number} onChange={(e) => setClassificationForm((p) => ({ ...p, call_number: e.target.value }))} required />
                      </div>
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={!selectedMaterialId}>Apply classification</button>
                  </form>

                  {suggestion?.alternatives?.length ? (
                    <div className="mt-4">
                      <h6>Alternative suggestions</h6>
                      <ul className="list-group list-group-flush">
                        {suggestion.alternatives.map((row) => (
                          <li key={row.classification_code} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                            <div>
                              <div><strong>{row.classification_code}</strong> — {row.label}</div>
                              <small className="text-muted">{row.call_number}</small>
                            </div>
                            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setClassificationForm({ classification_code: row.classification_code, call_number: row.call_number })}>Use</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card card-success">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="card-title mb-0">Barcode generation</h3>
                  <button className="btn btn-light btn-sm" type="button" onClick={generateBatch}>Generate missing barcodes</button>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>Barcode prefix</label>
                    <input className="form-control" value={barcodePrefix} onChange={(e) => setBarcodePrefix(e.target.value.toUpperCase())} placeholder="LIB" />
                    <small className="form-text text-muted">Used for single and batch barcode generation.</small>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-sm table-striped mb-0">
                      <thead>
                        <tr>
                          <th>Material</th>
                          <th>Copy No.</th>
                          <th>Accession</th>
                          <th>Barcode</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {copiesMissingBarcode.length === 0 ? (
                          <tr><td colSpan="5" className="text-center">All loaded copies already have barcodes.</td></tr>
                        ) : copiesMissingBarcode.slice(0, 20).map((row) => (
                          <tr key={row.copy_id}>
                            <td>{copyMaterialMap[row.material_id]?.title || row.material_id}</td>
                            <td>{row.copy_number || '-'}</td>
                            <td>{row.accession_number || '-'}</td>
                            <td>{row.barcode || <span className="text-muted">Missing</span>}</td>
                            <td><button className="btn btn-success btn-xs" type="button" onClick={() => generateBarcode(row.copy_id)}>Generate</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
