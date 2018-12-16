/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */


(function (self) {
  'use strict';

  // On install, cache resources and skip waiting so the worker won't
  // wait for clients to be closed before becoming active.
  self.addEventListener('install', event =>
    event.waitUntil(
      oghliner.cacheResources()
      .then(() => self.skipWaiting())
    )
  );

  // On activation, delete old caches and start controlling the clients
  // without waiting for them to reload.
  self.addEventListener('activate', event =>
    event.waitUntil(
      oghliner.clearOtherCaches()
      .then(() => self.clients.claim())
    )
  );

  // Retrieves the request following oghliner strategy.
  self.addEventListener('fetch', event => {
    if (event.request.method === 'GET') {
      event.respondWith(oghliner.get(event.request));
    } else {
      event.respondWith(self.fetch(event.request));
    }
  });

  var oghliner = self.oghliner = {

    // This is the unique prefix for all the caches controlled by this worker.
    CACHE_PREFIX: 'offline-cache::' + (self.registration ? self.registration.scope : '') + ':',

    // This is the unique name for the cache controlled by this version of the worker.
    get CACHE_NAME() {
      return this.CACHE_PREFIX + '87e88f0880bba9f954445dcba56c836a8c9fe009';
    },

    // This is a list of resources that will be cached.
    RESOURCES: [
      'battery.css', // b911ab6b3d1a5bf03228540e163eaa9e814f85be
      'browser.js', // 7f4f888a80a34a34f740590d1cf45e630e0dc775
      'button-150-300-active.png', // 15d5f5fcc8da84c10fd5c0b6fec600d439aa4525
      'button-150-300.png', // 02e38151dbb78048a4c129f9d878091b61b38996
      'button-300-150.png', // a7dd4e5b94fe1ab69c06a72225f9be169187f654
      'button-300-300-active.png', // 560ffda828374c5baf55be71b196fbdbee3d97d6
      'button-300-300.png', // e227ef6032db53c786fb23c0281f37183c1c44e2
      'button-80-active.png', // cbd8f61a7270e3ecd0aa3622e2af5e482ddb0a83
      'button-80.png', // 8fdefe598b7a0a103a15cd0160f02df64cbd5263
      'button.css', // 0dfffc4f461c473c5331c90fec00c2d88aca47cb
      'button.js', // 4bb9444e9c5f7e5fcd2601bbbda59eff7f82a460
      'dpad-absolute-down.png', // ba1660b243f7fc8ca702fe21b5f4532186fb262b
      'dpad-absolute-left.png', // ffc49f8371bef16b27b51bce73a6da5c710fde40
      'dpad-absolute-right.png', // f67ed2c55b142b9247f4657a3526d588b8099206
      'dpad-absolute-up.png', // 5820392f22f08b9e49c8d4b51ac99e02b51c2b02
      'dpad-absolute.png', // 8cbd3796ada0eab7e75429259359ebddb35ddd6f
      'dpad-arrow-down.png', // 6bd86d65d2b1b19ba7ec4283a40f35982ecc5e89
      'dpad-arrow-left.png', // 69e2c3a5636889ff559684e94c8705d6ab0879a0
      'dpad-arrow-right.png', // 991389282cef44e92a2bd05531789043ee7afa2e
      'dpad-arrow-up.png', // 06f05ae68017731cd40de6d5bf23622b51de7845
      'dpad-background.png', // 7ea8e76a4b2245f4cf0cb64834ec1f04d737d3e5
      'dpad-relative.png', // 04e80247418e473c8c62bbcf3f192fd2f24bd5fa
      'dpad.css', // cdce1a6eb3faa8a7d40d5b70a1ef8df9258d25b6
      'dpad.js', // a4460099c1110a40e8fb68cc34a036dd995755c7
      'gimbal_icon_192.png', // 237503ac6faf1265fbe307cbd2d82f3a080a3a13
      'index.html', // 5000ebaf98032580731dc1e3a0e95740fc7440d3
      'ui.js', // 453c37ece7b4d79a2b7fd155e331c13eb55865f3
    ],

    // Adds the resources to the cache controlled by this worker.
    cacheResources: function () {
      var now = Date.now();
      var baseUrl = self.location;
      return this.prepareCache()
      .then(cache => Promise.all(this.RESOURCES.map(resource => {
        // Bust the request to get a fresh response
        var url = new URL(resource, baseUrl);
        var bustParameter = (url.search ? '&' : '') + '__bust=' + now;
        var bustedUrl = new URL(url.toString());
        bustedUrl.search += bustParameter;

        // But cache the response for the original request
        var requestConfig = { credentials: 'same-origin' };
        var originalRequest = new Request(url.toString(), requestConfig);
        var bustedRequest = new Request(bustedUrl.toString(), requestConfig);
        return fetch(bustedRequest)
        .then(response => {
          if (response.ok) {
            return cache.put(originalRequest, response);
          }
          console.error('Error fetching ' + url + ', status was ' + response.status);
        });
      })));
    },

    // Remove the offline caches not controlled by this worker.
    clearOtherCaches: function () {
      var outOfDate = cacheName => cacheName.startsWith(this.CACHE_PREFIX) && cacheName !== this.CACHE_NAME;

      return self.caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
        .filter(outOfDate)
        .map(cacheName => self.caches.delete(cacheName))
      ));
    },

    // Get a response from the current offline cache or from the network.
    get: function (request) {
      return this.openCache()
      .then(cache => cache.match(() => this.extendToIndex(request)))
      .then(response => {
        if (response) {
          return response;
        }
        return self.fetch(request);
      });
    },

    // Make requests to directories become requests to index.html
    extendToIndex: function (request) {
      var url = new URL(request.url, self.location);
      var path = url.pathname;
      if (path[path.length - 1] !== '/') {
        return request;
      }
      url.pathname += 'index.html';
      return new Request(url.toString(), request);
    },

    // Prepare the cache for installation, deleting it before if it already exists.
    prepareCache: function () {
      return self.caches.delete(this.CACHE_NAME)
      .then(() => this.openCache());
    },

    // Open and cache the offline cache promise to improve the performance when
    // serving from the offline-cache.
    openCache: function () {
      if (!this._cache) {
        this._cache = self.caches.open(this.CACHE_NAME);
      }
      return this._cache;
    }

  };
}(self));
