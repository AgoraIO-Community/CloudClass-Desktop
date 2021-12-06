import { AGRteErrorCode, RteErrorCenter } from './error';

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
        RteErrorCenter.shared.handleThrowableError(
          AGRteErrorCode.RTE_ERR_RESTFUL_HTTP_CLIENT_ERR,
          e as Error,
        );
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });
  });
};
