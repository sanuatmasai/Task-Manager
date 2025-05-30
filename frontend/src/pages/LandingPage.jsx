import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <div className="block">Manage Your Tasks</div>
            <div className="block text-indigo-600">with Ease</div>
          </h1>
        </div>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 md:mt-8 md:text-xl">
          A simple and intuitive task management application that helps you stay organized and productive.
          Create, track, and manage your tasks with natural language input.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <Link
              to="/tasks/new"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
            >
              Get Started
            </Link>
          </div>
          <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <Link
              to="/tasks"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              View Tasks
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Natural Language Input',
              description: 'Create tasks using simple, natural language. Just type what you need to do!',
              icon: '💬',
            },
            {
              title: 'Task Management',
              description: 'Easily create, update, and delete tasks with a clean and intuitive interface.',
              icon: '✅',
            },
            {
              title: 'Responsive Design',
              description: 'Access your tasks from any device, anywhere, anytime.',
              icon: '📱',
            },
          ].map((feature, index) => (
            <div key={index} className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                    <span className="text-2xl text-white">{feature.icon}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-base text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
