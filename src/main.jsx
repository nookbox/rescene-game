import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// StrictMode는 개발 중 useEffect를 일부러 두 번 실행시켜서
// cleanup(정리) 코드를 빼먹었는지 잡아준다. 켜두는 게 이득.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
