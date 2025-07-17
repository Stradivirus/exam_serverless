// const API_URL = 'http://localhost:8080';
const API_URL = 'https://examgo-916058497164.asia-northeast3.run.app';

export async function fetchQuestions(examType: string, extraPath?: string) {
  let url = `${API_URL}/${examType}/questions`;
  if (extraPath) url += `/${extraPath}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('문제 불러오기 실패');
  return response.json();
}

export async function submitAnswers(
  examType: string,
  answers: Record<string, string>,
  extraPath?: string
) {
  let url = `${API_URL}/${examType}/check`;
  if (extraPath) url += `/${extraPath}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers),
  });
  if (!response.ok) throw new Error('답안 제출 실패');
  return response.json();
}