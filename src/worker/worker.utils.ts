// worker/worker.utils.ts

export type JobAnalysis = {
  resultSummary: string;
  category: string;
  tone: string;
  priority: string;
};

/**
 * Mock AI processing function
 * @param message ข้อความต้นฉบับ
 * @returns JobAnalysis object
 */
export const processJobMock = (message: string): JobAnalysis => {
  // ตัวอย่าง mock summary
  const summary = message.length > 50 ? message.slice(0, 50) + '...' : message;

  // Mock category (random)
  const categories = ['support', 'sales', 'feedback', 'complaint'];
  const category = categories[Math.floor(Math.random() * categories.length)];

  // Mock tone
  const tones = ['positive', 'neutral', 'negative'];
  const tone = tones[Math.floor(Math.random() * tones.length)];

  // Mock priority
  const priorities = ['low', 'medium', 'high'];
  const priority = priorities[Math.floor(Math.random() * priorities.length)];

  return {
    resultSummary: summary,
    category,
    tone,
    priority,
  };
};
