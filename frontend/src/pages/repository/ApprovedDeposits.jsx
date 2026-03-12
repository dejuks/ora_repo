import React, { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Swal from "sweetalert2";
import { getApprovedDeposits } from "../../api/repository.api";

const ApprovedDeposits = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getApprovedDeposits();
      setItems(res.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load approved deposits", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="card card-success">
            <div className="card-header">
              <h3 className="card-title">My Approved Deposits</h3>
            </div>

            <div className="card-body table-responsive p-0">
              {loading ? (
                <p className="p-3">Loading...</p>
              ) : items.length === 0 ? (
                <p className="p-3">No approved items found.</p>
              ) : (
                <table className="table table-hover text-nowrap">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Language</th>
                      <th>Status</th>
                      <th>Approved On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.uuid}>
                        <td>{item.title}</td>
                        <td>{item.item_type}</td>
                        <td>{item.language}</td>
                        <td>
                          <span className="badge badge-success">
                            {item.status}
                          </span>
                        </td>
                        <td>
                          {new Date(item.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ApprovedDeposits;
