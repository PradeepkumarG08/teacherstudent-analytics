import { Link, useNavigate } from "react-router-dom";

export default function Navbar(){

const navigate = useNavigate()

const role = localStorage.getItem("role")

const logout = () => {
localStorage.removeItem("token")
localStorage.removeItem("role")
navigate("/")
}

return(

<nav className="bg-blue-600 text-white p-4 flex justify-between items-center">

<h1 className="font-bold text-lg">
Learning Analytics
</h1>

<div className="flex gap-4 items-center">

<Link to="/articles" className="hover:underline">
Articles
</Link>

{role==="teacher" && (
<Link to="/teacher" className="hover:underline">
Teacher Dashboard
</Link>
)}

{role==="student" && (
<Link to="/student" className="hover:underline">
Student Dashboard
</Link>
)}

{role && (
<button
onClick={logout}
className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
>
Logout
</button>
)}

</div>

</nav>

)

}