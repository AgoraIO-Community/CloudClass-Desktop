export const HttpClient = async (url: string, opts: any): Promise<Response | undefined> => {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();

    // 5 second timeout:
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch(url, { ...opts, signal: controller.signal })
      .then((fetchResponse: Response) => {
        return resolve(fetchResponse);
      })
      .catch((e) => {
        if (e.code === 20) {
          reject(new Error(`request timed out`));
        } else {
          reject(e);
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });
  });
};
