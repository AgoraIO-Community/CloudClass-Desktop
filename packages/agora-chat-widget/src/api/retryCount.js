let _loginRetryCount = 3;
let _joinRetryCount = 3;
export const getLoginRetryCount = () => _loginRetryCount;
export const getJoinRetryCount = () => _joinRetryCount;
export const setLoginRetryCount = (loginRetryCount) => {
    _loginRetryCount = loginRetryCount;
}
export const setJoinRetryCount = (joinRetryCount) => {
    _joinRetryCount = joinRetryCount;
}