import { useEffect, useState } from "react";
import { getArticles } from "../api";
import { Link } from "react-router-dom";

export default function Articles() {

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getArticles();

      // Adjust according to backend response shape
      const data = Array.isArray(res?.data)
        ? res.data
        : res?.data?.articles || [];

      setArticles(data);

    } catch (err) {
      console.error("Error loading articles:", err);
      setError("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-gray-500 animate-pulse">
          Loading articles...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Articles
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {articles.map(article => (

          <Link
            key={article?._id}
            to={`/article/${article?._id}`}
            className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
          >

            {/* Optional image if backend provides */}
            {article?.image && (
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}

            <h2 className="text-lg font-semibold">
              {article?.title || "Untitled Article"}
            </h2>

            <p className="text-sm text-gray-500">
              {article?.category || "Uncategorized"}
            </p>

          </Link>

        ))}

      </div>

      {articles.length === 0 && (
        <p className="text-gray-500 mt-4">
          No articles available.
        </p>
      )}

    </div>
  );
}