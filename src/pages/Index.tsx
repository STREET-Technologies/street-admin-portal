import { useState } from "react";
import { Login } from "@/components/Login";
import { AdminDashboard } from "@/components/AdminDashboard";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  const handleLogin = (email: string, password: string) => {
    // In a real app, validate credentials with API
    setCurrentUser(email.split("@")[0]);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser("");
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} currentUser={currentUser} />;
};

export default Index;
