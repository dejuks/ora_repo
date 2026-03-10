export default function PublicUserEdit({ uuid }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    getPublicUser(uuid).then(res => setForm(res.data));
  }, [uuid]);

  const save = async () => {
    await updatePublicUser(uuid, form);
    alert("Updated");
  };

  return (
    <>
      <input value={form.full_name||""} onChange={e=>setForm({...form,full_name:e.target.value})}/>
      <input value={form.affiliation||""} onChange={e=>setForm({...form,affiliation:e.target.value})}/>
      <input value={form.country||""} onChange={e=>setForm({...form,country:e.target.value})}/>
      <button onClick={save}>Save</button>
    </>
  );
}
