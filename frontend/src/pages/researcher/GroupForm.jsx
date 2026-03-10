import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createGroupAPI,
  getGroupAPI,
  updateGroupAPI,
} from "../../api/researcher.group.api";

export default function GroupForm() {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const navigate = useNavigate();
  const { uuid } = useParams();

  useEffect(() => {
    if (uuid) {
      loadGroup();
    }
  }, [uuid]);

  const loadGroup = async () => {
    const data = await getGroupAPI(uuid);
    setForm({
      name: data.name,
      description: data.description,
    });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uuid) {
      await updateGroupAPI(uuid, form);
    } else {
      await createGroupAPI(form);
    }

    navigate("/groups");
  };

  return (
    <div className="container mt-5">
      <h3>{uuid ? "Edit Group" : "Create Group"}</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Group Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Description</label>
          <textarea
            className="form-control"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <button className="btn btn-success">
          {uuid ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
}
