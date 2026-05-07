export default function PublicUserCreate() {
  const [form, setForm] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    await createPublicUser(form);
    alert("Registered successfully");
  };

  return (
    <form onSubmit={submit}>
      <input placeholder="Full Name" onChange={e=>setForm({...form,full_name:e.target.value})} />
      <input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})} />
      <input type="password" placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})} />
      <input placeholder="Affiliation" onChange={e=>setForm({...form,affiliation:e.target.value})} />
      <input placeholder="Country" onChange={e=>setForm({...form,country:e.target.value})} />
      <button>Create</button>
    </form>
  );
}
