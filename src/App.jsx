import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./global/Layout.jsx";
import MainSite from "./mainsite/MainSite.jsx";
import LogIn from "./auth/LogIn.jsx";
import SignUp from "./auth/SignUp.jsx";
import WikiCats from "./wikicats/WikiCats.jsx";
import InfoCats from "./wikicats/InfoCats.jsx";
import ProfilePage from "./profile/ProfilePage.jsx";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MainSite />} />
              <Route path="Login" element={<LogIn />}/>
              <Route path="Signup" element={<SignUp />}/>
              <Route path="WikiCats" element={<WikiCats />}/>
              <Route path="InfoCats" element={<InfoCats />}/>
              <Route path="ProfilePage" element={<ProfilePage />}/>
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
