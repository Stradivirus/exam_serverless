const RAW_API_URL = 'https://77sv7fo7bvoo7jpkh45jigc22e0qhltc.lambda-url.ap-northeast-2.on.aws';
const API_URL = RAW_API_URL.replace(/\/+$/, '');

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

export async function checkLambdaStatus(): Promise<{ online: boolean; latencyMs: number }> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_URL}/health`, { method: 'GET' });
    const latencyMs = Math.max(1, Math.round(performance.now() - start));
    return { online: res.ok || res.status === 500, latencyMs };
  } catch {
    return { online: false, latencyMs: 0 };
  }
}
