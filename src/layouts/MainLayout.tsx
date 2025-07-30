// src/layoutss/MainLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Toaster } from 'sonner';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Toaster/>
    </>
  );
};

export default MainLayout;
