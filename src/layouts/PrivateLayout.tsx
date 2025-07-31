// src/layouts/PrivateLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Toaster } from 'sonner';

const PrivateLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Toaster />
    </>
  );
};

export default PrivateLayout;
