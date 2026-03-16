import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGroupsAPI, deleteGroupAPI } from "../../api/researcher.group.api";

export default function Groups() {
  const [groups, setGroups] = useState([]);

  const loadGroups = async () => {
    const data = await getGroupsAPI();
    setGroups(data);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleDelete = async (uuid) => {
    if (window.confirm("Are you sure?")) {
      await deleteGroupAPI(uuid);
      loadGroups();
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between mb-3">
        <h3>Research Groups</h3>
        <Link to="/researcher/groups/create" className="btn btn-primary">
          Create Group
        </Link>
      </div>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Created At</th>
            <th width="200">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.uuid}>
              <td>{group.name}</td>
              <td>{group.description}</td>
              <td>{new Date(group.created_at).toLocaleDateString()}</td>
              <td>
                <Link
                  to={`/groups/edit/${group.uuid}`}
                  className="btn btn-warning btn-sm me-2"
                >
                  Edit
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(group.uuid)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
