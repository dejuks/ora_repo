import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { getReviewerWorkspaceAPI } from "../../../api/reviewer.api";

export default function ReviewerWorkspace() {
  const [data, setData] = useState([]); // MUST start as array
  const [loading, setLoading] = useState(true);

  const fetchWorkspace = async () => {
    try {
      const res = await getReviewerWorkspaceAPI();

      // 🔥 SAFETY FIX
      const manuscripts = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.rows || [];

      setData(manuscripts);

    } catch (error) {
      console.error("Workspace fetch error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  return (
    <MainLayout>
      <div className="p-4">

        <h2 className="text-xl font-bold mb-4">
          Reviewer Workspace
        </h2>

        {loading && <p>Loading...</p>}

        {!loading && data.length === 0 && (
          <p>No assigned manuscripts</p>
        )}

        {!loading &&
          data.map((item) => (
            <div
              key={item.uuid}
              className="border rounded p-3 mb-3"
            >
              <h3 className="font-semibold">{item.title}</h3>

              <p>Status: {item.status}</p>
              <p>Author: {item.author}</p>

            </div>
          ))}

      </div>
    </MainLayout>
  );
}
