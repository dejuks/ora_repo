export default function PublicUserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getPublicUsers().then(res => setUsers(res.data));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th><th>Email</th><th>Country</th><th>Action</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.uuid}>
            <td>{u.full_name}</td>
            <td>{u.email}</td>
            <td>{u.country}</td>
            <td>
              <button onClick={()=>deletePublicUser(u.uuid)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
