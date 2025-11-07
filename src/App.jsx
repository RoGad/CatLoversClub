import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./global/AuthContext.jsx";
import Layout from "./global/Layout.jsx";
import MainSite from "./mainsite/MainSite.jsx";
import LogIn from "./auth/LogIn.jsx";
import SignUp from "./auth/SignUp.jsx";
import WikiCats from "./wikicats/WikiCats.jsx";
import InfoCats from "./wikicats/InfoCats.jsx";
import ProfilePage from "./profile/ProfilePage.jsx";
import AdminLogin from "./adminpanel/AdminLogin.jsx";
import AdminPanel from "./adminpanel/AdminPanel.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<MainSite />} />
                <Route path="Login" element={<LogIn />}/>
                <Route path="Signup" element={<SignUp />}/>
                <Route path="WikiCats" element={<WikiCats />}/>
                <Route path="breed/:id" element={<InfoCats />} />
                <Route path="ProfilePage" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }/>
            </Route>
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;
