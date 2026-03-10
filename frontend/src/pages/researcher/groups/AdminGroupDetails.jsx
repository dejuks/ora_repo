import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGroupDetailsAdminAPI } from "../../../api/researcher.group.api";
import MainLayout from "../../../components/layout/MainLayout";

export default function AdminGroupDetails() {
  const { uuid } = useParams();
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (uuid) {
      loadDetails();
    }
  }, [uuid]);

  const loadDetails = async () => {
    try {
      console.log("Group UUID:", uuid); // debug

      const res = await getGroupDetailsAdminAPI(uuid);

      setMembers(res.data.members);
      setPosts(res.data.posts);

    } catch (error) {
      console.error("Error loading group details:", error);
    }
  };

  return (
    <MainLayout>
      <div className="container mt-4">
        <h3>Group Details</h3>

        {/* MEMBERS */}
        <h5 className="mt-4">Members</h5>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.uuid}>
                <td>{m.full_name}</td>
                <td>{m.email}</td>
                <td>{m.role}</td>
                <td>
                  {new Date(m.joined_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* POSTS */}
        <h5 className="mt-5">Posts</h5>

        {posts.length === 0 && <p>No posts found</p>}

        {posts.map((p) => (
          <div key={p.uuid} className="card mb-3">
            <div className="card-body">
              <h6>{p.author_name}</h6>
              <p>{p.content}</p>
              <small className="text-muted">
                {new Date(p.created_at).toLocaleString()}
              </small>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
