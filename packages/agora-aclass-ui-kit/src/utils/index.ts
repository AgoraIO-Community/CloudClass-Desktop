// WIP: Visible Rect Compute 
const getViewPort = () => {
  if (document.compatMode === 'BackCompact') {
    return {
      width: document.body.clientWidth,
      height: document.body.clientHeight
    }
  } else {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    }
  }
}