import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10000
});

/* Add JWT token automatically */
API.interceptors.request.use(
  (req) => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }

      return req;
    } catch (error) {
      console.error("Request Interceptor Error:", error);
      return req;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* Handle response errors globally */
API.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response) {

      /* Token expired or unauthorized */
      if (error.response.status === 401) {
        console.warn("Unauthorized. Please login again.");
        localStorage.removeItem("token");
      }

      /* Server error */
      if (error.response.status === 500) {
        console.error("Server Error:", error.response.data);
      }

    } else if (error.request) {
      console.error("No response from server");
    } else {
      console.error("Axios Error:", error.message);
    }

    return Promise.reject(error);
  }
);

/* ================= ARTICLES ================= */

export const getArticles = () => API.get("/articles");

export const getArticle = (id) =>
  API.get(`/articles/${id}`);

export const createArticle = (data) =>
  API.post("/articles", data);

export const updateArticle = (id, data) =>
  API.put(`/articles/${id}`, data);

export const deleteArticle = (id) =>
  API.delete(`/articles/${id}`);


/* ================= TRACKING ================= */

export const getTracking = () =>
  API.get("/tracking");

export const createTracking = (data) =>
  API.post("/tracking", data);


/* ================= HIGHLIGHTS ================= */

export const getHighlights = () =>
  API.get("/student/highlights");

export const createHighlight = (data) =>
  API.post("/student/highlights", data);


/* ================= ANALYTICS ================= */

export const getAnalyticsViews = () =>
  API.get("/analytics/views");

export const getAnalyticsDuration = () =>
  API.get("/analytics/duration");

export const getAnalyticsDaily = () =>
  API.get("/analytics/daily");

export const getAnalyticsTopStudents = () =>
  API.get("/analytics/top-students");


export default API;