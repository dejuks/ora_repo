import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { enhanceMetadata, assignVocabulary, checkCopyright, getItems } from "../../../api/repository.api";
import MainLayout from "../../../components/layout/MainLayout";
import { useParams } from "react-router-dom";

export default function CuratorTool() {
  const { uuid } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState({ title: "", description: "", keywords: "" });
  const [vocabulary, setVocabulary] = useState([]);
  const [copyrightStatus, setCopyrightStatus] = useState("pending");
  const [copyrightNotes, setCopyrightNotes] = useState("");

  useEffect(() => {
    fetchItem();
  }, []);

  const fetchItem = async () => {
    setLoading(true);
    try {
      const res = await getItems({ status: "submitted" });
      const selected = res.data.find(i => i.id === uuid);
      if (!selected) throw new Error("Item not found");

      setItem(selected);
      setMetadata(selected.metadata || { title: selected.title, description: "", keywords: "" });
      setVocabulary(selected.vocabulary || []);
      setCopyrightStatus(selected.copyright_status || "pending");
      setCopyrightNotes(selected.curator_notes?.copyright || "");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMetadataSave = async () => {
    await enhanceMetadata(item.id, metadata);
    Swal.fire("Success", "Metadata updated", "success");
  };

  const handleVocabularySave = async () => {
    await assignVocabulary(item.id, vocabulary);
    Swal.fire("Success", "Vocabulary assigned", "success");
  };

  const handleCopyrightSave = async () => {
    await checkCopyright(item.id, copyrightStatus, copyrightNotes);
    Swal.fire("Success", "Copyright checked", "success");
  };

  if (loading || !item) return <div className="text-center py-5">Loading...</div>;

  return (
    <MainLayout>
      <div className="container-fluid">
        <h2 className="mb-4">Curate: {item.title}</h2>

        {/* Metadata Enhancement */}
        <div className="card mb-3">
          <div className="card-header bg-info text-white">Metadata Enhancement</div>
          <div className="card-body">
            <div className="form-group">
              <label>Title</label>
              <input className="form-control" value={metadata.title} onChange={e => setMetadata({...metadata, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" rows={3} value={metadata.description} onChange={e => setMetadata({...metadata, description: e.target.value})}></textarea>
            </div>
            <div className="form-group">
              <label>Keywords (comma separated)</label>
              <input className="form-control" value={metadata.keywords} onChange={e => setMetadata({...metadata, keywords: e.target.value})} />
            </div>
            <button className="btn btn-success mt-2" onClick={handleMetadataSave}>Save Metadata</button>
          </div>
        </div>

        {/* Vocabulary Assignment */}
        <div className="card mb-3">
          <div className="card-header bg-warning text-dark">Vocabulary Assignment</div>
          <div className="card-body">
            <div className="form-group">
              <label>Vocabulary (comma separated)</label>
              <input className="form-control" value={vocabulary.join(",")} onChange={e => setVocabulary(e.target.value.split(","))} />
            </div>
            <button className="btn btn-success mt-2" onClick={handleVocabularySave}>Save Vocabulary</button>
          </div>
        </div>

        {/* Copyright Check */}
        <div className="card mb-3">
          <div className="card-header bg-danger text-white">Copyright Check</div>
          <div className="card-body">
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={copyrightStatus} onChange={e => setCopyrightStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="cleared">Cleared</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea className="form-control" rows={2} value={copyrightNotes} onChange={e => setCopyrightNotes(e.target.value)}></textarea>
            </div>
            <button className="btn btn-success mt-2" onClick={handleCopyrightSave}>Save Copyright Info</button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
