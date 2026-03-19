import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGroupAPI } from "../../../api/researcher.group.api";
import MainLayout from "../../../components/layout/MainLayout";
import GroupMembers from "../../../components/groups/GroupMembers";

export default function GroupDetail() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("members");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    setLoading(true);
    try {
      const data = await getGroupAPI(groupId);
      setGroup(data);
    } catch (error) {
      console.error("Error loading group:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!group) {
    return (
      <MainLayout>
        <div className="alert alert-danger">Group not found</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="card card-primary mt-3">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="card-title mb-0">{group.name}</h3>
                <p className="text-muted mb-0 mt-1">{group.description}</p>
              </div>
              <span className={`badge ${group.privacy === 'private' ? 'bg-warning' : 'bg-success'} p-2`}>
                {group.privacy}
              </span>
            </div>
          </div>
          
          <div className="card-body">
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'members' ? 'active' : ''}`}
                  onClick={() => setActiveTab('members')}
                >
                  <i className="bi bi-people-fill me-1"></i>
                  Members
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'discussions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('discussions')}
                >
                  <i className="bi bi-chat-dots-fill me-1"></i>
                  Discussions
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <i className="bi bi-gear-fill me-1"></i>
                  Settings
                </button>
              </li>
            </ul>

            {activeTab === 'members' && (
              <GroupMembers 
                groupId={group.uuid}
                isOwner={group.is_owner}
              />
            )}

            {activeTab === 'discussions' && (
              <div className="text-center py-5">
                <i className="bi bi-chat-dots display-1 text-muted mb-3"></i>
                <p className="text-muted">Discussions feature coming soon...</p>
              </div>
            )}

            {activeTab === 'settings' && group.is_owner && (
              <div className="text-center py-5">
                <i className="bi bi-gear display-1 text-muted mb-3"></i>
                <p className="text-muted">Group settings coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}