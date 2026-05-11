import React, { useState, useEffect } from "react";
import JournalList from "../components/JournalList.jsx";
import JournalForm from "../components/JournalForm.jsx";
import {
  getJournals,
  createJournal,
  updateJournal,
  deleteJournal,
} from "../api/journalApi.js";

const JournalsPage = () => {
  const [journals, setJournals] = useState([]);
  const [editingJournal, setEditingJournal] = useState(null);

  const fetchJournals = async () => {
    const data = await getJournals();
    setJournals(data);
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleCreate = async (journal) => {
    await createJournal(journal);
    fetchJournals();
  };

  const handleUpdate = async (journal) => {
    await updateJournal(editingJournal.id, journal);
    setEditingJournal(null);
    fetchJournals();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this journal?")) {
      await deleteJournal(id);
      fetchJournals();
    }
  };

  const handleSubmit = (journal) => {
    if (editingJournal) {
      handleUpdate(journal);
    } else {
      handleCreate(journal);
    }
  };

  return (
    <div>
      <h1>Journals</h1>
      <JournalForm onSubmit={handleSubmit} journal={editingJournal} />
      <JournalList
        journals={journals}
        onEdit={setEditingJournal}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default JournalsPage;
