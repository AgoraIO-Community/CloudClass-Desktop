// 当前登陆状态
export const statusAction = (data) => {
  return { type: 'STATUS_ACTION', data };
};
// 当前登陆ID
export const userAction = (data) => {
  return { type: 'USER_ACTION', data };
};
// 当前登陆用户属性
export const userInfoAction = (data) => {
  return { type: 'USER_INFO_ACTION', data };
};
// 清楚 redux
export const clearStore = (data) => {
  return { type: 'CLEAR_STORE', data };
};
