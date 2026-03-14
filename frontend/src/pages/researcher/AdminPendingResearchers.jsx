import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPendingResearchers({ token }) {
  const [pending, setPending] = useState([]);

  const fetchPending = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/pending-researchers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPending(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const approveUser = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/admin/approve-researcher/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("User approved!");
      fetchPending();
    } catch (err) {
      alert("Error approving user");
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Pending Researchers</h2>
      {pending.length === 0 ? (
        <p>No pending researchers.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pending.map(user => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>
                  <button className="btn btn-success btn-sm" onClick={() => approveUser(user.id)}>Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
