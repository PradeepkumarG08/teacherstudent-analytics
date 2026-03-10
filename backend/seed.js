

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const User = require("./models/User")
const Article = require("./models/Article")
const Analytics = require("./models/Analytics")
const Highlight = require("./models/Highlight")

mongoose.connect("mongodb+srv://analytic_db_user:pradeep_2002@cluster1.meacgzu.mongodb.net/analytics_dashboard")

async function seed() {

  await User.deleteMany()
  await Article.deleteMany()
  await Analytics.deleteMany()
  await Highlight.deleteMany()

  console.log("Old data cleared")

  const password = await bcrypt.hash("123456", 10)

  // =========================
  // USERS (3 Teachers + 10 Students)
  // =========================

  const teachers = await User.insertMany([
    { name: "Dr. Smith", role: "teacher", email: "smith@test.com", password },
    { name: "Prof. Johnson", role: "teacher", email: "johnson@test.com", password },
    { name: "Dr. Williams", role: "teacher", email: "williams@test.com", password }
  ])

  const students = await User.insertMany([
    { name: "John", role: "student", email: "john@test.com", password },
    { name: "Emma", role: "student", email: "emma@test.com", password },
    { name: "Alex", role: "student", email: "alex@test.com", password },
    { name: "Sophia", role: "student", email: "sophia@test.com", password },
    { name: "Liam", role: "student", email: "liam@test.com", password },
    { name: "Olivia", role: "student", email: "olivia@test.com", password },
    { name: "Noah", role: "student", email: "noah@test.com", password },
    { name: "Ava", role: "student", email: "ava@test.com", password },
    { name: "Ethan", role: "student", email: "ethan@test.com", password },
    { name: "Mia", role: "student", email: "mia@test.com", password }
  ])

  console.log("Users seeded")

  // =========================
  // ARTICLES
  // =========================

  const articles = await Article.insertMany([
    {
      title: "Solar System",
      category: "Science",
      createdBy: teachers[0]._id,
      contentBlocks: [
        { type: "text", content: "The solar system consists of planets orbiting the sun." },
        { type: "image", content: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06" }
      ]
    },
    {
      title: "Basic Algebra",
      category: "Math",
      createdBy: teachers[1]._id,
      contentBlocks: [
        { type: "text", content: "Algebra uses symbols and letters to represent numbers." },
        { type: "video", content: "https://www.youtube.com/watch?v=grnP3mduZkM" }
      ]
    },
    {
      title: "English Grammar",
      category: "English",
      createdBy: teachers[2]._id,
      contentBlocks: [
        { type: "text", content: "Grammar is the system of a language." }
      ]
    }
  ])

  console.log("Articles seeded")

  // =========================
  // ANALYTICS (student reading stats)
  // =========================

  const analyticsData = []

  students.forEach(student => {
    articles.forEach(article => {

      analyticsData.push({
        articleId: article._id,
        studentId: student._id,
        views: Math.floor(Math.random() * 5) + 1,
        duration: Math.floor(Math.random() * 300) + 60
      })

    })
  })

  await Analytics.insertMany(analyticsData)

  console.log("Analytics seeded")

  // =========================
  // HIGHLIGHTS
  // =========================

  const highlightData = []

  students.slice(0,6).forEach(student => {

    highlightData.push({
      studentId: student._id,
      articleId: articles[0]._id,
      text: "Important concept about planets",
      timestamp: new Date()
    })

  })

  await Highlight.insertMany(highlightData)

  console.log("Highlights seeded")

  console.log("Database seeding complete")

  mongoose.connection.close()

}

seed()