import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  CalendarIcon, 
  UserIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { taskService } from '../services/api';

export default function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await taskService.getTaskById(id);
        setTask(data);
      } catch (err) {
        setError('Failed to fetch task details. Please try again later.');
        console.error('Error fetching task:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'P1': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: ExclamationTriangleIcon },
      'P2': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: ExclamationTriangleIcon },
      'P3': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: ArrowPathIcon },
      'P4': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: CheckCircleIcon },
    };
    
    const config = priorityConfig[priority] || priorityConfig['P4'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} ${config.border} border`}>
        <Icon className={`h-4 w-4 mr-1.5 ${config.text}`} />
        {priority}: {priority === 'P1' ? 'Urgent' : priority === 'P2' ? 'High' : priority === 'P3' ? 'Medium' : 'Low'}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
      'IN_PROGRESS': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
      'COMPLETED': { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} ${config.border} border`}>
        <span className={`h-2 w-2 rounded-full mr-2 ${config.bg.replace('bg-', 'bg-').replace('-50', '-500')}`}></span>
        {status.replace('_', ' ')}
      </span>
    );
  }; 
  
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', className: 'text-red-600' };
    if (diffDays === 0) return { text: 'Due today', className: 'text-amber-600' };
    if (diffDays === 1) return { text: 'Due tomorrow', className: 'text-blue-600' };
    return { text: `Due in ${diffDays} days`, className: 'text-gray-600' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading task</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-lg font-medium text-gray-900">Task not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested task could not be found.</p>
        <div className="mt-6">
          <Link
            to="/tasks"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  const dueDateInfo = getDaysRemaining(task.dueDate);
  const formattedDueDate = new Date(task.dueDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/tasks"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Tasks
        </Link>
        <Link
          to={`/tasks/${id}/edit`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Task
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Created on {new Date(task.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6">
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Description</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              {task.description ? (
                <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
              ) : (
                <p className="text-gray-400 italic">No description provided</p>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignee */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                Assignee
              </h3>
              <p className="text-gray-900 font-medium">
                {task.assigneeName || 'Unassigned'}
              </p>
            </div>

            {/* Due Date */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                Due Date
              </h3>
              <div>
                <p className="text-gray-900 font-medium">{formattedDueDate}</p>
                <p className={`text-sm mt-1 ${dueDateInfo.className} font-medium`}>
                  {dueDateInfo.text}
                </p>
              </div>
            </div>

            {/* Created At */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                Created At
              </h3>
              <p className="text-gray-900">
                {new Date(task.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Last Updated */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <ArrowPathIcon className="h-4 w-4 mr-2 text-gray-400" />
                Last Updated
              </h3>
              <p className="text-gray-900">
                {new Date(task.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Task ID: {id}
          </span>
          <div className="flex space-x-3">
            <Link
              to="/tasks"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Tasks
            </Link>
            <Link
              to={`/tasks/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit Task
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
