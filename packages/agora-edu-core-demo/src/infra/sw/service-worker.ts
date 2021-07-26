import { precacheAndRoute } from 'workbox-precaching';
import { RangeRequestsPlugin } from 'workbox-range-requests';
import { CacheFirst } from 'workbox-strategies/CacheFirst';
import { NetworkFirst, NetworkFirstOptions } from 'workbox-strategies/NetworkFirst';
import { registerRoute } from 'workbox-routing/registerRoute';
import { agoraCaches, CacheResourceType } from '../web-download.file';
import { StrategyHandler } from 'workbox-strategies/StrategyHandler';
import { ZipReader, BlobReader, BlobWriter, getMimeType, configure } from '@zip.js/zip.js';

configure({
  useWebWorkers: false
})

type ZipFileType = 'dynamicConvert' | 'staticConvert'

const swLog = console.log.bind(null, '[sw] ')

const resourcesHost = "convertcdn.netless.link";

declare var self: ServiceWorkerGlobalScope

const cacheName = 'netless'

const manifest = self.__WB_MANIFEST
if (manifest) {
  precacheAndRoute(manifest as any);
}

if ('BroadcastChannel' in self) {
  swLog("Broadcast channel is supported")
}

const channel = new BroadcastChannel('onFetchProgress');

const onProgress = (payload: { loaded: number, total: number, url: string }) => {
  const progressSize = Math.ceil(payload.loaded / payload.total * 100)
  // swLog(" loaded ", payload.loaded, " total ", payload.total, " progressSize ", progressSize)
  channel.postMessage({
    url: payload.url,
    progress: progressSize,
  })
}


class PreFetchZipStrategy extends NetworkFirst {

  constructor(options: NetworkFirstOptions) {
    super(options)
  }

  async _handle(request: Request, handler: StrategyHandler): Promise<any> {
    const responsePromise = handler.fetch(request.url)
    try {
      const response = await responsePromise;
      const result = response.clone();
      const newResponse = new Response(new ReadableStream({
        async start(controller: ReadableStreamDefaultController<Uint8Array>) {
          let loaded = 0
          const contentLength = response.headers.get('content-length');
          const total = +contentLength!;
          const reader = response!.body!.getReader();
          while (true) {
            const { done, value }: any = await reader.read();
            if (done) break;
            loaded += value.byteLength;
            onProgress({ loaded, total, url: request.url })
            controller.enqueue(value);
          }
          controller.close()
        }
      }))
      const cacheType = request.url.match(/dynamic/i) ? 'dynamicConvert' : 'staticConvert';
      await this.handleZipFile(newResponse, cacheType)
      return result
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async handleZipFile(response: Response, type: ZipFileType) {
    await this._handleZipFile(response, type)
  }

  private async _handleZipFile(response: Response, type: ZipFileType) {
    const blob = await response.blob()
    const zipReader = await this.getZipReader(blob)
    const entry = await zipReader.getEntries()
    return await this.cacheResources(entry, type)
  }

  public cacheResources = (entries: any, type: CacheResourceType): Promise<void> => {
    return new Promise((fulfill, reject) => {
      return Promise.allSettled(entries.map((data: any) => this.cacheEntry(data, type))).then(fulfill as any, reject);
    })
  }

  private createZipReader = (fileBlob: Blob): ZipReader => {
      return new ZipReader(new BlobReader(fileBlob))
  }

  public getZipReader = (file: Blob): Promise<ZipReader> => {
      return new Promise((resolve: any, reject: any) => {
          return resolve(this.createZipReader(file))
      });
  }

  public getContentType = (filename: any): string => {
      return getMimeType(filename)
  }


  public getLocation = (filename?: string, type?: CacheResourceType): string => {
      if (filename) {
          return `https://${resourcesHost}/${type}/${filename}`
      }
      return `https://${resourcesHost}/dynamicConvert/${filename}`;
  }

  public cacheEntry = async (entry: any, type: CacheResourceType): Promise<void> => {
      if (entry.directory) {
          return Promise.resolve();
      }
      const data = await entry.getData(new BlobWriter())
      const cache = await agoraCaches.openCache(cacheName)
      const location = this.getLocation(entry.filename, type)
      // swLog('location', location)
      const response = new Response(data, {
          headers: {
              "Content-Type": this.getContentType(entry.filename)
          }
      });
      if (entry.filename === "index.html") {
          cache.put(this.getLocation(), response.clone());
          return Promise.resolve()
      }
      return cache.put(location, response);
  }
}

const openCacheStorage = () => {
  return self.caches.open(cacheName)
}

const ZipFirstStrategy = new PreFetchZipStrategy({
  cacheName,
})

const cacheZipResourceHandler = async (options: any) => {
  return ZipFirstStrategy.handle(options)
};

const netlessZipResourcesPattern = new RegExp('^https://convertcdn\.netless\.link\/(static|dynamic)Convert/\(\\S+)\.zip$')

registerRoute(
  netlessZipResourcesPattern,
  cacheZipResourceHandler,
  'GET',
);

const resourcePattern = new RegExp('^https://convertcdn\.netless\.link\/(static|dynamic)Convert');

const cacheFirst = new CacheFirst({ cacheName });
const cacheRangeFile = new CacheFirst({
  plugins: [
    new RangeRequestsPlugin(),
  ],
})

const cacheNetworkRaceHandler = async (options: any) => {
  // swLog("handle cache first", options)
  return cacheFirst.handle(options)
};

const cacheRangeFileHandler = async (options: any) => {
  return cacheRangeFile.handle(options)
};

registerRoute(
  ({ url }: any) => {
    const res = url.href.match(resourcePattern) && url.href.match(/\.(mp4|mp3|flv|avi|wav)$/i)
    // swLog("static large file url", url.href, " hints ", res, " url ", url)
    return res
  },
  cacheRangeFileHandler
)

registerRoute(
  ({ url }: any) => {
    const res = url.href.match(resourcePattern) && !url.href.match(/\.(mp4|mp3|flv|avi|wav|zip)$/i)
    // swLog("static assets file url", url.href, " hints ", res, " url ", url)
    return res
  },
  cacheNetworkRaceHandler,
  'GET',
);

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event: any) => {
  swLog('worker activate event ', event)
})

self.addEventListener('install', (event: { waitUntil: (arg0: Promise<Cache> | undefined) => any; }) => {
  swLog('worker install event ', event)
  self.skipWaiting()
  return event.waitUntil(openCacheStorage())
});
// self.addEventListener('activate', (event: { waitUntil: (arg0: any) => any; }) => event.waitUntil(self.clients.claim()));