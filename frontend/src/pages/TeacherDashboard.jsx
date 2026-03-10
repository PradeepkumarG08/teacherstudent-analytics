import { useEffect, useState } from "react"

import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
LineElement,
PointElement,
ArcElement,
Tooltip,
Legend
} from "chart.js"

import { Bar, Pie, Line } from "react-chartjs-2"

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
LineElement,
PointElement,
ArcElement,
Tooltip,
Legend
)

export default function TeacherDashboard(){

const [stats,setStats]=useState({
articles:0,
students:0
})

const [articles,setArticles]=useState([])
const [engagement,setEngagement]=useState([])
const [loading,setLoading]=useState(true)


// =============================
// CRUD STATES
// =============================

const [showForm,setShowForm]=useState(false)
const [editingArticle,setEditingArticle]=useState(null)

const [formData,setFormData]=useState({
title:"",
category:"",
content:""
})



// =============================
// FETCH DASHBOARD DATA
// =============================

useEffect(()=>{

const fetchDashboardData=async()=>{

try{

const token=localStorage.getItem("token")

const headers={
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
}

const fetchJSON = async (url) => {

const res = await fetch(url,{headers})

if(!res.ok){
console.warn("API not found:",url)
return []
}

return await res.json()

}


// FETCH DATA
const articlesData=await fetchJSON("http://localhost:5000/api/articles")
const engagementData=await fetchJSON("http://localhost:5000/api/tracking")

// 🔹 NEW: FETCH STUDENTS FROM DB
const studentsData=await fetchJSON("http://localhost:5000/api/users?role=student")

const articleList=Array.isArray(articlesData)
?articlesData
:articlesData?.articles || []

const engagementList=Array.isArray(engagementData)
?engagementData
:engagementData?.tracking || []

const studentList=Array.isArray(studentsData)
?studentsData
:studentsData?.users || []

setArticles(articleList)
setEngagement(engagementList)

// =============================
// UNIQUE STUDENTS FROM TRACKING
// =============================

const uniqueStudents=new Set()

engagementList.forEach(e=>{
if(e.userId){
const id=typeof e.userId==="object"?e.userId._id:e.userId
uniqueStudents.add(id)
}
})

// UNIQUE STUDENTS FROM DATABASE
setStats({
articles:articleList.length,
students:uniqueStudents.size
})

}catch(err){
console.error("Dashboard Error:",err)
}

setLoading(false)

}

fetchDashboardData()

},[])



// =============================
// CREATE OR UPDATE ARTICLE
// =============================

const handleSubmit=async(e)=>{
e.preventDefault()

try{

const token=localStorage.getItem("token")

const method=editingArticle?"PUT":"POST"

const url=editingArticle
?`http://localhost:5000/api/articles/${editingArticle._id}`
:"http://localhost:5000/api/articles"

await fetch(url,{
method,
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({
title:formData.title,
category:formData.category,
contentBlocks:[
{type:"text",value:formData.content}
]
})
})

setShowForm(false)
setEditingArticle(null)

window.location.reload()

}catch(err){
console.error("Save article error:",err)
}

}



// =============================
// DELETE ARTICLE
// =============================

const deleteArticle=async(id)=>{

if(!window.confirm("Delete this article?")) return

try{

const token=localStorage.getItem("token")

await fetch(`http://localhost:5000/api/articles/${id}`,{
method:"DELETE",
headers:{
Authorization:`Bearer ${token}`
}
})

setArticles(prev=>prev.filter(a=>a._id!==id))

}catch(err){
console.error("Delete error:",err)
}

}



// =============================
// EDIT ARTICLE
// =============================

const editArticle=(article)=>{

setEditingArticle(article)

setFormData({
title:article.title,
category:article.category,
content:article.contentBlocks?.[0]?.value || ""
})

setShowForm(true)

}



// =============================
// ARTICLE VIEWS
// =============================

const articleViews={}

engagement.forEach(e=>{

if(!e.articleId) return

const id=typeof e.articleId === "object"
?e.articleId._id
:e.articleId

articleViews[id]=(articleViews[id] || 0)+1

})


const barData={
labels:articles.map(a=>a.title || "Untitled"),
datasets:[
{
label:"Article Reads",
data:articles.map(a=>articleViews[a._id] || 0),
backgroundColor:"#3b82f6"
}
]
}



// =============================
// CATEGORY DISTRIBUTION
// =============================

const categories={}

articles.forEach(a=>{
const cat=a.category || "Other"
categories[cat]=(categories[cat] || 0)+1
})

const pieData={
labels:Object.keys(categories),
datasets:[
{
data:Object.values(categories),
backgroundColor:[
"#6366f1",
"#ef4444",
"#22c55e",
"#f59e0b",
"#3b82f6"
]
}
]
}



// =============================
// DAILY ENGAGEMENT
// =============================

const dailyViews={}

engagement.forEach(e=>{

if(!e.timestamp) return

const date=new Date(e.timestamp).toLocaleDateString()

dailyViews[date]=(dailyViews[date] || 0)+1

})

const sortedDates=Object.keys(dailyViews).sort((a,b)=>new Date(a)-new Date(b))

const lineData={
labels:sortedDates,
datasets:[
{
label:"Daily Engagement",
data:sortedDates.map(d=>dailyViews[d]),
borderColor:"#10b981",
backgroundColor:"#10b981",
tension:0.4
}
]
}



// =============================
// TOP CATEGORIES
// =============================

const topCategories=Object.entries(categories)
.sort((a,b)=>b[1]-a[1])
.slice(0,3)



// =============================
// STUDENT READING PROGRESS
// =============================

const studentReads={}

engagement.forEach(e=>{

if(!e.userId) return

const id=typeof e.userId === "object"
?e.userId._id
:e.userId

studentReads[id]=(studentReads[id] || 0)+1

})

const studentProgress={
labels:Object.keys(studentReads).map((id,i)=>`Student ${i+1}`),
datasets:[
{
label:"Articles Read",
data:Object.values(studentReads),
backgroundColor:"#8b5cf6"
}
]
}



if(loading){
return(
<div className="flex items-center justify-center h-screen text-xl font-semibold">
Loading Dashboard...
</div>
)
}



return(

<div className="p-6 space-y-8 bg-gray-100 min-h-screen">

<h1 className="text-3xl font-bold text-gray-700">
Teacher Analytics Dashboard
</h1>



{/* ============================= */}
{/* ARTICLE CRUD SECTION */}
{/* ============================= */}

<div className="bg-white p-6 rounded-xl shadow overflow-x-auto">

<div className="flex justify-between mb-4">

<h2 className="text-xl font-bold">
Manage Articles
</h2>

<button
onClick={()=>setShowForm(true)}
className="bg-blue-500 text-white px-4 py-2 rounded"
>
Create Article
</button>

</div>

<table className="w-full text-left">

<thead>
<tr className="border-b">
<th className="py-2">Title</th>
<th>Category</th>
<th>Actions</th>
</tr>
</thead>

<tbody>

{articles.map(article=>(

<tr key={article._id} className="border-b">

<td className="py-2">{article.title}</td>
<td>{article.category}</td>

<td className="space-x-2">

<button
onClick={()=>editArticle(article)}
className="bg-yellow-400 px-3 py-1 rounded text-white"
>
Edit
</button>

<button
onClick={()=>deleteArticle(article._id)}
className="bg-red-500 px-3 py-1 rounded text-white"
>
Delete
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>



{/* ============================= */}
{/* ARTICLE FORM */}
{/* ============================= */}

{showForm && (

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="text-xl font-bold mb-4">
{editingArticle?"Edit Article":"Create Article"}
</h2>

<form onSubmit={handleSubmit} className="space-y-4">

<input
className="w-full border p-2 rounded"
placeholder="Title"
value={formData.title}
onChange={(e)=>setFormData({...formData,title:e.target.value})}
/>

<input
className="w-full border p-2 rounded"
placeholder="Category"
value={formData.category}
onChange={(e)=>setFormData({...formData,category:e.target.value})}
/>

<textarea
className="w-full border p-2 rounded"
rows="5"
placeholder="Content"
value={formData.content}
onChange={(e)=>setFormData({...formData,content:e.target.value})}
/>

<button
className="bg-green-500 text-white px-4 py-2 rounded"
type="submit"
>
Save Article
</button>

</form>

</div>

)}



{/* ============================= */}
{/* YOUR ORIGINAL DASHBOARD */}
{/* ============================= */}



{/* STATS */}

<div className="grid md:grid-cols-3 gap-6">

<div className="bg-blue-500 text-white p-6 rounded-xl shadow">
<p className="text-sm opacity-80">Articles Created</p>
<h2 className="text-3xl font-bold">{stats.articles}</h2>
</div>

<div className="bg-green-500 text-white p-6 rounded-xl shadow">
<p className="text-sm opacity-80">Total Students</p>
<h2 className="text-3xl font-bold">{stats.students}</h2>
</div>

<div className="bg-purple-500 text-white p-6 rounded-xl shadow">
<p className="text-sm opacity-80">Active Categories</p>
<h2 className="text-3xl font-bold">{Object.keys(categories).length}</h2>
</div>

</div>



{/* CHARTS */}

<div className="grid md:grid-cols-3 gap-6">

<div className="bg-white p-5 rounded-xl shadow">
<h2 className="font-bold mb-4">Articles vs Reads</h2>
<Bar data={barData}/>
</div>

<div className="bg-white p-5 rounded-xl shadow">
<h2 className="font-bold mb-4">Category Distribution</h2>
<Pie data={pieData}/>
</div>

<div className="bg-white p-5 rounded-xl shadow">
<h2 className="font-bold mb-4">Daily Engagement</h2>
<Line data={lineData}/>
</div>

</div>



{/* TOP CATEGORIES */}

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="font-bold mb-4 text-lg">
Top 3 Categories
</h2>

<div className="space-y-4">

{topCategories.map(([name,count],i)=>{

const total=stats.articles || 1
const percent=Math.round((count/total)*100)

return(

<div key={i}>

<div className="flex justify-between text-sm mb-1">
<span>{name}</span>
<span>{percent}%</span>
</div>

<div className="w-full bg-gray-200 rounded-full h-2">

<div
className="bg-blue-500 h-2 rounded-full"
style={{width:`${percent}%`}}
></div>

</div>

</div>

)

})}

</div>

</div>



{/* STUDENT PROGRESS */}

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="font-bold mb-4 text-lg">
Student Reading Progress
</h2>

<Bar data={studentProgress}/>

</div>

</div>

)

}