export const debounce = function(foo:any, t:number) {
  let timer:any
  return function() {
    if (timer !== undefined) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      // @ts-ignore
      foo.apply(this, arguments)              
    }, t)  
  }
}