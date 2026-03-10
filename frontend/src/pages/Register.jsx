import { useState } from "react"
import API from "../api"
import { useNavigate } from "react-router-dom"

export default function Register(){

const [form,setForm]=useState({
name:"",
email:"",
password:"",
role:"student"
})

const navigate=useNavigate()

const register=async()=>{

await API.post("/auth/register",form)

navigate("/")

}

return(

<div className="flex justify-center items-center min-h-screen">

<div className="bg-white p-6 shadow w-full max-w-md">

<h2 className="text-xl mb-4">
Register
</h2>

<input
className="border p-2 w-full mb-3"
placeholder="Name"
onChange={(e)=>setForm({...form,name:e.target.value})}
/>

<input
className="border p-2 w-full mb-3"
placeholder="Email"
onChange={(e)=>setForm({...form,email:e.target.value})}
/>

<input
type="password"
className="border p-2 w-full mb-3"
placeholder="Password"
onChange={(e)=>setForm({...form,password:e.target.value})}
/>

<select
className="border p-2 w-full mb-3"
onChange={(e)=>setForm({...form,role:e.target.value})}
>

<option value="student">Student</option>
<option value="teacher">Teacher</option>

</select>

<button
onClick={register}
className="bg-green-600 text-white p-2 w-full"
>

Register

</button>

{/* Register Section Added */}

<div className="text-center mt-4">
<p className="text-sm text-gray-600">
Already have an account?
</p>

<button
onClick={()=>navigate("/")}
className="text-blue-600 font-semibold mt-1"
>
Login
</button>

</div>

</div>

</div>

)

}