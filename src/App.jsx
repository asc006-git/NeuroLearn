import { AppLayout } from "./components/Layout/AppLayout";
import { HeroSection } from "./components/Workspace/HeroSection";
import { UploadArea } from "./components/Workspace/UploadArea";
import { SummaryCards } from "./components/Workspace/SummaryCards";
import { KeywordCloud } from "./components/Workspace/KeywordCloud";
import { QuizLab } from "./components/Features/QuizLab";

function App() {
  return (
    <AppLayout>
      <HeroSection />
      <UploadArea />
      
      {/* 
        Grouped sections to maintain clean spacing 
        and visual hierarchy within the main max-width container 
      */}
      <div className="mt-12 space-y-12">
        <SummaryCards />
        <KeywordCloud />
        <QuizLab />
      </div>
    </AppLayout>
  );
}

export default App;
