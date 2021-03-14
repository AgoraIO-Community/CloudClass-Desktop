importScripts('./lib/zip.js');
importScripts('./lib/array-buffer-reader.js');
importScripts('./lib/deflate.js');
importScripts('./lib/inflate.js');

var VERSION = 'netless';

zip.useWebWorkers = false

// error
self.addEventListener('error', function (error) {
  console.warn('[sw] error', error)
  console.warn(error)
})

// 缓存
self.addEventListener('install', function(event) {
  console.log('[sw] install')
  event.waitUntil(
    openCache().then(function(cache) {
      console.log("[sw] [install] load cache", cache)
    })
  );
});

// 缓存更新
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
  console.log('[sw] activate', event)
  // event.waitUntil(
  //   openCache().then(function(cache) {
  //     console.log("[sw] [activate] load cache", cache)
  //   })
  //   // caches.keys().then(function(cacheNames) {
  //   //   return Promise.all(
  //   //     cacheNames.map(function(cacheName) {
  //   //       // 如果当前版本和缓存版本不一致
  //   //       if (cacheName !== VERSION) {
  //   //         return caches.delete(cacheName);
  //   //       }
  //   //     })
  //   //   );
  //   // })
  // );
});

self.addEventListener('sync', function (event) {
  console.warn('[sw] sync', event)
})

var DOMAIN = 'https://convertcdn.netless.link'

var targetDynamicUrl = [DOMAIN +'/dynamicConvert'].join('')
var targetStaticUrl = [DOMAIN +'/staticConvert'].join('')
var targetUrl = targetDynamicUrl

function matchConvertUrl (url) {
  var matched = url.match(/(dynamic)Convert/)
  if (matched) {
    var name = url.split(targetUrl + '/')[1]
    console.log('matchConvertUrl name', name)
    return name
  }
}

var contentTypesByExtension = {
  'css': 'text/css',
  'json': 'application/json',
  'pdf': 'application/pdf',
  'js': 'application/javascript',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'html': 'text/html',
  'htm': 'text/html'
};

var cachePromise = null

function openCache() {
  if (!cachePromise) {
    cachePromise = caches.open(VERSION)
  }
  return cachePromise
}

function getContentType(filename) {
  var tokens = filename.split('.');
  var extension = tokens[tokens.length - 1];
  return contentTypesByExtension[extension] || 'text/plain';
}

function cacheNetlessStaticRequest(request) {
  return new Promise((resolve, reject) => {
    console.log('[sw] trying send request caching static resources')
    fetch(request)
    .then((response) => {
      openCache().then(function(cache) {
        if (request.url) {
          var targetName = matchConvertUrl(request.url)
          if (targetName) {
            var location = getLocation(targetName)
            cache.put(location, response.clone())
          }
        }
      });
      resolve(response.clone())
    })
    .catch((err) => {
      console.warn(err)
      reject(err)
    })
  })
}

function getZipReader(data) {
  return new Promise(function(fulfill, reject) {
    zip.createReader(new zip.ArrayBufferReader(data), fulfill, reject);
  });
}

function cacheContents(reader) {
  return new Promise(function(fulfill, reject) {
    reader.getEntries(function(entries) {
      console.log('Installing', entries.length, 'files from zip');
      Promise.all(entries.map(cacheEntry)).then(fulfill, reject);
    });
  });
}

function getLocation(filename) {
  var str = filename || ''
  return targetUrl + '/' + str
}

// Cache one entry, skipping directories.

 
function cacheEntry(entry) {
  if (entry.directory) { return Promise.resolve(); }

  return new Promise(function(fulfill, reject) { 
    entry.getData(new zip.BlobWriter(), function(data) {
      return openCache().then(function(cache) {
        var location = getLocation(entry.filename);
        var response = new Response(data, { headers: {
          'Content-Type': getContentType(entry.filename)
        } });

        // console.log('-> Caching', location,
        //             '(size:', entry.uncompressedSize, 'bytes)'); 
        if (entry.filename === 'index.html') {
          cache.put(getLocation(), response.clone());
        }
        // console.log('-> cache.put', location,
        // '(size:', entry.uncompressedSize, 'bytes)'); 
        return cache.put(location, response.clone());
      }).then(fulfill, reject);
    });
  });
}


function loadCacheFromZip(request) {
  return new Promise((resolve, reject) => {
    fetch(request.url)
    .then(function (response) {
      return response.arrayBuffer()
        .then(getZipReader)
        .then(cacheContents)
        .then(function(res) {
          resolve(res)
        })
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

// 捕获请求并返回缓存数据
self.addEventListener('fetch', function(event) {
  if (event && event.request) {
    var request = event.request
    var method = request.method
    var url = request.url
    if (method && method.match(/get/i)) {
      var isNetlessConverterUrl = url.match('convertcdn.netless.link')
      if (isNetlessConverterUrl) {
        var targetName = matchConvertUrl(request.url)
        if (targetName) {
          var zipFile = targetName.match('zip$')
          var validZipFile = targetName.split('.zip')[1] === ''
          if (zipFile && validZipFile) {
            return loadCacheFromZip(request).then(function() {
            }).catch(function (err) {
              console.error(err)
              return fetch(request)
            })
          } else {
            event.respondWith(
              caches.match(request)
                .then(function(response) {
                  console.log("[sw] try to match ", targetName, ' response: ', response)
                  if (response) {
                    return response;
                  } else {
                    return cacheNetlessStaticRequest(request)
                  }
                })
            );
          }
        }
      }
    }
  }
});