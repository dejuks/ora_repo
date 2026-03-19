import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { getAEAssignedManuscriptsAPI } from "../../../api/associateEditor.api";

export default function Ethics() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = async () => {
    try {
      const res = await getAEAssignedManuscriptsAPI();
      const ethicsData = (res || []).filter(m => m.status_label === "screened"); // status for ethics review
      setData(ethicsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(()=>{ loadData(); }, []);

  const filteredData = data.filter(
    m => m.manuscript_title.toLowerCase().includes(search.toLowerCase()) &&
         (statusFilter ? m.status_label === statusFilter : true)
  );

  return (
    <MainLayout>
      <div className="container-fluid mt-3">
        <div className="row mb-3">
          <div className="col-md-6">
            <input className="form-control" placeholder="Search title or journal" value={search} onChange={(e)=>setSearch(e.target.value)} />
          </div>
          <div className="col-md-4">
            <select className="form-control" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="screened">Screened</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-secondary w-100" onClick={()=>{setSearch(""); setStatusFilter("");}}>Reset</button>
          </div>
        </div>

        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Journal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr><td colSpan="4" className="text-center">No manuscripts for ethics review</td></tr>
            ) : filteredData.map((m, i)=>(
              <tr key={m.uuid || m.id}>
                <td>{i+1}</td>
                <td>{m.manuscript_title}</td>
                <td>{m.journal_title}</td>
                <td><span className="badge bg-info">{m.status_label}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
