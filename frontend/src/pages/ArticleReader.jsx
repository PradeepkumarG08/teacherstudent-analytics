import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getArticle } from "../api";
import API from "../api";

export default function ArticleReader() {

  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [highlights, setHighlights] = useState([]);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const startTimeRef = useRef(Date.now());
  const loggedRef = useRef(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (id) loadArticle();
  }, [id]);

  useEffect(() => {
    if (article?._id) startTimeRef.current = Date.now();
  }, [article]);

  const loadArticle = async () => {
    try {

      setLoading(true);

      const res = await getArticle(id);

      const data =
        res?.data?.article ||
        res?.data ||
        null;

      setArticle(data);

      loadHighlights();
      loadComments();

    } catch (err) {
      console.error("Error loading article:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveRecentlyRead = () => {

    if (!article?._id) return;

    const existing =
      JSON.parse(localStorage.getItem("recentArticles")) || [];

    const updated = [
      {
        id: article._id,
        title: article.title,
        category: article.category,
        time: new Date().toISOString()
      },
      ...existing.filter(a => a.id !== article._id)
    ].slice(0, 10);

    localStorage.setItem(
      "recentArticles",
      JSON.stringify(updated)
    );
  };

  // TRACKING
  const logView = async () => {

    try {

      if (!article?._id || loggedRef.current || !userId) return;

      loggedRef.current = true;

      const duration = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );

      const payload = {
        studentId: userId,
        articleId: article._id,
        timeSpent: duration
      };

      await API.post("/tracking", payload);

      saveRecentlyRead();

    } catch (err) {
      console.error("Error logging article view:", err);
    }
  };

  useEffect(() => {

    const handleBeforeUnload = () => logView();

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      logView();
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };

  }, [article]);

  // =========================
  // HIGHLIGHT
  // =========================
  const handleHighlight = async () => {

    try {

      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (!selectedText) {
        alert("Please select text to highlight");
        return;
      }

      if (!article?._id || !userId) return;

      const payload = {
        studentId: userId,
        articleId: article._id,
        text: selectedText
      };

      await API.post("/student/highlights", payload);

      selection.removeAllRanges();

      loadHighlights();

    } catch (err) {
      console.error("Highlight error:", err);
    }
  };

  const loadHighlights = async () => {

    try {

      const res = await API.get("/student/highlights");

      const data =
        Array.isArray(res.data)
          ? res.data.filter(
              h =>
                String(h.articleId?._id || h.articleId) === id &&
                h.text
            )
          : [];

      setHighlights(data);

    } catch (err) {
      console.error(err);
      setHighlights([]);
    }
  };

  // =========================
  // COMMENTS
  // =========================
  const submitComment = async () => {

    if (!comment.trim()) return;

    if (!article?._id || !userId) return;

    try {

      const payload = {
        studentId: userId,
        articleId: article._id,
        text: comment
      };

      await API.post("/student/highlights", payload);

      setComment("");

      loadComments();

    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const loadComments = async () => {

    try {

      const res = await API.get("/student/highlights");

      const data =
        Array.isArray(res.data)
          ? res.data.filter(
              c =>
                String(c.articleId?._id || c.articleId) === id &&
                c.text
            )
          : [];

      setComments(data);

    } catch (err) {
      console.error(err);
      setComments([]);
    }
  };

  if (loading)
    return (
      <p className="p-6 animate-pulse">
        Loading article...
      </p>
    );

  if (!article)
    return (
      <p className="p-6 text-red-500">
        Article not found.
      </p>
    );

  return (

    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-2">
        {article.title}
      </h1>

      <p className="text-gray-500 mb-6">
        {article.category || "Uncategorized"}
      </p>

      <button
        onClick={handleHighlight}
        className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded mb-4"
      >
        Highlight Selected Text
      </button>

      {article.contentBlocks?.map((block, i) => {

        if (block.type === "text") {
          return (
            <p
              key={i}
              className="mb-4 text-lg leading-relaxed"
            >
              {block.value}
            </p>
          );
        }

        if (block.type === "image") {
          return (
            <img
              key={i}
              src={block.value}
              alt=""
              className="rounded-lg mb-6 w-full"
            />
          );
        }

        if (block.type === "video") {
          return (
            <iframe
              key={i}
              src={block.value}
              className="w-full h-64 mb-6 rounded-lg"
              allowFullScreen
              title={`video-${i}`}
            />
          );
        }

        return null;
      })}

      {/* Highlights */}
      <div className="mt-8">

        <h2 className="font-bold text-xl mb-3">
          Highlights
        </h2>

        {highlights.map((h, i) => (
          <div
            key={i}
            className="bg-yellow-100 p-2 mb-2 rounded"
          >
            {h.text}
          </div>
        ))}

      </div>

      {/* Comments */}
      <div className="mt-8">

        <h2 className="font-bold text-xl mb-3">
          Comments
        </h2>

        {comments.map((c, i) => (
          <div
            key={i}
            className="border p-2 mb-2 rounded"
          >
            {c.text}
          </div>
        ))}

        <textarea
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
          className="w-full border p-2 mt-3 rounded"
          placeholder="Write a comment..."
        />

        <button
          onClick={submitComment}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-2 rounded"
        >
          Post Comment
        </button>

      </div>

    </div>
  );
}