// urls.tsx
export const API_URL = 'https://asia-northeast3-eng-hangar-450811-c1.cloudfunctions.net/examhandler';

export const getPDFCheckURL = (examType: string, checkPath: string) => 
  `${API_URL}/${examType}/check/${checkPath}`;