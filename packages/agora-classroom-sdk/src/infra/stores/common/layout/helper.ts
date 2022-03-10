export const getRootDimensions = (containerNode: Window | HTMLElement) => {
  const height =
    containerNode instanceof Window ? containerNode.innerHeight : containerNode.clientHeight;
  const width =
    containerNode instanceof Window ? containerNode.innerWidth : containerNode.clientWidth;
  return { width, height };
};
