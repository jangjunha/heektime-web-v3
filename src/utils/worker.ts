export const createWorker = (worker: unknown): Worker => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const code = (worker as any).toString();
  const blob = new Blob(['(' + code + ')()']);
  return new Worker(URL.createObjectURL(blob));
};
