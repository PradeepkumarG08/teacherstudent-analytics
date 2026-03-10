import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Pie } from "react-chartjs-2";
import API from "../api";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StudentDashboard() {

  const [articles, setArticles] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [stats, setStats] = useState({ totalRead: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const articlesRes = await API.get("/articles");
        const trackingRes = await API.get("/tracking");
        const highlightsRes = await API.get("/student/highlights");

        console.log("ARTICLES:", articlesRes.data);
        console.log("TRACKING:", trackingRes.data);
        console.log("HIGHLIGHTS:", highlightsRes.data);

        const articleList =
          articlesRes.data?.articles ||
          articlesRes.data?.data ||
          articlesRes.data ||
          [];

        const analyticsList =
          trackingRes.data?.tracking ||
          trackingRes.data?.analytics ||
          trackingRes.data?.data ||
          trackingRes.data ||
          [];

        const highlightList =
          highlightsRes.data?.highlights ||
          highlightsRes.data?.data ||
          highlightsRes.data ||
          [];

        const safeArticles = Array.isArray(articleList) ? articleList : [];
        const safeAnalytics = Array.isArray(analyticsList) ? analyticsList : [];
        const safeHighlights = Array.isArray(highlightList) ? highlightList : [];

        setArticles(safeArticles);
        setAnalytics(safeAnalytics);
        setHighlights(safeHighlights);

        // UNIQUE ARTICLES READ
        const unique = new Set();

        safeAnalytics.forEach(a => {

          if (!a || !a.articleId) return;

          const id =
            typeof a.articleId === "object"
              ? a.articleId?._id
              : a.articleId;

          if (id) unique.add(String(id));

        });

        setStats({ totalRead: unique.size });

      } catch (error) {

        console.error("Dashboard API Error:", error);

      } finally {

        setLoading(false);

      }
    };

    fetchData();

  }, []);

  // ==========================
  // CATEGORY TIME CALCULATION
  // ==========================

  const categoryTime = {};

  analytics.forEach(a => {

    if (!a || !a.articleId) return;

    const id =
      typeof a.articleId === "object"
        ? a.articleId?._id
        : a.articleId;

    if (!id) return;

    const article = articles.find(
      x => String(x._id) === String(id)
    );

    if (!article) return;

    const cat = article.category || "Other";

    categoryTime[cat] =
      (categoryTime[cat] || 0) + (a.duration || 0);

  });

  const pieData = {
    labels: Object.keys(categoryTime),
    datasets: [
      {
        data: Object.values(categoryTime),
        backgroundColor: [
          "#6366f1",
          "#22c55e",
          "#ef4444",
          "#f59e0b",
          "#3b82f6"
        ]
      }
    ]
  };

  if (loading) {

    return (
      <div className="flex justify-center items-center h-screen text-xl font-bold">
        Loading Dashboard...
      </div>
    );

  }

  return (
    <div className="p-6 space-y-8 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold text-gray-700">
        Student Dashboard
      </h1>

      {/* STATS */}

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-blue-500 text-white p-6 rounded-xl shadow">
          <p>Total Articles Read</p>
          <h2 className="text-3xl font-bold">
            {stats.totalRead}
          </h2>
        </div>

        <div className="bg-green-500 text-white p-6 rounded-xl shadow">
          <p>Highlights Saved</p>
          <h2 className="text-3xl font-bold">
            {highlights.length}
          </h2>
        </div>

      </div>

      {/* PIE CHART */}

      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="font-bold mb-4">
          Reading Time per Category
        </h2>

        {pieData.labels.length > 0 ? (
          <Pie data={pieData} />
        ) : (
          <p>No analytics yet.</p>
        )}

      </div>

      {/* RECENT ARTICLES */}

      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="font-bold mb-4">
          Recently Read Articles
        </h2>

        {analytics.length === 0 && (
          <p>No articles read yet.</p>
        )}

        {analytics.slice(-5).reverse().map((a, i) => {

          if (!a || !a.articleId) return null;

          const id =
            typeof a.articleId === "object"
              ? a.articleId?._id
              : a.articleId;

          const article = articles.find(
            x => String(x._id) === String(id)
          );

          return (
            <div
              key={i}
              className="p-3 border rounded-lg flex justify-between"
            >

              <span>
                {article?.title || "Unknown Article"}
              </span>

              <span className="text-gray-500 text-sm">
                {Math.round((a.duration || 0) / 60)} min
              </span>

            </div>
          );

        })}

      </div>

      {/* HIGHLIGHTS */}

      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="font-bold mb-4">
          My Highlights
        </h2>

        {highlights.length === 0 && (
          <p>No highlights yet.</p>
        )}

        {highlights.slice(0,5).map((h,i)=>{

          if (!h || !h.articleId) return null;

          const id =
            typeof h.articleId === "object"
              ? h.articleId?._id
              : h.articleId;

          const article = articles.find(
            x => String(x._id) === String(id)
          );

          return(

            <div key={i} className="border p-3 rounded-lg">

              <p>{h.text}</p>

              <p className="text-xs text-gray-400 mt-1">
                {article?.title || "Article"}
              </p>

            </div>

          )

        })}

      </div>

    </div>
  );
}