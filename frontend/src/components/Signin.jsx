import React from "react";
import { useNavigate } from "react-router-dom";

// ARJAY
const Signin = () => {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate("/signup");
  };
  return (
    <div>
      <button onClick={handleSignUpClick}>Sign Up</button>
    </div>
  );
};

export default Signin;
