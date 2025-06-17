import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import ChannelPage from './pages/channel-page';
import TranscriptsPage from './pages/transcripts-page';
import StoryPage from './pages/story-page';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        {/* Professional Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container-lg">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">YT</span>
                </div>
                <h1 className="text-xl font-bold">StoryBank Composer</h1>
              </div>

              {/* Professional Navigation */}
              <nav className="flex items-center space-x-1">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-colors focus-ring ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`
                  }
                  end
                >
                  Channel Inspirations
                </NavLink>
                <NavLink
                  to="/transcripts"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-colors focus-ring ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`
                  }
                >
                  Transcripts Extracted
                </NavLink>
                <NavLink
                  to="/stories"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-colors focus-ring ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`
                  }
                >
                  Stories Generation
                </NavLink>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="content-wrapper">
          <Routes>
            <Route path="/" element={<ChannelPage />} />
            <Route path="/transcripts" element={<TranscriptsPage />} />
            <Route path="/stories" element={<StoryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
