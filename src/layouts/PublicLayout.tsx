// src/layouts/PublicLayout.tsx
import { Outlet } from "react-router-dom";
import { Toaster } from 'sonner';

const PublicLayout = () => {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
};

export default PublicLayout;
