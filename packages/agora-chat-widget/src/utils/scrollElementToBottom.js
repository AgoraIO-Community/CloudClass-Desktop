/**
 *
 * @param {htmlElement} scrollElement 需要滚动到底部的元素
 */
export default function scrollElementToBottom(scrollElement) {
  scrollElement && (scrollElement.scrollTop = scrollElement.scrollHeight);
}
