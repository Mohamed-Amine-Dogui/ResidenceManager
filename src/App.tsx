// src/App.tsx
import {
  Route,
  createHashRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import PrivateLayout from "./layouts/PrivateLayout";

import LoginPage from "./pages/LoginPage";
import ReservationPage from "./pages/ReservationPage";
import NotFoundPage from "./pages/NotFoundPage";
import CheckListePage from "./pages/CheckListPage";
import ControlPage from "./pages/ControlPage";
import CheckinCheckoutPage from "./pages/CheckInOutPage";
import DashBoardPage from "./pages/DashBoardPage";
import MaintenancePage from "./pages/MaintenancePage";
import FinancePage from "./pages/FinancePage";
import ErrorBoundary from "./components/ErrorBoundary";
import HomePage from "./pages/HomePage";

// Create router outside component to prevent re-creation
const router = createHashRouter(
  createRoutesFromElements(
    <>
      {/* Public routes (no Navbar) */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      {/* Private routes (with Navbar) */}
      <Route path="/" element={<PrivateLayout />}>
        <Route path="/dashboard" element={<DashBoardPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/control" element={<ControlPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/checkinout" element={<CheckinCheckoutPage />} />
        <Route path="/checklist" element={<CheckListePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </>
  ),
  {
    // Add future flags to prevent warnings and improve stability
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

const App = () => {
  console.log("🚀 App component rendering - This should only appear ONCE!");

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default App;
