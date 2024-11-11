import axios, { AxiosResponse } from 'axios';

export const postData = async (url: string, data: any): Promise<AxiosResponse<any>> => {
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.log(`Error making POST request: ${error}`);
    return null;
  }
};