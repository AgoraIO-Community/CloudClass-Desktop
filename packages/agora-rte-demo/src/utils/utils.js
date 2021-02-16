export const debounce = function(foo, t) {
  let timer
  return function() {
    if (timer !== undefined) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      foo.apply(this, arguments)              
    }, t)  
  }
}