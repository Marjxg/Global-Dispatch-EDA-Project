import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import NewOrder from "./pages/NewOrder";
import MyOrders from "./pages/MyOrders";
import AvailableLoads from "./pages/AvailableLoads";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders/new" element={<NewOrder />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/loads" element={<AvailableLoads />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}