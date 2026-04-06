import React, { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import { createPublisherPackage, createPublisherResource, getPublisherPackages } from "../../../api/publisher.api";
import libraryApi from "../../../api/library.api";

const packageInitial = {
  publisher_id: "",
  package_name: "",
  package_code: "",
  package_type: "content_package",
  description: "",
  external_reference: "",
  delivery_method: "upload",
  license_start_date: "",
  license_end_date: "",
  license_name: "",
  license_type: "subscription",
  access_scope: "institution",
  terms_text: "",
  drm_required: false,
};

const resourceInitial = {
  package_id: "",
  publisher_id: "",
  title: "",
  subtitle: "",
  material_type_id: "",
  category_id: "",
  language_id: "",
  publication_year: "",
  isbn: "",
  issn: "",
  abstract: "",
  description: "",
  keywords: "",
  access_level: "registered_users",
  member_type_id: "",
  is_downloadable: true,
  drm_required: false,
  allow_download: true,
};

export default function ExternalPublisherPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [memberTypes, setMemberTypes] = useState([]);
  const [packageForm, setPackageForm] = useState(packageInitial);
  const [resourceForm, setResourceForm] = useState(resourceInitial);
  const [packageFile, setPackageFile] = useState(null);
  const [resourceFile, setResourceFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [pkgRes, pubRes, mtRes, catRes, langRes, memberRes] = await Promise.all([
        getPublisherPackages(),
        libraryApi.getPublishers(),
        libraryApi.getMaterialTypes(),
        libraryApi.getLibraryCategories(),
        libraryApi.getLanguages(),
        libraryApi.list('member-types', { limit: 500 }),
      ]);
      setPackages(pkgRes?.data?.rows || pkgRes?.rows || []);
      setPublishers(pubRes?.data?.rows || pubRes?.rows || []);
      setMaterialTypes(mtRes?.data?.rows || mtRes?.rows || []);
      setCategories(catRes?.data?.rows || catRes?.rows || []);
      setLanguages(langRes?.data?.rows || langRes?.rows || []);
      setMemberTypes(memberRes?.rows || memberRes?.data?.rows || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load publisher workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (!resourceForm.publisher_id && packageForm.publisher_id) {
      setResourceForm((prev) => ({ ...prev, publisher_id: packageForm.publisher_id }));
    }
  }, [packageForm.publisher_id]);

  const submitPackage = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    try {
      await createPublisherPackage({
        ...packageForm,
        drm_required: packageForm.drm_required ? 'true' : 'false',
      }, packageFile);
      setNotice('Publisher package uploaded successfully.');
      setPackageForm(packageInitial);
      setPackageFile(null);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to upload publisher package');
    }
  };

  const submitResource = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    try {
      await createPublisherResource({
        ...resourceForm,
        publication_year: resourceForm.publication_year || undefined,
        is_downloadable: resourceForm.is_downloadable ? 'true' : 'false',
        drm_required: resourceForm.drm_required ? 'true' : 'false',
        allow_download: resourceForm.allow_download ? 'true' : 'false',
      }, resourceFile);
      setNotice('Digital resource created from publisher package.');
      setResourceForm(resourceInitial);
      setResourceFile(null);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create resource from publisher package');
    }
  };

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>External Publisher Packages</h1>
          <p className="text-muted mb-0">Receive publisher packages, register license details, and publish resources into the digital library.</p>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          {error ? <div className="alert alert-danger">{error}</div> : null}
          {notice ? <div className="alert alert-success">{notice}</div> : null}

          <div className="row">
            <div className="col-lg-6">
              <div className="card card-primary card-outline">
                <div className="card-header"><h3 className="card-title">Upload publisher package</h3></div>
                <form onSubmit={submitPackage}>
                  <div className="card-body">
                    <div className="form-row">
                      <div className="form-group col-md-6"><label>Publisher</label><select className="form-control" value={packageForm.publisher_id} onChange={(e) => setPackageForm((p) => ({ ...p, publisher_id: e.target.value }))} required><option value="">Select publisher</option>{publishers.map((row) => <option key={row.publisher_id} value={row.publisher_id}>{row.name}</option>)}</select></div>
                      <div className="form-group col-md-6"><label>Package Type</label><input className="form-control" value={packageForm.package_type} onChange={(e) => setPackageForm((p) => ({ ...p, package_type: e.target.value }))} /></div>
                    </div>
                    <div className="form-group"><label>Package Name</label><input className="form-control" value={packageForm.package_name} onChange={(e) => setPackageForm((p) => ({ ...p, package_name: e.target.value }))} required /></div>
                    <div className="form-row">
                      <div className="form-group col-md-6"><label>Package Code</label><input className="form-control" value={packageForm.package_code} onChange={(e) => setPackageForm((p) => ({ ...p, package_code: e.target.value }))} /></div>
                      <div className="form-group col-md-6"><label>External Reference</label><input className="form-control" value={packageForm.external_reference} onChange={(e) => setPackageForm((p) => ({ ...p, external_reference: e.target.value }))} /></div>
                    </div>
                    <div className="form-group"><label>Description</label><textarea className="form-control" rows="3" value={packageForm.description} onChange={(e) => setPackageForm((p) => ({ ...p, description: e.target.value }))} /></div>
                    <div className="form-row">
                      <div className="form-group col-md-4"><label>License Start</label><input type="date" className="form-control" value={packageForm.license_start_date} onChange={(e) => setPackageForm((p) => ({ ...p, license_start_date: e.target.value }))} /></div>
                      <div className="form-group col-md-4"><label>License End</label><input type="date" className="form-control" value={packageForm.license_end_date} onChange={(e) => setPackageForm((p) => ({ ...p, license_end_date: e.target.value }))} /></div>
                      <div className="form-group col-md-4"><label>License Type</label><input className="form-control" value={packageForm.license_type} onChange={(e) => setPackageForm((p) => ({ ...p, license_type: e.target.value }))} /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-6"><label>License Name</label><input className="form-control" value={packageForm.license_name} onChange={(e) => setPackageForm((p) => ({ ...p, license_name: e.target.value }))} /></div>
                      <div className="form-group col-md-6"><label>Access Scope</label><input className="form-control" value={packageForm.access_scope} onChange={(e) => setPackageForm((p) => ({ ...p, access_scope: e.target.value }))} /></div>
                    </div>
                    <div className="form-group"><label>Terms</label><textarea className="form-control" rows="2" value={packageForm.terms_text} onChange={(e) => setPackageForm((p) => ({ ...p, terms_text: e.target.value }))} /></div>
                    <div className="form-group"><label>Package File</label><input type="file" className="form-control" onChange={(e) => setPackageFile(e.target.files?.[0] || null)} /></div>
                    <div className="form-group form-check"><input type="checkbox" className="form-check-input" checked={packageForm.drm_required} onChange={(e) => setPackageForm((p) => ({ ...p, drm_required: e.target.checked }))} /><label className="form-check-label">DRM required</label></div>
                  </div>
                  <div className="card-footer"><button className="btn btn-primary" type="submit">Save Package</button></div>
                </form>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card card-success card-outline">
                <div className="card-header"><h3 className="card-title">Create digital resource from package</h3></div>
                <form onSubmit={submitResource}>
                  <div className="card-body">
                    <div className="form-row">
                      <div className="form-group col-md-6"><label>Source Package</label><select className="form-control" value={resourceForm.package_id} onChange={(e) => {
                        const selected = packages.find((row) => row.package_id === e.target.value);
                        setResourceForm((p) => ({ ...p, package_id: e.target.value, publisher_id: selected?.publisher_id || p.publisher_id }));
                      }}><option value="">Optional</option>{packages.map((row) => <option key={row.package_id} value={row.package_id}>{row.package_name}</option>)}</select></div>
                      <div className="form-group col-md-6"><label>Publisher</label><select className="form-control" value={resourceForm.publisher_id} onChange={(e) => setResourceForm((p) => ({ ...p, publisher_id: e.target.value }))} required><option value="">Select publisher</option>{publishers.map((row) => <option key={row.publisher_id} value={row.publisher_id}>{row.name}</option>)}</select></div>
                    </div>
                    <div className="form-group"><label>Title</label><input className="form-control" value={resourceForm.title} onChange={(e) => setResourceForm((p) => ({ ...p, title: e.target.value }))} required /></div>
                    <div className="form-group"><label>Subtitle</label><input className="form-control" value={resourceForm.subtitle} onChange={(e) => setResourceForm((p) => ({ ...p, subtitle: e.target.value }))} /></div>
                    <div className="form-row">
                      <div className="form-group col-md-4"><label>Material Type</label><select className="form-control" value={resourceForm.material_type_id} onChange={(e) => setResourceForm((p) => ({ ...p, material_type_id: e.target.value }))} required><option value="">Select</option>{materialTypes.map((row) => <option key={row.material_type_id} value={row.material_type_id}>{row.name}</option>)}</select></div>
                      <div className="form-group col-md-4"><label>Category</label><select className="form-control" value={resourceForm.category_id} onChange={(e) => setResourceForm((p) => ({ ...p, category_id: e.target.value }))}><option value="">Select</option>{categories.map((row) => <option key={row.category_id} value={row.category_id}>{row.name}</option>)}</select></div>
                      <div className="form-group col-md-4"><label>Language</label><select className="form-control" value={resourceForm.language_id} onChange={(e) => setResourceForm((p) => ({ ...p, language_id: e.target.value }))}><option value="">Select</option>{languages.map((row) => <option key={row.language_id} value={row.language_id}>{row.name}</option>)}</select></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-4"><label>Publication Year</label><input type="number" className="form-control" value={resourceForm.publication_year} onChange={(e) => setResourceForm((p) => ({ ...p, publication_year: e.target.value }))} /></div>
                      <div className="form-group col-md-4"><label>ISBN</label><input className="form-control" value={resourceForm.isbn} onChange={(e) => setResourceForm((p) => ({ ...p, isbn: e.target.value }))} /></div>
                      <div className="form-group col-md-4"><label>ISSN</label><input className="form-control" value={resourceForm.issn} onChange={(e) => setResourceForm((p) => ({ ...p, issn: e.target.value }))} /></div>
                    </div>
                    <div className="form-group"><label>Abstract</label><textarea className="form-control" rows="2" value={resourceForm.abstract} onChange={(e) => setResourceForm((p) => ({ ...p, abstract: e.target.value }))} /></div>
                    <div className="form-group"><label>Description</label><textarea className="form-control" rows="2" value={resourceForm.description} onChange={(e) => setResourceForm((p) => ({ ...p, description: e.target.value }))} /></div>
                    <div className="form-group"><label>Keywords</label><input className="form-control" value={resourceForm.keywords} onChange={(e) => setResourceForm((p) => ({ ...p, keywords: e.target.value }))} placeholder="comma separated" /></div>
                    <div className="form-row">
                      <div className="form-group col-md-4"><label>Access Level</label><select className="form-control" value={resourceForm.access_level} onChange={(e) => setResourceForm((p) => ({ ...p, access_level: e.target.value }))}><option value="registered_users">Registered Users</option><option value="public">Public</option><option value="students_only">Students Only</option><option value="staff_only">Staff Only</option><option value="restricted">Restricted</option></select></div>
                      <div className="form-group col-md-4"><label>Member Type Rule</label><select className="form-control" value={resourceForm.member_type_id} onChange={(e) => setResourceForm((p) => ({ ...p, member_type_id: e.target.value }))}><option value="">Optional</option>{memberTypes.map((row) => <option key={row.member_type_id} value={row.member_type_id}>{row.name}</option>)}</select></div>
                      <div className="form-group col-md-4"><label>Resource File</label><input type="file" className="form-control" onChange={(e) => setResourceFile(e.target.files?.[0] || null)} /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-4 form-check"><input type="checkbox" className="form-check-input" checked={resourceForm.is_downloadable} onChange={(e) => setResourceForm((p) => ({ ...p, is_downloadable: e.target.checked }))} /><label className="form-check-label">Downloadable</label></div>
                      <div className="form-group col-md-4 form-check"><input type="checkbox" className="form-check-input" checked={resourceForm.allow_download} onChange={(e) => setResourceForm((p) => ({ ...p, allow_download: e.target.checked }))} /><label className="form-check-label">Allow download rule</label></div>
                      <div className="form-group col-md-4 form-check"><input type="checkbox" className="form-check-input" checked={resourceForm.drm_required} onChange={(e) => setResourceForm((p) => ({ ...p, drm_required: e.target.checked }))} /><label className="form-check-label">DRM required</label></div>
                    </div>
                  </div>
                  <div className="card-footer"><button className="btn btn-success" type="submit">Create Resource</button></div>
                </form>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header"><h3 className="card-title">Received publisher packages</h3></div>
            <div className="card-body table-responsive p-0">
              <table className="table table-striped table-hover mb-0">
                <thead><tr><th>Publisher</th><th>Package</th><th>Status</th><th>Type</th><th>License</th><th>Resources</th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan="6" className="text-center p-4">Loading...</td></tr> : null}
                  {!loading && packages.length === 0 ? <tr><td colSpan="6" className="text-center p-4">No publisher packages yet.</td></tr> : null}
                  {!loading && packages.map((row) => (
                    <tr key={row.package_id}>
                      <td>{row.publisher_name || '-'}</td>
                      <td><div className="font-weight-bold">{row.package_name}</div><div className="small text-muted">{row.package_code || row.external_reference || '-'}</div></td>
                      <td><span className={`badge badge-${row.package_status === 'processed' ? 'success' : row.package_status === 'received' ? 'info' : 'secondary'}`}>{row.package_status}</span></td>
                      <td>{row.package_type}</td>
                      <td>{row.licenses?.[0]?.license_name || '-'}</td>
                      <td>{row.related_resource_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
