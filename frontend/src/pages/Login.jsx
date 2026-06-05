import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const Login = () => {

  const navigate = useNavigate();

  const [form,setForm] = useState({
    username:"",
    password:""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
  };

  const handleLogin = async (e) => {

  e.preventDefault();

  try {

    const res = await api.post(
      "/login",
      form
    );

    console.log(res.data);

    localStorage.setItem(
      "token",
      res.data.token
    );

    window.location.href =
      "/dashboard";

  } catch (err) {

    console.log(err);

    alert(
      err.response?.data?.message ||
      "Login Failed"
    );
  }
};

  return (
    <div className="login-container">

      <form
        className="login-box"
        onSubmit={handleLogin}
      >

        <h2>Admin Login</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button type="submit">
          Login
        </button>

      </form>

    </div>
  );
};

export default Login;