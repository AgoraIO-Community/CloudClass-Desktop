declare global {
  interface Window {
    __agora__fcr__locked: boolean;
  }
}
export const lock = () => {
  window.__agora__fcr__locked = true;
};

export const unlock = () => {
  window.__agora__fcr__locked = false;
};

export const isLocked = () => {
  return !!window.__agora__fcr__locked;
};
