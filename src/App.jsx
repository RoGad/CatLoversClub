import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./global/Layout.jsx";
import MainSite from "./mainsite/MainSite.jsx";
import LogIn from "./auth/LogIn.jsx";
import SignUp from "./auth/SignUp.jsx";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MainSite />} />
              <Route path="Login" element={<LogIn />}/>
              <Route path="Signup" element={<SignUp />}/>
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
