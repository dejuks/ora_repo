import React, { useEffect, useState } from "react";
import { getRoles } from "../api/role.api";
import { fetchUserRoles, assignRolesToUser } from "../api/userRole.api";

export default function UserRoles({ user }) {
  const [roles, setRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allRoles = await getRoles();
        setRoles(allRoles.data || []);

        const assigned = await fetchUserRoles(user.uuid);
        setUserRoles(assigned.data.map(r => r.uuid));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const toggleRole = (roleId) => {
    setUserRoles(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  const saveRoles = async () => {
    try {
      await assignRolesToUser(user.uuid, userRoles);
      alert("Roles updated successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update roles");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h3>Assign Roles to {user.full_name}</h3>
      <ul>
        {roles.map(r => (
          <li key={r.uuid}>
            <label>
              <input
                type="checkbox"
                checked={userRoles.includes(r.uuid)}
                onChange={() => toggleRole(r.uuid)}
              />{" "}
              {r.name}
            </label>
          </li>
        ))}
      </ul>
      <button className="btn btn-primary" onClick={saveRoles}>
        Save Roles
      </button>
    </div>
  );
}
