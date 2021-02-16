self.oninstall = function(event) {
  console.log("services worker begin install")
}

self.onactivate = function(event) {
  console.log("onactivate")
};

self.addEventListener("message", function(event) {
  const data = event.data
  fetchOrigin = data.origin
});

var fetchOrigin = ""

self.onfetch = function(event) {
  const request = event.request
  const url = new URL(request.url)
  // console.log("service worker url", url)
  // console.log("service worker inject")
  // todo if url.origin === user option scope, then go on
  event.respondWith(openCache().then(function(cache) {
    return cache.match(event.request).then(function(response) {
      if (response) {
        console.log("service worker catch success")
      }
      return response || fetch(event.request);
    })
  }))
}

var cachePromise;
function openCache() {
  if (!cachePromise) { cachePromise = caches.open('agora') }
  return cachePromise
}