import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NeuroCareAuth from "./pages/AuthPages/NeuroCareAuth";
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

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route element={<ProtectedRoute allowedRoles={["Clinic Admin"]} />}>
              <Route index path="/" element={<ClinicAdminDashboard />} />
              <Route path="/administration/staff-parents" element={<StaffParents />} />
              <Route path="/administration/role-management" element={<RoleManagement />} />

              <Route path="/administration/modules" element={<ManageModules />} />
              <Route path="/administration/permission" element={<Permission />} />

              {/* Masters */}
              <Route path="/masters/category-master" element={<CategoryMaster />} />
              <Route path="/masters/content-cms" element={<ContentCMS />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />
              {/* Care */}
              <Route path="/care/children" element={<Children />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
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

            <Route element={<ProtectedRoute allowedRoles={["Parent / Guardian"]} />}>
              <Route path="/parent-dashboard" element={<ParentDashboard />} />
            </Route>
          </Route>

          {/* Auth Layout */}
          {/* <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} /> */}
          <Route path="/signin" element={<NeuroCareAuth />} />
          <Route path="/signup" element={<NeuroCareAuth />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
