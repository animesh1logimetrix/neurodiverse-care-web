import axiosClient from '../axiosClient';
import { API_ENDPOINTS } from '../apiEndpoints';

// Define your TypeScript interfaces for the expected responses
export interface ExampleData {
  id: number;
  name: string;
  description: string;
}

// Service functions to make the actual API calls
export const exampleService = {
  // Fetch a list of items
  getAll: async (): Promise<ExampleData[]> => {
    const response = await axiosClient.get(API_ENDPOINTS.EXAMPLE.GET_ALL);
    return response.data;
  },

  // Fetch a single item by ID
  getById: async (id: number): Promise<ExampleData> => {
    const response = await axiosClient.get(API_ENDPOINTS.EXAMPLE.GET_BY_ID(id));
    return response.data;
  },

  // Create a new item
  create: async (data: Omit<ExampleData, 'id'>): Promise<ExampleData> => {
    const response = await axiosClient.post(API_ENDPOINTS.EXAMPLE.CREATE, data);
    return response.data;
  },
};
