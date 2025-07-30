// src/App.jsx
import {
  Route,
  createHashRouter, // This is for Githu Pages we will reuse createBrowserRouter when we will host our App by ourself
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";

import Mainlayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ReservationPage from "./pages/ReservationPage";
import NotFoundPage from "./pages/NotFoundPage";
import CheckListePage from "./pages/CheckListPage";
import ControlPage from "./pages/ControlPage";


const App = () => {
  const router = createHashRouter(
    createRoutesFromElements(
      <Route path="/" element={<Mainlayout />}>
        <Route index element={<HomePage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/checklist" element={<CheckListePage />} />
        <Route path="/control" element={<ControlPage />} />

      {/* Catch-all for 404 */}
      <Route path="*" element={<NotFoundPage />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
