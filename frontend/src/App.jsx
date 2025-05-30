import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { HomeIcon, PlusIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import TaskList from './pages/TaskList';
import CreateTask from './pages/CreateTask';
import TaskDetail from './pages/TaskDetail';
import EditTask from './pages/EditTask';

function App() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm w-full">
        <div className="w-full px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">TaskManager</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) => `
                    ${isActive ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                    inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                  `}
                >
                  <HomeIcon className="h-5 w-5 mr-1" />
                  Home
                </NavLink>
                <NavLink
                  to="/tasks"
                  end
                  className={({ isActive }) => `
                    ${isActive ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                    inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                  `}
                >
                  <ListBulletIcon className="h-5 w-5 mr-1" />
                  My Tasks
                </NavLink>
                <NavLink
                  to="/tasks/new"
                  className={({ isActive }) => `
                    ${isActive ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                    inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                  `}
                >
                  <PlusIcon className="h-5 w-5 mr-1" />
                  New Task
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="w-full px-4 py-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/tasks/new" element={<CreateTask />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/tasks/:id/edit" element={<EditTask />} />
          </Routes>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 w-full">
        <div className="w-full px-4">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TaskManager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
