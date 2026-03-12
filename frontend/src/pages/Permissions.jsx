import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../api/permission.api";
import Swal from "sweetalert2";

const MODULE_GROUP_OPTIONS = [
  "System Wide",
  "Library Management",
  "eBook Publishing",
  "Journal Management",
  "ORA Repository Management",
  "Oromo Wikipedia",
  "Researchers' Network",
];

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingMultiple, setDeletingMultiple] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 20;

  const [selectedIds, setSelectedIds] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [permName, setPermName] = useState("");
  const [permGroup, setPermGroup] = useState("System Wide");

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await getPermissions();
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setPermissions(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load permissions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const normalizedPermissions = useMemo(() => {
    return permissions.map((p) => {
      let parsed = null;

      if (typeof p.name === "string" && p.name.trim().startsWith("{")) {
        try {
          parsed = JSON.parse(p.name);
        } catch {
          parsed = null;
        }
      }

      return {
        ...p,
        uuid: p.uuid,
        name: parsed?.name || p.name || "",
        module_group: p.module_group || parsed?.module_group || "System Wide",
      };
    });
  }, [permissions]);

  const filteredPermissions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return normalizedPermissions;

    return normalizedPermissions.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const group = (p.module_group || "System Wide").toLowerCase();
      return name.includes(q) || group.includes(q);
    });
  }, [normalizedPermissions, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const groupedPermissions = useMemo(() => {
    const grouped = MODULE_GROUP_OPTIONS.reduce((acc, group) => {
      acc[group] = [];
      return acc;
    }, {});

    filteredPermissions.forEach((p) => {
      const group = p.module_group || "System Wide";
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(p);
    });

    Object.keys(grouped).forEach((group) => {
      grouped[group].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    });

    return grouped;
  }, [filteredPermissions]);

  const flattenedRows = useMemo(() => {
    const rows = [];

    Object.entries(groupedPermissions).forEach(([group, perms]) => {
      if (!perms.length) return;

      rows.push({
        type: "group",
        key: `group-${group}`,
        group,
      });

      perms.forEach((perm) => {
        rows.push({
          type: "permission",
          key: perm.uuid,
          group,
          data: perm,
        });
      });
    });

    return rows;
  }, [groupedPermissions]);

  const totalPages = Math.ceil(flattenedRows.length / PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * PER_PAGE;
  const paginatedRows = flattenedRows.slice(startIndex, startIndex + PER_PAGE);

  const pagePermissionRows = paginatedRows.filter((r) => r.type === "permission");
  const pagePermissionIds = pagePermissionRows.map((r) => r.data.uuid);

  const allPageSelected =
    pagePermissionIds.length > 0 &&
    pagePermissionIds.every((id) => selectedIds.includes(id));

  const toggleSelectAllOnPage = () => {
    if (allPageSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !pagePermissionIds.includes(id))
      );
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pagePermissionIds])]);
    }
  };

  const togglePermissionSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleGroupSelection = (groupName) => {
    const groupIds = (groupedPermissions[groupName] || []).map((p) => p.uuid);
    const allSelected =
      groupIds.length > 0 && groupIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...groupIds])]);
    }
  };

  const isGroupFullySelected = (groupName) => {
    const groupIds = (groupedPermissions[groupName] || []).map((p) => p.uuid);
    return groupIds.length > 0 && groupIds.every((id) => selectedIds.includes(id));
  };

  const clearSelection = () => setSelectedIds([]);

  const escapeRegExp = (value = "") =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightText = (text, keyword) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
    return String(text).replace(regex, `<mark>$1</mark>`);
  };

  const openCreate = () => {
    setEditingId(null);
    setPermName("");
    setPermGroup("System Wide");
    setShowModal(true);
  };

  const openEdit = (perm) => {
    setEditingId(perm.uuid);
    setPermName(perm.name || "");
    setPermGroup(perm.module_group || "System Wide");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setPermName("");
    setPermGroup("System Wide");
  };

  const savePermission = async () => {
    if (!permName.trim()) {
      Swal.fire("Error", "Permission name is required", "error");
      return;
    }

    try {
      if (editingId) {
        await updatePermission(editingId, {
          name: permName.trim(),
          module_group: permGroup,
        });

        Swal.fire("Updated", "Permission updated", "success");
      } else {
        await createPermission({
          name: permName.trim(),
          module_group: permGroup,
        });

        Swal.fire("Created", "Permission created", "success");
      }

      closeModal();
      fetchPermissions();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Operation failed",
        "error"
      );
    }
  };

  const removePermission = async (uuid) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This permission will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        await deletePermission(uuid);
        setSelectedIds((prev) => prev.filter((x) => x !== uuid));
        Swal.fire("Deleted!", "Permission removed", "success");
        fetchPermissions();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete permission", "error");
      }
    }
  };

  const removeSelectedPermissions = async () => {
    if (!selectedIds.length) {
      Swal.fire("Info", "Please select at least one permission", "info");
      return;
    }

    const result = await Swal.fire({
      title: "Delete selected permissions?",
      text: `You are about to delete ${selectedIds.length} permission(s).`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete selected",
    });

    if (!result.isConfirmed) return;

    setDeletingMultiple(true);
    try {
      for (const id of selectedIds) {
        await deletePermission(id);
      }

      Swal.fire("Deleted!", "Selected permissions removed", "success");
      setSelectedIds([]);
      fetchPermissions();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete some permissions", "error");
    } finally {
      setDeletingMultiple(false);
    }
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Permissions Management</h1>
            </div>
            <div className="col-sm-6 text-right">
              <button className="btn btn-primary mr-2" onClick={openCreate}>
                <i className="fas fa-plus mr-1"></i> Add Permission
              </button>

              <button
                className="btn btn-danger"
                onClick={removeSelectedPermissions}
                disabled={!selectedIds.length || deletingMultiple}
              >
                <i className="fas fa-trash mr-1"></i>
                Delete Selected ({selectedIds.length})
              </button>
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-md-6">
              <div
                className="input-group input-group-sm"
                style={{ maxWidth: 320 }}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search permission or module group..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="input-group-append">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-6 text-right">
              <button
                className="btn btn-sm btn-outline-primary mr-2"
                onClick={toggleSelectAllOnPage}
                disabled={!pagePermissionIds.length}
              >
                {allPageSelected ? "Unselect Page" : "Select Page"}
              </button>

              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={clearSelection}
                disabled={!selectedIds.length}
              >
                Clear Selection
              </button>
            </div>
          </div>

          <div className="card card-outline card-primary">
            <div className="card-body table-responsive p-0">
              <table className="table table-hover text-nowrap">
                <thead>
                  <tr>
                    <th width="50">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleSelectAllOnPage}
                        disabled={!pagePermissionIds.length}
                      />
                    </th>
                    <th width="60">#</th>
                    <th>Permission Name</th>
                    <th width="260">Module Group</th>
                    <th width="140">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No permissions found
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, idx) => {
                      if (row.type === "group") {
                        const count = groupedPermissions[row.group]?.length || 0;
                        const groupSelected = isGroupFullySelected(row.group);

                        return (
                          <tr key={row.key} className="bg-light font-weight-bold">
                            <td>
                              <input
                                type="checkbox"
                                checked={groupSelected}
                                onChange={() => toggleGroupSelection(row.group)}
                              />
                            </td>
                            <td colSpan="4">
                              <i className="fas fa-folder-open mr-2"></i>
                              {row.group} ({count})
                            </td>
                          </tr>
                        );
                      }

                      const p = row.data;
                      const checked = selectedIds.includes(p.uuid);

                      return (
                        <tr key={row.key}>
                          <td>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermissionSelection(p.uuid)}
                            />
                          </td>
                          <td>{startIndex + idx + 1}</td>
                          <td
                            dangerouslySetInnerHTML={{
                              __html: highlightText(p.name, search),
                            }}
                          />
                          <td
                            dangerouslySetInnerHTML={{
                              __html: highlightText(
                                p.module_group || "System Wide",
                                search
                              ),
                            }}
                          />
                          <td>
                            <button
                              className="btn btn-sm btn-info mr-1"
                              onClick={() => openEdit(p)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => removePermission(p.uuid)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="card-footer clearfix">
                <ul className="pagination pagination-sm m-0 float-right">
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      &laquo;
                    </button>
                  </li>

                  {[...Array(totalPages)].map((_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {showModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingId ? "Update Permission" : "Create Permission"}
                  </h5>
                  <button className="close" onClick={closeModal}>
                    <span>&times;</span>
                  </button>
                </div>

                <div className="modal-body">
                  <div className="form-group">
                    <label>Permission Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={permName}
                      onChange={(e) => setPermName(e.target.value)}
                      placeholder="Example: library.book.create"
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label>Module Group</label>
                    <select
                      className="form-control"
                      value={permGroup}
                      onChange={(e) => setPermGroup(e.target.value)}
                    >
                      {MODULE_GROUP_OPTIONS.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={savePermission}>
                    {editingId ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </MainLayout>
  );
}