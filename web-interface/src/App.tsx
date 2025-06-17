import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import ChannelPage from '../../web-interface/src/pages/channel-page';
import TranscriptsPage from '../../web-interface/src/pages/transcripts-page';
import StoryPage from '../../web-interface/src/pages/story-page';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <nav className="bg-white shadow mb-6 px-4 py-2 flex gap-4 w-full max-w-2xl justify-center">
          <NavLink
            to="/"
            className={({ isActive }: { isActive: boolean }) =>
              isActive
                ? "font-bold text-blue-600"
                : "text-gray-700 hover:text-blue-400"
            }
            end
          >
            Channel
          </NavLink>
          <NavLink
            to="/transcripts"
            className={({ isActive }: { isActive: boolean }) =>
              isActive
                ? "font-bold text-green-600"
                : "text-gray-700 hover:text-green-400"
            }
          >
            Transcripts
          </NavLink>
          <NavLink
            to="/stories"
            className={({ isActive }: { isActive: boolean }) =>
              isActive
                ? "font-bold text-purple-600"
                : "text-gray-700 hover:text-purple-400"
            }
          >
            Stories
          </NavLink>
        </nav>
        <div className="flex-grow w-full flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <Routes>
              <Route path="/" element={<ChannelPage />} />
              <Route path="/transcripts" element={<TranscriptsPage />} />
              <Route path="/stories" element={<StoryPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;