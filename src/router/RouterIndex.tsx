import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useSignals } from "@preact/signals-react/runtime";
import { RouterMain } from "./Router";
import { AuthGuard } from "./AuthGuard";
import Sidebar from "../app/layout/SideBar";
import { Navbar } from "../app/layout/Navbar";
import { isAuthenticated } from "../store/authStore";

const rutaServidor = import.meta.env.VITE_BASE_URL_SERVIDOR || "";

const RouterIndex = () => {
  useSignals();
  const logged = isAuthenticated.value;
  const routerContainerClass = logged ? "flex-1 h-screen flex flex-col min-w-0 overflow-hidden" : "w-full h-full";
  const mainContentClass = logged ? "flex-1 overflow-y-auto overflow-x-hidden relative" : "w-full h-full";

  return (
    <Router basename={rutaServidor || undefined}>
      <div className="w-screen h-screen overflow-hidden flex ">
        {logged && <Sidebar />}

        <div className={routerContainerClass}>
          {logged && (
            <header className="shrink-0 z-10">
              <Navbar />
            </header>
          )}
          <main className={mainContentClass}>
            <Routes>
              {RouterMain.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <AuthGuard isPublic={route.isPublic}>
                      <route.element />
                    </AuthGuard>
                  }
                />
              ))}
              <Route path="*" element={<Navigate to={`${rutaServidor}/404`} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default RouterIndex;
