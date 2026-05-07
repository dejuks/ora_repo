// pages/journals/authors/JournalAuthorLoginPage.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import JournalAuthPage from "./JournalAuthPage";

const JournalAuthorLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect') || '/journal/contribute';

  // If user is already logged in, redirect to the intended page
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user) {
      navigate(redirect);
    }
  }, [navigate, redirect]);

  // Render the same auth page but ensure it's in login mode
  return <JournalAuthPage initialMode="login" redirectPath={redirect} />;
};

export default JournalAuthorLoginPage;