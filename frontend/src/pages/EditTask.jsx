import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserCircleIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon,
  ArrowPathIcon as ArrowPathOutlineIcon,
  CheckCircleIcon as CheckCircleOutlineIcon
} from '@heroicons/react/24/outline';
import { taskService } from '../services/api';
import { toast } from '../utils/toast';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'P3',
    status: 'PENDING'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const task = await taskService.getTaskById(id);
        // Format the date for the datetime-local input
        const dueDate = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '';
        
        setFormData({
          title: task.title || '',
          description: task.description || '',
          assignee: task.assignee || '',
          dueDate: dueDate,
          priority: task.priority || 'P3',
          status: task.status || 'PENDING'
        });
      } catch (err) {
        setError('Failed to load task. Please try again.');
        console.error('Error fetching task:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDateForBackend = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Format as yyyy-MM-dd HH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      // Format the date before sending to the API
      const formattedDueDate = formData.dueDate ? formatDateForBackend(formData.dueDate) : '';
      
      const taskData = {
        ...formData,
        dueDate: formattedDueDate
      };
      
      await taskService.updateTask(id, taskData);
      toast.success('Task updated successfully!');
      navigate(`/tasks/${id}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update task. Please try again.';
      toast.error(errorMessage);
      console.error('Error updating task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    toast.error(error);
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'P1': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'P2': return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
      case 'P3': return <ArrowPathOutlineIcon className="h-5 w-5 text-blue-500" />;
      case 'P4': return <CheckCircleOutlineIcon className="h-5 w-5 text-gray-500" />;
      default: return <TagIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const priorityOptions = [
    { value: 'P1', label: 'P1 - High Priority', color: 'red' },
    { value: 'P2', label: 'P2 - Medium Priority', color: 'amber' },
    { value: 'P3', label: 'P3 - Low Priority', color: 'blue' },
    { value: 'P4', label: 'P4 - Lowest Priority', color: 'gray' },
  ];

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Task
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update the task details below
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                Title <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3.5 border"
                  placeholder="Enter task title"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3.5 border"
                  placeholder="Add a detailed description..."
                />
              </div>
            </div>

            {/* Assignee & Due Date */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 flex items-center">
                  <UserCircleIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  Assignee
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="text"
                    name="assignee"
                    id="assignee"
                    value={formData.assignee}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3.5 border"
                    placeholder="Unassigned"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  Due Date
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 pl-10 pr-3.5 border"
                  />
                </div>
              </div>
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 flex items-center">
                  <TagIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  Priority
                </label>
                <div className="mt-1">
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3.5 border bg-white"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 flex items-center">
                  {getPriorityIcon(formData.priority)}
                  <span className="ml-2 text-sm text-gray-500">
                    {priorityOptions.find(p => p.value === formData.priority)?.label}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 flex items-center">
                  <ArrowPathIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3.5 border bg-white"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 flex items-center">
                  <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                    formData.status === 'COMPLETED' ? 'bg-green-500' : 
                    formData.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}></div>
                  <span className="text-sm text-gray-500">
                    {statusOptions.find(s => s.value === formData.status)?.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
