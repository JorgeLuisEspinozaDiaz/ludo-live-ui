import { Toaster } from "sonner";
import "./App.css";
import RouterIndex from "./router/RouterIndex";

function App() {
  return (
    <>
      <RouterIndex />
      <Toaster richColors position="top-right" visibleToasts={1} />
    </>
  );
}

export default App;
