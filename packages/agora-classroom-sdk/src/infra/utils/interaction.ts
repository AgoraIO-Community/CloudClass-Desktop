import { transI18n } from '~ui-kit';

type Delegate = (message: string) => void;

export const interactionThrottleHandler = <T>(
  func: T,
  limitFunc: Delegate,
  options?: {
    limitMs?: number;
    message?: string;
  },
) => {
  const { limitMs = 200, message = transI18n('toast.interaction_too_frequent') } = options || {};

  let last = Date.now();
  // @ts-ignore
  return ((...args: unknown[]) => {
    if (Date.now() - last < limitMs) {
      limitFunc(message);
    } else {
      // @ts-ignore
      func(...args);
      last = Date.now();
    }
  }) as T;
};
