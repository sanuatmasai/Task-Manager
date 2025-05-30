import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, TrashIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import { taskService } from '../services/api';
import ConfirmationDialog from '../components/ConfirmationDialog';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskService.getAllTasks();
        setTasks(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tasks. Please try again later.');
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      await taskService.deleteTask(taskToDelete.id);
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const cancelDelete = () => {
    setTaskToDelete(null);
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      'P1': 'bg-red-100 text-red-800',
      'P2': 'bg-yellow-100 text-yellow-800',
      'P3': 'bg-blue-100 text-blue-800',
      'P4': 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityClasses[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    console.log(status);
    const statusClasses = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
            <h3 className="text-sm font-medium text-red-800">Error loading tasks</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-50 text-sm font-medium text-red-700 hover:text-red-600 focus:outline-none focus:underline transition duration-150 ease-in-out"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmationDialog
        isOpen={!!taskToDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        taskTitle={taskToDelete?.title || 'this task'}
      />
      <div className="w-full">
        <div className="w-full overflow-x-auto">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
                <p className="mt-1 text-sm text-gray-500">Manage and track your tasks efficiently</p>
              </div>
              <Link
                to="/tasks/new"
                className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Task
              </Link>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
                <div className="mt-6">
                  <Link
                    to="/tasks/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    New Task
                  </Link>
                </div>
              </div>
            ) : (
              <div className="shadow-sm overflow-hidden border border-gray-100 rounded-xl">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                      <tr>
                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                          Task
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                          Assignee
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                          Priority
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-3.5">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold mr-3">
                                {task.title.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                                  {task.title}
                                </div>
                                {task.description && (
                                  <div className="text-sm text-gray-500 line-clamp-1">
                                    {task.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                                {task.assigneeName ? task.assigneeName.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {task.assigneeName || 'Unassigned'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(task.dueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(task.dueDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getPriorityBadge(task.priority)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            console.log("123456789");
                            {getStatusBadge(task.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-1">
                              <Link
                                to={`/tasks/${task.id}`}
                                className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                                title="View details"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </Link>
                              <Link
                                to={`/tasks/${task.id}/edit`}
                                className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                                title="Edit task"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(task);
                                }}
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                title="Delete task"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
