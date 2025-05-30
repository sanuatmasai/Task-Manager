import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskService = {
  // Get all tasks
  getAllTasks: async () => {
    try {
      const response = await apiClient.get('/tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get task by ID
  getTaskById: async (id) => {
    try {
      const response = await apiClient.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    try {
      const response = await apiClient.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Create task from natural language
  createTaskFromNaturalLanguage: async (naturalLanguageInput) => {
    try {
      const response = await apiClient.post(`/tasks/parse?text=${encodeURIComponent(naturalLanguageInput)}`, {});
      return response.data;
    } catch (error) {
      console.error('Error creating task from natural language:', error);
      throw error;
    }
  },

  // Update a task
  updateTask: async (id, taskData) => {
    try {
      const response = await apiClient.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (id) => {
    try {
      const response = await apiClient.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  },

  // Get tasks by status
  getTasksByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/tasks/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tasks with status ${status}:`, error);
      throw error;
    }
  },

  // Get tasks by assignee
  getTasksByAssignee: async (assigneeName) => {
    try {
      const response = await apiClient.get(`/tasks/assignee/${assigneeName}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tasks for assignee ${assigneeName}:`, error);
      throw error;
    }
  },

  // Get tasks by priority
  getTasksByPriority: async (priority) => {
    try {
      const response = await apiClient.get(`/tasks/priority/${priority}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tasks with priority ${priority}:`, error);
      throw error;
    }
  },
};

export default apiClient;
