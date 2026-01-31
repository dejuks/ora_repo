import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";
import { getItems } from "../../api/repository.api";

export default function RepositoryStatusList({ status }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await getItems();

      // Filter by the requested status and exclude "return to revisions"
      const filtered = res.data.filter(
        (item) => item.status === status && item.status == "return to revisions"
      );

      setItems(filtered);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch repository items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [status]);

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center mt-5">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="row mb-3">
            <div className="col-sm-6">
              <h1>Repository Items - {status}</h1>
            </div>
            <div className="col-sm-6 text-right">
              <Link to="/repository/create" className="btn btn-primary">
                <i className="fas fa-plus"></i> New Item
              </Link>
            </div>
          </div>

          <div className="card card-outline card-primary">
            <div className="card-header">
              <h3 className="card-title">{status} Items</h3>
            </div>

            <div className="card-body table-responsive p-0">
              <table className="table table-hover table-bordered table-striped">
                <thead className="bg-primary">
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Curator Feedback</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No records found
                      </td>
                    </tr>
                  )}

                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.item_type}</td>
                      <td>{item.language}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.status === "published"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.rejection_reason && (
                          <div>
                            <strong>Rejected:</strong> {item.rejection_reason}
                          </div>
                        )}
                        {item.curator_comment && (
                          <div>
                            <strong>Revision:</strong> {item.curator_comment}
                          </div>
                        )}
                        {!item.rejection_reason && !item.curator_comment && (
                          <span className="text-muted">No feedback</span>
                        )}
                      </td>
                      <td>
                        <Link
                          to={`/repository/show/${item.uuid}`}
                          className="btn btn-sm btn-secondary mr-1"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>

                        <Link
                          to={`/repository/edit/${item.uuid}`}
                          className="btn btn-sm btn-info mr-1"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                      </td>
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
