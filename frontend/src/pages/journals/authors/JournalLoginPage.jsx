import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { MdEmail, MdLock } from "react-icons/md";
import Navbar from "../../../landing/components/Navbar";

const JournalLoginPage = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get("redirect") || "/journal/contribute";

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if(token){
      navigate(redirect);
    }
  },[navigate,redirect]);

  const handleSubmit = async(e) => {

    e.preventDefault();

    setLoading(true);
    setError("");

    try{

      const apiBase = process.env.REACT_APP_API_URL || "";

      const res = await fetch(`${apiBase}/auth/login`,{
        method:"POST",
        headers:{ "Content-Type":"application/json"},
        body:JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();

      if(!res.ok){
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token",data.token);
      localStorage.setItem("user",JSON.stringify(data.user));

      navigate(redirect);

    }catch(err){
      setError(err.message);
    }
    finally{
      setLoading(false);
    }

  }

  return (
    <>
    <Navbar/>

    <div className="auth-container">

      <h2>Author Login</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>

        <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        required
        />

        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        required
        />

        <button disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

      </form>

      <p>
        Don't have account?
        <Link to="/journal/auth/register"> Register </Link>
      </p>

    </div>

    </>
  )
}

export default JournalLoginPage;