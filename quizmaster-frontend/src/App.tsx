import { RouterProvider } from "react-router-dom";

import { AppProviders } from "@/app/providers";
import { router } from "@/app/router";
import { AuthBootstrap } from "./features/auth/auth-bootstrap";
import { AgentationDevtools } from "./components/dev/agentation-devtools";

function App() {
  return (
    <AppProviders>
      <AuthBootstrap>
        <RouterProvider router={router} />
      </AuthBootstrap>
      <AgentationDevtools />
    </AppProviders>
  );
}

export default App;
