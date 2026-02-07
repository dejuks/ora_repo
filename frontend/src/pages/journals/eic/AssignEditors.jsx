import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  getManuscriptsForAssignEditors,
  assignEditorAPI,
  getEditorsAPI,
} from "../../../api/manuscript.api";

export default function AssignEditors() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editors, setEditors] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const manuscripts = await getManuscriptsForAssignEditors();

        const parsed = Array.isArray(manuscripts)
          ? manuscripts
          : manuscripts?.data || [];

        setData(parsed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const loadEditors = async () => {
      try {
        const editorsList = await getEditorsAPI();

        const parsed = Array.isArray(editorsList)
          ? editorsList
          : editorsList?.data || [];

        setEditors(parsed);
      } catch (err) {
        console.error("Failed to load editors:", err);
      }
    };

    loadData();
    loadEditors();
  }, []);

  const handleAssignEditor = async (manuscriptId, editorId) => {
    if (!editorId) return;

    try {
      await assignEditorAPI(manuscriptId, editorId);

      const assignedEditor = editors.find(
        (e) => String(e.uuid) === String(editorId),
      );

      setData((prev) =>
        prev.map((m) =>
          m.id === manuscriptId
            ? {
                ...m,
                assigned_editor_id: editorId,
                assigned_editor_email: assignedEditor?.email || "Assigned",
                status_label: "Assigned",
              }
            : m,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to assign editor");
    }
  };

  const filteredData = data.filter((m) => {
    return (
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.journal_title?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <MainLayout>
      <div className="container-fluid mt-3">
        <div className="card card-primary card-outline">
          <div className="card-header">
            <h3 className="card-title">Assign Editors</h3>

            <div className="card-tools">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search"
                style={{ width: 200 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="card-body table-responsive p-0">
            {loading ? (
              <p className="text-center mt-3">Loading...</p>
            ) : (
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Journal</th>
                    <th>Status</th>
                    {/* <th>Assigned Editor</th> */}
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No manuscripts found
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((m, i) => {
                      const isAssigned = !!m.assigned_editor_id;

                      return (
                        <tr key={m.id}>
                          <td>{i + 1}</td>
                          <td>{m.title}</td>
                          <td>{m.journal_title}</td>
                          <td>{m.status_label}</td>

                          {/* <td>
                            {m.email ||
                              "Not Assigned"}
                          </td> */}

                          <td>
                            <select
                              className="form-control form-control-sm"
                              value={m.assigned_editor_id ?? ""}
                              onChange={(e) =>
                                handleAssignEditor(m.id, e.target.value)
                              }
                            >
                              <option value="">-- Select Editor --</option>

                              {editors.map((ed) => (
                                <option key={ed.uuid} value={ed.uuid}>
                                  {ed.full_name} ({ed.email})
                                </option>
                              ))}
                            </select>

                            {/* show current assigned */}
                            {m.assigned_editor_email && (
                              <small className="text-success">
                                Assigned: {m.assigned_editor_email}
                              </small>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
