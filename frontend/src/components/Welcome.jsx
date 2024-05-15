import React from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  return (
    <div>
      Welcome Page Hello
      <button onClick={handleSignUpClick}>Sign Up</button>
    </div>
  );
};

export default Welcome;
