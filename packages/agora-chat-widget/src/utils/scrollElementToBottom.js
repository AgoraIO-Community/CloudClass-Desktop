/**
 * 元素滚动条是否位于最底部
 * @param {*} scrollElement 
 * @returns 
 */
export function scrollIsBottom(scrollElement) {
  return scrollElement.scrollTop === scrollElement.scrollHeight;
}

/**
 * 讲元素的滚动条拉到最底部
 * @param {htmlElement} scrollElement 需要滚动到底部的元素
 */
export function scrollElementToBottom(scrollElement) {
  scrollElement && (scrollElement.scrollTop = scrollElement.scrollHeight);
}
