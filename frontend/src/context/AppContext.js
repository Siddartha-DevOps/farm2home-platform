// ─── Context ────────────────────────────────────────────────────────────────

import { createContext, useContext } from "react";

const AppContext = createContext();
const useApp = () => useContext(AppContext);

export { AppContext, useApp };
