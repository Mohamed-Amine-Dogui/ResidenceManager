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

const App = () => {
  const router = createHashRouter(
    createRoutesFromElements(
      <>
        {/* Public routes (no Navbar) */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LoginPage />} />
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
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
