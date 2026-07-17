import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NeuroCareAuth from "./pages/AuthPages/NeuroCareAuth";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import AcceptInvitation from "./pages/AuthPages/AcceptInvitation";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import StaffParents from "./pages/Administration/StaffParents";
import RoleManagement from "./pages/Administration/RoleManagement";
import ManageModules from "./pages/Administration/ManageModules";
import Permission from "./pages/Administration/Permission";
import CategoryMaster from "./pages/Masters/CategoryMaster";
import ContentCMS from "./pages/Masters/ContentCMS";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ParentDashboard from "./pages/Dashboard/ParentDashboard";
import ClinicAdminDashboard from "./pages/Dashboard/ClinicAdminDashboard";
import Children from "./pages/Care/Children";
import ChildDetails from "./pages/Care/ChildDetails";
import Appointment from "./pages/Care/Appointment";
import Dashboard from "./pages/Dashboard";
import HomeObservations from "./pages/Dashboard/HomeObservations";

import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-center" 
        containerStyle={{ zIndex: 999999 }}
        toastOptions={{
          className: 'custom-toast',
          style: {
            wordBreak: 'break-word',
          },
        }}
      />
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Base Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Dashboard Modules */}
              <Route element={<ProtectedRoute moduleRequired="Dashboard" />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/home-observations" element={<HomeObservations />} />
              </Route>

              {/* Administration Modules */}
              <Route element={<ProtectedRoute moduleRequired="Staff & Parents" />}>
                <Route path="/administration/staff-parents" element={<StaffParents />} />
              </Route>
              <Route element={<ProtectedRoute moduleRequired="Role Management" />}>
                <Route path="/administration/role-management" element={<RoleManagement />} />
              </Route>
              <Route element={<ProtectedRoute moduleRequired="Module" />}>
                <Route path="/administration/modules" element={<ManageModules />} />
              </Route>
              <Route element={<ProtectedRoute moduleRequired="Permissions" />}>
                <Route path="/administration/permission" element={<Permission />} />
              </Route>

              {/* Masters */}
              <Route element={<ProtectedRoute moduleRequired="Category Master" />}>
                <Route path="/masters/category-master" element={<CategoryMaster />} />
              </Route>
              <Route element={<ProtectedRoute moduleRequired="Content & CMS" />}>
                <Route path="/masters/content-cms" element={<ContentCMS />} />
              </Route>

              {/* Care */}
              <Route element={<ProtectedRoute moduleRequired="Children" />}>
                <Route path="/care/children" element={<Children />} />
                <Route path="/care/children/:id" element={<ChildDetails />} />
              </Route>
              <Route element={<ProtectedRoute moduleRequired="Appointment" />}>
                <Route path="/care/appointment" element={<Appointment />} />
              </Route>

              {/* Others Pages (No specific backend module needed, just login) */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />
              <Route path="/form-elements" element={<FormElements />} />
              <Route path="/basic-tables" element={<BasicTables />} />
              
              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<NeuroCareAuth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/accept-invitation" element={<AcceptInvitation />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
