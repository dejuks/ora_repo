import React,{useState} from "react";
import {Link} from "react-router-dom";
import Navbar from "../../../landing/components/Navbar";

const JournalRegisterPage = () => {

  const [form,setForm] = useState({
    full_name:"",
    email:"",
    phone:"",
    password:"",
    confirmPassword:""
  });

  const [error,setError] = useState("");
  const [success,setSuccess] = useState(false);

  const handleChange = (e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    })
  }

  const handleSubmit = async(e)=>{

    e.preventDefault();

    if(form.password !== form.confirmPassword){
      setError("Passwords do not match");
      return;
    }

    try{

      const apiBase = process.env.REACT_APP_API_URL || "";

      const res = await fetch(`${apiBase}/auth/register`,{
        method:"POST",
        headers:{ "Content-Type":"application/json"},
        body:JSON.stringify({
          full_name:form.full_name,
          email:form.email,
          phone:form.phone,
          password:form.password,
          role:"author"
        })
      });

      const data = await res.json();

      if(!res.ok){
        throw new Error(data.message);
      }

      setSuccess(true);

    }catch(err){
      setError(err.message);
    }

  }

  if(success){
    return(
      <>
      <Navbar/>
      <div className="auth-container">
        <h2>Registration Successful</h2>
        <p>Please check your email verification.</p>

        <Link to="/journal/auth/login">
          Go to Login
        </Link>
      </div>
      </>
    )
  }

  return(
    <>
    <Navbar/>

    <div className="auth-container">

      <h2>Create Author Account</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>

        <input
        name="full_name"
        placeholder="Full Name"
        onChange={handleChange}
        required
        />

        <input
        name="email"
        type="email"
        placeholder="Email"
        onChange={handleChange}
        required
        />

        <input
        name="phone"
        placeholder="Phone"
        onChange={handleChange}
        />

        <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        required
        />

        <input
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        onChange={handleChange}
        required
        />

        <button>Create Account</button>

      </form>

      <p>
        Already have account?
        <Link to="/journal/auth/login"> Login </Link>
      </p>

    </div>
    </>
  )
}

export default JournalRegisterPage;