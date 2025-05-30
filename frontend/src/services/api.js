import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskService = {
  // Get all tasks with pagination and search
  getAllTasks: async (page = 0, size = 10, search = '') => {
    try {
      console.log('Calling API with:', { page, size, search });
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(search && { search })
      });
      const url = `/tasks?${params.toString()}`;
      console.log('API URL:', url);
      
      const response = await apiClient.get(url);
      console.log('API Response:', response);
      
      if (!response.data) {
        console.error('No data in response:', response);
        throw new Error('No data received from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in getAllTasks:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params
        }
      });
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

  // Parse meeting minutes and create tasks
  parseMeetingMinutes: async (transcript) => {
    try {
      const response = await apiClient.post('/tasks/meeting-minutes', { transcript });
      return response.data;
    } catch (error) {
      console.error('Error parsing meeting minutes:', error);
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
