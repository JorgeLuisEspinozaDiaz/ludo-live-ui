import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import db from "./helper/dexie-config.ts";
import "@fontsource/nunito/200.css";
import "@fontsource/nunito/300.css";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "@fontsource/nunito/900.css";

db.open().catch((error) => {
  console.error("Error al abrir la base de datos Dexie:", error);
});

createRoot(document.getElementById("root")!).render(<App />);
