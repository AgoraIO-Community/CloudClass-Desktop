import { precacheAndRoute } from 'workbox-precaching';
import { RangeRequestsPlugin } from 'workbox-range-requests';
import { CacheFirst } from 'workbox-strategies/CacheFirst';
import { CacheOnly } from 'workbox-strategies/CacheOnly';
import { NetworkFirst, NetworkFirstOptions } from 'workbox-strategies/NetworkFirst';
import { registerRoute } from 'workbox-routing/registerRoute';
import { agoraCaches } from '../utils/web-download.file';
import { StrategyHandler } from 'workbox-strategies/StrategyHandler';
import progress from '@/components/progress/progress';

declare var self: ServiceWorkerGlobalScope


const cacheName = 'netless'

const manifest = self.__WB_MANIFEST
if (manifest) {
  precacheAndRoute(manifest);
}


if ('BroadcastChannel' in self) {
  console.log("Broadcast channel is supported")
}

const channel = new BroadcastChannel('onFetchProgress');


const onProgress = (payload: { loaded: number, total: number, url: string }) => {
  const progressSize = Math.ceil(payload.loaded / payload.total * 100)
  console.log(" loaded ", payload.loaded, " total ", payload.total, " progressSize ", progressSize)
  channel.postMessage({
    url: payload.url,
    progress: progressSize,
  })
}


class PreFetchZipStrategy extends NetworkFirst {

  private _requests: Map<any, any>;

  constructor(options: NetworkFirstOptions) {
    super(options)
    this._requests = new Map();
  }

  async _handle(request: Request, handler: StrategyHandler): Promise<any> {
    const responsePromise = handler.fetch(request.url)
    this._requests.set(request.url, responsePromise);
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
          controller.close();
        }
      }))
      await this.handleZipFile(newResponse)
      return result
    } catch (err) {
      console.error(err)
      this._requests.delete(request.url);
    }
  }

  async handleZipFile(response: Response) {
    await agoraCaches.handleZipFile(response)
  }
}

const openCacheStorage = () => {
  if ('caches' in self) {
    return caches.open(cacheName)
  }
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

const resourcePattern = new RegExp('^https://convertcdn\.netless\.link\/(static|dynamic)Convert/\(\\S+)\.[^zip]$');

const cacheFirst = new CacheFirst({ cacheName });
const cacheRangeFile = new CacheFirst({
  plugins: [
    new RangeRequestsPlugin(),
  ],
})

const cacheNetworkRaceHandler = async (options: any) => {
  console.log("handle cache first", options)
  return cacheFirst.handle(options)
};

const cacheRangeFileHandler = async (options: any) => {
  return cacheRangeFile.handle(options)
};

registerRoute(
  ({ url }) => url.href.match(resourcePattern) && url.pathname.match(/\.(mp4|mp3|flv|avi|wav)$/i),
  cacheRangeFileHandler
)

registerRoute(
  resourcePattern,
  cacheNetworkRaceHandler,
  'GET',
);

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event: { waitUntil: (arg0: Promise<Cache> | undefined) => any; }) => event.waitUntil(openCacheStorage()));
self.addEventListener('activate', (event: { waitUntil: (arg0: any) => any; }) => event.waitUntil(self.clients.claim()));