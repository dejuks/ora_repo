import React, { useState, useEffect } from "react";

const JournalForm = ({ onSubmit, journal }) => {
  const [title, setTitle] = useState("");
  const [issn, setIssn] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (journal) {
      setTitle(journal.title);
      setIssn(journal.issn);
      setDescription(journal.description);
    }
  }, [journal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, issn, description });
    setTitle("");
    setIssn("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>ISSN:</label>
        <input
          type="text"
          value={issn}
          onChange={(e) => setIssn(e.target.value)}
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button type="submit">{journal ? "Update" : "Create"}</button>
    </form>
  );
};

export default JournalForm;
