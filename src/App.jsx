import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Layouts
import { DashboardLayout } from "./components/Layout/DashboardLayout";

// Pages
import { Splash } from "./pages/Splash";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Workspace } from "./pages/Workspace";
import { Documents } from "./pages/Documents";
import { Summaries } from "./pages/Summaries";
import { QuizLab } from "./pages/QuizLab";
import { SmartNotes } from "./pages/SmartNotes";
import { Analytics } from "./pages/Analytics";
import { AIAssistant } from "./pages/AIAssistant";
import { Settings } from "./pages/Settings";

// Page Transition Wrapper
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Splash />} />
        <Route path="/auth" element={
          <PageWrapper>
            <Auth />
          </PageWrapper>
        } />

        {/* Authenticated Routes with Dashboard Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/workspace" element={<PageWrapper><Workspace /></PageWrapper>} />
          <Route path="/documents" element={<PageWrapper><Documents /></PageWrapper>} />
          <Route path="/summaries" element={<PageWrapper><Summaries /></PageWrapper>} />
          <Route path="/quiz-lab" element={<PageWrapper><QuizLab /></PageWrapper>} />
          <Route path="/smart-notes" element={<PageWrapper><SmartNotes /></PageWrapper>} />
          <Route path="/analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
          <Route path="/ai-assistant" element={<PageWrapper><AIAssistant /></PageWrapper>} />
          <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
