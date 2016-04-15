(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @api public
   */

  function require(name){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];
    var threw = true;

    try {
      fn.call(m.exports, function(req){
        var dep = modules[id][1][req];
        return require(dep || req);
      }, m, m.exports, outer, modules, cache, entries);
      threw = false;
    } finally {
      if (threw) {
        delete cache[id];
      } else if (name) {
        // expose as 'name'.
        cache[name] = cache[id];
      }
    }

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {
var Analytics = require('analytics.js-core').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var RetentionScience = require('../lib');

describe('RetentionScience', function() {
  var analytics;
  var retentionScience;
  var options = {
    siteId: '12345',
    customMappings: [{key: 'Bid on Item', value: 'shopping_cart'}]
  };

  beforeEach(function() {
    analytics = new Analytics();
    retentionScience = new RetentionScience(options);
    analytics.use(RetentionScience);
    analytics.use(tester);
    analytics.add(retentionScience);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    retentionScience.reset();
    sandbox();
  });

  it('should have the right settings', function() {
      analytics.compare(RetentionScience, integration('Retention Science')
        .global('_rsq'));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(retentionScience, 'load');
    });

    describe('#initialize', function() {
      it('should create the _rsq array', function() {
        analytics.assert(!window._rsq);
        analytics.initialize();
        analytics.assert(window._rsq);
      });

      it('should call #load', function() {
        analytics.initialize();
        analytics.page();
        analytics.called(retentionScience.load);
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(retentionScience, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.stub(window._rsq, 'push');
    });

    describe('#page', function() {
      it('should add a page track', function() {
        analytics.page();
        analytics.called(window._rsq.push, ['_track']);
      });
    });

    describe('#track', function() {
      it('calls viewed product', function() {
        analytics.stub(retentionScience, 'viewedProduct');
        analytics.track('Viewed Product', {});
        analytics.called(retentionScience.viewedProduct);
      });

      it('pushes viewed product', function() {
        analytics.track('Viewed Product', { sku: 'xxxxx' });
        analytics.called(window._rsq.push, ['_setUserId', '']);
        analytics.called(window._rsq.push, ['_setUserEmail', '']);
        analytics.called(window._rsq.push, ['_addItem', {
          id: 'xxxxx',
          name: '',
          price: ''
        }]);
      });

      it('adds defaults', function() {
        analytics.identify(123, { email: 'schnie@astronomer.io' });
        analytics.track('Viewed Product', {});
        analytics.called(window._rsq.push, ['_setSiteId', '12345']);
        analytics.called(window._rsq.push, ['_setUserId', '123']);
        analytics.called(window._rsq.push, ['_setUserEmail', 'schnie@astronomer.io']);
      });

      it('calls completed order', function() {
        analytics.stub(retentionScience, 'completedOrder');
        analytics.track('Completed Order', {});
        analytics.called(retentionScience.completedOrder);
      });

      it('calls added product', function() {
        analytics.stub(retentionScience, 'addedProduct');
        analytics.track('Added Product', {});
        analytics.called(retentionScience.addedProduct);
      });

      it('calls custom mappings', function () {
          analytics.track('Bid on Item', {});
          analytics.called(window._rsq.push, ['_setAction', 'shopping_cart']);
      });

      it('pushes completed order', function() {
        analytics.track('Completed Order', {
          id: 'xxxxx-xxxxx',
          revenue: 150.00,
          products: [{
            id: '123',
            name: 'product1',
            price: 50.00
          }, {
            sku: '456',
            name: 'product2',
            price: 100.00
          }]
        });
        analytics.called(window._rsq.push, ['_setSiteId', '12345']);
        analytics.called(window._rsq.push, ['_setUserId', '']);
        analytics.called(window._rsq.push, ['_setUserEmail', '']);
        analytics.called(window._rsq.push, ['_addOrder', { id: 'xxxxx-xxxxx', total: '150' }]);
        analytics.called(window._rsq.push, ['_addItem', {
          id: '123',
          name: 'product1',
          price: '50'
        }]);
        analytics.called(window._rsq.push, ['_addItem', {
          id: '456',
          name: 'product2',
          price: '100'
        }]);
      });
    });
  });
});

}, {"analytics.js-core":2,"analytics.js-integration":3,"clear-env":4,"analytics.js-integration-tester":5,"../lib":6}],
2: [function(require, module, exports) {

/**
 * Analytics.js
 *
 * (C) 2013 Segment.io Inc.
 */

var Analytics = require('./analytics');

/**
 * Expose the `analytics` singleton.
 */

var analytics = module.exports = exports = new Analytics();

/**
 * Expose require
 */

analytics.require = require;

/**
 * Expose `VERSION`.
 */

exports.VERSION = require('../bower.json').version;

}, {"./analytics":7,"../bower.json":8}],
7: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var _analytics = window.analytics;
var Emitter = require('emitter');
var Facade = require('facade');
var after = require('after');
var bind = require('bind');
var callback = require('callback');
var clone = require('clone');
var cookie = require('./cookie');
var debug = require('debug');
var defaults = require('defaults');
var each = require('each');
var foldl = require('foldl');
var group = require('./group');
var is = require('is');
var isMeta = require('is-meta');
var keys = require('object').keys;
var memory = require('./memory');
var normalize = require('./normalize');
var on = require('event').bind;
var pageDefaults = require('./pageDefaults');
var pick = require('pick');
var prevent = require('prevent');
var querystring = require('querystring');
var size = require('object').length;
var store = require('./store');
var user = require('./user');
var Alias = Facade.Alias;
var Group = Facade.Group;
var Identify = Facade.Identify;
var Page = Facade.Page;
var Track = Facade.Track;

/**
 * Expose `Analytics`.
 */

exports = module.exports = Analytics;

/**
 * Expose storage.
 */

exports.cookie = cookie;
exports.store = store;
exports.memory = memory;

/**
 * Initialize a new `Analytics` instance.
 */

function Analytics() {
  this._options({});
  this.Integrations = {};
  this._integrations = {};
  this._readied = false;
  this._timeout = 300;
  // XXX: BACKWARDS COMPATIBILITY
  this._user = user;
  this.log = debug('analytics.js');
  bind.all(this);

  var self = this;
  this.on('initialize', function(settings, options){
    if (options.initialPageview) self.page();
    self._parseQuery(window.location.search);
  });
}

/**
 * Event Emitter.
 */

Emitter(Analytics.prototype);

/**
 * Use a `plugin`.
 *
 * @param {Function} plugin
 * @return {Analytics}
 */

Analytics.prototype.use = function(plugin) {
  plugin(this);
  return this;
};

/**
 * Define a new `Integration`.
 *
 * @param {Function} Integration
 * @return {Analytics}
 */

Analytics.prototype.addIntegration = function(Integration) {
  var name = Integration.prototype.name;
  if (!name) throw new TypeError('attempted to add an invalid integration');
  this.Integrations[name] = Integration;
  return this;
};

/**
 * Initialize with the given integration `settings` and `options`.
 *
 * Aliased to `init` for convenience.
 *
 * @param {Object} [settings={}]
 * @param {Object} [options={}]
 * @return {Analytics}
 */

Analytics.prototype.init = Analytics.prototype.initialize = function(settings, options) {
  settings = settings || {};
  options = options || {};

  this._options(options);
  this._readied = false;

  // clean unknown integrations from settings
  var self = this;
  each(settings, function(name) {
    var Integration = self.Integrations[name];
    if (!Integration) delete settings[name];
  });

  // add integrations
  each(settings, function(name, opts) {
    var Integration = self.Integrations[name];
    var integration = new Integration(clone(opts));
    self.log('initialize %o - %o', name, opts);
    self.add(integration);
  });

  var integrations = this._integrations;

  // load user now that options are set
  user.load();
  group.load();

  // make ready callback
  var ready = after(size(integrations), function() {
    self._readied = true;
    self.emit('ready');
  });

  // initialize integrations, passing ready
  each(integrations, function(name, integration) {
    if (options.initialPageview && integration.options.initialPageview === false) {
      integration.page = after(2, integration.page);
    }

    integration.analytics = self;
    integration.once('ready', ready);
    integration.initialize();
  });

  // backwards compat with angular plugin.
  // TODO: remove
  this.initialized = true;

  this.emit('initialize', settings, options);
  return this;
};

/**
 * Set the user's `id`.
 *
 * @param {Mixed} id
 */

Analytics.prototype.setAnonymousId = function(id){
  this.user().anonymousId(id);
  return this;
};

/**
 * Add an integration.
 *
 * @param {Integration} integration
 */

Analytics.prototype.add = function(integration){
  this._integrations[integration.name] = integration;
  return this;
};

/**
 * Identify a user by optional `id` and `traits`.
 *
 * @param {string} [id=user.id()] User ID.
 * @param {Object} [traits=null] User traits.
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics}
 */

Analytics.prototype.identify = function(id, traits, options, fn) {
  // Argument reshuffling.
  /* eslint-disable no-unused-expressions, no-sequences */
  if (is.fn(options)) fn = options, options = null;
  if (is.fn(traits)) fn = traits, options = null, traits = null;
  if (is.object(id)) options = traits, traits = id, id = user.id();
  /* eslint-enable no-unused-expressions, no-sequences */

  // clone traits before we manipulate so we don't do anything uncouth, and take
  // from `user` so that we carryover anonymous traits
  user.identify(id, traits);

  var msg = this.normalize({
    options: options,
    traits: user.traits(),
    userId: user.id()
  });

  this._invoke('identify', new Identify(msg));

  // emit
  this.emit('identify', id, traits, options);
  this._callback(fn);
  return this;
};

/**
 * Return the current user.
 *
 * @return {Object}
 */

Analytics.prototype.user = function() {
  return user;
};

/**
 * Identify a group by optional `id` and `traits`. Or, if no arguments are
 * supplied, return the current group.
 *
 * @param {string} [id=group.id()] Group ID.
 * @param {Object} [traits=null] Group traits.
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics|Object}
 */

Analytics.prototype.group = function(id, traits, options, fn) {
  /* eslint-disable no-unused-expressions, no-sequences */
  if (!arguments.length) return group;
  if (is.fn(options)) fn = options, options = null;
  if (is.fn(traits)) fn = traits, options = null, traits = null;
  if (is.object(id)) options = traits, traits = id, id = group.id();
  /* eslint-enable no-unused-expressions, no-sequences */


  // grab from group again to make sure we're taking from the source
  group.identify(id, traits);

  var msg = this.normalize({
    options: options,
    traits: group.traits(),
    groupId: group.id()
  });

  this._invoke('group', new Group(msg));

  this.emit('group', id, traits, options);
  this._callback(fn);
  return this;
};

/**
 * Track an `event` that a user has triggered with optional `properties`.
 *
 * @param {string} event
 * @param {Object} [properties=null]
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics}
 */

Analytics.prototype.track = function(event, properties, options, fn) {
  // Argument reshuffling.
  /* eslint-disable no-unused-expressions, no-sequences */
  if (is.fn(options)) fn = options, options = null;
  if (is.fn(properties)) fn = properties, options = null, properties = null;
  /* eslint-enable no-unused-expressions, no-sequences */

  // figure out if the event is archived.
  var plan = this.options.plan || {};
  var events = plan.track || {};

  // normalize
  var msg = this.normalize({
    properties: properties,
    options: options,
    event: event
  });

  // plan.
  plan = events[event];
  if (plan) {
    this.log('plan %o - %o', event, plan);
    if (plan.enabled === false) return this._callback(fn);
    defaults(msg.integrations, plan.integrations || {});
  }

  this._invoke('track', new Track(msg));

  this.emit('track', event, properties, options);
  this._callback(fn);
  return this;
};

/**
 * Helper method to track an outbound link that would normally navigate away
 * from the page before the analytics calls were sent.
 *
 * BACKWARDS COMPATIBILITY: aliased to `trackClick`.
 *
 * @param {Element|Array} links
 * @param {string|Function} event
 * @param {Object|Function} properties (optional)
 * @return {Analytics}
 */

Analytics.prototype.trackClick = Analytics.prototype.trackLink = function(links, event, properties) {
  if (!links) return this;
  // always arrays, handles jquery
  if (is.element(links)) links = [links];

  var self = this;
  each(links, function(el) {
    if (!is.element(el)) throw new TypeError('Must pass HTMLElement to `analytics.trackLink`.');
    on(el, 'click', function(e) {
      var ev = is.fn(event) ? event(el) : event;
      var props = is.fn(properties) ? properties(el) : properties;
      var href = el.getAttribute('href')
        || el.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
        || el.getAttribute('xlink:href');

      self.track(ev, props);

      if (href && el.target !== '_blank' && !isMeta(e)) {
        prevent(e);
        self._callback(function() {
          window.location.href = href;
        });
      }
    });
  });

  return this;
};

/**
 * Helper method to track an outbound form that would normally navigate away
 * from the page before the analytics calls were sent.
 *
 * BACKWARDS COMPATIBILITY: aliased to `trackSubmit`.
 *
 * @param {Element|Array} forms
 * @param {string|Function} event
 * @param {Object|Function} properties (optional)
 * @return {Analytics}
 */

Analytics.prototype.trackSubmit = Analytics.prototype.trackForm = function(forms, event, properties) {
  if (!forms) return this;
  // always arrays, handles jquery
  if (is.element(forms)) forms = [forms];

  var self = this;
  each(forms, function(el) {
    if (!is.element(el)) throw new TypeError('Must pass HTMLElement to `analytics.trackForm`.');
    function handler(e) {
      prevent(e);

      var ev = is.fn(event) ? event(el) : event;
      var props = is.fn(properties) ? properties(el) : properties;
      self.track(ev, props);

      self._callback(function() {
        el.submit();
      });
    }

    // Support the events happening through jQuery or Zepto instead of through
    // the normal DOM API, because `el.submit` doesn't bubble up events...
    var $ = window.jQuery || window.Zepto;
    if ($) {
      $(el).submit(handler);
    } else {
      on(el, 'submit', handler);
    }
  });

  return this;
};

/**
 * Trigger a pageview, labeling the current page with an optional `category`,
 * `name` and `properties`.
 *
 * @param {string} [category]
 * @param {string} [name]
 * @param {Object|string} [properties] (or path)
 * @param {Object} [options]
 * @param {Function} [fn]
 * @return {Analytics}
 */

Analytics.prototype.page = function(category, name, properties, options, fn) {
  // Argument reshuffling.
  /* eslint-disable no-unused-expressions, no-sequences */
  if (is.fn(options)) fn = options, options = null;
  if (is.fn(properties)) fn = properties, options = properties = null;
  if (is.fn(name)) fn = name, options = properties = name = null;
  if (is.object(category)) options = name, properties = category, name = category = null;
  if (is.object(name)) options = properties, properties = name, name = null;
  if (is.string(category) && !is.string(name)) name = category, category = null;
  /* eslint-enable no-unused-expressions, no-sequences */

  properties = clone(properties) || {};
  if (name) properties.name = name;
  if (category) properties.category = category;

  // Ensure properties has baseline spec properties.
  // TODO: Eventually move these entirely to `options.context.page`
  var defs = pageDefaults();
  defaults(properties, defs);

  // Mirror user overrides to `options.context.page` (but exclude custom properties)
  // (Any page defaults get applied in `this.normalize` for consistency.)
  // Weird, yeah--moving special props to `context.page` will fix this in the long term.
  var overrides = pick(keys(defs), properties);
  if (!is.empty(overrides)) {
    options = options || {};
    options.context = options.context || {};
    options.context.page = overrides;
  }

  var msg = this.normalize({
    properties: properties,
    category: category,
    options: options,
    name: name
  });

  this._invoke('page', new Page(msg));

  this.emit('page', category, name, properties, options);
  this._callback(fn);
  return this;
};

/**
 * FIXME: BACKWARDS COMPATIBILITY: convert an old `pageview` to a `page` call.
 *
 * @param {string} [url]
 * @return {Analytics}
 * @api private
 */

Analytics.prototype.pageview = function(url) {
  var properties = {};
  if (url) properties.path = url;
  this.page(properties);
  return this;
};

/**
 * Merge two previously unassociated user identities.
 *
 * @param {string} to
 * @param {string} from (optional)
 * @param {Object} options (optional)
 * @param {Function} fn (optional)
 * @return {Analytics}
 */

Analytics.prototype.alias = function(to, from, options, fn) {
  // Argument reshuffling.
  /* eslint-disable no-unused-expressions, no-sequences */
  if (is.fn(options)) fn = options, options = null;
  if (is.fn(from)) fn = from, options = null, from = null;
  if (is.object(from)) options = from, from = null;
  /* eslint-enable no-unused-expressions, no-sequences */

  var msg = this.normalize({
    options: options,
    previousId: from,
    userId: to
  });

  this._invoke('alias', new Alias(msg));

  this.emit('alias', to, from, options);
  this._callback(fn);
  return this;
};

/**
 * Register a `fn` to be fired when all the analytics services are ready.
 *
 * @param {Function} fn
 * @return {Analytics}
 */

Analytics.prototype.ready = function(fn) {
  if (is.fn(fn)) {
    if (this._readied) {
      callback.async(fn);
    } else {
      this.once('ready', fn);
    }
  }
  return this;
};

/**
 * Set the `timeout` (in milliseconds) used for callbacks.
 *
 * @param {Number} timeout
 */

Analytics.prototype.timeout = function(timeout) {
  this._timeout = timeout;
};

/**
 * Enable or disable debug.
 *
 * @param {string|boolean} str
 */

Analytics.prototype.debug = function(str){
  if (!arguments.length || str) {
    debug.enable('analytics:' + (str || '*'));
  } else {
    debug.disable();
  }
};

/**
 * Apply options.
 *
 * @param {Object} options
 * @return {Analytics}
 * @api private
 */

Analytics.prototype._options = function(options) {
  options = options || {};
  this.options = options;
  cookie.options(options.cookie);
  store.options(options.localStorage);
  user.options(options.user);
  group.options(options.group);
  return this;
};

/**
 * Callback a `fn` after our defined timeout period.
 *
 * @param {Function} fn
 * @return {Analytics}
 * @api private
 */

Analytics.prototype._callback = function(fn) {
  callback.async(fn, this._timeout);
  return this;
};

/**
 * Call `method` with `facade` on all enabled integrations.
 *
 * @param {string} method
 * @param {Facade} facade
 * @return {Analytics}
 * @api private
 */

Analytics.prototype._invoke = function(method, facade) {
  this.emit('invoke', facade);

  each(this._integrations, function(name, integration) {
    if (!facade.enabled(name)) return;
    integration.invoke.call(integration, method, facade);
  });

  return this;
};

/**
 * Push `args`.
 *
 * @param {Array} args
 * @api private
 */

Analytics.prototype.push = function(args){
  var method = args.shift();
  if (!this[method]) return;
  this[method].apply(this, args);
};

/**
 * Reset group and user traits and id's.
 *
 * @api public
 */

Analytics.prototype.reset = function(){
  this.user().logout();
  this.group().logout();
};

/**
 * Parse the query string for callable methods.
 *
 * @param {String} query
 * @return {Analytics}
 * @api private
 */

Analytics.prototype._parseQuery = function(query) {
  // Parse querystring to an object
  var q = querystring.parse(query);
  // Create traits and properties objects, populate from querysting params
  var traits = pickPrefix('ajs_trait_', q);
  var props = pickPrefix('ajs_prop_', q);
  // Trigger based on callable parameters in the URL
  if (q.ajs_uid) this.identify(q.ajs_uid, traits);
  if (q.ajs_event) this.track(q.ajs_event, props);
  if (q.ajs_aid) user.anonymousId(q.ajs_aid);
  return this;

  /**
   * Create a shallow copy of an input object containing only the properties
   * whose keys are specified by a prefix, stripped of that prefix
   *
   * @param {String} prefix
   * @param {Object} object
   * @return {Object}
   * @api private
   */

  function pickPrefix(prefix, object) {
    var length = prefix.length;
    var sub;
    return foldl(function(acc, val, key) {
      if (key.substr(0, length) === prefix) {
        sub = key.substr(length);
        acc[sub] = val;
      }
      return acc;
    }, {}, object);
  }
};

/**
 * Normalize the given `msg`.
 *
 * @param {Object} msg
 * @return {Object}
 */

Analytics.prototype.normalize = function(msg){
  msg = normalize(msg, keys(this._integrations));
  if (msg.anonymousId) user.anonymousId(msg.anonymousId);
  msg.anonymousId = user.anonymousId();

  // Ensure all outgoing requests include page data in their contexts.
  msg.context.page = defaults(msg.context.page || {}, pageDefaults());

  return msg;
};

/**
 * No conflict support.
 */

Analytics.prototype.noConflict = function(){
  window.analytics = _analytics;
  return this;
};

}, {"emitter":9,"facade":10,"after":11,"bind":12,"callback":13,"clone":14,"./cookie":15,"debug":16,"defaults":17,"each":18,"foldl":19,"./group":20,"is":21,"is-meta":22,"object":23,"./memory":24,"./normalize":25,"event":26,"./pageDefaults":27,"pick":28,"prevent":29,"querystring":30,"./store":31,"./user":32}],
9: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

}, {"indexof":33}],
33: [function(require, module, exports) {
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
}, {}],
10: [function(require, module, exports) {

var Facade = require('./facade');

/**
 * Expose `Facade` facade.
 */

module.exports = Facade;

/**
 * Expose specific-method facades.
 */

Facade.Alias = require('./alias');
Facade.Group = require('./group');
Facade.Identify = require('./identify');
Facade.Track = require('./track');
Facade.Page = require('./page');
Facade.Screen = require('./screen');

}, {"./facade":34,"./alias":35,"./group":36,"./identify":37,"./track":38,"./page":39,"./screen":40}],
34: [function(require, module, exports) {

var traverse = require('isodate-traverse');
var isEnabled = require('./is-enabled');
var clone = require('./utils').clone;
var type = require('./utils').type;
var address = require('./address');
var objCase = require('obj-case');
var newDate = require('new-date');

/**
 * Expose `Facade`.
 */

module.exports = Facade;

/**
 * Initialize a new `Facade` with an `obj` of arguments.
 *
 * @param {Object} obj
 */

function Facade (obj) {
  obj = clone(obj);
  if (!obj.hasOwnProperty('timestamp')) obj.timestamp = new Date();
  else obj.timestamp = newDate(obj.timestamp);
  traverse(obj);
  this.obj = obj;
}

/**
 * Mixin address traits.
 */

address(Facade.prototype);

/**
 * Return a proxy function for a `field` that will attempt to first use methods,
 * and fallback to accessing the underlying object directly. You can specify
 * deeply nested fields too like:
 *
 *   this.proxy('options.Librato');
 *
 * @param {String} field
 */

Facade.prototype.proxy = function (field) {
  var fields = field.split('.');
  field = fields.shift();

  // Call a function at the beginning to take advantage of facaded fields
  var obj = this[field] || this.field(field);
  if (!obj) return obj;
  if (typeof obj === 'function') obj = obj.call(this) || {};
  if (fields.length === 0) return transform(obj);

  obj = objCase(obj, fields.join('.'));
  return transform(obj);
};

/**
 * Directly access a specific `field` from the underlying object, returning a
 * clone so outsiders don't mess with stuff.
 *
 * @param {String} field
 * @return {Mixed}
 */

Facade.prototype.field = function (field) {
  var obj = this.obj[field];
  return transform(obj);
};

/**
 * Utility method to always proxy a particular `field`. You can specify deeply
 * nested fields too like:
 *
 *   Facade.proxy('options.Librato');
 *
 * @param {String} field
 * @return {Function}
 */

Facade.proxy = function (field) {
  return function () {
    return this.proxy(field);
  };
};

/**
 * Utility method to directly access a `field`.
 *
 * @param {String} field
 * @return {Function}
 */

Facade.field = function (field) {
  return function () {
    return this.field(field);
  };
};

/**
 * Proxy multiple `path`.
 *
 * @param {String} path
 * @return {Array}
 */

Facade.multi = function(path){
  return function(){
    var multi = this.proxy(path + 's');
    if ('array' == type(multi)) return multi;
    var one = this.proxy(path);
    if (one) one = [clone(one)];
    return one || [];
  };
};

/**
 * Proxy one `path`.
 *
 * @param {String} path
 * @return {Mixed}
 */

Facade.one = function(path){
  return function(){
    var one = this.proxy(path);
    if (one) return one;
    var multi = this.proxy(path + 's');
    if ('array' == type(multi)) return multi[0];
  };
};

/**
 * Get the basic json object of this facade.
 *
 * @return {Object}
 */

Facade.prototype.json = function () {
  var ret = clone(this.obj);
  if (this.type) ret.type = this.type();
  return ret;
};

/**
 * Get the options of a call (formerly called "context"). If you pass an
 * integration name, it will get the options for that specific integration, or
 * undefined if the integration is not enabled.
 *
 * @param {String} integration (optional)
 * @return {Object or Null}
 */

Facade.prototype.context =
Facade.prototype.options = function (integration) {
  var options = clone(this.obj.options || this.obj.context) || {};
  if (!integration) return clone(options);
  if (!this.enabled(integration)) return;
  var integrations = this.integrations();
  var value = integrations[integration] || objCase(integrations, integration);
  if ('boolean' == typeof value) value = {};
  return value || {};
};

/**
 * Check whether an integration is enabled.
 *
 * @param {String} integration
 * @return {Boolean}
 */

Facade.prototype.enabled = function (integration) {
  var allEnabled = this.proxy('options.providers.all');
  if (typeof allEnabled !== 'boolean') allEnabled = this.proxy('options.all');
  if (typeof allEnabled !== 'boolean') allEnabled = this.proxy('integrations.all');
  if (typeof allEnabled !== 'boolean') allEnabled = true;

  var enabled = allEnabled && isEnabled(integration);
  var options = this.integrations();

  // If the integration is explicitly enabled or disabled, use that
  // First, check options.providers for backwards compatibility
  if (options.providers && options.providers.hasOwnProperty(integration)) {
    enabled = options.providers[integration];
  }

  // Next, check for the integration's existence in 'options' to enable it.
  // If the settings are a boolean, use that, otherwise it should be enabled.
  if (options.hasOwnProperty(integration)) {
    var settings = options[integration];
    if (typeof settings === 'boolean') {
      enabled = settings;
    } else {
      enabled = true;
    }
  }

  return enabled ? true : false;
};

/**
 * Get all `integration` options.
 *
 * @param {String} integration
 * @return {Object}
 * @api private
 */

Facade.prototype.integrations = function(){
  return this.obj.integrations
    || this.proxy('options.providers')
    || this.options();
};

/**
 * Check whether the user is active.
 *
 * @return {Boolean}
 */

Facade.prototype.active = function () {
  var active = this.proxy('options.active');
  if (active === null || active === undefined) active = true;
  return active;
};

/**
 * Get `sessionId / anonymousId`.
 *
 * @return {Mixed}
 * @api public
 */

Facade.prototype.sessionId =
Facade.prototype.anonymousId = function(){
  return this.field('anonymousId')
    || this.field('sessionId');
};

/**
 * Get `groupId` from `context.groupId`.
 *
 * @return {String}
 * @api public
 */

Facade.prototype.groupId = Facade.proxy('options.groupId');

/**
 * Get the call's "super properties" which are just traits that have been
 * passed in as if from an identify call.
 *
 * @param {Object} aliases
 * @return {Object}
 */

Facade.prototype.traits = function (aliases) {
  var ret = this.proxy('options.traits') || {};
  var id = this.userId();
  aliases = aliases || {};

  if (id) ret.id = id;

  for (var alias in aliases) {
    var value = null == this[alias]
      ? this.proxy('options.traits.' + alias)
      : this[alias]();
    if (null == value) continue;
    ret[aliases[alias]] = value;
    delete ret[alias];
  }

  return ret;
};

/**
 * Add a convenient way to get the library name and version
 */

Facade.prototype.library = function(){
  var library = this.proxy('options.library');
  if (!library) return { name: 'unknown', version: null };
  if (typeof library === 'string') return { name: library, version: null };
  return library;
};

/**
 * Setup some basic proxies.
 */

Facade.prototype.userId = Facade.field('userId');
Facade.prototype.channel = Facade.field('channel');
Facade.prototype.timestamp = Facade.field('timestamp');
Facade.prototype.userAgent = Facade.proxy('options.userAgent');
Facade.prototype.ip = Facade.proxy('options.ip');

/**
 * Return the cloned and traversed object
 *
 * @param {Mixed} obj
 * @return {Mixed}
 */

function transform(obj){
  var cloned = clone(obj);
  return cloned;
}

}, {"isodate-traverse":41,"./is-enabled":42,"./utils":43,"./address":44,"obj-case":45,"new-date":46}],
41: [function(require, module, exports) {

var is = require('is');
var isodate = require('isodate');
var each;

try {
  each = require('each');
} catch (err) {
  each = require('each-component');
}

/**
 * Expose `traverse`.
 */

module.exports = traverse;

/**
 * Traverse an object or array, and return a clone with all ISO strings parsed
 * into Date objects.
 *
 * @param {Object} obj
 * @return {Object}
 */

function traverse (input, strict) {
  if (strict === undefined) strict = true;

  if (is.object(input)) return object(input, strict);
  if (is.array(input)) return array(input, strict);
  return input;
}

/**
 * Object traverser.
 *
 * @param {Object} obj
 * @param {Boolean} strict
 * @return {Object}
 */

function object (obj, strict) {
  each(obj, function (key, val) {
    if (isodate.is(val, strict)) {
      obj[key] = isodate.parse(val);
    } else if (is.object(val) || is.array(val)) {
      traverse(val, strict);
    }
  });
  return obj;
}

/**
 * Array traverser.
 *
 * @param {Array} arr
 * @param {Boolean} strict
 * @return {Array}
 */

function array (arr, strict) {
  each(arr, function (val, x) {
    if (is.object(val)) {
      traverse(val, strict);
    } else if (isodate.is(val, strict)) {
      arr[x] = isodate.parse(val);
    }
  });
  return arr;
}

}, {"is":47,"isodate":48,"each":18}],
47: [function(require, module, exports) {

var isEmpty = require('is-empty');

try {
  var typeOf = require('type');
} catch (e) {
  var typeOf = require('component-type');
}


/**
 * Types.
 */

var types = [
  'arguments',
  'array',
  'boolean',
  'date',
  'element',
  'function',
  'null',
  'number',
  'object',
  'regexp',
  'string',
  'undefined'
];


/**
 * Expose type checkers.
 *
 * @param {Mixed} value
 * @return {Boolean}
 */

for (var i = 0, type; type = types[i]; i++) exports[type] = generate(type);


/**
 * Add alias for `function` for old browsers.
 */

exports.fn = exports['function'];


/**
 * Expose `empty` check.
 */

exports.empty = isEmpty;


/**
 * Expose `nan` check.
 */

exports.nan = function (val) {
  return exports.number(val) && val != val;
};


/**
 * Generate a type checker.
 *
 * @param {String} type
 * @return {Function}
 */

function generate (type) {
  return function (value) {
    return type === typeOf(value);
  };
}
}, {"is-empty":49,"type":50,"component-type":50}],
49: [function(require, module, exports) {

/**
 * Expose `isEmpty`.
 */

module.exports = isEmpty;


/**
 * Has.
 */

var has = Object.prototype.hasOwnProperty;


/**
 * Test whether a value is "empty".
 *
 * @param {Mixed} val
 * @return {Boolean}
 */

function isEmpty (val) {
  if (null == val) return true;
  if ('boolean' == typeof val) return false;
  if ('number' == typeof val) return 0 === val;
  if (undefined !== val.length) return 0 === val.length;
  for (var key in val) if (has.call(val, key)) return false;
  return true;
}

}, {}],
50: [function(require, module, exports) {
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  if (isBuffer(val)) return 'buffer';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val);

  return typeof val;
};

// code borrowed from https://github.com/feross/is-buffer/blob/master/index.js
function isBuffer(obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

}, {}],
48: [function(require, module, exports) {

/**
 * Matcher, slightly modified from:
 *
 * https://github.com/csnover/js-iso8601/blob/lax/iso8601.js
 */

var matcher = /^(\d{4})(?:-?(\d{2})(?:-?(\d{2}))?)?(?:([ T])(\d{2}):?(\d{2})(?::?(\d{2})(?:[,\.](\d{1,}))?)?(?:(Z)|([+\-])(\d{2})(?::?(\d{2}))?)?)?$/;


/**
 * Convert an ISO date string to a date. Fallback to native `Date.parse`.
 *
 * https://github.com/csnover/js-iso8601/blob/lax/iso8601.js
 *
 * @param {String} iso
 * @return {Date}
 */

exports.parse = function (iso) {
  var numericKeys = [1, 5, 6, 7, 11, 12];
  var arr = matcher.exec(iso);
  var offset = 0;

  // fallback to native parsing
  if (!arr) return new Date(iso);

  // remove undefined values
  for (var i = 0, val; val = numericKeys[i]; i++) {
    arr[val] = parseInt(arr[val], 10) || 0;
  }

  // allow undefined days and months
  arr[2] = parseInt(arr[2], 10) || 1;
  arr[3] = parseInt(arr[3], 10) || 1;

  // month is 0-11
  arr[2]--;

  // allow abitrary sub-second precision
  arr[8] = arr[8]
    ? (arr[8] + '00').substring(0, 3)
    : 0;

  // apply timezone if one exists
  if (arr[4] == ' ') {
    offset = new Date().getTimezoneOffset();
  } else if (arr[9] !== 'Z' && arr[10]) {
    offset = arr[11] * 60 + arr[12];
    if ('+' == arr[10]) offset = 0 - offset;
  }

  var millis = Date.UTC(arr[1], arr[2], arr[3], arr[5], arr[6] + offset, arr[7], arr[8]);
  return new Date(millis);
};


/**
 * Checks whether a `string` is an ISO date string. `strict` mode requires that
 * the date string at least have a year, month and date.
 *
 * @param {String} string
 * @param {Boolean} strict
 * @return {Boolean}
 */

exports.is = function (string, strict) {
  if (strict && false === /^\d{4}-\d{2}-\d{2}/.test(string)) return false;
  return matcher.test(string);
};
}, {}],
18: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var type = require('type');

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @api public
 */

module.exports = function(obj, fn){
  switch (type(obj)) {
    case 'array':
      return array(obj, fn);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn);
      return object(obj, fn);
    case 'string':
      return string(obj, fn);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @api private
 */

function string(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

function object(obj, fn) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn(key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @api private
 */

function array(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj[i], i);
  }
}
}, {"type":50}],
42: [function(require, module, exports) {

/**
 * A few integrations are disabled by default. They must be explicitly
 * enabled by setting options[Provider] = true.
 */

var disabled = {
  Salesforce: true
};

/**
 * Check whether an integration should be enabled by default.
 *
 * @param {String} integration
 * @return {Boolean}
 */

module.exports = function (integration) {
  return ! disabled[integration];
};
}, {}],
43: [function(require, module, exports) {

/**
 * TODO: use component symlink, everywhere ?
 */

try {
  exports.inherit = require('inherit');
  exports.clone = require('clone');
  exports.type = require('type');
} catch (e) {
  exports.inherit = require('inherit-component');
  exports.clone = require('clone-component');
  exports.type = require('type-component');
}

}, {"inherit":51,"clone":52,"type":50}],
51: [function(require, module, exports) {

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
}, {}],
52: [function(require, module, exports) {
/**
 * Module dependencies.
 */

var type;
try {
  type = require('component-type');
} catch (_) {
  type = require('type');
}

/**
 * Module exports.
 */

module.exports = clone;

/**
 * Clones objects.
 *
 * @param {Mixed} any object
 * @api public
 */

function clone(obj){
  switch (type(obj)) {
    case 'object':
      var copy = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = clone(obj[key]);
        }
      }
      return copy;

    case 'array':
      var copy = new Array(obj.length);
      for (var i = 0, l = obj.length; i < l; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;

    case 'regexp':
      // from millermedeiros/amd-utils - MIT
      var flags = '';
      flags += obj.multiline ? 'm' : '';
      flags += obj.global ? 'g' : '';
      flags += obj.ignoreCase ? 'i' : '';
      return new RegExp(obj.source, flags);

    case 'date':
      return new Date(obj.getTime());

    default: // string, number, boolean, …
      return obj;
  }
}

}, {"component-type":50,"type":50}],
44: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var get = require('obj-case');

/**
 * Add address getters to `proto`.
 *
 * @param {Function} proto
 */

module.exports = function(proto){
  proto.zip = trait('postalCode', 'zip');
  proto.country = trait('country');
  proto.street = trait('street');
  proto.state = trait('state');
  proto.city = trait('city');

  function trait(a, b){
    return function(){
      var traits = this.traits();
      var props = this.properties ? this.properties() : {};

      return get(traits, 'address.' + a)
        || get(traits, a)
        || (b ? get(traits, 'address.' + b) : null)
        || (b ? get(traits, b) : null)
        || get(props, 'address.' + a)
        || get(props, a)
        || (b ? get(props, 'address.' + b) : null)
        || (b ? get(props, b) : null);
    };
  }
};

}, {"obj-case":45}],
45: [function(require, module, exports) {

var identity = function(_){ return _; };


/**
 * Module exports, export
 */

module.exports = multiple(find);
module.exports.find = module.exports;


/**
 * Export the replacement function, return the modified object
 */

module.exports.replace = function (obj, key, val, options) {
  multiple(replace).call(this, obj, key, val, options);
  return obj;
};


/**
 * Export the delete function, return the modified object
 */

module.exports.del = function (obj, key, options) {
  multiple(del).call(this, obj, key, null, options);
  return obj;
};


/**
 * Compose applying the function to a nested key
 */

function multiple (fn) {
  return function (obj, path, val, options) {
    var normalize = options && isFunction(options.normalizer) ? options.normalizer : defaultNormalize;
    path = normalize(path);

    var key;
    var finished = false;

    while (!finished) loop();

    function loop() {
      for (key in obj) {
        var normalizedKey = normalize(key);
        if (0 === path.indexOf(normalizedKey)) {
          var temp = path.substr(normalizedKey.length);
          if (temp.charAt(0) === '.' || temp.length === 0) {
            path = temp.substr(1);
            var child = obj[key];

            // we're at the end and there is nothing.
            if (null == child) {
              finished = true;
              return;
            }

            // we're at the end and there is something.
            if (!path.length) {
              finished = true;
              return;
            }

            // step into child
            obj = child;

            // but we're done here
            return;
          }
        }
      }

      key = undefined;
      // if we found no matching properties
      // on the current object, there's no match.
      finished = true;
    }

    if (!key) return;
    if (null == obj) return obj;

    // the `obj` and `key` is one above the leaf object and key, so
    // start object: { a: { 'b.c': 10 } }
    // end object: { 'b.c': 10 }
    // end key: 'b.c'
    // this way, you can do `obj[key]` and get `10`.
    return fn(obj, key, val);
  };
}


/**
 * Find an object by its key
 *
 * find({ first_name : 'Calvin' }, 'firstName')
 */

function find (obj, key) {
  if (obj.hasOwnProperty(key)) return obj[key];
}


/**
 * Delete a value for a given key
 *
 * del({ a : 'b', x : 'y' }, 'X' }) -> { a : 'b' }
 */

function del (obj, key) {
  if (obj.hasOwnProperty(key)) delete obj[key];
  return obj;
}


/**
 * Replace an objects existing value with a new one
 *
 * replace({ a : 'b' }, 'a', 'c') -> { a : 'c' }
 */

function replace (obj, key, val) {
  if (obj.hasOwnProperty(key)) obj[key] = val;
  return obj;
}

/**
 * Normalize a `dot.separated.path`.
 *
 * A.HELL(!*&#(!)O_WOR   LD.bar => ahelloworldbar
 *
 * @param {String} path
 * @return {String}
 */

function defaultNormalize(path) {
  return path.replace(/[^a-zA-Z0-9\.]+/g, '').toLowerCase();
}

/**
 * Check if a value is a function.
 *
 * @param {*} val
 * @return {boolean} Returns `true` if `val` is a function, otherwise `false`.
 */

function isFunction(val) {
  return typeof val === 'function';
}

}, {}],
46: [function(require, module, exports) {

var is = require('is');
var isodate = require('isodate');
var milliseconds = require('./milliseconds');
var seconds = require('./seconds');


/**
 * Returns a new Javascript Date object, allowing a variety of extra input types
 * over the native Date constructor.
 *
 * @param {Date|String|Number} val
 */

module.exports = function newDate (val) {
  if (is.date(val)) return val;
  if (is.number(val)) return new Date(toMs(val));

  // date strings
  if (isodate.is(val)) return isodate.parse(val);
  if (milliseconds.is(val)) return milliseconds.parse(val);
  if (seconds.is(val)) return seconds.parse(val);

  // fallback to Date.parse
  return new Date(val);
};


/**
 * If the number passed val is seconds from the epoch, turn it into milliseconds.
 * Milliseconds would be greater than 31557600000 (December 31, 1970).
 *
 * @param {Number} num
 */

function toMs (num) {
  if (num < 31557600000) return num * 1000;
  return num;
}
}, {"is":53,"isodate":48,"./milliseconds":54,"./seconds":55}],
53: [function(require, module, exports) {

var isEmpty = require('is-empty')
  , typeOf = require('type');


/**
 * Types.
 */

var types = [
  'arguments',
  'array',
  'boolean',
  'date',
  'element',
  'function',
  'null',
  'number',
  'object',
  'regexp',
  'string',
  'undefined'
];


/**
 * Expose type checkers.
 *
 * @param {Mixed} value
 * @return {Boolean}
 */

for (var i = 0, type; type = types[i]; i++) exports[type] = generate(type);


/**
 * Add alias for `function` for old browsers.
 */

exports.fn = exports['function'];


/**
 * Expose `empty` check.
 */

exports.empty = isEmpty;


/**
 * Expose `nan` check.
 */

exports.nan = function (val) {
  return exports.number(val) && val != val;
};


/**
 * Generate a type checker.
 *
 * @param {String} type
 * @return {Function}
 */

function generate (type) {
  return function (value) {
    return type === typeOf(value);
  };
}
}, {"is-empty":49,"type":50}],
54: [function(require, module, exports) {

/**
 * Matcher.
 */

var matcher = /\d{13}/;


/**
 * Check whether a string is a millisecond date string.
 *
 * @param {String} string
 * @return {Boolean}
 */

exports.is = function (string) {
  return matcher.test(string);
};


/**
 * Convert a millisecond string to a date.
 *
 * @param {String} millis
 * @return {Date}
 */

exports.parse = function (millis) {
  millis = parseInt(millis, 10);
  return new Date(millis);
};
}, {}],
55: [function(require, module, exports) {

/**
 * Matcher.
 */

var matcher = /\d{10}/;


/**
 * Check whether a string is a second date string.
 *
 * @param {String} string
 * @return {Boolean}
 */

exports.is = function (string) {
  return matcher.test(string);
};


/**
 * Convert a second string to a date.
 *
 * @param {String} seconds
 * @return {Date}
 */

exports.parse = function (seconds) {
  var millis = parseInt(seconds, 10) * 1000;
  return new Date(millis);
};
}, {}],
35: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var inherit = require('./utils').inherit;
var Facade = require('./facade');

/**
 * Expose `Alias` facade.
 */

module.exports = Alias;

/**
 * Initialize a new `Alias` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary
 *   @property {String} from
 *   @property {String} to
 *   @property {Object} options
 */

function Alias (dictionary) {
  Facade.call(this, dictionary);
}

/**
 * Inherit from `Facade`.
 */

inherit(Alias, Facade);

/**
 * Return type of facade.
 *
 * @return {String}
 */

Alias.prototype.type =
Alias.prototype.action = function () {
  return 'alias';
};

/**
 * Get `previousId`.
 *
 * @return {Mixed}
 * @api public
 */

Alias.prototype.from =
Alias.prototype.previousId = function(){
  return this.field('previousId')
    || this.field('from');
};

/**
 * Get `userId`.
 *
 * @return {String}
 * @api public
 */

Alias.prototype.to =
Alias.prototype.userId = function(){
  return this.field('userId')
    || this.field('to');
};

}, {"./utils":43,"./facade":34}],
36: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var inherit = require('./utils').inherit;
var address = require('./address');
var isEmail = require('is-email');
var newDate = require('new-date');
var Facade = require('./facade');

/**
 * Expose `Group` facade.
 */

module.exports = Group;

/**
 * Initialize a new `Group` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary
 *   @param {String} userId
 *   @param {String} groupId
 *   @param {Object} properties
 *   @param {Object} options
 */

function Group (dictionary) {
  Facade.call(this, dictionary);
}

/**
 * Inherit from `Facade`
 */

inherit(Group, Facade);

/**
 * Get the facade's action.
 */

Group.prototype.type =
Group.prototype.action = function () {
  return 'group';
};

/**
 * Setup some basic proxies.
 */

Group.prototype.groupId = Facade.field('groupId');

/**
 * Get created or createdAt.
 *
 * @return {Date}
 */

Group.prototype.created = function(){
  var created = this.proxy('traits.createdAt')
    || this.proxy('traits.created')
    || this.proxy('properties.createdAt')
    || this.proxy('properties.created');

  if (created) return newDate(created);
};

/**
 * Get the group's email, falling back to the group ID if it's a valid email.
 *
 * @return {String}
 */

Group.prototype.email = function () {
  var email = this.proxy('traits.email');
  if (email) return email;
  var groupId = this.groupId();
  if (isEmail(groupId)) return groupId;
};

/**
 * Get the group's traits.
 *
 * @param {Object} aliases
 * @return {Object}
 */

Group.prototype.traits = function (aliases) {
  var ret = this.properties();
  var id = this.groupId();
  aliases = aliases || {};

  if (id) ret.id = id;

  for (var alias in aliases) {
    var value = null == this[alias]
      ? this.proxy('traits.' + alias)
      : this[alias]();
    if (null == value) continue;
    ret[aliases[alias]] = value;
    delete ret[alias];
  }

  return ret;
};

/**
 * Special traits.
 */

Group.prototype.name = Facade.proxy('traits.name');
Group.prototype.industry = Facade.proxy('traits.industry');
Group.prototype.employees = Facade.proxy('traits.employees');

/**
 * Get traits or properties.
 *
 * TODO: remove me
 *
 * @return {Object}
 */

Group.prototype.properties = function(){
  return this.field('traits')
    || this.field('properties')
    || {};
};

}, {"./utils":43,"./address":44,"is-email":56,"new-date":46,"./facade":34}],
56: [function(require, module, exports) {

/**
 * Expose `isEmail`.
 */

module.exports = isEmail;


/**
 * Email address matcher.
 */

var matcher = /.+\@.+\..+/;


/**
 * Loosely validate an email address.
 *
 * @param {String} string
 * @return {Boolean}
 */

function isEmail (string) {
  return matcher.test(string);
}
}, {}],
37: [function(require, module, exports) {

var address = require('./address');
var Facade = require('./facade');
var isEmail = require('is-email');
var newDate = require('new-date');
var utils = require('./utils');
var get = require('obj-case');
var trim = require('trim');
var inherit = utils.inherit;
var clone = utils.clone;
var type = utils.type;

/**
 * Expose `Idenfity` facade.
 */

module.exports = Identify;

/**
 * Initialize a new `Identify` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary
 *   @param {String} userId
 *   @param {String} sessionId
 *   @param {Object} traits
 *   @param {Object} options
 */

function Identify (dictionary) {
  Facade.call(this, dictionary);
}

/**
 * Inherit from `Facade`.
 */

inherit(Identify, Facade);

/**
 * Get the facade's action.
 */

Identify.prototype.type =
Identify.prototype.action = function () {
  return 'identify';
};

/**
 * Get the user's traits.
 *
 * @param {Object} aliases
 * @return {Object}
 */

Identify.prototype.traits = function (aliases) {
  var ret = this.field('traits') || {};
  var id = this.userId();
  aliases = aliases || {};

  if (id) ret.id = id;

  for (var alias in aliases) {
    var value = null == this[alias]
      ? this.proxy('traits.' + alias)
      : this[alias]();
    if (null == value) continue;
    ret[aliases[alias]] = value;
    if (alias !== aliases[alias]) delete ret[alias];
  }

  return ret;
};

/**
 * Get the user's email, falling back to their user ID if it's a valid email.
 *
 * @return {String}
 */

Identify.prototype.email = function () {
  var email = this.proxy('traits.email');
  if (email) return email;

  var userId = this.userId();
  if (isEmail(userId)) return userId;
};

/**
 * Get the user's created date, optionally looking for `createdAt` since lots of
 * people do that instead.
 *
 * @return {Date or Undefined}
 */

Identify.prototype.created = function () {
  var created = this.proxy('traits.created') || this.proxy('traits.createdAt');
  if (created) return newDate(created);
};

/**
 * Get the company created date.
 *
 * @return {Date or undefined}
 */

Identify.prototype.companyCreated = function(){
  var created = this.proxy('traits.company.created')
    || this.proxy('traits.company.createdAt');

  if (created) return newDate(created);
};

/**
 * Get the user's name, optionally combining a first and last name if that's all
 * that was provided.
 *
 * @return {String or Undefined}
 */

Identify.prototype.name = function () {
  var name = this.proxy('traits.name');
  if (typeof name === 'string') return trim(name);

  var firstName = this.firstName();
  var lastName = this.lastName();
  if (firstName && lastName) return trim(firstName + ' ' + lastName);
};

/**
 * Get the user's first name, optionally splitting it out of a single name if
 * that's all that was provided.
 *
 * @return {String or Undefined}
 */

Identify.prototype.firstName = function () {
  var firstName = this.proxy('traits.firstName');
  if (typeof firstName === 'string') return trim(firstName);

  var name = this.proxy('traits.name');
  if (typeof name === 'string') return trim(name).split(' ')[0];
};

/**
 * Get the user's last name, optionally splitting it out of a single name if
 * that's all that was provided.
 *
 * @return {String or Undefined}
 */

Identify.prototype.lastName = function () {
  var lastName = this.proxy('traits.lastName');
  if (typeof lastName === 'string') return trim(lastName);

  var name = this.proxy('traits.name');
  if (typeof name !== 'string') return;

  var space = trim(name).indexOf(' ');
  if (space === -1) return;

  return trim(name.substr(space + 1));
};

/**
 * Get the user's unique id.
 *
 * @return {String or undefined}
 */

Identify.prototype.uid = function(){
  return this.userId()
    || this.username()
    || this.email();
};

/**
 * Get description.
 *
 * @return {String}
 */

Identify.prototype.description = function(){
  return this.proxy('traits.description')
    || this.proxy('traits.background');
};

/**
 * Get the age.
 *
 * If the age is not explicitly set
 * the method will compute it from `.birthday()`
 * if possible.
 *
 * @return {Number}
 */

Identify.prototype.age = function(){
  var date = this.birthday();
  var age = get(this.traits(), 'age');
  if (null != age) return age;
  if ('date' != type(date)) return;
  var now = new Date;
  return now.getFullYear() - date.getFullYear();
};

/**
 * Get the avatar.
 *
 * .photoUrl needed because help-scout
 * implementation uses `.avatar || .photoUrl`.
 *
 * .avatarUrl needed because trakio uses it.
 *
 * @return {Mixed}
 */

Identify.prototype.avatar = function(){
  var traits = this.traits();
  return get(traits, 'avatar')
    || get(traits, 'photoUrl')
    || get(traits, 'avatarUrl');
};

/**
 * Get the position.
 *
 * .jobTitle needed because some integrations use it.
 *
 * @return {Mixed}
 */

Identify.prototype.position = function(){
  var traits = this.traits();
  return get(traits, 'position') || get(traits, 'jobTitle');
};

/**
 * Setup sme basic "special" trait proxies.
 */

Identify.prototype.username = Facade.proxy('traits.username');
Identify.prototype.website = Facade.one('traits.website');
Identify.prototype.websites = Facade.multi('traits.website');
Identify.prototype.phone = Facade.one('traits.phone');
Identify.prototype.phones = Facade.multi('traits.phone');
Identify.prototype.address = Facade.proxy('traits.address');
Identify.prototype.gender = Facade.proxy('traits.gender');
Identify.prototype.birthday = Facade.proxy('traits.birthday');

}, {"./address":44,"./facade":34,"is-email":56,"new-date":46,"./utils":43,"obj-case":45,"trim":57}],
57: [function(require, module, exports) {

exports = module.exports = trim;

function trim(str){
  if (str.trim) return str.trim();
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  if (str.trimLeft) return str.trimLeft();
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  if (str.trimRight) return str.trimRight();
  return str.replace(/\s*$/, '');
};

}, {}],
38: [function(require, module, exports) {

var inherit = require('./utils').inherit;
var clone = require('./utils').clone;
var type = require('./utils').type;
var Facade = require('./facade');
var Identify = require('./identify');
var isEmail = require('is-email');
var get = require('obj-case');

/**
 * Expose `Track` facade.
 */

module.exports = Track;

/**
 * Initialize a new `Track` facade with a `dictionary` of arguments.
 *
 * @param {object} dictionary
 *   @property {String} event
 *   @property {String} userId
 *   @property {String} sessionId
 *   @property {Object} properties
 *   @property {Object} options
 */

function Track (dictionary) {
  Facade.call(this, dictionary);
}

/**
 * Inherit from `Facade`.
 */

inherit(Track, Facade);

/**
 * Return the facade's action.
 *
 * @return {String}
 */

Track.prototype.type =
Track.prototype.action = function () {
  return 'track';
};

/**
 * Setup some basic proxies.
 */

Track.prototype.event = Facade.field('event');
Track.prototype.value = Facade.proxy('properties.value');

/**
 * Misc
 */

Track.prototype.category = Facade.proxy('properties.category');

/**
 * Ecommerce
 */

Track.prototype.id = Facade.proxy('properties.id');
Track.prototype.sku = Facade.proxy('properties.sku');
Track.prototype.tax = Facade.proxy('properties.tax');
Track.prototype.name = Facade.proxy('properties.name');
Track.prototype.price = Facade.proxy('properties.price');
Track.prototype.total = Facade.proxy('properties.total');
Track.prototype.coupon = Facade.proxy('properties.coupon');
Track.prototype.shipping = Facade.proxy('properties.shipping');
Track.prototype.discount = Facade.proxy('properties.discount');

/**
 * Description
 */

Track.prototype.description = Facade.proxy('properties.description');

/**
 * Plan
 */

Track.prototype.plan = Facade.proxy('properties.plan');

/**
 * Order id.
 *
 * @return {String}
 * @api public
 */

Track.prototype.orderId = function(){
  return this.proxy('properties.id')
    || this.proxy('properties.orderId');
};

/**
 * Get subtotal.
 *
 * @return {Number}
 */

Track.prototype.subtotal = function(){
  var subtotal = get(this.properties(), 'subtotal');
  var total = this.total();
  var n;

  if (subtotal) return subtotal;
  if (!total) return 0;
  if (n = this.tax()) total -= n;
  if (n = this.shipping()) total -= n;
  if (n = this.discount()) total += n;

  return total;
};

/**
 * Get products.
 *
 * @return {Array}
 */

Track.prototype.products = function(){
  var props = this.properties();
  var products = get(props, 'products');
  return 'array' == type(products)
    ? products
    : [];
};

/**
 * Get quantity.
 *
 * @return {Number}
 */

Track.prototype.quantity = function(){
  var props = this.obj.properties || {};
  return props.quantity || 1;
};

/**
 * Get currency.
 *
 * @return {String}
 */

Track.prototype.currency = function(){
  var props = this.obj.properties || {};
  return props.currency || 'USD';
};

/**
 * BACKWARDS COMPATIBILITY: should probably re-examine where these come from.
 */

Track.prototype.referrer = Facade.proxy('properties.referrer');
Track.prototype.query = Facade.proxy('options.query');

/**
 * Get the call's properties.
 *
 * @param {Object} aliases
 * @return {Object}
 */

Track.prototype.properties = function (aliases) {
  var ret = this.field('properties') || {};
  aliases = aliases || {};

  for (var alias in aliases) {
    var value = null == this[alias]
      ? this.proxy('properties.' + alias)
      : this[alias]();
    if (null == value) continue;
    ret[aliases[alias]] = value;
    delete ret[alias];
  }

  return ret;
};

/**
 * Get the call's username.
 *
 * @return {String or Undefined}
 */

Track.prototype.username = function () {
  return this.proxy('traits.username') ||
         this.proxy('properties.username') ||
         this.userId() ||
         this.sessionId();
};

/**
 * Get the call's email, using an the user ID if it's a valid email.
 *
 * @return {String or Undefined}
 */

Track.prototype.email = function () {
  var email = this.proxy('traits.email');
  email = email || this.proxy('properties.email');
  if (email) return email;

  var userId = this.userId();
  if (isEmail(userId)) return userId;
};

/**
 * Get the call's revenue, parsing it from a string with an optional leading
 * dollar sign.
 *
 * For products/services that don't have shipping and are not directly taxed,
 * they only care about tracking `revenue`. These are things like
 * SaaS companies, who sell monthly subscriptions. The subscriptions aren't
 * taxed directly, and since it's a digital product, it has no shipping.
 *
 * The only case where there's a difference between `revenue` and `total`
 * (in the context of analytics) is on ecommerce platforms, where they want
 * the `revenue` function to actually return the `total` (which includes
 * tax and shipping, total = subtotal + tax + shipping). This is probably
 * because on their backend they assume tax and shipping has been applied to
 * the value, and so can get the revenue on their own.
 *
 * @return {Number}
 */

Track.prototype.revenue = function () {
  var revenue = this.proxy('properties.revenue');
  var event = this.event();

  // it's always revenue, unless it's called during an order completion.
  if (!revenue && event && event.match(/completed ?order/i)) {
    revenue = this.proxy('properties.total');
  }

  return currency(revenue);
};

/**
 * Get cents.
 *
 * @return {Number}
 */

Track.prototype.cents = function(){
  var revenue = this.revenue();
  return 'number' != typeof revenue
    ? this.value() || 0
    : revenue * 100;
};

/**
 * A utility to turn the pieces of a track call into an identify. Used for
 * integrations with super properties or rate limits.
 *
 * TODO: remove me.
 *
 * @return {Facade}
 */

Track.prototype.identify = function () {
  var json = this.json();
  json.traits = this.traits();
  return new Identify(json);
};

/**
 * Get float from currency value.
 *
 * @param {Mixed} val
 * @return {Number}
 */

function currency(val) {
  if (!val) return;
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return;

  val = val.replace(/\$/g, '');
  val = parseFloat(val);

  if (!isNaN(val)) return val;
}

}, {"./utils":43,"./facade":34,"./identify":37,"is-email":56,"obj-case":45}],
39: [function(require, module, exports) {

var inherit = require('./utils').inherit;
var Facade = require('./facade');
var Track = require('./track');

/**
 * Expose `Page` facade
 */

module.exports = Page;

/**
 * Initialize new `Page` facade with `dictionary`.
 *
 * @param {Object} dictionary
 *   @param {String} category
 *   @param {String} name
 *   @param {Object} traits
 *   @param {Object} options
 */

function Page(dictionary){
  Facade.call(this, dictionary);
}

/**
 * Inherit from `Facade`
 */

inherit(Page, Facade);

/**
 * Get the facade's action.
 *
 * @return {String}
 */

Page.prototype.type =
Page.prototype.action = function(){
  return 'page';
};

/**
 * Fields
 */

Page.prototype.category = Facade.field('category');
Page.prototype.name = Facade.field('name');

/**
 * Proxies.
 */

Page.prototype.title = Facade.proxy('properties.title');
Page.prototype.path = Facade.proxy('properties.path');
Page.prototype.url = Facade.proxy('properties.url');

/**
 * Referrer.
 */

Page.prototype.referrer = function(){
  return this.proxy('properties.referrer')
    || this.proxy('context.referrer.url');
};

/**
 * Get the page properties mixing `category` and `name`.
 *
 * @param {Object} aliases
 * @return {Object}
 */

Page.prototype.properties = function(aliases) {
  var props = this.field('properties') || {};
  var category = this.category();
  var name = this.name();
  aliases = aliases || {};

  if (category) props.category = category;
  if (name) props.name = name;

  for (var alias in aliases) {
    var value = null == this[alias]
      ? this.proxy('properties.' + alias)
      : this[alias]();
    if (null == value) continue;
    props[aliases[alias]] = value;
    if (alias !== aliases[alias]) delete props[alias];
  }

  return props;
};

/**
 * Get the page fullName.
 *
 * @return {String}
 */

Page.prototype.fullName = function(){
  var category = this.category();
  var name = this.name();
  return name && category
    ? category + ' ' + name
    : name;
};

/**
 * Get event with `name`.
 *
 * @return {String}
 */

Page.prototype.event = function(name){
  return name
    ? 'Viewed ' + name + ' Page'
    : 'Loaded a Page';
};

/**
 * Convert this Page to a Track facade with `name`.
 *
 * @param {String} name
 * @return {Track}
 */

Page.prototype.track = function(name){
  var props = this.properties();
  return new Track({
    event: this.event(name),
    timestamp: this.timestamp(),
    context: this.context(),
    properties: props
  });
};

}, {"./utils":43,"./facade":34,"./track":38}],
40: [function(require, module, exports) {

var inherit = require('./utils').inherit;
var Page = require('./page');
var Track = require('./track');

/**
 * Expose `Screen` facade
 */

module.exports = Screen;

/**
 * Initialize new `Screen` facade with `dictionary`.
 *
 * @param {Object} dictionary
 *   @param {String} category
 *   @param {String} name
 *   @param {Object} traits
 *   @param {Object} options
 */

function Screen(dictionary){
  Page.call(this, dictionary);
}

/**
 * Inherit from `Page`
 */

inherit(Screen, Page);

/**
 * Get the facade's action.
 *
 * @return {String}
 * @api public
 */

Screen.prototype.type =
Screen.prototype.action = function(){
  return 'screen';
};

/**
 * Get event with `name`.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */

Screen.prototype.event = function(name){
  return name
    ? 'Viewed ' + name + ' Screen'
    : 'Loaded a Screen';
};

/**
 * Convert this Screen.
 *
 * @param {String} name
 * @return {Track}
 * @api public
 */

Screen.prototype.track = function(name){
  var props = this.properties();
  return new Track({
    event: this.event(name),
    timestamp: this.timestamp(),
    context: this.context(),
    properties: props
  });
};

}, {"./utils":43,"./page":39,"./track":38}],
11: [function(require, module, exports) {

module.exports = function after (times, func) {
  // After 0, really?
  if (times <= 0) return func();

  // That's more like it.
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
};
}, {}],
12: [function(require, module, exports) {

try {
  var bind = require('bind');
} catch (e) {
  var bind = require('bind-component');
}

var bindAll = require('bind-all');


/**
 * Expose `bind`.
 */

module.exports = exports = bind;


/**
 * Expose `bindAll`.
 */

exports.all = bindAll;


/**
 * Expose `bindMethods`.
 */

exports.methods = bindMethods;


/**
 * Bind `methods` on `obj` to always be called with the `obj` as context.
 *
 * @param {Object} obj
 * @param {String} methods...
 */

function bindMethods (obj, methods) {
  methods = [].slice.call(arguments, 1);
  for (var i = 0, method; method = methods[i]; i++) {
    obj[method] = bind(obj, obj[method]);
  }
  return obj;
}
}, {"bind":58,"bind-all":59}],
58: [function(require, module, exports) {
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

}, {}],
59: [function(require, module, exports) {

try {
  var bind = require('bind');
  var type = require('type');
} catch (e) {
  var bind = require('bind-component');
  var type = require('type-component');
}

module.exports = function (obj) {
  for (var key in obj) {
    var val = obj[key];
    if (type(val) === 'function') obj[key] = bind(obj, obj[key]);
  }
  return obj;
};
}, {"bind":58,"type":50}],
13: [function(require, module, exports) {
var next = require('next-tick');


/**
 * Expose `callback`.
 */

module.exports = callback;


/**
 * Call an `fn` back synchronously if it exists.
 *
 * @param {Function} fn
 */

function callback (fn) {
  if ('function' === typeof fn) fn();
}


/**
 * Call an `fn` back asynchronously if it exists. If `wait` is ommitted, the
 * `fn` will be called on next tick.
 *
 * @param {Function} fn
 * @param {Number} wait (optional)
 */

callback.async = function (fn, wait) {
  if ('function' !== typeof fn) return;
  if (!wait) return next(fn);
  setTimeout(fn, wait);
};


/**
 * Symmetry.
 */

callback.sync = callback;

}, {"next-tick":60}],
60: [function(require, module, exports) {
"use strict"

if (typeof setImmediate == 'function') {
  module.exports = function(f){ setImmediate(f) }
}
// legacy node.js
else if (typeof process != 'undefined' && typeof process.nextTick == 'function') {
  module.exports = process.nextTick
}
// fallback for other environments / postMessage behaves badly on IE8
else if (typeof window == 'undefined' || window.ActiveXObject || !window.postMessage) {
  module.exports = function(f){ setTimeout(f) };
} else {
  var q = [];

  window.addEventListener('message', function(){
    var i = 0;
    while (i < q.length) {
      try { q[i++](); }
      catch (e) {
        q = q.slice(i);
        window.postMessage('tic!', '*');
        throw e;
      }
    }
    q.length = 0;
  }, true);

  module.exports = function(fn){
    if (!q.length) window.postMessage('tic!', '*');
    q.push(fn);
  }
}

}, {}],
14: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var type;

try {
  type = require('type');
} catch(e){
  type = require('type-component');
}

/**
 * Module exports.
 */

module.exports = clone;

/**
 * Clones objects.
 *
 * @param {Mixed} any object
 * @api public
 */

function clone(obj){
  switch (type(obj)) {
    case 'object':
      var copy = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = clone(obj[key]);
        }
      }
      return copy;

    case 'array':
      var copy = new Array(obj.length);
      for (var i = 0, l = obj.length; i < l; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;

    case 'regexp':
      // from millermedeiros/amd-utils - MIT
      var flags = '';
      flags += obj.multiline ? 'm' : '';
      flags += obj.global ? 'g' : '';
      flags += obj.ignoreCase ? 'i' : '';
      return new RegExp(obj.source, flags);

    case 'date':
      return new Date(obj.getTime());

    default: // string, number, boolean, …
      return obj;
  }
}

}, {"type":50}],
15: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var bind = require('bind');
var clone = require('clone');
var cookie = require('cookie');
var debug = require('debug')('analytics.js:cookie');
var defaults = require('defaults');
var json = require('json');
var topDomain = require('top-domain');


/**
 * Initialize a new `Cookie` with `options`.
 *
 * @param {Object} options
 */

function Cookie(options) {
  this.options(options);
}


/**
 * Get or set the cookie options.
 *
 * @param {Object} options
 *   @field {Number} maxage (1 year)
 *   @field {String} domain
 *   @field {String} path
 *   @field {Boolean} secure
 */

Cookie.prototype.options = function(options) {
  if (arguments.length === 0) return this._options;

  options = options || {};

  var domain = '.' + topDomain(window.location.href);
  if (domain === '.') domain = null;

  this._options = defaults(options, {
    // default to a year
    maxage: 31536000000,
    path: '/',
    domain: domain
  });

  // http://curl.haxx.se/rfc/cookie_spec.html
  // https://publicsuffix.org/list/effective_tld_names.dat
  //
  // try setting a dummy cookie with the options
  // if the cookie isn't set, it probably means
  // that the domain is on the public suffix list
  // like myapp.herokuapp.com or localhost / ip.
  this.set('ajs:test', true);
  if (!this.get('ajs:test')) {
    debug('fallback to domain=null');
    this._options.domain = null;
  }
  this.remove('ajs:test');
};


/**
 * Set a `key` and `value` in our cookie.
 *
 * @param {String} key
 * @param {Object} value
 * @return {Boolean} saved
 */

Cookie.prototype.set = function(key, value) {
  try {
    value = json.stringify(value);
    cookie(key, value, clone(this._options));
    return true;
  } catch (e) {
    return false;
  }
};


/**
 * Get a value from our cookie by `key`.
 *
 * @param {String} key
 * @return {Object} value
 */

Cookie.prototype.get = function(key) {
  try {
    var value = cookie(key);
    value = value ? json.parse(value) : null;
    return value;
  } catch (e) {
    return null;
  }
};


/**
 * Remove a value from our cookie by `key`.
 *
 * @param {String} key
 * @return {Boolean} removed
 */

Cookie.prototype.remove = function(key) {
  try {
    cookie(key, null, clone(this._options));
    return true;
  } catch (e) {
    return false;
  }
};


/**
 * Expose the cookie singleton.
 */

module.exports = bind.all(new Cookie());


/**
 * Expose the `Cookie` constructor.
 */

module.exports.Cookie = Cookie;

}, {"bind":12,"clone":14,"cookie":61,"debug":16,"defaults":17,"json":62,"top-domain":63}],
61: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var debug = require('debug')('cookie');

/**
 * Set or get cookie `name` with `value` and `options` object.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Mixed}
 * @api public
 */

module.exports = function(name, value, options){
  switch (arguments.length) {
    case 3:
    case 2:
      return set(name, value, options);
    case 1:
      return get(name);
    default:
      return all();
  }
};

/**
 * Set cookie `name` to `value`.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @api private
 */

function set(name, value, options) {
  options = options || {};
  var str = encode(name) + '=' + encode(value);

  if (null == value) options.maxage = -1;

  if (options.maxage) {
    options.expires = new Date(+new Date + options.maxage);
  }

  if (options.path) str += '; path=' + options.path;
  if (options.domain) str += '; domain=' + options.domain;
  if (options.expires) str += '; expires=' + options.expires.toUTCString();
  if (options.secure) str += '; secure';

  document.cookie = str;
}

/**
 * Return all cookies.
 *
 * @return {Object}
 * @api private
 */

function all() {
  return parse(document.cookie);
}

/**
 * Get cookie `name`.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function get(name) {
  return all()[name];
}

/**
 * Parse cookie `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parse(str) {
  var obj = {};
  var pairs = str.split(/ *; */);
  var pair;
  if ('' == pairs[0]) return obj;
  for (var i = 0; i < pairs.length; ++i) {
    pair = pairs[i].split('=');
    obj[decode(pair[0])] = decode(pair[1]);
  }
  return obj;
}

/**
 * Encode.
 */

function encode(value){
  try {
    return encodeURIComponent(value);
  } catch (e) {
    debug('error `encode(%o)` - %o', value, e)
  }
}

/**
 * Decode.
 */

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    debug('error `decode(%o)` - %o', value, e)
  }
}

}, {"debug":16}],
16: [function(require, module, exports) {
if ('undefined' == typeof window) {
  module.exports = require('./lib/debug');
} else {
  module.exports = require('./debug');
}

}, {"./lib/debug":64,"./debug":65}],
64: [function(require, module, exports) {
/**
 * Module dependencies.
 */

var tty = require('tty');

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Enabled debuggers.
 */

var names = []
  , skips = [];

(process.env.DEBUG || '')
  .split(/[\s,]+/)
  .forEach(function(name){
    name = name.replace('*', '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    } else {
      names.push(new RegExp('^' + name + '$'));
    }
  });

/**
 * Colors.
 */

var colors = [6, 2, 3, 4, 5, 1];

/**
 * Previous debug() call.
 */

var prev = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Is stdout a TTY? Colored output is disabled when `true`.
 */

var isatty = tty.isatty(2);

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function color() {
  return colors[prevColor++ % colors.length];
}

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

function humanize(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
}

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  function disabled(){}
  disabled.enabled = false;

  var match = skips.some(function(re){
    return re.test(name);
  });

  if (match) return disabled;

  match = names.some(function(re){
    return re.test(name);
  });

  if (!match) return disabled;
  var c = color();

  function colored(fmt) {
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (prev[name] || curr);
    prev[name] = curr;

    fmt = '  \u001b[9' + c + 'm' + name + ' '
      + '\u001b[3' + c + 'm\u001b[90m'
      + fmt + '\u001b[3' + c + 'm'
      + ' +' + humanize(ms) + '\u001b[0m';

    console.error.apply(this, arguments);
  }

  function plain(fmt) {
    fmt = coerce(fmt);

    fmt = new Date().toUTCString()
      + ' ' + name + ' ' + fmt;
    console.error.apply(this, arguments);
  }

  colored.enabled = plain.enabled = true;

  return isatty || process.env.DEBUG_COLORS
    ? colored
    : plain;
}

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

}, {}],
65: [function(require, module, exports) {

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

}, {}],
17: [function(require, module, exports) {
'use strict';

/**
 * Merge default values.
 *
 * @param {Object} dest
 * @param {Object} defaults
 * @return {Object}
 * @api public
 */
var defaults = function (dest, src, recursive) {
  for (var prop in src) {
    if (recursive && dest[prop] instanceof Object && src[prop] instanceof Object) {
      dest[prop] = defaults(dest[prop], src[prop], true);
    } else if (! (prop in dest)) {
      dest[prop] = src[prop];
    }
  }

  return dest;
};

/**
 * Expose `defaults`.
 */
module.exports = defaults;

}, {}],
62: [function(require, module, exports) {

var json = window.JSON || {};
var stringify = json.stringify;
var parse = json.parse;

module.exports = parse && stringify
  ? JSON
  : require('json-fallback');

}, {"json-fallback":66}],
66: [function(require, module, exports) {
/*
    json2.js
    2014-02-04

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

(function () {
    'use strict';

    var JSON = module.exports = {};

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx,
        escapable,
        gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

}, {}],
63: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var parse = require('url').parse;
var cookie = require('cookie');

/**
 * Expose `domain`
 */

exports = module.exports = domain;

/**
 * Expose `cookie` for testing.
 */

exports.cookie = cookie;

/**
 * Get the top domain.
 *
 * The function constructs the levels of domain
 * and attempts to set a global cookie on each one
 * when it succeeds it returns the top level domain.
 *
 * The method returns an empty string when the hostname
 * is an ip or `localhost`.
 *
 * Example levels:
 *
 *      domain.levels('http://www.google.co.uk');
 *      // => ["co.uk", "google.co.uk", "www.google.co.uk"]
 * 
 * Example:
 * 
 *      domain('http://localhost:3000/baz');
 *      // => ''
 *      domain('http://dev:3000/baz');
 *      // => ''
 *      domain('http://127.0.0.1:3000/baz');
 *      // => ''
 *      domain('http://segment.io/baz');
 *      // => 'segment.io'
 * 
 * @param {String} url
 * @return {String}
 * @api public
 */

function domain(url){
  var cookie = exports.cookie;
  var levels = exports.levels(url);

  // Lookup the real top level one.
  for (var i = 0; i < levels.length; ++i) {
    var cname = '__tld__';
    var domain = levels[i];
    var opts = { domain: '.' + domain };

    cookie(cname, 1, opts);
    if (cookie(cname)) {
      cookie(cname, null, opts);
      return domain
    }
  }

  return '';
};

/**
 * Levels returns all levels of the given url.
 *
 * @param {String} url
 * @return {Array}
 * @api public
 */

domain.levels = function(url){
  var host = parse(url).hostname;
  var parts = host.split('.');
  var last = parts[parts.length-1];
  var levels = [];

  // Ip address.
  if (4 == parts.length && parseInt(last, 10) == last) {
    return levels;
  }

  // Localhost.
  if (1 >= parts.length) {
    return levels;
  }

  // Create levels.
  for (var i = parts.length-2; 0 <= i; --i) {
    levels.push(parts.slice(i).join('.'));
  }

  return levels;
};

}, {"url":67,"cookie":68}],
67: [function(require, module, exports) {

/**
 * Parse the given `url`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(url){
  var a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: ('0' === a.port || '' === a.port) ? port(a.protocol) : a.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1)
  };
};

/**
 * Check if `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(url){
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
};

/**
 * Check if `url` is relative.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isRelative = function(url){
  return !exports.isAbsolute(url);
};

/**
 * Check if `url` is cross domain.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isCrossDomain = function(url){
  url = exports.parse(url);
  var location = exports.parse(window.location.href);
  return url.hostname !== location.hostname
    || url.port !== location.port
    || url.protocol !== location.protocol;
};

/**
 * Return default port for `protocol`.
 *
 * @param  {String} protocol
 * @return {String}
 * @api private
 */
function port (protocol){
  switch (protocol) {
    case 'http:':
      return 80;
    case 'https:':
      return 443;
    default:
      return location.port;
  }
}

}, {}],
68: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var debug = require('debug')('cookie');

/**
 * Set or get cookie `name` with `value` and `options` object.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Mixed}
 * @api public
 */

module.exports = function(name, value, options){
  switch (arguments.length) {
    case 3:
    case 2:
      return set(name, value, options);
    case 1:
      return get(name);
    default:
      return all();
  }
};

/**
 * Set cookie `name` to `value`.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @api private
 */

function set(name, value, options) {
  options = options || {};
  var str = encode(name) + '=' + encode(value);

  if (null == value) options.maxage = -1;

  if (options.maxage) {
    options.expires = new Date(+new Date + options.maxage);
  }

  if (options.path) str += '; path=' + options.path;
  if (options.domain) str += '; domain=' + options.domain;
  if (options.expires) str += '; expires=' + options.expires.toUTCString();
  if (options.secure) str += '; secure';

  document.cookie = str;
}

/**
 * Return all cookies.
 *
 * @return {Object}
 * @api private
 */

function all() {
  var str;
  try {
    str = document.cookie;
  } catch (err) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(err.stack || err);
    }
    return {};
  }
  return parse(str);
}

/**
 * Get cookie `name`.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function get(name) {
  return all()[name];
}

/**
 * Parse cookie `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parse(str) {
  var obj = {};
  var pairs = str.split(/ *; */);
  var pair;
  if ('' == pairs[0]) return obj;
  for (var i = 0; i < pairs.length; ++i) {
    pair = pairs[i].split('=');
    obj[decode(pair[0])] = decode(pair[1]);
  }
  return obj;
}

/**
 * Encode.
 */

function encode(value){
  try {
    return encodeURIComponent(value);
  } catch (e) {
    debug('error `encode(%o)` - %o', value, e)
  }
}

/**
 * Decode.
 */

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    debug('error `decode(%o)` - %o', value, e)
  }
}

}, {"debug":16}],
19: [function(require, module, exports) {
'use strict';

/**
 * Module dependencies.
 */

// XXX: Hacky fix for Duo not supporting scoped modules
var each; try { each = require('@ndhoule/each'); } catch(e) { each = require('each'); }

/**
 * Reduces all the values in a collection down into a single value. Does so by iterating through the
 * collection from left to right, repeatedly calling an `iterator` function and passing to it four
 * arguments: `(accumulator, value, index, collection)`.
 *
 * Returns the final return value of the `iterator` function.
 *
 * @name foldl
 * @api public
 * @param {Function} iterator The function to invoke per iteration.
 * @param {*} accumulator The initial accumulator value, passed to the first invocation of `iterator`.
 * @param {Array|Object} collection The collection to iterate over.
 * @return {*} The return value of the final call to `iterator`.
 * @example
 * foldl(function(total, n) {
 *   return total + n;
 * }, 0, [1, 2, 3]);
 * //=> 6
 *
 * var phonebook = { bob: '555-111-2345', tim: '655-222-6789', sheila: '655-333-1298' };
 *
 * foldl(function(results, phoneNumber) {
 *  if (phoneNumber[0] === '6') {
 *    return results.concat(phoneNumber);
 *  }
 *  return results;
 * }, [], phonebook);
 * // => ['655-222-6789', '655-333-1298']
 */

var foldl = function foldl(iterator, accumulator, collection) {
  if (typeof iterator !== 'function') {
    throw new TypeError('Expected a function but received a ' + typeof iterator);
  }

  each(function(val, i, collection) {
    accumulator = iterator(accumulator, val, i, collection);
  }, collection);

  return accumulator;
};

/**
 * Exports.
 */

module.exports = foldl;

}, {"each":69}],
69: [function(require, module, exports) {
'use strict';

/**
 * Module dependencies.
 */

// XXX: Hacky fix for Duo not supporting scoped modules
var keys; try { keys = require('@ndhoule/keys'); } catch(e) { keys = require('keys'); }

/**
 * Object.prototype.toString reference.
 */

var objToString = Object.prototype.toString;

/**
 * Tests if a value is a number.
 *
 * @name isNumber
 * @api private
 * @param {*} val The value to test.
 * @return {boolean} Returns `true` if `val` is a number, otherwise `false`.
 */

// TODO: Move to library
var isNumber = function isNumber(val) {
  var type = typeof val;
  return type === 'number' || (type === 'object' && objToString.call(val) === '[object Number]');
};

/**
 * Tests if a value is an array.
 *
 * @name isArray
 * @api private
 * @param {*} val The value to test.
 * @return {boolean} Returns `true` if the value is an array, otherwise `false`.
 */

// TODO: Move to library
var isArray = typeof Array.isArray === 'function' ? Array.isArray : function isArray(val) {
  return objToString.call(val) === '[object Array]';
};

/**
 * Tests if a value is array-like. Array-like means the value is not a function and has a numeric
 * `.length` property.
 *
 * @name isArrayLike
 * @api private
 * @param {*} val
 * @return {boolean}
 */

// TODO: Move to library
var isArrayLike = function isArrayLike(val) {
  return val != null && (isArray(val) || (val !== 'function' && isNumber(val.length)));
};

/**
 * Internal implementation of `each`. Works on arrays and array-like data structures.
 *
 * @name arrayEach
 * @api private
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Array} array The array(-like) structure to iterate over.
 * @return {undefined}
 */

var arrayEach = function arrayEach(iterator, array) {
  for (var i = 0; i < array.length; i += 1) {
    // Break iteration early if `iterator` returns `false`
    if (iterator(array[i], i, array) === false) {
      break;
    }
  }
};

/**
 * Internal implementation of `each`. Works on objects.
 *
 * @name baseEach
 * @api private
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Object} object The object to iterate over.
 * @return {undefined}
 */

var baseEach = function baseEach(iterator, object) {
  var ks = keys(object);

  for (var i = 0; i < ks.length; i += 1) {
    // Break iteration early if `iterator` returns `false`
    if (iterator(object[ks[i]], ks[i], object) === false) {
      break;
    }
  }
};

/**
 * Iterate over an input collection, invoking an `iterator` function for each element in the
 * collection and passing to it three arguments: `(value, index, collection)`. The `iterator`
 * function can end iteration early by returning `false`.
 *
 * @name each
 * @api public
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Array|Object|string} collection The collection to iterate over.
 * @return {undefined} Because `each` is run only for side effects, always returns `undefined`.
 * @example
 * var log = console.log.bind(console);
 *
 * each(log, ['a', 'b', 'c']);
 * //-> 'a', 0, ['a', 'b', 'c']
 * //-> 'b', 1, ['a', 'b', 'c']
 * //-> 'c', 2, ['a', 'b', 'c']
 * //=> undefined
 *
 * each(log, 'tim');
 * //-> 't', 2, 'tim'
 * //-> 'i', 1, 'tim'
 * //-> 'm', 0, 'tim'
 * //=> undefined
 *
 * // Note: Iteration order not guaranteed across environments
 * each(log, { name: 'tim', occupation: 'enchanter' });
 * //-> 'tim', 'name', { name: 'tim', occupation: 'enchanter' }
 * //-> 'enchanter', 'occupation', { name: 'tim', occupation: 'enchanter' }
 * //=> undefined
 */

var each = function each(iterator, collection) {
  return (isArrayLike(collection) ? arrayEach : baseEach).call(this, iterator, collection);
};

/**
 * Exports.
 */

module.exports = each;

}, {"keys":70}],
70: [function(require, module, exports) {
'use strict';

/**
 * charAt reference.
 */

var strCharAt = String.prototype.charAt;

/**
 * Returns the character at a given index.
 *
 * @param {string} str
 * @param {number} index
 * @return {string|undefined}
 */

// TODO: Move to a library
var charAt = function(str, index) {
  return strCharAt.call(str, index);
};

/**
 * hasOwnProperty reference.
 */

var hop = Object.prototype.hasOwnProperty;

/**
 * Object.prototype.toString reference.
 */

var toStr = Object.prototype.toString;

/**
 * hasOwnProperty, wrapped as a function.
 *
 * @name has
 * @api private
 * @param {*} context
 * @param {string|number} prop
 * @return {boolean}
 */

// TODO: Move to a library
var has = function has(context, prop) {
  return hop.call(context, prop);
};

/**
 * Returns true if a value is a string, otherwise false.
 *
 * @name isString
 * @api private
 * @param {*} val
 * @return {boolean}
 */

// TODO: Move to a library
var isString = function isString(val) {
  return toStr.call(val) === '[object String]';
};

/**
 * Returns true if a value is array-like, otherwise false. Array-like means a
 * value is not null, undefined, or a function, and has a numeric `length`
 * property.
 *
 * @name isArrayLike
 * @api private
 * @param {*} val
 * @return {boolean}
 */

// TODO: Move to a library
var isArrayLike = function isArrayLike(val) {
  return val != null && (typeof val !== 'function' && typeof val.length === 'number');
};


/**
 * indexKeys
 *
 * @name indexKeys
 * @api private
 * @param {} target
 * @param {} pred
 * @return {Array}
 */

var indexKeys = function indexKeys(target, pred) {
  pred = pred || has;
  var results = [];

  for (var i = 0, len = target.length; i < len; i += 1) {
    if (pred(target, i)) {
      results.push(String(i));
    }
  }

  return results;
};

/**
 * Returns an array of all the owned
 *
 * @name objectKeys
 * @api private
 * @param {*} target
 * @param {Function} pred Predicate function used to include/exclude values from
 * the resulting array.
 * @return {Array}
 */

var objectKeys = function objectKeys(target, pred) {
  pred = pred || has;
  var results = [];


  for (var key in target) {
    if (pred(target, key)) {
      results.push(String(key));
    }
  }

  return results;
};

/**
 * Creates an array composed of all keys on the input object. Ignores any non-enumerable properties.
 * More permissive than the native `Object.keys` function (non-objects will not throw errors).
 *
 * @name keys
 * @api public
 * @category Object
 * @param {Object} source The value to retrieve keys from.
 * @return {Array} An array containing all the input `source`'s keys.
 * @example
 * keys({ likes: 'avocado', hates: 'pineapple' });
 * //=> ['likes', 'pineapple'];
 *
 * // Ignores non-enumerable properties
 * var hasHiddenKey = { name: 'Tim' };
 * Object.defineProperty(hasHiddenKey, 'hidden', {
 *   value: 'i am not enumerable!',
 *   enumerable: false
 * })
 * keys(hasHiddenKey);
 * //=> ['name'];
 *
 * // Works on arrays
 * keys(['a', 'b', 'c']);
 * //=> ['0', '1', '2']
 *
 * // Skips unpopulated indices in sparse arrays
 * var arr = [1];
 * arr[4] = 4;
 * keys(arr);
 * //=> ['0', '4']
 */

module.exports = function keys(source) {
  if (source == null) {
    return [];
  }

  // IE6-8 compatibility (string)
  if (isString(source)) {
    return indexKeys(source, charAt);
  }

  // IE6-8 compatibility (arguments)
  if (isArrayLike(source)) {
    return indexKeys(source, has);
  }

  return objectKeys(source);
};

}, {}],
20: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Entity = require('./entity');
var bind = require('bind');
var debug = require('debug')('analytics:group');
var inherit = require('inherit');

/**
 * Group defaults
 */

Group.defaults = {
  persist: true,
  cookie: {
    key: 'ajs_group_id'
  },
  localStorage: {
    key: 'ajs_group_properties'
  }
};


/**
 * Initialize a new `Group` with `options`.
 *
 * @param {Object} options
 */

function Group(options) {
  this.defaults = Group.defaults;
  this.debug = debug;
  Entity.call(this, options);
}


/**
 * Inherit `Entity`
 */

inherit(Group, Entity);


/**
 * Expose the group singleton.
 */

module.exports = bind.all(new Group());


/**
 * Expose the `Group` constructor.
 */

module.exports.Group = Group;

}, {"./entity":71,"bind":12,"debug":16,"inherit":72}],
71: [function(require, module, exports) {

var clone = require('clone');
var cookie = require('./cookie');
var debug = require('debug')('analytics:entity');
var defaults = require('defaults');
var extend = require('extend');
var memory = require('./memory');
var store = require('./store');
var isodateTraverse = require('isodate-traverse');


/**
 * Expose `Entity`
 */

module.exports = Entity;


/**
 * Initialize new `Entity` with `options`.
 *
 * @param {Object} options
 */

function Entity(options) {
  this.options(options);
  this.initialize();
}

/**
 * Initialize picks the storage.
 *
 * Checks to see if cookies can be set
 * otherwise fallsback to localStorage.
 */

Entity.prototype.initialize = function() {
  cookie.set('ajs:cookies', true);

  // cookies are enabled.
  if (cookie.get('ajs:cookies')) {
    cookie.remove('ajs:cookies');
    this._storage = cookie;
    return;
  }

  // localStorage is enabled.
  if (store.enabled) {
    this._storage = store;
    return;
  }

  // fallback to memory storage.
  debug('warning using memory store both cookies and localStorage are disabled');
  this._storage = memory;
};

/**
 * Get the storage.
 */

Entity.prototype.storage = function() {
  return this._storage;
};


/**
 * Get or set storage `options`.
 *
 * @param {Object} options
 *   @property {Object} cookie
 *   @property {Object} localStorage
 *   @property {Boolean} persist (default: `true`)
 */

Entity.prototype.options = function(options) {
  if (arguments.length === 0) return this._options;
  this._options = defaults(options || {}, this.defaults || {});
};


/**
 * Get or set the entity's `id`.
 *
 * @param {String} id
 */

Entity.prototype.id = function(id) {
  switch (arguments.length) {
    case 0: return this._getId();
    case 1: return this._setId(id);
    default:
      // No default case
  }
};


/**
 * Get the entity's id.
 *
 * @return {String}
 */

Entity.prototype._getId = function() {
  var ret = this._options.persist
    ? this.storage().get(this._options.cookie.key)
    : this._id;
  return ret === undefined ? null : ret;
};


/**
 * Set the entity's `id`.
 *
 * @param {String} id
 */

Entity.prototype._setId = function(id) {
  if (this._options.persist) {
    this.storage().set(this._options.cookie.key, id);
  } else {
    this._id = id;
  }
};


/**
 * Get or set the entity's `traits`.
 *
 * BACKWARDS COMPATIBILITY: aliased to `properties`
 *
 * @param {Object} traits
 */

Entity.prototype.properties = Entity.prototype.traits = function(traits) {
  switch (arguments.length) {
    case 0: return this._getTraits();
    case 1: return this._setTraits(traits);
    default:
      // No default case
  }
};


/**
 * Get the entity's traits. Always convert ISO date strings into real dates,
 * since they aren't parsed back from local storage.
 *
 * @return {Object}
 */

Entity.prototype._getTraits = function() {
  var ret = this._options.persist ? store.get(this._options.localStorage.key) : this._traits;
  return ret ? isodateTraverse(clone(ret)) : {};
};


/**
 * Set the entity's `traits`.
 *
 * @param {Object} traits
 */

Entity.prototype._setTraits = function(traits) {
  traits = traits || {};
  if (this._options.persist) {
    store.set(this._options.localStorage.key, traits);
  } else {
    this._traits = traits;
  }
};


/**
 * Identify the entity with an `id` and `traits`. If we it's the same entity,
 * extend the existing `traits` instead of overwriting.
 *
 * @param {String} id
 * @param {Object} traits
 */

Entity.prototype.identify = function(id, traits) {
  traits = traits || {};
  var current = this.id();
  if (current === null || current === id) traits = extend(this.traits(), traits);
  if (id) this.id(id);
  this.debug('identify %o, %o', id, traits);
  this.traits(traits);
  this.save();
};


/**
 * Save the entity to local storage and the cookie.
 *
 * @return {Boolean}
 */

Entity.prototype.save = function() {
  if (!this._options.persist) return false;
  cookie.set(this._options.cookie.key, this.id());
  store.set(this._options.localStorage.key, this.traits());
  return true;
};


/**
 * Log the entity out, reseting `id` and `traits` to defaults.
 */

Entity.prototype.logout = function() {
  this.id(null);
  this.traits({});
  cookie.remove(this._options.cookie.key);
  store.remove(this._options.localStorage.key);
};


/**
 * Reset all entity state, logging out and returning options to defaults.
 */

Entity.prototype.reset = function() {
  this.logout();
  this.options({});
};


/**
 * Load saved entity `id` or `traits` from storage.
 */

Entity.prototype.load = function() {
  this.id(cookie.get(this._options.cookie.key));
  this.traits(store.get(this._options.localStorage.key));
};


}, {"clone":14,"./cookie":15,"debug":16,"defaults":17,"extend":73,"./memory":24,"./store":31,"isodate-traverse":41}],
73: [function(require, module, exports) {

module.exports = function extend (object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }

    return object;
};
}, {}],
24: [function(require, module, exports) {
/* eslint consistent-return:1 */

/**
 * Module Dependencies.
 */

var bind = require('bind');
var clone = require('clone');

/**
 * HOP.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `Memory`
 */

module.exports = bind.all(new Memory());

/**
 * Initialize `Memory` store
 */

function Memory(){
  this.store = {};
}

/**
 * Set a `key` and `value`.
 *
 * @param {String} key
 * @param {Mixed} value
 * @return {Boolean}
 */

Memory.prototype.set = function(key, value){
  this.store[key] = clone(value);
  return true;
};

/**
 * Get a `key`.
 *
 * @param {String} key
 */

Memory.prototype.get = function(key){
  if (!has.call(this.store, key)) return;
  return clone(this.store[key]);
};

/**
 * Remove a `key`.
 *
 * @param {String} key
 * @return {Boolean}
 */

Memory.prototype.remove = function(key){
  delete this.store[key];
  return true;
};

}, {"bind":12,"clone":14}],
31: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var bind = require('bind');
var defaults = require('defaults');
var store = require('store.js');

/**
 * Initialize a new `Store` with `options`.
 *
 * @param {Object} options
 */

function Store(options) {
  this.options(options);
}

/**
 * Set the `options` for the store.
 *
 * @param {Object} options
 *   @field {Boolean} enabled (true)
 */

Store.prototype.options = function(options) {
  if (arguments.length === 0) return this._options;

  options = options || {};
  defaults(options, { enabled: true });

  this.enabled = options.enabled && store.enabled;
  this._options = options;
};


/**
 * Set a `key` and `value` in local storage.
 *
 * @param {string} key
 * @param {Object} value
 */

Store.prototype.set = function(key, value) {
  if (!this.enabled) return false;
  return store.set(key, value);
};


/**
 * Get a value from local storage by `key`.
 *
 * @param {string} key
 * @return {Object}
 */

Store.prototype.get = function(key) {
  if (!this.enabled) return null;
  return store.get(key);
};


/**
 * Remove a value from local storage by `key`.
 *
 * @param {string} key
 */

Store.prototype.remove = function(key) {
  if (!this.enabled) return false;
  return store.remove(key);
};


/**
 * Expose the store singleton.
 */

module.exports = bind.all(new Store());


/**
 * Expose the `Store` constructor.
 */

module.exports.Store = Store;

}, {"bind":12,"defaults":17,"store.js":74}],
74: [function(require, module, exports) {
var json             = require('json')
  , store            = {}
  , win              = window
	,	doc              = win.document
	,	localStorageName = 'localStorage'
	,	namespace        = '__storejs__'
	,	storage;

store.disabled = false
store.set = function(key, value) {}
store.get = function(key) {}
store.remove = function(key) {}
store.clear = function() {}
store.transact = function(key, defaultVal, transactionFn) {
	var val = store.get(key)
	if (transactionFn == null) {
		transactionFn = defaultVal
		defaultVal = null
	}
	if (typeof val == 'undefined') { val = defaultVal || {} }
	transactionFn(val)
	store.set(key, val)
}
store.getAll = function() {}

store.serialize = function(value) {
	return json.stringify(value)
}
store.deserialize = function(value) {
	if (typeof value != 'string') { return undefined }
	try { return json.parse(value) }
	catch(e) { return value || undefined }
}

// Functions to encapsulate questionable FireFox 3.6.13 behavior
// when about.config::dom.storage.enabled === false
// See https://github.com/marcuswestin/store.js/issues#issue/13
function isLocalStorageNameSupported() {
	try { return (localStorageName in win && win[localStorageName]) }
	catch(err) { return false }
}

if (isLocalStorageNameSupported()) {
	storage = win[localStorageName]
	store.set = function(key, val) {
		if (val === undefined) { return store.remove(key) }
		storage.setItem(key, store.serialize(val))
		return val
	}
	store.get = function(key) { return store.deserialize(storage.getItem(key)) }
	store.remove = function(key) { storage.removeItem(key) }
	store.clear = function() { storage.clear() }
	store.getAll = function() {
		var ret = {}
		for (var i=0; i<storage.length; ++i) {
			var key = storage.key(i)
			ret[key] = store.get(key)
		}
		return ret
	}
} else if (doc.documentElement.addBehavior) {
	var storageOwner,
		storageContainer
	// Since #userData storage applies only to specific paths, we need to
	// somehow link our data to a specific path.  We choose /favicon.ico
	// as a pretty safe option, since all browsers already make a request to
	// this URL anyway and being a 404 will not hurt us here.  We wrap an
	// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
	// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
	// since the iframe access rules appear to allow direct access and
	// manipulation of the document element, even for a 404 page.  This
	// document can be used instead of the current document (which would
	// have been limited to the current path) to perform #userData storage.
	try {
		storageContainer = new ActiveXObject('htmlfile')
		storageContainer.open()
		storageContainer.write('<s' + 'cript>document.w=window</s' + 'cript><iframe src="/favicon.ico"></iframe>')
		storageContainer.close()
		storageOwner = storageContainer.w.frames[0].document
		storage = storageOwner.createElement('div')
	} catch(e) {
		// somehow ActiveXObject instantiation failed (perhaps some special
		// security settings or otherwse), fall back to per-path storage
		storage = doc.createElement('div')
		storageOwner = doc.body
	}
	function withIEStorage(storeFunction) {
		return function() {
			var args = Array.prototype.slice.call(arguments, 0)
			args.unshift(storage)
			// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
			// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
			storageOwner.appendChild(storage)
			storage.addBehavior('#default#userData')
			storage.load(localStorageName)
			var result = storeFunction.apply(store, args)
			storageOwner.removeChild(storage)
			return result
		}
	}

	// In IE7, keys may not contain special chars. See all of https://github.com/marcuswestin/store.js/issues/40
	var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
	function ieKeyFix(key) {
		return key.replace(forbiddenCharsRegex, '___')
	}
	store.set = withIEStorage(function(storage, key, val) {
		key = ieKeyFix(key)
		if (val === undefined) { return store.remove(key) }
		storage.setAttribute(key, store.serialize(val))
		storage.save(localStorageName)
		return val
	})
	store.get = withIEStorage(function(storage, key) {
		key = ieKeyFix(key)
		return store.deserialize(storage.getAttribute(key))
	})
	store.remove = withIEStorage(function(storage, key) {
		key = ieKeyFix(key)
		storage.removeAttribute(key)
		storage.save(localStorageName)
	})
	store.clear = withIEStorage(function(storage) {
		var attributes = storage.XMLDocument.documentElement.attributes
		storage.load(localStorageName)
		for (var i=0, attr; attr=attributes[i]; i++) {
			storage.removeAttribute(attr.name)
		}
		storage.save(localStorageName)
	})
	store.getAll = withIEStorage(function(storage) {
		var attributes = storage.XMLDocument.documentElement.attributes
		var ret = {}
		for (var i=0, attr; attr=attributes[i]; ++i) {
			var key = ieKeyFix(attr.name)
			ret[attr.name] = store.deserialize(storage.getAttribute(key))
		}
		return ret
	})
}

try {
	store.set(namespace, namespace)
	if (store.get(namespace) != namespace) { store.disabled = true }
	store.remove(namespace)
} catch(e) {
	store.disabled = true
}
store.enabled = !store.disabled

module.exports = store;
}, {"json":62}],
72: [function(require, module, exports) {

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
}, {}],
21: [function(require, module, exports) {

var isEmpty = require('is-empty');

try {
  var typeOf = require('type');
} catch (e) {
  var typeOf = require('component-type');
}


/**
 * Types.
 */

var types = [
  'arguments',
  'array',
  'boolean',
  'date',
  'element',
  'function',
  'null',
  'number',
  'object',
  'regexp',
  'string',
  'undefined'
];


/**
 * Expose type checkers.
 *
 * @param {Mixed} value
 * @return {Boolean}
 */

for (var i = 0, type; type = types[i]; i++) exports[type] = generate(type);


/**
 * Add alias for `function` for old browsers.
 */

exports.fn = exports['function'];


/**
 * Expose `empty` check.
 */

exports.empty = isEmpty;


/**
 * Expose `nan` check.
 */

exports.nan = function (val) {
  return exports.number(val) && val != val;
};


/**
 * Generate a type checker.
 *
 * @param {String} type
 * @return {Function}
 */

function generate (type) {
  return function (value) {
    return type === typeOf(value);
  };
}
}, {"is-empty":49,"type":50,"component-type":50}],
22: [function(require, module, exports) {
module.exports = function isMeta (e) {
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return true;

    // Logic that handles checks for the middle mouse button, based
    // on [jQuery](https://github.com/jquery/jquery/blob/master/src/event.js#L466).
    var which = e.which, button = e.button;
    if (!which && button !== undefined) {
      return (!button & 1) && (!button & 2) && (button & 4);
    } else if (which === 2) {
      return true;
    }

    return false;
};
}, {}],
23: [function(require, module, exports) {

/**
 * HOP ref.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Return own keys in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.keys = Object.keys || function(obj){
  var keys = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Return own values in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.values = function(obj){
  var vals = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

exports.merge = function(a, b){
  for (var key in b) {
    if (has.call(b, key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return length of `obj`.
 *
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.length = function(obj){
  return exports.keys(obj).length;
};

/**
 * Check if `obj` is empty.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api public
 */

exports.isEmpty = function(obj){
  return 0 == exports.length(obj);
};
}, {}],
25: [function(require, module, exports) {

/**
 * Module Dependencies.
 */

var debug = require('debug')('analytics.js:normalize');
var defaults = require('defaults');
var each = require('each');
var includes = require('includes');
var is = require('is');
var map = require('component/map');

/**
 * HOP.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `normalize`
 */

module.exports = normalize;

/**
 * Toplevel properties.
 */

var toplevel = [
  'integrations',
  'anonymousId',
  'timestamp',
  'context'
];

/**
 * Normalize `msg` based on integrations `list`.
 *
 * @param {Object} msg
 * @param {Array} list
 * @return {Function}
 */

function normalize(msg, list){
  var lower = map(list, function(s){ return s.toLowerCase(); });
  var opts = msg.options || {};
  var integrations = opts.integrations || {};
  var providers = opts.providers || {};
  var context = opts.context || {};
  var ret = {};
  debug('<-', msg);

  // integrations.
  each(opts, function(key, value){
    if (!integration(key)) return;
    if (!has.call(integrations, key)) integrations[key] = value;
    delete opts[key];
  });

  // providers.
  delete opts.providers;
  each(providers, function(key, value){
    if (!integration(key)) return;
    if (is.object(integrations[key])) return;
    if (has.call(integrations, key) && typeof providers[key] === 'boolean') return;
    integrations[key] = value;
  });

  // move all toplevel options to msg
  // and the rest to context.
  each(opts, function(key){
    if (includes(key, toplevel)) {
      ret[key] = opts[key];
    } else {
      context[key] = opts[key];
    }
  });

  // cleanup
  delete msg.options;
  ret.integrations = integrations;
  ret.context = context;
  ret = defaults(ret, msg);
  debug('->', ret);
  return ret;

  function integration(name){
    return !!(includes(name, list) || name.toLowerCase() === 'all' || includes(name.toLowerCase(), lower));
  }
}

}, {"debug":16,"defaults":17,"each":18,"includes":75,"is":21,"component/map":76}],
75: [function(require, module, exports) {
'use strict';

/**
 * Module dependencies.
 */

// XXX: Hacky fix for duo not supporting scoped npm packages
var each; try { each = require('@ndhoule/each'); } catch(e) { each = require('each'); }

/**
 * String#indexOf reference.
 */

var strIndexOf = String.prototype.indexOf;

/**
 * Object.is/sameValueZero polyfill.
 *
 * @api private
 * @param {*} value1
 * @param {*} value2
 * @return {boolean}
 */

// TODO: Move to library
var sameValueZero = function sameValueZero(value1, value2) {
  // Normal values and check for 0 / -0
  if (value1 === value2) {
    return value1 !== 0 || 1 / value1 === 1 / value2;
  }
  // NaN
  return value1 !== value1 && value2 !== value2;
};

/**
 * Searches a given `collection` for a value, returning true if the collection
 * contains the value and false otherwise. Can search strings, arrays, and
 * objects.
 *
 * @name includes
 * @api public
 * @param {*} searchElement The element to search for.
 * @param {Object|Array|string} collection The collection to search.
 * @return {boolean}
 * @example
 * includes(2, [1, 2, 3]);
 * //=> true
 *
 * includes(4, [1, 2, 3]);
 * //=> false
 *
 * includes(2, { a: 1, b: 2, c: 3 });
 * //=> true
 *
 * includes('a', { a: 1, b: 2, c: 3 });
 * //=> false
 *
 * includes('abc', 'xyzabc opq');
 * //=> true
 *
 * includes('nope', 'xyzabc opq');
 * //=> false
 */
var includes = function includes(searchElement, collection) {
  var found = false;

  // Delegate to String.prototype.indexOf when `collection` is a string
  if (typeof collection === 'string') {
    return strIndexOf.call(collection, searchElement) !== -1;
  }

  // Iterate through enumerable/own array elements and object properties.
  each(function(value) {
    if (sameValueZero(value, searchElement)) {
      found = true;
      // Exit iteration early when found
      return false;
    }
  }, collection);

  return found;
};

/**
 * Exports.
 */

module.exports = includes;

}, {"each":69}],
76: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var toFunction = require('to-function');

/**
 * Map the given `arr` with callback `fn(val, i)`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @return {Array}
 * @api public
 */

module.exports = function(arr, fn){
  var ret = [];
  fn = toFunction(fn);
  for (var i = 0; i < arr.length; ++i) {
    ret.push(fn(arr[i], i));
  }
  return ret;
};
}, {"to-function":77}],
77: [function(require, module, exports) {

/**
 * Module Dependencies
 */

var expr;
try {
  expr = require('props');
} catch(e) {
  expr = require('component-props');
}

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  };
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  };
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {};
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key]);
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  };
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val, i, prop;
  for (i = 0; i < props.length; i++) {
    prop = props[i];
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";

    // mimic negative lookbehind to avoid problems with nested properties
    str = stripNested(prop, str, val);
  }

  return str;
}

/**
 * Mimic negative lookbehind to avoid problems with nested properties.
 *
 * See: http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
 *
 * @param {String} prop
 * @param {String} str
 * @param {String} val
 * @return {String}
 * @api private
 */

function stripNested (prop, str, val) {
  return str.replace(new RegExp('(\\.)?' + prop, 'g'), function($0, $1) {
    return $1 ? $0 : val;
  });
}

}, {"props":78,"component-props":78}],
78: [function(require, module, exports) {
/**
 * Global Names
 */

var globals = /\b(this|Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[$a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

}, {}],
26: [function(require, module, exports) {

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture || false);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture || false);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

}, {}],
27: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var canonical = require('canonical');
var includes = require('includes');
var url = require('url');

/**
 * Return a default `options.context.page` object.
 *
 * https://segment.com/docs/spec/page/#properties
 *
 * @return {Object}
 */

function pageDefaults() {
  return {
    path: canonicalPath(),
    referrer: document.referrer,
    search: location.search,
    title: document.title,
    url: canonicalUrl(location.search)
  };
}

/**
 * Return the canonical path for the page.
 *
 * @return {string}
 */

function canonicalPath() {
  var canon = canonical();
  if (!canon) return window.location.pathname;
  var parsed = url.parse(canon);
  return parsed.pathname;
}

/**
 * Return the canonical URL for the page concat the given `search`
 * and strip the hash.
 *
 * @param {string} search
 * @return {string}
 */

function canonicalUrl(search) {
  var canon = canonical();
  if (canon) return includes('?', canon) ? canon : canon + search;
  var url = window.location.href;
  var i = url.indexOf('#');
  return i === -1 ? url : url.slice(0, i);
}

/**
 * Exports.
 */

module.exports = pageDefaults;

}, {"canonical":79,"includes":75,"url":80}],
79: [function(require, module, exports) {
module.exports = function canonical () {
  var tags = document.getElementsByTagName('link');
  for (var i = 0, tag; tag = tags[i]; i++) {
    if ('canonical' == tag.getAttribute('rel')) return tag.getAttribute('href');
  }
};
}, {}],
80: [function(require, module, exports) {

/**
 * Parse the given `url`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(url){
  var a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: ('0' === a.port || '' === a.port) ? port(a.protocol) : a.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1)
  };
};

/**
 * Check if `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(url){
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
};

/**
 * Check if `url` is relative.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isRelative = function(url){
  return !exports.isAbsolute(url);
};

/**
 * Check if `url` is cross domain.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isCrossDomain = function(url){
  url = exports.parse(url);
  var location = exports.parse(window.location.href);
  return url.hostname !== location.hostname
    || url.port !== location.port
    || url.protocol !== location.protocol;
};

/**
 * Return default port for `protocol`.
 *
 * @param  {String} protocol
 * @return {String}
 * @api private
 */
function port (protocol){
  switch (protocol) {
    case 'http:':
      return 80;
    case 'https:':
      return 443;
    default:
      return location.port;
  }
}

}, {}],
28: [function(require, module, exports) {
'use strict';

var objToString = Object.prototype.toString;

// TODO: Move to lib
var existy = function(val) {
  return val != null;
};

// TODO: Move to lib
var isArray = function(val) {
  return objToString.call(val) === '[object Array]';
};

// TODO: Move to lib
var isString = function(val) {
   return typeof val === 'string' || objToString.call(val) === '[object String]';
};

// TODO: Move to lib
var isObject = function(val) {
  return val != null && typeof val === 'object';
};

/**
 * Returns a copy of the new `object` containing only the specified properties.
 *
 * @name pick
 * @api public
 * @category Object
 * @see {@link omit}
 * @param {Array.<string>|string} props The property or properties to keep.
 * @param {Object} object The object to iterate over.
 * @return {Object} A new object containing only the specified properties from `object`.
 * @example
 * var person = { name: 'Tim', occupation: 'enchanter', fears: 'rabbits' };
 *
 * pick('name', person);
 * //=> { name: 'Tim' }
 *
 * pick(['name', 'fears'], person);
 * //=> { name: 'Tim', fears: 'rabbits' }
 */

var pick = function pick(props, object) {
  if (!existy(object) || !isObject(object)) {
    return {};
  }

  if (isString(props)) {
    props = [props];
  }

  if (!isArray(props)) {
    props = [];
  }

  var result = {};

  for (var i = 0; i < props.length; i += 1) {
    if (isString(props[i]) && props[i] in object) {
      result[props[i]] = object[props[i]];
    }
  }

  return result;
};

/**
 * Exports.
 */

module.exports = pick;

}, {}],
29: [function(require, module, exports) {

/**
 * prevent default on the given `e`.
 * 
 * examples:
 * 
 *      anchor.onclick = prevent;
 *      anchor.onclick = function(e){
 *        if (something) return prevent(e);
 *      };
 * 
 * @param {Event} e
 */

module.exports = function(e){
  e = e || window.event
  return e.preventDefault
    ? e.preventDefault()
    : e.returnValue = false;
};

}, {}],
30: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var trim = require('trim');
var type = require('type');

var pattern = /(\w+)\[(\d+)\]/

/**
 * Safely encode the given string
 * 
 * @param {String} str
 * @return {String}
 * @api private
 */

var encode = function(str) {
  try {
    return encodeURIComponent(str);
  } catch (e) {
    return str;
  }
};

/**
 * Safely decode the string
 * 
 * @param {String} str
 * @return {String}
 * @api private
 */

var decode = function(str) {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch (e) {
    return str;
  }
}

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};
  if ('?' == str.charAt(0)) str = str.slice(1);

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    var key = decode(parts[0]);
    var m;

    if (m = pattern.exec(key)) {
      obj[m[1]] = obj[m[1]] || [];
      obj[m[1]][m[2]] = decode(parts[1]);
      continue;
    }

    obj[parts[0]] = null == parts[1]
      ? ''
      : decode(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function(obj){
  if (!obj) return '';
  var pairs = [];

  for (var key in obj) {
    var value = obj[key];

    if ('array' == type(value)) {
      for (var i = 0; i < value.length; ++i) {
        pairs.push(encode(key + '[' + i + ']') + '=' + encode(value[i]));
      }
      continue;
    }

    pairs.push(encode(key) + '=' + encode(obj[key]));
  }

  return pairs.join('&');
};

}, {"trim":57,"type":81}],
81: [function(require, module, exports) {
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val)

  return typeof val;
};

}, {}],
32: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Entity = require('./entity');
var bind = require('bind');
var cookie = require('./cookie');
var debug = require('debug')('analytics:user');
var inherit = require('inherit');
var rawCookie = require('cookie');
var uuid = require('uuid');


/**
 * User defaults
 */

User.defaults = {
  persist: true,
  cookie: {
    key: 'ajs_user_id',
    oldKey: 'ajs_user'
  },
  localStorage: {
    key: 'ajs_user_traits'
  }
};


/**
 * Initialize a new `User` with `options`.
 *
 * @param {Object} options
 */

function User(options) {
  this.defaults = User.defaults;
  this.debug = debug;
  Entity.call(this, options);
}


/**
 * Inherit `Entity`
 */

inherit(User, Entity);

/**
 * Set/get the user id.
 *
 * When the user id changes, the method will reset his anonymousId to a new one.
 *
 * // FIXME: What are the mixed types?
 * @param {string} id
 * @return {Mixed}
 * @example
 * // didn't change because the user didn't have previous id.
 * anonymousId = user.anonymousId();
 * user.id('foo');
 * assert.equal(anonymousId, user.anonymousId());
 *
 * // didn't change because the user id changed to null.
 * anonymousId = user.anonymousId();
 * user.id('foo');
 * user.id(null);
 * assert.equal(anonymousId, user.anonymousId());
 *
 * // change because the user had previous id.
 * anonymousId = user.anonymousId();
 * user.id('foo');
 * user.id('baz'); // triggers change
 * user.id('baz'); // no change
 * assert.notEqual(anonymousId, user.anonymousId());
 */

User.prototype.id = function(id){
  var prev = this._getId();
  var ret = Entity.prototype.id.apply(this, arguments);
  if (prev == null) return ret;
  // FIXME: We're relying on coercion here (1 == "1"), but our API treats these
  // two values differently. Figure out what will break if we remove this and
  // change to strict equality
  /* eslint-disable eqeqeq */
  if (prev != id && id) this.anonymousId(null);
  /* eslint-enable eqeqeq */
  return ret;
};

/**
 * Set / get / remove anonymousId.
 *
 * @param {String} anonymousId
 * @return {String|User}
 */

User.prototype.anonymousId = function(anonymousId){
  var store = this.storage();

  // set / remove
  if (arguments.length) {
    store.set('ajs_anonymous_id', anonymousId);
    return this;
  }

  // new
  anonymousId = store.get('ajs_anonymous_id');
  if (anonymousId) {
    return anonymousId;
  }

  // old - it is not stringified so we use the raw cookie.
  anonymousId = rawCookie('_sio');
  if (anonymousId) {
    anonymousId = anonymousId.split('----')[0];
    store.set('ajs_anonymous_id', anonymousId);
    store.remove('_sio');
    return anonymousId;
  }

  // empty
  anonymousId = uuid();
  store.set('ajs_anonymous_id', anonymousId);
  return store.get('ajs_anonymous_id');
};

/**
 * Remove anonymous id on logout too.
 */

User.prototype.logout = function(){
  Entity.prototype.logout.call(this);
  this.anonymousId(null);
};

/**
 * Load saved user `id` or `traits` from storage.
 */

User.prototype.load = function() {
  if (this._loadOldCookie()) return;
  Entity.prototype.load.call(this);
};


/**
 * BACKWARDS COMPATIBILITY: Load the old user from the cookie.
 *
 * @api private
 * @return {boolean}
 */

User.prototype._loadOldCookie = function() {
  var user = cookie.get(this._options.cookie.oldKey);
  if (!user) return false;

  this.id(user.id);
  this.traits(user.traits);
  cookie.remove(this._options.cookie.oldKey);
  return true;
};


/**
 * Expose the user singleton.
 */

module.exports = bind.all(new User());


/**
 * Expose the `User` constructor.
 */

module.exports.User = User;

}, {"./entity":71,"bind":12,"./cookie":15,"debug":16,"inherit":72,"cookie":61,"uuid":82}],
82: [function(require, module, exports) {

/**
 * Taken straight from jed's gist: https://gist.github.com/982883
 *
 * Returns a random v4 UUID of the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx,
 * where each x is replaced with a random hexadecimal digit from 0 to f, and
 * y is replaced with a random hexadecimal digit from 8 to b.
 */

module.exports = function uuid(a){
  return a           // if the placeholder was passed, return
    ? (              // a random number from 0 to 15
      a ^            // unless b is 8,
      Math.random()  // in which case
      * 16           // a random number from
      >> a/4         // 8 to 11
      ).toString(16) // in hexadecimal
    : (              // or otherwise a concatenated string:
      [1e7] +        // 10000000 +
      -1e3 +         // -1000 +
      -4e3 +         // -4000 +
      -8e3 +         // -80000000 +
      -1e11          // -100000000000,
      ).replace(     // replacing
        /[018]/g,    // zeroes, ones, and eights with
        uuid         // random hex digits
      )
};
}, {}],
8: [function(require, module, exports) {
module.exports = {
  "name": "analytics-core",
  "version": "2.11.1",
  "main": "analytics.js",
  "dependencies": {},
  "devDependencies": {}
}
;
}, {}],
3: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var bind = require('bind');
var clone = require('clone');
var debug = require('debug');
var defaults = require('defaults');
var extend = require('extend');
var slug = require('slug');
var protos = require('./protos');
var statics = require('./statics');

/**
 * Create a new `Integration` constructor.
 *
 * @constructs Integration
 * @param {string} name
 * @return {Function} Integration
 */

function createIntegration(name){
  /**
   * Initialize a new `Integration`.
   *
   * @class
   * @param {Object} options
   */

  function Integration(options){
    if (options && options.addIntegration) {
      // plugin
      return options.addIntegration(Integration);
    }
    this.debug = debug('analytics:integration:' + slug(name));
    this.options = defaults(clone(options) || {}, this.defaults);
    this._queue = [];
    this.once('ready', bind(this, this.flush));

    Integration.emit('construct', this);
    this.ready = bind(this, this.ready);
    this._wrapInitialize();
    this._wrapPage();
    this._wrapTrack();
  }

  Integration.prototype.defaults = {};
  Integration.prototype.globals = [];
  Integration.prototype.templates = {};
  Integration.prototype.name = name;
  extend(Integration, statics);
  extend(Integration.prototype, protos);

  return Integration;
}

/**
 * Exports.
 */

module.exports = createIntegration;

}, {"bind":83,"clone":14,"debug":84,"defaults":17,"extend":85,"slug":86,"./protos":87,"./statics":88}],
83: [function(require, module, exports) {

var bind = require('bind')
  , bindAll = require('bind-all');


/**
 * Expose `bind`.
 */

module.exports = exports = bind;


/**
 * Expose `bindAll`.
 */

exports.all = bindAll;


/**
 * Expose `bindMethods`.
 */

exports.methods = bindMethods;


/**
 * Bind `methods` on `obj` to always be called with the `obj` as context.
 *
 * @param {Object} obj
 * @param {String} methods...
 */

function bindMethods (obj, methods) {
  methods = [].slice.call(arguments, 1);
  for (var i = 0, method; method = methods[i]; i++) {
    obj[method] = bind(obj, obj[method]);
  }
  return obj;
}
}, {"bind":58,"bind-all":59}],
84: [function(require, module, exports) {
if ('undefined' == typeof window) {
  module.exports = require('./lib/debug');
} else {
  module.exports = require('./debug');
}

}, {"./lib/debug":89,"./debug":90}],
89: [function(require, module, exports) {
/**
 * Module dependencies.
 */

var tty = require('tty');

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Enabled debuggers.
 */

var names = []
  , skips = [];

(process.env.DEBUG || '')
  .split(/[\s,]+/)
  .forEach(function(name){
    name = name.replace('*', '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    } else {
      names.push(new RegExp('^' + name + '$'));
    }
  });

/**
 * Colors.
 */

var colors = [6, 2, 3, 4, 5, 1];

/**
 * Previous debug() call.
 */

var prev = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Is stdout a TTY? Colored output is disabled when `true`.
 */

var isatty = tty.isatty(2);

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function color() {
  return colors[prevColor++ % colors.length];
}

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

function humanize(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
}

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  function disabled(){}
  disabled.enabled = false;

  var match = skips.some(function(re){
    return re.test(name);
  });

  if (match) return disabled;

  match = names.some(function(re){
    return re.test(name);
  });

  if (!match) return disabled;
  var c = color();

  function colored(fmt) {
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (prev[name] || curr);
    prev[name] = curr;

    fmt = '  \u001b[9' + c + 'm' + name + ' '
      + '\u001b[3' + c + 'm\u001b[90m'
      + fmt + '\u001b[3' + c + 'm'
      + ' +' + humanize(ms) + '\u001b[0m';

    console.error.apply(this, arguments);
  }

  function plain(fmt) {
    fmt = coerce(fmt);

    fmt = new Date().toUTCString()
      + ' ' + name + ' ' + fmt;
    console.error.apply(this, arguments);
  }

  colored.enabled = plain.enabled = true;

  return isatty || process.env.DEBUG_COLORS
    ? colored
    : plain;
}

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

}, {}],
90: [function(require, module, exports) {

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

}, {}],
85: [function(require, module, exports) {

module.exports = function extend (object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }

    return object;
};
}, {}],
86: [function(require, module, exports) {

/**
 * Generate a slug from the given `str`.
 *
 * example:
 *
 *        generate('foo bar');
 *        // > foo-bar
 *
 * @param {String} str
 * @param {Object} options
 * @config {String|RegExp} [replace] characters to replace, defaulted to `/[^a-z0-9]/g`
 * @config {String} [separator] separator to insert, defaulted to `-`
 * @return {String}
 */

module.exports = function (str, options) {
  options || (options = {});
  return str.toLowerCase()
    .replace(options.replace || /[^a-z0-9]/g, ' ')
    .replace(/^ +| +$/g, '')
    .replace(/ +/g, options.separator || '-')
};

}, {}],
87: [function(require, module, exports) {
/* global setInterval:true setTimeout:true */

/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var after = require('after');
var each = require('each');
var events = require('analytics-events');
var fmt = require('fmt');
var foldl = require('foldl');
var loadIframe = require('load-iframe');
var loadScript = require('load-script');
var normalize = require('to-no-case');
var nextTick = require('next-tick');
var every = require('every');
var is = require('is');

/**
 * Noop.
 */

function noop(){}

/**
 * hasOwnProperty reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Window defaults.
 */

var onerror = window.onerror;
var onload = null;
var setInterval = window.setInterval;
var setTimeout = window.setTimeout;

/**
 * Mixin emitter.
 */

/* eslint-disable new-cap */
Emitter(exports);
/* eslint-enable new-cap */

/**
 * Initialize.
 */

exports.initialize = function(){
  var ready = this.ready;
  nextTick(ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

exports.loaded = function(){
  return false;
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

/* eslint-disable no-unused-vars */
exports.page = function(page){};
/* eslint-enable no-unused-vars */

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

/* eslint-disable no-unused-vars */
exports.track = function(track){};
/* eslint-enable no-unused-vars */

/**
 * Get values from items in `options` that are mapped to `key`.
 * `options` is an integration setting which is a collection
 * of type 'map', 'array', or 'mixed'
 *
 * Use cases include mapping events to pixelIds (map), sending generic
 * conversion pixels only for specific events (array), or configuring dynamic
 * mappings of event properties to query string parameters based on event (mixed)
 *
 * @api public
 * @param {Object|Object[]|String[]} options An object, array of objects, or
 * array of strings pulled from settings.mapping.
 * @param {string} key The name of the item in options whose metadata
 * we're looking for.
 * @return {Array} An array of settings that match the input `key` name.
 * @example
 *
 * // 'Map'
 * var events = { my_event: 'a4991b88' };
 * .map(events, 'My Event');
 * // => ["a4991b88"]
 * .map(events, 'whatever');
 * // => []
 *
 * // 'Array'
 * * var events = ['Completed Order', 'My Event'];
 * .map(events, 'My Event');
 * // => ["My Event"]
 * .map(events, 'whatever');
 * // => []
 *
 * // 'Mixed'
 * var events = [{ key: 'my event', value: '9b5eb1fa' }];
 * .map(events, 'my_event');
 * // => ["9b5eb1fa"]
 * .map(events, 'whatever');
 * // => []
 */

exports.map = function(options, key){
  var normalizedComparator = normalize(key);
  var mappingType = getMappingType(options);

  if (mappingType === 'unknown') {
    return [];
  }

  return foldl(function(matchingValues, val, key) {
    var compare;
    var result;

    if (mappingType === 'map') {
      compare = key;
      result = val;
    }

    if (mappingType === 'array') {
      compare = val;
      result = val;
    }

    if (mappingType === 'mixed') {
      compare = val.key;
      result = val.value;
    }

    if (normalize(compare) === normalizedComparator) {
      matchingValues.push(result);
    }

    return matchingValues;
  }, [], options);
};

/**
 * Invoke a `method` that may or may not exist on the prototype with `args`,
 * queueing or not depending on whether the integration is "ready". Don't
 * trust the method call, since it contains integration party code.
 *
 * @api private
 * @param {string} method
 * @param {...*} args
 */

exports.invoke = function(method){
  if (!this[method]) return;
  var args = Array.prototype.slice.call(arguments, 1);
  if (!this._ready) return this.queue(method, args);
  var ret;

  try {
    this.debug('%s with %o', method, args);
    ret = this[method].apply(this, args);
  } catch (e) {
    this.debug('error %o calling %s with %o', e, method, args);
  }

  return ret;
};

/**
 * Queue a `method` with `args`. If the integration assumes an initial
 * pageview, then let the first call to `page` pass through.
 *
 * @api private
 * @param {string} method
 * @param {Array} args
 */

exports.queue = function(method, args){
  if (method === 'page' && this._assumesPageview && !this._initialized) {
    return this.page.apply(this, args);
  }

  this._queue.push({ method: method, args: args });
};

/**
 * Flush the internal queue.
 *
 * @api private
 */

exports.flush = function(){
  this._ready = true;
  var self = this;

  each(this._queue, function(call){
    self[call.method].apply(self, call.args);
  });

  // Empty the queue.
  this._queue.length = 0;
};

/**
 * Reset the integration, removing its global variables.
 *
 * @api private
 */

exports.reset = function(){
  for (var i = 0; i < this.globals.length; i++) {
    window[this.globals[i]] = undefined;
  }

  window.setTimeout = setTimeout;
  window.setInterval = setInterval;
  window.onerror = onerror;
  window.onload = onload;
};

/**
 * Load a tag by `name`.
 *
 * @param {string} name The name of the tag.
 * @param {Object} locals Locals used to populate the tag's template variables
 * (e.g. `userId` in '<img src="https://whatever.com/{{ userId }}">').
 * @param {Function} [callback=noop] A callback, invoked when the tag finishes
 * loading.
 */

exports.load = function(name, locals, callback){
  // Argument shuffling
  if (typeof name === 'function') { callback = name; locals = null; name = null; }
  if (name && typeof name === 'object') { callback = locals; locals = name; name = null; }
  if (typeof locals === 'function') { callback = locals; locals = null; }

  // Default arguments
  name = name || 'library';
  locals = locals || {};

  locals = this.locals(locals);
  var template = this.templates[name];
  if (!template) throw new Error(fmt('template "%s" not defined.', name));
  var attrs = render(template, locals);
  callback = callback || noop;
  var self = this;
  var el;

  switch (template.type) {
    case 'img':
      attrs.width = 1;
      attrs.height = 1;
      el = loadImage(attrs, callback);
      break;
    case 'script':
      el = loadScript(attrs, function(err){
        if (!err) return callback();
        self.debug('error loading "%s" error="%s"', self.name, err);
      });
      // TODO: hack until refactoring load-script
      delete attrs.src;
      each(attrs, function(key, val){
        el.setAttribute(key, val);
      });
      break;
    case 'iframe':
      el = loadIframe(attrs, callback);
      break;
    default:
      // No default case
  }

  return el;
};

/**
 * Locals for tag templates.
 *
 * By default it includes a cache buster and all of the options.
 *
 * @param {Object} [locals]
 * @return {Object}
 */

exports.locals = function(locals){
  locals = locals || {};
  var cache = Math.floor(new Date().getTime() / 3600000);
  if (!locals.hasOwnProperty('cache')) locals.cache = cache;
  each(this.options, function(key, val){
    if (!locals.hasOwnProperty(key)) locals[key] = val;
  });
  return locals;
};

/**
 * Simple way to emit ready.
 *
 * @api public
 */

exports.ready = function(){
  this.emit('ready');
};

/**
 * Wrap the initialize method in an exists check, so we don't have to do it for
 * every single integration.
 *
 * @api private
 */

exports._wrapInitialize = function(){
  var initialize = this.initialize;
  this.initialize = function(){
    this.debug('initialize');
    this._initialized = true;
    var ret = initialize.apply(this, arguments);
    this.emit('initialize');
    return ret;
  };

  if (this._assumesPageview) this.initialize = after(2, this.initialize);
};

/**
 * Wrap the page method to call `initialize` instead if the integration assumes
 * a pageview.
 *
 * @api private
 */

exports._wrapPage = function(){
  var page = this.page;
  this.page = function(){
    if (this._assumesPageview && !this._initialized) {
      return this.initialize.apply(this, arguments);
    }

    return page.apply(this, arguments);
  };
};

/**
 * Wrap the track method to call other ecommerce methods if available depending
 * on the `track.event()`.
 *
 * @api private
 */

exports._wrapTrack = function(){
  var t = this.track;
  this.track = function(track){
    var event = track.event();
    var called;
    var ret;

    for (var method in events) {
      if (has.call(events, method)) {
        var regexp = events[method];
        if (!this[method]) continue;
        if (!regexp.test(event)) continue;
        ret = this[method].apply(this, arguments);
        called = true;
        break;
      }
    }

    if (!called) ret = t.apply(this, arguments);
    return ret;
  };
};

/**
 * Determine the type of the option passed to `#map`
 *
 * @api private
 * @param {Object|Object[]} mapping
 * @return {String} mappingType
 */

function getMappingType(mapping) {
  if (is.array(mapping)) {
    return every(isMixed, mapping) ? 'mixed' : 'array';
  }
  if (is.object(mapping)) return 'map';
  return 'unknown';
}

/**
 * Determine if item in mapping array is a valid "mixed" type value
 *
 * Must be an object with properties "key" (of type string)
 * and "value" (of any type)
 *
 * @api private
 * @param {*} item
 * @return {Boolean}
 */

function isMixed(item) {
  if (!is.object(item)) return false;
  if (!is.string(item.key)) return false;
  if (!has.call(item, 'value')) return false;
  return true;
}

/**
 * TODO: Document me
 *
 * @api private
 * @param {Object} attrs
 * @param {Function} fn
 * @return {Image}
 */

function loadImage(attrs, fn){
  fn = fn || function(){};
  var img = new Image();
  img.onerror = error(fn, 'failed to load pixel', img);
  img.onload = function(){ fn(); };
  img.src = attrs.src;
  img.width = 1;
  img.height = 1;
  return img;
}

/**
 * TODO: Document me
 *
 * @api private
 * @param {Function} fn
 * @param {string} message
 * @param {Element} img
 * @return {Function}
 */

function error(fn, message, img){
  return function(e){
    e = e || window.event;
    var err = new Error(message);
    err.event = e;
    err.source = img;
    fn(err);
  };
}

/**
 * Render template + locals into an `attrs` object.
 *
 * @api private
 * @param {Object} template
 * @param {Object} locals
 * @return {Object}
 */

function render(template, locals){
  return foldl(function(attrs, val, key) {
    attrs[key] = val.replace(/\{\{\ *(\w+)\ *\}\}/g, function(_, $1){
      return locals[$1];
    });
    return attrs;
  }, {}, template.attrs);
}

}, {"emitter":9,"after":11,"each":91,"analytics-events":92,"fmt":93,"foldl":19,"load-iframe":94,"load-script":95,"to-no-case":96,"next-tick":60,"every":97,"is":98}],
91: [function(require, module, exports) {

/**
 * Module dependencies.
 */

try {
  var type = require('type');
} catch (err) {
  var type = require('component-type');
}

var toFunction = require('to-function');

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`
 * in optional context `ctx`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @param {Object} [ctx]
 * @api public
 */

module.exports = function(obj, fn, ctx){
  fn = toFunction(fn);
  ctx = ctx || this;
  switch (type(obj)) {
    case 'array':
      return array(obj, fn, ctx);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn, ctx);
      return object(obj, fn, ctx);
    case 'string':
      return string(obj, fn, ctx);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function string(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function object(obj, fn, ctx) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn.call(ctx, key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function array(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj[i], i);
  }
}

}, {"type":99,"component-type":99,"to-function":77}],
99: [function(require, module, exports) {

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

}, {}],
92: [function(require, module, exports) {

module.exports = {
  removedProduct: /^[ _]?removed[ _]?product[ _]?$/i,
  viewedProduct: /^[ _]?viewed[ _]?product[ _]?$/i,
  viewedProductCategory: /^[ _]?viewed[ _]?product[ _]?category[ _]?$/i,
  addedProduct: /^[ _]?added[ _]?product[ _]?$/i,
  completedOrder: /^[ _]?completed[ _]?order[ _]?$/i,
  startedOrder: /^[ _]?started[ _]?order[ _]?$/i,
  updatedOrder: /^[ _]?updated[ _]?order[ _]?$/i,
  refundedOrder: /^[ _]?refunded?[ _]?order[ _]?$/i,
  viewedProductDetails: /^[ _]?viewed[ _]?product[ _]?details?[ _]?$/i,
  clickedProduct: /^[ _]?clicked[ _]?product[ _]?$/i,
  viewedPromotion: /^[ _]?viewed[ _]?promotion?[ _]?$/i,
  clickedPromotion: /^[ _]?clicked[ _]?promotion?[ _]?$/i,
  viewedCheckoutStep: /^[ _]?viewed[ _]?checkout[ _]?step[ _]?$/i,
  completedCheckoutStep: /^[ _]?completed[ _]?checkout[ _]?step[ _]?$/i
};

}, {}],
93: [function(require, module, exports) {

/**
 * toString.
 */

var toString = window.JSON
  ? JSON.stringify
  : function(_){ return String(_); };

/**
 * Export `fmt`
 */

module.exports = fmt;

/**
 * Formatters
 */

fmt.o = toString;
fmt.s = String;
fmt.d = parseInt;

/**
 * Format the given `str`.
 *
 * @param {String} str
 * @param {...} args
 * @return {String}
 * @api public
 */

function fmt(str){
  var args = [].slice.call(arguments, 1);
  var j = 0;

  return str.replace(/%([a-z])/gi, function(_, f){
    return fmt[f]
      ? fmt[f](args[j++])
      : _ + f;
  });
}

}, {}],
94: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var onload = require('script-onload');
var tick = require('next-tick');
var type = require('type');

/**
 * Expose `loadScript`.
 *
 * @param {Object} options
 * @param {Function} fn
 * @api public
 */

module.exports = function loadIframe(options, fn){
  if (!options) throw new Error('Cant load nothing...');

  // Allow for the simplest case, just passing a `src` string.
  if ('string' == type(options)) options = { src : options };

  var https = document.location.protocol === 'https:' ||
              document.location.protocol === 'chrome-extension:';

  // If you use protocol relative URLs, third-party scripts like Google
  // Analytics break when testing with `file:` so this fixes that.
  if (options.src && options.src.indexOf('//') === 0) {
    options.src = https ? 'https:' + options.src : 'http:' + options.src;
  }

  // Allow them to pass in different URLs depending on the protocol.
  if (https && options.https) options.src = options.https;
  else if (!https && options.http) options.src = options.http;

  // Make the `<iframe>` element and insert it before the first iframe on the
  // page, which is guaranteed to exist since this Javaiframe is running.
  var iframe = document.createElement('iframe');
  iframe.src = options.src;
  iframe.width = options.width || 1;
  iframe.height = options.height || 1;
  iframe.style.display = 'none';

  // If we have a fn, attach event handlers, even in IE. Based off of
  // the Third-Party Javascript script loading example:
  // https://github.com/thirdpartyjs/thirdpartyjs-code/blob/master/examples/templates/02/loading-files/index.html
  if ('function' == type(fn)) {
    onload(iframe, fn);
  }

  tick(function(){
    // Append after event listeners are attached for IE.
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(iframe, firstScript);
  });

  // Return the iframe element in case they want to do anything special, like
  // give it an ID or attributes.
  return iframe;
};
}, {"script-onload":100,"next-tick":60,"type":50}],
100: [function(require, module, exports) {

// https://github.com/thirdpartyjs/thirdpartyjs-code/blob/master/examples/templates/02/loading-files/index.html

/**
 * Invoke `fn(err)` when the given `el` script loads.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api public
 */

module.exports = function(el, fn){
  return el.addEventListener
    ? add(el, fn)
    : attach(el, fn);
};

/**
 * Add event listener to `el`, `fn()`.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function add(el, fn){
  el.addEventListener('load', function(_, e){ fn(null, e); }, false);
  el.addEventListener('error', function(e){
    var err = new Error('script error "' + el.src + '"');
    err.event = e;
    fn(err);
  }, false);
}

/**
 * Attach event.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function attach(el, fn){
  el.attachEvent('onreadystatechange', function(e){
    if (!/complete|loaded/.test(el.readyState)) return;
    fn(null, e);
  });
  el.attachEvent('onerror', function(e){
    var err = new Error('failed to load the script "' + el.src + '"');
    err.event = e || window.event;
    fn(err);
  });
}

}, {}],
95: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var onload = require('script-onload');
var tick = require('next-tick');
var type = require('type');

/**
 * Expose `loadScript`.
 *
 * @param {Object} options
 * @param {Function} fn
 * @api public
 */

module.exports = function loadScript(options, fn){
  if (!options) throw new Error('Cant load nothing...');

  // Allow for the simplest case, just passing a `src` string.
  if ('string' == type(options)) options = { src : options };

  var https = document.location.protocol === 'https:' ||
              document.location.protocol === 'chrome-extension:';

  // If you use protocol relative URLs, third-party scripts like Google
  // Analytics break when testing with `file:` so this fixes that.
  if (options.src && options.src.indexOf('//') === 0) {
    options.src = https ? 'https:' + options.src : 'http:' + options.src;
  }

  // Allow them to pass in different URLs depending on the protocol.
  if (https && options.https) options.src = options.https;
  else if (!https && options.http) options.src = options.http;

  // Make the `<script>` element and insert it before the first script on the
  // page, which is guaranteed to exist since this Javascript is running.
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = options.src;

  // If we have a fn, attach event handlers, even in IE. Based off of
  // the Third-Party Javascript script loading example:
  // https://github.com/thirdpartyjs/thirdpartyjs-code/blob/master/examples/templates/02/loading-files/index.html
  if ('function' == type(fn)) {
    onload(script, fn);
  }

  tick(function(){
    // Append after event listeners are attached for IE.
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  });

  // Return the script element in case they want to do anything special, like
  // give it an ID or attributes.
  return script;
};
}, {"script-onload":100,"next-tick":60,"type":50}],
96: [function(require, module, exports) {

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();
  if (hasSeparator.test(string)) return unseparate(string).toLowerCase();
  return uncamelize(string).toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
}, {}],
97: [function(require, module, exports) {
'use strict';

/**
 * Module dependencies.
 */

// FIXME: Hacky workaround for Duo
var each; try { each = require('@ndhoule/each'); } catch(e) { each = require('each'); }

/**
 * Check if a predicate function returns `true` for all values in a `collection`.
 * Checks owned, enumerable values and exits early when `predicate` returns
 * `false`.
 *
 * @name every
 * @param {Function} predicate The function used to test values.
 * @param {Array|Object|string} collection The collection to search.
 * @return {boolean} True if all values passes the predicate test, otherwise false.
 * @example
 * var isEven = function(num) { return num % 2 === 0; };
 *
 * every(isEven, []); // => true
 * every(isEven, [1, 2]); // => false
 * every(isEven, [2, 4, 6]); // => true
 */

var every = function every(predicate, collection) {
  if (typeof predicate !== 'function') {
    throw new TypeError('`predicate` must be a function but was a ' + typeof predicate);
  }

  var result = true;

  each(function(val, key, collection) {
    result = !!predicate(val, key, collection);

    // Exit early
    if (!result) {
      return false;
    }
  }, collection);

  return result;
};

/**
 * Exports.
 */

module.exports = every;

}, {"each":69}],
98: [function(require, module, exports) {

var isEmpty = require('is-empty');

try {
  var typeOf = require('type');
} catch (e) {
  var typeOf = require('component-type');
}


/**
 * Types.
 */

var types = [
  'arguments',
  'array',
  'boolean',
  'date',
  'element',
  'function',
  'null',
  'number',
  'object',
  'regexp',
  'string',
  'undefined'
];


/**
 * Expose type checkers.
 *
 * @param {Mixed} value
 * @return {Boolean}
 */

for (var i = 0, type; type = types[i]; i++) exports[type] = generate(type);


/**
 * Add alias for `function` for old browsers.
 */

exports.fn = exports['function'];


/**
 * Expose `empty` check.
 */

exports.empty = isEmpty;


/**
 * Expose `nan` check.
 */

exports.nan = function (val) {
  return exports.number(val) && val != val;
};


/**
 * Generate a type checker.
 *
 * @param {String} type
 * @return {Function}
 */

function generate (type) {
  return function (value) {
    return type === typeOf(value);
  };
}
}, {"is-empty":49,"type":50,"component-type":50}],
88: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var domify = require('domify');
var each = require('each');
var includes = require('includes');

/**
 * Mix in emitter.
 */

/* eslint-disable new-cap */
Emitter(exports);
/* eslint-enable new-cap */

/**
 * Add a new option to the integration by `key` with default `value`.
 *
 * @api public
 * @param {string} key
 * @param {*} value
 * @return {Integration}
 */

exports.option = function(key, value){
  this.prototype.defaults[key] = value;
  return this;
};

/**
 * Add a new mapping option.
 *
 * This will create a method `name` that will return a mapping for you to use.
 *
 * @api public
 * @param {string} name
 * @return {Integration}
 * @example
 * Integration('My Integration')
 *   .mapping('events');
 *
 * new MyIntegration().track('My Event');
 *
 * .track = function(track){
 *   var events = this.events(track.event());
 *   each(events, send);
 *  };
 */

exports.mapping = function(name){
  this.option(name, []);
  this.prototype[name] = function(key){
    return this.map(this.options[name], key);
  };
  return this;
};

/**
 * Register a new global variable `key` owned by the integration, which will be
 * used to test whether the integration is already on the page.
 *
 * @api public
 * @param {string} key
 * @return {Integration}
 */

exports.global = function(key){
  this.prototype.globals.push(key);
  return this;
};

/**
 * Mark the integration as assuming an initial pageview, so to defer loading
 * the script until the first `page` call, noop the first `initialize`.
 *
 * @api public
 * @return {Integration}
 */

exports.assumesPageview = function(){
  this.prototype._assumesPageview = true;
  return this;
};

/**
 * Mark the integration as being "ready" once `load` is called.
 *
 * @api public
 * @return {Integration}
 */

exports.readyOnLoad = function(){
  this.prototype._readyOnLoad = true;
  return this;
};

/**
 * Mark the integration as being "ready" once `initialize` is called.
 *
 * @api public
 * @return {Integration}
 */

exports.readyOnInitialize = function(){
  this.prototype._readyOnInitialize = true;
  return this;
};

/**
 * Define a tag to be loaded.
 *
 * @api public
 * @param {string} [name='library'] A nicename for the tag, commonly used in
 * #load. Helpful when the integration has multiple tags and you need a way to
 * specify which of the tags you want to load at a given time.
 * @param {String} str DOM tag as string or URL.
 * @return {Integration}
 */

exports.tag = function(name, tag){
  if (tag == null) {
    tag = name;
    name = 'library';
  }
  this.prototype.templates[name] = objectify(tag);
  return this;
};

/**
 * Given a string, give back DOM attributes.
 *
 * Do it in a way where the browser doesn't load images or iframes. It turns
 * out domify will load images/iframes because whenever you construct those
 * DOM elements, the browser immediately loads them.
 *
 * @api private
 * @param {string} str
 * @return {Object}
 */

function objectify(str) {
  // replace `src` with `data-src` to prevent image loading
  str = str.replace(' src="', ' data-src="');

  var el = domify(str);
  var attrs = {};

  each(el.attributes, function(attr){
    // then replace it back
    var name = attr.name === 'data-src' ? 'src' : attr.name;
    if (!includes(attr.name + '=', str)) return;
    attrs[name] = attr.value;
  });

  return {
    type: el.tagName.toLowerCase(),
    attrs: attrs
  };
}

}, {"emitter":9,"domify":101,"each":91,"includes":75}],
101: [function(require, module, exports) {

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Tests for browser support.
 */

var div = document.createElement('div');
// Setup
div.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
// Make sure that link elements get serialized correctly by innerHTML
// This requires a wrapper element in IE
var innerHTMLBug = !div.getElementsByTagName('link').length;
div = undefined;

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.polyline =
map.ellipse =
map.polygon =
map.circle =
map.text =
map.line =
map.path =
map.rect =
map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

}, {}],
4: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var clearAjax = require('clear-ajax');
var clearTimeouts = require('clear-timeouts');
var clearIntervals = require('clear-intervals');
var clearListeners = require('clear-listeners');
var clearGlobals = require('clear-globals');
var clearImages = require('clear-images');
var clearScripts = require('clear-scripts');
var clearCookies = require('clear-cookies');

/**
 * Reset initial state.
 *
 * @api public
 */

module.exports = function(){
  clearAjax();
  clearTimeouts();
  clearIntervals();
  clearListeners();
  clearGlobals();
  clearImages();
  clearScripts();
  clearCookies();
};
}, {"clear-ajax":102,"clear-timeouts":103,"clear-intervals":104,"clear-listeners":105,"clear-globals":106,"clear-images":107,"clear-scripts":108,"clear-cookies":109}],
102: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var each = require('each');

/**
 * Original send method.
 */

var send = XMLHttpRequest.prototype.send;

/**
 * Requests made.
 */

var requests = [];

/**
 * Clear all active AJAX requests.
 * 
 * @api public
 */

exports = module.exports = function(){
  each(requests, function(request){
    try {
      request.onload = noop;
      request.onerror = noop;
      request.onabort = noop;
      request.abort();
    } catch (e) {}
  });
  requests.length = [];
};

/**
 * Capture AJAX requests.
 *
 * @api public
 */

exports.bind = function(){
  XMLHttpRequest.prototype.send = function(){
    requests.push(this);
    return send.apply(this, arguments);
  };
};

/**
 * Reset `XMLHttpRequest` back to normal.
 *
 * @api public
 */

exports.unbind = function(){
  XMLHttpRequest.prototype.send = send;
};

/**
 * Automatically bind.
 */

exports.bind();

/**
 * Noop.
 *
 * @api private
 */

function noop(){}
}, {"each":91}],
103: [function(require, module, exports) {

/**
 * Previous
 */

var prev = 0;

/**
 * Noop
 */

var noop = Function.prototype;

/**
 * Clear all timeouts
 *
 * @api public
 */

module.exports = function(){
  var tmp, i;
  tmp = i = setTimeout(noop);
  while (prev < i) clearTimeout(i--);
  prev = tmp;
};

}, {}],
104: [function(require, module, exports) {

/**
 * Prev
 */

var prev = 0;

/**
 * Noop
 */

var noop = Function.prototype;

/**
 * Clear all intervals.
 *
 * @api public
 */

module.exports = function(){
  var tmp, i;
  tmp = i = setInterval(noop);
  while (prev < i) clearInterval(i--);
  prev = tmp;
};

}, {}],
105: [function(require, module, exports) {

/**
 * Window event listeners.
 */

var listeners = [];

/**
 * Original window functions.
 */

var on = window.addEventListener ? 'addEventListener' : 'attachEvent';
var off = window.removeEventListener ? 'removeEventListener' : 'detachEvent';
var onFn = window[on];
var offFn = window[off];

/**
 * Clear event listeners.
 *
 * @api public
 */

exports = module.exports = function(){
  var i = listeners.length;
  while (i--) {
    window[on].apply
      ? window[on].apply(window, listeners[i])
      : window[on](listeners[i][0], listeners[i][1]); // IE
  }
  listeners.length = 0;
};

/**
 * Wrap window.addEventListener and window.removeEventListener
 * to be able to cleanup all event listeners for testing.
 *
 * @api public
 */

exports.bind = function(){
  window[on] = function(){
    listeners.push(arguments);
    return onFn.apply
      ? onFn.apply(window, arguments)
      : onFn(arguments[0], arguments[1]); // IE
  };

  window[off] = function(name, listener, useCapture){
    for (var i = 0, n = listeners.length; i < n; i++) {
      if (name !== listeners[i][0]) continue;
      if (listener !== listeners[i][1]) continue;
      if (arguments.length > 2 && useCapture !== listeners[i][2]) continue;
      listeners.splice(i, 1);
      break;
    }
    return offFn.apply
      ? offFn.apply(window, arguments)
      : offFn(arguments[0], arguments[1]); // IE
  };
};


/**
 * Reset window back to normal.
 *
 * @api public
 */

exports.unbind = function(){
  listeners.length = 0;
  window[on] = onFn;
  window[off] = offFn;
};

/**
 * Automatically override.
 */

exports.bind();
}, {}],
106: [function(require, module, exports) {

/**
 * Objects we want to keep track of initial properties for.
 */

var globals = {
  'window': {},
  'document': {},
  'XMLHttpRequest': {}
};

/**
 * Capture initial state of `window`.
 *
 * Note, `window.addEventListener` is overritten already,
 * from `clearListeners`. But this is desired behavior.
 */

globals.window.removeEventListener = window.removeEventListener;
globals.window.addEventListener = window.addEventListener;
globals.window.setTimeout = window.setTimeout;
globals.window.setInterval = window.setInterval;
globals.window.onerror = null;
globals.window.onload = null;

/**
 * Capture initial state of `document`.
 */

globals.document.write = document.write;
globals.document.appendChild = document.appendChild;
globals.document.removeChild = document.removeChild;

/**
 * Capture the initial state of `XMLHttpRequest`.
 */

if ('undefined' != typeof XMLHttpRequest) {
  globals.XMLHttpRequest.open = XMLHttpRequest.prototype.open;
}

/**
 * Reset initial state.
 *
 * @api public
 */

module.exports = function(){
  copy(globals.window, window);
  copy(globals.XMLHttpRequest, XMLHttpRequest.prototype);
  copy(globals.document, document);
};

/**
 * Reset properties on object.
 *
 * @param {Object} source
 * @param {Object} target
 * @api private
 */

function copy(source, target){
  for (var name in source) {
    if (source.hasOwnProperty(name)) {
      target[name] = source[name];
    }
  }
}
}, {}],
107: [function(require, module, exports) {

/**
 * Created images.
 */

var images = [];

/**
 * Keep track of original `Image`.
 */

var Original = window.Image;

/**
 * Image override that keeps track of images.
 *
 * Careful though, `img instance Override` isn't true.
 *
 * @api private
 */

function Override() {
  var img = new Original;
  images.push(img);
  return img;
}

/**
 * Clear `onload` for each image.
 *
 * @api public
 */

exports = module.exports = function(){
  var noop = function(){};
  for (var i = 0, n = images.length; i < n; i++) {
    images[i].onload = noop;
  }
  images.length = 0;
};

/**
 * Override `window.Image` to keep track of images,
 * so we can clear `onload`.
 *
 * @api public
 */

exports.bind = function(){
  window.Image = Override;
};

/**
 * Set `window.Image` back to normal.
 *
 * @api public
 */

exports.unbind = function(){
  window.Image = Original;
  images.length = 0;
};

/**
 * Automatically override.
 */

exports.bind();
}, {}],
108: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var indexOf = require('indexof');
var query = require('query');
var each = require('each');

/**
 * Initial scripts.
 */

var initialScripts = [];

/**
 * Remove all scripts not initially present.
 *
 * @param {Function} [match] Only remove ones that return true
 * @api public
 */

exports = module.exports = function(match){
  match = match || saucelabs;
  var finalScripts = query.all('script');
  each(finalScripts, function(script){
    if (-1 != indexOf(initialScripts, script)) return;
    if (!script.parentNode) return;
    if (!match(script)) return;
    script.parentNode.removeChild(script);
  });
};

/**
 * Capture initial scripts, the ones not to remove.
 *
 * @api public
 */

exports.bind = function(scripts){
  initialScripts = scripts || query.all('script');
};

/**
 * Default matching function, ignores saucelabs jsonp scripts.
 *
 * @param {Script} script
 * @api private
 * @return {Boolean}
 */

function saucelabs(script) {
  return !script.src.match(/localtunnel\.me\/saucelabs|\/duotest/);
};

/**
 * Automatically bind.
 */

exports.bind();

}, {"indexof":33,"query":110,"each":91}],
110: [function(require, module, exports) {
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

}, {}],
109: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var cookie = require('cookie');

/**
 * Clear cookies.
 */

module.exports = function(){
  var cookies = cookie();
  for (var name in cookies) {
    cookie(name, '', { path: '/' });
  }
};
}, {"cookie":68}],
5: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var indexOf = require('indexof');
var assert = require('assert');
var domify = require('domify');
var stub = require('stub');
var each = require('each');
var keys = require('keys');
var fmt = require('fmt');
var spy = require('spy');
var is = require('is');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Integration testing plugin.
 *
 * @param {Analytics} analytics
 */

function plugin(analytics) {
  analytics.spies = [];

  /**
   * Spy on a `method` of host `object`.
   *
   * @param {Object} object
   * @param {String} method
   * @return {Analytics}
   */

  analytics.spy = function(object, method){
    var s = spy(object, method);
    this.spies.push(s);
    return this;
  };

  /**
   * Stub a `method` of host `object`.
   *
   * @param {Object} object
   * @param {String} method
   * @param {Function} fn A function to be called in place of the stubbed method.
   * @return {Analytics}
   */

  analytics.stub = function(object, method, fn){
    var s = stub(object, method, fn);
    this.spies.push(s);
    return this;
  };

  /**
   * Restore all spies.
   *
   * @return {Analytics}
   */

  analytics.restore = function(){
    each(this.spies, function(spy, i){
      spy.restore();
    });
    this.spies = [];
    return this;
  };

  /**
   * Assert that a `spy` was called with `args...`
   *
   * @param {Spy} spy
   * @param {Mixed} args... (optional)
   * @return {Analytics}
   */

  analytics.called = function(spy){
    assert(
      ~indexOf(this.spies, spy),
      'You must call `.spy(object, method)` prior to calling `.called()`.'
    );
    assert(spy.called, fmt('Expected "%s" to have been called.', spy.name));

    var args = [].slice.call(arguments, 1);
    if (!args.length) return this;

    assert(
      spy.got.apply(spy, args), fmt(''
      + 'Expected "%s" to be called with "%s", \n'
      + 'but it was called with "%s".'
      , spy.name
      , JSON.stringify(args, null, 2)
      , JSON.stringify(spy.args[0], null, 2))
    );

    return this;
  };

  /**
   * Assert that a `spy` was not called with `args...`.
   *
   * @param {Spy} spy
   * @param {Mixed} args... (optional)
   * @return {Analytics}
   */

  analytics.didNotCall = function(spy){
    assert(
      ~indexOf(this.spies, spy),
      'You must call `.spy(object, method)` prior to calling `.didNotCall()`.'
    );

    var args = [].slice.call(arguments, 1);
    if (!args.length) {
      assert(
        !spy.called,
        fmt('Expected "%s" not to have been called.', spy.name)
      );
    } else {
      assert(!spy.got.apply(spy, args), fmt(''
        + 'Expected "%s" not to be called with "%o", '
        + 'but it was called with "%o".'
        , spy.name
        , args
        , spy.args[0])
      );
    }

    return this;
  };

  /**
   * Assert that a `spy` was not called 1 time.
   *
   * @param {Spy} spy
   * @return {Analytics}
   */

  analytics.calledOnce = calledTimes(1);

  /**
   * Assert that a `spy` was called 2 times.
   *
   * @param {Spy} spy
   * @return {Analytics}
   */

  analytics.calledTwice = calledTimes(2);

  /**
   * Assert that a `spy` was called 3 times.
   *
   * @param {Spy} spy
   * @return {Analytics}
   */

  analytics.calledThrice = calledTimes(2);

  /**
   * Generate a function for asserting a spy
   * was called `n` times.
   *
   * @param {Number} n
   * @return {Function}
   */

  function calledTimes(n) {
    return function(spy) {
      var m = spy.args.length;
      assert(
        n == m,
        fmt(''
          + 'Expected "%s" to have been called %s time%s, '
          + 'but it was only called %s time%s.'
          , spy.name, n, 1 != n ? 's' : '', m, 1 != m ? 's' : '')
      );
    }
  }

  /**
   * Assert that a `spy` returned `value`.
   *
   * @param {Spy} spy
   * @param {Mixed} value
   * @return {Tester}
   */

  analytics.returned = function(spy, value){
    assert(
      ~indexOf(this.spies, spy),
      'You must call `.spy(object, method)` prior to calling `.returned()`.'
    );
    assert(
      spy.returned(value),
      fmt('Expected "%s" to have returned "%o".', spy.name, value)
    );

    return this;
  };

  /**
   * Assert that a `spy` did not return `value`.
   *
   * @param {Spy} spy
   * @param {Mixed} value
   * @return {Tester}
   */

  analytics.didNotReturn = function(spy, value){
    assert(
      ~indexOf(this.spies, spy),
      'You must call `.spy(object, method)` prior to calling `.didNotReturn()`.'
    );
    assert(
      !spy.returned(value),
      fmt('Expected "%s" not to have returned "%o".', spy.name, value)
    );

    return this;
  };

  /**
   * Call `reset` on the integration.
   *
   * @return {Analytics}
   */

  analytics.reset = function(){
    this.user().reset();
    this.group().reset();
    return this;
  };

  /**
   * Compare `int` against `test`.
   *
   * To double-check that they have the right defaults, globals, and config.
   *
   * @param {Function} a actual integration constructor
   * @param {Function} b test integration constructor
   */

  analytics.compare = function(a, b){
    a = new a;
    b = new b;
    // name
    assert(
      a.name === b.name,
      fmt('Expected name to be "%s", but it was "%s".', b.name, a.name)
    );

    // options
    var x = a.defaults;
    var y = b.defaults;
    for (var key in y) {
      assert(
        x.hasOwnProperty(key),
        fmt('The integration does not have an option named "%s".', key)
      );
      assert.deepEqual(
        x[key], y[key],
        fmt(
          'Expected option "%s" to default to "%s", but it defaults to "%s".',
          key, y[key], x[key]
        )
      );
    }

    // globals
    var x = a.globals;
    var y = b.globals;
    each(y, function(key){
      assert(
        indexOf(x, key) !== -1,
        fmt('Expected global "%s" to be registered.', key)
      );
    });

    // assumesPageview
    assert(
      a._assumesPageview == b._assumesPageview,
      'Expected the integration to assume a pageview.'
    );

    // readyOnInitialize
    assert(
      a._readyOnInitialize == b._readyOnInitialize,
      'Expected the integration to be ready on initialize.'
    );

    // readyOnLoad
    assert(
      a._readyOnLoad == b._readyOnLoad,
      'Expected integration to be ready on load.'
    );
  };

  /**
   * Assert the integration being tested loads.
   *
   * @param {Integration} integration
   * @param {Function} done
   */

  analytics.load = function(integration, done){
    analytics.assert(!integration.loaded(), 'Expected `integration.loaded()` to be false before loading.');
    analytics.once('ready', function(){
      analytics.assert(integration.loaded(), 'Expected `integration.loaded()` to be true after loading.');
      done();
    });
    analytics.initialize();
    analytics.page({}, { Marketo: true });
  };

  /**
   * Assert a script, image, or iframe was loaded.
   *
   * @param {String} str DOM template
   */
  
  analytics.loaded = function(integration, str){
    if ('string' == typeof integration) {
      str = integration;
      integration = this.integration();
    }

    var tags = [];

    assert(
      ~indexOf(this.spies, integration.load),
      'You must call `.spy(integration, \'load\')` prior to calling `.loaded()`.'
    );

    // collect all Image or HTMLElement objects
    // in an array of stringified elements, for human-readable assertions.
    each(integration.load.returns, function(el){
      var tag = {};
      if (el instanceof HTMLImageElement) {
        tag.type = 'img';
        tag.attrs = { src: el.src };
      } else if (is.element(el)) {
        tag.type = el.tagName.toLowerCase();
        tag.attrs = attributes(el);
        switch (tag.type) {
          case 'script':
            // don't care about these properties.
            delete tag.attrs.type;
            delete tag.attrs.async;
            delete tag.attrs.defer;
            break;
        }
      }
      if (tag.type) tags.push(stringify(tag.type, tag.attrs));
    });

    // normalize formatting
    var tag = objectify(str);
    var expected = stringify(tag.type, tag.attrs);

    if (!tags.length) {
      assert(false, fmt('No tags were returned.\nExpected %s.', expected));
    } else {
      // show the closest match
      assert(
        indexOf(tags, expected) !== -1,
        fmt('\nExpected %s.\nFound %s', expected, tags.join('\n'))
      );
    }
  };

  /**
   * Get current integration.
   *
   * @return {Integration}
   */
  
  analytics.integration = function(){
    for (var name in this._integrations) return this._integrations[name];
  };

  /**
   * Assert a `value` is truthy.
   *
   * @param {Mixed} value
   * @return {Tester}
   */

  analytics.assert = assert;

  /**
   * Expose all of the methods on `assert`.
   *
   * @param {Mixed} args...
   * @return {Tester}
   */

  each(keys(assert), function(key){
    analytics[key] = function(){
      var args = [].slice.call(arguments);
      assert[key].apply(assert, args);
      return this;
    };
  });

  /**
   * Create a DOM node string.
   */

  function stringify(name, attrs) {
    var str = [];
    str.push('<' + name);
    each(attrs, function(key, val){
      str.push(' ' + key + '="' + val + '"');
    });
    str.push('>');
    // block
    if ('img' !== name) str.push('</' + name + '>');
    return str.join('');
  }

  /**
   * DOM node attributes as object.
   *
   * @param {Element}
   * @return {Object}
   */
  
  function attributes(node) {
    var obj = {};
    each(node.attributes, function(attr){
      obj[attr.name] = attr.value;
    });
    return obj;
  }

  /**
   * Given a string, give back DOM attributes.
   *
   * @param {String} str
   * @return {Object}
   */

  function objectify(str) {
    // replace `src` with `data-src` to prevent image loading
    str = str.replace(' src="', ' data-src="');
    
    var el = domify(str);
    var attrs = {};
    
    each(el.attributes, function(attr){
      // then replace it back
      var name = 'data-src' == attr.name ? 'src' : attr.name;
      attrs[name] = attr.value;
    });
    
    return {
      type: el.tagName.toLowerCase(),
      attrs: attrs
    };
  }
}
}, {"indexof":33,"assert":111,"domify":112,"stub":113,"each":91,"keys":114,"fmt":93,"spy":115,"is":47}],
111: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var equals = require('equals');
var fmt = require('fmt');
var stack = require('stack');

/**
 * Assert `expr` with optional failure `msg`.
 *
 * @param {Mixed} expr
 * @param {String} [msg]
 * @api public
 */

module.exports = exports = function (expr, msg) {
  if (expr) return;
  throw error(msg || message());
};

/**
 * Assert `actual` is weak equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.equal = function (actual, expected, msg) {
  if (actual == expected) return;
  throw error(msg || fmt('Expected %o to equal %o.', actual, expected), actual, expected);
};

/**
 * Assert `actual` is not weak equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.notEqual = function (actual, expected, msg) {
  if (actual != expected) return;
  throw error(msg || fmt('Expected %o not to equal %o.', actual, expected));
};

/**
 * Assert `actual` is deep equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.deepEqual = function (actual, expected, msg) {
  if (equals(actual, expected)) return;
  throw error(msg || fmt('Expected %o to deeply equal %o.', actual, expected), actual, expected);
};

/**
 * Assert `actual` is not deep equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.notDeepEqual = function (actual, expected, msg) {
  if (!equals(actual, expected)) return;
  throw error(msg || fmt('Expected %o not to deeply equal %o.', actual, expected));
};

/**
 * Assert `actual` is strict equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.strictEqual = function (actual, expected, msg) {
  if (actual === expected) return;
  throw error(msg || fmt('Expected %o to strictly equal %o.', actual, expected), actual, expected);
};

/**
 * Assert `actual` is not strict equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.notStrictEqual = function (actual, expected, msg) {
  if (actual !== expected) return;
  throw error(msg || fmt('Expected %o not to strictly equal %o.', actual, expected));
};

/**
 * Assert `block` throws an `error`.
 *
 * @param {Function} block
 * @param {Function} [error]
 * @param {String} [msg]
 * @api public
 */

exports.throws = function (block, err, msg) {
  var threw;
  try {
    block();
  } catch (e) {
    threw = e;
  }

  if (!threw) throw error(msg || fmt('Expected %s to throw an error.', block.toString()));
  if (err && !(threw instanceof err)) {
    throw error(msg || fmt('Expected %s to throw an %o.', block.toString(), err));
  }
};

/**
 * Assert `block` doesn't throw an `error`.
 *
 * @param {Function} block
 * @param {Function} [error]
 * @param {String} [msg]
 * @api public
 */

exports.doesNotThrow = function (block, err, msg) {
  var threw;
  try {
    block();
  } catch (e) {
    threw = e;
  }

  if (threw) throw error(msg || fmt('Expected %s not to throw an error.', block.toString()));
  if (err && (threw instanceof err)) {
    throw error(msg || fmt('Expected %s not to throw an %o.', block.toString(), err));
  }
};

/**
 * Create a message from the call stack.
 *
 * @return {String}
 * @api private
 */

function message() {
  if (!Error.captureStackTrace) return 'assertion failed';
  var callsite = stack()[2];
  var fn = callsite.getFunctionName();
  var file = callsite.getFileName();
  var line = callsite.getLineNumber() - 1;
  var col = callsite.getColumnNumber() - 1;
  var src = get(file);
  line = src.split('\n')[line].slice(col);
  var m = line.match(/assert\((.*)\)/);
  return m && m[1].trim();
}

/**
 * Load contents of `script`.
 *
 * @param {String} script
 * @return {String}
 * @api private
 */

function get(script) {
  var xhr = new XMLHttpRequest;
  xhr.open('GET', script, false);
  xhr.send(null);
  return xhr.responseText;
}

/**
 * Error with `msg`, `actual` and `expected`.
 *
 * @param {String} msg
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @return {Error}
 */

function error(msg, actual, expected){
  var err = new Error(msg);
  err.showDiff = 3 == arguments.length;
  err.actual = actual;
  err.expected = expected;
  return err;
}

}, {"equals":116,"fmt":93,"stack":117}],
116: [function(require, module, exports) {
var type = require('jkroso-type')

// (any, any, [array]) -> boolean
function equal(a, b, memos){
  // All identical values are equivalent
  if (a === b) return true
  var fnA = types[type(a)]
  var fnB = types[type(b)]
  return fnA && fnA === fnB
    ? fnA(a, b, memos)
    : false
}

var types = {}

// (Number) -> boolean
types.number = function(a, b){
  return a !== a && b !== b/*Nan check*/
}

// (function, function, array) -> boolean
types['function'] = function(a, b, memos){
  return a.toString() === b.toString()
    // Functions can act as objects
    && types.object(a, b, memos)
    && equal(a.prototype, b.prototype)
}

// (date, date) -> boolean
types.date = function(a, b){
  return +a === +b
}

// (regexp, regexp) -> boolean
types.regexp = function(a, b){
  return a.toString() === b.toString()
}

// (DOMElement, DOMElement) -> boolean
types.element = function(a, b){
  return a.outerHTML === b.outerHTML
}

// (textnode, textnode) -> boolean
types.textnode = function(a, b){
  return a.textContent === b.textContent
}

// decorate `fn` to prevent it re-checking objects
// (function) -> function
function memoGaurd(fn){
  return function(a, b, memos){
    if (!memos) return fn(a, b, [])
    var i = memos.length, memo
    while (memo = memos[--i]) {
      if (memo[0] === a && memo[1] === b) return true
    }
    return fn(a, b, memos)
  }
}

types['arguments'] =
types['bit-array'] =
types.array = memoGaurd(arrayEqual)

// (array, array, array) -> boolean
function arrayEqual(a, b, memos){
  var i = a.length
  if (i !== b.length) return false
  memos.push([a, b])
  while (i--) {
    if (!equal(a[i], b[i], memos)) return false
  }
  return true
}

types.object = memoGaurd(objectEqual)

// (object, object, array) -> boolean
function objectEqual(a, b, memos) {
  if (typeof a.equal == 'function') {
    memos.push([a, b])
    return a.equal(b, memos)
  }
  var ka = getEnumerableProperties(a)
  var kb = getEnumerableProperties(b)
  var i = ka.length

  // same number of properties
  if (i !== kb.length) return false

  // although not necessarily the same order
  ka.sort()
  kb.sort()

  // cheap key test
  while (i--) if (ka[i] !== kb[i]) return false

  // remember
  memos.push([a, b])

  // iterate again this time doing a thorough check
  i = ka.length
  while (i--) {
    var key = ka[i]
    if (!equal(a[key], b[key], memos)) return false
  }

  return true
}

// (object) -> array
function getEnumerableProperties (object) {
  var result = []
  for (var k in object) if (k !== 'constructor') {
    result.push(k)
  }
  return result
}

module.exports = equal

}, {"jkroso-type":118}],
118: [function(require, module, exports) {

var toString = {}.toString
var DomNode = typeof window != 'undefined'
  ? window.Node
  : Function

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = exports = function(x){
  var type = typeof x
  if (type != 'object') return type
  type = types[toString.call(x)]
  if (type) return type
  if (x instanceof DomNode) switch (x.nodeType) {
    case 1:  return 'element'
    case 3:  return 'text-node'
    case 9:  return 'document'
    case 11: return 'document-fragment'
    default: return 'dom-node'
  }
}

var types = exports.types = {
  '[object Function]': 'function',
  '[object Date]': 'date',
  '[object RegExp]': 'regexp',
  '[object Arguments]': 'arguments',
  '[object Array]': 'array',
  '[object String]': 'string',
  '[object Null]': 'null',
  '[object Undefined]': 'undefined',
  '[object Number]': 'number',
  '[object Boolean]': 'boolean',
  '[object Object]': 'object',
  '[object Text]': 'text-node',
  '[object Uint8Array]': 'bit-array',
  '[object Uint16Array]': 'bit-array',
  '[object Uint32Array]': 'bit-array',
  '[object Uint8ClampedArray]': 'bit-array',
  '[object Error]': 'error',
  '[object FormData]': 'form-data',
  '[object File]': 'file',
  '[object Blob]': 'blob'
}

}, {}],
117: [function(require, module, exports) {

/**
 * Expose `stack()`.
 */

module.exports = stack;

/**
 * Return the stack.
 *
 * @return {Array}
 * @api public
 */

function stack() {
  var orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack){ return stack; };
  var err = new Error;
  Error.captureStackTrace(err, arguments.callee);
  var stack = err.stack;
  Error.prepareStackTrace = orig;
  return stack;
}
}, {}],
112: [function(require, module, exports) {

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Tests for browser support.
 */

var innerHTMLBug = false;
var bugTestDiv;
if (typeof document !== 'undefined') {
  bugTestDiv = document.createElement('div');
  // Setup
  bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
  // Make sure that link elements get serialized correctly by innerHTML
  // This requires a wrapper element in IE
  innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
  bugTestDiv = undefined;
}

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.polyline =
map.ellipse =
map.polygon =
map.circle =
map.text =
map.line =
map.path =
map.rect =
map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

}, {}],
113: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var merge = require('merge');
var eql = require('eql');

/**
 * Create a test stub with `obj`, `method`.
 *
 * Examples:
 *
 *      s = require('stub')({}, 'toString');
 *      s = require('stub')(document.write);
 *      s = require('stub')();
 *
 * @param {Object|Function} obj
 * @param {String} method
 * @return {Function}
 * @api public
 */

module.exports = function(obj, method){
  var fn = toFunction(arguments, stub);
  merge(stub, proto);
  stub.reset();
  stub.name = method;
  return stub;

  function stub(){
    var args = [].slice.call(arguments);
    var ret = fn(arguments);
    //stub.returns || stub.reset();
    stub.args.push(args);
    stub.returns.push(ret);
    stub.update();
    return ret;
  }
};

/**
 * Prototype.
 */

var proto = {};

/**
 * `true` if the stub was called with `args`.
 *
 * @param {Arguments} ...
 * @return {Boolean}
 * @api public
 */

proto.got =
proto.calledWith = function(n){
  var a = [].slice.call(arguments);
  for (var i = 0, n = this.args.length; i < n; i++) {
    var b = this.args[i];
    if (eql(a, b.slice(0, a.length))) return true;
  }
  return;
};

/**
 * `true` if the stub returned `value`.
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api public
 */

proto.returned = function(value){
  var ret = this.returns[this.returns.length - 1];
  return eql(ret, value);
};

/**
 * `true` if the stub was called once.
 *
 * @return {Boolean}
 * @api public
 */

proto.once = function(){
  return 1 == this.args.length;
};

/**
 * `true` if the stub was called twice.
 *
 * @return {Boolean}
 * @api public
 */

proto.twice = function(){
  return 2 == this.args.length;
};

/**
 * `true` if the stub was called three times.
 *
 * @return {Boolean}
 * @api public
 */

proto.thrice = function(){
  return 3 == this.args.length;
};

/**
 * Reset the stub.
 *
 * @return {Function}
 * @api public
 */

proto.reset = function(){
  this.returns = [];
  this.args = [];
  this.update();
  return this;
};

/**
 * Restore.
 *
 * @return {Function}
 * @api public
 */

proto.restore = function(){
  if (!this.obj) return this;
  var m = this.method;
  var fn = this.fn;
  this.obj[m] = fn;
  return this;
};

/**
 * Update the stub.
 *
 * @return {Function}
 * @api private
 */

proto.update = function(){
  this.called = !! this.args.length;
  this.calledOnce = this.once();
  this.calledTwice = this.twice();
  this.calledThrice = this.thrice();
  return this;
};

/**
 * To function.
 *
 * @param {...} args
 * @param {Function} stub
 * @return {Function}
 * @api private
 */

function toFunction(args, stub){
  var obj = args[0];
  var method = args[1];
  var fn = args[2] || function(){};

  switch (args.length) {
    case 0: return function noop(){};
    case 1: return function(args){ return obj.apply(null, args); };
    case 2:
    case 3:
    var m = obj[method];
    stub.method = method;
    stub.fn = m;
    stub.obj = obj;
    obj[method] = stub;
    return function(args) {
      return fn.apply(obj, args);
    };
  }
}

}, {"merge":119,"eql":120}],
119: [function(require, module, exports) {

/**
 * merge `b`'s properties with `a`'s.
 *
 * example:
 *
 *        var user = {};
 *        merge(user, console);
 *        // > { log: fn, dir: fn ..}
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 */

module.exports = function (a, b) {
  for (var k in b) a[k] = b[k];
  return a;
};

}, {}],
120: [function(require, module, exports) {

/**
 * dependencies
 */

var type = require('type');
var k = require('keys');

/**
 * Export `eql`
 */

exports = module.exports = eql;

/**
 * Compare `a` to `b`.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean}
 * @api public
 */

function eql(a, b){
  var compare = type(a);

  // sanity check
  if (compare != type(b)) return false;
  if (a === b) return true;

  // compare
  return (compare = eql[compare])
    ? compare(a, b)
    : a == b;
}

/**
 * Compare regexps `a`, `b`.
 *
 * @param {RegExp} a
 * @param {RegExp} b
 * @return {Boolean}
 * @api public
 */

eql.regexp = function(a, b){
  return a.ignoreCase == b.ignoreCase
    && a.multiline == b.multiline
    && a.lastIndex == b.lastIndex
    && a.global == b.global
    && a.source == b.source;
};

/**
 * Compare objects `a`, `b`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Boolean}
 * @api public
 */

eql.object = function(a, b){
  var keys = {};

  // proto
  if (a.prototype != b.prototype) return false;

  // keys
  keys.a = k(a).sort();
  keys.b = k(b).sort();

  // length
  if (keys.a.length != keys.b.length) return false;

  // keys
  if (keys.a.toString() != keys.b.toString()) return false;

  // walk
  for (var i = 0; i < keys.a.length; ++i) {
    var key = keys.a[i];
    if (!eql(a[key], b[key])) return false;
  }

  // eql
  return true;
};

/**
 * Compare arrays `a`, `b`.
 *
 * @param {Array} a
 * @param {Array} b
 * @return {Boolean}
 * @api public
 */

eql.array = function(a, b){
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (!eql(a[i], b[i])) return false;
  }
  return true;
};

/**
 * Compare dates `a`, `b`.
 *
 * @param {Date} a
 * @param {Date} b
 * @return {Boolean}
 * @api public
 */

eql.date = function(a, b){
  return +a == +b;
};

}, {"type":50,"keys":114}],
114: [function(require, module, exports) {
var has = Object.prototype.hasOwnProperty;

module.exports = Object.keys || function(obj){
  var keys = [];

  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }

  return keys;
};

}, {}],
115: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var merge = require('merge');
var eql = require('eql');

/**
 * Create a test spy with `obj`, `method`.
 *
 * Examples:
 *
 *      s = require('spy')({}, 'toString');
 *      s = require('spy')(document.write);
 *      s = require('spy')();
 *
 * @param {Object|Function} obj
 * @param {String} method
 * @return {Function}
 * @api public
 */

module.exports = function(obj, method){
  var fn = toFunction(arguments, spy);
  merge(spy, proto);
  return spy.reset();

  function spy(){
    var args = [].slice.call(arguments);
    var ret = fn(arguments);
    spy.returns || spy.reset();
    spy.args.push(args);
    spy.returns.push(ret);
    spy.update();
    return ret;
  }
};

/**
 * Pseudo-prototype.
 */

var proto = {};

/**
 * Lazily match `args` and return `true` if the spy was called with them.
 *
 * @param {Arguments} args
 * @return {Boolean}
 * @api public
 */

proto.got =
proto.calledWith =
proto.gotLazy =
proto.calledWithLazy = function(){
  var a = [].slice.call(arguments);

  for (var i = 0, args; args = this.args[i]; i++) {
    if (eql(a,  args.slice(0, a.length))) return true;
  }

  return false;
};

/**
 * Exactly match `args` and return `true` if the spy was called with them.
 *
 * @param {Arguments} ...
 * @return {Boolean}
 * @api public
 */

proto.gotExactly =
proto.calledWithExactly = function(){
  var a = [].slice.call(arguments);

  for (var i = 0, args; args = this.args[i]; i++) {
    if (eql(a, args)) return true;
  }

  return false;
};

/**
 * `true` if the spy returned `value`.
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api public
 */

proto.returned = function(value){
  var ret = this.returns[this.returns.length - 1];
  return eql(ret, value);
};

/**
 * `true` if the spy was called once.
 *
 * @return {Boolean}
 * @api public
 */

proto.once = function(){
  return 1 == this.args.length;
};

/**
 * `true` if the spy was called twice.
 *
 * @return {Boolean}
 * @api public
 */

proto.twice = function(){
  return 2 == this.args.length;
};

/**
 * `true` if the spy was called three times.
 *
 * @return {Boolean}
 * @api public
 */

proto.thrice = function(){
  return 3 == this.args.length;
};

/**
 * Reset the spy.
 *
 * @return {Function}
 * @api public
 */

proto.reset = function(){
  this.returns = [];
  this.args = [];
  this.update();
  return this;
};

/**
 * Restore.
 *
 * @return {Function}
 * @api public
 */

proto.restore = function(){
  if (!this.obj) return this;
  var m = this.method;
  var fn = this.fn;
  this.obj[m] = fn;
  return this;
};

/**
 * Update the spy.
 *
 * @return {Function}
 * @api private
 */

proto.update = function(){
  this.called = !! this.args.length;
  this.calledOnce = this.once();
  this.calledTwice = this.twice();
  this.calledThrice = this.thrice();
  return this;
};

/**
 * To function.
 *
 * @param {...} args
 * @param {Function} spy
 * @return {Function}
 * @api private
 */

function toFunction(args, spy){
  var obj = args[0];
  var method = args[1];

  switch (args.length) {
    case 0: return function noop(){};
    case 1: return function(args){ return obj.apply(null, args); };
    case 2:
      var m = obj[method];
      merge(spy, m);
      spy.method = method;
      spy.fn = m;
      spy.obj = obj;
      obj[method] = spy;
      return function(args){
        return m.apply(obj, args);
      };
  }
}

}, {"merge":119,"eql":120}],
6: [function(require, module, exports) {
var integration = require('analytics.js-integration');
var each = require('each');

var RetentionScience = module.exports = integration('Retention Science')
.global('_rsq')
.option('siteId', '')
.option('enableOnSite', false)
.mapping('customMappings')
.tag('<script src="//d1stxfv94hrhia.cloudfront.net/waves/v2/w.js">');

RetentionScience.prototype.initialize = function() {
    window._rsq = window._rsq || [];
    this.load(this.ready);
};

RetentionScience.prototype.loaded = function() {
    return !!(window._rsq);
};

RetentionScience.prototype.page = function() {
    this._addDefaults();
    window._rsq.push(['_track']);
};

RetentionScience.prototype.track = function(track) {
    var self = this;
    var mappings = this.customMappings(track.event());
    if (mappings.length > 0) {
        each(function(mapping) {
            self._addDefaults();
            self._push(['_setAction', mapping]);
            self._push(['_setParams', track.properties()]);
            self._push(['_track']);
        }, mappings);
    } else {
        this._addDefaults();
        this._push(['_setAction', track.event()]);
        this._push(['_setParams', track.properties()]);
        this._push(['_track']);
    }
};

RetentionScience.prototype.viewedProduct = function(track) {
    this._addDefaults();
    this._addRSProduct(track.id() || track.sku(), track.name(), track.price());
    window._rsq.push(['_track']);
};

RetentionScience.prototype.completedOrder = function(track) {
    this._addDefaults();
    var self = this;
    this._push(['_addOrder', { id: track.orderId(), total: track.revenue() }]);
    each(function(product) {
        self._addRSProduct(product.id || product.sku, product.name, product.price);
    }, track.products() || []);
    this._push(['_setAction', 'checkout_success']);
    this._push(['_track']);
};

RetentionScience.prototype.addedProduct = function(track) {
    this._addDefaults();
    var self = this;
    this._addRSProduct(track.id() || track.sku(), track.name(), track.price());
    this._push(['_setAction', 'shopping_cart']);
    this._push(['_track']);
};

RetentionScience.prototype._addDefaults = function() {
    // Site id.
    this._push(['_setSiteId', this.options.siteId]);

    // Enable on site.
    if (this.options.enableOnSite) {
        this._push(['_enableOnSite']);
    }

    // UserId.
    var userId = this.analytics.user().id();
    this._push(['_setUserId', userId]);

    // Email.
    var email = (this.analytics.user().traits() || {}).email;
    this._push(['_setUserEmail', email]);
};

RetentionScience.prototype._addRSProduct = function(id, name, price) {
    this._push(['_addItem', { id: id, name: name, price: price }]);
};

RetentionScience.prototype._push = function(arr) {
    var event = arr.slice(0, 1);

    if (arr.length > 1) {
        var param = arr[1];
        var paramType = Object.prototype.toString.call(param);
        if (paramType === '[object Object]') {
            var stringed = {};
            each(function(v, i) {
                stringed[i] = v ? String(v) : '';
            }, param);
            event.push(stringed);
        } else {
            event.push(param ? String(param) : '');
        }
    }

    window._rsq.push(event);
    return event;
};

}, {"analytics.js-integration":3,"each":69}]}, {}, {"1":""})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yZXF1aXJlLmpzIiwiL3Rlc3QvaW5kZXgudGVzdC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1hbmFseXRpY3MuanMtY29yZUAyLjExLjEvbGliL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWFuYWx5dGljcy5qcy1jb3JlQDIuMTEuMS9saWIvYW5hbHl0aWNzLmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LWVtaXR0ZXJAMS4xLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtaW5kZXhvZkAwLjAuMy9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1mYWNhZGVAMS41LjAvbGliL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWZhY2FkZUAxLjUuMC9saWIvZmFjYWRlLmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWlzb2RhdGUtdHJhdmVyc2VAMC4zLjMvaW5kZXguanMiLCIvY29tcG9uZW50cy9pYW5zdG9ybXRheWxvci1pc0AwLjEuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL2lhbnN0b3JtdGF5bG9yLWlzLWVtcHR5QDAuMS4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LXR5cGVAdjEuMi4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWlzb2RhdGVAMC4wLjIvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtZWFjaEAwLjAuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1mYWNhZGVAMS41LjAvbGliL2lzLWVuYWJsZWQuanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tZmFjYWRlQDEuNS4wL2xpYi91dGlscy5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1pbmhlcml0QDAuMC4zL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LWNsb25lQDAuMi4yL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWZhY2FkZUAxLjUuMC9saWIvYWRkcmVzcy5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1vYmotY2FzZUAwLjIuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1uZXctZGF0ZUAwLjMuMS9saWIvaW5kZXguanMiLCIvY29tcG9uZW50cy9pYW5zdG9ybXRheWxvci1pc0AwLjAuNS9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1uZXctZGF0ZUAwLjMuMS9saWIvbWlsbGlzZWNvbmRzLmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLW5ldy1kYXRlQDAuMy4xL2xpYi9zZWNvbmRzLmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWZhY2FkZUAxLjUuMC9saWIvYWxpYXMuanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tZmFjYWRlQDEuNS4wL2xpYi9ncm91cC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1pcy1lbWFpbEAwLjEuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1mYWNhZGVAMS41LjAvbGliL2lkZW50aWZ5LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LXRyaW1AMC4wLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tZmFjYWRlQDEuNS4wL2xpYi90cmFjay5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1mYWNhZGVAMS41LjAvbGliL3BhZ2UuanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tZmFjYWRlQDEuNS4wL2xpYi9zY3JlZW4uanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYWZ0ZXJAMC4wLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9pYW5zdG9ybXRheWxvci1iaW5kQDAuMC4yL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LWJpbmRAMS4wLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYmluZC1hbGxAMC4wLjIvaW5kZXguanMiLCIvY29tcG9uZW50cy9pYW5zdG9ybXRheWxvci1jYWxsYmFja0AwLjAuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL3RpbW94bGV5LW5leHQtdGlja0AwLjAuMi9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1jbG9uZUAwLjEuMC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1hbmFseXRpY3MuanMtY29yZUAyLjExLjEvbGliL2Nvb2tpZS5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1jb29raWVAMS4xLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy92aXNpb25tZWRpYS1kZWJ1Z0AwLjcuNC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3Zpc2lvbm1lZGlhLWRlYnVnQDAuNy40L2xpYi9kZWJ1Zy5qcyIsIi9jb21wb25lbnRzL3Zpc2lvbm1lZGlhLWRlYnVnQDAuNy40L2RlYnVnLmpzIiwiL2NvbXBvbmVudHMvYXZldGlzay1kZWZhdWx0c0AwLjAuNC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1qc29uQDEuMC4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LWpzb24tZmFsbGJhY2tAMS4wLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tdG9wLWRvbWFpbkAyLjAuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC11cmxAdjAuMi4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LWNvb2tpZUAxLjEuMi9pbmRleC5qcyIsIi9jb21wb25lbnRzL25kaG91bGUtZm9sZGxAMS4wLjMvaW5kZXguanMiLCIvY29tcG9uZW50cy9uZGhvdWxlLWVhY2hAMS4wLjMvaW5kZXguanMiLCIvY29tcG9uZW50cy9uZGhvdWxlLWtleXNAMS4xLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYW5hbHl0aWNzLmpzLWNvcmVAMi4xMS4xL2xpYi9ncm91cC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1hbmFseXRpY3MuanMtY29yZUAyLjExLjEvbGliL2VudGl0eS5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1leHRlbmRAMC4wLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYW5hbHl0aWNzLmpzLWNvcmVAMi4xMS4xL2xpYi9tZW1vcnkuanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYW5hbHl0aWNzLmpzLWNvcmVAMi4xMS4xL2xpYi9zdG9yZS5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1zdG9yZS5qc0AyLjAuMC9zdG9yZS5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1pbmhlcml0QDAuMC4yL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvaWFuc3Rvcm10YXlsb3ItaXNAMC4xLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8taXMtbWV0YUAwLjAuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1vYmplY3RAMC4wLjMvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYW5hbHl0aWNzLmpzLWNvcmVAMi4xMS4xL2xpYi9ub3JtYWxpemUuanMiLCIvY29tcG9uZW50cy9uZGhvdWxlLWluY2x1ZGVzQDEuMC4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LW1hcEAwLjAuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC10by1mdW5jdGlvbkAyLjAuNi9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1wcm9wc0AxLjEuMi9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1ldmVudEAwLjEuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1hbmFseXRpY3MuanMtY29yZUAyLjExLjEvbGliL3BhZ2VEZWZhdWx0cy5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1jYW5vbmljYWxAMC4wLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtdXJsQDAuMi4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvbmRob3VsZS1waWNrQDEuMC4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMveWllbGRzLXByZXZlbnRAMC4wLjIvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtcXVlcnlzdHJpbmdAMi4wLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtdHlwZUAxLjEuMC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1hbmFseXRpY3MuanMtY29yZUAyLjExLjEvbGliL3VzZXIuanMiLCIvY29tcG9uZW50cy9nam9obnNvbi11dWlkQDAuMC4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWFuYWx5dGljcy5qcy1jb3JlQDIuMTEuMS9ib3dlci5qc29uIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWFuYWx5dGljcy5qcy1pbnRlZ3JhdGlvbkAxLjAuMS9saWIvaW5kZXguanMiLCIvY29tcG9uZW50cy9pYW5zdG9ybXRheWxvci1iaW5kQDAuMC4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvdmlzaW9ubWVkaWEtZGVidWdAMC43LjMvaW5kZXguanMiLCIvY29tcG9uZW50cy92aXNpb25tZWRpYS1kZWJ1Z0AwLjcuMy9saWIvZGVidWcuanMiLCIvY29tcG9uZW50cy92aXNpb25tZWRpYS1kZWJ1Z0AwLjcuMy9kZWJ1Zy5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1leHRlbmRAMS4wLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy95aWVsZHMtc2x1Z0AxLjEuMC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1hbmFseXRpY3MuanMtaW50ZWdyYXRpb25AMS4wLjEvbGliL3Byb3Rvcy5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1lYWNoQDAuMi42L2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LXR5cGVAMS4wLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYW5hbHl0aWNzLWV2ZW50c0AxLjIuMC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3lpZWxkcy1mbXRAMC4xLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tbG9hZC1pZnJhbWVAMC4xLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tc2NyaXB0LW9ubG9hZEAxLjAuMi9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1sb2FkLXNjcmlwdEAwLjEuMy9pbmRleC5qcyIsIi9jb21wb25lbnRzL2lhbnN0b3JtdGF5bG9yLXRvLW5vLWNhc2VAMC4xLjIvaW5kZXguanMiLCIvY29tcG9uZW50cy9uZGhvdWxlLWV2ZXJ5QDEuMC4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LWlzQDAuMS4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWFuYWx5dGljcy5qcy1pbnRlZ3JhdGlvbkAxLjAuMS9saWIvc3RhdGljcy5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1kb21pZnlAMS4zLjMvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tY2xlYXItZW52QDAuMi4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWNsZWFyLWFqYXhAMC4wLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy95aWVsZHMtY2xlYXItdGltZW91dHNAMC4wLjIvaW5kZXguanMiLCIvY29tcG9uZW50cy95aWVsZHMtY2xlYXItaW50ZXJ2YWxzQDAuMC4zL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWNsZWFyLWxpc3RlbmVyc0AwLjEuMi9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1jbGVhci1nbG9iYWxzQDAuMS4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWNsZWFyLWltYWdlc0AwLjEuMC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1jbGVhci1zY3JpcHRzQDAuMi4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LXF1ZXJ5QDAuMC4zL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWNsZWFyLWNvb2tpZXNAMC4xLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYW5hbHl0aWNzLmpzLWludGVncmF0aW9uLXRlc3RlckAxLjQuMy9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1hc3NlcnRAMC41LjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9qa3Jvc28tZXF1YWxzQDEuMC4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvamtyb3NvLXR5cGVAMS4xLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtc3RhY2tAMC4wLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtZG9taWZ5QDEuNC4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLXN0dWJAMC4xLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy95aWVsZHMtbWVyZ2VAMS4wLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy95aWVsZHMtZXFsQDAuMC4yL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvbWF0dGhld3Ata2V5c0AwLjAuMy9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1zcHlAMC4zLjAvaW5kZXguanMiLCIvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDclRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN2ZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcmVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDamRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InRlc3QvaW5kZXgudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvZHVvIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIG91dGVyKG1vZHVsZXMsIGNhY2hlLCBlbnRyaWVzKXtcblxuICAvKipcbiAgICogR2xvYmFsXG4gICAqL1xuXG4gIHZhciBnbG9iYWwgPSAoZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH0pKCk7XG5cbiAgLyoqXG4gICAqIFJlcXVpcmUgYG5hbWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiByZXF1aXJlKG5hbWUpe1xuICAgIGlmIChjYWNoZVtuYW1lXSkgcmV0dXJuIGNhY2hlW25hbWVdLmV4cG9ydHM7XG4gICAgaWYgKG1vZHVsZXNbbmFtZV0pIHJldHVybiBjYWxsKG5hbWUsIHJlcXVpcmUpO1xuICAgIHRocm93IG5ldyBFcnJvcignY2Fubm90IGZpbmQgbW9kdWxlIFwiJyArIG5hbWUgKyAnXCInKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIG1vZHVsZSBgaWRgIGFuZCBjYWNoZSBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHJlcXVpcmVcbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBjYWxsKGlkLCByZXF1aXJlKXtcbiAgICB2YXIgbSA9IGNhY2hlW2lkXSA9IHsgZXhwb3J0czoge30gfTtcbiAgICB2YXIgbW9kID0gbW9kdWxlc1tpZF07XG4gICAgdmFyIG5hbWUgPSBtb2RbMl07XG4gICAgdmFyIGZuID0gbW9kWzBdO1xuICAgIHZhciB0aHJldyA9IHRydWU7XG5cbiAgICB0cnkge1xuICAgICAgZm4uY2FsbChtLmV4cG9ydHMsIGZ1bmN0aW9uKHJlcSl7XG4gICAgICAgIHZhciBkZXAgPSBtb2R1bGVzW2lkXVsxXVtyZXFdO1xuICAgICAgICByZXR1cm4gcmVxdWlyZShkZXAgfHwgcmVxKTtcbiAgICAgIH0sIG0sIG0uZXhwb3J0cywgb3V0ZXIsIG1vZHVsZXMsIGNhY2hlLCBlbnRyaWVzKTtcbiAgICAgIHRocmV3ID0gZmFsc2U7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmICh0aHJldykge1xuICAgICAgICBkZWxldGUgY2FjaGVbaWRdO1xuICAgICAgfSBlbHNlIGlmIChuYW1lKSB7XG4gICAgICAgIC8vIGV4cG9zZSBhcyAnbmFtZScuXG4gICAgICAgIGNhY2hlW25hbWVdID0gY2FjaGVbaWRdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjYWNoZVtpZF0uZXhwb3J0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1aXJlIGFsbCBlbnRyaWVzIGV4cG9zaW5nIHRoZW0gb24gZ2xvYmFsIGlmIG5lZWRlZC5cbiAgICovXG5cbiAgZm9yICh2YXIgaWQgaW4gZW50cmllcykge1xuICAgIGlmIChlbnRyaWVzW2lkXSkge1xuICAgICAgZ2xvYmFsW2VudHJpZXNbaWRdXSA9IHJlcXVpcmUoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXF1aXJlKGlkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRHVvIGZsYWcuXG4gICAqL1xuXG4gIHJlcXVpcmUuZHVvID0gdHJ1ZTtcblxuICAvKipcbiAgICogRXhwb3NlIGNhY2hlLlxuICAgKi9cblxuICByZXF1aXJlLmNhY2hlID0gY2FjaGU7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBtb2R1bGVzXG4gICAqL1xuXG4gIHJlcXVpcmUubW9kdWxlcyA9IG1vZHVsZXM7XG5cbiAgLyoqXG4gICAqIFJldHVybiBuZXdlc3QgcmVxdWlyZS5cbiAgICovXG5cbiAgIHJldHVybiByZXF1aXJlO1xufSkiLCJ2YXIgQW5hbHl0aWNzID0gcmVxdWlyZSgnYW5hbHl0aWNzLmpzLWNvcmUnKS5jb25zdHJ1Y3RvcjtcbnZhciBpbnRlZ3JhdGlvbiA9IHJlcXVpcmUoJ2FuYWx5dGljcy5qcy1pbnRlZ3JhdGlvbicpO1xudmFyIHNhbmRib3ggPSByZXF1aXJlKCdjbGVhci1lbnYnKTtcbnZhciB0ZXN0ZXIgPSByZXF1aXJlKCdhbmFseXRpY3MuanMtaW50ZWdyYXRpb24tdGVzdGVyJyk7XG52YXIgUmV0ZW50aW9uU2NpZW5jZSA9IHJlcXVpcmUoJy4uL2xpYicpO1xuXG5kZXNjcmliZSgnUmV0ZW50aW9uU2NpZW5jZScsIGZ1bmN0aW9uKCkge1xuICB2YXIgYW5hbHl0aWNzO1xuICB2YXIgcmV0ZW50aW9uU2NpZW5jZTtcbiAgdmFyIG9wdGlvbnMgPSB7XG4gICAgc2l0ZUlkOiAnMTIzNDUnLFxuICAgIGN1c3RvbU1hcHBpbmdzOiBbe2tleTogJ0JpZCBvbiBJdGVtJywgdmFsdWU6ICdzaG9wcGluZ19jYXJ0J31dXG4gIH07XG5cbiAgYmVmb3JlRWFjaChmdW5jdGlvbigpIHtcbiAgICBhbmFseXRpY3MgPSBuZXcgQW5hbHl0aWNzKCk7XG4gICAgcmV0ZW50aW9uU2NpZW5jZSA9IG5ldyBSZXRlbnRpb25TY2llbmNlKG9wdGlvbnMpO1xuICAgIGFuYWx5dGljcy51c2UoUmV0ZW50aW9uU2NpZW5jZSk7XG4gICAgYW5hbHl0aWNzLnVzZSh0ZXN0ZXIpO1xuICAgIGFuYWx5dGljcy5hZGQocmV0ZW50aW9uU2NpZW5jZSk7XG4gIH0pO1xuXG4gIGFmdGVyRWFjaChmdW5jdGlvbigpIHtcbiAgICBhbmFseXRpY3MucmVzdG9yZSgpO1xuICAgIGFuYWx5dGljcy5yZXNldCgpO1xuICAgIHJldGVudGlvblNjaWVuY2UucmVzZXQoKTtcbiAgICBzYW5kYm94KCk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgaGF2ZSB0aGUgcmlnaHQgc2V0dGluZ3MnLCBmdW5jdGlvbigpIHtcbiAgICAgIGFuYWx5dGljcy5jb21wYXJlKFJldGVudGlvblNjaWVuY2UsIGludGVncmF0aW9uKCdSZXRlbnRpb24gU2NpZW5jZScpXG4gICAgICAgIC5nbG9iYWwoJ19yc3EnKSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdiZWZvcmUgbG9hZGluZycsIGZ1bmN0aW9uKCkge1xuICAgIGJlZm9yZUVhY2goZnVuY3Rpb24oKSB7XG4gICAgICBhbmFseXRpY3Muc3R1YihyZXRlbnRpb25TY2llbmNlLCAnbG9hZCcpO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyNpbml0aWFsaXplJywgZnVuY3Rpb24oKSB7XG4gICAgICBpdCgnc2hvdWxkIGNyZWF0ZSB0aGUgX3JzcSBhcnJheScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBhbmFseXRpY3MuYXNzZXJ0KCF3aW5kb3cuX3JzcSk7XG4gICAgICAgIGFuYWx5dGljcy5pbml0aWFsaXplKCk7XG4gICAgICAgIGFuYWx5dGljcy5hc3NlcnQod2luZG93Ll9yc3EpO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgY2FsbCAjbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBhbmFseXRpY3MuaW5pdGlhbGl6ZSgpO1xuICAgICAgICBhbmFseXRpY3MucGFnZSgpO1xuICAgICAgICBhbmFseXRpY3MuY2FsbGVkKHJldGVudGlvblNjaWVuY2UubG9hZCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2xvYWRpbmcnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnc2hvdWxkIGxvYWQnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICBhbmFseXRpY3MubG9hZChyZXRlbnRpb25TY2llbmNlLCBkb25lKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2FmdGVyIGxvYWRpbmcnLCBmdW5jdGlvbigpIHtcbiAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIGFuYWx5dGljcy5vbmNlKCdyZWFkeScsIGRvbmUpO1xuICAgICAgYW5hbHl0aWNzLmluaXRpYWxpemUoKTtcbiAgICAgIGFuYWx5dGljcy5zdHViKHdpbmRvdy5fcnNxLCAncHVzaCcpO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyNwYWdlJywgZnVuY3Rpb24oKSB7XG4gICAgICBpdCgnc2hvdWxkIGFkZCBhIHBhZ2UgdHJhY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgYW5hbHl0aWNzLnBhZ2UoKTtcbiAgICAgICAgYW5hbHl0aWNzLmNhbGxlZCh3aW5kb3cuX3JzcS5wdXNoLCBbJ190cmFjayddKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyN0cmFjaycsIGZ1bmN0aW9uKCkge1xuICAgICAgaXQoJ2NhbGxzIHZpZXdlZCBwcm9kdWN0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGFuYWx5dGljcy5zdHViKHJldGVudGlvblNjaWVuY2UsICd2aWV3ZWRQcm9kdWN0Jyk7XG4gICAgICAgIGFuYWx5dGljcy50cmFjaygnVmlld2VkIFByb2R1Y3QnLCB7fSk7XG4gICAgICAgIGFuYWx5dGljcy5jYWxsZWQocmV0ZW50aW9uU2NpZW5jZS52aWV3ZWRQcm9kdWN0KTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgncHVzaGVzIHZpZXdlZCBwcm9kdWN0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGFuYWx5dGljcy50cmFjaygnVmlld2VkIFByb2R1Y3QnLCB7IHNrdTogJ3h4eHh4JyB9KTtcbiAgICAgICAgYW5hbHl0aWNzLmNhbGxlZCh3aW5kb3cuX3JzcS5wdXNoLCBbJ19zZXRVc2VySWQnLCAnJ10pO1xuICAgICAgICBhbmFseXRpY3MuY2FsbGVkKHdpbmRvdy5fcnNxLnB1c2gsIFsnX3NldFVzZXJFbWFpbCcsICcnXSk7XG4gICAgICAgIGFuYWx5dGljcy5jYWxsZWQod2luZG93Ll9yc3EucHVzaCwgWydfYWRkSXRlbScsIHtcbiAgICAgICAgICBpZDogJ3h4eHh4JyxcbiAgICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgICBwcmljZTogJydcbiAgICAgICAgfV0pO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdhZGRzIGRlZmF1bHRzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGFuYWx5dGljcy5pZGVudGlmeSgxMjMsIHsgZW1haWw6ICdzY2huaWVAYXN0cm9ub21lci5pbycgfSk7XG4gICAgICAgIGFuYWx5dGljcy50cmFjaygnVmlld2VkIFByb2R1Y3QnLCB7fSk7XG4gICAgICAgIGFuYWx5dGljcy5jYWxsZWQod2luZG93Ll9yc3EucHVzaCwgWydfc2V0U2l0ZUlkJywgJzEyMzQ1J10pO1xuICAgICAgICBhbmFseXRpY3MuY2FsbGVkKHdpbmRvdy5fcnNxLnB1c2gsIFsnX3NldFVzZXJJZCcsICcxMjMnXSk7XG4gICAgICAgIGFuYWx5dGljcy5jYWxsZWQod2luZG93Ll9yc3EucHVzaCwgWydfc2V0VXNlckVtYWlsJywgJ3NjaG5pZUBhc3Ryb25vbWVyLmlvJ10pO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdjYWxscyBjb21wbGV0ZWQgb3JkZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgYW5hbHl0aWNzLnN0dWIocmV0ZW50aW9uU2NpZW5jZSwgJ2NvbXBsZXRlZE9yZGVyJyk7XG4gICAgICAgIGFuYWx5dGljcy50cmFjaygnQ29tcGxldGVkIE9yZGVyJywge30pO1xuICAgICAgICBhbmFseXRpY3MuY2FsbGVkKHJldGVudGlvblNjaWVuY2UuY29tcGxldGVkT3JkZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdjYWxscyBhZGRlZCBwcm9kdWN0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGFuYWx5dGljcy5zdHViKHJldGVudGlvblNjaWVuY2UsICdhZGRlZFByb2R1Y3QnKTtcbiAgICAgICAgYW5hbHl0aWNzLnRyYWNrKCdBZGRlZCBQcm9kdWN0Jywge30pO1xuICAgICAgICBhbmFseXRpY3MuY2FsbGVkKHJldGVudGlvblNjaWVuY2UuYWRkZWRQcm9kdWN0KTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgnY2FsbHMgY3VzdG9tIG1hcHBpbmdzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGFuYWx5dGljcy50cmFjaygnQmlkIG9uIEl0ZW0nLCB7fSk7XG4gICAgICAgICAgYW5hbHl0aWNzLmNhbGxlZCh3aW5kb3cuX3JzcS5wdXNoLCBbJ19zZXRBY3Rpb24nLCAnc2hvcHBpbmdfY2FydCddKTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgncHVzaGVzIGNvbXBsZXRlZCBvcmRlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICBhbmFseXRpY3MudHJhY2soJ0NvbXBsZXRlZCBPcmRlcicsIHtcbiAgICAgICAgICBpZDogJ3h4eHh4LXh4eHh4JyxcbiAgICAgICAgICByZXZlbnVlOiAxNTAuMDAsXG4gICAgICAgICAgcHJvZHVjdHM6IFt7XG4gICAgICAgICAgICBpZDogJzEyMycsXG4gICAgICAgICAgICBuYW1lOiAncHJvZHVjdDEnLFxuICAgICAgICAgICAgcHJpY2U6IDUwLjAwXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgc2t1OiAnNDU2JyxcbiAgICAgICAgICAgIG5hbWU6ICdwcm9kdWN0MicsXG4gICAgICAgICAgICBwcmljZTogMTAwLjAwXG4gICAgICAgICAgfV1cbiAgICAgICAgfSk7XG4gICAgICAgIGFuYWx5dGljcy5jYWxsZWQod2luZG93Ll9yc3EucHVzaCwgWydfc2V0U2l0ZUlkJywgJzEyMzQ1J10pO1xuICAgICAgICBhbmFseXRpY3MuY2FsbGVkKHdpbmRvdy5fcnNxLnB1c2gsIFsnX3NldFVzZXJJZCcsICcnXSk7XG4gICAgICAgIGFuYWx5dGljcy5jYWxsZWQod2luZG93Ll9yc3EucHVzaCwgWydfc2V0VXNlckVtYWlsJywgJyddKTtcbiAgICAgICAgYW5hbHl0aWNzLmNhbGxlZCh3aW5kb3cuX3JzcS5wdXNoLCBbJ19hZGRPcmRlcicsIHsgaWQ6ICd4eHh4eC14eHh4eCcsIHRvdGFsOiAnMTUwJyB9XSk7XG4gICAgICAgIGFuYWx5dGljcy5jYWxsZWQod2luZG93Ll9yc3EucHVzaCwgWydfYWRkSXRlbScsIHtcbiAgICAgICAgICBpZDogJzEyMycsXG4gICAgICAgICAgbmFtZTogJ3Byb2R1Y3QxJyxcbiAgICAgICAgICBwcmljZTogJzUwJ1xuICAgICAgICB9XSk7XG4gICAgICAgIGFuYWx5dGljcy5jYWxsZWQod2luZG93Ll9yc3EucHVzaCwgWydfYWRkSXRlbScsIHtcbiAgICAgICAgICBpZDogJzQ1NicsXG4gICAgICAgICAgbmFtZTogJ3Byb2R1Y3QyJyxcbiAgICAgICAgICBwcmljZTogJzEwMCdcbiAgICAgICAgfV0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iLCJcbi8qKlxuICogQW5hbHl0aWNzLmpzXG4gKlxuICogKEMpIDIwMTMgU2VnbWVudC5pbyBJbmMuXG4gKi9cblxudmFyIEFuYWx5dGljcyA9IHJlcXVpcmUoJy4vYW5hbHl0aWNzJyk7XG5cbi8qKlxuICogRXhwb3NlIHRoZSBgYW5hbHl0aWNzYCBzaW5nbGV0b24uXG4gKi9cblxudmFyIGFuYWx5dGljcyA9IG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IG5ldyBBbmFseXRpY3MoKTtcblxuLyoqXG4gKiBFeHBvc2UgcmVxdWlyZVxuICovXG5cbmFuYWx5dGljcy5yZXF1aXJlID0gcmVxdWlyZTtcblxuLyoqXG4gKiBFeHBvc2UgYFZFUlNJT05gLlxuICovXG5cbmV4cG9ydHMuVkVSU0lPTiA9IHJlcXVpcmUoJy4uL2Jvd2VyLmpzb24nKS52ZXJzaW9uO1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIF9hbmFseXRpY3MgPSB3aW5kb3cuYW5hbHl0aWNzO1xudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgRmFjYWRlID0gcmVxdWlyZSgnZmFjYWRlJyk7XG52YXIgYWZ0ZXIgPSByZXF1aXJlKCdhZnRlcicpO1xudmFyIGJpbmQgPSByZXF1aXJlKCdiaW5kJyk7XG52YXIgY2FsbGJhY2sgPSByZXF1aXJlKCdjYWxsYmFjaycpO1xudmFyIGNsb25lID0gcmVxdWlyZSgnY2xvbmUnKTtcbnZhciBjb29raWUgPSByZXF1aXJlKCcuL2Nvb2tpZScpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJ2RlZmF1bHRzJyk7XG52YXIgZWFjaCA9IHJlcXVpcmUoJ2VhY2gnKTtcbnZhciBmb2xkbCA9IHJlcXVpcmUoJ2ZvbGRsJyk7XG52YXIgZ3JvdXAgPSByZXF1aXJlKCcuL2dyb3VwJyk7XG52YXIgaXMgPSByZXF1aXJlKCdpcycpO1xudmFyIGlzTWV0YSA9IHJlcXVpcmUoJ2lzLW1ldGEnKTtcbnZhciBrZXlzID0gcmVxdWlyZSgnb2JqZWN0Jykua2V5cztcbnZhciBtZW1vcnkgPSByZXF1aXJlKCcuL21lbW9yeScpO1xudmFyIG5vcm1hbGl6ZSA9IHJlcXVpcmUoJy4vbm9ybWFsaXplJyk7XG52YXIgb24gPSByZXF1aXJlKCdldmVudCcpLmJpbmQ7XG52YXIgcGFnZURlZmF1bHRzID0gcmVxdWlyZSgnLi9wYWdlRGVmYXVsdHMnKTtcbnZhciBwaWNrID0gcmVxdWlyZSgncGljaycpO1xudmFyIHByZXZlbnQgPSByZXF1aXJlKCdwcmV2ZW50Jyk7XG52YXIgcXVlcnlzdHJpbmcgPSByZXF1aXJlKCdxdWVyeXN0cmluZycpO1xudmFyIHNpemUgPSByZXF1aXJlKCdvYmplY3QnKS5sZW5ndGg7XG52YXIgc3RvcmUgPSByZXF1aXJlKCcuL3N0b3JlJyk7XG52YXIgdXNlciA9IHJlcXVpcmUoJy4vdXNlcicpO1xudmFyIEFsaWFzID0gRmFjYWRlLkFsaWFzO1xudmFyIEdyb3VwID0gRmFjYWRlLkdyb3VwO1xudmFyIElkZW50aWZ5ID0gRmFjYWRlLklkZW50aWZ5O1xudmFyIFBhZ2UgPSBGYWNhZGUuUGFnZTtcbnZhciBUcmFjayA9IEZhY2FkZS5UcmFjaztcblxuLyoqXG4gKiBFeHBvc2UgYEFuYWx5dGljc2AuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gQW5hbHl0aWNzO1xuXG4vKipcbiAqIEV4cG9zZSBzdG9yYWdlLlxuICovXG5cbmV4cG9ydHMuY29va2llID0gY29va2llO1xuZXhwb3J0cy5zdG9yZSA9IHN0b3JlO1xuZXhwb3J0cy5tZW1vcnkgPSBtZW1vcnk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgQW5hbHl0aWNzYCBpbnN0YW5jZS5cbiAqL1xuXG5mdW5jdGlvbiBBbmFseXRpY3MoKSB7XG4gIHRoaXMuX29wdGlvbnMoe30pO1xuICB0aGlzLkludGVncmF0aW9ucyA9IHt9O1xuICB0aGlzLl9pbnRlZ3JhdGlvbnMgPSB7fTtcbiAgdGhpcy5fcmVhZGllZCA9IGZhbHNlO1xuICB0aGlzLl90aW1lb3V0ID0gMzAwO1xuICAvLyBYWFg6IEJBQ0tXQVJEUyBDT01QQVRJQklMSVRZXG4gIHRoaXMuX3VzZXIgPSB1c2VyO1xuICB0aGlzLmxvZyA9IGRlYnVnKCdhbmFseXRpY3MuanMnKTtcbiAgYmluZC5hbGwodGhpcyk7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLm9uKCdpbml0aWFsaXplJywgZnVuY3Rpb24oc2V0dGluZ3MsIG9wdGlvbnMpe1xuICAgIGlmIChvcHRpb25zLmluaXRpYWxQYWdldmlldykgc2VsZi5wYWdlKCk7XG4gICAgc2VsZi5fcGFyc2VRdWVyeSh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRXZlbnQgRW1pdHRlci5cbiAqL1xuXG5FbWl0dGVyKEFuYWx5dGljcy5wcm90b3R5cGUpO1xuXG4vKipcbiAqIFVzZSBhIGBwbHVnaW5gLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHBsdWdpblxuICogQHJldHVybiB7QW5hbHl0aWNzfVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24ocGx1Z2luKSB7XG4gIHBsdWdpbih0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIERlZmluZSBhIG5ldyBgSW50ZWdyYXRpb25gLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IEludGVncmF0aW9uXG4gKiBAcmV0dXJuIHtBbmFseXRpY3N9XG4gKi9cblxuQW5hbHl0aWNzLnByb3RvdHlwZS5hZGRJbnRlZ3JhdGlvbiA9IGZ1bmN0aW9uKEludGVncmF0aW9uKSB7XG4gIHZhciBuYW1lID0gSW50ZWdyYXRpb24ucHJvdG90eXBlLm5hbWU7XG4gIGlmICghbmFtZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignYXR0ZW1wdGVkIHRvIGFkZCBhbiBpbnZhbGlkIGludGVncmF0aW9uJyk7XG4gIHRoaXMuSW50ZWdyYXRpb25zW25hbWVdID0gSW50ZWdyYXRpb247XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHdpdGggdGhlIGdpdmVuIGludGVncmF0aW9uIGBzZXR0aW5nc2AgYW5kIGBvcHRpb25zYC5cbiAqXG4gKiBBbGlhc2VkIHRvIGBpbml0YCBmb3IgY29udmVuaWVuY2UuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtzZXR0aW5ncz17fV1cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLmluaXQgPSBBbmFseXRpY3MucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbihzZXR0aW5ncywgb3B0aW9ucykge1xuICBzZXR0aW5ncyA9IHNldHRpbmdzIHx8IHt9O1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB0aGlzLl9vcHRpb25zKG9wdGlvbnMpO1xuICB0aGlzLl9yZWFkaWVkID0gZmFsc2U7XG5cbiAgLy8gY2xlYW4gdW5rbm93biBpbnRlZ3JhdGlvbnMgZnJvbSBzZXR0aW5nc1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGVhY2goc2V0dGluZ3MsIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgSW50ZWdyYXRpb24gPSBzZWxmLkludGVncmF0aW9uc1tuYW1lXTtcbiAgICBpZiAoIUludGVncmF0aW9uKSBkZWxldGUgc2V0dGluZ3NbbmFtZV07XG4gIH0pO1xuXG4gIC8vIGFkZCBpbnRlZ3JhdGlvbnNcbiAgZWFjaChzZXR0aW5ncywgZnVuY3Rpb24obmFtZSwgb3B0cykge1xuICAgIHZhciBJbnRlZ3JhdGlvbiA9IHNlbGYuSW50ZWdyYXRpb25zW25hbWVdO1xuICAgIHZhciBpbnRlZ3JhdGlvbiA9IG5ldyBJbnRlZ3JhdGlvbihjbG9uZShvcHRzKSk7XG4gICAgc2VsZi5sb2coJ2luaXRpYWxpemUgJW8gLSAlbycsIG5hbWUsIG9wdHMpO1xuICAgIHNlbGYuYWRkKGludGVncmF0aW9uKTtcbiAgfSk7XG5cbiAgdmFyIGludGVncmF0aW9ucyA9IHRoaXMuX2ludGVncmF0aW9ucztcblxuICAvLyBsb2FkIHVzZXIgbm93IHRoYXQgb3B0aW9ucyBhcmUgc2V0XG4gIHVzZXIubG9hZCgpO1xuICBncm91cC5sb2FkKCk7XG5cbiAgLy8gbWFrZSByZWFkeSBjYWxsYmFja1xuICB2YXIgcmVhZHkgPSBhZnRlcihzaXplKGludGVncmF0aW9ucyksIGZ1bmN0aW9uKCkge1xuICAgIHNlbGYuX3JlYWRpZWQgPSB0cnVlO1xuICAgIHNlbGYuZW1pdCgncmVhZHknKTtcbiAgfSk7XG5cbiAgLy8gaW5pdGlhbGl6ZSBpbnRlZ3JhdGlvbnMsIHBhc3NpbmcgcmVhZHlcbiAgZWFjaChpbnRlZ3JhdGlvbnMsIGZ1bmN0aW9uKG5hbWUsIGludGVncmF0aW9uKSB7XG4gICAgaWYgKG9wdGlvbnMuaW5pdGlhbFBhZ2V2aWV3ICYmIGludGVncmF0aW9uLm9wdGlvbnMuaW5pdGlhbFBhZ2V2aWV3ID09PSBmYWxzZSkge1xuICAgICAgaW50ZWdyYXRpb24ucGFnZSA9IGFmdGVyKDIsIGludGVncmF0aW9uLnBhZ2UpO1xuICAgIH1cblxuICAgIGludGVncmF0aW9uLmFuYWx5dGljcyA9IHNlbGY7XG4gICAgaW50ZWdyYXRpb24ub25jZSgncmVhZHknLCByZWFkeSk7XG4gICAgaW50ZWdyYXRpb24uaW5pdGlhbGl6ZSgpO1xuICB9KTtcblxuICAvLyBiYWNrd2FyZHMgY29tcGF0IHdpdGggYW5ndWxhciBwbHVnaW4uXG4gIC8vIFRPRE86IHJlbW92ZVxuICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICB0aGlzLmVtaXQoJ2luaXRpYWxpemUnLCBzZXR0aW5ncywgb3B0aW9ucyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIHVzZXIncyBgaWRgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGlkXG4gKi9cblxuQW5hbHl0aWNzLnByb3RvdHlwZS5zZXRBbm9ueW1vdXNJZCA9IGZ1bmN0aW9uKGlkKXtcbiAgdGhpcy51c2VyKCkuYW5vbnltb3VzSWQoaWQpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGFuIGludGVncmF0aW9uLlxuICpcbiAqIEBwYXJhbSB7SW50ZWdyYXRpb259IGludGVncmF0aW9uXG4gKi9cblxuQW5hbHl0aWNzLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihpbnRlZ3JhdGlvbil7XG4gIHRoaXMuX2ludGVncmF0aW9uc1tpbnRlZ3JhdGlvbi5uYW1lXSA9IGludGVncmF0aW9uO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSWRlbnRpZnkgYSB1c2VyIGJ5IG9wdGlvbmFsIGBpZGAgYW5kIGB0cmFpdHNgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBbaWQ9dXNlci5pZCgpXSBVc2VyIElELlxuICogQHBhcmFtIHtPYmplY3R9IFt0cmFpdHM9bnVsbF0gVXNlciB0cmFpdHMuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9bnVsbF1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLmlkZW50aWZ5ID0gZnVuY3Rpb24oaWQsIHRyYWl0cywgb3B0aW9ucywgZm4pIHtcbiAgLy8gQXJndW1lbnQgcmVzaHVmZmxpbmcuXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucywgbm8tc2VxdWVuY2VzICovXG4gIGlmIChpcy5mbihvcHRpb25zKSkgZm4gPSBvcHRpb25zLCBvcHRpb25zID0gbnVsbDtcbiAgaWYgKGlzLmZuKHRyYWl0cykpIGZuID0gdHJhaXRzLCBvcHRpb25zID0gbnVsbCwgdHJhaXRzID0gbnVsbDtcbiAgaWYgKGlzLm9iamVjdChpZCkpIG9wdGlvbnMgPSB0cmFpdHMsIHRyYWl0cyA9IGlkLCBpZCA9IHVzZXIuaWQoKTtcbiAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvbnMsIG5vLXNlcXVlbmNlcyAqL1xuXG4gIC8vIGNsb25lIHRyYWl0cyBiZWZvcmUgd2UgbWFuaXB1bGF0ZSBzbyB3ZSBkb24ndCBkbyBhbnl0aGluZyB1bmNvdXRoLCBhbmQgdGFrZVxuICAvLyBmcm9tIGB1c2VyYCBzbyB0aGF0IHdlIGNhcnJ5b3ZlciBhbm9ueW1vdXMgdHJhaXRzXG4gIHVzZXIuaWRlbnRpZnkoaWQsIHRyYWl0cyk7XG5cbiAgdmFyIG1zZyA9IHRoaXMubm9ybWFsaXplKHtcbiAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgIHRyYWl0czogdXNlci50cmFpdHMoKSxcbiAgICB1c2VySWQ6IHVzZXIuaWQoKVxuICB9KTtcblxuICB0aGlzLl9pbnZva2UoJ2lkZW50aWZ5JywgbmV3IElkZW50aWZ5KG1zZykpO1xuXG4gIC8vIGVtaXRcbiAgdGhpcy5lbWl0KCdpZGVudGlmeScsIGlkLCB0cmFpdHMsIG9wdGlvbnMpO1xuICB0aGlzLl9jYWxsYmFjayhmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgdXNlci5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuQW5hbHl0aWNzLnByb3RvdHlwZS51c2VyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB1c2VyO1xufTtcblxuLyoqXG4gKiBJZGVudGlmeSBhIGdyb3VwIGJ5IG9wdGlvbmFsIGBpZGAgYW5kIGB0cmFpdHNgLiBPciwgaWYgbm8gYXJndW1lbnRzIGFyZVxuICogc3VwcGxpZWQsIHJldHVybiB0aGUgY3VycmVudCBncm91cC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gW2lkPWdyb3VwLmlkKCldIEdyb3VwIElELlxuICogQHBhcmFtIHtPYmplY3R9IFt0cmFpdHM9bnVsbF0gR3JvdXAgdHJhaXRzLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPW51bGxdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtBbmFseXRpY3N8T2JqZWN0fVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUuZ3JvdXAgPSBmdW5jdGlvbihpZCwgdHJhaXRzLCBvcHRpb25zLCBmbikge1xuICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvbnMsIG5vLXNlcXVlbmNlcyAqL1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBncm91cDtcbiAgaWYgKGlzLmZuKG9wdGlvbnMpKSBmbiA9IG9wdGlvbnMsIG9wdGlvbnMgPSBudWxsO1xuICBpZiAoaXMuZm4odHJhaXRzKSkgZm4gPSB0cmFpdHMsIG9wdGlvbnMgPSBudWxsLCB0cmFpdHMgPSBudWxsO1xuICBpZiAoaXMub2JqZWN0KGlkKSkgb3B0aW9ucyA9IHRyYWl0cywgdHJhaXRzID0gaWQsIGlkID0gZ3JvdXAuaWQoKTtcbiAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvbnMsIG5vLXNlcXVlbmNlcyAqL1xuXG5cbiAgLy8gZ3JhYiBmcm9tIGdyb3VwIGFnYWluIHRvIG1ha2Ugc3VyZSB3ZSdyZSB0YWtpbmcgZnJvbSB0aGUgc291cmNlXG4gIGdyb3VwLmlkZW50aWZ5KGlkLCB0cmFpdHMpO1xuXG4gIHZhciBtc2cgPSB0aGlzLm5vcm1hbGl6ZSh7XG4gICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICB0cmFpdHM6IGdyb3VwLnRyYWl0cygpLFxuICAgIGdyb3VwSWQ6IGdyb3VwLmlkKClcbiAgfSk7XG5cbiAgdGhpcy5faW52b2tlKCdncm91cCcsIG5ldyBHcm91cChtc2cpKTtcblxuICB0aGlzLmVtaXQoJ2dyb3VwJywgaWQsIHRyYWl0cywgb3B0aW9ucyk7XG4gIHRoaXMuX2NhbGxiYWNrKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFRyYWNrIGFuIGBldmVudGAgdGhhdCBhIHVzZXIgaGFzIHRyaWdnZXJlZCB3aXRoIG9wdGlvbmFsIGBwcm9wZXJ0aWVzYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz1udWxsXVxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPW51bGxdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtBbmFseXRpY3N9XG4gKi9cblxuQW5hbHl0aWNzLnByb3RvdHlwZS50cmFjayA9IGZ1bmN0aW9uKGV2ZW50LCBwcm9wZXJ0aWVzLCBvcHRpb25zLCBmbikge1xuICAvLyBBcmd1bWVudCByZXNodWZmbGluZy5cbiAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLWV4cHJlc3Npb25zLCBuby1zZXF1ZW5jZXMgKi9cbiAgaWYgKGlzLmZuKG9wdGlvbnMpKSBmbiA9IG9wdGlvbnMsIG9wdGlvbnMgPSBudWxsO1xuICBpZiAoaXMuZm4ocHJvcGVydGllcykpIGZuID0gcHJvcGVydGllcywgb3B0aW9ucyA9IG51bGwsIHByb3BlcnRpZXMgPSBudWxsO1xuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucywgbm8tc2VxdWVuY2VzICovXG5cbiAgLy8gZmlndXJlIG91dCBpZiB0aGUgZXZlbnQgaXMgYXJjaGl2ZWQuXG4gIHZhciBwbGFuID0gdGhpcy5vcHRpb25zLnBsYW4gfHwge307XG4gIHZhciBldmVudHMgPSBwbGFuLnRyYWNrIHx8IHt9O1xuXG4gIC8vIG5vcm1hbGl6ZVxuICB2YXIgbXNnID0gdGhpcy5ub3JtYWxpemUoe1xuICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsXG4gICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICBldmVudDogZXZlbnRcbiAgfSk7XG5cbiAgLy8gcGxhbi5cbiAgcGxhbiA9IGV2ZW50c1tldmVudF07XG4gIGlmIChwbGFuKSB7XG4gICAgdGhpcy5sb2coJ3BsYW4gJW8gLSAlbycsIGV2ZW50LCBwbGFuKTtcbiAgICBpZiAocGxhbi5lbmFibGVkID09PSBmYWxzZSkgcmV0dXJuIHRoaXMuX2NhbGxiYWNrKGZuKTtcbiAgICBkZWZhdWx0cyhtc2cuaW50ZWdyYXRpb25zLCBwbGFuLmludGVncmF0aW9ucyB8fCB7fSk7XG4gIH1cblxuICB0aGlzLl9pbnZva2UoJ3RyYWNrJywgbmV3IFRyYWNrKG1zZykpO1xuXG4gIHRoaXMuZW1pdCgndHJhY2snLCBldmVudCwgcHJvcGVydGllcywgb3B0aW9ucyk7XG4gIHRoaXMuX2NhbGxiYWNrKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgdG8gdHJhY2sgYW4gb3V0Ym91bmQgbGluayB0aGF0IHdvdWxkIG5vcm1hbGx5IG5hdmlnYXRlIGF3YXlcbiAqIGZyb20gdGhlIHBhZ2UgYmVmb3JlIHRoZSBhbmFseXRpY3MgY2FsbHMgd2VyZSBzZW50LlxuICpcbiAqIEJBQ0tXQVJEUyBDT01QQVRJQklMSVRZOiBhbGlhc2VkIHRvIGB0cmFja0NsaWNrYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR8QXJyYXl9IGxpbmtzXG4gKiBAcGFyYW0ge3N0cmluZ3xGdW5jdGlvbn0gZXZlbnRcbiAqIEBwYXJhbSB7T2JqZWN0fEZ1bmN0aW9ufSBwcm9wZXJ0aWVzIChvcHRpb25hbClcbiAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLnRyYWNrQ2xpY2sgPSBBbmFseXRpY3MucHJvdG90eXBlLnRyYWNrTGluayA9IGZ1bmN0aW9uKGxpbmtzLCBldmVudCwgcHJvcGVydGllcykge1xuICBpZiAoIWxpbmtzKSByZXR1cm4gdGhpcztcbiAgLy8gYWx3YXlzIGFycmF5cywgaGFuZGxlcyBqcXVlcnlcbiAgaWYgKGlzLmVsZW1lbnQobGlua3MpKSBsaW5rcyA9IFtsaW5rc107XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBlYWNoKGxpbmtzLCBmdW5jdGlvbihlbCkge1xuICAgIGlmICghaXMuZWxlbWVudChlbCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgcGFzcyBIVE1MRWxlbWVudCB0byBgYW5hbHl0aWNzLnRyYWNrTGlua2AuJyk7XG4gICAgb24oZWwsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBldiA9IGlzLmZuKGV2ZW50KSA/IGV2ZW50KGVsKSA6IGV2ZW50O1xuICAgICAgdmFyIHByb3BzID0gaXMuZm4ocHJvcGVydGllcykgPyBwcm9wZXJ0aWVzKGVsKSA6IHByb3BlcnRpZXM7XG4gICAgICB2YXIgaHJlZiA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgICAgIHx8IGVsLmdldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ2hyZWYnKVxuICAgICAgICB8fCBlbC5nZXRBdHRyaWJ1dGUoJ3hsaW5rOmhyZWYnKTtcblxuICAgICAgc2VsZi50cmFjayhldiwgcHJvcHMpO1xuXG4gICAgICBpZiAoaHJlZiAmJiBlbC50YXJnZXQgIT09ICdfYmxhbmsnICYmICFpc01ldGEoZSkpIHtcbiAgICAgICAgcHJldmVudChlKTtcbiAgICAgICAgc2VsZi5fY2FsbGJhY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBocmVmO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgdG8gdHJhY2sgYW4gb3V0Ym91bmQgZm9ybSB0aGF0IHdvdWxkIG5vcm1hbGx5IG5hdmlnYXRlIGF3YXlcbiAqIGZyb20gdGhlIHBhZ2UgYmVmb3JlIHRoZSBhbmFseXRpY3MgY2FsbHMgd2VyZSBzZW50LlxuICpcbiAqIEJBQ0tXQVJEUyBDT01QQVRJQklMSVRZOiBhbGlhc2VkIHRvIGB0cmFja1N1Ym1pdGAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fEFycmF5fSBmb3Jtc1xuICogQHBhcmFtIHtzdHJpbmd8RnVuY3Rpb259IGV2ZW50XG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gcHJvcGVydGllcyAob3B0aW9uYWwpXG4gKiBAcmV0dXJuIHtBbmFseXRpY3N9XG4gKi9cblxuQW5hbHl0aWNzLnByb3RvdHlwZS50cmFja1N1Ym1pdCA9IEFuYWx5dGljcy5wcm90b3R5cGUudHJhY2tGb3JtID0gZnVuY3Rpb24oZm9ybXMsIGV2ZW50LCBwcm9wZXJ0aWVzKSB7XG4gIGlmICghZm9ybXMpIHJldHVybiB0aGlzO1xuICAvLyBhbHdheXMgYXJyYXlzLCBoYW5kbGVzIGpxdWVyeVxuICBpZiAoaXMuZWxlbWVudChmb3JtcykpIGZvcm1zID0gW2Zvcm1zXTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGVhY2goZm9ybXMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgaWYgKCFpcy5lbGVtZW50KGVsKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignTXVzdCBwYXNzIEhUTUxFbGVtZW50IHRvIGBhbmFseXRpY3MudHJhY2tGb3JtYC4nKTtcbiAgICBmdW5jdGlvbiBoYW5kbGVyKGUpIHtcbiAgICAgIHByZXZlbnQoZSk7XG5cbiAgICAgIHZhciBldiA9IGlzLmZuKGV2ZW50KSA/IGV2ZW50KGVsKSA6IGV2ZW50O1xuICAgICAgdmFyIHByb3BzID0gaXMuZm4ocHJvcGVydGllcykgPyBwcm9wZXJ0aWVzKGVsKSA6IHByb3BlcnRpZXM7XG4gICAgICBzZWxmLnRyYWNrKGV2LCBwcm9wcyk7XG5cbiAgICAgIHNlbGYuX2NhbGxiYWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBlbC5zdWJtaXQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFN1cHBvcnQgdGhlIGV2ZW50cyBoYXBwZW5pbmcgdGhyb3VnaCBqUXVlcnkgb3IgWmVwdG8gaW5zdGVhZCBvZiB0aHJvdWdoXG4gICAgLy8gdGhlIG5vcm1hbCBET00gQVBJLCBiZWNhdXNlIGBlbC5zdWJtaXRgIGRvZXNuJ3QgYnViYmxlIHVwIGV2ZW50cy4uLlxuICAgIHZhciAkID0gd2luZG93LmpRdWVyeSB8fCB3aW5kb3cuWmVwdG87XG4gICAgaWYgKCQpIHtcbiAgICAgICQoZWwpLnN1Ym1pdChoYW5kbGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb24oZWwsICdzdWJtaXQnLCBoYW5kbGVyKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBUcmlnZ2VyIGEgcGFnZXZpZXcsIGxhYmVsaW5nIHRoZSBjdXJyZW50IHBhZ2Ugd2l0aCBhbiBvcHRpb25hbCBgY2F0ZWdvcnlgLFxuICogYG5hbWVgIGFuZCBgcHJvcGVydGllc2AuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IFtjYXRlZ29yeV1cbiAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZV1cbiAqIEBwYXJhbSB7T2JqZWN0fHN0cmluZ30gW3Byb3BlcnRpZXNdIChvciBwYXRoKVxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7QW5hbHl0aWNzfVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUucGFnZSA9IGZ1bmN0aW9uKGNhdGVnb3J5LCBuYW1lLCBwcm9wZXJ0aWVzLCBvcHRpb25zLCBmbikge1xuICAvLyBBcmd1bWVudCByZXNodWZmbGluZy5cbiAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLWV4cHJlc3Npb25zLCBuby1zZXF1ZW5jZXMgKi9cbiAgaWYgKGlzLmZuKG9wdGlvbnMpKSBmbiA9IG9wdGlvbnMsIG9wdGlvbnMgPSBudWxsO1xuICBpZiAoaXMuZm4ocHJvcGVydGllcykpIGZuID0gcHJvcGVydGllcywgb3B0aW9ucyA9IHByb3BlcnRpZXMgPSBudWxsO1xuICBpZiAoaXMuZm4obmFtZSkpIGZuID0gbmFtZSwgb3B0aW9ucyA9IHByb3BlcnRpZXMgPSBuYW1lID0gbnVsbDtcbiAgaWYgKGlzLm9iamVjdChjYXRlZ29yeSkpIG9wdGlvbnMgPSBuYW1lLCBwcm9wZXJ0aWVzID0gY2F0ZWdvcnksIG5hbWUgPSBjYXRlZ29yeSA9IG51bGw7XG4gIGlmIChpcy5vYmplY3QobmFtZSkpIG9wdGlvbnMgPSBwcm9wZXJ0aWVzLCBwcm9wZXJ0aWVzID0gbmFtZSwgbmFtZSA9IG51bGw7XG4gIGlmIChpcy5zdHJpbmcoY2F0ZWdvcnkpICYmICFpcy5zdHJpbmcobmFtZSkpIG5hbWUgPSBjYXRlZ29yeSwgY2F0ZWdvcnkgPSBudWxsO1xuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucywgbm8tc2VxdWVuY2VzICovXG5cbiAgcHJvcGVydGllcyA9IGNsb25lKHByb3BlcnRpZXMpIHx8IHt9O1xuICBpZiAobmFtZSkgcHJvcGVydGllcy5uYW1lID0gbmFtZTtcbiAgaWYgKGNhdGVnb3J5KSBwcm9wZXJ0aWVzLmNhdGVnb3J5ID0gY2F0ZWdvcnk7XG5cbiAgLy8gRW5zdXJlIHByb3BlcnRpZXMgaGFzIGJhc2VsaW5lIHNwZWMgcHJvcGVydGllcy5cbiAgLy8gVE9ETzogRXZlbnR1YWxseSBtb3ZlIHRoZXNlIGVudGlyZWx5IHRvIGBvcHRpb25zLmNvbnRleHQucGFnZWBcbiAgdmFyIGRlZnMgPSBwYWdlRGVmYXVsdHMoKTtcbiAgZGVmYXVsdHMocHJvcGVydGllcywgZGVmcyk7XG5cbiAgLy8gTWlycm9yIHVzZXIgb3ZlcnJpZGVzIHRvIGBvcHRpb25zLmNvbnRleHQucGFnZWAgKGJ1dCBleGNsdWRlIGN1c3RvbSBwcm9wZXJ0aWVzKVxuICAvLyAoQW55IHBhZ2UgZGVmYXVsdHMgZ2V0IGFwcGxpZWQgaW4gYHRoaXMubm9ybWFsaXplYCBmb3IgY29uc2lzdGVuY3kuKVxuICAvLyBXZWlyZCwgeWVhaC0tbW92aW5nIHNwZWNpYWwgcHJvcHMgdG8gYGNvbnRleHQucGFnZWAgd2lsbCBmaXggdGhpcyBpbiB0aGUgbG9uZyB0ZXJtLlxuICB2YXIgb3ZlcnJpZGVzID0gcGljayhrZXlzKGRlZnMpLCBwcm9wZXJ0aWVzKTtcbiAgaWYgKCFpcy5lbXB0eShvdmVycmlkZXMpKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0IHx8IHt9O1xuICAgIG9wdGlvbnMuY29udGV4dC5wYWdlID0gb3ZlcnJpZGVzO1xuICB9XG5cbiAgdmFyIG1zZyA9IHRoaXMubm9ybWFsaXplKHtcbiAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxuICAgIGNhdGVnb3J5OiBjYXRlZ29yeSxcbiAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgIG5hbWU6IG5hbWVcbiAgfSk7XG5cbiAgdGhpcy5faW52b2tlKCdwYWdlJywgbmV3IFBhZ2UobXNnKSk7XG5cbiAgdGhpcy5lbWl0KCdwYWdlJywgY2F0ZWdvcnksIG5hbWUsIHByb3BlcnRpZXMsIG9wdGlvbnMpO1xuICB0aGlzLl9jYWxsYmFjayhmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBGSVhNRTogQkFDS1dBUkRTIENPTVBBVElCSUxJVFk6IGNvbnZlcnQgYW4gb2xkIGBwYWdldmlld2AgdG8gYSBgcGFnZWAgY2FsbC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gW3VybF1cbiAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUucGFnZXZpZXcgPSBmdW5jdGlvbih1cmwpIHtcbiAgdmFyIHByb3BlcnRpZXMgPSB7fTtcbiAgaWYgKHVybCkgcHJvcGVydGllcy5wYXRoID0gdXJsO1xuICB0aGlzLnBhZ2UocHJvcGVydGllcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNZXJnZSB0d28gcHJldmlvdXNseSB1bmFzc29jaWF0ZWQgdXNlciBpZGVudGl0aWVzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b1xuICogQHBhcmFtIHtzdHJpbmd9IGZyb20gKG9wdGlvbmFsKVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgKG9wdGlvbmFsKVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gKG9wdGlvbmFsKVxuICogQHJldHVybiB7QW5hbHl0aWNzfVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUuYWxpYXMgPSBmdW5jdGlvbih0bywgZnJvbSwgb3B0aW9ucywgZm4pIHtcbiAgLy8gQXJndW1lbnQgcmVzaHVmZmxpbmcuXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucywgbm8tc2VxdWVuY2VzICovXG4gIGlmIChpcy5mbihvcHRpb25zKSkgZm4gPSBvcHRpb25zLCBvcHRpb25zID0gbnVsbDtcbiAgaWYgKGlzLmZuKGZyb20pKSBmbiA9IGZyb20sIG9wdGlvbnMgPSBudWxsLCBmcm9tID0gbnVsbDtcbiAgaWYgKGlzLm9iamVjdChmcm9tKSkgb3B0aW9ucyA9IGZyb20sIGZyb20gPSBudWxsO1xuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucywgbm8tc2VxdWVuY2VzICovXG5cbiAgdmFyIG1zZyA9IHRoaXMubm9ybWFsaXplKHtcbiAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgIHByZXZpb3VzSWQ6IGZyb20sXG4gICAgdXNlcklkOiB0b1xuICB9KTtcblxuICB0aGlzLl9pbnZva2UoJ2FsaWFzJywgbmV3IEFsaWFzKG1zZykpO1xuXG4gIHRoaXMuZW1pdCgnYWxpYXMnLCB0bywgZnJvbSwgb3B0aW9ucyk7XG4gIHRoaXMuX2NhbGxiYWNrKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgYGZuYCB0byBiZSBmaXJlZCB3aGVuIGFsbCB0aGUgYW5hbHl0aWNzIHNlcnZpY2VzIGFyZSByZWFkeS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7QW5hbHl0aWNzfVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbihmbikge1xuICBpZiAoaXMuZm4oZm4pKSB7XG4gICAgaWYgKHRoaXMuX3JlYWRpZWQpIHtcbiAgICAgIGNhbGxiYWNrLmFzeW5jKGZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbmNlKCdyZWFkeScsIGZuKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgYHRpbWVvdXRgIChpbiBtaWxsaXNlY29uZHMpIHVzZWQgZm9yIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZW91dFxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uKHRpbWVvdXQpIHtcbiAgdGhpcy5fdGltZW91dCA9IHRpbWVvdXQ7XG59O1xuXG4vKipcbiAqIEVuYWJsZSBvciBkaXNhYmxlIGRlYnVnLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfGJvb2xlYW59IHN0clxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUuZGVidWcgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGggfHwgc3RyKSB7XG4gICAgZGVidWcuZW5hYmxlKCdhbmFseXRpY3M6JyArIChzdHIgfHwgJyonKSk7XG4gIH0gZWxzZSB7XG4gICAgZGVidWcuZGlzYWJsZSgpO1xuICB9XG59O1xuXG4vKipcbiAqIEFwcGx5IG9wdGlvbnMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUuX29wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICBjb29raWUub3B0aW9ucyhvcHRpb25zLmNvb2tpZSk7XG4gIHN0b3JlLm9wdGlvbnMob3B0aW9ucy5sb2NhbFN0b3JhZ2UpO1xuICB1c2VyLm9wdGlvbnMob3B0aW9ucy51c2VyKTtcbiAgZ3JvdXAub3B0aW9ucyhvcHRpb25zLmdyb3VwKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENhbGxiYWNrIGEgYGZuYCBhZnRlciBvdXIgZGVmaW5lZCB0aW1lb3V0IHBlcmlvZC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7QW5hbHl0aWNzfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuQW5hbHl0aWNzLnByb3RvdHlwZS5fY2FsbGJhY2sgPSBmdW5jdGlvbihmbikge1xuICBjYWxsYmFjay5hc3luYyhmbiwgdGhpcy5fdGltZW91dCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDYWxsIGBtZXRob2RgIHdpdGggYGZhY2FkZWAgb24gYWxsIGVuYWJsZWQgaW50ZWdyYXRpb25zLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7RmFjYWRlfSBmYWNhZGVcbiAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUuX2ludm9rZSA9IGZ1bmN0aW9uKG1ldGhvZCwgZmFjYWRlKSB7XG4gIHRoaXMuZW1pdCgnaW52b2tlJywgZmFjYWRlKTtcblxuICBlYWNoKHRoaXMuX2ludGVncmF0aW9ucywgZnVuY3Rpb24obmFtZSwgaW50ZWdyYXRpb24pIHtcbiAgICBpZiAoIWZhY2FkZS5lbmFibGVkKG5hbWUpKSByZXR1cm47XG4gICAgaW50ZWdyYXRpb24uaW52b2tlLmNhbGwoaW50ZWdyYXRpb24sIG1ldGhvZCwgZmFjYWRlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFB1c2ggYGFyZ3NgLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3NcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKGFyZ3Mpe1xuICB2YXIgbWV0aG9kID0gYXJncy5zaGlmdCgpO1xuICBpZiAoIXRoaXNbbWV0aG9kXSkgcmV0dXJuO1xuICB0aGlzW21ldGhvZF0uYXBwbHkodGhpcywgYXJncyk7XG59O1xuXG4vKipcbiAqIFJlc2V0IGdyb3VwIGFuZCB1c2VyIHRyYWl0cyBhbmQgaWQncy5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xuICB0aGlzLnVzZXIoKS5sb2dvdXQoKTtcbiAgdGhpcy5ncm91cCgpLmxvZ291dCgpO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgcXVlcnkgc3RyaW5nIGZvciBjYWxsYWJsZSBtZXRob2RzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBxdWVyeVxuICogQHJldHVybiB7QW5hbHl0aWNzfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuQW5hbHl0aWNzLnByb3RvdHlwZS5fcGFyc2VRdWVyeSA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG4gIC8vIFBhcnNlIHF1ZXJ5c3RyaW5nIHRvIGFuIG9iamVjdFxuICB2YXIgcSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHF1ZXJ5KTtcbiAgLy8gQ3JlYXRlIHRyYWl0cyBhbmQgcHJvcGVydGllcyBvYmplY3RzLCBwb3B1bGF0ZSBmcm9tIHF1ZXJ5c3RpbmcgcGFyYW1zXG4gIHZhciB0cmFpdHMgPSBwaWNrUHJlZml4KCdhanNfdHJhaXRfJywgcSk7XG4gIHZhciBwcm9wcyA9IHBpY2tQcmVmaXgoJ2Fqc19wcm9wXycsIHEpO1xuICAvLyBUcmlnZ2VyIGJhc2VkIG9uIGNhbGxhYmxlIHBhcmFtZXRlcnMgaW4gdGhlIFVSTFxuICBpZiAocS5hanNfdWlkKSB0aGlzLmlkZW50aWZ5KHEuYWpzX3VpZCwgdHJhaXRzKTtcbiAgaWYgKHEuYWpzX2V2ZW50KSB0aGlzLnRyYWNrKHEuYWpzX2V2ZW50LCBwcm9wcyk7XG4gIGlmIChxLmFqc19haWQpIHVzZXIuYW5vbnltb3VzSWQocS5hanNfYWlkKTtcbiAgcmV0dXJuIHRoaXM7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHNoYWxsb3cgY29weSBvZiBhbiBpbnB1dCBvYmplY3QgY29udGFpbmluZyBvbmx5IHRoZSBwcm9wZXJ0aWVzXG4gICAqIHdob3NlIGtleXMgYXJlIHNwZWNpZmllZCBieSBhIHByZWZpeCwgc3RyaXBwZWQgb2YgdGhhdCBwcmVmaXhcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHByZWZpeFxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHBpY2tQcmVmaXgocHJlZml4LCBvYmplY3QpIHtcbiAgICB2YXIgbGVuZ3RoID0gcHJlZml4Lmxlbmd0aDtcbiAgICB2YXIgc3ViO1xuICAgIHJldHVybiBmb2xkbChmdW5jdGlvbihhY2MsIHZhbCwga2V5KSB7XG4gICAgICBpZiAoa2V5LnN1YnN0cigwLCBsZW5ndGgpID09PSBwcmVmaXgpIHtcbiAgICAgICAgc3ViID0ga2V5LnN1YnN0cihsZW5ndGgpO1xuICAgICAgICBhY2Nbc3ViXSA9IHZhbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwge30sIG9iamVjdCk7XG4gIH1cbn07XG5cbi8qKlxuICogTm9ybWFsaXplIHRoZSBnaXZlbiBgbXNnYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbXNnXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuQW5hbHl0aWNzLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbihtc2cpe1xuICBtc2cgPSBub3JtYWxpemUobXNnLCBrZXlzKHRoaXMuX2ludGVncmF0aW9ucykpO1xuICBpZiAobXNnLmFub255bW91c0lkKSB1c2VyLmFub255bW91c0lkKG1zZy5hbm9ueW1vdXNJZCk7XG4gIG1zZy5hbm9ueW1vdXNJZCA9IHVzZXIuYW5vbnltb3VzSWQoKTtcblxuICAvLyBFbnN1cmUgYWxsIG91dGdvaW5nIHJlcXVlc3RzIGluY2x1ZGUgcGFnZSBkYXRhIGluIHRoZWlyIGNvbnRleHRzLlxuICBtc2cuY29udGV4dC5wYWdlID0gZGVmYXVsdHMobXNnLmNvbnRleHQucGFnZSB8fCB7fSwgcGFnZURlZmF1bHRzKCkpO1xuXG4gIHJldHVybiBtc2c7XG59O1xuXG4vKipcbiAqIE5vIGNvbmZsaWN0IHN1cHBvcnQuXG4gKi9cblxuQW5hbHl0aWNzLnByb3RvdHlwZS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKXtcbiAgd2luZG93LmFuYWx5dGljcyA9IF9hbmFseXRpY3M7XG4gIHJldHVybiB0aGlzO1xufTtcbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBpbmRleCA9IHJlcXVpcmUoJ2luZGV4b2YnKTtcblxuLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufTtcblxuLyoqXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID1cbkVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICh0aGlzLl9jYWxsYmFja3NbZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXSlcbiAgICAucHVzaChmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIGZ1bmN0aW9uIG9uKCkge1xuICAgIHNlbGYub2ZmKGV2ZW50LCBvbik7XG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIGZuLl9vZmYgPSBvbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBpID0gaW5kZXgoY2FsbGJhY2tzLCBmbi5fb2ZmIHx8IGZuKTtcbiAgaWYgKH5pKSBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIG9iail7XG4gIGlmIChhcnIuaW5kZXhPZikgcmV0dXJuIGFyci5pbmRleE9mKG9iaik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGFycltpXSA9PT0gb2JqKSByZXR1cm4gaTtcbiAgfVxuICByZXR1cm4gLTE7XG59OyIsIlxudmFyIEZhY2FkZSA9IHJlcXVpcmUoJy4vZmFjYWRlJyk7XG5cbi8qKlxuICogRXhwb3NlIGBGYWNhZGVgIGZhY2FkZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2FkZTtcblxuLyoqXG4gKiBFeHBvc2Ugc3BlY2lmaWMtbWV0aG9kIGZhY2FkZXMuXG4gKi9cblxuRmFjYWRlLkFsaWFzID0gcmVxdWlyZSgnLi9hbGlhcycpO1xuRmFjYWRlLkdyb3VwID0gcmVxdWlyZSgnLi9ncm91cCcpO1xuRmFjYWRlLklkZW50aWZ5ID0gcmVxdWlyZSgnLi9pZGVudGlmeScpO1xuRmFjYWRlLlRyYWNrID0gcmVxdWlyZSgnLi90cmFjaycpO1xuRmFjYWRlLlBhZ2UgPSByZXF1aXJlKCcuL3BhZ2UnKTtcbkZhY2FkZS5TY3JlZW4gPSByZXF1aXJlKCcuL3NjcmVlbicpO1xuIiwiXG52YXIgdHJhdmVyc2UgPSByZXF1aXJlKCdpc29kYXRlLXRyYXZlcnNlJyk7XG52YXIgaXNFbmFibGVkID0gcmVxdWlyZSgnLi9pcy1lbmFibGVkJyk7XG52YXIgY2xvbmUgPSByZXF1aXJlKCcuL3V0aWxzJykuY2xvbmU7XG52YXIgdHlwZSA9IHJlcXVpcmUoJy4vdXRpbHMnKS50eXBlO1xudmFyIGFkZHJlc3MgPSByZXF1aXJlKCcuL2FkZHJlc3MnKTtcbnZhciBvYmpDYXNlID0gcmVxdWlyZSgnb2JqLWNhc2UnKTtcbnZhciBuZXdEYXRlID0gcmVxdWlyZSgnbmV3LWRhdGUnKTtcblxuLyoqXG4gKiBFeHBvc2UgYEZhY2FkZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNhZGU7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRmFjYWRlYCB3aXRoIGFuIGBvYmpgIG9mIGFyZ3VtZW50cy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKi9cblxuZnVuY3Rpb24gRmFjYWRlIChvYmopIHtcbiAgb2JqID0gY2xvbmUob2JqKTtcbiAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoJ3RpbWVzdGFtcCcpKSBvYmoudGltZXN0YW1wID0gbmV3IERhdGUoKTtcbiAgZWxzZSBvYmoudGltZXN0YW1wID0gbmV3RGF0ZShvYmoudGltZXN0YW1wKTtcbiAgdHJhdmVyc2Uob2JqKTtcbiAgdGhpcy5vYmogPSBvYmo7XG59XG5cbi8qKlxuICogTWl4aW4gYWRkcmVzcyB0cmFpdHMuXG4gKi9cblxuYWRkcmVzcyhGYWNhZGUucHJvdG90eXBlKTtcblxuLyoqXG4gKiBSZXR1cm4gYSBwcm94eSBmdW5jdGlvbiBmb3IgYSBgZmllbGRgIHRoYXQgd2lsbCBhdHRlbXB0IHRvIGZpcnN0IHVzZSBtZXRob2RzLFxuICogYW5kIGZhbGxiYWNrIHRvIGFjY2Vzc2luZyB0aGUgdW5kZXJseWluZyBvYmplY3QgZGlyZWN0bHkuIFlvdSBjYW4gc3BlY2lmeVxuICogZGVlcGx5IG5lc3RlZCBmaWVsZHMgdG9vIGxpa2U6XG4gKlxuICogICB0aGlzLnByb3h5KCdvcHRpb25zLkxpYnJhdG8nKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqL1xuXG5GYWNhZGUucHJvdG90eXBlLnByb3h5ID0gZnVuY3Rpb24gKGZpZWxkKSB7XG4gIHZhciBmaWVsZHMgPSBmaWVsZC5zcGxpdCgnLicpO1xuICBmaWVsZCA9IGZpZWxkcy5zaGlmdCgpO1xuXG4gIC8vIENhbGwgYSBmdW5jdGlvbiBhdCB0aGUgYmVnaW5uaW5nIHRvIHRha2UgYWR2YW50YWdlIG9mIGZhY2FkZWQgZmllbGRzXG4gIHZhciBvYmogPSB0aGlzW2ZpZWxkXSB8fCB0aGlzLmZpZWxkKGZpZWxkKTtcbiAgaWYgKCFvYmopIHJldHVybiBvYmo7XG4gIGlmICh0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nKSBvYmogPSBvYmouY2FsbCh0aGlzKSB8fCB7fTtcbiAgaWYgKGZpZWxkcy5sZW5ndGggPT09IDApIHJldHVybiB0cmFuc2Zvcm0ob2JqKTtcblxuICBvYmogPSBvYmpDYXNlKG9iaiwgZmllbGRzLmpvaW4oJy4nKSk7XG4gIHJldHVybiB0cmFuc2Zvcm0ob2JqKTtcbn07XG5cbi8qKlxuICogRGlyZWN0bHkgYWNjZXNzIGEgc3BlY2lmaWMgYGZpZWxkYCBmcm9tIHRoZSB1bmRlcmx5aW5nIG9iamVjdCwgcmV0dXJuaW5nIGFcbiAqIGNsb25lIHNvIG91dHNpZGVycyBkb24ndCBtZXNzIHdpdGggc3R1ZmYuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqL1xuXG5GYWNhZGUucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24gKGZpZWxkKSB7XG4gIHZhciBvYmogPSB0aGlzLm9ialtmaWVsZF07XG4gIHJldHVybiB0cmFuc2Zvcm0ob2JqKTtcbn07XG5cbi8qKlxuICogVXRpbGl0eSBtZXRob2QgdG8gYWx3YXlzIHByb3h5IGEgcGFydGljdWxhciBgZmllbGRgLiBZb3UgY2FuIHNwZWNpZnkgZGVlcGx5XG4gKiBuZXN0ZWQgZmllbGRzIHRvbyBsaWtlOlxuICpcbiAqICAgRmFjYWRlLnByb3h5KCdvcHRpb25zLkxpYnJhdG8nKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbkZhY2FkZS5wcm94eSA9IGZ1bmN0aW9uIChmaWVsZCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnByb3h5KGZpZWxkKTtcbiAgfTtcbn07XG5cbi8qKlxuICogVXRpbGl0eSBtZXRob2QgdG8gZGlyZWN0bHkgYWNjZXNzIGEgYGZpZWxkYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbkZhY2FkZS5maWVsZCA9IGZ1bmN0aW9uIChmaWVsZCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmZpZWxkKGZpZWxkKTtcbiAgfTtcbn07XG5cbi8qKlxuICogUHJveHkgbXVsdGlwbGUgYHBhdGhgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5GYWNhZGUubXVsdGkgPSBmdW5jdGlvbihwYXRoKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgdmFyIG11bHRpID0gdGhpcy5wcm94eShwYXRoICsgJ3MnKTtcbiAgICBpZiAoJ2FycmF5JyA9PSB0eXBlKG11bHRpKSkgcmV0dXJuIG11bHRpO1xuICAgIHZhciBvbmUgPSB0aGlzLnByb3h5KHBhdGgpO1xuICAgIGlmIChvbmUpIG9uZSA9IFtjbG9uZShvbmUpXTtcbiAgICByZXR1cm4gb25lIHx8IFtdO1xuICB9O1xufTtcblxuLyoqXG4gKiBQcm94eSBvbmUgYHBhdGhgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqL1xuXG5GYWNhZGUub25lID0gZnVuY3Rpb24ocGF0aCl7XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIHZhciBvbmUgPSB0aGlzLnByb3h5KHBhdGgpO1xuICAgIGlmIChvbmUpIHJldHVybiBvbmU7XG4gICAgdmFyIG11bHRpID0gdGhpcy5wcm94eShwYXRoICsgJ3MnKTtcbiAgICBpZiAoJ2FycmF5JyA9PSB0eXBlKG11bHRpKSkgcmV0dXJuIG11bHRpWzBdO1xuICB9O1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGJhc2ljIGpzb24gb2JqZWN0IG9mIHRoaXMgZmFjYWRlLlxuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5GYWNhZGUucHJvdG90eXBlLmpzb24gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciByZXQgPSBjbG9uZSh0aGlzLm9iaik7XG4gIGlmICh0aGlzLnR5cGUpIHJldC50eXBlID0gdGhpcy50eXBlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgb3B0aW9ucyBvZiBhIGNhbGwgKGZvcm1lcmx5IGNhbGxlZCBcImNvbnRleHRcIikuIElmIHlvdSBwYXNzIGFuXG4gKiBpbnRlZ3JhdGlvbiBuYW1lLCBpdCB3aWxsIGdldCB0aGUgb3B0aW9ucyBmb3IgdGhhdCBzcGVjaWZpYyBpbnRlZ3JhdGlvbiwgb3JcbiAqIHVuZGVmaW5lZCBpZiB0aGUgaW50ZWdyYXRpb24gaXMgbm90IGVuYWJsZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGludGVncmF0aW9uIChvcHRpb25hbClcbiAqIEByZXR1cm4ge09iamVjdCBvciBOdWxsfVxuICovXG5cbkZhY2FkZS5wcm90b3R5cGUuY29udGV4dCA9XG5GYWNhZGUucHJvdG90eXBlLm9wdGlvbnMgPSBmdW5jdGlvbiAoaW50ZWdyYXRpb24pIHtcbiAgdmFyIG9wdGlvbnMgPSBjbG9uZSh0aGlzLm9iai5vcHRpb25zIHx8IHRoaXMub2JqLmNvbnRleHQpIHx8IHt9O1xuICBpZiAoIWludGVncmF0aW9uKSByZXR1cm4gY2xvbmUob3B0aW9ucyk7XG4gIGlmICghdGhpcy5lbmFibGVkKGludGVncmF0aW9uKSkgcmV0dXJuO1xuICB2YXIgaW50ZWdyYXRpb25zID0gdGhpcy5pbnRlZ3JhdGlvbnMoKTtcbiAgdmFyIHZhbHVlID0gaW50ZWdyYXRpb25zW2ludGVncmF0aW9uXSB8fCBvYmpDYXNlKGludGVncmF0aW9ucywgaW50ZWdyYXRpb24pO1xuICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWx1ZSkgdmFsdWUgPSB7fTtcbiAgcmV0dXJuIHZhbHVlIHx8IHt9O1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGFuIGludGVncmF0aW9uIGlzIGVuYWJsZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGludGVncmF0aW9uXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbkZhY2FkZS5wcm90b3R5cGUuZW5hYmxlZCA9IGZ1bmN0aW9uIChpbnRlZ3JhdGlvbikge1xuICB2YXIgYWxsRW5hYmxlZCA9IHRoaXMucHJveHkoJ29wdGlvbnMucHJvdmlkZXJzLmFsbCcpO1xuICBpZiAodHlwZW9mIGFsbEVuYWJsZWQgIT09ICdib29sZWFuJykgYWxsRW5hYmxlZCA9IHRoaXMucHJveHkoJ29wdGlvbnMuYWxsJyk7XG4gIGlmICh0eXBlb2YgYWxsRW5hYmxlZCAhPT0gJ2Jvb2xlYW4nKSBhbGxFbmFibGVkID0gdGhpcy5wcm94eSgnaW50ZWdyYXRpb25zLmFsbCcpO1xuICBpZiAodHlwZW9mIGFsbEVuYWJsZWQgIT09ICdib29sZWFuJykgYWxsRW5hYmxlZCA9IHRydWU7XG5cbiAgdmFyIGVuYWJsZWQgPSBhbGxFbmFibGVkICYmIGlzRW5hYmxlZChpbnRlZ3JhdGlvbik7XG4gIHZhciBvcHRpb25zID0gdGhpcy5pbnRlZ3JhdGlvbnMoKTtcblxuICAvLyBJZiB0aGUgaW50ZWdyYXRpb24gaXMgZXhwbGljaXRseSBlbmFibGVkIG9yIGRpc2FibGVkLCB1c2UgdGhhdFxuICAvLyBGaXJzdCwgY2hlY2sgb3B0aW9ucy5wcm92aWRlcnMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gIGlmIChvcHRpb25zLnByb3ZpZGVycyAmJiBvcHRpb25zLnByb3ZpZGVycy5oYXNPd25Qcm9wZXJ0eShpbnRlZ3JhdGlvbikpIHtcbiAgICBlbmFibGVkID0gb3B0aW9ucy5wcm92aWRlcnNbaW50ZWdyYXRpb25dO1xuICB9XG5cbiAgLy8gTmV4dCwgY2hlY2sgZm9yIHRoZSBpbnRlZ3JhdGlvbidzIGV4aXN0ZW5jZSBpbiAnb3B0aW9ucycgdG8gZW5hYmxlIGl0LlxuICAvLyBJZiB0aGUgc2V0dGluZ3MgYXJlIGEgYm9vbGVhbiwgdXNlIHRoYXQsIG90aGVyd2lzZSBpdCBzaG91bGQgYmUgZW5hYmxlZC5cbiAgaWYgKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaW50ZWdyYXRpb24pKSB7XG4gICAgdmFyIHNldHRpbmdzID0gb3B0aW9uc1tpbnRlZ3JhdGlvbl07XG4gICAgaWYgKHR5cGVvZiBzZXR0aW5ncyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICBlbmFibGVkID0gc2V0dGluZ3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVuYWJsZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBlbmFibGVkID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuLyoqXG4gKiBHZXQgYWxsIGBpbnRlZ3JhdGlvbmAgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW50ZWdyYXRpb25cbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkZhY2FkZS5wcm90b3R5cGUuaW50ZWdyYXRpb25zID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMub2JqLmludGVncmF0aW9uc1xuICAgIHx8IHRoaXMucHJveHkoJ29wdGlvbnMucHJvdmlkZXJzJylcbiAgICB8fCB0aGlzLm9wdGlvbnMoKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgdXNlciBpcyBhY3RpdmUuXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5GYWNhZGUucHJvdG90eXBlLmFjdGl2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFjdGl2ZSA9IHRoaXMucHJveHkoJ29wdGlvbnMuYWN0aXZlJyk7XG4gIGlmIChhY3RpdmUgPT09IG51bGwgfHwgYWN0aXZlID09PSB1bmRlZmluZWQpIGFjdGl2ZSA9IHRydWU7XG4gIHJldHVybiBhY3RpdmU7XG59O1xuXG4vKipcbiAqIEdldCBgc2Vzc2lvbklkIC8gYW5vbnltb3VzSWRgLlxuICpcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5GYWNhZGUucHJvdG90eXBlLnNlc3Npb25JZCA9XG5GYWNhZGUucHJvdG90eXBlLmFub255bW91c0lkID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMuZmllbGQoJ2Fub255bW91c0lkJylcbiAgICB8fCB0aGlzLmZpZWxkKCdzZXNzaW9uSWQnKTtcbn07XG5cbi8qKlxuICogR2V0IGBncm91cElkYCBmcm9tIGBjb250ZXh0Lmdyb3VwSWRgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRmFjYWRlLnByb3RvdHlwZS5ncm91cElkID0gRmFjYWRlLnByb3h5KCdvcHRpb25zLmdyb3VwSWQnKTtcblxuLyoqXG4gKiBHZXQgdGhlIGNhbGwncyBcInN1cGVyIHByb3BlcnRpZXNcIiB3aGljaCBhcmUganVzdCB0cmFpdHMgdGhhdCBoYXZlIGJlZW5cbiAqIHBhc3NlZCBpbiBhcyBpZiBmcm9tIGFuIGlkZW50aWZ5IGNhbGwuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFsaWFzZXNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5GYWNhZGUucHJvdG90eXBlLnRyYWl0cyA9IGZ1bmN0aW9uIChhbGlhc2VzKSB7XG4gIHZhciByZXQgPSB0aGlzLnByb3h5KCdvcHRpb25zLnRyYWl0cycpIHx8IHt9O1xuICB2YXIgaWQgPSB0aGlzLnVzZXJJZCgpO1xuICBhbGlhc2VzID0gYWxpYXNlcyB8fCB7fTtcblxuICBpZiAoaWQpIHJldC5pZCA9IGlkO1xuXG4gIGZvciAodmFyIGFsaWFzIGluIGFsaWFzZXMpIHtcbiAgICB2YXIgdmFsdWUgPSBudWxsID09IHRoaXNbYWxpYXNdXG4gICAgICA/IHRoaXMucHJveHkoJ29wdGlvbnMudHJhaXRzLicgKyBhbGlhcylcbiAgICAgIDogdGhpc1thbGlhc10oKTtcbiAgICBpZiAobnVsbCA9PSB2YWx1ZSkgY29udGludWU7XG4gICAgcmV0W2FsaWFzZXNbYWxpYXNdXSA9IHZhbHVlO1xuICAgIGRlbGV0ZSByZXRbYWxpYXNdO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKlxuICogQWRkIGEgY29udmVuaWVudCB3YXkgdG8gZ2V0IHRoZSBsaWJyYXJ5IG5hbWUgYW5kIHZlcnNpb25cbiAqL1xuXG5GYWNhZGUucHJvdG90eXBlLmxpYnJhcnkgPSBmdW5jdGlvbigpe1xuICB2YXIgbGlicmFyeSA9IHRoaXMucHJveHkoJ29wdGlvbnMubGlicmFyeScpO1xuICBpZiAoIWxpYnJhcnkpIHJldHVybiB7IG5hbWU6ICd1bmtub3duJywgdmVyc2lvbjogbnVsbCB9O1xuICBpZiAodHlwZW9mIGxpYnJhcnkgPT09ICdzdHJpbmcnKSByZXR1cm4geyBuYW1lOiBsaWJyYXJ5LCB2ZXJzaW9uOiBudWxsIH07XG4gIHJldHVybiBsaWJyYXJ5O1xufTtcblxuLyoqXG4gKiBTZXR1cCBzb21lIGJhc2ljIHByb3hpZXMuXG4gKi9cblxuRmFjYWRlLnByb3RvdHlwZS51c2VySWQgPSBGYWNhZGUuZmllbGQoJ3VzZXJJZCcpO1xuRmFjYWRlLnByb3RvdHlwZS5jaGFubmVsID0gRmFjYWRlLmZpZWxkKCdjaGFubmVsJyk7XG5GYWNhZGUucHJvdG90eXBlLnRpbWVzdGFtcCA9IEZhY2FkZS5maWVsZCgndGltZXN0YW1wJyk7XG5GYWNhZGUucHJvdG90eXBlLnVzZXJBZ2VudCA9IEZhY2FkZS5wcm94eSgnb3B0aW9ucy51c2VyQWdlbnQnKTtcbkZhY2FkZS5wcm90b3R5cGUuaXAgPSBGYWNhZGUucHJveHkoJ29wdGlvbnMuaXAnKTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGNsb25lZCBhbmQgdHJhdmVyc2VkIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9ialxuICogQHJldHVybiB7TWl4ZWR9XG4gKi9cblxuZnVuY3Rpb24gdHJhbnNmb3JtKG9iail7XG4gIHZhciBjbG9uZWQgPSBjbG9uZShvYmopO1xuICByZXR1cm4gY2xvbmVkO1xufVxuIiwiXG52YXIgaXMgPSByZXF1aXJlKCdpcycpO1xudmFyIGlzb2RhdGUgPSByZXF1aXJlKCdpc29kYXRlJyk7XG52YXIgZWFjaDtcblxudHJ5IHtcbiAgZWFjaCA9IHJlcXVpcmUoJ2VhY2gnKTtcbn0gY2F0Y2ggKGVycikge1xuICBlYWNoID0gcmVxdWlyZSgnZWFjaC1jb21wb25lbnQnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2UgYHRyYXZlcnNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRyYXZlcnNlO1xuXG4vKipcbiAqIFRyYXZlcnNlIGFuIG9iamVjdCBvciBhcnJheSwgYW5kIHJldHVybiBhIGNsb25lIHdpdGggYWxsIElTTyBzdHJpbmdzIHBhcnNlZFxuICogaW50byBEYXRlIG9iamVjdHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIHRyYXZlcnNlIChpbnB1dCwgc3RyaWN0KSB7XG4gIGlmIChzdHJpY3QgPT09IHVuZGVmaW5lZCkgc3RyaWN0ID0gdHJ1ZTtcblxuICBpZiAoaXMub2JqZWN0KGlucHV0KSkgcmV0dXJuIG9iamVjdChpbnB1dCwgc3RyaWN0KTtcbiAgaWYgKGlzLmFycmF5KGlucHV0KSkgcmV0dXJuIGFycmF5KGlucHV0LCBzdHJpY3QpO1xuICByZXR1cm4gaW5wdXQ7XG59XG5cbi8qKlxuICogT2JqZWN0IHRyYXZlcnNlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHN0cmljdFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdCAob2JqLCBzdHJpY3QpIHtcbiAgZWFjaChvYmosIGZ1bmN0aW9uIChrZXksIHZhbCkge1xuICAgIGlmIChpc29kYXRlLmlzKHZhbCwgc3RyaWN0KSkge1xuICAgICAgb2JqW2tleV0gPSBpc29kYXRlLnBhcnNlKHZhbCk7XG4gICAgfSBlbHNlIGlmIChpcy5vYmplY3QodmFsKSB8fCBpcy5hcnJheSh2YWwpKSB7XG4gICAgICB0cmF2ZXJzZSh2YWwsIHN0cmljdCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBBcnJheSB0cmF2ZXJzZXIuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHN0cmljdFxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuZnVuY3Rpb24gYXJyYXkgKGFyciwgc3RyaWN0KSB7XG4gIGVhY2goYXJyLCBmdW5jdGlvbiAodmFsLCB4KSB7XG4gICAgaWYgKGlzLm9iamVjdCh2YWwpKSB7XG4gICAgICB0cmF2ZXJzZSh2YWwsIHN0cmljdCk7XG4gICAgfSBlbHNlIGlmIChpc29kYXRlLmlzKHZhbCwgc3RyaWN0KSkge1xuICAgICAgYXJyW3hdID0gaXNvZGF0ZS5wYXJzZSh2YWwpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhcnI7XG59XG4iLCJcbnZhciBpc0VtcHR5ID0gcmVxdWlyZSgnaXMtZW1wdHknKTtcblxudHJ5IHtcbiAgdmFyIHR5cGVPZiA9IHJlcXVpcmUoJ3R5cGUnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgdmFyIHR5cGVPZiA9IHJlcXVpcmUoJ2NvbXBvbmVudC10eXBlJyk7XG59XG5cblxuLyoqXG4gKiBUeXBlcy5cbiAqL1xuXG52YXIgdHlwZXMgPSBbXG4gICdhcmd1bWVudHMnLFxuICAnYXJyYXknLFxuICAnYm9vbGVhbicsXG4gICdkYXRlJyxcbiAgJ2VsZW1lbnQnLFxuICAnZnVuY3Rpb24nLFxuICAnbnVsbCcsXG4gICdudW1iZXInLFxuICAnb2JqZWN0JyxcbiAgJ3JlZ2V4cCcsXG4gICdzdHJpbmcnLFxuICAndW5kZWZpbmVkJ1xuXTtcblxuXG4vKipcbiAqIEV4cG9zZSB0eXBlIGNoZWNrZXJzLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZvciAodmFyIGkgPSAwLCB0eXBlOyB0eXBlID0gdHlwZXNbaV07IGkrKykgZXhwb3J0c1t0eXBlXSA9IGdlbmVyYXRlKHR5cGUpO1xuXG5cbi8qKlxuICogQWRkIGFsaWFzIGZvciBgZnVuY3Rpb25gIGZvciBvbGQgYnJvd3NlcnMuXG4gKi9cblxuZXhwb3J0cy5mbiA9IGV4cG9ydHNbJ2Z1bmN0aW9uJ107XG5cblxuLyoqXG4gKiBFeHBvc2UgYGVtcHR5YCBjaGVjay5cbiAqL1xuXG5leHBvcnRzLmVtcHR5ID0gaXNFbXB0eTtcblxuXG4vKipcbiAqIEV4cG9zZSBgbmFuYCBjaGVjay5cbiAqL1xuXG5leHBvcnRzLm5hbiA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgcmV0dXJuIGV4cG9ydHMubnVtYmVyKHZhbCkgJiYgdmFsICE9IHZhbDtcbn07XG5cblxuLyoqXG4gKiBHZW5lcmF0ZSBhIHR5cGUgY2hlY2tlci5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gZ2VuZXJhdGUgKHR5cGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlID09PSB0eXBlT2YodmFsdWUpO1xuICB9O1xufSIsIlxuLyoqXG4gKiBFeHBvc2UgYGlzRW1wdHlgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gaXNFbXB0eTtcblxuXG4vKipcbiAqIEhhcy5cbiAqL1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuXG4vKipcbiAqIFRlc3Qgd2hldGhlciBhIHZhbHVlIGlzIFwiZW1wdHlcIi5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gaXNFbXB0eSAodmFsKSB7XG4gIGlmIChudWxsID09IHZhbCkgcmV0dXJuIHRydWU7XG4gIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mIHZhbCkgcmV0dXJuIDAgPT09IHZhbDtcbiAgaWYgKHVuZGVmaW5lZCAhPT0gdmFsLmxlbmd0aCkgcmV0dXJuIDAgPT09IHZhbC5sZW5ndGg7XG4gIGZvciAodmFyIGtleSBpbiB2YWwpIGlmIChoYXMuY2FsbCh2YWwsIGtleSkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59XG4iLCIvKipcbiAqIHRvU3RyaW5nIHJlZi5cbiAqL1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIFJldHVybiB0aGUgdHlwZSBvZiBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWwpe1xuICBzd2l0Y2ggKHRvU3RyaW5nLmNhbGwodmFsKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOiByZXR1cm4gJ2RhdGUnO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6IHJldHVybiAncmVnZXhwJztcbiAgICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOiByZXR1cm4gJ2FyZ3VtZW50cyc7XG4gICAgY2FzZSAnW29iamVjdCBBcnJheV0nOiByZXR1cm4gJ2FycmF5JztcbiAgICBjYXNlICdbb2JqZWN0IEVycm9yXSc6IHJldHVybiAnZXJyb3InO1xuICB9XG5cbiAgaWYgKHZhbCA9PT0gbnVsbCkgcmV0dXJuICdudWxsJztcbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIGlmICh2YWwgIT09IHZhbCkgcmV0dXJuICduYW4nO1xuICBpZiAodmFsICYmIHZhbC5ub2RlVHlwZSA9PT0gMSkgcmV0dXJuICdlbGVtZW50JztcblxuICBpZiAoaXNCdWZmZXIodmFsKSkgcmV0dXJuICdidWZmZXInO1xuXG4gIHZhbCA9IHZhbC52YWx1ZU9mXG4gICAgPyB2YWwudmFsdWVPZigpXG4gICAgOiBPYmplY3QucHJvdG90eXBlLnZhbHVlT2YuYXBwbHkodmFsKTtcblxuICByZXR1cm4gdHlwZW9mIHZhbDtcbn07XG5cbi8vIGNvZGUgYm9ycm93ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2lzLWJ1ZmZlci9ibG9iL21hc3Rlci9pbmRleC5qc1xuZnVuY3Rpb24gaXNCdWZmZXIob2JqKSB7XG4gIHJldHVybiAhIShvYmogIT0gbnVsbCAmJlxuICAgIChvYmouX2lzQnVmZmVyIHx8IC8vIEZvciBTYWZhcmkgNS03IChtaXNzaW5nIE9iamVjdC5wcm90b3R5cGUuY29uc3RydWN0b3IpXG4gICAgICAob2JqLmNvbnN0cnVjdG9yICYmXG4gICAgICB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmXG4gICAgICBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIob2JqKSlcbiAgICApKVxufVxuIiwiXG4vKipcbiAqIE1hdGNoZXIsIHNsaWdodGx5IG1vZGlmaWVkIGZyb206XG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL2Nzbm92ZXIvanMtaXNvODYwMS9ibG9iL2xheC9pc284NjAxLmpzXG4gKi9cblxudmFyIG1hdGNoZXIgPSAvXihcXGR7NH0pKD86LT8oXFxkezJ9KSg/Oi0/KFxcZHsyfSkpPyk/KD86KFsgVF0pKFxcZHsyfSk6PyhcXGR7Mn0pKD86Oj8oXFxkezJ9KSg/OlssXFwuXShcXGR7MSx9KSk/KT8oPzooWil8KFsrXFwtXSkoXFxkezJ9KSg/Ojo/KFxcZHsyfSkpPyk/KT8kLztcblxuXG4vKipcbiAqIENvbnZlcnQgYW4gSVNPIGRhdGUgc3RyaW5nIHRvIGEgZGF0ZS4gRmFsbGJhY2sgdG8gbmF0aXZlIGBEYXRlLnBhcnNlYC5cbiAqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vY3Nub3Zlci9qcy1pc284NjAxL2Jsb2IvbGF4L2lzbzg2MDEuanNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaXNvXG4gKiBAcmV0dXJuIHtEYXRlfVxuICovXG5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiAoaXNvKSB7XG4gIHZhciBudW1lcmljS2V5cyA9IFsxLCA1LCA2LCA3LCAxMSwgMTJdO1xuICB2YXIgYXJyID0gbWF0Y2hlci5leGVjKGlzbyk7XG4gIHZhciBvZmZzZXQgPSAwO1xuXG4gIC8vIGZhbGxiYWNrIHRvIG5hdGl2ZSBwYXJzaW5nXG4gIGlmICghYXJyKSByZXR1cm4gbmV3IERhdGUoaXNvKTtcblxuICAvLyByZW1vdmUgdW5kZWZpbmVkIHZhbHVlc1xuICBmb3IgKHZhciBpID0gMCwgdmFsOyB2YWwgPSBudW1lcmljS2V5c1tpXTsgaSsrKSB7XG4gICAgYXJyW3ZhbF0gPSBwYXJzZUludChhcnJbdmFsXSwgMTApIHx8IDA7XG4gIH1cblxuICAvLyBhbGxvdyB1bmRlZmluZWQgZGF5cyBhbmQgbW9udGhzXG4gIGFyclsyXSA9IHBhcnNlSW50KGFyclsyXSwgMTApIHx8IDE7XG4gIGFyclszXSA9IHBhcnNlSW50KGFyclszXSwgMTApIHx8IDE7XG5cbiAgLy8gbW9udGggaXMgMC0xMVxuICBhcnJbMl0tLTtcblxuICAvLyBhbGxvdyBhYml0cmFyeSBzdWItc2Vjb25kIHByZWNpc2lvblxuICBhcnJbOF0gPSBhcnJbOF1cbiAgICA/IChhcnJbOF0gKyAnMDAnKS5zdWJzdHJpbmcoMCwgMylcbiAgICA6IDA7XG5cbiAgLy8gYXBwbHkgdGltZXpvbmUgaWYgb25lIGV4aXN0c1xuICBpZiAoYXJyWzRdID09ICcgJykge1xuICAgIG9mZnNldCA9IG5ldyBEYXRlKCkuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgfSBlbHNlIGlmIChhcnJbOV0gIT09ICdaJyAmJiBhcnJbMTBdKSB7XG4gICAgb2Zmc2V0ID0gYXJyWzExXSAqIDYwICsgYXJyWzEyXTtcbiAgICBpZiAoJysnID09IGFyclsxMF0pIG9mZnNldCA9IDAgLSBvZmZzZXQ7XG4gIH1cblxuICB2YXIgbWlsbGlzID0gRGF0ZS5VVEMoYXJyWzFdLCBhcnJbMl0sIGFyclszXSwgYXJyWzVdLCBhcnJbNl0gKyBvZmZzZXQsIGFycls3XSwgYXJyWzhdKTtcbiAgcmV0dXJuIG5ldyBEYXRlKG1pbGxpcyk7XG59O1xuXG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBgc3RyaW5nYCBpcyBhbiBJU08gZGF0ZSBzdHJpbmcuIGBzdHJpY3RgIG1vZGUgcmVxdWlyZXMgdGhhdFxuICogdGhlIGRhdGUgc3RyaW5nIGF0IGxlYXN0IGhhdmUgYSB5ZWFyLCBtb250aCBhbmQgZGF0ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHN0cmljdFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5leHBvcnRzLmlzID0gZnVuY3Rpb24gKHN0cmluZywgc3RyaWN0KSB7XG4gIGlmIChzdHJpY3QgJiYgZmFsc2UgPT09IC9eXFxkezR9LVxcZHsyfS1cXGR7Mn0vLnRlc3Qoc3RyaW5nKSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gbWF0Y2hlci50ZXN0KHN0cmluZyk7XG59OyIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0eXBlID0gcmVxdWlyZSgndHlwZScpO1xuXG4vKipcbiAqIEhPUCByZWZlcmVuY2UuXG4gKi9cblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogSXRlcmF0ZSB0aGUgZ2l2ZW4gYG9iamAgYW5kIGludm9rZSBgZm4odmFsLCBpKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl8T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBmbil7XG4gIHN3aXRjaCAodHlwZShvYmopKSB7XG4gICAgY2FzZSAnYXJyYXknOlxuICAgICAgcmV0dXJuIGFycmF5KG9iaiwgZm4pO1xuICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICBpZiAoJ251bWJlcicgPT0gdHlwZW9mIG9iai5sZW5ndGgpIHJldHVybiBhcnJheShvYmosIGZuKTtcbiAgICAgIHJldHVybiBvYmplY3Qob2JqLCBmbik7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiBzdHJpbmcob2JqLCBmbik7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBzdHJpbmcgY2hhcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG9ialxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZyhvYmosIGZuKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgKytpKSB7XG4gICAgZm4ob2JqLmNoYXJBdChpKSwgaSk7XG4gIH1cbn1cblxuLyoqXG4gKiBJdGVyYXRlIG9iamVjdCBrZXlzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBvYmplY3Qob2JqLCBmbikge1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhhcy5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgZm4oa2V5LCBvYmpba2V5XSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogSXRlcmF0ZSBhcnJheS1pc2guXG4gKlxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IG9ialxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGFycmF5KG9iaiwgZm4pIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmoubGVuZ3RoOyArK2kpIHtcbiAgICBmbihvYmpbaV0sIGkpO1xuICB9XG59IiwiXG4vKipcbiAqIEEgZmV3IGludGVncmF0aW9ucyBhcmUgZGlzYWJsZWQgYnkgZGVmYXVsdC4gVGhleSBtdXN0IGJlIGV4cGxpY2l0bHlcbiAqIGVuYWJsZWQgYnkgc2V0dGluZyBvcHRpb25zW1Byb3ZpZGVyXSA9IHRydWUuXG4gKi9cblxudmFyIGRpc2FibGVkID0ge1xuICBTYWxlc2ZvcmNlOiB0cnVlXG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYW4gaW50ZWdyYXRpb24gc2hvdWxkIGJlIGVuYWJsZWQgYnkgZGVmYXVsdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW50ZWdyYXRpb25cbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW50ZWdyYXRpb24pIHtcbiAgcmV0dXJuICEgZGlzYWJsZWRbaW50ZWdyYXRpb25dO1xufTsiLCJcbi8qKlxuICogVE9ETzogdXNlIGNvbXBvbmVudCBzeW1saW5rLCBldmVyeXdoZXJlID9cbiAqL1xuXG50cnkge1xuICBleHBvcnRzLmluaGVyaXQgPSByZXF1aXJlKCdpbmhlcml0Jyk7XG4gIGV4cG9ydHMuY2xvbmUgPSByZXF1aXJlKCdjbG9uZScpO1xuICBleHBvcnRzLnR5cGUgPSByZXF1aXJlKCd0eXBlJyk7XG59IGNhdGNoIChlKSB7XG4gIGV4cG9ydHMuaW5oZXJpdCA9IHJlcXVpcmUoJ2luaGVyaXQtY29tcG9uZW50Jyk7XG4gIGV4cG9ydHMuY2xvbmUgPSByZXF1aXJlKCdjbG9uZS1jb21wb25lbnQnKTtcbiAgZXhwb3J0cy50eXBlID0gcmVxdWlyZSgndHlwZS1jb21wb25lbnQnKTtcbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhLCBiKXtcbiAgdmFyIGZuID0gZnVuY3Rpb24oKXt9O1xuICBmbi5wcm90b3R5cGUgPSBiLnByb3RvdHlwZTtcbiAgYS5wcm90b3R5cGUgPSBuZXcgZm47XG4gIGEucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYTtcbn07IiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0eXBlO1xudHJ5IHtcbiAgdHlwZSA9IHJlcXVpcmUoJ2NvbXBvbmVudC10eXBlJyk7XG59IGNhdGNoIChfKSB7XG4gIHR5cGUgPSByZXF1aXJlKCd0eXBlJyk7XG59XG5cbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZTtcblxuLyoqXG4gKiBDbG9uZXMgb2JqZWN0cy5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBhbnkgb2JqZWN0XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGNsb25lKG9iail7XG4gIHN3aXRjaCAodHlwZShvYmopKSB7XG4gICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgIHZhciBjb3B5ID0ge307XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIGNvcHlba2V5XSA9IGNsb25lKG9ialtrZXldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGNvcHk7XG5cbiAgICBjYXNlICdhcnJheSc6XG4gICAgICB2YXIgY29weSA9IG5ldyBBcnJheShvYmoubGVuZ3RoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBjb3B5W2ldID0gY2xvbmUob2JqW2ldKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb3B5O1xuXG4gICAgY2FzZSAncmVnZXhwJzpcbiAgICAgIC8vIGZyb20gbWlsbGVybWVkZWlyb3MvYW1kLXV0aWxzIC0gTUlUXG4gICAgICB2YXIgZmxhZ3MgPSAnJztcbiAgICAgIGZsYWdzICs9IG9iai5tdWx0aWxpbmUgPyAnbScgOiAnJztcbiAgICAgIGZsYWdzICs9IG9iai5nbG9iYWwgPyAnZycgOiAnJztcbiAgICAgIGZsYWdzICs9IG9iai5pZ25vcmVDYXNlID8gJ2knIDogJyc7XG4gICAgICByZXR1cm4gbmV3IFJlZ0V4cChvYmouc291cmNlLCBmbGFncyk7XG5cbiAgICBjYXNlICdkYXRlJzpcbiAgICAgIHJldHVybiBuZXcgRGF0ZShvYmouZ2V0VGltZSgpKTtcblxuICAgIGRlZmF1bHQ6IC8vIHN0cmluZywgbnVtYmVyLCBib29sZWFuLCDigKZcbiAgICAgIHJldHVybiBvYmo7XG4gIH1cbn1cbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBnZXQgPSByZXF1aXJlKCdvYmotY2FzZScpO1xuXG4vKipcbiAqIEFkZCBhZGRyZXNzIGdldHRlcnMgdG8gYHByb3RvYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcm90b1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocHJvdG8pe1xuICBwcm90by56aXAgPSB0cmFpdCgncG9zdGFsQ29kZScsICd6aXAnKTtcbiAgcHJvdG8uY291bnRyeSA9IHRyYWl0KCdjb3VudHJ5Jyk7XG4gIHByb3RvLnN0cmVldCA9IHRyYWl0KCdzdHJlZXQnKTtcbiAgcHJvdG8uc3RhdGUgPSB0cmFpdCgnc3RhdGUnKTtcbiAgcHJvdG8uY2l0eSA9IHRyYWl0KCdjaXR5Jyk7XG5cbiAgZnVuY3Rpb24gdHJhaXQoYSwgYil7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgdHJhaXRzID0gdGhpcy50cmFpdHMoKTtcbiAgICAgIHZhciBwcm9wcyA9IHRoaXMucHJvcGVydGllcyA/IHRoaXMucHJvcGVydGllcygpIDoge307XG5cbiAgICAgIHJldHVybiBnZXQodHJhaXRzLCAnYWRkcmVzcy4nICsgYSlcbiAgICAgICAgfHwgZ2V0KHRyYWl0cywgYSlcbiAgICAgICAgfHwgKGIgPyBnZXQodHJhaXRzLCAnYWRkcmVzcy4nICsgYikgOiBudWxsKVxuICAgICAgICB8fCAoYiA/IGdldCh0cmFpdHMsIGIpIDogbnVsbClcbiAgICAgICAgfHwgZ2V0KHByb3BzLCAnYWRkcmVzcy4nICsgYSlcbiAgICAgICAgfHwgZ2V0KHByb3BzLCBhKVxuICAgICAgICB8fCAoYiA/IGdldChwcm9wcywgJ2FkZHJlc3MuJyArIGIpIDogbnVsbClcbiAgICAgICAgfHwgKGIgPyBnZXQocHJvcHMsIGIpIDogbnVsbCk7XG4gICAgfTtcbiAgfVxufTtcbiIsIlxudmFyIGlkZW50aXR5ID0gZnVuY3Rpb24oXyl7IHJldHVybiBfOyB9O1xuXG5cbi8qKlxuICogTW9kdWxlIGV4cG9ydHMsIGV4cG9ydFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gbXVsdGlwbGUoZmluZCk7XG5tb2R1bGUuZXhwb3J0cy5maW5kID0gbW9kdWxlLmV4cG9ydHM7XG5cblxuLyoqXG4gKiBFeHBvcnQgdGhlIHJlcGxhY2VtZW50IGZ1bmN0aW9uLCByZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuICovXG5cbm1vZHVsZS5leHBvcnRzLnJlcGxhY2UgPSBmdW5jdGlvbiAob2JqLCBrZXksIHZhbCwgb3B0aW9ucykge1xuICBtdWx0aXBsZShyZXBsYWNlKS5jYWxsKHRoaXMsIG9iaiwga2V5LCB2YWwsIG9wdGlvbnMpO1xuICByZXR1cm4gb2JqO1xufTtcblxuXG4vKipcbiAqIEV4cG9ydCB0aGUgZGVsZXRlIGZ1bmN0aW9uLCByZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuICovXG5cbm1vZHVsZS5leHBvcnRzLmRlbCA9IGZ1bmN0aW9uIChvYmosIGtleSwgb3B0aW9ucykge1xuICBtdWx0aXBsZShkZWwpLmNhbGwodGhpcywgb2JqLCBrZXksIG51bGwsIG9wdGlvbnMpO1xuICByZXR1cm4gb2JqO1xufTtcblxuXG4vKipcbiAqIENvbXBvc2UgYXBwbHlpbmcgdGhlIGZ1bmN0aW9uIHRvIGEgbmVzdGVkIGtleVxuICovXG5cbmZ1bmN0aW9uIG11bHRpcGxlIChmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsLCBvcHRpb25zKSB7XG4gICAgdmFyIG5vcm1hbGl6ZSA9IG9wdGlvbnMgJiYgaXNGdW5jdGlvbihvcHRpb25zLm5vcm1hbGl6ZXIpID8gb3B0aW9ucy5ub3JtYWxpemVyIDogZGVmYXVsdE5vcm1hbGl6ZTtcbiAgICBwYXRoID0gbm9ybWFsaXplKHBhdGgpO1xuXG4gICAgdmFyIGtleTtcbiAgICB2YXIgZmluaXNoZWQgPSBmYWxzZTtcblxuICAgIHdoaWxlICghZmluaXNoZWQpIGxvb3AoKTtcblxuICAgIGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWRLZXkgPSBub3JtYWxpemUoa2V5KTtcbiAgICAgICAgaWYgKDAgPT09IHBhdGguaW5kZXhPZihub3JtYWxpemVkS2V5KSkge1xuICAgICAgICAgIHZhciB0ZW1wID0gcGF0aC5zdWJzdHIobm9ybWFsaXplZEtleS5sZW5ndGgpO1xuICAgICAgICAgIGlmICh0ZW1wLmNoYXJBdCgwKSA9PT0gJy4nIHx8IHRlbXAubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBwYXRoID0gdGVtcC5zdWJzdHIoMSk7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBvYmpba2V5XTtcblxuICAgICAgICAgICAgLy8gd2UncmUgYXQgdGhlIGVuZCBhbmQgdGhlcmUgaXMgbm90aGluZy5cbiAgICAgICAgICAgIGlmIChudWxsID09IGNoaWxkKSB7XG4gICAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB3ZSdyZSBhdCB0aGUgZW5kIGFuZCB0aGVyZSBpcyBzb21ldGhpbmcuXG4gICAgICAgICAgICBpZiAoIXBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzdGVwIGludG8gY2hpbGRcbiAgICAgICAgICAgIG9iaiA9IGNoaWxkO1xuXG4gICAgICAgICAgICAvLyBidXQgd2UncmUgZG9uZSBoZXJlXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGtleSA9IHVuZGVmaW5lZDtcbiAgICAgIC8vIGlmIHdlIGZvdW5kIG5vIG1hdGNoaW5nIHByb3BlcnRpZXNcbiAgICAgIC8vIG9uIHRoZSBjdXJyZW50IG9iamVjdCwgdGhlcmUncyBubyBtYXRjaC5cbiAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIWtleSkgcmV0dXJuO1xuICAgIGlmIChudWxsID09IG9iaikgcmV0dXJuIG9iajtcblxuICAgIC8vIHRoZSBgb2JqYCBhbmQgYGtleWAgaXMgb25lIGFib3ZlIHRoZSBsZWFmIG9iamVjdCBhbmQga2V5LCBzb1xuICAgIC8vIHN0YXJ0IG9iamVjdDogeyBhOiB7ICdiLmMnOiAxMCB9IH1cbiAgICAvLyBlbmQgb2JqZWN0OiB7ICdiLmMnOiAxMCB9XG4gICAgLy8gZW5kIGtleTogJ2IuYydcbiAgICAvLyB0aGlzIHdheSwgeW91IGNhbiBkbyBgb2JqW2tleV1gIGFuZCBnZXQgYDEwYC5cbiAgICByZXR1cm4gZm4ob2JqLCBrZXksIHZhbCk7XG4gIH07XG59XG5cblxuLyoqXG4gKiBGaW5kIGFuIG9iamVjdCBieSBpdHMga2V5XG4gKlxuICogZmluZCh7IGZpcnN0X25hbWUgOiAnQ2FsdmluJyB9LCAnZmlyc3ROYW1lJylcbiAqL1xuXG5mdW5jdGlvbiBmaW5kIChvYmosIGtleSkge1xuICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHJldHVybiBvYmpba2V5XTtcbn1cblxuXG4vKipcbiAqIERlbGV0ZSBhIHZhbHVlIGZvciBhIGdpdmVuIGtleVxuICpcbiAqIGRlbCh7IGEgOiAnYicsIHggOiAneScgfSwgJ1gnIH0pIC0+IHsgYSA6ICdiJyB9XG4gKi9cblxuZnVuY3Rpb24gZGVsIChvYmosIGtleSkge1xuICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIGRlbGV0ZSBvYmpba2V5XTtcbiAgcmV0dXJuIG9iajtcbn1cblxuXG4vKipcbiAqIFJlcGxhY2UgYW4gb2JqZWN0cyBleGlzdGluZyB2YWx1ZSB3aXRoIGEgbmV3IG9uZVxuICpcbiAqIHJlcGxhY2UoeyBhIDogJ2InIH0sICdhJywgJ2MnKSAtPiB7IGEgOiAnYycgfVxuICovXG5cbmZ1bmN0aW9uIHJlcGxhY2UgKG9iaiwga2V5LCB2YWwpIHtcbiAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSBvYmpba2V5XSA9IHZhbDtcbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSBgZG90LnNlcGFyYXRlZC5wYXRoYC5cbiAqXG4gKiBBLkhFTEwoISomIyghKU9fV09SICAgTEQuYmFyID0+IGFoZWxsb3dvcmxkYmFyXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBkZWZhdWx0Tm9ybWFsaXplKHBhdGgpIHtcbiAgcmV0dXJuIHBhdGgucmVwbGFjZSgvW15hLXpBLVowLTlcXC5dKy9nLCAnJykudG9Mb3dlckNhc2UoKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIHZhbHVlIGlzIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWxgIGlzIGEgZnVuY3Rpb24sIG90aGVyd2lzZSBgZmFsc2VgLlxuICovXG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nO1xufVxuIiwiXG52YXIgaXMgPSByZXF1aXJlKCdpcycpO1xudmFyIGlzb2RhdGUgPSByZXF1aXJlKCdpc29kYXRlJyk7XG52YXIgbWlsbGlzZWNvbmRzID0gcmVxdWlyZSgnLi9taWxsaXNlY29uZHMnKTtcbnZhciBzZWNvbmRzID0gcmVxdWlyZSgnLi9zZWNvbmRzJyk7XG5cblxuLyoqXG4gKiBSZXR1cm5zIGEgbmV3IEphdmFzY3JpcHQgRGF0ZSBvYmplY3QsIGFsbG93aW5nIGEgdmFyaWV0eSBvZiBleHRyYSBpbnB1dCB0eXBlc1xuICogb3ZlciB0aGUgbmF0aXZlIERhdGUgY29uc3RydWN0b3IuXG4gKlxuICogQHBhcmFtIHtEYXRlfFN0cmluZ3xOdW1iZXJ9IHZhbFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbmV3RGF0ZSAodmFsKSB7XG4gIGlmIChpcy5kYXRlKHZhbCkpIHJldHVybiB2YWw7XG4gIGlmIChpcy5udW1iZXIodmFsKSkgcmV0dXJuIG5ldyBEYXRlKHRvTXModmFsKSk7XG5cbiAgLy8gZGF0ZSBzdHJpbmdzXG4gIGlmIChpc29kYXRlLmlzKHZhbCkpIHJldHVybiBpc29kYXRlLnBhcnNlKHZhbCk7XG4gIGlmIChtaWxsaXNlY29uZHMuaXModmFsKSkgcmV0dXJuIG1pbGxpc2Vjb25kcy5wYXJzZSh2YWwpO1xuICBpZiAoc2Vjb25kcy5pcyh2YWwpKSByZXR1cm4gc2Vjb25kcy5wYXJzZSh2YWwpO1xuXG4gIC8vIGZhbGxiYWNrIHRvIERhdGUucGFyc2VcbiAgcmV0dXJuIG5ldyBEYXRlKHZhbCk7XG59O1xuXG5cbi8qKlxuICogSWYgdGhlIG51bWJlciBwYXNzZWQgdmFsIGlzIHNlY29uZHMgZnJvbSB0aGUgZXBvY2gsIHR1cm4gaXQgaW50byBtaWxsaXNlY29uZHMuXG4gKiBNaWxsaXNlY29uZHMgd291bGQgYmUgZ3JlYXRlciB0aGFuIDMxNTU3NjAwMDAwIChEZWNlbWJlciAzMSwgMTk3MCkuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG51bVxuICovXG5cbmZ1bmN0aW9uIHRvTXMgKG51bSkge1xuICBpZiAobnVtIDwgMzE1NTc2MDAwMDApIHJldHVybiBudW0gKiAxMDAwO1xuICByZXR1cm4gbnVtO1xufSIsIlxudmFyIGlzRW1wdHkgPSByZXF1aXJlKCdpcy1lbXB0eScpXG4gICwgdHlwZU9mID0gcmVxdWlyZSgndHlwZScpO1xuXG5cbi8qKlxuICogVHlwZXMuXG4gKi9cblxudmFyIHR5cGVzID0gW1xuICAnYXJndW1lbnRzJyxcbiAgJ2FycmF5JyxcbiAgJ2Jvb2xlYW4nLFxuICAnZGF0ZScsXG4gICdlbGVtZW50JyxcbiAgJ2Z1bmN0aW9uJyxcbiAgJ251bGwnLFxuICAnbnVtYmVyJyxcbiAgJ29iamVjdCcsXG4gICdyZWdleHAnLFxuICAnc3RyaW5nJyxcbiAgJ3VuZGVmaW5lZCdcbl07XG5cblxuLyoqXG4gKiBFeHBvc2UgdHlwZSBjaGVja2Vycy5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mb3IgKHZhciBpID0gMCwgdHlwZTsgdHlwZSA9IHR5cGVzW2ldOyBpKyspIGV4cG9ydHNbdHlwZV0gPSBnZW5lcmF0ZSh0eXBlKTtcblxuXG4vKipcbiAqIEFkZCBhbGlhcyBmb3IgYGZ1bmN0aW9uYCBmb3Igb2xkIGJyb3dzZXJzLlxuICovXG5cbmV4cG9ydHMuZm4gPSBleHBvcnRzWydmdW5jdGlvbiddO1xuXG5cbi8qKlxuICogRXhwb3NlIGBlbXB0eWAgY2hlY2suXG4gKi9cblxuZXhwb3J0cy5lbXB0eSA9IGlzRW1wdHk7XG5cblxuLyoqXG4gKiBFeHBvc2UgYG5hbmAgY2hlY2suXG4gKi9cblxuZXhwb3J0cy5uYW4gPSBmdW5jdGlvbiAodmFsKSB7XG4gIHJldHVybiBleHBvcnRzLm51bWJlcih2YWwpICYmIHZhbCAhPSB2YWw7XG59O1xuXG5cbi8qKlxuICogR2VuZXJhdGUgYSB0eXBlIGNoZWNrZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIGdlbmVyYXRlICh0eXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gdHlwZU9mKHZhbHVlKTtcbiAgfTtcbn0iLCJcbi8qKlxuICogTWF0Y2hlci5cbiAqL1xuXG52YXIgbWF0Y2hlciA9IC9cXGR7MTN9LztcblxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBzdHJpbmcgaXMgYSBtaWxsaXNlY29uZCBkYXRlIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmV4cG9ydHMuaXMgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gIHJldHVybiBtYXRjaGVyLnRlc3Qoc3RyaW5nKTtcbn07XG5cblxuLyoqXG4gKiBDb252ZXJ0IGEgbWlsbGlzZWNvbmQgc3RyaW5nIHRvIGEgZGF0ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWlsbGlzXG4gKiBAcmV0dXJuIHtEYXRlfVxuICovXG5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiAobWlsbGlzKSB7XG4gIG1pbGxpcyA9IHBhcnNlSW50KG1pbGxpcywgMTApO1xuICByZXR1cm4gbmV3IERhdGUobWlsbGlzKTtcbn07IiwiXG4vKipcbiAqIE1hdGNoZXIuXG4gKi9cblxudmFyIG1hdGNoZXIgPSAvXFxkezEwfS87XG5cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGEgc3RyaW5nIGlzIGEgc2Vjb25kIGRhdGUgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZXhwb3J0cy5pcyA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgcmV0dXJuIG1hdGNoZXIudGVzdChzdHJpbmcpO1xufTtcblxuXG4vKipcbiAqIENvbnZlcnQgYSBzZWNvbmQgc3RyaW5nIHRvIGEgZGF0ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc2Vjb25kc1xuICogQHJldHVybiB7RGF0ZX1cbiAqL1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gKHNlY29uZHMpIHtcbiAgdmFyIG1pbGxpcyA9IHBhcnNlSW50KHNlY29uZHMsIDEwKSAqIDEwMDA7XG4gIHJldHVybiBuZXcgRGF0ZShtaWxsaXMpO1xufTsiLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgaW5oZXJpdCA9IHJlcXVpcmUoJy4vdXRpbHMnKS5pbmhlcml0O1xudmFyIEZhY2FkZSA9IHJlcXVpcmUoJy4vZmFjYWRlJyk7XG5cbi8qKlxuICogRXhwb3NlIGBBbGlhc2AgZmFjYWRlLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gQWxpYXM7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgQWxpYXNgIGZhY2FkZSB3aXRoIGEgYGRpY3Rpb25hcnlgIG9mIGFyZ3VtZW50cy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGljdGlvbmFyeVxuICogICBAcHJvcGVydHkge1N0cmluZ30gZnJvbVxuICogICBAcHJvcGVydHkge1N0cmluZ30gdG9cbiAqICAgQHByb3BlcnR5IHtPYmplY3R9IG9wdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBBbGlhcyAoZGljdGlvbmFyeSkge1xuICBGYWNhZGUuY2FsbCh0aGlzLCBkaWN0aW9uYXJ5KTtcbn1cblxuLyoqXG4gKiBJbmhlcml0IGZyb20gYEZhY2FkZWAuXG4gKi9cblxuaW5oZXJpdChBbGlhcywgRmFjYWRlKTtcblxuLyoqXG4gKiBSZXR1cm4gdHlwZSBvZiBmYWNhZGUuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbkFsaWFzLnByb3RvdHlwZS50eXBlID1cbkFsaWFzLnByb3RvdHlwZS5hY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAnYWxpYXMnO1xufTtcblxuLyoqXG4gKiBHZXQgYHByZXZpb3VzSWRgLlxuICpcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5BbGlhcy5wcm90b3R5cGUuZnJvbSA9XG5BbGlhcy5wcm90b3R5cGUucHJldmlvdXNJZCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLmZpZWxkKCdwcmV2aW91c0lkJylcbiAgICB8fCB0aGlzLmZpZWxkKCdmcm9tJyk7XG59O1xuXG4vKipcbiAqIEdldCBgdXNlcklkYC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkFsaWFzLnByb3RvdHlwZS50byA9XG5BbGlhcy5wcm90b3R5cGUudXNlcklkID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMuZmllbGQoJ3VzZXJJZCcpXG4gICAgfHwgdGhpcy5maWVsZCgndG8nKTtcbn07XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgaW5oZXJpdCA9IHJlcXVpcmUoJy4vdXRpbHMnKS5pbmhlcml0O1xudmFyIGFkZHJlc3MgPSByZXF1aXJlKCcuL2FkZHJlc3MnKTtcbnZhciBpc0VtYWlsID0gcmVxdWlyZSgnaXMtZW1haWwnKTtcbnZhciBuZXdEYXRlID0gcmVxdWlyZSgnbmV3LWRhdGUnKTtcbnZhciBGYWNhZGUgPSByZXF1aXJlKCcuL2ZhY2FkZScpO1xuXG4vKipcbiAqIEV4cG9zZSBgR3JvdXBgIGZhY2FkZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdyb3VwO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEdyb3VwYCBmYWNhZGUgd2l0aCBhIGBkaWN0aW9uYXJ5YCBvZiBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRpY3Rpb25hcnlcbiAqICAgQHBhcmFtIHtTdHJpbmd9IHVzZXJJZFxuICogICBAcGFyYW0ge1N0cmluZ30gZ3JvdXBJZFxuICogICBAcGFyYW0ge09iamVjdH0gcHJvcGVydGllc1xuICogICBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIEdyb3VwIChkaWN0aW9uYXJ5KSB7XG4gIEZhY2FkZS5jYWxsKHRoaXMsIGRpY3Rpb25hcnkpO1xufVxuXG4vKipcbiAqIEluaGVyaXQgZnJvbSBgRmFjYWRlYFxuICovXG5cbmluaGVyaXQoR3JvdXAsIEZhY2FkZSk7XG5cbi8qKlxuICogR2V0IHRoZSBmYWNhZGUncyBhY3Rpb24uXG4gKi9cblxuR3JvdXAucHJvdG90eXBlLnR5cGUgPVxuR3JvdXAucHJvdG90eXBlLmFjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICdncm91cCc7XG59O1xuXG4vKipcbiAqIFNldHVwIHNvbWUgYmFzaWMgcHJveGllcy5cbiAqL1xuXG5Hcm91cC5wcm90b3R5cGUuZ3JvdXBJZCA9IEZhY2FkZS5maWVsZCgnZ3JvdXBJZCcpO1xuXG4vKipcbiAqIEdldCBjcmVhdGVkIG9yIGNyZWF0ZWRBdC5cbiAqXG4gKiBAcmV0dXJuIHtEYXRlfVxuICovXG5cbkdyb3VwLnByb3RvdHlwZS5jcmVhdGVkID0gZnVuY3Rpb24oKXtcbiAgdmFyIGNyZWF0ZWQgPSB0aGlzLnByb3h5KCd0cmFpdHMuY3JlYXRlZEF0JylcbiAgICB8fCB0aGlzLnByb3h5KCd0cmFpdHMuY3JlYXRlZCcpXG4gICAgfHwgdGhpcy5wcm94eSgncHJvcGVydGllcy5jcmVhdGVkQXQnKVxuICAgIHx8IHRoaXMucHJveHkoJ3Byb3BlcnRpZXMuY3JlYXRlZCcpO1xuXG4gIGlmIChjcmVhdGVkKSByZXR1cm4gbmV3RGF0ZShjcmVhdGVkKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBncm91cCdzIGVtYWlsLCBmYWxsaW5nIGJhY2sgdG8gdGhlIGdyb3VwIElEIGlmIGl0J3MgYSB2YWxpZCBlbWFpbC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuR3JvdXAucHJvdG90eXBlLmVtYWlsID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZW1haWwgPSB0aGlzLnByb3h5KCd0cmFpdHMuZW1haWwnKTtcbiAgaWYgKGVtYWlsKSByZXR1cm4gZW1haWw7XG4gIHZhciBncm91cElkID0gdGhpcy5ncm91cElkKCk7XG4gIGlmIChpc0VtYWlsKGdyb3VwSWQpKSByZXR1cm4gZ3JvdXBJZDtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBncm91cCdzIHRyYWl0cy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYWxpYXNlc1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbkdyb3VwLnByb3RvdHlwZS50cmFpdHMgPSBmdW5jdGlvbiAoYWxpYXNlcykge1xuICB2YXIgcmV0ID0gdGhpcy5wcm9wZXJ0aWVzKCk7XG4gIHZhciBpZCA9IHRoaXMuZ3JvdXBJZCgpO1xuICBhbGlhc2VzID0gYWxpYXNlcyB8fCB7fTtcblxuICBpZiAoaWQpIHJldC5pZCA9IGlkO1xuXG4gIGZvciAodmFyIGFsaWFzIGluIGFsaWFzZXMpIHtcbiAgICB2YXIgdmFsdWUgPSBudWxsID09IHRoaXNbYWxpYXNdXG4gICAgICA/IHRoaXMucHJveHkoJ3RyYWl0cy4nICsgYWxpYXMpXG4gICAgICA6IHRoaXNbYWxpYXNdKCk7XG4gICAgaWYgKG51bGwgPT0gdmFsdWUpIGNvbnRpbnVlO1xuICAgIHJldFthbGlhc2VzW2FsaWFzXV0gPSB2YWx1ZTtcbiAgICBkZWxldGUgcmV0W2FsaWFzXTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59O1xuXG4vKipcbiAqIFNwZWNpYWwgdHJhaXRzLlxuICovXG5cbkdyb3VwLnByb3RvdHlwZS5uYW1lID0gRmFjYWRlLnByb3h5KCd0cmFpdHMubmFtZScpO1xuR3JvdXAucHJvdG90eXBlLmluZHVzdHJ5ID0gRmFjYWRlLnByb3h5KCd0cmFpdHMuaW5kdXN0cnknKTtcbkdyb3VwLnByb3RvdHlwZS5lbXBsb3llZXMgPSBGYWNhZGUucHJveHkoJ3RyYWl0cy5lbXBsb3llZXMnKTtcblxuLyoqXG4gKiBHZXQgdHJhaXRzIG9yIHByb3BlcnRpZXMuXG4gKlxuICogVE9ETzogcmVtb3ZlIG1lXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbkdyb3VwLnByb3RvdHlwZS5wcm9wZXJ0aWVzID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMuZmllbGQoJ3RyYWl0cycpXG4gICAgfHwgdGhpcy5maWVsZCgncHJvcGVydGllcycpXG4gICAgfHwge307XG59O1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgaXNFbWFpbGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBpc0VtYWlsO1xuXG5cbi8qKlxuICogRW1haWwgYWRkcmVzcyBtYXRjaGVyLlxuICovXG5cbnZhciBtYXRjaGVyID0gLy4rXFxALitcXC4uKy87XG5cblxuLyoqXG4gKiBMb29zZWx5IHZhbGlkYXRlIGFuIGVtYWlsIGFkZHJlc3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc0VtYWlsIChzdHJpbmcpIHtcbiAgcmV0dXJuIG1hdGNoZXIudGVzdChzdHJpbmcpO1xufSIsIlxudmFyIGFkZHJlc3MgPSByZXF1aXJlKCcuL2FkZHJlc3MnKTtcbnZhciBGYWNhZGUgPSByZXF1aXJlKCcuL2ZhY2FkZScpO1xudmFyIGlzRW1haWwgPSByZXF1aXJlKCdpcy1lbWFpbCcpO1xudmFyIG5ld0RhdGUgPSByZXF1aXJlKCduZXctZGF0ZScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGdldCA9IHJlcXVpcmUoJ29iai1jYXNlJyk7XG52YXIgdHJpbSA9IHJlcXVpcmUoJ3RyaW0nKTtcbnZhciBpbmhlcml0ID0gdXRpbHMuaW5oZXJpdDtcbnZhciBjbG9uZSA9IHV0aWxzLmNsb25lO1xudmFyIHR5cGUgPSB1dGlscy50eXBlO1xuXG4vKipcbiAqIEV4cG9zZSBgSWRlbmZpdHlgIGZhY2FkZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IElkZW50aWZ5O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYElkZW50aWZ5YCBmYWNhZGUgd2l0aCBhIGBkaWN0aW9uYXJ5YCBvZiBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRpY3Rpb25hcnlcbiAqICAgQHBhcmFtIHtTdHJpbmd9IHVzZXJJZFxuICogICBAcGFyYW0ge1N0cmluZ30gc2Vzc2lvbklkXG4gKiAgIEBwYXJhbSB7T2JqZWN0fSB0cmFpdHNcbiAqICAgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBJZGVudGlmeSAoZGljdGlvbmFyeSkge1xuICBGYWNhZGUuY2FsbCh0aGlzLCBkaWN0aW9uYXJ5KTtcbn1cblxuLyoqXG4gKiBJbmhlcml0IGZyb20gYEZhY2FkZWAuXG4gKi9cblxuaW5oZXJpdChJZGVudGlmeSwgRmFjYWRlKTtcblxuLyoqXG4gKiBHZXQgdGhlIGZhY2FkZSdzIGFjdGlvbi5cbiAqL1xuXG5JZGVudGlmeS5wcm90b3R5cGUudHlwZSA9XG5JZGVudGlmeS5wcm90b3R5cGUuYWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gJ2lkZW50aWZ5Jztcbn07XG5cbi8qKlxuICogR2V0IHRoZSB1c2VyJ3MgdHJhaXRzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhbGlhc2VzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuSWRlbnRpZnkucHJvdG90eXBlLnRyYWl0cyA9IGZ1bmN0aW9uIChhbGlhc2VzKSB7XG4gIHZhciByZXQgPSB0aGlzLmZpZWxkKCd0cmFpdHMnKSB8fCB7fTtcbiAgdmFyIGlkID0gdGhpcy51c2VySWQoKTtcbiAgYWxpYXNlcyA9IGFsaWFzZXMgfHwge307XG5cbiAgaWYgKGlkKSByZXQuaWQgPSBpZDtcblxuICBmb3IgKHZhciBhbGlhcyBpbiBhbGlhc2VzKSB7XG4gICAgdmFyIHZhbHVlID0gbnVsbCA9PSB0aGlzW2FsaWFzXVxuICAgICAgPyB0aGlzLnByb3h5KCd0cmFpdHMuJyArIGFsaWFzKVxuICAgICAgOiB0aGlzW2FsaWFzXSgpO1xuICAgIGlmIChudWxsID09IHZhbHVlKSBjb250aW51ZTtcbiAgICByZXRbYWxpYXNlc1thbGlhc11dID0gdmFsdWU7XG4gICAgaWYgKGFsaWFzICE9PSBhbGlhc2VzW2FsaWFzXSkgZGVsZXRlIHJldFthbGlhc107XG4gIH1cblxuICByZXR1cm4gcmV0O1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHVzZXIncyBlbWFpbCwgZmFsbGluZyBiYWNrIHRvIHRoZWlyIHVzZXIgSUQgaWYgaXQncyBhIHZhbGlkIGVtYWlsLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5JZGVudGlmeS5wcm90b3R5cGUuZW1haWwgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlbWFpbCA9IHRoaXMucHJveHkoJ3RyYWl0cy5lbWFpbCcpO1xuICBpZiAoZW1haWwpIHJldHVybiBlbWFpbDtcblxuICB2YXIgdXNlcklkID0gdGhpcy51c2VySWQoKTtcbiAgaWYgKGlzRW1haWwodXNlcklkKSkgcmV0dXJuIHVzZXJJZDtcbn07XG5cbi8qKlxuICogR2V0IHRoZSB1c2VyJ3MgY3JlYXRlZCBkYXRlLCBvcHRpb25hbGx5IGxvb2tpbmcgZm9yIGBjcmVhdGVkQXRgIHNpbmNlIGxvdHMgb2ZcbiAqIHBlb3BsZSBkbyB0aGF0IGluc3RlYWQuXG4gKlxuICogQHJldHVybiB7RGF0ZSBvciBVbmRlZmluZWR9XG4gKi9cblxuSWRlbnRpZnkucHJvdG90eXBlLmNyZWF0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjcmVhdGVkID0gdGhpcy5wcm94eSgndHJhaXRzLmNyZWF0ZWQnKSB8fCB0aGlzLnByb3h5KCd0cmFpdHMuY3JlYXRlZEF0Jyk7XG4gIGlmIChjcmVhdGVkKSByZXR1cm4gbmV3RGF0ZShjcmVhdGVkKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBjb21wYW55IGNyZWF0ZWQgZGF0ZS5cbiAqXG4gKiBAcmV0dXJuIHtEYXRlIG9yIHVuZGVmaW5lZH1cbiAqL1xuXG5JZGVudGlmeS5wcm90b3R5cGUuY29tcGFueUNyZWF0ZWQgPSBmdW5jdGlvbigpe1xuICB2YXIgY3JlYXRlZCA9IHRoaXMucHJveHkoJ3RyYWl0cy5jb21wYW55LmNyZWF0ZWQnKVxuICAgIHx8IHRoaXMucHJveHkoJ3RyYWl0cy5jb21wYW55LmNyZWF0ZWRBdCcpO1xuXG4gIGlmIChjcmVhdGVkKSByZXR1cm4gbmV3RGF0ZShjcmVhdGVkKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSB1c2VyJ3MgbmFtZSwgb3B0aW9uYWxseSBjb21iaW5pbmcgYSBmaXJzdCBhbmQgbGFzdCBuYW1lIGlmIHRoYXQncyBhbGxcbiAqIHRoYXQgd2FzIHByb3ZpZGVkLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZyBvciBVbmRlZmluZWR9XG4gKi9cblxuSWRlbnRpZnkucHJvdG90eXBlLm5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBuYW1lID0gdGhpcy5wcm94eSgndHJhaXRzLm5hbWUnKTtcbiAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykgcmV0dXJuIHRyaW0obmFtZSk7XG5cbiAgdmFyIGZpcnN0TmFtZSA9IHRoaXMuZmlyc3ROYW1lKCk7XG4gIHZhciBsYXN0TmFtZSA9IHRoaXMubGFzdE5hbWUoKTtcbiAgaWYgKGZpcnN0TmFtZSAmJiBsYXN0TmFtZSkgcmV0dXJuIHRyaW0oZmlyc3ROYW1lICsgJyAnICsgbGFzdE5hbWUpO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHVzZXIncyBmaXJzdCBuYW1lLCBvcHRpb25hbGx5IHNwbGl0dGluZyBpdCBvdXQgb2YgYSBzaW5nbGUgbmFtZSBpZlxuICogdGhhdCdzIGFsbCB0aGF0IHdhcyBwcm92aWRlZC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmcgb3IgVW5kZWZpbmVkfVxuICovXG5cbklkZW50aWZ5LnByb3RvdHlwZS5maXJzdE5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmaXJzdE5hbWUgPSB0aGlzLnByb3h5KCd0cmFpdHMuZmlyc3ROYW1lJyk7XG4gIGlmICh0eXBlb2YgZmlyc3ROYW1lID09PSAnc3RyaW5nJykgcmV0dXJuIHRyaW0oZmlyc3ROYW1lKTtcblxuICB2YXIgbmFtZSA9IHRoaXMucHJveHkoJ3RyYWl0cy5uYW1lJyk7XG4gIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpIHJldHVybiB0cmltKG5hbWUpLnNwbGl0KCcgJylbMF07XG59O1xuXG4vKipcbiAqIEdldCB0aGUgdXNlcidzIGxhc3QgbmFtZSwgb3B0aW9uYWxseSBzcGxpdHRpbmcgaXQgb3V0IG9mIGEgc2luZ2xlIG5hbWUgaWZcbiAqIHRoYXQncyBhbGwgdGhhdCB3YXMgcHJvdmlkZWQuXG4gKlxuICogQHJldHVybiB7U3RyaW5nIG9yIFVuZGVmaW5lZH1cbiAqL1xuXG5JZGVudGlmeS5wcm90b3R5cGUubGFzdE5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBsYXN0TmFtZSA9IHRoaXMucHJveHkoJ3RyYWl0cy5sYXN0TmFtZScpO1xuICBpZiAodHlwZW9mIGxhc3ROYW1lID09PSAnc3RyaW5nJykgcmV0dXJuIHRyaW0obGFzdE5hbWUpO1xuXG4gIHZhciBuYW1lID0gdGhpcy5wcm94eSgndHJhaXRzLm5hbWUnKTtcbiAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykgcmV0dXJuO1xuXG4gIHZhciBzcGFjZSA9IHRyaW0obmFtZSkuaW5kZXhPZignICcpO1xuICBpZiAoc3BhY2UgPT09IC0xKSByZXR1cm47XG5cbiAgcmV0dXJuIHRyaW0obmFtZS5zdWJzdHIoc3BhY2UgKyAxKSk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgdXNlcidzIHVuaXF1ZSBpZC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmcgb3IgdW5kZWZpbmVkfVxuICovXG5cbklkZW50aWZ5LnByb3RvdHlwZS51aWQgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy51c2VySWQoKVxuICAgIHx8IHRoaXMudXNlcm5hbWUoKVxuICAgIHx8IHRoaXMuZW1haWwoKTtcbn07XG5cbi8qKlxuICogR2V0IGRlc2NyaXB0aW9uLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5JZGVudGlmeS5wcm90b3R5cGUuZGVzY3JpcHRpb24gPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy5wcm94eSgndHJhaXRzLmRlc2NyaXB0aW9uJylcbiAgICB8fCB0aGlzLnByb3h5KCd0cmFpdHMuYmFja2dyb3VuZCcpO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGFnZS5cbiAqXG4gKiBJZiB0aGUgYWdlIGlzIG5vdCBleHBsaWNpdGx5IHNldFxuICogdGhlIG1ldGhvZCB3aWxsIGNvbXB1dGUgaXQgZnJvbSBgLmJpcnRoZGF5KClgXG4gKiBpZiBwb3NzaWJsZS5cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cblxuSWRlbnRpZnkucHJvdG90eXBlLmFnZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBkYXRlID0gdGhpcy5iaXJ0aGRheSgpO1xuICB2YXIgYWdlID0gZ2V0KHRoaXMudHJhaXRzKCksICdhZ2UnKTtcbiAgaWYgKG51bGwgIT0gYWdlKSByZXR1cm4gYWdlO1xuICBpZiAoJ2RhdGUnICE9IHR5cGUoZGF0ZSkpIHJldHVybjtcbiAgdmFyIG5vdyA9IG5ldyBEYXRlO1xuICByZXR1cm4gbm93LmdldEZ1bGxZZWFyKCkgLSBkYXRlLmdldEZ1bGxZZWFyKCk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgYXZhdGFyLlxuICpcbiAqIC5waG90b1VybCBuZWVkZWQgYmVjYXVzZSBoZWxwLXNjb3V0XG4gKiBpbXBsZW1lbnRhdGlvbiB1c2VzIGAuYXZhdGFyIHx8IC5waG90b1VybGAuXG4gKlxuICogLmF2YXRhclVybCBuZWVkZWQgYmVjYXVzZSB0cmFraW8gdXNlcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqL1xuXG5JZGVudGlmeS5wcm90b3R5cGUuYXZhdGFyID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRyYWl0cyA9IHRoaXMudHJhaXRzKCk7XG4gIHJldHVybiBnZXQodHJhaXRzLCAnYXZhdGFyJylcbiAgICB8fCBnZXQodHJhaXRzLCAncGhvdG9VcmwnKVxuICAgIHx8IGdldCh0cmFpdHMsICdhdmF0YXJVcmwnKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBwb3NpdGlvbi5cbiAqXG4gKiAuam9iVGl0bGUgbmVlZGVkIGJlY2F1c2Ugc29tZSBpbnRlZ3JhdGlvbnMgdXNlIGl0LlxuICpcbiAqIEByZXR1cm4ge01peGVkfVxuICovXG5cbklkZW50aWZ5LnByb3RvdHlwZS5wb3NpdGlvbiA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0cmFpdHMgPSB0aGlzLnRyYWl0cygpO1xuICByZXR1cm4gZ2V0KHRyYWl0cywgJ3Bvc2l0aW9uJykgfHwgZ2V0KHRyYWl0cywgJ2pvYlRpdGxlJyk7XG59O1xuXG4vKipcbiAqIFNldHVwIHNtZSBiYXNpYyBcInNwZWNpYWxcIiB0cmFpdCBwcm94aWVzLlxuICovXG5cbklkZW50aWZ5LnByb3RvdHlwZS51c2VybmFtZSA9IEZhY2FkZS5wcm94eSgndHJhaXRzLnVzZXJuYW1lJyk7XG5JZGVudGlmeS5wcm90b3R5cGUud2Vic2l0ZSA9IEZhY2FkZS5vbmUoJ3RyYWl0cy53ZWJzaXRlJyk7XG5JZGVudGlmeS5wcm90b3R5cGUud2Vic2l0ZXMgPSBGYWNhZGUubXVsdGkoJ3RyYWl0cy53ZWJzaXRlJyk7XG5JZGVudGlmeS5wcm90b3R5cGUucGhvbmUgPSBGYWNhZGUub25lKCd0cmFpdHMucGhvbmUnKTtcbklkZW50aWZ5LnByb3RvdHlwZS5waG9uZXMgPSBGYWNhZGUubXVsdGkoJ3RyYWl0cy5waG9uZScpO1xuSWRlbnRpZnkucHJvdG90eXBlLmFkZHJlc3MgPSBGYWNhZGUucHJveHkoJ3RyYWl0cy5hZGRyZXNzJyk7XG5JZGVudGlmeS5wcm90b3R5cGUuZ2VuZGVyID0gRmFjYWRlLnByb3h5KCd0cmFpdHMuZ2VuZGVyJyk7XG5JZGVudGlmeS5wcm90b3R5cGUuYmlydGhkYXkgPSBGYWNhZGUucHJveHkoJ3RyYWl0cy5iaXJ0aGRheScpO1xuIiwiXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0cmltO1xuXG5mdW5jdGlvbiB0cmltKHN0cil7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKCk7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyp8XFxzKiQvZywgJycpO1xufVxuXG5leHBvcnRzLmxlZnQgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoc3RyLnRyaW1MZWZ0KSByZXR1cm4gc3RyLnRyaW1MZWZ0KCk7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJyk7XG59O1xuXG5leHBvcnRzLnJpZ2h0ID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKHN0ci50cmltUmlnaHQpIHJldHVybiBzdHIudHJpbVJpZ2h0KCk7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59O1xuIiwiXG52YXIgaW5oZXJpdCA9IHJlcXVpcmUoJy4vdXRpbHMnKS5pbmhlcml0O1xudmFyIGNsb25lID0gcmVxdWlyZSgnLi91dGlscycpLmNsb25lO1xudmFyIHR5cGUgPSByZXF1aXJlKCcuL3V0aWxzJykudHlwZTtcbnZhciBGYWNhZGUgPSByZXF1aXJlKCcuL2ZhY2FkZScpO1xudmFyIElkZW50aWZ5ID0gcmVxdWlyZSgnLi9pZGVudGlmeScpO1xudmFyIGlzRW1haWwgPSByZXF1aXJlKCdpcy1lbWFpbCcpO1xudmFyIGdldCA9IHJlcXVpcmUoJ29iai1jYXNlJyk7XG5cbi8qKlxuICogRXhwb3NlIGBUcmFja2AgZmFjYWRlLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gVHJhY2s7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgVHJhY2tgIGZhY2FkZSB3aXRoIGEgYGRpY3Rpb25hcnlgIG9mIGFyZ3VtZW50cy5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gZGljdGlvbmFyeVxuICogICBAcHJvcGVydHkge1N0cmluZ30gZXZlbnRcbiAqICAgQHByb3BlcnR5IHtTdHJpbmd9IHVzZXJJZFxuICogICBAcHJvcGVydHkge1N0cmluZ30gc2Vzc2lvbklkXG4gKiAgIEBwcm9wZXJ0eSB7T2JqZWN0fSBwcm9wZXJ0aWVzXG4gKiAgIEBwcm9wZXJ0eSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuZnVuY3Rpb24gVHJhY2sgKGRpY3Rpb25hcnkpIHtcbiAgRmFjYWRlLmNhbGwodGhpcywgZGljdGlvbmFyeSk7XG59XG5cbi8qKlxuICogSW5oZXJpdCBmcm9tIGBGYWNhZGVgLlxuICovXG5cbmluaGVyaXQoVHJhY2ssIEZhY2FkZSk7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBmYWNhZGUncyBhY3Rpb24uXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cblRyYWNrLnByb3RvdHlwZS50eXBlID1cblRyYWNrLnByb3RvdHlwZS5hY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAndHJhY2snO1xufTtcblxuLyoqXG4gKiBTZXR1cCBzb21lIGJhc2ljIHByb3hpZXMuXG4gKi9cblxuVHJhY2sucHJvdG90eXBlLmV2ZW50ID0gRmFjYWRlLmZpZWxkKCdldmVudCcpO1xuVHJhY2sucHJvdG90eXBlLnZhbHVlID0gRmFjYWRlLnByb3h5KCdwcm9wZXJ0aWVzLnZhbHVlJyk7XG5cbi8qKlxuICogTWlzY1xuICovXG5cblRyYWNrLnByb3RvdHlwZS5jYXRlZ29yeSA9IEZhY2FkZS5wcm94eSgncHJvcGVydGllcy5jYXRlZ29yeScpO1xuXG4vKipcbiAqIEVjb21tZXJjZVxuICovXG5cblRyYWNrLnByb3RvdHlwZS5pZCA9IEZhY2FkZS5wcm94eSgncHJvcGVydGllcy5pZCcpO1xuVHJhY2sucHJvdG90eXBlLnNrdSA9IEZhY2FkZS5wcm94eSgncHJvcGVydGllcy5za3UnKTtcblRyYWNrLnByb3RvdHlwZS50YXggPSBGYWNhZGUucHJveHkoJ3Byb3BlcnRpZXMudGF4Jyk7XG5UcmFjay5wcm90b3R5cGUubmFtZSA9IEZhY2FkZS5wcm94eSgncHJvcGVydGllcy5uYW1lJyk7XG5UcmFjay5wcm90b3R5cGUucHJpY2UgPSBGYWNhZGUucHJveHkoJ3Byb3BlcnRpZXMucHJpY2UnKTtcblRyYWNrLnByb3RvdHlwZS50b3RhbCA9IEZhY2FkZS5wcm94eSgncHJvcGVydGllcy50b3RhbCcpO1xuVHJhY2sucHJvdG90eXBlLmNvdXBvbiA9IEZhY2FkZS5wcm94eSgncHJvcGVydGllcy5jb3Vwb24nKTtcblRyYWNrLnByb3RvdHlwZS5zaGlwcGluZyA9IEZhY2FkZS5wcm94eSgncHJvcGVydGllcy5zaGlwcGluZycpO1xuVHJhY2sucHJvdG90eXBlLmRpc2NvdW50ID0gRmFjYWRlLnByb3h5KCdwcm9wZXJ0aWVzLmRpc2NvdW50Jyk7XG5cbi8qKlxuICogRGVzY3JpcHRpb25cbiAqL1xuXG5UcmFjay5wcm90b3R5cGUuZGVzY3JpcHRpb24gPSBGYWNhZGUucHJveHkoJ3Byb3BlcnRpZXMuZGVzY3JpcHRpb24nKTtcblxuLyoqXG4gKiBQbGFuXG4gKi9cblxuVHJhY2sucHJvdG90eXBlLnBsYW4gPSBGYWNhZGUucHJveHkoJ3Byb3BlcnRpZXMucGxhbicpO1xuXG4vKipcbiAqIE9yZGVyIGlkLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuVHJhY2sucHJvdG90eXBlLm9yZGVySWQgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy5wcm94eSgncHJvcGVydGllcy5pZCcpXG4gICAgfHwgdGhpcy5wcm94eSgncHJvcGVydGllcy5vcmRlcklkJyk7XG59O1xuXG4vKipcbiAqIEdldCBzdWJ0b3RhbC5cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cblxuVHJhY2sucHJvdG90eXBlLnN1YnRvdGFsID0gZnVuY3Rpb24oKXtcbiAgdmFyIHN1YnRvdGFsID0gZ2V0KHRoaXMucHJvcGVydGllcygpLCAnc3VidG90YWwnKTtcbiAgdmFyIHRvdGFsID0gdGhpcy50b3RhbCgpO1xuICB2YXIgbjtcblxuICBpZiAoc3VidG90YWwpIHJldHVybiBzdWJ0b3RhbDtcbiAgaWYgKCF0b3RhbCkgcmV0dXJuIDA7XG4gIGlmIChuID0gdGhpcy50YXgoKSkgdG90YWwgLT0gbjtcbiAgaWYgKG4gPSB0aGlzLnNoaXBwaW5nKCkpIHRvdGFsIC09IG47XG4gIGlmIChuID0gdGhpcy5kaXNjb3VudCgpKSB0b3RhbCArPSBuO1xuXG4gIHJldHVybiB0b3RhbDtcbn07XG5cbi8qKlxuICogR2V0IHByb2R1Y3RzLlxuICpcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cblRyYWNrLnByb3RvdHlwZS5wcm9kdWN0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBwcm9wcyA9IHRoaXMucHJvcGVydGllcygpO1xuICB2YXIgcHJvZHVjdHMgPSBnZXQocHJvcHMsICdwcm9kdWN0cycpO1xuICByZXR1cm4gJ2FycmF5JyA9PSB0eXBlKHByb2R1Y3RzKVxuICAgID8gcHJvZHVjdHNcbiAgICA6IFtdO1xufTtcblxuLyoqXG4gKiBHZXQgcXVhbnRpdHkuXG4gKlxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5cblRyYWNrLnByb3RvdHlwZS5xdWFudGl0eSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBwcm9wcyA9IHRoaXMub2JqLnByb3BlcnRpZXMgfHwge307XG4gIHJldHVybiBwcm9wcy5xdWFudGl0eSB8fCAxO1xufTtcblxuLyoqXG4gKiBHZXQgY3VycmVuY3kuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cblRyYWNrLnByb3RvdHlwZS5jdXJyZW5jeSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBwcm9wcyA9IHRoaXMub2JqLnByb3BlcnRpZXMgfHwge307XG4gIHJldHVybiBwcm9wcy5jdXJyZW5jeSB8fCAnVVNEJztcbn07XG5cbi8qKlxuICogQkFDS1dBUkRTIENPTVBBVElCSUxJVFk6IHNob3VsZCBwcm9iYWJseSByZS1leGFtaW5lIHdoZXJlIHRoZXNlIGNvbWUgZnJvbS5cbiAqL1xuXG5UcmFjay5wcm90b3R5cGUucmVmZXJyZXIgPSBGYWNhZGUucHJveHkoJ3Byb3BlcnRpZXMucmVmZXJyZXInKTtcblRyYWNrLnByb3RvdHlwZS5xdWVyeSA9IEZhY2FkZS5wcm94eSgnb3B0aW9ucy5xdWVyeScpO1xuXG4vKipcbiAqIEdldCB0aGUgY2FsbCdzIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFsaWFzZXNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5UcmFjay5wcm90b3R5cGUucHJvcGVydGllcyA9IGZ1bmN0aW9uIChhbGlhc2VzKSB7XG4gIHZhciByZXQgPSB0aGlzLmZpZWxkKCdwcm9wZXJ0aWVzJykgfHwge307XG4gIGFsaWFzZXMgPSBhbGlhc2VzIHx8IHt9O1xuXG4gIGZvciAodmFyIGFsaWFzIGluIGFsaWFzZXMpIHtcbiAgICB2YXIgdmFsdWUgPSBudWxsID09IHRoaXNbYWxpYXNdXG4gICAgICA/IHRoaXMucHJveHkoJ3Byb3BlcnRpZXMuJyArIGFsaWFzKVxuICAgICAgOiB0aGlzW2FsaWFzXSgpO1xuICAgIGlmIChudWxsID09IHZhbHVlKSBjb250aW51ZTtcbiAgICByZXRbYWxpYXNlc1thbGlhc11dID0gdmFsdWU7XG4gICAgZGVsZXRlIHJldFthbGlhc107XG4gIH1cblxuICByZXR1cm4gcmV0O1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGNhbGwncyB1c2VybmFtZS5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmcgb3IgVW5kZWZpbmVkfVxuICovXG5cblRyYWNrLnByb3RvdHlwZS51c2VybmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMucHJveHkoJ3RyYWl0cy51c2VybmFtZScpIHx8XG4gICAgICAgICB0aGlzLnByb3h5KCdwcm9wZXJ0aWVzLnVzZXJuYW1lJykgfHxcbiAgICAgICAgIHRoaXMudXNlcklkKCkgfHxcbiAgICAgICAgIHRoaXMuc2Vzc2lvbklkKCk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgY2FsbCdzIGVtYWlsLCB1c2luZyBhbiB0aGUgdXNlciBJRCBpZiBpdCdzIGEgdmFsaWQgZW1haWwuXG4gKlxuICogQHJldHVybiB7U3RyaW5nIG9yIFVuZGVmaW5lZH1cbiAqL1xuXG5UcmFjay5wcm90b3R5cGUuZW1haWwgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlbWFpbCA9IHRoaXMucHJveHkoJ3RyYWl0cy5lbWFpbCcpO1xuICBlbWFpbCA9IGVtYWlsIHx8IHRoaXMucHJveHkoJ3Byb3BlcnRpZXMuZW1haWwnKTtcbiAgaWYgKGVtYWlsKSByZXR1cm4gZW1haWw7XG5cbiAgdmFyIHVzZXJJZCA9IHRoaXMudXNlcklkKCk7XG4gIGlmIChpc0VtYWlsKHVzZXJJZCkpIHJldHVybiB1c2VySWQ7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgY2FsbCdzIHJldmVudWUsIHBhcnNpbmcgaXQgZnJvbSBhIHN0cmluZyB3aXRoIGFuIG9wdGlvbmFsIGxlYWRpbmdcbiAqIGRvbGxhciBzaWduLlxuICpcbiAqIEZvciBwcm9kdWN0cy9zZXJ2aWNlcyB0aGF0IGRvbid0IGhhdmUgc2hpcHBpbmcgYW5kIGFyZSBub3QgZGlyZWN0bHkgdGF4ZWQsXG4gKiB0aGV5IG9ubHkgY2FyZSBhYm91dCB0cmFja2luZyBgcmV2ZW51ZWAuIFRoZXNlIGFyZSB0aGluZ3MgbGlrZVxuICogU2FhUyBjb21wYW5pZXMsIHdobyBzZWxsIG1vbnRobHkgc3Vic2NyaXB0aW9ucy4gVGhlIHN1YnNjcmlwdGlvbnMgYXJlbid0XG4gKiB0YXhlZCBkaXJlY3RseSwgYW5kIHNpbmNlIGl0J3MgYSBkaWdpdGFsIHByb2R1Y3QsIGl0IGhhcyBubyBzaGlwcGluZy5cbiAqXG4gKiBUaGUgb25seSBjYXNlIHdoZXJlIHRoZXJlJ3MgYSBkaWZmZXJlbmNlIGJldHdlZW4gYHJldmVudWVgIGFuZCBgdG90YWxgXG4gKiAoaW4gdGhlIGNvbnRleHQgb2YgYW5hbHl0aWNzKSBpcyBvbiBlY29tbWVyY2UgcGxhdGZvcm1zLCB3aGVyZSB0aGV5IHdhbnRcbiAqIHRoZSBgcmV2ZW51ZWAgZnVuY3Rpb24gdG8gYWN0dWFsbHkgcmV0dXJuIHRoZSBgdG90YWxgICh3aGljaCBpbmNsdWRlc1xuICogdGF4IGFuZCBzaGlwcGluZywgdG90YWwgPSBzdWJ0b3RhbCArIHRheCArIHNoaXBwaW5nKS4gVGhpcyBpcyBwcm9iYWJseVxuICogYmVjYXVzZSBvbiB0aGVpciBiYWNrZW5kIHRoZXkgYXNzdW1lIHRheCBhbmQgc2hpcHBpbmcgaGFzIGJlZW4gYXBwbGllZCB0b1xuICogdGhlIHZhbHVlLCBhbmQgc28gY2FuIGdldCB0aGUgcmV2ZW51ZSBvbiB0aGVpciBvd24uXG4gKlxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5cblRyYWNrLnByb3RvdHlwZS5yZXZlbnVlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcmV2ZW51ZSA9IHRoaXMucHJveHkoJ3Byb3BlcnRpZXMucmV2ZW51ZScpO1xuICB2YXIgZXZlbnQgPSB0aGlzLmV2ZW50KCk7XG5cbiAgLy8gaXQncyBhbHdheXMgcmV2ZW51ZSwgdW5sZXNzIGl0J3MgY2FsbGVkIGR1cmluZyBhbiBvcmRlciBjb21wbGV0aW9uLlxuICBpZiAoIXJldmVudWUgJiYgZXZlbnQgJiYgZXZlbnQubWF0Y2goL2NvbXBsZXRlZCA/b3JkZXIvaSkpIHtcbiAgICByZXZlbnVlID0gdGhpcy5wcm94eSgncHJvcGVydGllcy50b3RhbCcpO1xuICB9XG5cbiAgcmV0dXJuIGN1cnJlbmN5KHJldmVudWUpO1xufTtcblxuLyoqXG4gKiBHZXQgY2VudHMuXG4gKlxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5cblRyYWNrLnByb3RvdHlwZS5jZW50cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciByZXZlbnVlID0gdGhpcy5yZXZlbnVlKCk7XG4gIHJldHVybiAnbnVtYmVyJyAhPSB0eXBlb2YgcmV2ZW51ZVxuICAgID8gdGhpcy52YWx1ZSgpIHx8IDBcbiAgICA6IHJldmVudWUgKiAxMDA7XG59O1xuXG4vKipcbiAqIEEgdXRpbGl0eSB0byB0dXJuIHRoZSBwaWVjZXMgb2YgYSB0cmFjayBjYWxsIGludG8gYW4gaWRlbnRpZnkuIFVzZWQgZm9yXG4gKiBpbnRlZ3JhdGlvbnMgd2l0aCBzdXBlciBwcm9wZXJ0aWVzIG9yIHJhdGUgbGltaXRzLlxuICpcbiAqIFRPRE86IHJlbW92ZSBtZS5cbiAqXG4gKiBAcmV0dXJuIHtGYWNhZGV9XG4gKi9cblxuVHJhY2sucHJvdG90eXBlLmlkZW50aWZ5ID0gZnVuY3Rpb24gKCkge1xuICB2YXIganNvbiA9IHRoaXMuanNvbigpO1xuICBqc29uLnRyYWl0cyA9IHRoaXMudHJhaXRzKCk7XG4gIHJldHVybiBuZXcgSWRlbnRpZnkoanNvbik7XG59O1xuXG4vKipcbiAqIEdldCBmbG9hdCBmcm9tIGN1cnJlbmN5IHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5cbmZ1bmN0aW9uIGN1cnJlbmN5KHZhbCkge1xuICBpZiAoIXZhbCkgcmV0dXJuO1xuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHJldHVybiB2YWw7XG4gIGlmICh0eXBlb2YgdmFsICE9PSAnc3RyaW5nJykgcmV0dXJuO1xuXG4gIHZhbCA9IHZhbC5yZXBsYWNlKC9cXCQvZywgJycpO1xuICB2YWwgPSBwYXJzZUZsb2F0KHZhbCk7XG5cbiAgaWYgKCFpc05hTih2YWwpKSByZXR1cm4gdmFsO1xufVxuIiwiXG52YXIgaW5oZXJpdCA9IHJlcXVpcmUoJy4vdXRpbHMnKS5pbmhlcml0O1xudmFyIEZhY2FkZSA9IHJlcXVpcmUoJy4vZmFjYWRlJyk7XG52YXIgVHJhY2sgPSByZXF1aXJlKCcuL3RyYWNrJyk7XG5cbi8qKlxuICogRXhwb3NlIGBQYWdlYCBmYWNhZGVcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBuZXcgYFBhZ2VgIGZhY2FkZSB3aXRoIGBkaWN0aW9uYXJ5YC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGljdGlvbmFyeVxuICogICBAcGFyYW0ge1N0cmluZ30gY2F0ZWdvcnlcbiAqICAgQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqICAgQHBhcmFtIHtPYmplY3R9IHRyYWl0c1xuICogICBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIFBhZ2UoZGljdGlvbmFyeSl7XG4gIEZhY2FkZS5jYWxsKHRoaXMsIGRpY3Rpb25hcnkpO1xufVxuXG4vKipcbiAqIEluaGVyaXQgZnJvbSBgRmFjYWRlYFxuICovXG5cbmluaGVyaXQoUGFnZSwgRmFjYWRlKTtcblxuLyoqXG4gKiBHZXQgdGhlIGZhY2FkZSdzIGFjdGlvbi5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuUGFnZS5wcm90b3R5cGUudHlwZSA9XG5QYWdlLnByb3RvdHlwZS5hY3Rpb24gPSBmdW5jdGlvbigpe1xuICByZXR1cm4gJ3BhZ2UnO1xufTtcblxuLyoqXG4gKiBGaWVsZHNcbiAqL1xuXG5QYWdlLnByb3RvdHlwZS5jYXRlZ29yeSA9IEZhY2FkZS5maWVsZCgnY2F0ZWdvcnknKTtcblBhZ2UucHJvdG90eXBlLm5hbWUgPSBGYWNhZGUuZmllbGQoJ25hbWUnKTtcblxuLyoqXG4gKiBQcm94aWVzLlxuICovXG5cblBhZ2UucHJvdG90eXBlLnRpdGxlID0gRmFjYWRlLnByb3h5KCdwcm9wZXJ0aWVzLnRpdGxlJyk7XG5QYWdlLnByb3RvdHlwZS5wYXRoID0gRmFjYWRlLnByb3h5KCdwcm9wZXJ0aWVzLnBhdGgnKTtcblBhZ2UucHJvdG90eXBlLnVybCA9IEZhY2FkZS5wcm94eSgncHJvcGVydGllcy51cmwnKTtcblxuLyoqXG4gKiBSZWZlcnJlci5cbiAqL1xuXG5QYWdlLnByb3RvdHlwZS5yZWZlcnJlciA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLnByb3h5KCdwcm9wZXJ0aWVzLnJlZmVycmVyJylcbiAgICB8fCB0aGlzLnByb3h5KCdjb250ZXh0LnJlZmVycmVyLnVybCcpO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHBhZ2UgcHJvcGVydGllcyBtaXhpbmcgYGNhdGVnb3J5YCBhbmQgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhbGlhc2VzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuUGFnZS5wcm90b3R5cGUucHJvcGVydGllcyA9IGZ1bmN0aW9uKGFsaWFzZXMpIHtcbiAgdmFyIHByb3BzID0gdGhpcy5maWVsZCgncHJvcGVydGllcycpIHx8IHt9O1xuICB2YXIgY2F0ZWdvcnkgPSB0aGlzLmNhdGVnb3J5KCk7XG4gIHZhciBuYW1lID0gdGhpcy5uYW1lKCk7XG4gIGFsaWFzZXMgPSBhbGlhc2VzIHx8IHt9O1xuXG4gIGlmIChjYXRlZ29yeSkgcHJvcHMuY2F0ZWdvcnkgPSBjYXRlZ29yeTtcbiAgaWYgKG5hbWUpIHByb3BzLm5hbWUgPSBuYW1lO1xuXG4gIGZvciAodmFyIGFsaWFzIGluIGFsaWFzZXMpIHtcbiAgICB2YXIgdmFsdWUgPSBudWxsID09IHRoaXNbYWxpYXNdXG4gICAgICA/IHRoaXMucHJveHkoJ3Byb3BlcnRpZXMuJyArIGFsaWFzKVxuICAgICAgOiB0aGlzW2FsaWFzXSgpO1xuICAgIGlmIChudWxsID09IHZhbHVlKSBjb250aW51ZTtcbiAgICBwcm9wc1thbGlhc2VzW2FsaWFzXV0gPSB2YWx1ZTtcbiAgICBpZiAoYWxpYXMgIT09IGFsaWFzZXNbYWxpYXNdKSBkZWxldGUgcHJvcHNbYWxpYXNdO1xuICB9XG5cbiAgcmV0dXJuIHByb3BzO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHBhZ2UgZnVsbE5hbWUuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cblBhZ2UucHJvdG90eXBlLmZ1bGxOYW1lID0gZnVuY3Rpb24oKXtcbiAgdmFyIGNhdGVnb3J5ID0gdGhpcy5jYXRlZ29yeSgpO1xuICB2YXIgbmFtZSA9IHRoaXMubmFtZSgpO1xuICByZXR1cm4gbmFtZSAmJiBjYXRlZ29yeVxuICAgID8gY2F0ZWdvcnkgKyAnICcgKyBuYW1lXG4gICAgOiBuYW1lO1xufTtcblxuLyoqXG4gKiBHZXQgZXZlbnQgd2l0aCBgbmFtZWAuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cblBhZ2UucHJvdG90eXBlLmV2ZW50ID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiBuYW1lXG4gICAgPyAnVmlld2VkICcgKyBuYW1lICsgJyBQYWdlJ1xuICAgIDogJ0xvYWRlZCBhIFBhZ2UnO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IHRoaXMgUGFnZSB0byBhIFRyYWNrIGZhY2FkZSB3aXRoIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7VHJhY2t9XG4gKi9cblxuUGFnZS5wcm90b3R5cGUudHJhY2sgPSBmdW5jdGlvbihuYW1lKXtcbiAgdmFyIHByb3BzID0gdGhpcy5wcm9wZXJ0aWVzKCk7XG4gIHJldHVybiBuZXcgVHJhY2soe1xuICAgIGV2ZW50OiB0aGlzLmV2ZW50KG5hbWUpLFxuICAgIHRpbWVzdGFtcDogdGhpcy50aW1lc3RhbXAoKSxcbiAgICBjb250ZXh0OiB0aGlzLmNvbnRleHQoKSxcbiAgICBwcm9wZXJ0aWVzOiBwcm9wc1xuICB9KTtcbn07XG4iLCJcbnZhciBpbmhlcml0ID0gcmVxdWlyZSgnLi91dGlscycpLmluaGVyaXQ7XG52YXIgUGFnZSA9IHJlcXVpcmUoJy4vcGFnZScpO1xudmFyIFRyYWNrID0gcmVxdWlyZSgnLi90cmFjaycpO1xuXG4vKipcbiAqIEV4cG9zZSBgU2NyZWVuYCBmYWNhZGVcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNjcmVlbjtcblxuLyoqXG4gKiBJbml0aWFsaXplIG5ldyBgU2NyZWVuYCBmYWNhZGUgd2l0aCBgZGljdGlvbmFyeWAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRpY3Rpb25hcnlcbiAqICAgQHBhcmFtIHtTdHJpbmd9IGNhdGVnb3J5XG4gKiAgIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiAgIEBwYXJhbSB7T2JqZWN0fSB0cmFpdHNcbiAqICAgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBTY3JlZW4oZGljdGlvbmFyeSl7XG4gIFBhZ2UuY2FsbCh0aGlzLCBkaWN0aW9uYXJ5KTtcbn1cblxuLyoqXG4gKiBJbmhlcml0IGZyb20gYFBhZ2VgXG4gKi9cblxuaW5oZXJpdChTY3JlZW4sIFBhZ2UpO1xuXG4vKipcbiAqIEdldCB0aGUgZmFjYWRlJ3MgYWN0aW9uLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuU2NyZWVuLnByb3RvdHlwZS50eXBlID1cblNjcmVlbi5wcm90b3R5cGUuYWN0aW9uID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuICdzY3JlZW4nO1xufTtcblxuLyoqXG4gKiBHZXQgZXZlbnQgd2l0aCBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuU2NyZWVuLnByb3RvdHlwZS5ldmVudCA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gbmFtZVxuICAgID8gJ1ZpZXdlZCAnICsgbmFtZSArICcgU2NyZWVuJ1xuICAgIDogJ0xvYWRlZCBhIFNjcmVlbic7XG59O1xuXG4vKipcbiAqIENvbnZlcnQgdGhpcyBTY3JlZW4uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1RyYWNrfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5TY3JlZW4ucHJvdG90eXBlLnRyYWNrID0gZnVuY3Rpb24obmFtZSl7XG4gIHZhciBwcm9wcyA9IHRoaXMucHJvcGVydGllcygpO1xuICByZXR1cm4gbmV3IFRyYWNrKHtcbiAgICBldmVudDogdGhpcy5ldmVudChuYW1lKSxcbiAgICB0aW1lc3RhbXA6IHRoaXMudGltZXN0YW1wKCksXG4gICAgY29udGV4dDogdGhpcy5jb250ZXh0KCksXG4gICAgcHJvcGVydGllczogcHJvcHNcbiAgfSk7XG59O1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFmdGVyICh0aW1lcywgZnVuYykge1xuICAvLyBBZnRlciAwLCByZWFsbHk/XG4gIGlmICh0aW1lcyA8PSAwKSByZXR1cm4gZnVuYygpO1xuXG4gIC8vIFRoYXQncyBtb3JlIGxpa2UgaXQuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpZiAoLS10aW1lcyA8IDEpIHtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9O1xufTsiLCJcbnRyeSB7XG4gIHZhciBiaW5kID0gcmVxdWlyZSgnYmluZCcpO1xufSBjYXRjaCAoZSkge1xuICB2YXIgYmluZCA9IHJlcXVpcmUoJ2JpbmQtY29tcG9uZW50Jyk7XG59XG5cbnZhciBiaW5kQWxsID0gcmVxdWlyZSgnYmluZC1hbGwnKTtcblxuXG4vKipcbiAqIEV4cG9zZSBgYmluZGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gYmluZDtcblxuXG4vKipcbiAqIEV4cG9zZSBgYmluZEFsbGAuXG4gKi9cblxuZXhwb3J0cy5hbGwgPSBiaW5kQWxsO1xuXG5cbi8qKlxuICogRXhwb3NlIGBiaW5kTWV0aG9kc2AuXG4gKi9cblxuZXhwb3J0cy5tZXRob2RzID0gYmluZE1ldGhvZHM7XG5cblxuLyoqXG4gKiBCaW5kIGBtZXRob2RzYCBvbiBgb2JqYCB0byBhbHdheXMgYmUgY2FsbGVkIHdpdGggdGhlIGBvYmpgIGFzIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZHMuLi5cbiAqL1xuXG5mdW5jdGlvbiBiaW5kTWV0aG9kcyAob2JqLCBtZXRob2RzKSB7XG4gIG1ldGhvZHMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gIGZvciAodmFyIGkgPSAwLCBtZXRob2Q7IG1ldGhvZCA9IG1ldGhvZHNbaV07IGkrKykge1xuICAgIG9ialttZXRob2RdID0gYmluZChvYmosIG9ialttZXRob2RdKTtcbiAgfVxuICByZXR1cm4gb2JqO1xufSIsIi8qKlxuICogU2xpY2UgcmVmZXJlbmNlLlxuICovXG5cbnZhciBzbGljZSA9IFtdLnNsaWNlO1xuXG4vKipcbiAqIEJpbmQgYG9iamAgdG8gYGZuYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZm4gb3Igc3RyaW5nXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosIGZuKXtcbiAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBmbikgZm4gPSBvYmpbZm5dO1xuICBpZiAoJ2Z1bmN0aW9uJyAhPSB0eXBlb2YgZm4pIHRocm93IG5ldyBFcnJvcignYmluZCgpIHJlcXVpcmVzIGEgZnVuY3Rpb24nKTtcbiAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBmbi5hcHBseShvYmosIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICB9XG59O1xuIiwiXG50cnkge1xuICB2YXIgYmluZCA9IHJlcXVpcmUoJ2JpbmQnKTtcbiAgdmFyIHR5cGUgPSByZXF1aXJlKCd0eXBlJyk7XG59IGNhdGNoIChlKSB7XG4gIHZhciBiaW5kID0gcmVxdWlyZSgnYmluZC1jb21wb25lbnQnKTtcbiAgdmFyIHR5cGUgPSByZXF1aXJlKCd0eXBlLWNvbXBvbmVudCcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIHZhciB2YWwgPSBvYmpba2V5XTtcbiAgICBpZiAodHlwZSh2YWwpID09PSAnZnVuY3Rpb24nKSBvYmpba2V5XSA9IGJpbmQob2JqLCBvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn07IiwidmFyIG5leHQgPSByZXF1aXJlKCduZXh0LXRpY2snKTtcblxuXG4vKipcbiAqIEV4cG9zZSBgY2FsbGJhY2tgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY2FsbGJhY2s7XG5cblxuLyoqXG4gKiBDYWxsIGFuIGBmbmAgYmFjayBzeW5jaHJvbm91c2x5IGlmIGl0IGV4aXN0cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICovXG5cbmZ1bmN0aW9uIGNhbGxiYWNrIChmbikge1xuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGZuKSBmbigpO1xufVxuXG5cbi8qKlxuICogQ2FsbCBhbiBgZm5gIGJhY2sgYXN5bmNocm9ub3VzbHkgaWYgaXQgZXhpc3RzLiBJZiBgd2FpdGAgaXMgb21taXR0ZWQsIHRoZVxuICogYGZuYCB3aWxsIGJlIGNhbGxlZCBvbiBuZXh0IHRpY2suXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7TnVtYmVyfSB3YWl0IChvcHRpb25hbClcbiAqL1xuXG5jYWxsYmFjay5hc3luYyA9IGZ1bmN0aW9uIChmbiwgd2FpdCkge1xuICBpZiAoJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIGZuKSByZXR1cm47XG4gIGlmICghd2FpdCkgcmV0dXJuIG5leHQoZm4pO1xuICBzZXRUaW1lb3V0KGZuLCB3YWl0KTtcbn07XG5cblxuLyoqXG4gKiBTeW1tZXRyeS5cbiAqL1xuXG5jYWxsYmFjay5zeW5jID0gY2FsbGJhY2s7XG4iLCJcInVzZSBzdHJpY3RcIlxuXG5pZiAodHlwZW9mIHNldEltbWVkaWF0ZSA9PSAnZnVuY3Rpb24nKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZil7IHNldEltbWVkaWF0ZShmKSB9XG59XG4vLyBsZWdhY3kgbm9kZS5qc1xuZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHByb2Nlc3MubmV4dFRpY2sgPT0gJ2Z1bmN0aW9uJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHByb2Nlc3MubmV4dFRpY2tcbn1cbi8vIGZhbGxiYWNrIGZvciBvdGhlciBlbnZpcm9ubWVudHMgLyBwb3N0TWVzc2FnZSBiZWhhdmVzIGJhZGx5IG9uIElFOFxuZWxzZSBpZiAodHlwZW9mIHdpbmRvdyA9PSAndW5kZWZpbmVkJyB8fCB3aW5kb3cuQWN0aXZlWE9iamVjdCB8fCAhd2luZG93LnBvc3RNZXNzYWdlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZil7IHNldFRpbWVvdXQoZikgfTtcbn0gZWxzZSB7XG4gIHZhciBxID0gW107XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbigpe1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSA8IHEubGVuZ3RoKSB7XG4gICAgICB0cnkgeyBxW2krK10oKTsgfVxuICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgcSA9IHEuc2xpY2UoaSk7XG4gICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgndGljIScsICcqJyk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICAgIHEubGVuZ3RoID0gMDtcbiAgfSwgdHJ1ZSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbil7XG4gICAgaWYgKCFxLmxlbmd0aCkgd2luZG93LnBvc3RNZXNzYWdlKCd0aWMhJywgJyonKTtcbiAgICBxLnB1c2goZm4pO1xuICB9XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdHlwZTtcblxudHJ5IHtcbiAgdHlwZSA9IHJlcXVpcmUoJ3R5cGUnKTtcbn0gY2F0Y2goZSl7XG4gIHR5cGUgPSByZXF1aXJlKCd0eXBlLWNvbXBvbmVudCcpO1xufVxuXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmU7XG5cbi8qKlxuICogQ2xvbmVzIG9iamVjdHMuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gYW55IG9iamVjdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBjbG9uZShvYmope1xuICBzd2l0Y2ggKHR5cGUob2JqKSkge1xuICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICB2YXIgY29weSA9IHt9O1xuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBjb3B5W2tleV0gPSBjbG9uZShvYmpba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjb3B5O1xuXG4gICAgY2FzZSAnYXJyYXknOlxuICAgICAgdmFyIGNvcHkgPSBuZXcgQXJyYXkob2JqLmxlbmd0aCk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgY29weVtpXSA9IGNsb25lKG9ialtpXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29weTtcblxuICAgIGNhc2UgJ3JlZ2V4cCc6XG4gICAgICAvLyBmcm9tIG1pbGxlcm1lZGVpcm9zL2FtZC11dGlscyAtIE1JVFxuICAgICAgdmFyIGZsYWdzID0gJyc7XG4gICAgICBmbGFncyArPSBvYmoubXVsdGlsaW5lID8gJ20nIDogJyc7XG4gICAgICBmbGFncyArPSBvYmouZ2xvYmFsID8gJ2cnIDogJyc7XG4gICAgICBmbGFncyArPSBvYmouaWdub3JlQ2FzZSA/ICdpJyA6ICcnO1xuICAgICAgcmV0dXJuIG5ldyBSZWdFeHAob2JqLnNvdXJjZSwgZmxhZ3MpO1xuXG4gICAgY2FzZSAnZGF0ZSc6XG4gICAgICByZXR1cm4gbmV3IERhdGUob2JqLmdldFRpbWUoKSk7XG5cbiAgICBkZWZhdWx0OiAvLyBzdHJpbmcsIG51bWJlciwgYm9vbGVhbiwg4oCmXG4gICAgICByZXR1cm4gb2JqO1xuICB9XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJ2JpbmQnKTtcbnZhciBjbG9uZSA9IHJlcXVpcmUoJ2Nsb25lJyk7XG52YXIgY29va2llID0gcmVxdWlyZSgnY29va2llJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdhbmFseXRpY3MuanM6Y29va2llJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCdkZWZhdWx0cycpO1xudmFyIGpzb24gPSByZXF1aXJlKCdqc29uJyk7XG52YXIgdG9wRG9tYWluID0gcmVxdWlyZSgndG9wLWRvbWFpbicpO1xuXG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgQ29va2llYCB3aXRoIGBvcHRpb25zYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIENvb2tpZShvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyhvcHRpb25zKTtcbn1cblxuXG4vKipcbiAqIEdldCBvciBzZXQgdGhlIGNvb2tpZSBvcHRpb25zLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBmaWVsZCB7TnVtYmVyfSBtYXhhZ2UgKDEgeWVhcilcbiAqICAgQGZpZWxkIHtTdHJpbmd9IGRvbWFpblxuICogICBAZmllbGQge1N0cmluZ30gcGF0aFxuICogICBAZmllbGQge0Jvb2xlYW59IHNlY3VyZVxuICovXG5cbkNvb2tpZS5wcm90b3R5cGUub3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiB0aGlzLl9vcHRpb25zO1xuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHZhciBkb21haW4gPSAnLicgKyB0b3BEb21haW4od2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICBpZiAoZG9tYWluID09PSAnLicpIGRvbWFpbiA9IG51bGw7XG5cbiAgdGhpcy5fb3B0aW9ucyA9IGRlZmF1bHRzKG9wdGlvbnMsIHtcbiAgICAvLyBkZWZhdWx0IHRvIGEgeWVhclxuICAgIG1heGFnZTogMzE1MzYwMDAwMDAsXG4gICAgcGF0aDogJy8nLFxuICAgIGRvbWFpbjogZG9tYWluXG4gIH0pO1xuXG4gIC8vIGh0dHA6Ly9jdXJsLmhheHguc2UvcmZjL2Nvb2tpZV9zcGVjLmh0bWxcbiAgLy8gaHR0cHM6Ly9wdWJsaWNzdWZmaXgub3JnL2xpc3QvZWZmZWN0aXZlX3RsZF9uYW1lcy5kYXRcbiAgLy9cbiAgLy8gdHJ5IHNldHRpbmcgYSBkdW1teSBjb29raWUgd2l0aCB0aGUgb3B0aW9uc1xuICAvLyBpZiB0aGUgY29va2llIGlzbid0IHNldCwgaXQgcHJvYmFibHkgbWVhbnNcbiAgLy8gdGhhdCB0aGUgZG9tYWluIGlzIG9uIHRoZSBwdWJsaWMgc3VmZml4IGxpc3RcbiAgLy8gbGlrZSBteWFwcC5oZXJva3VhcHAuY29tIG9yIGxvY2FsaG9zdCAvIGlwLlxuICB0aGlzLnNldCgnYWpzOnRlc3QnLCB0cnVlKTtcbiAgaWYgKCF0aGlzLmdldCgnYWpzOnRlc3QnKSkge1xuICAgIGRlYnVnKCdmYWxsYmFjayB0byBkb21haW49bnVsbCcpO1xuICAgIHRoaXMuX29wdGlvbnMuZG9tYWluID0gbnVsbDtcbiAgfVxuICB0aGlzLnJlbW92ZSgnYWpzOnRlc3QnKTtcbn07XG5cblxuLyoqXG4gKiBTZXQgYSBga2V5YCBhbmQgYHZhbHVlYCBpbiBvdXIgY29va2llLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn0gc2F2ZWRcbiAqL1xuXG5Db29raWUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgdHJ5IHtcbiAgICB2YWx1ZSA9IGpzb24uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICBjb29raWUoa2V5LCB2YWx1ZSwgY2xvbmUodGhpcy5fb3B0aW9ucykpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5cbi8qKlxuICogR2V0IGEgdmFsdWUgZnJvbSBvdXIgY29va2llIGJ5IGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEByZXR1cm4ge09iamVjdH0gdmFsdWVcbiAqL1xuXG5Db29raWUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuICB0cnkge1xuICAgIHZhciB2YWx1ZSA9IGNvb2tpZShrZXkpO1xuICAgIHZhbHVlID0gdmFsdWUgPyBqc29uLnBhcnNlKHZhbHVlKSA6IG51bGw7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBSZW1vdmUgYSB2YWx1ZSBmcm9tIG91ciBjb29raWUgYnkgYGtleWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHJldHVybiB7Qm9vbGVhbn0gcmVtb3ZlZFxuICovXG5cbkNvb2tpZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oa2V5KSB7XG4gIHRyeSB7XG4gICAgY29va2llKGtleSwgbnVsbCwgY2xvbmUodGhpcy5fb3B0aW9ucykpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5cbi8qKlxuICogRXhwb3NlIHRoZSBjb29raWUgc2luZ2xldG9uLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gYmluZC5hbGwobmV3IENvb2tpZSgpKTtcblxuXG4vKipcbiAqIEV4cG9zZSB0aGUgYENvb2tpZWAgY29uc3RydWN0b3IuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMuQ29va2llID0gQ29va2llO1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnY29va2llJyk7XG5cbi8qKlxuICogU2V0IG9yIGdldCBjb29raWUgYG5hbWVgIHdpdGggYHZhbHVlYCBhbmQgYG9wdGlvbnNgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIG9wdGlvbnMpe1xuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDM6XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIHNldChuYW1lLCB2YWx1ZSwgb3B0aW9ucyk7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIGdldChuYW1lKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGFsbCgpO1xuICB9XG59O1xuXG4vKipcbiAqIFNldCBjb29raWUgYG5hbWVgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNldChuYW1lLCB2YWx1ZSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHN0ciA9IGVuY29kZShuYW1lKSArICc9JyArIGVuY29kZSh2YWx1ZSk7XG5cbiAgaWYgKG51bGwgPT0gdmFsdWUpIG9wdGlvbnMubWF4YWdlID0gLTE7XG5cbiAgaWYgKG9wdGlvbnMubWF4YWdlKSB7XG4gICAgb3B0aW9ucy5leHBpcmVzID0gbmV3IERhdGUoK25ldyBEYXRlICsgb3B0aW9ucy5tYXhhZ2UpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMucGF0aCkgc3RyICs9ICc7IHBhdGg9JyArIG9wdGlvbnMucGF0aDtcbiAgaWYgKG9wdGlvbnMuZG9tYWluKSBzdHIgKz0gJzsgZG9tYWluPScgKyBvcHRpb25zLmRvbWFpbjtcbiAgaWYgKG9wdGlvbnMuZXhwaXJlcykgc3RyICs9ICc7IGV4cGlyZXM9JyArIG9wdGlvbnMuZXhwaXJlcy50b1VUQ1N0cmluZygpO1xuICBpZiAob3B0aW9ucy5zZWN1cmUpIHN0ciArPSAnOyBzZWN1cmUnO1xuXG4gIGRvY3VtZW50LmNvb2tpZSA9IHN0cjtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYWxsIGNvb2tpZXMuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gYWxsKCkge1xuICByZXR1cm4gcGFyc2UoZG9jdW1lbnQuY29va2llKTtcbn1cblxuLyoqXG4gKiBHZXQgY29va2llIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KG5hbWUpIHtcbiAgcmV0dXJuIGFsbCgpW25hbWVdO1xufVxuXG4vKipcbiAqIFBhcnNlIGNvb2tpZSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoLyAqOyAqLyk7XG4gIHZhciBwYWlyO1xuICBpZiAoJycgPT0gcGFpcnNbMF0pIHJldHVybiBvYmo7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV0uc3BsaXQoJz0nKTtcbiAgICBvYmpbZGVjb2RlKHBhaXJbMF0pXSA9IGRlY29kZShwYWlyWzFdKTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEVuY29kZS5cbiAqL1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsdWUpe1xuICB0cnkge1xuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZGVidWcoJ2Vycm9yIGBlbmNvZGUoJW8pYCAtICVvJywgdmFsdWUsIGUpXG4gIH1cbn1cblxuLyoqXG4gKiBEZWNvZGUuXG4gKi9cblxuZnVuY3Rpb24gZGVjb2RlKHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBkZWJ1ZygnZXJyb3IgYGRlY29kZSglbylgIC0gJW8nLCB2YWx1ZSwgZSlcbiAgfVxufVxuIiwiaWYgKCd1bmRlZmluZWQnID09IHR5cGVvZiB3aW5kb3cpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9kZWJ1ZycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlYnVnJyk7XG59XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHR0eSA9IHJlcXVpcmUoJ3R0eScpO1xuXG4vKipcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlYnVnO1xuXG4vKipcbiAqIEVuYWJsZWQgZGVidWdnZXJzLlxuICovXG5cbnZhciBuYW1lcyA9IFtdXG4gICwgc2tpcHMgPSBbXTtcblxuKHByb2Nlc3MuZW52LkRFQlVHIHx8ICcnKVxuICAuc3BsaXQoL1tcXHMsXSsvKVxuICAuZm9yRWFjaChmdW5jdGlvbihuYW1lKXtcbiAgICBuYW1lID0gbmFtZS5yZXBsYWNlKCcqJywgJy4qPycpO1xuICAgIGlmIChuYW1lWzBdID09PSAnLScpIHtcbiAgICAgIHNraXBzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lLnN1YnN0cigxKSArICckJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZSArICckJykpO1xuICAgIH1cbiAgfSk7XG5cbi8qKlxuICogQ29sb3JzLlxuICovXG5cbnZhciBjb2xvcnMgPSBbNiwgMiwgMywgNCwgNSwgMV07XG5cbi8qKlxuICogUHJldmlvdXMgZGVidWcoKSBjYWxsLlxuICovXG5cbnZhciBwcmV2ID0ge307XG5cbi8qKlxuICogUHJldmlvdXNseSBhc3NpZ25lZCBjb2xvci5cbiAqL1xuXG52YXIgcHJldkNvbG9yID0gMDtcblxuLyoqXG4gKiBJcyBzdGRvdXQgYSBUVFk/IENvbG9yZWQgb3V0cHV0IGlzIGRpc2FibGVkIHdoZW4gYHRydWVgLlxuICovXG5cbnZhciBpc2F0dHkgPSB0dHkuaXNhdHR5KDIpO1xuXG4vKipcbiAqIFNlbGVjdCBhIGNvbG9yLlxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGNvbG9yKCkge1xuICByZXR1cm4gY29sb3JzW3ByZXZDb2xvcisrICUgY29sb3JzLmxlbmd0aF07XG59XG5cbi8qKlxuICogSHVtYW5pemUgdGhlIGdpdmVuIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGh1bWFuaXplKG1zKSB7XG4gIHZhciBzZWMgPSAxMDAwXG4gICAgLCBtaW4gPSA2MCAqIDEwMDBcbiAgICAsIGhvdXIgPSA2MCAqIG1pbjtcblxuICBpZiAobXMgPj0gaG91cikgcmV0dXJuIChtcyAvIGhvdXIpLnRvRml4ZWQoMSkgKyAnaCc7XG4gIGlmIChtcyA+PSBtaW4pIHJldHVybiAobXMgLyBtaW4pLnRvRml4ZWQoMSkgKyAnbSc7XG4gIGlmIChtcyA+PSBzZWMpIHJldHVybiAobXMgLyBzZWMgfCAwKSArICdzJztcbiAgcmV0dXJuIG1zICsgJ21zJztcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1R5cGV9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRlYnVnKG5hbWUpIHtcbiAgZnVuY3Rpb24gZGlzYWJsZWQoKXt9XG4gIGRpc2FibGVkLmVuYWJsZWQgPSBmYWxzZTtcblxuICB2YXIgbWF0Y2ggPSBza2lwcy5zb21lKGZ1bmN0aW9uKHJlKXtcbiAgICByZXR1cm4gcmUudGVzdChuYW1lKTtcbiAgfSk7XG5cbiAgaWYgKG1hdGNoKSByZXR1cm4gZGlzYWJsZWQ7XG5cbiAgbWF0Y2ggPSBuYW1lcy5zb21lKGZ1bmN0aW9uKHJlKXtcbiAgICByZXR1cm4gcmUudGVzdChuYW1lKTtcbiAgfSk7XG5cbiAgaWYgKCFtYXRjaCkgcmV0dXJuIGRpc2FibGVkO1xuICB2YXIgYyA9IGNvbG9yKCk7XG5cbiAgZnVuY3Rpb24gY29sb3JlZChmbXQpIHtcbiAgICBmbXQgPSBjb2VyY2UoZm10KTtcblxuICAgIHZhciBjdXJyID0gbmV3IERhdGU7XG4gICAgdmFyIG1zID0gY3VyciAtIChwcmV2W25hbWVdIHx8IGN1cnIpO1xuICAgIHByZXZbbmFtZV0gPSBjdXJyO1xuXG4gICAgZm10ID0gJyAgXFx1MDAxYls5JyArIGMgKyAnbScgKyBuYW1lICsgJyAnXG4gICAgICArICdcXHUwMDFiWzMnICsgYyArICdtXFx1MDAxYls5MG0nXG4gICAgICArIGZtdCArICdcXHUwMDFiWzMnICsgYyArICdtJ1xuICAgICAgKyAnICsnICsgaHVtYW5pemUobXMpICsgJ1xcdTAwMWJbMG0nO1xuXG4gICAgY29uc29sZS5lcnJvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGxhaW4oZm10KSB7XG4gICAgZm10ID0gY29lcmNlKGZtdCk7XG5cbiAgICBmbXQgPSBuZXcgRGF0ZSgpLnRvVVRDU3RyaW5nKClcbiAgICAgICsgJyAnICsgbmFtZSArICcgJyArIGZtdDtcbiAgICBjb25zb2xlLmVycm9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBjb2xvcmVkLmVuYWJsZWQgPSBwbGFpbi5lbmFibGVkID0gdHJ1ZTtcblxuICByZXR1cm4gaXNhdHR5IHx8IHByb2Nlc3MuZW52LkRFQlVHX0NPTE9SU1xuICAgID8gY29sb3JlZFxuICAgIDogcGxhaW47XG59XG5cbi8qKlxuICogQ29lcmNlIGB2YWxgLlxuICovXG5cbmZ1bmN0aW9uIGNvZXJjZSh2YWwpIHtcbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEVycm9yKSByZXR1cm4gdmFsLnN0YWNrIHx8IHZhbC5tZXNzYWdlO1xuICByZXR1cm4gdmFsO1xufVxuIiwiXG4vKipcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlYnVnO1xuXG4vKipcbiAqIENyZWF0ZSBhIGRlYnVnZ2VyIHdpdGggdGhlIGdpdmVuIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7VHlwZX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGVidWcobmFtZSkge1xuICBpZiAoIWRlYnVnLmVuYWJsZWQobmFtZSkpIHJldHVybiBmdW5jdGlvbigpe307XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGZtdCl7XG4gICAgZm10ID0gY29lcmNlKGZtdCk7XG5cbiAgICB2YXIgY3VyciA9IG5ldyBEYXRlO1xuICAgIHZhciBtcyA9IGN1cnIgLSAoZGVidWdbbmFtZV0gfHwgY3Vycik7XG4gICAgZGVidWdbbmFtZV0gPSBjdXJyO1xuXG4gICAgZm10ID0gbmFtZVxuICAgICAgKyAnICdcbiAgICAgICsgZm10XG4gICAgICArICcgKycgKyBkZWJ1Zy5odW1hbml6ZShtcyk7XG5cbiAgICAvLyBUaGlzIGhhY2tlcnkgaXMgcmVxdWlyZWQgZm9yIElFOFxuICAgIC8vIHdoZXJlIGBjb25zb2xlLmxvZ2AgZG9lc24ndCBoYXZlICdhcHBseSdcbiAgICB3aW5kb3cuY29uc29sZVxuICAgICAgJiYgY29uc29sZS5sb2dcbiAgICAgICYmIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGN1cnJlbnRseSBhY3RpdmUgZGVidWcgbW9kZSBuYW1lcy5cbiAqL1xuXG5kZWJ1Zy5uYW1lcyA9IFtdO1xuZGVidWcuc2tpcHMgPSBbXTtcblxuLyoqXG4gKiBFbmFibGVzIGEgZGVidWcgbW9kZSBieSBuYW1lLiBUaGlzIGNhbiBpbmNsdWRlIG1vZGVzXG4gKiBzZXBhcmF0ZWQgYnkgYSBjb2xvbiBhbmQgd2lsZGNhcmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmRlYnVnLmVuYWJsZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdHJ5IHtcbiAgICBsb2NhbFN0b3JhZ2UuZGVidWcgPSBuYW1lO1xuICB9IGNhdGNoKGUpe31cblxuICB2YXIgc3BsaXQgPSAobmFtZSB8fCAnJykuc3BsaXQoL1tcXHMsXSsvKVxuICAgICwgbGVuID0gc3BsaXQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBuYW1lID0gc3BsaXRbaV0ucmVwbGFjZSgnKicsICcuKj8nKTtcbiAgICBpZiAobmFtZVswXSA9PT0gJy0nKSB7XG4gICAgICBkZWJ1Zy5za2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZS5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBkZWJ1Zy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZSArICckJykpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBEaXNhYmxlIGRlYnVnIG91dHB1dC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmRlYnVnLmRpc2FibGUgPSBmdW5jdGlvbigpe1xuICBkZWJ1Zy5lbmFibGUoJycpO1xufTtcblxuLyoqXG4gKiBIdW1hbml6ZSB0aGUgZ2l2ZW4gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbVxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZGVidWcuaHVtYW5pemUgPSBmdW5jdGlvbihtcykge1xuICB2YXIgc2VjID0gMTAwMFxuICAgICwgbWluID0gNjAgKiAxMDAwXG4gICAgLCBob3VyID0gNjAgKiBtaW47XG5cbiAgaWYgKG1zID49IGhvdXIpIHJldHVybiAobXMgLyBob3VyKS50b0ZpeGVkKDEpICsgJ2gnO1xuICBpZiAobXMgPj0gbWluKSByZXR1cm4gKG1zIC8gbWluKS50b0ZpeGVkKDEpICsgJ20nO1xuICBpZiAobXMgPj0gc2VjKSByZXR1cm4gKG1zIC8gc2VjIHwgMCkgKyAncyc7XG4gIHJldHVybiBtcyArICdtcyc7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbW9kZSBuYW1lIGlzIGVuYWJsZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZGVidWcuZW5hYmxlZCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRlYnVnLnNraXBzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGRlYnVnLnNraXBzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRlYnVnLm5hbWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGRlYnVnLm5hbWVzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2UodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtcbiAgcmV0dXJuIHZhbDtcbn1cblxuLy8gcGVyc2lzdFxuXG50cnkge1xuICBpZiAod2luZG93LmxvY2FsU3RvcmFnZSkgZGVidWcuZW5hYmxlKGxvY2FsU3RvcmFnZS5kZWJ1Zyk7XG59IGNhdGNoKGUpe31cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNZXJnZSBkZWZhdWx0IHZhbHVlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVzdFxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG52YXIgZGVmYXVsdHMgPSBmdW5jdGlvbiAoZGVzdCwgc3JjLCByZWN1cnNpdmUpIHtcbiAgZm9yICh2YXIgcHJvcCBpbiBzcmMpIHtcbiAgICBpZiAocmVjdXJzaXZlICYmIGRlc3RbcHJvcF0gaW5zdGFuY2VvZiBPYmplY3QgJiYgc3JjW3Byb3BdIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICBkZXN0W3Byb3BdID0gZGVmYXVsdHMoZGVzdFtwcm9wXSwgc3JjW3Byb3BdLCB0cnVlKTtcbiAgICB9IGVsc2UgaWYgKCEgKHByb3AgaW4gZGVzdCkpIHtcbiAgICAgIGRlc3RbcHJvcF0gPSBzcmNbcHJvcF07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlc3Q7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgZGVmYXVsdHNgLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiXG52YXIganNvbiA9IHdpbmRvdy5KU09OIHx8IHt9O1xudmFyIHN0cmluZ2lmeSA9IGpzb24uc3RyaW5naWZ5O1xudmFyIHBhcnNlID0ganNvbi5wYXJzZTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZSAmJiBzdHJpbmdpZnlcbiAgPyBKU09OXG4gIDogcmVxdWlyZSgnanNvbi1mYWxsYmFjaycpO1xuIiwiLypcbiAgICBqc29uMi5qc1xuICAgIDIwMTQtMDItMDRcblxuICAgIFB1YmxpYyBEb21haW4uXG5cbiAgICBOTyBXQVJSQU5UWSBFWFBSRVNTRUQgT1IgSU1QTElFRC4gVVNFIEFUIFlPVVIgT1dOIFJJU0suXG5cbiAgICBTZWUgaHR0cDovL3d3dy5KU09OLm9yZy9qcy5odG1sXG5cblxuICAgIFRoaXMgY29kZSBzaG91bGQgYmUgbWluaWZpZWQgYmVmb3JlIGRlcGxveW1lbnQuXG4gICAgU2VlIGh0dHA6Ly9qYXZhc2NyaXB0LmNyb2NrZm9yZC5jb20vanNtaW4uaHRtbFxuXG4gICAgVVNFIFlPVVIgT1dOIENPUFkuIElUIElTIEVYVFJFTUVMWSBVTldJU0UgVE8gTE9BRCBDT0RFIEZST00gU0VSVkVSUyBZT1UgRE9cbiAgICBOT1QgQ09OVFJPTC5cblxuXG4gICAgVGhpcyBmaWxlIGNyZWF0ZXMgYSBnbG9iYWwgSlNPTiBvYmplY3QgY29udGFpbmluZyB0d28gbWV0aG9kczogc3RyaW5naWZ5XG4gICAgYW5kIHBhcnNlLlxuXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHZhbHVlLCByZXBsYWNlciwgc3BhY2UpXG4gICAgICAgICAgICB2YWx1ZSAgICAgICBhbnkgSmF2YVNjcmlwdCB2YWx1ZSwgdXN1YWxseSBhbiBvYmplY3Qgb3IgYXJyYXkuXG5cbiAgICAgICAgICAgIHJlcGxhY2VyICAgIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IGRldGVybWluZXMgaG93IG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzIGFyZSBzdHJpbmdpZmllZCBmb3Igb2JqZWN0cy4gSXQgY2FuIGJlIGFcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9yIGFuIGFycmF5IG9mIHN0cmluZ3MuXG5cbiAgICAgICAgICAgIHNwYWNlICAgICAgIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgaW5kZW50YXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIG9mIG5lc3RlZCBzdHJ1Y3R1cmVzLiBJZiBpdCBpcyBvbWl0dGVkLCB0aGUgdGV4dCB3aWxsXG4gICAgICAgICAgICAgICAgICAgICAgICBiZSBwYWNrZWQgd2l0aG91dCBleHRyYSB3aGl0ZXNwYWNlLiBJZiBpdCBpcyBhIG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0IHdpbGwgc3BlY2lmeSB0aGUgbnVtYmVyIG9mIHNwYWNlcyB0byBpbmRlbnQgYXQgZWFjaFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWwuIElmIGl0IGlzIGEgc3RyaW5nIChzdWNoIGFzICdcXHQnIG9yICcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0IGNvbnRhaW5zIHRoZSBjaGFyYWN0ZXJzIHVzZWQgdG8gaW5kZW50IGF0IGVhY2ggbGV2ZWwuXG5cbiAgICAgICAgICAgIFRoaXMgbWV0aG9kIHByb2R1Y2VzIGEgSlNPTiB0ZXh0IGZyb20gYSBKYXZhU2NyaXB0IHZhbHVlLlxuXG4gICAgICAgICAgICBXaGVuIGFuIG9iamVjdCB2YWx1ZSBpcyBmb3VuZCwgaWYgdGhlIG9iamVjdCBjb250YWlucyBhIHRvSlNPTlxuICAgICAgICAgICAgbWV0aG9kLCBpdHMgdG9KU09OIG1ldGhvZCB3aWxsIGJlIGNhbGxlZCBhbmQgdGhlIHJlc3VsdCB3aWxsIGJlXG4gICAgICAgICAgICBzdHJpbmdpZmllZC4gQSB0b0pTT04gbWV0aG9kIGRvZXMgbm90IHNlcmlhbGl6ZTogaXQgcmV0dXJucyB0aGVcbiAgICAgICAgICAgIHZhbHVlIHJlcHJlc2VudGVkIGJ5IHRoZSBuYW1lL3ZhbHVlIHBhaXIgdGhhdCBzaG91bGQgYmUgc2VyaWFsaXplZCxcbiAgICAgICAgICAgIG9yIHVuZGVmaW5lZCBpZiBub3RoaW5nIHNob3VsZCBiZSBzZXJpYWxpemVkLiBUaGUgdG9KU09OIG1ldGhvZFxuICAgICAgICAgICAgd2lsbCBiZSBwYXNzZWQgdGhlIGtleSBhc3NvY2lhdGVkIHdpdGggdGhlIHZhbHVlLCBhbmQgdGhpcyB3aWxsIGJlXG4gICAgICAgICAgICBib3VuZCB0byB0aGUgdmFsdWVcblxuICAgICAgICAgICAgRm9yIGV4YW1wbGUsIHRoaXMgd291bGQgc2VyaWFsaXplIERhdGVzIGFzIElTTyBzdHJpbmdzLlxuXG4gICAgICAgICAgICAgICAgRGF0ZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBmKG4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvcm1hdCBpbnRlZ2VycyB0byBoYXZlIGF0IGxlYXN0IHR3byBkaWdpdHMuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbiA8IDEwID8gJzAnICsgbiA6IG47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRVVENGdWxsWWVhcigpICAgKyAnLScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENNb250aCgpICsgMSkgKyAnLScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENEYXRlKCkpICAgICAgKyAnVCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENIb3VycygpKSAgICAgKyAnOicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENNaW51dGVzKCkpICAgKyAnOicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENTZWNvbmRzKCkpICAgKyAnWic7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgWW91IGNhbiBwcm92aWRlIGFuIG9wdGlvbmFsIHJlcGxhY2VyIG1ldGhvZC4gSXQgd2lsbCBiZSBwYXNzZWQgdGhlXG4gICAgICAgICAgICBrZXkgYW5kIHZhbHVlIG9mIGVhY2ggbWVtYmVyLCB3aXRoIHRoaXMgYm91bmQgdG8gdGhlIGNvbnRhaW5pbmdcbiAgICAgICAgICAgIG9iamVjdC4gVGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWQgZnJvbSB5b3VyIG1ldGhvZCB3aWxsIGJlXG4gICAgICAgICAgICBzZXJpYWxpemVkLiBJZiB5b3VyIG1ldGhvZCByZXR1cm5zIHVuZGVmaW5lZCwgdGhlbiB0aGUgbWVtYmVyIHdpbGxcbiAgICAgICAgICAgIGJlIGV4Y2x1ZGVkIGZyb20gdGhlIHNlcmlhbGl6YXRpb24uXG5cbiAgICAgICAgICAgIElmIHRoZSByZXBsYWNlciBwYXJhbWV0ZXIgaXMgYW4gYXJyYXkgb2Ygc3RyaW5ncywgdGhlbiBpdCB3aWxsIGJlXG4gICAgICAgICAgICB1c2VkIHRvIHNlbGVjdCB0aGUgbWVtYmVycyB0byBiZSBzZXJpYWxpemVkLiBJdCBmaWx0ZXJzIHRoZSByZXN1bHRzXG4gICAgICAgICAgICBzdWNoIHRoYXQgb25seSBtZW1iZXJzIHdpdGgga2V5cyBsaXN0ZWQgaW4gdGhlIHJlcGxhY2VyIGFycmF5IGFyZVxuICAgICAgICAgICAgc3RyaW5naWZpZWQuXG5cbiAgICAgICAgICAgIFZhbHVlcyB0aGF0IGRvIG5vdCBoYXZlIEpTT04gcmVwcmVzZW50YXRpb25zLCBzdWNoIGFzIHVuZGVmaW5lZCBvclxuICAgICAgICAgICAgZnVuY3Rpb25zLCB3aWxsIG5vdCBiZSBzZXJpYWxpemVkLiBTdWNoIHZhbHVlcyBpbiBvYmplY3RzIHdpbGwgYmVcbiAgICAgICAgICAgIGRyb3BwZWQ7IGluIGFycmF5cyB0aGV5IHdpbGwgYmUgcmVwbGFjZWQgd2l0aCBudWxsLiBZb3UgY2FuIHVzZVxuICAgICAgICAgICAgYSByZXBsYWNlciBmdW5jdGlvbiB0byByZXBsYWNlIHRob3NlIHdpdGggSlNPTiB2YWx1ZXMuXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh1bmRlZmluZWQpIHJldHVybnMgdW5kZWZpbmVkLlxuXG4gICAgICAgICAgICBUaGUgb3B0aW9uYWwgc3BhY2UgcGFyYW1ldGVyIHByb2R1Y2VzIGEgc3RyaW5naWZpY2F0aW9uIG9mIHRoZVxuICAgICAgICAgICAgdmFsdWUgdGhhdCBpcyBmaWxsZWQgd2l0aCBsaW5lIGJyZWFrcyBhbmQgaW5kZW50YXRpb24gdG8gbWFrZSBpdFxuICAgICAgICAgICAgZWFzaWVyIHRvIHJlYWQuXG5cbiAgICAgICAgICAgIElmIHRoZSBzcGFjZSBwYXJhbWV0ZXIgaXMgYSBub24tZW1wdHkgc3RyaW5nLCB0aGVuIHRoYXQgc3RyaW5nIHdpbGxcbiAgICAgICAgICAgIGJlIHVzZWQgZm9yIGluZGVudGF0aW9uLiBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgbnVtYmVyLCB0aGVuXG4gICAgICAgICAgICB0aGUgaW5kZW50YXRpb24gd2lsbCBiZSB0aGF0IG1hbnkgc3BhY2VzLlxuXG4gICAgICAgICAgICBFeGFtcGxlOlxuXG4gICAgICAgICAgICB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoWydlJywge3BsdXJpYnVzOiAndW51bSd9XSk7XG4gICAgICAgICAgICAvLyB0ZXh0IGlzICdbXCJlXCIse1wicGx1cmlidXNcIjpcInVudW1cIn1dJ1xuXG5cbiAgICAgICAgICAgIHRleHQgPSBKU09OLnN0cmluZ2lmeShbJ2UnLCB7cGx1cmlidXM6ICd1bnVtJ31dLCBudWxsLCAnXFx0Jyk7XG4gICAgICAgICAgICAvLyB0ZXh0IGlzICdbXFxuXFx0XCJlXCIsXFxuXFx0e1xcblxcdFxcdFwicGx1cmlidXNcIjogXCJ1bnVtXCJcXG5cXHR9XFxuXSdcblxuICAgICAgICAgICAgdGV4dCA9IEpTT04uc3RyaW5naWZ5KFtuZXcgRGF0ZSgpXSwgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1trZXldIGluc3RhbmNlb2YgRGF0ZSA/XG4gICAgICAgICAgICAgICAgICAgICdEYXRlKCcgKyB0aGlzW2tleV0gKyAnKScgOiB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gdGV4dCBpcyAnW1wiRGF0ZSgtLS1jdXJyZW50IHRpbWUtLS0pXCJdJ1xuXG5cbiAgICAgICAgSlNPTi5wYXJzZSh0ZXh0LCByZXZpdmVyKVxuICAgICAgICAgICAgVGhpcyBtZXRob2QgcGFyc2VzIGEgSlNPTiB0ZXh0IHRvIHByb2R1Y2UgYW4gb2JqZWN0IG9yIGFycmF5LlxuICAgICAgICAgICAgSXQgY2FuIHRocm93IGEgU3ludGF4RXJyb3IgZXhjZXB0aW9uLlxuXG4gICAgICAgICAgICBUaGUgb3B0aW9uYWwgcmV2aXZlciBwYXJhbWV0ZXIgaXMgYSBmdW5jdGlvbiB0aGF0IGNhbiBmaWx0ZXIgYW5kXG4gICAgICAgICAgICB0cmFuc2Zvcm0gdGhlIHJlc3VsdHMuIEl0IHJlY2VpdmVzIGVhY2ggb2YgdGhlIGtleXMgYW5kIHZhbHVlcyxcbiAgICAgICAgICAgIGFuZCBpdHMgcmV0dXJuIHZhbHVlIGlzIHVzZWQgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwgdmFsdWUuXG4gICAgICAgICAgICBJZiBpdCByZXR1cm5zIHdoYXQgaXQgcmVjZWl2ZWQsIHRoZW4gdGhlIHN0cnVjdHVyZSBpcyBub3QgbW9kaWZpZWQuXG4gICAgICAgICAgICBJZiBpdCByZXR1cm5zIHVuZGVmaW5lZCB0aGVuIHRoZSBtZW1iZXIgaXMgZGVsZXRlZC5cblxuICAgICAgICAgICAgRXhhbXBsZTpcblxuICAgICAgICAgICAgLy8gUGFyc2UgdGhlIHRleHQuIFZhbHVlcyB0aGF0IGxvb2sgbGlrZSBJU08gZGF0ZSBzdHJpbmdzIHdpbGxcbiAgICAgICAgICAgIC8vIGJlIGNvbnZlcnRlZCB0byBEYXRlIG9iamVjdHMuXG5cbiAgICAgICAgICAgIG15RGF0YSA9IEpTT04ucGFyc2UodGV4dCwgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgYTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBhID1cbi9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSlUKFxcZHsyfSk6KFxcZHsyfSk6KFxcZHsyfSg/OlxcLlxcZCopPylaJC8uZXhlYyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoK2FbMV0sICthWzJdIC0gMSwgK2FbM10sICthWzRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICthWzVdLCArYVs2XSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBteURhdGEgPSBKU09OLnBhcnNlKCdbXCJEYXRlKDA5LzA5LzIwMDEpXCJdJywgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZDtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuc2xpY2UoMCwgNSkgPT09ICdEYXRlKCcgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnNsaWNlKC0xKSA9PT0gJyknKSB7XG4gICAgICAgICAgICAgICAgICAgIGQgPSBuZXcgRGF0ZSh2YWx1ZS5zbGljZSg1LCAtMSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cblxuICAgIFRoaXMgaXMgYSByZWZlcmVuY2UgaW1wbGVtZW50YXRpb24uIFlvdSBhcmUgZnJlZSB0byBjb3B5LCBtb2RpZnksIG9yXG4gICAgcmVkaXN0cmlidXRlLlxuKi9cblxuLypqc2xpbnQgZXZpbDogdHJ1ZSwgcmVnZXhwOiB0cnVlICovXG5cbi8qbWVtYmVycyBcIlwiLCBcIlxcYlwiLCBcIlxcdFwiLCBcIlxcblwiLCBcIlxcZlwiLCBcIlxcclwiLCBcIlxcXCJcIiwgSlNPTiwgXCJcXFxcXCIsIGFwcGx5LFxuICAgIGNhbGwsIGNoYXJDb2RlQXQsIGdldFVUQ0RhdGUsIGdldFVUQ0Z1bGxZZWFyLCBnZXRVVENIb3VycyxcbiAgICBnZXRVVENNaW51dGVzLCBnZXRVVENNb250aCwgZ2V0VVRDU2Vjb25kcywgaGFzT3duUHJvcGVydHksIGpvaW4sXG4gICAgbGFzdEluZGV4LCBsZW5ndGgsIHBhcnNlLCBwcm90b3R5cGUsIHB1c2gsIHJlcGxhY2UsIHNsaWNlLCBzdHJpbmdpZnksXG4gICAgdGVzdCwgdG9KU09OLCB0b1N0cmluZywgdmFsdWVPZlxuKi9cblxuXG4vLyBDcmVhdGUgYSBKU09OIG9iamVjdCBvbmx5IGlmIG9uZSBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0LiBXZSBjcmVhdGUgdGhlXG4vLyBtZXRob2RzIGluIGEgY2xvc3VyZSB0byBhdm9pZCBjcmVhdGluZyBnbG9iYWwgdmFyaWFibGVzLlxuXG4oZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBKU09OID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGYobikge1xuICAgICAgICAvLyBGb3JtYXQgaW50ZWdlcnMgdG8gaGF2ZSBhdCBsZWFzdCB0d28gZGlnaXRzLlxuICAgICAgICByZXR1cm4gbiA8IDEwID8gJzAnICsgbiA6IG47XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBEYXRlLnByb3RvdHlwZS50b0pTT04gIT09ICdmdW5jdGlvbicpIHtcblxuICAgICAgICBEYXRlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBpc0Zpbml0ZSh0aGlzLnZhbHVlT2YoKSlcbiAgICAgICAgICAgICAgICA/IHRoaXMuZ2V0VVRDRnVsbFllYXIoKSAgICAgKyAnLScgK1xuICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDTW9udGgoKSArIDEpICsgJy0nICtcbiAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ0RhdGUoKSkgICAgICArICdUJyArXG4gICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENIb3VycygpKSAgICAgKyAnOicgK1xuICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDTWludXRlcygpKSAgICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ1NlY29uZHMoKSkgICArICdaJ1xuICAgICAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgfTtcblxuICAgICAgICBTdHJpbmcucHJvdG90eXBlLnRvSlNPTiAgICAgID1cbiAgICAgICAgICAgIE51bWJlci5wcm90b3R5cGUudG9KU09OICA9XG4gICAgICAgICAgICBCb29sZWFuLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVPZigpO1xuICAgICAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgY3gsXG4gICAgICAgIGVzY2FwYWJsZSxcbiAgICAgICAgZ2FwLFxuICAgICAgICBpbmRlbnQsXG4gICAgICAgIG1ldGEsXG4gICAgICAgIHJlcDtcblxuXG4gICAgZnVuY3Rpb24gcXVvdGUoc3RyaW5nKSB7XG5cbi8vIElmIHRoZSBzdHJpbmcgY29udGFpbnMgbm8gY29udHJvbCBjaGFyYWN0ZXJzLCBubyBxdW90ZSBjaGFyYWN0ZXJzLCBhbmQgbm9cbi8vIGJhY2tzbGFzaCBjaGFyYWN0ZXJzLCB0aGVuIHdlIGNhbiBzYWZlbHkgc2xhcCBzb21lIHF1b3RlcyBhcm91bmQgaXQuXG4vLyBPdGhlcndpc2Ugd2UgbXVzdCBhbHNvIHJlcGxhY2UgdGhlIG9mZmVuZGluZyBjaGFyYWN0ZXJzIHdpdGggc2FmZSBlc2NhcGVcbi8vIHNlcXVlbmNlcy5cblxuICAgICAgICBlc2NhcGFibGUubGFzdEluZGV4ID0gMDtcbiAgICAgICAgcmV0dXJuIGVzY2FwYWJsZS50ZXN0KHN0cmluZykgPyAnXCInICsgc3RyaW5nLnJlcGxhY2UoZXNjYXBhYmxlLCBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgdmFyIGMgPSBtZXRhW2FdO1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBjID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgID8gY1xuICAgICAgICAgICAgICAgIDogJ1xcXFx1JyArICgnMDAwMCcgKyBhLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtNCk7XG4gICAgICAgIH0pICsgJ1wiJyA6ICdcIicgKyBzdHJpbmcgKyAnXCInO1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gc3RyKGtleSwgaG9sZGVyKSB7XG5cbi8vIFByb2R1Y2UgYSBzdHJpbmcgZnJvbSBob2xkZXJba2V5XS5cblxuICAgICAgICB2YXIgaSwgICAgICAgICAgLy8gVGhlIGxvb3AgY291bnRlci5cbiAgICAgICAgICAgIGssICAgICAgICAgIC8vIFRoZSBtZW1iZXIga2V5LlxuICAgICAgICAgICAgdiwgICAgICAgICAgLy8gVGhlIG1lbWJlciB2YWx1ZS5cbiAgICAgICAgICAgIGxlbmd0aCxcbiAgICAgICAgICAgIG1pbmQgPSBnYXAsXG4gICAgICAgICAgICBwYXJ0aWFsLFxuICAgICAgICAgICAgdmFsdWUgPSBob2xkZXJba2V5XTtcblxuLy8gSWYgdGhlIHZhbHVlIGhhcyBhIHRvSlNPTiBtZXRob2QsIGNhbGwgaXQgdG8gb2J0YWluIGEgcmVwbGFjZW1lbnQgdmFsdWUuXG5cbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgdmFsdWUudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvSlNPTihrZXkpO1xuICAgICAgICB9XG5cbi8vIElmIHdlIHdlcmUgY2FsbGVkIHdpdGggYSByZXBsYWNlciBmdW5jdGlvbiwgdGhlbiBjYWxsIHRoZSByZXBsYWNlciB0b1xuLy8gb2J0YWluIGEgcmVwbGFjZW1lbnQgdmFsdWUuXG5cbiAgICAgICAgaWYgKHR5cGVvZiByZXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcmVwLmNhbGwoaG9sZGVyLCBrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuXG4vLyBXaGF0IGhhcHBlbnMgbmV4dCBkZXBlbmRzIG9uIHRoZSB2YWx1ZSdzIHR5cGUuXG5cbiAgICAgICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgIHJldHVybiBxdW90ZSh2YWx1ZSk7XG5cbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcblxuLy8gSlNPTiBudW1iZXJzIG11c3QgYmUgZmluaXRlLiBFbmNvZGUgbm9uLWZpbml0ZSBudW1iZXJzIGFzIG51bGwuXG5cbiAgICAgICAgICAgIHJldHVybiBpc0Zpbml0ZSh2YWx1ZSkgPyBTdHJpbmcodmFsdWUpIDogJ251bGwnO1xuXG4gICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICBjYXNlICdudWxsJzpcblxuLy8gSWYgdGhlIHZhbHVlIGlzIGEgYm9vbGVhbiBvciBudWxsLCBjb252ZXJ0IGl0IHRvIGEgc3RyaW5nLiBOb3RlOlxuLy8gdHlwZW9mIG51bGwgZG9lcyBub3QgcHJvZHVjZSAnbnVsbCcuIFRoZSBjYXNlIGlzIGluY2x1ZGVkIGhlcmUgaW5cbi8vIHRoZSByZW1vdGUgY2hhbmNlIHRoYXQgdGhpcyBnZXRzIGZpeGVkIHNvbWVkYXkuXG5cbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuXG4vLyBJZiB0aGUgdHlwZSBpcyAnb2JqZWN0Jywgd2UgbWlnaHQgYmUgZGVhbGluZyB3aXRoIGFuIG9iamVjdCBvciBhbiBhcnJheSBvclxuLy8gbnVsbC5cblxuICAgICAgICBjYXNlICdvYmplY3QnOlxuXG4vLyBEdWUgdG8gYSBzcGVjaWZpY2F0aW9uIGJsdW5kZXIgaW4gRUNNQVNjcmlwdCwgdHlwZW9mIG51bGwgaXMgJ29iamVjdCcsXG4vLyBzbyB3YXRjaCBvdXQgZm9yIHRoYXQgY2FzZS5cblxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnbnVsbCc7XG4gICAgICAgICAgICB9XG5cbi8vIE1ha2UgYW4gYXJyYXkgdG8gaG9sZCB0aGUgcGFydGlhbCByZXN1bHRzIG9mIHN0cmluZ2lmeWluZyB0aGlzIG9iamVjdCB2YWx1ZS5cblxuICAgICAgICAgICAgZ2FwICs9IGluZGVudDtcbiAgICAgICAgICAgIHBhcnRpYWwgPSBbXTtcblxuLy8gSXMgdGhlIHZhbHVlIGFuIGFycmF5P1xuXG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5hcHBseSh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcblxuLy8gVGhlIHZhbHVlIGlzIGFuIGFycmF5LiBTdHJpbmdpZnkgZXZlcnkgZWxlbWVudC4gVXNlIG51bGwgYXMgYSBwbGFjZWhvbGRlclxuLy8gZm9yIG5vbi1KU09OIHZhbHVlcy5cblxuICAgICAgICAgICAgICAgIGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydGlhbFtpXSA9IHN0cihpLCB2YWx1ZSkgfHwgJ251bGwnO1xuICAgICAgICAgICAgICAgIH1cblxuLy8gSm9pbiBhbGwgb2YgdGhlIGVsZW1lbnRzIHRvZ2V0aGVyLCBzZXBhcmF0ZWQgd2l0aCBjb21tYXMsIGFuZCB3cmFwIHRoZW0gaW5cbi8vIGJyYWNrZXRzLlxuXG4gICAgICAgICAgICAgICAgdiA9IHBhcnRpYWwubGVuZ3RoID09PSAwXG4gICAgICAgICAgICAgICAgICAgID8gJ1tdJ1xuICAgICAgICAgICAgICAgICAgICA6IGdhcFxuICAgICAgICAgICAgICAgICAgICA/ICdbXFxuJyArIGdhcCArIHBhcnRpYWwuam9pbignLFxcbicgKyBnYXApICsgJ1xcbicgKyBtaW5kICsgJ10nXG4gICAgICAgICAgICAgICAgICAgIDogJ1snICsgcGFydGlhbC5qb2luKCcsJykgKyAnXSc7XG4gICAgICAgICAgICAgICAgZ2FwID0gbWluZDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgIH1cblxuLy8gSWYgdGhlIHJlcGxhY2VyIGlzIGFuIGFycmF5LCB1c2UgaXQgdG8gc2VsZWN0IHRoZSBtZW1iZXJzIHRvIGJlIHN0cmluZ2lmaWVkLlxuXG4gICAgICAgICAgICBpZiAocmVwICYmIHR5cGVvZiByZXAgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gcmVwLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXBbaV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrID0gcmVwW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgdiA9IHN0cihrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpYWwucHVzaChxdW90ZShrKSArIChnYXAgPyAnOiAnIDogJzonKSArIHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcblxuLy8gT3RoZXJ3aXNlLCBpdGVyYXRlIHRocm91Z2ggYWxsIG9mIHRoZSBrZXlzIGluIHRoZSBvYmplY3QuXG5cbiAgICAgICAgICAgICAgICBmb3IgKGsgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHYgPSBzdHIoaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsLnB1c2gocXVvdGUoaykgKyAoZ2FwID8gJzogJyA6ICc6JykgKyB2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuLy8gSm9pbiBhbGwgb2YgdGhlIG1lbWJlciB0ZXh0cyB0b2dldGhlciwgc2VwYXJhdGVkIHdpdGggY29tbWFzLFxuLy8gYW5kIHdyYXAgdGhlbSBpbiBicmFjZXMuXG5cbiAgICAgICAgICAgIHYgPSBwYXJ0aWFsLmxlbmd0aCA9PT0gMFxuICAgICAgICAgICAgICAgID8gJ3t9J1xuICAgICAgICAgICAgICAgIDogZ2FwXG4gICAgICAgICAgICAgICAgPyAne1xcbicgKyBnYXAgKyBwYXJ0aWFsLmpvaW4oJyxcXG4nICsgZ2FwKSArICdcXG4nICsgbWluZCArICd9J1xuICAgICAgICAgICAgICAgIDogJ3snICsgcGFydGlhbC5qb2luKCcsJykgKyAnfSc7XG4gICAgICAgICAgICBnYXAgPSBtaW5kO1xuICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgIH1cbiAgICB9XG5cbi8vIElmIHRoZSBKU09OIG9iamVjdCBkb2VzIG5vdCB5ZXQgaGF2ZSBhIHN0cmluZ2lmeSBtZXRob2QsIGdpdmUgaXQgb25lLlxuXG4gICAgaWYgKHR5cGVvZiBKU09OLnN0cmluZ2lmeSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBlc2NhcGFibGUgPSAvW1xcXFxcXFwiXFx4MDAtXFx4MWZcXHg3Zi1cXHg5ZlxcdTAwYWRcXHUwNjAwLVxcdTA2MDRcXHUwNzBmXFx1MTdiNFxcdTE3YjVcXHUyMDBjLVxcdTIwMGZcXHUyMDI4LVxcdTIwMmZcXHUyMDYwLVxcdTIwNmZcXHVmZWZmXFx1ZmZmMC1cXHVmZmZmXS9nO1xuICAgICAgICBtZXRhID0geyAgICAvLyB0YWJsZSBvZiBjaGFyYWN0ZXIgc3Vic3RpdHV0aW9uc1xuICAgICAgICAgICAgJ1xcYic6ICdcXFxcYicsXG4gICAgICAgICAgICAnXFx0JzogJ1xcXFx0JyxcbiAgICAgICAgICAgICdcXG4nOiAnXFxcXG4nLFxuICAgICAgICAgICAgJ1xcZic6ICdcXFxcZicsXG4gICAgICAgICAgICAnXFxyJzogJ1xcXFxyJyxcbiAgICAgICAgICAgICdcIicgOiAnXFxcXFwiJyxcbiAgICAgICAgICAgICdcXFxcJzogJ1xcXFxcXFxcJ1xuICAgICAgICB9O1xuICAgICAgICBKU09OLnN0cmluZ2lmeSA9IGZ1bmN0aW9uICh2YWx1ZSwgcmVwbGFjZXIsIHNwYWNlKSB7XG5cbi8vIFRoZSBzdHJpbmdpZnkgbWV0aG9kIHRha2VzIGEgdmFsdWUgYW5kIGFuIG9wdGlvbmFsIHJlcGxhY2VyLCBhbmQgYW4gb3B0aW9uYWxcbi8vIHNwYWNlIHBhcmFtZXRlciwgYW5kIHJldHVybnMgYSBKU09OIHRleHQuIFRoZSByZXBsYWNlciBjYW4gYmUgYSBmdW5jdGlvblxuLy8gdGhhdCBjYW4gcmVwbGFjZSB2YWx1ZXMsIG9yIGFuIGFycmF5IG9mIHN0cmluZ3MgdGhhdCB3aWxsIHNlbGVjdCB0aGUga2V5cy5cbi8vIEEgZGVmYXVsdCByZXBsYWNlciBtZXRob2QgY2FuIGJlIHByb3ZpZGVkLiBVc2Ugb2YgdGhlIHNwYWNlIHBhcmFtZXRlciBjYW5cbi8vIHByb2R1Y2UgdGV4dCB0aGF0IGlzIG1vcmUgZWFzaWx5IHJlYWRhYmxlLlxuXG4gICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgIGdhcCA9ICcnO1xuICAgICAgICAgICAgaW5kZW50ID0gJyc7XG5cbi8vIElmIHRoZSBzcGFjZSBwYXJhbWV0ZXIgaXMgYSBudW1iZXIsIG1ha2UgYW4gaW5kZW50IHN0cmluZyBjb250YWluaW5nIHRoYXRcbi8vIG1hbnkgc3BhY2VzLlxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNwYWNlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBzcGFjZTsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGVudCArPSAnICc7XG4gICAgICAgICAgICAgICAgfVxuXG4vLyBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgc3RyaW5nLCBpdCB3aWxsIGJlIHVzZWQgYXMgdGhlIGluZGVudCBzdHJpbmcuXG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNwYWNlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGluZGVudCA9IHNwYWNlO1xuICAgICAgICAgICAgfVxuXG4vLyBJZiB0aGVyZSBpcyBhIHJlcGxhY2VyLCBpdCBtdXN0IGJlIGEgZnVuY3Rpb24gb3IgYW4gYXJyYXkuXG4vLyBPdGhlcndpc2UsIHRocm93IGFuIGVycm9yLlxuXG4gICAgICAgICAgICByZXAgPSByZXBsYWNlcjtcbiAgICAgICAgICAgIGlmIChyZXBsYWNlciAmJiB0eXBlb2YgcmVwbGFjZXIgIT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgICAgICAgICAgICAgKHR5cGVvZiByZXBsYWNlciAhPT0gJ29iamVjdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHJlcGxhY2VyLmxlbmd0aCAhPT0gJ251bWJlcicpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdKU09OLnN0cmluZ2lmeScpO1xuICAgICAgICAgICAgfVxuXG4vLyBNYWtlIGEgZmFrZSByb290IG9iamVjdCBjb250YWluaW5nIG91ciB2YWx1ZSB1bmRlciB0aGUga2V5IG9mICcnLlxuLy8gUmV0dXJuIHRoZSByZXN1bHQgb2Ygc3RyaW5naWZ5aW5nIHRoZSB2YWx1ZS5cblxuICAgICAgICAgICAgcmV0dXJuIHN0cignJywgeycnOiB2YWx1ZX0pO1xuICAgICAgICB9O1xuICAgIH1cblxuXG4vLyBJZiB0aGUgSlNPTiBvYmplY3QgZG9lcyBub3QgeWV0IGhhdmUgYSBwYXJzZSBtZXRob2QsIGdpdmUgaXQgb25lLlxuXG4gICAgaWYgKHR5cGVvZiBKU09OLnBhcnNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGN4ID0gL1tcXHUwMDAwXFx1MDBhZFxcdTA2MDAtXFx1MDYwNFxcdTA3MGZcXHUxN2I0XFx1MTdiNVxcdTIwMGMtXFx1MjAwZlxcdTIwMjgtXFx1MjAyZlxcdTIwNjAtXFx1MjA2ZlxcdWZlZmZcXHVmZmYwLVxcdWZmZmZdL2c7XG4gICAgICAgIEpTT04ucGFyc2UgPSBmdW5jdGlvbiAodGV4dCwgcmV2aXZlcikge1xuXG4vLyBUaGUgcGFyc2UgbWV0aG9kIHRha2VzIGEgdGV4dCBhbmQgYW4gb3B0aW9uYWwgcmV2aXZlciBmdW5jdGlvbiwgYW5kIHJldHVybnNcbi8vIGEgSmF2YVNjcmlwdCB2YWx1ZSBpZiB0aGUgdGV4dCBpcyBhIHZhbGlkIEpTT04gdGV4dC5cblxuICAgICAgICAgICAgdmFyIGo7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHdhbGsoaG9sZGVyLCBrZXkpIHtcblxuLy8gVGhlIHdhbGsgbWV0aG9kIGlzIHVzZWQgdG8gcmVjdXJzaXZlbHkgd2FsayB0aGUgcmVzdWx0aW5nIHN0cnVjdHVyZSBzb1xuLy8gdGhhdCBtb2RpZmljYXRpb25zIGNhbiBiZSBtYWRlLlxuXG4gICAgICAgICAgICAgICAgdmFyIGssIHYsIHZhbHVlID0gaG9sZGVyW2tleV07XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYgPSB3YWxrKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsdWVba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXZpdmVyLmNhbGwoaG9sZGVyLCBrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuXG4vLyBQYXJzaW5nIGhhcHBlbnMgaW4gZm91ciBzdGFnZXMuIEluIHRoZSBmaXJzdCBzdGFnZSwgd2UgcmVwbGFjZSBjZXJ0YWluXG4vLyBVbmljb2RlIGNoYXJhY3RlcnMgd2l0aCBlc2NhcGUgc2VxdWVuY2VzLiBKYXZhU2NyaXB0IGhhbmRsZXMgbWFueSBjaGFyYWN0ZXJzXG4vLyBpbmNvcnJlY3RseSwgZWl0aGVyIHNpbGVudGx5IGRlbGV0aW5nIHRoZW0sIG9yIHRyZWF0aW5nIHRoZW0gYXMgbGluZSBlbmRpbmdzLlxuXG4gICAgICAgICAgICB0ZXh0ID0gU3RyaW5nKHRleHQpO1xuICAgICAgICAgICAgY3gubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICAgIGlmIChjeC50ZXN0KHRleHQpKSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShjeCwgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdcXFxcdScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKCcwMDAwJyArIGEuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikpLnNsaWNlKC00KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuLy8gSW4gdGhlIHNlY29uZCBzdGFnZSwgd2UgcnVuIHRoZSB0ZXh0IGFnYWluc3QgcmVndWxhciBleHByZXNzaW9ucyB0aGF0IGxvb2tcbi8vIGZvciBub24tSlNPTiBwYXR0ZXJucy4gV2UgYXJlIGVzcGVjaWFsbHkgY29uY2VybmVkIHdpdGggJygpJyBhbmQgJ25ldydcbi8vIGJlY2F1c2UgdGhleSBjYW4gY2F1c2UgaW52b2NhdGlvbiwgYW5kICc9JyBiZWNhdXNlIGl0IGNhbiBjYXVzZSBtdXRhdGlvbi5cbi8vIEJ1dCBqdXN0IHRvIGJlIHNhZmUsIHdlIHdhbnQgdG8gcmVqZWN0IGFsbCB1bmV4cGVjdGVkIGZvcm1zLlxuXG4vLyBXZSBzcGxpdCB0aGUgc2Vjb25kIHN0YWdlIGludG8gNCByZWdleHAgb3BlcmF0aW9ucyBpbiBvcmRlciB0byB3b3JrIGFyb3VuZFxuLy8gY3JpcHBsaW5nIGluZWZmaWNpZW5jaWVzIGluIElFJ3MgYW5kIFNhZmFyaSdzIHJlZ2V4cCBlbmdpbmVzLiBGaXJzdCB3ZVxuLy8gcmVwbGFjZSB0aGUgSlNPTiBiYWNrc2xhc2ggcGFpcnMgd2l0aCAnQCcgKGEgbm9uLUpTT04gY2hhcmFjdGVyKS4gU2Vjb25kLCB3ZVxuLy8gcmVwbGFjZSBhbGwgc2ltcGxlIHZhbHVlIHRva2VucyB3aXRoICddJyBjaGFyYWN0ZXJzLiBUaGlyZCwgd2UgZGVsZXRlIGFsbFxuLy8gb3BlbiBicmFja2V0cyB0aGF0IGZvbGxvdyBhIGNvbG9uIG9yIGNvbW1hIG9yIHRoYXQgYmVnaW4gdGhlIHRleHQuIEZpbmFsbHksXG4vLyB3ZSBsb29rIHRvIHNlZSB0aGF0IHRoZSByZW1haW5pbmcgY2hhcmFjdGVycyBhcmUgb25seSB3aGl0ZXNwYWNlIG9yICddJyBvclxuLy8gJywnIG9yICc6JyBvciAneycgb3IgJ30nLiBJZiB0aGF0IGlzIHNvLCB0aGVuIHRoZSB0ZXh0IGlzIHNhZmUgZm9yIGV2YWwuXG5cbiAgICAgICAgICAgIGlmICgvXltcXF0sOnt9XFxzXSokL1xuICAgICAgICAgICAgICAgICAgICAudGVzdCh0ZXh0LnJlcGxhY2UoL1xcXFwoPzpbXCJcXFxcXFwvYmZucnRdfHVbMC05YS1mQS1GXXs0fSkvZywgJ0AnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1wiW15cIlxcXFxcXG5cXHJdKlwifHRydWV8ZmFsc2V8bnVsbHwtP1xcZCsoPzpcXC5cXGQqKT8oPzpbZUVdWytcXC1dP1xcZCspPy9nLCAnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKD86Xnw6fCwpKD86XFxzKlxcWykrL2csICcnKSkpIHtcblxuLy8gSW4gdGhlIHRoaXJkIHN0YWdlIHdlIHVzZSB0aGUgZXZhbCBmdW5jdGlvbiB0byBjb21waWxlIHRoZSB0ZXh0IGludG8gYVxuLy8gSmF2YVNjcmlwdCBzdHJ1Y3R1cmUuIFRoZSAneycgb3BlcmF0b3IgaXMgc3ViamVjdCB0byBhIHN5bnRhY3RpYyBhbWJpZ3VpdHlcbi8vIGluIEphdmFTY3JpcHQ6IGl0IGNhbiBiZWdpbiBhIGJsb2NrIG9yIGFuIG9iamVjdCBsaXRlcmFsLiBXZSB3cmFwIHRoZSB0ZXh0XG4vLyBpbiBwYXJlbnMgdG8gZWxpbWluYXRlIHRoZSBhbWJpZ3VpdHkuXG5cbiAgICAgICAgICAgICAgICBqID0gZXZhbCgnKCcgKyB0ZXh0ICsgJyknKTtcblxuLy8gSW4gdGhlIG9wdGlvbmFsIGZvdXJ0aCBzdGFnZSwgd2UgcmVjdXJzaXZlbHkgd2FsayB0aGUgbmV3IHN0cnVjdHVyZSwgcGFzc2luZ1xuLy8gZWFjaCBuYW1lL3ZhbHVlIHBhaXIgdG8gYSByZXZpdmVyIGZ1bmN0aW9uIGZvciBwb3NzaWJsZSB0cmFuc2Zvcm1hdGlvbi5cblxuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICA/IHdhbGsoeycnOiBqfSwgJycpXG4gICAgICAgICAgICAgICAgICAgIDogajtcbiAgICAgICAgICAgIH1cblxuLy8gSWYgdGhlIHRleHQgaXMgbm90IEpTT04gcGFyc2VhYmxlLCB0aGVuIGEgU3ludGF4RXJyb3IgaXMgdGhyb3duLlxuXG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ0pTT04ucGFyc2UnKTtcbiAgICAgICAgfTtcbiAgICB9XG59KCkpO1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHBhcnNlID0gcmVxdWlyZSgndXJsJykucGFyc2U7XG52YXIgY29va2llID0gcmVxdWlyZSgnY29va2llJyk7XG5cbi8qKlxuICogRXhwb3NlIGBkb21haW5gXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZG9tYWluO1xuXG4vKipcbiAqIEV4cG9zZSBgY29va2llYCBmb3IgdGVzdGluZy5cbiAqL1xuXG5leHBvcnRzLmNvb2tpZSA9IGNvb2tpZTtcblxuLyoqXG4gKiBHZXQgdGhlIHRvcCBkb21haW4uXG4gKlxuICogVGhlIGZ1bmN0aW9uIGNvbnN0cnVjdHMgdGhlIGxldmVscyBvZiBkb21haW5cbiAqIGFuZCBhdHRlbXB0cyB0byBzZXQgYSBnbG9iYWwgY29va2llIG9uIGVhY2ggb25lXG4gKiB3aGVuIGl0IHN1Y2NlZWRzIGl0IHJldHVybnMgdGhlIHRvcCBsZXZlbCBkb21haW4uXG4gKlxuICogVGhlIG1ldGhvZCByZXR1cm5zIGFuIGVtcHR5IHN0cmluZyB3aGVuIHRoZSBob3N0bmFtZVxuICogaXMgYW4gaXAgb3IgYGxvY2FsaG9zdGAuXG4gKlxuICogRXhhbXBsZSBsZXZlbHM6XG4gKlxuICogICAgICBkb21haW4ubGV2ZWxzKCdodHRwOi8vd3d3Lmdvb2dsZS5jby51aycpO1xuICogICAgICAvLyA9PiBbXCJjby51a1wiLCBcImdvb2dsZS5jby51a1wiLCBcInd3dy5nb29nbGUuY28udWtcIl1cbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgICBkb21haW4oJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9iYXonKTtcbiAqICAgICAgLy8gPT4gJydcbiAqICAgICAgZG9tYWluKCdodHRwOi8vZGV2OjMwMDAvYmF6Jyk7XG4gKiAgICAgIC8vID0+ICcnXG4gKiAgICAgIGRvbWFpbignaHR0cDovLzEyNy4wLjAuMTozMDAwL2JheicpO1xuICogICAgICAvLyA9PiAnJ1xuICogICAgICBkb21haW4oJ2h0dHA6Ly9zZWdtZW50LmlvL2JheicpO1xuICogICAgICAvLyA9PiAnc2VnbWVudC5pbydcbiAqIFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkb21haW4odXJsKXtcbiAgdmFyIGNvb2tpZSA9IGV4cG9ydHMuY29va2llO1xuICB2YXIgbGV2ZWxzID0gZXhwb3J0cy5sZXZlbHModXJsKTtcblxuICAvLyBMb29rdXAgdGhlIHJlYWwgdG9wIGxldmVsIG9uZS5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZXZlbHMubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgY25hbWUgPSAnX190bGRfXyc7XG4gICAgdmFyIGRvbWFpbiA9IGxldmVsc1tpXTtcbiAgICB2YXIgb3B0cyA9IHsgZG9tYWluOiAnLicgKyBkb21haW4gfTtcblxuICAgIGNvb2tpZShjbmFtZSwgMSwgb3B0cyk7XG4gICAgaWYgKGNvb2tpZShjbmFtZSkpIHtcbiAgICAgIGNvb2tpZShjbmFtZSwgbnVsbCwgb3B0cyk7XG4gICAgICByZXR1cm4gZG9tYWluXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuICcnO1xufTtcblxuLyoqXG4gKiBMZXZlbHMgcmV0dXJucyBhbGwgbGV2ZWxzIG9mIHRoZSBnaXZlbiB1cmwuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmRvbWFpbi5sZXZlbHMgPSBmdW5jdGlvbih1cmwpe1xuICB2YXIgaG9zdCA9IHBhcnNlKHVybCkuaG9zdG5hbWU7XG4gIHZhciBwYXJ0cyA9IGhvc3Quc3BsaXQoJy4nKTtcbiAgdmFyIGxhc3QgPSBwYXJ0c1twYXJ0cy5sZW5ndGgtMV07XG4gIHZhciBsZXZlbHMgPSBbXTtcblxuICAvLyBJcCBhZGRyZXNzLlxuICBpZiAoNCA9PSBwYXJ0cy5sZW5ndGggJiYgcGFyc2VJbnQobGFzdCwgMTApID09IGxhc3QpIHtcbiAgICByZXR1cm4gbGV2ZWxzO1xuICB9XG5cbiAgLy8gTG9jYWxob3N0LlxuICBpZiAoMSA+PSBwYXJ0cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbGV2ZWxzO1xuICB9XG5cbiAgLy8gQ3JlYXRlIGxldmVscy5cbiAgZm9yICh2YXIgaSA9IHBhcnRzLmxlbmd0aC0yOyAwIDw9IGk7IC0taSkge1xuICAgIGxldmVscy5wdXNoKHBhcnRzLnNsaWNlKGkpLmpvaW4oJy4nKSk7XG4gIH1cblxuICByZXR1cm4gbGV2ZWxzO1xufTtcbiIsIlxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24odXJsKXtcbiAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gIGEuaHJlZiA9IHVybDtcbiAgcmV0dXJuIHtcbiAgICBocmVmOiBhLmhyZWYsXG4gICAgaG9zdDogYS5ob3N0IHx8IGxvY2F0aW9uLmhvc3QsXG4gICAgcG9ydDogKCcwJyA9PT0gYS5wb3J0IHx8ICcnID09PSBhLnBvcnQpID8gcG9ydChhLnByb3RvY29sKSA6IGEucG9ydCxcbiAgICBoYXNoOiBhLmhhc2gsXG4gICAgaG9zdG5hbWU6IGEuaG9zdG5hbWUgfHwgbG9jYXRpb24uaG9zdG5hbWUsXG4gICAgcGF0aG5hbWU6IGEucGF0aG5hbWUuY2hhckF0KDApICE9ICcvJyA/ICcvJyArIGEucGF0aG5hbWUgOiBhLnBhdGhuYW1lLFxuICAgIHByb3RvY29sOiAhYS5wcm90b2NvbCB8fCAnOicgPT0gYS5wcm90b2NvbCA/IGxvY2F0aW9uLnByb3RvY29sIDogYS5wcm90b2NvbCxcbiAgICBzZWFyY2g6IGEuc2VhcmNoLFxuICAgIHF1ZXJ5OiBhLnNlYXJjaC5zbGljZSgxKVxuICB9O1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBgdXJsYCBpcyBhYnNvbHV0ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmlzQWJzb2x1dGUgPSBmdW5jdGlvbih1cmwpe1xuICByZXR1cm4gMCA9PSB1cmwuaW5kZXhPZignLy8nKSB8fCAhIX51cmwuaW5kZXhPZignOi8vJyk7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGB1cmxgIGlzIHJlbGF0aXZlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuaXNSZWxhdGl2ZSA9IGZ1bmN0aW9uKHVybCl7XG4gIHJldHVybiAhZXhwb3J0cy5pc0Fic29sdXRlKHVybCk7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGB1cmxgIGlzIGNyb3NzIGRvbWFpbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmlzQ3Jvc3NEb21haW4gPSBmdW5jdGlvbih1cmwpe1xuICB1cmwgPSBleHBvcnRzLnBhcnNlKHVybCk7XG4gIHZhciBsb2NhdGlvbiA9IGV4cG9ydHMucGFyc2Uod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICByZXR1cm4gdXJsLmhvc3RuYW1lICE9PSBsb2NhdGlvbi5ob3N0bmFtZVxuICAgIHx8IHVybC5wb3J0ICE9PSBsb2NhdGlvbi5wb3J0XG4gICAgfHwgdXJsLnByb3RvY29sICE9PSBsb2NhdGlvbi5wcm90b2NvbDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGRlZmF1bHQgcG9ydCBmb3IgYHByb3RvY29sYC5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHByb3RvY29sXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gcG9ydCAocHJvdG9jb2wpe1xuICBzd2l0Y2ggKHByb3RvY29sKSB7XG4gICAgY2FzZSAnaHR0cDonOlxuICAgICAgcmV0dXJuIDgwO1xuICAgIGNhc2UgJ2h0dHBzOic6XG4gICAgICByZXR1cm4gNDQzO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbG9jYXRpb24ucG9ydDtcbiAgfVxufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnY29va2llJyk7XG5cbi8qKlxuICogU2V0IG9yIGdldCBjb29raWUgYG5hbWVgIHdpdGggYHZhbHVlYCBhbmQgYG9wdGlvbnNgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIG9wdGlvbnMpe1xuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDM6XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIHNldChuYW1lLCB2YWx1ZSwgb3B0aW9ucyk7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIGdldChuYW1lKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGFsbCgpO1xuICB9XG59O1xuXG4vKipcbiAqIFNldCBjb29raWUgYG5hbWVgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNldChuYW1lLCB2YWx1ZSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHN0ciA9IGVuY29kZShuYW1lKSArICc9JyArIGVuY29kZSh2YWx1ZSk7XG5cbiAgaWYgKG51bGwgPT0gdmFsdWUpIG9wdGlvbnMubWF4YWdlID0gLTE7XG5cbiAgaWYgKG9wdGlvbnMubWF4YWdlKSB7XG4gICAgb3B0aW9ucy5leHBpcmVzID0gbmV3IERhdGUoK25ldyBEYXRlICsgb3B0aW9ucy5tYXhhZ2UpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMucGF0aCkgc3RyICs9ICc7IHBhdGg9JyArIG9wdGlvbnMucGF0aDtcbiAgaWYgKG9wdGlvbnMuZG9tYWluKSBzdHIgKz0gJzsgZG9tYWluPScgKyBvcHRpb25zLmRvbWFpbjtcbiAgaWYgKG9wdGlvbnMuZXhwaXJlcykgc3RyICs9ICc7IGV4cGlyZXM9JyArIG9wdGlvbnMuZXhwaXJlcy50b1VUQ1N0cmluZygpO1xuICBpZiAob3B0aW9ucy5zZWN1cmUpIHN0ciArPSAnOyBzZWN1cmUnO1xuXG4gIGRvY3VtZW50LmNvb2tpZSA9IHN0cjtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYWxsIGNvb2tpZXMuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gYWxsKCkge1xuICB2YXIgc3RyO1xuICB0cnkge1xuICAgIHN0ciA9IGRvY3VtZW50LmNvb2tpZTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyKTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xuICB9XG4gIHJldHVybiBwYXJzZShzdHIpO1xufVxuXG4vKipcbiAqIEdldCBjb29raWUgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBnZXQobmFtZSkge1xuICByZXR1cm4gYWxsKClbbmFtZV07XG59XG5cbi8qKlxuICogUGFyc2UgY29va2llIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICB2YXIgb2JqID0ge307XG4gIHZhciBwYWlycyA9IHN0ci5zcGxpdCgvICo7ICovKTtcbiAgdmFyIHBhaXI7XG4gIGlmICgnJyA9PSBwYWlyc1swXSkgcmV0dXJuIG9iajtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYWlycy5sZW5ndGg7ICsraSkge1xuICAgIHBhaXIgPSBwYWlyc1tpXS5zcGxpdCgnPScpO1xuICAgIG9ialtkZWNvZGUocGFpclswXSldID0gZGVjb2RlKHBhaXJbMV0pO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRW5jb2RlLlxuICovXG5cbmZ1bmN0aW9uIGVuY29kZSh2YWx1ZSl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBkZWJ1ZygnZXJyb3IgYGVuY29kZSglbylgIC0gJW8nLCB2YWx1ZSwgZSlcbiAgfVxufVxuXG4vKipcbiAqIERlY29kZS5cbiAqL1xuXG5mdW5jdGlvbiBkZWNvZGUodmFsdWUpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGRlYnVnKCdlcnJvciBgZGVjb2RlKCVvKWAgLSAlbycsIHZhbHVlLCBlKVxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG4vLyBYWFg6IEhhY2t5IGZpeCBmb3IgRHVvIG5vdCBzdXBwb3J0aW5nIHNjb3BlZCBtb2R1bGVzXG52YXIgZWFjaDsgdHJ5IHsgZWFjaCA9IHJlcXVpcmUoJ0BuZGhvdWxlL2VhY2gnKTsgfSBjYXRjaChlKSB7IGVhY2ggPSByZXF1aXJlKCdlYWNoJyk7IH1cblxuLyoqXG4gKiBSZWR1Y2VzIGFsbCB0aGUgdmFsdWVzIGluIGEgY29sbGVjdGlvbiBkb3duIGludG8gYSBzaW5nbGUgdmFsdWUuIERvZXMgc28gYnkgaXRlcmF0aW5nIHRocm91Z2ggdGhlXG4gKiBjb2xsZWN0aW9uIGZyb20gbGVmdCB0byByaWdodCwgcmVwZWF0ZWRseSBjYWxsaW5nIGFuIGBpdGVyYXRvcmAgZnVuY3Rpb24gYW5kIHBhc3NpbmcgdG8gaXQgZm91clxuICogYXJndW1lbnRzOiBgKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pYC5cbiAqXG4gKiBSZXR1cm5zIHRoZSBmaW5hbCByZXR1cm4gdmFsdWUgb2YgdGhlIGBpdGVyYXRvcmAgZnVuY3Rpb24uXG4gKlxuICogQG5hbWUgZm9sZGxcbiAqIEBhcGkgcHVibGljXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRvciBUaGUgZnVuY3Rpb24gdG8gaW52b2tlIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0geyp9IGFjY3VtdWxhdG9yIFRoZSBpbml0aWFsIGFjY3VtdWxhdG9yIHZhbHVlLCBwYXNzZWQgdG8gdGhlIGZpcnN0IGludm9jYXRpb24gb2YgYGl0ZXJhdG9yYC5cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEByZXR1cm4geyp9IFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZpbmFsIGNhbGwgdG8gYGl0ZXJhdG9yYC5cbiAqIEBleGFtcGxlXG4gKiBmb2xkbChmdW5jdGlvbih0b3RhbCwgbikge1xuICogICByZXR1cm4gdG90YWwgKyBuO1xuICogfSwgMCwgWzEsIDIsIDNdKTtcbiAqIC8vPT4gNlxuICpcbiAqIHZhciBwaG9uZWJvb2sgPSB7IGJvYjogJzU1NS0xMTEtMjM0NScsIHRpbTogJzY1NS0yMjItNjc4OScsIHNoZWlsYTogJzY1NS0zMzMtMTI5OCcgfTtcbiAqXG4gKiBmb2xkbChmdW5jdGlvbihyZXN1bHRzLCBwaG9uZU51bWJlcikge1xuICogIGlmIChwaG9uZU51bWJlclswXSA9PT0gJzYnKSB7XG4gKiAgICByZXR1cm4gcmVzdWx0cy5jb25jYXQocGhvbmVOdW1iZXIpO1xuICogIH1cbiAqICByZXR1cm4gcmVzdWx0cztcbiAqIH0sIFtdLCBwaG9uZWJvb2spO1xuICogLy8gPT4gWyc2NTUtMjIyLTY3ODknLCAnNjU1LTMzMy0xMjk4J11cbiAqL1xuXG52YXIgZm9sZGwgPSBmdW5jdGlvbiBmb2xkbChpdGVyYXRvciwgYWNjdW11bGF0b3IsIGNvbGxlY3Rpb24pIHtcbiAgaWYgKHR5cGVvZiBpdGVyYXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgZnVuY3Rpb24gYnV0IHJlY2VpdmVkIGEgJyArIHR5cGVvZiBpdGVyYXRvcik7XG4gIH1cblxuICBlYWNoKGZ1bmN0aW9uKHZhbCwgaSwgY29sbGVjdGlvbikge1xuICAgIGFjY3VtdWxhdG9yID0gaXRlcmF0b3IoYWNjdW11bGF0b3IsIHZhbCwgaSwgY29sbGVjdGlvbik7XG4gIH0sIGNvbGxlY3Rpb24pO1xuXG4gIHJldHVybiBhY2N1bXVsYXRvcjtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZvbGRsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuLy8gWFhYOiBIYWNreSBmaXggZm9yIER1byBub3Qgc3VwcG9ydGluZyBzY29wZWQgbW9kdWxlc1xudmFyIGtleXM7IHRyeSB7IGtleXMgPSByZXF1aXJlKCdAbmRob3VsZS9rZXlzJyk7IH0gY2F0Y2goZSkgeyBrZXlzID0gcmVxdWlyZSgna2V5cycpOyB9XG5cbi8qKlxuICogT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyByZWZlcmVuY2UuXG4gKi9cblxudmFyIG9ialRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBUZXN0cyBpZiBhIHZhbHVlIGlzIGEgbnVtYmVyLlxuICpcbiAqIEBuYW1lIGlzTnVtYmVyXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbGAgaXMgYSBudW1iZXIsIG90aGVyd2lzZSBgZmFsc2VgLlxuICovXG5cbi8vIFRPRE86IE1vdmUgdG8gbGlicmFyeVxudmFyIGlzTnVtYmVyID0gZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgcmV0dXJuIHR5cGUgPT09ICdudW1iZXInIHx8ICh0eXBlID09PSAnb2JqZWN0JyAmJiBvYmpUb1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IE51bWJlcl0nKTtcbn07XG5cbi8qKlxuICogVGVzdHMgaWYgYSB2YWx1ZSBpcyBhbiBhcnJheS5cbiAqXG4gKiBAbmFtZSBpc0FycmF5XG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlIGlzIGFuIGFycmF5LCBvdGhlcndpc2UgYGZhbHNlYC5cbiAqL1xuXG4vLyBUT0RPOiBNb3ZlIHRvIGxpYnJhcnlcbnZhciBpc0FycmF5ID0gdHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIG9ialRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbi8qKlxuICogVGVzdHMgaWYgYSB2YWx1ZSBpcyBhcnJheS1saWtlLiBBcnJheS1saWtlIG1lYW5zIHRoZSB2YWx1ZSBpcyBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgbnVtZXJpY1xuICogYC5sZW5ndGhgIHByb3BlcnR5LlxuICpcbiAqIEBuYW1lIGlzQXJyYXlMaWtlXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5cbi8vIFRPRE86IE1vdmUgdG8gbGlicmFyeVxudmFyIGlzQXJyYXlMaWtlID0gZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsKSB7XG4gIHJldHVybiB2YWwgIT0gbnVsbCAmJiAoaXNBcnJheSh2YWwpIHx8ICh2YWwgIT09ICdmdW5jdGlvbicgJiYgaXNOdW1iZXIodmFsLmxlbmd0aCkpKTtcbn07XG5cbi8qKlxuICogSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgYGVhY2hgLiBXb3JrcyBvbiBhcnJheXMgYW5kIGFycmF5LWxpa2UgZGF0YSBzdHJ1Y3R1cmVzLlxuICpcbiAqIEBuYW1lIGFycmF5RWFjaFxuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9uKHZhbHVlLCBrZXksIGNvbGxlY3Rpb24pfSBpdGVyYXRvciBUaGUgZnVuY3Rpb24gdG8gaW52b2tlIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkoLWxpa2UpIHN0cnVjdHVyZSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cblxudmFyIGFycmF5RWFjaCA9IGZ1bmN0aW9uIGFycmF5RWFjaChpdGVyYXRvciwgYXJyYXkpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkgKz0gMSkge1xuICAgIC8vIEJyZWFrIGl0ZXJhdGlvbiBlYXJseSBpZiBgaXRlcmF0b3JgIHJldHVybnMgYGZhbHNlYFxuICAgIGlmIChpdGVyYXRvcihhcnJheVtpXSwgaSwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGBlYWNoYC4gV29ya3Mgb24gb2JqZWN0cy5cbiAqXG4gKiBAbmFtZSBiYXNlRWFjaFxuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9uKHZhbHVlLCBrZXksIGNvbGxlY3Rpb24pfSBpdGVyYXRvciBUaGUgZnVuY3Rpb24gdG8gaW52b2tlIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICovXG5cbnZhciBiYXNlRWFjaCA9IGZ1bmN0aW9uIGJhc2VFYWNoKGl0ZXJhdG9yLCBvYmplY3QpIHtcbiAgdmFyIGtzID0ga2V5cyhvYmplY3QpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwga3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAvLyBCcmVhayBpdGVyYXRpb24gZWFybHkgaWYgYGl0ZXJhdG9yYCByZXR1cm5zIGBmYWxzZWBcbiAgICBpZiAoaXRlcmF0b3Iob2JqZWN0W2tzW2ldXSwga3NbaV0sIG9iamVjdCkgPT09IGZhbHNlKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIGlucHV0IGNvbGxlY3Rpb24sIGludm9raW5nIGFuIGBpdGVyYXRvcmAgZnVuY3Rpb24gZm9yIGVhY2ggZWxlbWVudCBpbiB0aGVcbiAqIGNvbGxlY3Rpb24gYW5kIHBhc3NpbmcgdG8gaXQgdGhyZWUgYXJndW1lbnRzOiBgKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbilgLiBUaGUgYGl0ZXJhdG9yYFxuICogZnVuY3Rpb24gY2FuIGVuZCBpdGVyYXRpb24gZWFybHkgYnkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQG5hbWUgZWFjaFxuICogQGFwaSBwdWJsaWNcbiAqIEBwYXJhbSB7RnVuY3Rpb24odmFsdWUsIGtleSwgY29sbGVjdGlvbil9IGl0ZXJhdG9yIFRoZSBmdW5jdGlvbiB0byBpbnZva2UgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9IEJlY2F1c2UgYGVhY2hgIGlzIHJ1biBvbmx5IGZvciBzaWRlIGVmZmVjdHMsIGFsd2F5cyByZXR1cm5zIGB1bmRlZmluZWRgLlxuICogQGV4YW1wbGVcbiAqIHZhciBsb2cgPSBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO1xuICpcbiAqIGVhY2gobG9nLCBbJ2EnLCAnYicsICdjJ10pO1xuICogLy8tPiAnYScsIDAsIFsnYScsICdiJywgJ2MnXVxuICogLy8tPiAnYicsIDEsIFsnYScsICdiJywgJ2MnXVxuICogLy8tPiAnYycsIDIsIFsnYScsICdiJywgJ2MnXVxuICogLy89PiB1bmRlZmluZWRcbiAqXG4gKiBlYWNoKGxvZywgJ3RpbScpO1xuICogLy8tPiAndCcsIDIsICd0aW0nXG4gKiAvLy0+ICdpJywgMSwgJ3RpbSdcbiAqIC8vLT4gJ20nLCAwLCAndGltJ1xuICogLy89PiB1bmRlZmluZWRcbiAqXG4gKiAvLyBOb3RlOiBJdGVyYXRpb24gb3JkZXIgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50c1xuICogZWFjaChsb2csIHsgbmFtZTogJ3RpbScsIG9jY3VwYXRpb246ICdlbmNoYW50ZXInIH0pO1xuICogLy8tPiAndGltJywgJ25hbWUnLCB7IG5hbWU6ICd0aW0nLCBvY2N1cGF0aW9uOiAnZW5jaGFudGVyJyB9XG4gKiAvLy0+ICdlbmNoYW50ZXInLCAnb2NjdXBhdGlvbicsIHsgbmFtZTogJ3RpbScsIG9jY3VwYXRpb246ICdlbmNoYW50ZXInIH1cbiAqIC8vPT4gdW5kZWZpbmVkXG4gKi9cblxudmFyIGVhY2ggPSBmdW5jdGlvbiBlYWNoKGl0ZXJhdG9yLCBjb2xsZWN0aW9uKSB7XG4gIHJldHVybiAoaXNBcnJheUxpa2UoY29sbGVjdGlvbikgPyBhcnJheUVhY2ggOiBiYXNlRWFjaCkuY2FsbCh0aGlzLCBpdGVyYXRvciwgY29sbGVjdGlvbik7XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBlYWNoO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIGNoYXJBdCByZWZlcmVuY2UuXG4gKi9cblxudmFyIHN0ckNoYXJBdCA9IFN0cmluZy5wcm90b3R5cGUuY2hhckF0O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGNoYXJhY3RlciBhdCBhIGdpdmVuIGluZGV4LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICogQHJldHVybiB7c3RyaW5nfHVuZGVmaW5lZH1cbiAqL1xuXG4vLyBUT0RPOiBNb3ZlIHRvIGEgbGlicmFyeVxudmFyIGNoYXJBdCA9IGZ1bmN0aW9uKHN0ciwgaW5kZXgpIHtcbiAgcmV0dXJuIHN0ckNoYXJBdC5jYWxsKHN0ciwgaW5kZXgpO1xufTtcblxuLyoqXG4gKiBoYXNPd25Qcm9wZXJ0eSByZWZlcmVuY2UuXG4gKi9cblxudmFyIGhvcCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyByZWZlcmVuY2UuXG4gKi9cblxudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBoYXNPd25Qcm9wZXJ0eSwgd3JhcHBlZCBhcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBuYW1lIGhhc1xuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0geyp9IGNvbnRleHRcbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gcHJvcFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuXG4vLyBUT0RPOiBNb3ZlIHRvIGEgbGlicmFyeVxudmFyIGhhcyA9IGZ1bmN0aW9uIGhhcyhjb250ZXh0LCBwcm9wKSB7XG4gIHJldHVybiBob3AuY2FsbChjb250ZXh0LCBwcm9wKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIGEgdmFsdWUgaXMgYSBzdHJpbmcsIG90aGVyd2lzZSBmYWxzZS5cbiAqXG4gKiBAbmFtZSBpc1N0cmluZ1xuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuXG4vLyBUT0RPOiBNb3ZlIHRvIGEgbGlicmFyeVxudmFyIGlzU3RyaW5nID0gZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0b1N0ci5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgYSB2YWx1ZSBpcyBhcnJheS1saWtlLCBvdGhlcndpc2UgZmFsc2UuIEFycmF5LWxpa2UgbWVhbnMgYVxuICogdmFsdWUgaXMgbm90IG51bGwsIHVuZGVmaW5lZCwgb3IgYSBmdW5jdGlvbiwgYW5kIGhhcyBhIG51bWVyaWMgYGxlbmd0aGBcbiAqIHByb3BlcnR5LlxuICpcbiAqIEBuYW1lIGlzQXJyYXlMaWtlXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5cbi8vIFRPRE86IE1vdmUgdG8gYSBsaWJyYXJ5XG52YXIgaXNBcnJheUxpa2UgPSBmdW5jdGlvbiBpc0FycmF5TGlrZSh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPSBudWxsICYmICh0eXBlb2YgdmFsICE9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWwubGVuZ3RoID09PSAnbnVtYmVyJyk7XG59O1xuXG5cbi8qKlxuICogaW5kZXhLZXlzXG4gKlxuICogQG5hbWUgaW5kZXhLZXlzXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7fSB0YXJnZXRcbiAqIEBwYXJhbSB7fSBwcmVkXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG52YXIgaW5kZXhLZXlzID0gZnVuY3Rpb24gaW5kZXhLZXlzKHRhcmdldCwgcHJlZCkge1xuICBwcmVkID0gcHJlZCB8fCBoYXM7XG4gIHZhciByZXN1bHRzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRhcmdldC5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgIGlmIChwcmVkKHRhcmdldCwgaSkpIHtcbiAgICAgIHJlc3VsdHMucHVzaChTdHJpbmcoaSkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHRzO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCB0aGUgb3duZWRcbiAqXG4gKiBAbmFtZSBvYmplY3RLZXlzXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdGFyZ2V0XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkIFByZWRpY2F0ZSBmdW5jdGlvbiB1c2VkIHRvIGluY2x1ZGUvZXhjbHVkZSB2YWx1ZXMgZnJvbVxuICogdGhlIHJlc3VsdGluZyBhcnJheS5cbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbnZhciBvYmplY3RLZXlzID0gZnVuY3Rpb24gb2JqZWN0S2V5cyh0YXJnZXQsIHByZWQpIHtcbiAgcHJlZCA9IHByZWQgfHwgaGFzO1xuICB2YXIgcmVzdWx0cyA9IFtdO1xuXG5cbiAgZm9yICh2YXIga2V5IGluIHRhcmdldCkge1xuICAgIGlmIChwcmVkKHRhcmdldCwga2V5KSkge1xuICAgICAgcmVzdWx0cy5wdXNoKFN0cmluZyhrZXkpKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cztcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBjb21wb3NlZCBvZiBhbGwga2V5cyBvbiB0aGUgaW5wdXQgb2JqZWN0LiBJZ25vcmVzIGFueSBub24tZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuICogTW9yZSBwZXJtaXNzaXZlIHRoYW4gdGhlIG5hdGl2ZSBgT2JqZWN0LmtleXNgIGZ1bmN0aW9uIChub24tb2JqZWN0cyB3aWxsIG5vdCB0aHJvdyBlcnJvcnMpLlxuICpcbiAqIEBuYW1lIGtleXNcbiAqIEBhcGkgcHVibGljXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSB2YWx1ZSB0byByZXRyaWV2ZSBrZXlzIGZyb20uXG4gKiBAcmV0dXJuIHtBcnJheX0gQW4gYXJyYXkgY29udGFpbmluZyBhbGwgdGhlIGlucHV0IGBzb3VyY2VgJ3Mga2V5cy5cbiAqIEBleGFtcGxlXG4gKiBrZXlzKHsgbGlrZXM6ICdhdm9jYWRvJywgaGF0ZXM6ICdwaW5lYXBwbGUnIH0pO1xuICogLy89PiBbJ2xpa2VzJywgJ3BpbmVhcHBsZSddO1xuICpcbiAqIC8vIElnbm9yZXMgbm9uLWVudW1lcmFibGUgcHJvcGVydGllc1xuICogdmFyIGhhc0hpZGRlbktleSA9IHsgbmFtZTogJ1RpbScgfTtcbiAqIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShoYXNIaWRkZW5LZXksICdoaWRkZW4nLCB7XG4gKiAgIHZhbHVlOiAnaSBhbSBub3QgZW51bWVyYWJsZSEnLFxuICogICBlbnVtZXJhYmxlOiBmYWxzZVxuICogfSlcbiAqIGtleXMoaGFzSGlkZGVuS2V5KTtcbiAqIC8vPT4gWyduYW1lJ107XG4gKlxuICogLy8gV29ya3Mgb24gYXJyYXlzXG4gKiBrZXlzKFsnYScsICdiJywgJ2MnXSk7XG4gKiAvLz0+IFsnMCcsICcxJywgJzInXVxuICpcbiAqIC8vIFNraXBzIHVucG9wdWxhdGVkIGluZGljZXMgaW4gc3BhcnNlIGFycmF5c1xuICogdmFyIGFyciA9IFsxXTtcbiAqIGFycls0XSA9IDQ7XG4gKiBrZXlzKGFycik7XG4gKiAvLz0+IFsnMCcsICc0J11cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGtleXMoc291cmNlKSB7XG4gIGlmIChzb3VyY2UgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8vIElFNi04IGNvbXBhdGliaWxpdHkgKHN0cmluZylcbiAgaWYgKGlzU3RyaW5nKHNvdXJjZSkpIHtcbiAgICByZXR1cm4gaW5kZXhLZXlzKHNvdXJjZSwgY2hhckF0KTtcbiAgfVxuXG4gIC8vIElFNi04IGNvbXBhdGliaWxpdHkgKGFyZ3VtZW50cylcbiAgaWYgKGlzQXJyYXlMaWtlKHNvdXJjZSkpIHtcbiAgICByZXR1cm4gaW5kZXhLZXlzKHNvdXJjZSwgaGFzKTtcbiAgfVxuXG4gIHJldHVybiBvYmplY3RLZXlzKHNvdXJjZSk7XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVudGl0eSA9IHJlcXVpcmUoJy4vZW50aXR5Jyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJ2JpbmQnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2FuYWx5dGljczpncm91cCcpO1xudmFyIGluaGVyaXQgPSByZXF1aXJlKCdpbmhlcml0Jyk7XG5cbi8qKlxuICogR3JvdXAgZGVmYXVsdHNcbiAqL1xuXG5Hcm91cC5kZWZhdWx0cyA9IHtcbiAgcGVyc2lzdDogdHJ1ZSxcbiAgY29va2llOiB7XG4gICAga2V5OiAnYWpzX2dyb3VwX2lkJ1xuICB9LFxuICBsb2NhbFN0b3JhZ2U6IHtcbiAgICBrZXk6ICdhanNfZ3JvdXBfcHJvcGVydGllcydcbiAgfVxufTtcblxuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEdyb3VwYCB3aXRoIGBvcHRpb25zYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIEdyb3VwKG9wdGlvbnMpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IEdyb3VwLmRlZmF1bHRzO1xuICB0aGlzLmRlYnVnID0gZGVidWc7XG4gIEVudGl0eS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xufVxuXG5cbi8qKlxuICogSW5oZXJpdCBgRW50aXR5YFxuICovXG5cbmluaGVyaXQoR3JvdXAsIEVudGl0eSk7XG5cblxuLyoqXG4gKiBFeHBvc2UgdGhlIGdyb3VwIHNpbmdsZXRvbi5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJpbmQuYWxsKG5ldyBHcm91cCgpKTtcblxuXG4vKipcbiAqIEV4cG9zZSB0aGUgYEdyb3VwYCBjb25zdHJ1Y3Rvci5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cy5Hcm91cCA9IEdyb3VwO1xuIiwiXG52YXIgY2xvbmUgPSByZXF1aXJlKCdjbG9uZScpO1xudmFyIGNvb2tpZSA9IHJlcXVpcmUoJy4vY29va2llJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdhbmFseXRpY3M6ZW50aXR5Jyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCdkZWZhdWx0cycpO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2V4dGVuZCcpO1xudmFyIG1lbW9yeSA9IHJlcXVpcmUoJy4vbWVtb3J5Jyk7XG52YXIgc3RvcmUgPSByZXF1aXJlKCcuL3N0b3JlJyk7XG52YXIgaXNvZGF0ZVRyYXZlcnNlID0gcmVxdWlyZSgnaXNvZGF0ZS10cmF2ZXJzZScpO1xuXG5cbi8qKlxuICogRXhwb3NlIGBFbnRpdHlgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbnRpdHk7XG5cblxuLyoqXG4gKiBJbml0aWFsaXplIG5ldyBgRW50aXR5YCB3aXRoIGBvcHRpb25zYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIEVudGl0eShvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyhvcHRpb25zKTtcbiAgdGhpcy5pbml0aWFsaXplKCk7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBwaWNrcyB0aGUgc3RvcmFnZS5cbiAqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGNvb2tpZXMgY2FuIGJlIHNldFxuICogb3RoZXJ3aXNlIGZhbGxzYmFjayB0byBsb2NhbFN0b3JhZ2UuXG4gKi9cblxuRW50aXR5LnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gIGNvb2tpZS5zZXQoJ2Fqczpjb29raWVzJywgdHJ1ZSk7XG5cbiAgLy8gY29va2llcyBhcmUgZW5hYmxlZC5cbiAgaWYgKGNvb2tpZS5nZXQoJ2Fqczpjb29raWVzJykpIHtcbiAgICBjb29raWUucmVtb3ZlKCdhanM6Y29va2llcycpO1xuICAgIHRoaXMuX3N0b3JhZ2UgPSBjb29raWU7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gbG9jYWxTdG9yYWdlIGlzIGVuYWJsZWQuXG4gIGlmIChzdG9yZS5lbmFibGVkKSB7XG4gICAgdGhpcy5fc3RvcmFnZSA9IHN0b3JlO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGZhbGxiYWNrIHRvIG1lbW9yeSBzdG9yYWdlLlxuICBkZWJ1Zygnd2FybmluZyB1c2luZyBtZW1vcnkgc3RvcmUgYm90aCBjb29raWVzIGFuZCBsb2NhbFN0b3JhZ2UgYXJlIGRpc2FibGVkJyk7XG4gIHRoaXMuX3N0b3JhZ2UgPSBtZW1vcnk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgc3RvcmFnZS5cbiAqL1xuXG5FbnRpdHkucHJvdG90eXBlLnN0b3JhZ2UgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX3N0b3JhZ2U7XG59O1xuXG5cbi8qKlxuICogR2V0IG9yIHNldCBzdG9yYWdlIGBvcHRpb25zYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge09iamVjdH0gY29va2llXG4gKiAgIEBwcm9wZXJ0eSB7T2JqZWN0fSBsb2NhbFN0b3JhZ2VcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBwZXJzaXN0IChkZWZhdWx0OiBgdHJ1ZWApXG4gKi9cblxuRW50aXR5LnByb3RvdHlwZS5vcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXMuX29wdGlvbnM7XG4gIHRoaXMuX29wdGlvbnMgPSBkZWZhdWx0cyhvcHRpb25zIHx8IHt9LCB0aGlzLmRlZmF1bHRzIHx8IHt9KTtcbn07XG5cblxuLyoqXG4gKiBHZXQgb3Igc2V0IHRoZSBlbnRpdHkncyBgaWRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZFxuICovXG5cbkVudGl0eS5wcm90b3R5cGUuaWQgPSBmdW5jdGlvbihpZCkge1xuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiB0aGlzLl9nZXRJZCgpO1xuICAgIGNhc2UgMTogcmV0dXJuIHRoaXMuX3NldElkKGlkKTtcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gTm8gZGVmYXVsdCBjYXNlXG4gIH1cbn07XG5cblxuLyoqXG4gKiBHZXQgdGhlIGVudGl0eSdzIGlkLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5FbnRpdHkucHJvdG90eXBlLl9nZXRJZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmV0ID0gdGhpcy5fb3B0aW9ucy5wZXJzaXN0XG4gICAgPyB0aGlzLnN0b3JhZ2UoKS5nZXQodGhpcy5fb3B0aW9ucy5jb29raWUua2V5KVxuICAgIDogdGhpcy5faWQ7XG4gIHJldHVybiByZXQgPT09IHVuZGVmaW5lZCA/IG51bGwgOiByZXQ7XG59O1xuXG5cbi8qKlxuICogU2V0IHRoZSBlbnRpdHkncyBgaWRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZFxuICovXG5cbkVudGl0eS5wcm90b3R5cGUuX3NldElkID0gZnVuY3Rpb24oaWQpIHtcbiAgaWYgKHRoaXMuX29wdGlvbnMucGVyc2lzdCkge1xuICAgIHRoaXMuc3RvcmFnZSgpLnNldCh0aGlzLl9vcHRpb25zLmNvb2tpZS5rZXksIGlkKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9pZCA9IGlkO1xuICB9XG59O1xuXG5cbi8qKlxuICogR2V0IG9yIHNldCB0aGUgZW50aXR5J3MgYHRyYWl0c2AuXG4gKlxuICogQkFDS1dBUkRTIENPTVBBVElCSUxJVFk6IGFsaWFzZWQgdG8gYHByb3BlcnRpZXNgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHRyYWl0c1xuICovXG5cbkVudGl0eS5wcm90b3R5cGUucHJvcGVydGllcyA9IEVudGl0eS5wcm90b3R5cGUudHJhaXRzID0gZnVuY3Rpb24odHJhaXRzKSB7XG4gIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIHRoaXMuX2dldFRyYWl0cygpO1xuICAgIGNhc2UgMTogcmV0dXJuIHRoaXMuX3NldFRyYWl0cyh0cmFpdHMpO1xuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBObyBkZWZhdWx0IGNhc2VcbiAgfVxufTtcblxuXG4vKipcbiAqIEdldCB0aGUgZW50aXR5J3MgdHJhaXRzLiBBbHdheXMgY29udmVydCBJU08gZGF0ZSBzdHJpbmdzIGludG8gcmVhbCBkYXRlcyxcbiAqIHNpbmNlIHRoZXkgYXJlbid0IHBhcnNlZCBiYWNrIGZyb20gbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuRW50aXR5LnByb3RvdHlwZS5fZ2V0VHJhaXRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXQgPSB0aGlzLl9vcHRpb25zLnBlcnNpc3QgPyBzdG9yZS5nZXQodGhpcy5fb3B0aW9ucy5sb2NhbFN0b3JhZ2Uua2V5KSA6IHRoaXMuX3RyYWl0cztcbiAgcmV0dXJuIHJldCA/IGlzb2RhdGVUcmF2ZXJzZShjbG9uZShyZXQpKSA6IHt9O1xufTtcblxuXG4vKipcbiAqIFNldCB0aGUgZW50aXR5J3MgYHRyYWl0c2AuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHRyYWl0c1xuICovXG5cbkVudGl0eS5wcm90b3R5cGUuX3NldFRyYWl0cyA9IGZ1bmN0aW9uKHRyYWl0cykge1xuICB0cmFpdHMgPSB0cmFpdHMgfHwge307XG4gIGlmICh0aGlzLl9vcHRpb25zLnBlcnNpc3QpIHtcbiAgICBzdG9yZS5zZXQodGhpcy5fb3B0aW9ucy5sb2NhbFN0b3JhZ2Uua2V5LCB0cmFpdHMpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX3RyYWl0cyA9IHRyYWl0cztcbiAgfVxufTtcblxuXG4vKipcbiAqIElkZW50aWZ5IHRoZSBlbnRpdHkgd2l0aCBhbiBgaWRgIGFuZCBgdHJhaXRzYC4gSWYgd2UgaXQncyB0aGUgc2FtZSBlbnRpdHksXG4gKiBleHRlbmQgdGhlIGV4aXN0aW5nIGB0cmFpdHNgIGluc3RlYWQgb2Ygb3ZlcndyaXRpbmcuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlkXG4gKiBAcGFyYW0ge09iamVjdH0gdHJhaXRzXG4gKi9cblxuRW50aXR5LnByb3RvdHlwZS5pZGVudGlmeSA9IGZ1bmN0aW9uKGlkLCB0cmFpdHMpIHtcbiAgdHJhaXRzID0gdHJhaXRzIHx8IHt9O1xuICB2YXIgY3VycmVudCA9IHRoaXMuaWQoKTtcbiAgaWYgKGN1cnJlbnQgPT09IG51bGwgfHwgY3VycmVudCA9PT0gaWQpIHRyYWl0cyA9IGV4dGVuZCh0aGlzLnRyYWl0cygpLCB0cmFpdHMpO1xuICBpZiAoaWQpIHRoaXMuaWQoaWQpO1xuICB0aGlzLmRlYnVnKCdpZGVudGlmeSAlbywgJW8nLCBpZCwgdHJhaXRzKTtcbiAgdGhpcy50cmFpdHModHJhaXRzKTtcbiAgdGhpcy5zYXZlKCk7XG59O1xuXG5cbi8qKlxuICogU2F2ZSB0aGUgZW50aXR5IHRvIGxvY2FsIHN0b3JhZ2UgYW5kIHRoZSBjb29raWUuXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5FbnRpdHkucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLl9vcHRpb25zLnBlcnNpc3QpIHJldHVybiBmYWxzZTtcbiAgY29va2llLnNldCh0aGlzLl9vcHRpb25zLmNvb2tpZS5rZXksIHRoaXMuaWQoKSk7XG4gIHN0b3JlLnNldCh0aGlzLl9vcHRpb25zLmxvY2FsU3RvcmFnZS5rZXksIHRoaXMudHJhaXRzKCkpO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cblxuLyoqXG4gKiBMb2cgdGhlIGVudGl0eSBvdXQsIHJlc2V0aW5nIGBpZGAgYW5kIGB0cmFpdHNgIHRvIGRlZmF1bHRzLlxuICovXG5cbkVudGl0eS5wcm90b3R5cGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaWQobnVsbCk7XG4gIHRoaXMudHJhaXRzKHt9KTtcbiAgY29va2llLnJlbW92ZSh0aGlzLl9vcHRpb25zLmNvb2tpZS5rZXkpO1xuICBzdG9yZS5yZW1vdmUodGhpcy5fb3B0aW9ucy5sb2NhbFN0b3JhZ2Uua2V5KTtcbn07XG5cblxuLyoqXG4gKiBSZXNldCBhbGwgZW50aXR5IHN0YXRlLCBsb2dnaW5nIG91dCBhbmQgcmV0dXJuaW5nIG9wdGlvbnMgdG8gZGVmYXVsdHMuXG4gKi9cblxuRW50aXR5LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmxvZ291dCgpO1xuICB0aGlzLm9wdGlvbnMoe30pO1xufTtcblxuXG4vKipcbiAqIExvYWQgc2F2ZWQgZW50aXR5IGBpZGAgb3IgYHRyYWl0c2AgZnJvbSBzdG9yYWdlLlxuICovXG5cbkVudGl0eS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlkKGNvb2tpZS5nZXQodGhpcy5fb3B0aW9ucy5jb29raWUua2V5KSk7XG4gIHRoaXMudHJhaXRzKHN0b3JlLmdldCh0aGlzLl9vcHRpb25zLmxvY2FsU3RvcmFnZS5rZXkpKTtcbn07XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQgKG9iamVjdCkge1xuICAgIC8vIFRha2VzIGFuIHVubGltaXRlZCBudW1iZXIgb2YgZXh0ZW5kZXJzLlxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIC8vIEZvciBlYWNoIGV4dGVuZGVyLCBjb3B5IHRoZWlyIHByb3BlcnRpZXMgb24gb3VyIG9iamVjdC5cbiAgICBmb3IgKHZhciBpID0gMCwgc291cmNlOyBzb3VyY2UgPSBhcmdzW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKCFzb3VyY2UpIGNvbnRpbnVlO1xuICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIG9iamVjdFtwcm9wZXJ0eV0gPSBzb3VyY2VbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdDtcbn07IiwiLyogZXNsaW50IGNvbnNpc3RlbnQtcmV0dXJuOjEgKi9cblxuLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBiaW5kID0gcmVxdWlyZSgnYmluZCcpO1xudmFyIGNsb25lID0gcmVxdWlyZSgnY2xvbmUnKTtcblxuLyoqXG4gKiBIT1AuXG4gKi9cblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogRXhwb3NlIGBNZW1vcnlgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBiaW5kLmFsbChuZXcgTWVtb3J5KCkpO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYE1lbW9yeWAgc3RvcmVcbiAqL1xuXG5mdW5jdGlvbiBNZW1vcnkoKXtcbiAgdGhpcy5zdG9yZSA9IHt9O1xufVxuXG4vKipcbiAqIFNldCBhIGBrZXlgIGFuZCBgdmFsdWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbk1lbW9yeS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gIHRoaXMuc3RvcmVba2V5XSA9IGNsb25lKHZhbHVlKTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEdldCBhIGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqL1xuXG5NZW1vcnkucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGtleSl7XG4gIGlmICghaGFzLmNhbGwodGhpcy5zdG9yZSwga2V5KSkgcmV0dXJuO1xuICByZXR1cm4gY2xvbmUodGhpcy5zdG9yZVtrZXldKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGEgYGtleWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5NZW1vcnkucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSl7XG4gIGRlbGV0ZSB0aGlzLnN0b3JlW2tleV07XG4gIHJldHVybiB0cnVlO1xufTtcbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBiaW5kID0gcmVxdWlyZSgnYmluZCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnZGVmYXVsdHMnKTtcbnZhciBzdG9yZSA9IHJlcXVpcmUoJ3N0b3JlLmpzJyk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgU3RvcmVgIHdpdGggYG9wdGlvbnNgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuZnVuY3Rpb24gU3RvcmUob3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMob3B0aW9ucyk7XG59XG5cbi8qKlxuICogU2V0IHRoZSBgb3B0aW9uc2AgZm9yIHRoZSBzdG9yZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAZmllbGQge0Jvb2xlYW59IGVuYWJsZWQgKHRydWUpXG4gKi9cblxuU3RvcmUucHJvdG90eXBlLm9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdGhpcy5fb3B0aW9ucztcblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgZGVmYXVsdHMob3B0aW9ucywgeyBlbmFibGVkOiB0cnVlIH0pO1xuXG4gIHRoaXMuZW5hYmxlZCA9IG9wdGlvbnMuZW5hYmxlZCAmJiBzdG9yZS5lbmFibGVkO1xuICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbn07XG5cblxuLyoqXG4gKiBTZXQgYSBga2V5YCBhbmQgYHZhbHVlYCBpbiBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICovXG5cblN0b3JlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gIGlmICghdGhpcy5lbmFibGVkKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBzdG9yZS5zZXQoa2V5LCB2YWx1ZSk7XG59O1xuXG5cbi8qKlxuICogR2V0IGEgdmFsdWUgZnJvbSBsb2NhbCBzdG9yYWdlIGJ5IGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5TdG9yZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7XG4gIGlmICghdGhpcy5lbmFibGVkKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIHN0b3JlLmdldChrZXkpO1xufTtcblxuXG4vKipcbiAqIFJlbW92ZSBhIHZhbHVlIGZyb20gbG9jYWwgc3RvcmFnZSBieSBga2V5YC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKi9cblxuU3RvcmUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkge1xuICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gc3RvcmUucmVtb3ZlKGtleSk7XG59O1xuXG5cbi8qKlxuICogRXhwb3NlIHRoZSBzdG9yZSBzaW5nbGV0b24uXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBiaW5kLmFsbChuZXcgU3RvcmUoKSk7XG5cblxuLyoqXG4gKiBFeHBvc2UgdGhlIGBTdG9yZWAgY29uc3RydWN0b3IuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMuU3RvcmUgPSBTdG9yZTtcbiIsInZhciBqc29uICAgICAgICAgICAgID0gcmVxdWlyZSgnanNvbicpXG4gICwgc3RvcmUgICAgICAgICAgICA9IHt9XG4gICwgd2luICAgICAgICAgICAgICA9IHdpbmRvd1xuXHQsXHRkb2MgICAgICAgICAgICAgID0gd2luLmRvY3VtZW50XG5cdCxcdGxvY2FsU3RvcmFnZU5hbWUgPSAnbG9jYWxTdG9yYWdlJ1xuXHQsXHRuYW1lc3BhY2UgICAgICAgID0gJ19fc3RvcmVqc19fJ1xuXHQsXHRzdG9yYWdlO1xuXG5zdG9yZS5kaXNhYmxlZCA9IGZhbHNlXG5zdG9yZS5zZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7fVxuc3RvcmUuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7fVxuc3RvcmUucmVtb3ZlID0gZnVuY3Rpb24oa2V5KSB7fVxuc3RvcmUuY2xlYXIgPSBmdW5jdGlvbigpIHt9XG5zdG9yZS50cmFuc2FjdCA9IGZ1bmN0aW9uKGtleSwgZGVmYXVsdFZhbCwgdHJhbnNhY3Rpb25Gbikge1xuXHR2YXIgdmFsID0gc3RvcmUuZ2V0KGtleSlcblx0aWYgKHRyYW5zYWN0aW9uRm4gPT0gbnVsbCkge1xuXHRcdHRyYW5zYWN0aW9uRm4gPSBkZWZhdWx0VmFsXG5cdFx0ZGVmYXVsdFZhbCA9IG51bGxcblx0fVxuXHRpZiAodHlwZW9mIHZhbCA9PSAndW5kZWZpbmVkJykgeyB2YWwgPSBkZWZhdWx0VmFsIHx8IHt9IH1cblx0dHJhbnNhY3Rpb25Gbih2YWwpXG5cdHN0b3JlLnNldChrZXksIHZhbClcbn1cbnN0b3JlLmdldEFsbCA9IGZ1bmN0aW9uKCkge31cblxuc3RvcmUuc2VyaWFsaXplID0gZnVuY3Rpb24odmFsdWUpIHtcblx0cmV0dXJuIGpzb24uc3RyaW5naWZ5KHZhbHVlKVxufVxuc3RvcmUuZGVzZXJpYWxpemUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7IHJldHVybiB1bmRlZmluZWQgfVxuXHR0cnkgeyByZXR1cm4ganNvbi5wYXJzZSh2YWx1ZSkgfVxuXHRjYXRjaChlKSB7IHJldHVybiB2YWx1ZSB8fCB1bmRlZmluZWQgfVxufVxuXG4vLyBGdW5jdGlvbnMgdG8gZW5jYXBzdWxhdGUgcXVlc3Rpb25hYmxlIEZpcmVGb3ggMy42LjEzIGJlaGF2aW9yXG4vLyB3aGVuIGFib3V0LmNvbmZpZzo6ZG9tLnN0b3JhZ2UuZW5hYmxlZCA9PT0gZmFsc2Vcbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3VlcyNpc3N1ZS8xM1xuZnVuY3Rpb24gaXNMb2NhbFN0b3JhZ2VOYW1lU3VwcG9ydGVkKCkge1xuXHR0cnkgeyByZXR1cm4gKGxvY2FsU3RvcmFnZU5hbWUgaW4gd2luICYmIHdpbltsb2NhbFN0b3JhZ2VOYW1lXSkgfVxuXHRjYXRjaChlcnIpIHsgcmV0dXJuIGZhbHNlIH1cbn1cblxuaWYgKGlzTG9jYWxTdG9yYWdlTmFtZVN1cHBvcnRlZCgpKSB7XG5cdHN0b3JhZ2UgPSB3aW5bbG9jYWxTdG9yYWdlTmFtZV1cblx0c3RvcmUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWwpIHtcblx0XHRpZiAodmFsID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHN0b3JlLnJlbW92ZShrZXkpIH1cblx0XHRzdG9yYWdlLnNldEl0ZW0oa2V5LCBzdG9yZS5zZXJpYWxpemUodmFsKSlcblx0XHRyZXR1cm4gdmFsXG5cdH1cblx0c3RvcmUuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7IHJldHVybiBzdG9yZS5kZXNlcmlhbGl6ZShzdG9yYWdlLmdldEl0ZW0oa2V5KSkgfVxuXHRzdG9yZS5yZW1vdmUgPSBmdW5jdGlvbihrZXkpIHsgc3RvcmFnZS5yZW1vdmVJdGVtKGtleSkgfVxuXHRzdG9yZS5jbGVhciA9IGZ1bmN0aW9uKCkgeyBzdG9yYWdlLmNsZWFyKCkgfVxuXHRzdG9yZS5nZXRBbGwgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgcmV0ID0ge31cblx0XHRmb3IgKHZhciBpPTA7IGk8c3RvcmFnZS5sZW5ndGg7ICsraSkge1xuXHRcdFx0dmFyIGtleSA9IHN0b3JhZ2Uua2V5KGkpXG5cdFx0XHRyZXRba2V5XSA9IHN0b3JlLmdldChrZXkpXG5cdFx0fVxuXHRcdHJldHVybiByZXRcblx0fVxufSBlbHNlIGlmIChkb2MuZG9jdW1lbnRFbGVtZW50LmFkZEJlaGF2aW9yKSB7XG5cdHZhciBzdG9yYWdlT3duZXIsXG5cdFx0c3RvcmFnZUNvbnRhaW5lclxuXHQvLyBTaW5jZSAjdXNlckRhdGEgc3RvcmFnZSBhcHBsaWVzIG9ubHkgdG8gc3BlY2lmaWMgcGF0aHMsIHdlIG5lZWQgdG9cblx0Ly8gc29tZWhvdyBsaW5rIG91ciBkYXRhIHRvIGEgc3BlY2lmaWMgcGF0aC4gIFdlIGNob29zZSAvZmF2aWNvbi5pY29cblx0Ly8gYXMgYSBwcmV0dHkgc2FmZSBvcHRpb24sIHNpbmNlIGFsbCBicm93c2VycyBhbHJlYWR5IG1ha2UgYSByZXF1ZXN0IHRvXG5cdC8vIHRoaXMgVVJMIGFueXdheSBhbmQgYmVpbmcgYSA0MDQgd2lsbCBub3QgaHVydCB1cyBoZXJlLiAgV2Ugd3JhcCBhblxuXHQvLyBpZnJhbWUgcG9pbnRpbmcgdG8gdGhlIGZhdmljb24gaW4gYW4gQWN0aXZlWE9iamVjdChodG1sZmlsZSkgb2JqZWN0XG5cdC8vIChzZWU6IGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9hYTc1MjU3NCh2PVZTLjg1KS5hc3B4KVxuXHQvLyBzaW5jZSB0aGUgaWZyYW1lIGFjY2VzcyBydWxlcyBhcHBlYXIgdG8gYWxsb3cgZGlyZWN0IGFjY2VzcyBhbmRcblx0Ly8gbWFuaXB1bGF0aW9uIG9mIHRoZSBkb2N1bWVudCBlbGVtZW50LCBldmVuIGZvciBhIDQwNCBwYWdlLiAgVGhpc1xuXHQvLyBkb2N1bWVudCBjYW4gYmUgdXNlZCBpbnN0ZWFkIG9mIHRoZSBjdXJyZW50IGRvY3VtZW50ICh3aGljaCB3b3VsZFxuXHQvLyBoYXZlIGJlZW4gbGltaXRlZCB0byB0aGUgY3VycmVudCBwYXRoKSB0byBwZXJmb3JtICN1c2VyRGF0YSBzdG9yYWdlLlxuXHR0cnkge1xuXHRcdHN0b3JhZ2VDb250YWluZXIgPSBuZXcgQWN0aXZlWE9iamVjdCgnaHRtbGZpbGUnKVxuXHRcdHN0b3JhZ2VDb250YWluZXIub3BlbigpXG5cdFx0c3RvcmFnZUNvbnRhaW5lci53cml0ZSgnPHMnICsgJ2NyaXB0PmRvY3VtZW50Lnc9d2luZG93PC9zJyArICdjcmlwdD48aWZyYW1lIHNyYz1cIi9mYXZpY29uLmljb1wiPjwvaWZyYW1lPicpXG5cdFx0c3RvcmFnZUNvbnRhaW5lci5jbG9zZSgpXG5cdFx0c3RvcmFnZU93bmVyID0gc3RvcmFnZUNvbnRhaW5lci53LmZyYW1lc1swXS5kb2N1bWVudFxuXHRcdHN0b3JhZ2UgPSBzdG9yYWdlT3duZXIuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0fSBjYXRjaChlKSB7XG5cdFx0Ly8gc29tZWhvdyBBY3RpdmVYT2JqZWN0IGluc3RhbnRpYXRpb24gZmFpbGVkIChwZXJoYXBzIHNvbWUgc3BlY2lhbFxuXHRcdC8vIHNlY3VyaXR5IHNldHRpbmdzIG9yIG90aGVyd3NlKSwgZmFsbCBiYWNrIHRvIHBlci1wYXRoIHN0b3JhZ2Vcblx0XHRzdG9yYWdlID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0c3RvcmFnZU93bmVyID0gZG9jLmJvZHlcblx0fVxuXHRmdW5jdGlvbiB3aXRoSUVTdG9yYWdlKHN0b3JlRnVuY3Rpb24pIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMClcblx0XHRcdGFyZ3MudW5zaGlmdChzdG9yYWdlKVxuXHRcdFx0Ly8gU2VlIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9tczUzMTA4MSh2PVZTLjg1KS5hc3B4XG5cdFx0XHQvLyBhbmQgaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTMxNDI0KHY9VlMuODUpLmFzcHhcblx0XHRcdHN0b3JhZ2VPd25lci5hcHBlbmRDaGlsZChzdG9yYWdlKVxuXHRcdFx0c3RvcmFnZS5hZGRCZWhhdmlvcignI2RlZmF1bHQjdXNlckRhdGEnKVxuXHRcdFx0c3RvcmFnZS5sb2FkKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0XHR2YXIgcmVzdWx0ID0gc3RvcmVGdW5jdGlvbi5hcHBseShzdG9yZSwgYXJncylcblx0XHRcdHN0b3JhZ2VPd25lci5yZW1vdmVDaGlsZChzdG9yYWdlKVxuXHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdC8vIEluIElFNywga2V5cyBtYXkgbm90IGNvbnRhaW4gc3BlY2lhbCBjaGFycy4gU2VlIGFsbCBvZiBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3Vlcy80MFxuXHR2YXIgZm9yYmlkZGVuQ2hhcnNSZWdleCA9IG5ldyBSZWdFeHAoXCJbIVxcXCIjJCUmJygpKissL1xcXFxcXFxcOjs8PT4/QFtcXFxcXV5ge3x9fl1cIiwgXCJnXCIpXG5cdGZ1bmN0aW9uIGllS2V5Rml4KGtleSkge1xuXHRcdHJldHVybiBrZXkucmVwbGFjZShmb3JiaWRkZW5DaGFyc1JlZ2V4LCAnX19fJylcblx0fVxuXHRzdG9yZS5zZXQgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGtleSwgdmFsKSB7XG5cdFx0a2V5ID0gaWVLZXlGaXgoa2V5KVxuXHRcdGlmICh2YWwgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gc3RvcmUucmVtb3ZlKGtleSkgfVxuXHRcdHN0b3JhZ2Uuc2V0QXR0cmlidXRlKGtleSwgc3RvcmUuc2VyaWFsaXplKHZhbCkpXG5cdFx0c3RvcmFnZS5zYXZlKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0cmV0dXJuIHZhbFxuXHR9KVxuXHRzdG9yZS5nZXQgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGtleSkge1xuXHRcdGtleSA9IGllS2V5Rml4KGtleSlcblx0XHRyZXR1cm4gc3RvcmUuZGVzZXJpYWxpemUoc3RvcmFnZS5nZXRBdHRyaWJ1dGUoa2V5KSlcblx0fSlcblx0c3RvcmUucmVtb3ZlID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlLCBrZXkpIHtcblx0XHRrZXkgPSBpZUtleUZpeChrZXkpXG5cdFx0c3RvcmFnZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KVxuXHRcdHN0b3JhZ2Uuc2F2ZShsb2NhbFN0b3JhZ2VOYW1lKVxuXHR9KVxuXHRzdG9yZS5jbGVhciA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSkge1xuXHRcdHZhciBhdHRyaWJ1dGVzID0gc3RvcmFnZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlc1xuXHRcdHN0b3JhZ2UubG9hZChsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdGZvciAodmFyIGk9MCwgYXR0cjsgYXR0cj1hdHRyaWJ1dGVzW2ldOyBpKyspIHtcblx0XHRcdHN0b3JhZ2UucmVtb3ZlQXR0cmlidXRlKGF0dHIubmFtZSlcblx0XHR9XG5cdFx0c3RvcmFnZS5zYXZlKGxvY2FsU3RvcmFnZU5hbWUpXG5cdH0pXG5cdHN0b3JlLmdldEFsbCA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSkge1xuXHRcdHZhciBhdHRyaWJ1dGVzID0gc3RvcmFnZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlc1xuXHRcdHZhciByZXQgPSB7fVxuXHRcdGZvciAodmFyIGk9MCwgYXR0cjsgYXR0cj1hdHRyaWJ1dGVzW2ldOyArK2kpIHtcblx0XHRcdHZhciBrZXkgPSBpZUtleUZpeChhdHRyLm5hbWUpXG5cdFx0XHRyZXRbYXR0ci5uYW1lXSA9IHN0b3JlLmRlc2VyaWFsaXplKHN0b3JhZ2UuZ2V0QXR0cmlidXRlKGtleSkpXG5cdFx0fVxuXHRcdHJldHVybiByZXRcblx0fSlcbn1cblxudHJ5IHtcblx0c3RvcmUuc2V0KG5hbWVzcGFjZSwgbmFtZXNwYWNlKVxuXHRpZiAoc3RvcmUuZ2V0KG5hbWVzcGFjZSkgIT0gbmFtZXNwYWNlKSB7IHN0b3JlLmRpc2FibGVkID0gdHJ1ZSB9XG5cdHN0b3JlLnJlbW92ZShuYW1lc3BhY2UpXG59IGNhdGNoKGUpIHtcblx0c3RvcmUuZGlzYWJsZWQgPSB0cnVlXG59XG5zdG9yZS5lbmFibGVkID0gIXN0b3JlLmRpc2FibGVkXG5cbm1vZHVsZS5leHBvcnRzID0gc3RvcmU7IiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGEsIGIpe1xuICB2YXIgZm4gPSBmdW5jdGlvbigpe307XG4gIGZuLnByb3RvdHlwZSA9IGIucHJvdG90eXBlO1xuICBhLnByb3RvdHlwZSA9IG5ldyBmbjtcbiAgYS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhO1xufTsiLCJcbnZhciBpc0VtcHR5ID0gcmVxdWlyZSgnaXMtZW1wdHknKTtcblxudHJ5IHtcbiAgdmFyIHR5cGVPZiA9IHJlcXVpcmUoJ3R5cGUnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgdmFyIHR5cGVPZiA9IHJlcXVpcmUoJ2NvbXBvbmVudC10eXBlJyk7XG59XG5cblxuLyoqXG4gKiBUeXBlcy5cbiAqL1xuXG52YXIgdHlwZXMgPSBbXG4gICdhcmd1bWVudHMnLFxuICAnYXJyYXknLFxuICAnYm9vbGVhbicsXG4gICdkYXRlJyxcbiAgJ2VsZW1lbnQnLFxuICAnZnVuY3Rpb24nLFxuICAnbnVsbCcsXG4gICdudW1iZXInLFxuICAnb2JqZWN0JyxcbiAgJ3JlZ2V4cCcsXG4gICdzdHJpbmcnLFxuICAndW5kZWZpbmVkJ1xuXTtcblxuXG4vKipcbiAqIEV4cG9zZSB0eXBlIGNoZWNrZXJzLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZvciAodmFyIGkgPSAwLCB0eXBlOyB0eXBlID0gdHlwZXNbaV07IGkrKykgZXhwb3J0c1t0eXBlXSA9IGdlbmVyYXRlKHR5cGUpO1xuXG5cbi8qKlxuICogQWRkIGFsaWFzIGZvciBgZnVuY3Rpb25gIGZvciBvbGQgYnJvd3NlcnMuXG4gKi9cblxuZXhwb3J0cy5mbiA9IGV4cG9ydHNbJ2Z1bmN0aW9uJ107XG5cblxuLyoqXG4gKiBFeHBvc2UgYGVtcHR5YCBjaGVjay5cbiAqL1xuXG5leHBvcnRzLmVtcHR5ID0gaXNFbXB0eTtcblxuXG4vKipcbiAqIEV4cG9zZSBgbmFuYCBjaGVjay5cbiAqL1xuXG5leHBvcnRzLm5hbiA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgcmV0dXJuIGV4cG9ydHMubnVtYmVyKHZhbCkgJiYgdmFsICE9IHZhbDtcbn07XG5cblxuLyoqXG4gKiBHZW5lcmF0ZSBhIHR5cGUgY2hlY2tlci5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gZ2VuZXJhdGUgKHR5cGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlID09PSB0eXBlT2YodmFsdWUpO1xuICB9O1xufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNNZXRhIChlKSB7XG4gICAgaWYgKGUubWV0YUtleSB8fCBlLmFsdEtleSB8fCBlLmN0cmxLZXkgfHwgZS5zaGlmdEtleSkgcmV0dXJuIHRydWU7XG5cbiAgICAvLyBMb2dpYyB0aGF0IGhhbmRsZXMgY2hlY2tzIGZvciB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbiwgYmFzZWRcbiAgICAvLyBvbiBbalF1ZXJ5XShodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iL21hc3Rlci9zcmMvZXZlbnQuanMjTDQ2NikuXG4gICAgdmFyIHdoaWNoID0gZS53aGljaCwgYnV0dG9uID0gZS5idXR0b247XG4gICAgaWYgKCF3aGljaCAmJiBidXR0b24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuICghYnV0dG9uICYgMSkgJiYgKCFidXR0b24gJiAyKSAmJiAoYnV0dG9uICYgNCk7XG4gICAgfSBlbHNlIGlmICh3aGljaCA9PT0gMikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufTsiLCJcbi8qKlxuICogSE9QIHJlZi5cbiAqL1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBSZXR1cm4gb3duIGtleXMgaW4gYG9iamAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMua2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uKG9iail7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzLmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGtleXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBvd24gdmFsdWVzIGluIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnZhbHVlcyA9IGZ1bmN0aW9uKG9iail7XG4gIHZhciB2YWxzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzLmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICB2YWxzLnB1c2gob2JqW2tleV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFscztcbn07XG5cbi8qKlxuICogTWVyZ2UgYGJgIGludG8gYGFgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fSBhXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbihhLCBiKXtcbiAgZm9yICh2YXIga2V5IGluIGIpIHtcbiAgICBpZiAoaGFzLmNhbGwoYiwga2V5KSkge1xuICAgICAgYVtrZXldID0gYltrZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGxlbmd0aCBvZiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMubGVuZ3RoID0gZnVuY3Rpb24ob2JqKXtcbiAgcmV0dXJuIGV4cG9ydHMua2V5cyhvYmopLmxlbmd0aDtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgZW1wdHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKXtcbiAgcmV0dXJuIDAgPT0gZXhwb3J0cy5sZW5ndGgob2JqKTtcbn07IiwiXG4vKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnYW5hbHl0aWNzLmpzOm5vcm1hbGl6ZScpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnZGVmYXVsdHMnKTtcbnZhciBlYWNoID0gcmVxdWlyZSgnZWFjaCcpO1xudmFyIGluY2x1ZGVzID0gcmVxdWlyZSgnaW5jbHVkZXMnKTtcbnZhciBpcyA9IHJlcXVpcmUoJ2lzJyk7XG52YXIgbWFwID0gcmVxdWlyZSgnY29tcG9uZW50L21hcCcpO1xuXG4vKipcbiAqIEhPUC5cbiAqL1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBFeHBvc2UgYG5vcm1hbGl6ZWBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5vcm1hbGl6ZTtcblxuLyoqXG4gKiBUb3BsZXZlbCBwcm9wZXJ0aWVzLlxuICovXG5cbnZhciB0b3BsZXZlbCA9IFtcbiAgJ2ludGVncmF0aW9ucycsXG4gICdhbm9ueW1vdXNJZCcsXG4gICd0aW1lc3RhbXAnLFxuICAnY29udGV4dCdcbl07XG5cbi8qKlxuICogTm9ybWFsaXplIGBtc2dgIGJhc2VkIG9uIGludGVncmF0aW9ucyBgbGlzdGAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG1zZ1xuICogQHBhcmFtIHtBcnJheX0gbGlzdFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gbm9ybWFsaXplKG1zZywgbGlzdCl7XG4gIHZhciBsb3dlciA9IG1hcChsaXN0LCBmdW5jdGlvbihzKXsgcmV0dXJuIHMudG9Mb3dlckNhc2UoKTsgfSk7XG4gIHZhciBvcHRzID0gbXNnLm9wdGlvbnMgfHwge307XG4gIHZhciBpbnRlZ3JhdGlvbnMgPSBvcHRzLmludGVncmF0aW9ucyB8fCB7fTtcbiAgdmFyIHByb3ZpZGVycyA9IG9wdHMucHJvdmlkZXJzIHx8IHt9O1xuICB2YXIgY29udGV4dCA9IG9wdHMuY29udGV4dCB8fCB7fTtcbiAgdmFyIHJldCA9IHt9O1xuICBkZWJ1ZygnPC0nLCBtc2cpO1xuXG4gIC8vIGludGVncmF0aW9ucy5cbiAgZWFjaChvcHRzLCBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICBpZiAoIWludGVncmF0aW9uKGtleSkpIHJldHVybjtcbiAgICBpZiAoIWhhcy5jYWxsKGludGVncmF0aW9ucywga2V5KSkgaW50ZWdyYXRpb25zW2tleV0gPSB2YWx1ZTtcbiAgICBkZWxldGUgb3B0c1trZXldO1xuICB9KTtcblxuICAvLyBwcm92aWRlcnMuXG4gIGRlbGV0ZSBvcHRzLnByb3ZpZGVycztcbiAgZWFjaChwcm92aWRlcnMsIGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgIGlmICghaW50ZWdyYXRpb24oa2V5KSkgcmV0dXJuO1xuICAgIGlmIChpcy5vYmplY3QoaW50ZWdyYXRpb25zW2tleV0pKSByZXR1cm47XG4gICAgaWYgKGhhcy5jYWxsKGludGVncmF0aW9ucywga2V5KSAmJiB0eXBlb2YgcHJvdmlkZXJzW2tleV0gPT09ICdib29sZWFuJykgcmV0dXJuO1xuICAgIGludGVncmF0aW9uc1trZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIG1vdmUgYWxsIHRvcGxldmVsIG9wdGlvbnMgdG8gbXNnXG4gIC8vIGFuZCB0aGUgcmVzdCB0byBjb250ZXh0LlxuICBlYWNoKG9wdHMsIGZ1bmN0aW9uKGtleSl7XG4gICAgaWYgKGluY2x1ZGVzKGtleSwgdG9wbGV2ZWwpKSB7XG4gICAgICByZXRba2V5XSA9IG9wdHNba2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGV4dFtrZXldID0gb3B0c1trZXldO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gY2xlYW51cFxuICBkZWxldGUgbXNnLm9wdGlvbnM7XG4gIHJldC5pbnRlZ3JhdGlvbnMgPSBpbnRlZ3JhdGlvbnM7XG4gIHJldC5jb250ZXh0ID0gY29udGV4dDtcbiAgcmV0ID0gZGVmYXVsdHMocmV0LCBtc2cpO1xuICBkZWJ1ZygnLT4nLCByZXQpO1xuICByZXR1cm4gcmV0O1xuXG4gIGZ1bmN0aW9uIGludGVncmF0aW9uKG5hbWUpe1xuICAgIHJldHVybiAhIShpbmNsdWRlcyhuYW1lLCBsaXN0KSB8fCBuYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhbGwnIHx8IGluY2x1ZGVzKG5hbWUudG9Mb3dlckNhc2UoKSwgbG93ZXIpKTtcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuLy8gWFhYOiBIYWNreSBmaXggZm9yIGR1byBub3Qgc3VwcG9ydGluZyBzY29wZWQgbnBtIHBhY2thZ2VzXG52YXIgZWFjaDsgdHJ5IHsgZWFjaCA9IHJlcXVpcmUoJ0BuZGhvdWxlL2VhY2gnKTsgfSBjYXRjaChlKSB7IGVhY2ggPSByZXF1aXJlKCdlYWNoJyk7IH1cblxuLyoqXG4gKiBTdHJpbmcjaW5kZXhPZiByZWZlcmVuY2UuXG4gKi9cblxudmFyIHN0ckluZGV4T2YgPSBTdHJpbmcucHJvdG90eXBlLmluZGV4T2Y7XG5cbi8qKlxuICogT2JqZWN0LmlzL3NhbWVWYWx1ZVplcm8gcG9seWZpbGwuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlMVxuICogQHBhcmFtIHsqfSB2YWx1ZTJcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cblxuLy8gVE9ETzogTW92ZSB0byBsaWJyYXJ5XG52YXIgc2FtZVZhbHVlWmVybyA9IGZ1bmN0aW9uIHNhbWVWYWx1ZVplcm8odmFsdWUxLCB2YWx1ZTIpIHtcbiAgLy8gTm9ybWFsIHZhbHVlcyBhbmQgY2hlY2sgZm9yIDAgLyAtMFxuICBpZiAodmFsdWUxID09PSB2YWx1ZTIpIHtcbiAgICByZXR1cm4gdmFsdWUxICE9PSAwIHx8IDEgLyB2YWx1ZTEgPT09IDEgLyB2YWx1ZTI7XG4gIH1cbiAgLy8gTmFOXG4gIHJldHVybiB2YWx1ZTEgIT09IHZhbHVlMSAmJiB2YWx1ZTIgIT09IHZhbHVlMjtcbn07XG5cbi8qKlxuICogU2VhcmNoZXMgYSBnaXZlbiBgY29sbGVjdGlvbmAgZm9yIGEgdmFsdWUsIHJldHVybmluZyB0cnVlIGlmIHRoZSBjb2xsZWN0aW9uXG4gKiBjb250YWlucyB0aGUgdmFsdWUgYW5kIGZhbHNlIG90aGVyd2lzZS4gQ2FuIHNlYXJjaCBzdHJpbmdzLCBhcnJheXMsIGFuZFxuICogb2JqZWN0cy5cbiAqXG4gKiBAbmFtZSBpbmNsdWRlc1xuICogQGFwaSBwdWJsaWNcbiAqIEBwYXJhbSB7Kn0gc2VhcmNoRWxlbWVudCBUaGUgZWxlbWVudCB0byBzZWFyY2ggZm9yLlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIHNlYXJjaC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAZXhhbXBsZVxuICogaW5jbHVkZXMoMiwgWzEsIDIsIDNdKTtcbiAqIC8vPT4gdHJ1ZVxuICpcbiAqIGluY2x1ZGVzKDQsIFsxLCAyLCAzXSk7XG4gKiAvLz0+IGZhbHNlXG4gKlxuICogaW5jbHVkZXMoMiwgeyBhOiAxLCBiOiAyLCBjOiAzIH0pO1xuICogLy89PiB0cnVlXG4gKlxuICogaW5jbHVkZXMoJ2EnLCB7IGE6IDEsIGI6IDIsIGM6IDMgfSk7XG4gKiAvLz0+IGZhbHNlXG4gKlxuICogaW5jbHVkZXMoJ2FiYycsICd4eXphYmMgb3BxJyk7XG4gKiAvLz0+IHRydWVcbiAqXG4gKiBpbmNsdWRlcygnbm9wZScsICd4eXphYmMgb3BxJyk7XG4gKiAvLz0+IGZhbHNlXG4gKi9cbnZhciBpbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzKHNlYXJjaEVsZW1lbnQsIGNvbGxlY3Rpb24pIHtcbiAgdmFyIGZvdW5kID0gZmFsc2U7XG5cbiAgLy8gRGVsZWdhdGUgdG8gU3RyaW5nLnByb3RvdHlwZS5pbmRleE9mIHdoZW4gYGNvbGxlY3Rpb25gIGlzIGEgc3RyaW5nXG4gIGlmICh0eXBlb2YgY29sbGVjdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3RySW5kZXhPZi5jYWxsKGNvbGxlY3Rpb24sIHNlYXJjaEVsZW1lbnQpICE9PSAtMTtcbiAgfVxuXG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCBlbnVtZXJhYmxlL293biBhcnJheSBlbGVtZW50cyBhbmQgb2JqZWN0IHByb3BlcnRpZXMuXG4gIGVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoc2FtZVZhbHVlWmVybyh2YWx1ZSwgc2VhcmNoRWxlbWVudCkpIHtcbiAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgIC8vIEV4aXQgaXRlcmF0aW9uIGVhcmx5IHdoZW4gZm91bmRcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0sIGNvbGxlY3Rpb24pO1xuXG4gIHJldHVybiBmb3VuZDtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGluY2x1ZGVzO1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHRvRnVuY3Rpb24gPSByZXF1aXJlKCd0by1mdW5jdGlvbicpO1xuXG4vKipcbiAqIE1hcCB0aGUgZ2l2ZW4gYGFycmAgd2l0aCBjYWxsYmFjayBgZm4odmFsLCBpKWAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbil7XG4gIHZhciByZXQgPSBbXTtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICByZXQucHVzaChmbihhcnJbaV0sIGkpKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufTsiLCJcbi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBleHByO1xudHJ5IHtcbiAgZXhwciA9IHJlcXVpcmUoJ3Byb3BzJyk7XG59IGNhdGNoKGUpIHtcbiAgZXhwciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1wcm9wcycpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgdG9GdW5jdGlvbigpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvRnVuY3Rpb247XG5cbi8qKlxuICogQ29udmVydCBgb2JqYCB0byBhIGBGdW5jdGlvbmAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRvRnVuY3Rpb24ob2JqKSB7XG4gIHN3aXRjaCAoe30udG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgY2FzZSAnW29iamVjdCBPYmplY3RdJzpcbiAgICAgIHJldHVybiBvYmplY3RUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOlxuICAgICAgcmV0dXJuIG9iajtcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgcmV0dXJuIHN0cmluZ1RvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHJlZ2V4cFRvRnVuY3Rpb24ob2JqKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGRlZmF1bHRUb0Z1bmN0aW9uKG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHRvIHN0cmljdCBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVmYXVsdFRvRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiB2YWwgPT09IG9iajtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGByZWAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmVnZXhwVG9GdW5jdGlvbihyZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gcmUudGVzdChvYmopO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgcHJvcGVydHkgYHN0cmAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ1RvRnVuY3Rpb24oc3RyKSB7XG4gIC8vIGltbWVkaWF0ZSBzdWNoIGFzIFwiPiAyMFwiXG4gIGlmICgvXiAqXFxXKy8udGVzdChzdHIpKSByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiBfICcgKyBzdHIpO1xuXG4gIC8vIHByb3BlcnRpZXMgc3VjaCBhcyBcIm5hbWUuZmlyc3RcIiBvciBcImFnZSA+IDE4XCIgb3IgXCJhZ2UgPiAxOCAmJiBhZ2UgPCAzNlwiXG4gIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuICcgKyBnZXQoc3RyKSk7XG59XG5cbi8qKlxuICogQ29udmVydCBgb2JqZWN0YCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gb2JqZWN0VG9GdW5jdGlvbihvYmopIHtcbiAgdmFyIG1hdGNoID0ge307XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBtYXRjaFtrZXldID0gdHlwZW9mIG9ialtrZXldID09PSAnc3RyaW5nJ1xuICAgICAgPyBkZWZhdWx0VG9GdW5jdGlvbihvYmpba2V5XSlcbiAgICAgIDogdG9GdW5jdGlvbihvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yICh2YXIga2V5IGluIG1hdGNoKSB7XG4gICAgICBpZiAoIShrZXkgaW4gdmFsKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFtYXRjaFtrZXldKHZhbFtrZXldKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBCdWlsdCB0aGUgZ2V0dGVyIGZ1bmN0aW9uLiBTdXBwb3J0cyBnZXR0ZXIgc3R5bGUgZnVuY3Rpb25zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KHN0cikge1xuICB2YXIgcHJvcHMgPSBleHByKHN0cik7XG4gIGlmICghcHJvcHMubGVuZ3RoKSByZXR1cm4gJ18uJyArIHN0cjtcblxuICB2YXIgdmFsLCBpLCBwcm9wO1xuICBmb3IgKGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICBwcm9wID0gcHJvcHNbaV07XG4gICAgdmFsID0gJ18uJyArIHByb3A7XG4gICAgdmFsID0gXCIoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgXCIgKyB2YWwgKyBcIiA/IFwiICsgdmFsICsgXCIoKSA6IFwiICsgdmFsICsgXCIpXCI7XG5cbiAgICAvLyBtaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXNcbiAgICBzdHIgPSBzdHJpcE5lc3RlZChwcm9wLCBzdHIsIHZhbCk7XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuXG4vKipcbiAqIE1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllcy5cbiAqXG4gKiBTZWU6IGh0dHA6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9taW1pYy1sb29rYmVoaW5kLWphdmFzY3JpcHRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaXBOZXN0ZWQgKHByb3AsIHN0ciwgdmFsKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXC4pPycgKyBwcm9wLCAnZycpLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICByZXR1cm4gJDEgPyAkMCA6IHZhbDtcbiAgfSk7XG59XG4iLCIvKipcbiAqIEdsb2JhbCBOYW1lc1xuICovXG5cbnZhciBnbG9iYWxzID0gL1xcYih0aGlzfEFycmF5fERhdGV8T2JqZWN0fE1hdGh8SlNPTilcXGIvZztcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBtYXAgZnVuY3Rpb24gb3IgcHJlZml4XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIsIGZuKXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChmbiAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gcHJlZml4ZWQoZm4pO1xuICBpZiAoZm4pIHJldHVybiBtYXAoc3RyLCBwLCBmbik7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLnJlcGxhY2UoZ2xvYmFscywgJycpXG4gICAgLm1hdGNoKC9bJGEtekEtWl9dXFx3Ki9nKVxuICAgIHx8IFtdO1xufVxuXG4vKipcbiAqIFJldHVybiBgc3RyYCB3aXRoIGBwcm9wc2AgbWFwcGVkIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1hcChzdHIsIHByb3BzLCBmbikge1xuICB2YXIgcmUgPSAvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC98W2EtekEtWl9dXFx3Ki9nO1xuICByZXR1cm4gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKF8pe1xuICAgIGlmICgnKCcgPT0gX1tfLmxlbmd0aCAtIDFdKSByZXR1cm4gZm4oXyk7XG4gICAgaWYgKCF+cHJvcHMuaW5kZXhPZihfKSkgcmV0dXJuIF87XG4gICAgcmV0dXJuIGZuKF8pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdW5pcXVlIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB1bmlxdWUoYXJyKSB7XG4gIHZhciByZXQgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmICh+cmV0LmluZGV4T2YoYXJyW2ldKSkgY29udGludWU7XG4gICAgcmV0LnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogTWFwIHdpdGggcHJlZml4IGBzdHJgLlxuICovXG5cbmZ1bmN0aW9uIHByZWZpeGVkKHN0cikge1xuICByZXR1cm4gZnVuY3Rpb24oXyl7XG4gICAgcmV0dXJuIHN0ciArIF87XG4gIH07XG59XG4iLCJcbi8qKlxuICogQmluZCBgZWxgIGV2ZW50IGB0eXBlYCB0byBgZm5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgaWYgKGVsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJlIHx8IGZhbHNlKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5hdHRhY2hFdmVudCgnb24nICsgdHlwZSwgZm4pO1xuICB9XG4gIHJldHVybiBmbjtcbn07XG5cbi8qKlxuICogVW5iaW5kIGBlbGAgZXZlbnQgYHR5cGVgJ3MgY2FsbGJhY2sgYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMudW5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgaWYgKGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJlIHx8IGZhbHNlKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5kZXRhY2hFdmVudCgnb24nICsgdHlwZSwgZm4pO1xuICB9XG4gIHJldHVybiBmbjtcbn07XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgY2Fub25pY2FsID0gcmVxdWlyZSgnY2Fub25pY2FsJyk7XG52YXIgaW5jbHVkZXMgPSByZXF1aXJlKCdpbmNsdWRlcycpO1xudmFyIHVybCA9IHJlcXVpcmUoJ3VybCcpO1xuXG4vKipcbiAqIFJldHVybiBhIGRlZmF1bHQgYG9wdGlvbnMuY29udGV4dC5wYWdlYCBvYmplY3QuXG4gKlxuICogaHR0cHM6Ly9zZWdtZW50LmNvbS9kb2NzL3NwZWMvcGFnZS8jcHJvcGVydGllc1xuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBwYWdlRGVmYXVsdHMoKSB7XG4gIHJldHVybiB7XG4gICAgcGF0aDogY2Fub25pY2FsUGF0aCgpLFxuICAgIHJlZmVycmVyOiBkb2N1bWVudC5yZWZlcnJlcixcbiAgICBzZWFyY2g6IGxvY2F0aW9uLnNlYXJjaCxcbiAgICB0aXRsZTogZG9jdW1lbnQudGl0bGUsXG4gICAgdXJsOiBjYW5vbmljYWxVcmwobG9jYXRpb24uc2VhcmNoKVxuICB9O1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgY2Fub25pY2FsIHBhdGggZm9yIHRoZSBwYWdlLlxuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBjYW5vbmljYWxQYXRoKCkge1xuICB2YXIgY2Fub24gPSBjYW5vbmljYWwoKTtcbiAgaWYgKCFjYW5vbikgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgdmFyIHBhcnNlZCA9IHVybC5wYXJzZShjYW5vbik7XG4gIHJldHVybiBwYXJzZWQucGF0aG5hbWU7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjYW5vbmljYWwgVVJMIGZvciB0aGUgcGFnZSBjb25jYXQgdGhlIGdpdmVuIGBzZWFyY2hgXG4gKiBhbmQgc3RyaXAgdGhlIGhhc2guXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNlYXJjaFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIGNhbm9uaWNhbFVybChzZWFyY2gpIHtcbiAgdmFyIGNhbm9uID0gY2Fub25pY2FsKCk7XG4gIGlmIChjYW5vbikgcmV0dXJuIGluY2x1ZGVzKCc/JywgY2Fub24pID8gY2Fub24gOiBjYW5vbiArIHNlYXJjaDtcbiAgdmFyIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICB2YXIgaSA9IHVybC5pbmRleE9mKCcjJyk7XG4gIHJldHVybiBpID09PSAtMSA/IHVybCA6IHVybC5zbGljZSgwLCBpKTtcbn1cblxuLyoqXG4gKiBFeHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGFnZURlZmF1bHRzO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjYW5vbmljYWwgKCkge1xuICB2YXIgdGFncyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaW5rJyk7XG4gIGZvciAodmFyIGkgPSAwLCB0YWc7IHRhZyA9IHRhZ3NbaV07IGkrKykge1xuICAgIGlmICgnY2Fub25pY2FsJyA9PSB0YWcuZ2V0QXR0cmlidXRlKCdyZWwnKSkgcmV0dXJuIHRhZy5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgfVxufTsiLCJcbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uKHVybCl7XG4gIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBhLmhyZWYgPSB1cmw7XG4gIHJldHVybiB7XG4gICAgaHJlZjogYS5ocmVmLFxuICAgIGhvc3Q6IGEuaG9zdCB8fCBsb2NhdGlvbi5ob3N0LFxuICAgIHBvcnQ6ICgnMCcgPT09IGEucG9ydCB8fCAnJyA9PT0gYS5wb3J0KSA/IHBvcnQoYS5wcm90b2NvbCkgOiBhLnBvcnQsXG4gICAgaGFzaDogYS5oYXNoLFxuICAgIGhvc3RuYW1lOiBhLmhvc3RuYW1lIHx8IGxvY2F0aW9uLmhvc3RuYW1lLFxuICAgIHBhdGhuYW1lOiBhLnBhdGhuYW1lLmNoYXJBdCgwKSAhPSAnLycgPyAnLycgKyBhLnBhdGhuYW1lIDogYS5wYXRobmFtZSxcbiAgICBwcm90b2NvbDogIWEucHJvdG9jb2wgfHwgJzonID09IGEucHJvdG9jb2wgPyBsb2NhdGlvbi5wcm90b2NvbCA6IGEucHJvdG9jb2wsXG4gICAgc2VhcmNoOiBhLnNlYXJjaCxcbiAgICBxdWVyeTogYS5zZWFyY2guc2xpY2UoMSlcbiAgfTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYHVybGAgaXMgYWJzb2x1dGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24odXJsKXtcbiAgcmV0dXJuIDAgPT0gdXJsLmluZGV4T2YoJy8vJykgfHwgISF+dXJsLmluZGV4T2YoJzovLycpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBgdXJsYCBpcyByZWxhdGl2ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmlzUmVsYXRpdmUgPSBmdW5jdGlvbih1cmwpe1xuICByZXR1cm4gIWV4cG9ydHMuaXNBYnNvbHV0ZSh1cmwpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBgdXJsYCBpcyBjcm9zcyBkb21haW4uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5pc0Nyb3NzRG9tYWluID0gZnVuY3Rpb24odXJsKXtcbiAgdXJsID0gZXhwb3J0cy5wYXJzZSh1cmwpO1xuICB2YXIgbG9jYXRpb24gPSBleHBvcnRzLnBhcnNlKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgcmV0dXJuIHVybC5ob3N0bmFtZSAhPT0gbG9jYXRpb24uaG9zdG5hbWVcbiAgICB8fCB1cmwucG9ydCAhPT0gbG9jYXRpb24ucG9ydFxuICAgIHx8IHVybC5wcm90b2NvbCAhPT0gbG9jYXRpb24ucHJvdG9jb2w7XG59O1xuXG4vKipcbiAqIFJldHVybiBkZWZhdWx0IHBvcnQgZm9yIGBwcm90b2NvbGAuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBwcm90b2NvbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHBvcnQgKHByb3RvY29sKXtcbiAgc3dpdGNoIChwcm90b2NvbCkge1xuICAgIGNhc2UgJ2h0dHA6JzpcbiAgICAgIHJldHVybiA4MDtcbiAgICBjYXNlICdodHRwczonOlxuICAgICAgcmV0dXJuIDQ0MztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGxvY2F0aW9uLnBvcnQ7XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG9ialRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gVE9ETzogTW92ZSB0byBsaWJcbnZhciBleGlzdHkgPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPSBudWxsO1xufTtcblxuLy8gVE9ETzogTW92ZSB0byBsaWJcbnZhciBpc0FycmF5ID0gZnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBvYmpUb1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG4vLyBUT0RPOiBNb3ZlIHRvIGxpYlxudmFyIGlzU3RyaW5nID0gZnVuY3Rpb24odmFsKSB7XG4gICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgfHwgb2JqVG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBTdHJpbmddJztcbn07XG5cbi8vIFRPRE86IE1vdmUgdG8gbGliXG52YXIgaXNPYmplY3QgPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgY29weSBvZiB0aGUgbmV3IGBvYmplY3RgIGNvbnRhaW5pbmcgb25seSB0aGUgc3BlY2lmaWVkIHByb3BlcnRpZXMuXG4gKlxuICogQG5hbWUgcGlja1xuICogQGFwaSBwdWJsaWNcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBzZWUge0BsaW5rIG9taXR9XG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fHN0cmluZ30gcHJvcHMgVGhlIHByb3BlcnR5IG9yIHByb3BlcnRpZXMgdG8ga2VlcC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcmV0dXJuIHtPYmplY3R9IEEgbmV3IG9iamVjdCBjb250YWluaW5nIG9ubHkgdGhlIHNwZWNpZmllZCBwcm9wZXJ0aWVzIGZyb20gYG9iamVjdGAuXG4gKiBAZXhhbXBsZVxuICogdmFyIHBlcnNvbiA9IHsgbmFtZTogJ1RpbScsIG9jY3VwYXRpb246ICdlbmNoYW50ZXInLCBmZWFyczogJ3JhYmJpdHMnIH07XG4gKlxuICogcGljaygnbmFtZScsIHBlcnNvbik7XG4gKiAvLz0+IHsgbmFtZTogJ1RpbScgfVxuICpcbiAqIHBpY2soWyduYW1lJywgJ2ZlYXJzJ10sIHBlcnNvbik7XG4gKiAvLz0+IHsgbmFtZTogJ1RpbScsIGZlYXJzOiAncmFiYml0cycgfVxuICovXG5cbnZhciBwaWNrID0gZnVuY3Rpb24gcGljayhwcm9wcywgb2JqZWN0KSB7XG4gIGlmICghZXhpc3R5KG9iamVjdCkgfHwgIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICBpZiAoaXNTdHJpbmcocHJvcHMpKSB7XG4gICAgcHJvcHMgPSBbcHJvcHNdO1xuICB9XG5cbiAgaWYgKCFpc0FycmF5KHByb3BzKSkge1xuICAgIHByb3BzID0gW107XG4gIH1cblxuICB2YXIgcmVzdWx0ID0ge307XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmIChpc1N0cmluZyhwcm9wc1tpXSkgJiYgcHJvcHNbaV0gaW4gb2JqZWN0KSB7XG4gICAgICByZXN1bHRbcHJvcHNbaV1dID0gb2JqZWN0W3Byb3BzW2ldXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGljaztcbiIsIlxuLyoqXG4gKiBwcmV2ZW50IGRlZmF1bHQgb24gdGhlIGdpdmVuIGBlYC5cbiAqIFxuICogZXhhbXBsZXM6XG4gKiBcbiAqICAgICAgYW5jaG9yLm9uY2xpY2sgPSBwcmV2ZW50O1xuICogICAgICBhbmNob3Iub25jbGljayA9IGZ1bmN0aW9uKGUpe1xuICogICAgICAgIGlmIChzb21ldGhpbmcpIHJldHVybiBwcmV2ZW50KGUpO1xuICogICAgICB9O1xuICogXG4gKiBAcGFyYW0ge0V2ZW50fSBlXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlKXtcbiAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gIHJldHVybiBlLnByZXZlbnREZWZhdWx0XG4gICAgPyBlLnByZXZlbnREZWZhdWx0KClcbiAgICA6IGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcbn07XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdHJpbSA9IHJlcXVpcmUoJ3RyaW0nKTtcbnZhciB0eXBlID0gcmVxdWlyZSgndHlwZScpO1xuXG52YXIgcGF0dGVybiA9IC8oXFx3KylcXFsoXFxkKylcXF0vXG5cbi8qKlxuICogU2FmZWx5IGVuY29kZSB0aGUgZ2l2ZW4gc3RyaW5nXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciBlbmNvZGUgPSBmdW5jdGlvbihzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59O1xuXG4vKipcbiAqIFNhZmVseSBkZWNvZGUgdGhlIHN0cmluZ1xuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgZGVjb2RlID0gZnVuY3Rpb24oc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIucmVwbGFjZSgvXFwrL2csICcgJykpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBxdWVyeSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHN0cikgcmV0dXJuIHt9O1xuXG4gIHN0ciA9IHRyaW0oc3RyKTtcbiAgaWYgKCcnID09IHN0cikgcmV0dXJuIHt9O1xuICBpZiAoJz8nID09IHN0ci5jaGFyQXQoMCkpIHN0ciA9IHN0ci5zbGljZSgxKTtcblxuICB2YXIgb2JqID0ge307XG4gIHZhciBwYWlycyA9IHN0ci5zcGxpdCgnJicpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBhcnRzID0gcGFpcnNbaV0uc3BsaXQoJz0nKTtcbiAgICB2YXIga2V5ID0gZGVjb2RlKHBhcnRzWzBdKTtcbiAgICB2YXIgbTtcblxuICAgIGlmIChtID0gcGF0dGVybi5leGVjKGtleSkpIHtcbiAgICAgIG9ialttWzFdXSA9IG9ialttWzFdXSB8fCBbXTtcbiAgICAgIG9ialttWzFdXVttWzJdXSA9IGRlY29kZShwYXJ0c1sxXSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBvYmpbcGFydHNbMF1dID0gbnVsbCA9PSBwYXJ0c1sxXVxuICAgICAgPyAnJ1xuICAgICAgOiBkZWNvZGUocGFydHNbMV0pO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbi8qKlxuICogU3RyaW5naWZ5IHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuc3RyaW5naWZ5ID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFvYmopIHJldHVybiAnJztcbiAgdmFyIHBhaXJzID0gW107XG5cbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xuXG4gICAgaWYgKCdhcnJheScgPT0gdHlwZSh2YWx1ZSkpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgcGFpcnMucHVzaChlbmNvZGUoa2V5ICsgJ1snICsgaSArICddJykgKyAnPScgKyBlbmNvZGUodmFsdWVbaV0pKTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHBhaXJzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUob2JqW2tleV0pKTtcbiAgfVxuXG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59O1xuIiwiLyoqXG4gKiB0b1N0cmluZyByZWYuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsKXtcbiAgc3dpdGNoICh0b1N0cmluZy5jYWxsKHZhbCkpIHtcbiAgICBjYXNlICdbb2JqZWN0IERhdGVdJzogcmV0dXJuICdkYXRlJztcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOiByZXR1cm4gJ3JlZ2V4cCc7XG4gICAgY2FzZSAnW29iamVjdCBBcmd1bWVudHNdJzogcmV0dXJuICdhcmd1bWVudHMnO1xuICAgIGNhc2UgJ1tvYmplY3QgQXJyYXldJzogcmV0dXJuICdhcnJheSc7XG4gICAgY2FzZSAnW29iamVjdCBFcnJvcl0nOiByZXR1cm4gJ2Vycm9yJztcbiAgfVxuXG4gIGlmICh2YWwgPT09IG51bGwpIHJldHVybiAnbnVsbCc7XG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuICd1bmRlZmluZWQnO1xuICBpZiAodmFsICE9PSB2YWwpIHJldHVybiAnbmFuJztcbiAgaWYgKHZhbCAmJiB2YWwubm9kZVR5cGUgPT09IDEpIHJldHVybiAnZWxlbWVudCc7XG5cbiAgdmFsID0gdmFsLnZhbHVlT2ZcbiAgICA/IHZhbC52YWx1ZU9mKClcbiAgICA6IE9iamVjdC5wcm90b3R5cGUudmFsdWVPZi5hcHBseSh2YWwpXG5cbiAgcmV0dXJuIHR5cGVvZiB2YWw7XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVudGl0eSA9IHJlcXVpcmUoJy4vZW50aXR5Jyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJ2JpbmQnKTtcbnZhciBjb29raWUgPSByZXF1aXJlKCcuL2Nvb2tpZScpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnYW5hbHl0aWNzOnVzZXInKTtcbnZhciBpbmhlcml0ID0gcmVxdWlyZSgnaW5oZXJpdCcpO1xudmFyIHJhd0Nvb2tpZSA9IHJlcXVpcmUoJ2Nvb2tpZScpO1xudmFyIHV1aWQgPSByZXF1aXJlKCd1dWlkJyk7XG5cblxuLyoqXG4gKiBVc2VyIGRlZmF1bHRzXG4gKi9cblxuVXNlci5kZWZhdWx0cyA9IHtcbiAgcGVyc2lzdDogdHJ1ZSxcbiAgY29va2llOiB7XG4gICAga2V5OiAnYWpzX3VzZXJfaWQnLFxuICAgIG9sZEtleTogJ2Fqc191c2VyJ1xuICB9LFxuICBsb2NhbFN0b3JhZ2U6IHtcbiAgICBrZXk6ICdhanNfdXNlcl90cmFpdHMnXG4gIH1cbn07XG5cblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBVc2VyYCB3aXRoIGBvcHRpb25zYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIFVzZXIob3B0aW9ucykge1xuICB0aGlzLmRlZmF1bHRzID0gVXNlci5kZWZhdWx0cztcbiAgdGhpcy5kZWJ1ZyA9IGRlYnVnO1xuICBFbnRpdHkuY2FsbCh0aGlzLCBvcHRpb25zKTtcbn1cblxuXG4vKipcbiAqIEluaGVyaXQgYEVudGl0eWBcbiAqL1xuXG5pbmhlcml0KFVzZXIsIEVudGl0eSk7XG5cbi8qKlxuICogU2V0L2dldCB0aGUgdXNlciBpZC5cbiAqXG4gKiBXaGVuIHRoZSB1c2VyIGlkIGNoYW5nZXMsIHRoZSBtZXRob2Qgd2lsbCByZXNldCBoaXMgYW5vbnltb3VzSWQgdG8gYSBuZXcgb25lLlxuICpcbiAqIC8vIEZJWE1FOiBXaGF0IGFyZSB0aGUgbWl4ZWQgdHlwZXM/XG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGV4YW1wbGVcbiAqIC8vIGRpZG4ndCBjaGFuZ2UgYmVjYXVzZSB0aGUgdXNlciBkaWRuJ3QgaGF2ZSBwcmV2aW91cyBpZC5cbiAqIGFub255bW91c0lkID0gdXNlci5hbm9ueW1vdXNJZCgpO1xuICogdXNlci5pZCgnZm9vJyk7XG4gKiBhc3NlcnQuZXF1YWwoYW5vbnltb3VzSWQsIHVzZXIuYW5vbnltb3VzSWQoKSk7XG4gKlxuICogLy8gZGlkbid0IGNoYW5nZSBiZWNhdXNlIHRoZSB1c2VyIGlkIGNoYW5nZWQgdG8gbnVsbC5cbiAqIGFub255bW91c0lkID0gdXNlci5hbm9ueW1vdXNJZCgpO1xuICogdXNlci5pZCgnZm9vJyk7XG4gKiB1c2VyLmlkKG51bGwpO1xuICogYXNzZXJ0LmVxdWFsKGFub255bW91c0lkLCB1c2VyLmFub255bW91c0lkKCkpO1xuICpcbiAqIC8vIGNoYW5nZSBiZWNhdXNlIHRoZSB1c2VyIGhhZCBwcmV2aW91cyBpZC5cbiAqIGFub255bW91c0lkID0gdXNlci5hbm9ueW1vdXNJZCgpO1xuICogdXNlci5pZCgnZm9vJyk7XG4gKiB1c2VyLmlkKCdiYXonKTsgLy8gdHJpZ2dlcnMgY2hhbmdlXG4gKiB1c2VyLmlkKCdiYXonKTsgLy8gbm8gY2hhbmdlXG4gKiBhc3NlcnQubm90RXF1YWwoYW5vbnltb3VzSWQsIHVzZXIuYW5vbnltb3VzSWQoKSk7XG4gKi9cblxuVXNlci5wcm90b3R5cGUuaWQgPSBmdW5jdGlvbihpZCl7XG4gIHZhciBwcmV2ID0gdGhpcy5fZ2V0SWQoKTtcbiAgdmFyIHJldCA9IEVudGl0eS5wcm90b3R5cGUuaWQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgaWYgKHByZXYgPT0gbnVsbCkgcmV0dXJuIHJldDtcbiAgLy8gRklYTUU6IFdlJ3JlIHJlbHlpbmcgb24gY29lcmNpb24gaGVyZSAoMSA9PSBcIjFcIiksIGJ1dCBvdXIgQVBJIHRyZWF0cyB0aGVzZVxuICAvLyB0d28gdmFsdWVzIGRpZmZlcmVudGx5LiBGaWd1cmUgb3V0IHdoYXQgd2lsbCBicmVhayBpZiB3ZSByZW1vdmUgdGhpcyBhbmRcbiAgLy8gY2hhbmdlIHRvIHN0cmljdCBlcXVhbGl0eVxuICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cbiAgaWYgKHByZXYgIT0gaWQgJiYgaWQpIHRoaXMuYW5vbnltb3VzSWQobnVsbCk7XG4gIC8qIGVzbGludC1lbmFibGUgZXFlcWVxICovXG4gIHJldHVybiByZXQ7XG59O1xuXG4vKipcbiAqIFNldCAvIGdldCAvIHJlbW92ZSBhbm9ueW1vdXNJZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYW5vbnltb3VzSWRcbiAqIEByZXR1cm4ge1N0cmluZ3xVc2VyfVxuICovXG5cblVzZXIucHJvdG90eXBlLmFub255bW91c0lkID0gZnVuY3Rpb24oYW5vbnltb3VzSWQpe1xuICB2YXIgc3RvcmUgPSB0aGlzLnN0b3JhZ2UoKTtcblxuICAvLyBzZXQgLyByZW1vdmVcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBzdG9yZS5zZXQoJ2Fqc19hbm9ueW1vdXNfaWQnLCBhbm9ueW1vdXNJZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBuZXdcbiAgYW5vbnltb3VzSWQgPSBzdG9yZS5nZXQoJ2Fqc19hbm9ueW1vdXNfaWQnKTtcbiAgaWYgKGFub255bW91c0lkKSB7XG4gICAgcmV0dXJuIGFub255bW91c0lkO1xuICB9XG5cbiAgLy8gb2xkIC0gaXQgaXMgbm90IHN0cmluZ2lmaWVkIHNvIHdlIHVzZSB0aGUgcmF3IGNvb2tpZS5cbiAgYW5vbnltb3VzSWQgPSByYXdDb29raWUoJ19zaW8nKTtcbiAgaWYgKGFub255bW91c0lkKSB7XG4gICAgYW5vbnltb3VzSWQgPSBhbm9ueW1vdXNJZC5zcGxpdCgnLS0tLScpWzBdO1xuICAgIHN0b3JlLnNldCgnYWpzX2Fub255bW91c19pZCcsIGFub255bW91c0lkKTtcbiAgICBzdG9yZS5yZW1vdmUoJ19zaW8nKTtcbiAgICByZXR1cm4gYW5vbnltb3VzSWQ7XG4gIH1cblxuICAvLyBlbXB0eVxuICBhbm9ueW1vdXNJZCA9IHV1aWQoKTtcbiAgc3RvcmUuc2V0KCdhanNfYW5vbnltb3VzX2lkJywgYW5vbnltb3VzSWQpO1xuICByZXR1cm4gc3RvcmUuZ2V0KCdhanNfYW5vbnltb3VzX2lkJyk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbm9ueW1vdXMgaWQgb24gbG9nb3V0IHRvby5cbiAqL1xuXG5Vc2VyLnByb3RvdHlwZS5sb2dvdXQgPSBmdW5jdGlvbigpe1xuICBFbnRpdHkucHJvdG90eXBlLmxvZ291dC5jYWxsKHRoaXMpO1xuICB0aGlzLmFub255bW91c0lkKG51bGwpO1xufTtcblxuLyoqXG4gKiBMb2FkIHNhdmVkIHVzZXIgYGlkYCBvciBgdHJhaXRzYCBmcm9tIHN0b3JhZ2UuXG4gKi9cblxuVXNlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5fbG9hZE9sZENvb2tpZSgpKSByZXR1cm47XG4gIEVudGl0eS5wcm90b3R5cGUubG9hZC5jYWxsKHRoaXMpO1xufTtcblxuXG4vKipcbiAqIEJBQ0tXQVJEUyBDT01QQVRJQklMSVRZOiBMb2FkIHRoZSBvbGQgdXNlciBmcm9tIHRoZSBjb29raWUuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5cblVzZXIucHJvdG90eXBlLl9sb2FkT2xkQ29va2llID0gZnVuY3Rpb24oKSB7XG4gIHZhciB1c2VyID0gY29va2llLmdldCh0aGlzLl9vcHRpb25zLmNvb2tpZS5vbGRLZXkpO1xuICBpZiAoIXVzZXIpIHJldHVybiBmYWxzZTtcblxuICB0aGlzLmlkKHVzZXIuaWQpO1xuICB0aGlzLnRyYWl0cyh1c2VyLnRyYWl0cyk7XG4gIGNvb2tpZS5yZW1vdmUodGhpcy5fb3B0aW9ucy5jb29raWUub2xkS2V5KTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5cbi8qKlxuICogRXhwb3NlIHRoZSB1c2VyIHNpbmdsZXRvbi5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJpbmQuYWxsKG5ldyBVc2VyKCkpO1xuXG5cbi8qKlxuICogRXhwb3NlIHRoZSBgVXNlcmAgY29uc3RydWN0b3IuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMuVXNlciA9IFVzZXI7XG4iLCJcbi8qKlxuICogVGFrZW4gc3RyYWlnaHQgZnJvbSBqZWQncyBnaXN0OiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS85ODI4ODNcbiAqXG4gKiBSZXR1cm5zIGEgcmFuZG9tIHY0IFVVSUQgb2YgdGhlIGZvcm0geHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4LFxuICogd2hlcmUgZWFjaCB4IGlzIHJlcGxhY2VkIHdpdGggYSByYW5kb20gaGV4YWRlY2ltYWwgZGlnaXQgZnJvbSAwIHRvIGYsIGFuZFxuICogeSBpcyByZXBsYWNlZCB3aXRoIGEgcmFuZG9tIGhleGFkZWNpbWFsIGRpZ2l0IGZyb20gOCB0byBiLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdXVpZChhKXtcbiAgcmV0dXJuIGEgICAgICAgICAgIC8vIGlmIHRoZSBwbGFjZWhvbGRlciB3YXMgcGFzc2VkLCByZXR1cm5cbiAgICA/ICggICAgICAgICAgICAgIC8vIGEgcmFuZG9tIG51bWJlciBmcm9tIDAgdG8gMTVcbiAgICAgIGEgXiAgICAgICAgICAgIC8vIHVubGVzcyBiIGlzIDgsXG4gICAgICBNYXRoLnJhbmRvbSgpICAvLyBpbiB3aGljaCBjYXNlXG4gICAgICAqIDE2ICAgICAgICAgICAvLyBhIHJhbmRvbSBudW1iZXIgZnJvbVxuICAgICAgPj4gYS80ICAgICAgICAgLy8gOCB0byAxMVxuICAgICAgKS50b1N0cmluZygxNikgLy8gaW4gaGV4YWRlY2ltYWxcbiAgICA6ICggICAgICAgICAgICAgIC8vIG9yIG90aGVyd2lzZSBhIGNvbmNhdGVuYXRlZCBzdHJpbmc6XG4gICAgICBbMWU3XSArICAgICAgICAvLyAxMDAwMDAwMCArXG4gICAgICAtMWUzICsgICAgICAgICAvLyAtMTAwMCArXG4gICAgICAtNGUzICsgICAgICAgICAvLyAtNDAwMCArXG4gICAgICAtOGUzICsgICAgICAgICAvLyAtODAwMDAwMDAgK1xuICAgICAgLTFlMTEgICAgICAgICAgLy8gLTEwMDAwMDAwMDAwMCxcbiAgICAgICkucmVwbGFjZSggICAgIC8vIHJlcGxhY2luZ1xuICAgICAgICAvWzAxOF0vZywgICAgLy8gemVyb2VzLCBvbmVzLCBhbmQgZWlnaHRzIHdpdGhcbiAgICAgICAgdXVpZCAgICAgICAgIC8vIHJhbmRvbSBoZXggZGlnaXRzXG4gICAgICApXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIm5hbWVcIjogXCJhbmFseXRpY3MtY29yZVwiLFxuICBcInZlcnNpb25cIjogXCIyLjExLjFcIixcbiAgXCJtYWluXCI6IFwiYW5hbHl0aWNzLmpzXCIsXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHt9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7fVxufVxuOyIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBiaW5kID0gcmVxdWlyZSgnYmluZCcpO1xudmFyIGNsb25lID0gcmVxdWlyZSgnY2xvbmUnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCdkZWZhdWx0cycpO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2V4dGVuZCcpO1xudmFyIHNsdWcgPSByZXF1aXJlKCdzbHVnJyk7XG52YXIgcHJvdG9zID0gcmVxdWlyZSgnLi9wcm90b3MnKTtcbnZhciBzdGF0aWNzID0gcmVxdWlyZSgnLi9zdGF0aWNzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGBJbnRlZ3JhdGlvbmAgY29uc3RydWN0b3IuXG4gKlxuICogQGNvbnN0cnVjdHMgSW50ZWdyYXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gSW50ZWdyYXRpb25cbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVJbnRlZ3JhdGlvbihuYW1lKXtcbiAgLyoqXG4gICAqIEluaXRpYWxpemUgYSBuZXcgYEludGVncmF0aW9uYC5cbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEludGVncmF0aW9uKG9wdGlvbnMpe1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuYWRkSW50ZWdyYXRpb24pIHtcbiAgICAgIC8vIHBsdWdpblxuICAgICAgcmV0dXJuIG9wdGlvbnMuYWRkSW50ZWdyYXRpb24oSW50ZWdyYXRpb24pO1xuICAgIH1cbiAgICB0aGlzLmRlYnVnID0gZGVidWcoJ2FuYWx5dGljczppbnRlZ3JhdGlvbjonICsgc2x1ZyhuYW1lKSk7XG4gICAgdGhpcy5vcHRpb25zID0gZGVmYXVsdHMoY2xvbmUob3B0aW9ucykgfHwge30sIHRoaXMuZGVmYXVsdHMpO1xuICAgIHRoaXMuX3F1ZXVlID0gW107XG4gICAgdGhpcy5vbmNlKCdyZWFkeScsIGJpbmQodGhpcywgdGhpcy5mbHVzaCkpO1xuXG4gICAgSW50ZWdyYXRpb24uZW1pdCgnY29uc3RydWN0JywgdGhpcyk7XG4gICAgdGhpcy5yZWFkeSA9IGJpbmQodGhpcywgdGhpcy5yZWFkeSk7XG4gICAgdGhpcy5fd3JhcEluaXRpYWxpemUoKTtcbiAgICB0aGlzLl93cmFwUGFnZSgpO1xuICAgIHRoaXMuX3dyYXBUcmFjaygpO1xuICB9XG5cbiAgSW50ZWdyYXRpb24ucHJvdG90eXBlLmRlZmF1bHRzID0ge307XG4gIEludGVncmF0aW9uLnByb3RvdHlwZS5nbG9iYWxzID0gW107XG4gIEludGVncmF0aW9uLnByb3RvdHlwZS50ZW1wbGF0ZXMgPSB7fTtcbiAgSW50ZWdyYXRpb24ucHJvdG90eXBlLm5hbWUgPSBuYW1lO1xuICBleHRlbmQoSW50ZWdyYXRpb24sIHN0YXRpY3MpO1xuICBleHRlbmQoSW50ZWdyYXRpb24ucHJvdG90eXBlLCBwcm90b3MpO1xuXG4gIHJldHVybiBJbnRlZ3JhdGlvbjtcbn1cblxuLyoqXG4gKiBFeHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlSW50ZWdyYXRpb247XG4iLCJcbnZhciBiaW5kID0gcmVxdWlyZSgnYmluZCcpXG4gICwgYmluZEFsbCA9IHJlcXVpcmUoJ2JpbmQtYWxsJyk7XG5cblxuLyoqXG4gKiBFeHBvc2UgYGJpbmRgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGJpbmQ7XG5cblxuLyoqXG4gKiBFeHBvc2UgYGJpbmRBbGxgLlxuICovXG5cbmV4cG9ydHMuYWxsID0gYmluZEFsbDtcblxuXG4vKipcbiAqIEV4cG9zZSBgYmluZE1ldGhvZHNgLlxuICovXG5cbmV4cG9ydHMubWV0aG9kcyA9IGJpbmRNZXRob2RzO1xuXG5cbi8qKlxuICogQmluZCBgbWV0aG9kc2Agb24gYG9iamAgdG8gYWx3YXlzIGJlIGNhbGxlZCB3aXRoIHRoZSBgb2JqYCBhcyBjb250ZXh0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RzLi4uXG4gKi9cblxuZnVuY3Rpb24gYmluZE1ldGhvZHMgKG9iaiwgbWV0aG9kcykge1xuICBtZXRob2RzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICBmb3IgKHZhciBpID0gMCwgbWV0aG9kOyBtZXRob2QgPSBtZXRob2RzW2ldOyBpKyspIHtcbiAgICBvYmpbbWV0aG9kXSA9IGJpbmQob2JqLCBvYmpbbWV0aG9kXSk7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn0iLCJpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvdykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2RlYnVnJyk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGVidWcnKTtcbn1cbiIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdHR5ID0gcmVxdWlyZSgndHR5Jyk7XG5cbi8qKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZGVidWc7XG5cbi8qKlxuICogRW5hYmxlZCBkZWJ1Z2dlcnMuXG4gKi9cblxudmFyIG5hbWVzID0gW11cbiAgLCBza2lwcyA9IFtdO1xuXG4ocHJvY2Vzcy5lbnYuREVCVUcgfHwgJycpXG4gIC5zcGxpdCgvW1xccyxdKy8pXG4gIC5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpe1xuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoJyonLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVbMF0gPT09ICctJykge1xuICAgICAgc2tpcHMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUuc3Vic3RyKDEpICsgJyQnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWVzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lICsgJyQnKSk7XG4gICAgfVxuICB9KTtcblxuLyoqXG4gKiBDb2xvcnMuXG4gKi9cblxudmFyIGNvbG9ycyA9IFs2LCAyLCAzLCA0LCA1LCAxXTtcblxuLyoqXG4gKiBQcmV2aW91cyBkZWJ1ZygpIGNhbGwuXG4gKi9cblxudmFyIHByZXYgPSB7fTtcblxuLyoqXG4gKiBQcmV2aW91c2x5IGFzc2lnbmVkIGNvbG9yLlxuICovXG5cbnZhciBwcmV2Q29sb3IgPSAwO1xuXG4vKipcbiAqIElzIHN0ZG91dCBhIFRUWT8gQ29sb3JlZCBvdXRwdXQgaXMgZGlzYWJsZWQgd2hlbiBgdHJ1ZWAuXG4gKi9cblxudmFyIGlzYXR0eSA9IHR0eS5pc2F0dHkoMik7XG5cbi8qKlxuICogU2VsZWN0IGEgY29sb3IuXG4gKlxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29sb3IoKSB7XG4gIHJldHVybiBjb2xvcnNbcHJldkNvbG9yKysgJSBjb2xvcnMubGVuZ3RoXTtcbn1cblxuLyoqXG4gKiBIdW1hbml6ZSB0aGUgZ2l2ZW4gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbVxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaHVtYW5pemUobXMpIHtcbiAgdmFyIHNlYyA9IDEwMDBcbiAgICAsIG1pbiA9IDYwICogMTAwMFxuICAgICwgaG91ciA9IDYwICogbWluO1xuXG4gIGlmIChtcyA+PSBob3VyKSByZXR1cm4gKG1zIC8gaG91cikudG9GaXhlZCgxKSArICdoJztcbiAgaWYgKG1zID49IG1pbikgcmV0dXJuIChtcyAvIG1pbikudG9GaXhlZCgxKSArICdtJztcbiAgaWYgKG1zID49IHNlYykgcmV0dXJuIChtcyAvIHNlYyB8IDApICsgJ3MnO1xuICByZXR1cm4gbXMgKyAnbXMnO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGRlYnVnZ2VyIHdpdGggdGhlIGdpdmVuIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7VHlwZX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGVidWcobmFtZSkge1xuICBmdW5jdGlvbiBkaXNhYmxlZCgpe31cbiAgZGlzYWJsZWQuZW5hYmxlZCA9IGZhbHNlO1xuXG4gIHZhciBtYXRjaCA9IHNraXBzLnNvbWUoZnVuY3Rpb24ocmUpe1xuICAgIHJldHVybiByZS50ZXN0KG5hbWUpO1xuICB9KTtcblxuICBpZiAobWF0Y2gpIHJldHVybiBkaXNhYmxlZDtcblxuICBtYXRjaCA9IG5hbWVzLnNvbWUoZnVuY3Rpb24ocmUpe1xuICAgIHJldHVybiByZS50ZXN0KG5hbWUpO1xuICB9KTtcblxuICBpZiAoIW1hdGNoKSByZXR1cm4gZGlzYWJsZWQ7XG4gIHZhciBjID0gY29sb3IoKTtcblxuICBmdW5jdGlvbiBjb2xvcmVkKGZtdCkge1xuICAgIGZtdCA9IGNvZXJjZShmbXQpO1xuXG4gICAgdmFyIGN1cnIgPSBuZXcgRGF0ZTtcbiAgICB2YXIgbXMgPSBjdXJyIC0gKHByZXZbbmFtZV0gfHwgY3Vycik7XG4gICAgcHJldltuYW1lXSA9IGN1cnI7XG5cbiAgICBmbXQgPSAnICBcXHUwMDFiWzknICsgYyArICdtJyArIG5hbWUgKyAnICdcbiAgICAgICsgJ1xcdTAwMWJbMycgKyBjICsgJ21cXHUwMDFiWzkwbSdcbiAgICAgICsgZm10ICsgJ1xcdTAwMWJbMycgKyBjICsgJ20nXG4gICAgICArICcgKycgKyBodW1hbml6ZShtcykgKyAnXFx1MDAxYlswbSc7XG5cbiAgICBjb25zb2xlLmVycm9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBmdW5jdGlvbiBwbGFpbihmbXQpIHtcbiAgICBmbXQgPSBjb2VyY2UoZm10KTtcblxuICAgIGZtdCA9IG5ldyBEYXRlKCkudG9VVENTdHJpbmcoKVxuICAgICAgKyAnICcgKyBuYW1lICsgJyAnICsgZm10O1xuICAgIGNvbnNvbGUuZXJyb3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIGNvbG9yZWQuZW5hYmxlZCA9IHBsYWluLmVuYWJsZWQgPSB0cnVlO1xuXG4gIHJldHVybiBpc2F0dHkgfHwgcHJvY2Vzcy5lbnYuREVCVUdfQ09MT1JTXG4gICAgPyBjb2xvcmVkXG4gICAgOiBwbGFpbjtcbn1cblxuLyoqXG4gKiBDb2VyY2UgYHZhbGAuXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG4iLCJcbi8qKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZGVidWc7XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtUeXBlfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWJ1ZyhuYW1lKSB7XG4gIGlmICghZGVidWcuZW5hYmxlZChuYW1lKSkgcmV0dXJuIGZ1bmN0aW9uKCl7fTtcblxuICByZXR1cm4gZnVuY3Rpb24oZm10KXtcbiAgICBmbXQgPSBjb2VyY2UoZm10KTtcblxuICAgIHZhciBjdXJyID0gbmV3IERhdGU7XG4gICAgdmFyIG1zID0gY3VyciAtIChkZWJ1Z1tuYW1lXSB8fCBjdXJyKTtcbiAgICBkZWJ1Z1tuYW1lXSA9IGN1cnI7XG5cbiAgICBmbXQgPSBuYW1lXG4gICAgICArICcgJ1xuICAgICAgKyBmbXRcbiAgICAgICsgJyArJyArIGRlYnVnLmh1bWFuaXplKG1zKTtcblxuICAgIC8vIFRoaXMgaGFja2VyeSBpcyByZXF1aXJlZCBmb3IgSUU4XG4gICAgLy8gd2hlcmUgYGNvbnNvbGUubG9nYCBkb2Vzbid0IGhhdmUgJ2FwcGx5J1xuICAgIHdpbmRvdy5jb25zb2xlXG4gICAgICAmJiBjb25zb2xlLmxvZ1xuICAgICAgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgY3VycmVudGx5IGFjdGl2ZSBkZWJ1ZyBtb2RlIG5hbWVzLlxuICovXG5cbmRlYnVnLm5hbWVzID0gW107XG5kZWJ1Zy5za2lwcyA9IFtdO1xuXG4vKipcbiAqIEVuYWJsZXMgYSBkZWJ1ZyBtb2RlIGJ5IG5hbWUuIFRoaXMgY2FuIGluY2x1ZGUgbW9kZXNcbiAqIHNlcGFyYXRlZCBieSBhIGNvbG9uIGFuZCB3aWxkY2FyZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZGVidWcuZW5hYmxlID0gZnVuY3Rpb24obmFtZSkge1xuICB0cnkge1xuICAgIGxvY2FsU3RvcmFnZS5kZWJ1ZyA9IG5hbWU7XG4gIH0gY2F0Y2goZSl7fVxuXG4gIHZhciBzcGxpdCA9IChuYW1lIHx8ICcnKS5zcGxpdCgvW1xccyxdKy8pXG4gICAgLCBsZW4gPSBzcGxpdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG5hbWUgPSBzcGxpdFtpXS5yZXBsYWNlKCcqJywgJy4qPycpO1xuICAgIGlmIChuYW1lWzBdID09PSAnLScpIHtcbiAgICAgIGRlYnVnLnNraXBzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lLnN1YnN0cigxKSArICckJykpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGRlYnVnLm5hbWVzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lICsgJyQnKSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZGVidWcuZGlzYWJsZSA9IGZ1bmN0aW9uKCl7XG4gIGRlYnVnLmVuYWJsZSgnJyk7XG59O1xuXG4vKipcbiAqIEh1bWFuaXplIHRoZSBnaXZlbiBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5kZWJ1Zy5odW1hbml6ZSA9IGZ1bmN0aW9uKG1zKSB7XG4gIHZhciBzZWMgPSAxMDAwXG4gICAgLCBtaW4gPSA2MCAqIDEwMDBcbiAgICAsIGhvdXIgPSA2MCAqIG1pbjtcblxuICBpZiAobXMgPj0gaG91cikgcmV0dXJuIChtcyAvIGhvdXIpLnRvRml4ZWQoMSkgKyAnaCc7XG4gIGlmIChtcyA+PSBtaW4pIHJldHVybiAobXMgLyBtaW4pLnRvRml4ZWQoMSkgKyAnbSc7XG4gIGlmIChtcyA+PSBzZWMpIHJldHVybiAobXMgLyBzZWMgfCAwKSArICdzJztcbiAgcmV0dXJuIG1zICsgJ21zJztcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBtb2RlIG5hbWUgaXMgZW5hYmxlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5kZWJ1Zy5lbmFibGVkID0gZnVuY3Rpb24obmFtZSkge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gZGVidWcuc2tpcHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZGVidWcuc2tpcHNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gZGVidWcubmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZGVidWcubmFtZXNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogQ29lcmNlIGB2YWxgLlxuICovXG5cbmZ1bmN0aW9uIGNvZXJjZSh2YWwpIHtcbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEVycm9yKSByZXR1cm4gdmFsLnN0YWNrIHx8IHZhbC5tZXNzYWdlO1xuICByZXR1cm4gdmFsO1xufVxuXG4vLyBwZXJzaXN0XG5cbnRyeSB7XG4gIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlKSBkZWJ1Zy5lbmFibGUobG9jYWxTdG9yYWdlLmRlYnVnKTtcbn0gY2F0Y2goZSl7fVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCAob2JqZWN0KSB7XG4gICAgLy8gVGFrZXMgYW4gdW5saW1pdGVkIG51bWJlciBvZiBleHRlbmRlcnMuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgLy8gRm9yIGVhY2ggZXh0ZW5kZXIsIGNvcHkgdGhlaXIgcHJvcGVydGllcyBvbiBvdXIgb2JqZWN0LlxuICAgIGZvciAodmFyIGkgPSAwLCBzb3VyY2U7IHNvdXJjZSA9IGFyZ3NbaV07IGkrKykge1xuICAgICAgICBpZiAoIXNvdXJjZSkgY29udGludWU7XG4gICAgICAgIGZvciAodmFyIHByb3BlcnR5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgb2JqZWN0W3Byb3BlcnR5XSA9IHNvdXJjZVtwcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0O1xufTsiLCJcbi8qKlxuICogR2VuZXJhdGUgYSBzbHVnIGZyb20gdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIGV4YW1wbGU6XG4gKlxuICogICAgICAgIGdlbmVyYXRlKCdmb28gYmFyJyk7XG4gKiAgICAgICAgLy8gPiBmb28tYmFyXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBjb25maWcge1N0cmluZ3xSZWdFeHB9IFtyZXBsYWNlXSBjaGFyYWN0ZXJzIHRvIHJlcGxhY2UsIGRlZmF1bHRlZCB0byBgL1teYS16MC05XS9nYFxuICogQGNvbmZpZyB7U3RyaW5nfSBbc2VwYXJhdG9yXSBzZXBhcmF0b3IgdG8gaW5zZXJ0LCBkZWZhdWx0ZWQgdG8gYC1gXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gIHJldHVybiBzdHIudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKG9wdGlvbnMucmVwbGFjZSB8fCAvW15hLXowLTldL2csICcgJylcbiAgICAucmVwbGFjZSgvXiArfCArJC9nLCAnJylcbiAgICAucmVwbGFjZSgvICsvZywgb3B0aW9ucy5zZXBhcmF0b3IgfHwgJy0nKVxufTtcbiIsIi8qIGdsb2JhbCBzZXRJbnRlcnZhbDp0cnVlIHNldFRpbWVvdXQ6dHJ1ZSAqL1xuXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgYWZ0ZXIgPSByZXF1aXJlKCdhZnRlcicpO1xudmFyIGVhY2ggPSByZXF1aXJlKCdlYWNoJyk7XG52YXIgZXZlbnRzID0gcmVxdWlyZSgnYW5hbHl0aWNzLWV2ZW50cycpO1xudmFyIGZtdCA9IHJlcXVpcmUoJ2ZtdCcpO1xudmFyIGZvbGRsID0gcmVxdWlyZSgnZm9sZGwnKTtcbnZhciBsb2FkSWZyYW1lID0gcmVxdWlyZSgnbG9hZC1pZnJhbWUnKTtcbnZhciBsb2FkU2NyaXB0ID0gcmVxdWlyZSgnbG9hZC1zY3JpcHQnKTtcbnZhciBub3JtYWxpemUgPSByZXF1aXJlKCd0by1uby1jYXNlJyk7XG52YXIgbmV4dFRpY2sgPSByZXF1aXJlKCduZXh0LXRpY2snKTtcbnZhciBldmVyeSA9IHJlcXVpcmUoJ2V2ZXJ5Jyk7XG52YXIgaXMgPSByZXF1aXJlKCdpcycpO1xuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpe31cblxuLyoqXG4gKiBoYXNPd25Qcm9wZXJ0eSByZWZlcmVuY2UuXG4gKi9cblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogV2luZG93IGRlZmF1bHRzLlxuICovXG5cbnZhciBvbmVycm9yID0gd2luZG93Lm9uZXJyb3I7XG52YXIgb25sb2FkID0gbnVsbDtcbnZhciBzZXRJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbDtcbnZhciBzZXRUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQ7XG5cbi8qKlxuICogTWl4aW4gZW1pdHRlci5cbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuZXctY2FwICovXG5FbWl0dGVyKGV4cG9ydHMpO1xuLyogZXNsaW50LWVuYWJsZSBuZXctY2FwICovXG5cbi8qKlxuICogSW5pdGlhbGl6ZS5cbiAqL1xuXG5leHBvcnRzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpe1xuICB2YXIgcmVhZHkgPSB0aGlzLnJlYWR5O1xuICBuZXh0VGljayhyZWFkeSk7XG59O1xuXG4vKipcbiAqIExvYWRlZD9cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cblxuZXhwb3J0cy5sb2FkZWQgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIFBhZ2UuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqIEBwYXJhbSB7UGFnZX0gcGFnZVxuICovXG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5leHBvcnRzLnBhZ2UgPSBmdW5jdGlvbihwYWdlKXt9O1xuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG4vKipcbiAqIFRyYWNrLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKiBAcGFyYW0ge1RyYWNrfSB0cmFja1xuICovXG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5leHBvcnRzLnRyYWNrID0gZnVuY3Rpb24odHJhY2spe307XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbi8qKlxuICogR2V0IHZhbHVlcyBmcm9tIGl0ZW1zIGluIGBvcHRpb25zYCB0aGF0IGFyZSBtYXBwZWQgdG8gYGtleWAuXG4gKiBgb3B0aW9uc2AgaXMgYW4gaW50ZWdyYXRpb24gc2V0dGluZyB3aGljaCBpcyBhIGNvbGxlY3Rpb25cbiAqIG9mIHR5cGUgJ21hcCcsICdhcnJheScsIG9yICdtaXhlZCdcbiAqXG4gKiBVc2UgY2FzZXMgaW5jbHVkZSBtYXBwaW5nIGV2ZW50cyB0byBwaXhlbElkcyAobWFwKSwgc2VuZGluZyBnZW5lcmljXG4gKiBjb252ZXJzaW9uIHBpeGVscyBvbmx5IGZvciBzcGVjaWZpYyBldmVudHMgKGFycmF5KSwgb3IgY29uZmlndXJpbmcgZHluYW1pY1xuICogbWFwcGluZ3Mgb2YgZXZlbnQgcHJvcGVydGllcyB0byBxdWVyeSBzdHJpbmcgcGFyYW1ldGVycyBiYXNlZCBvbiBldmVudCAobWl4ZWQpXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqIEBwYXJhbSB7T2JqZWN0fE9iamVjdFtdfFN0cmluZ1tdfSBvcHRpb25zIEFuIG9iamVjdCwgYXJyYXkgb2Ygb2JqZWN0cywgb3JcbiAqIGFycmF5IG9mIHN0cmluZ3MgcHVsbGVkIGZyb20gc2V0dGluZ3MubWFwcGluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIG5hbWUgb2YgdGhlIGl0ZW0gaW4gb3B0aW9ucyB3aG9zZSBtZXRhZGF0YVxuICogd2UncmUgbG9va2luZyBmb3IuXG4gKiBAcmV0dXJuIHtBcnJheX0gQW4gYXJyYXkgb2Ygc2V0dGluZ3MgdGhhdCBtYXRjaCB0aGUgaW5wdXQgYGtleWAgbmFtZS5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gJ01hcCdcbiAqIHZhciBldmVudHMgPSB7IG15X2V2ZW50OiAnYTQ5OTFiODgnIH07XG4gKiAubWFwKGV2ZW50cywgJ015IEV2ZW50Jyk7XG4gKiAvLyA9PiBbXCJhNDk5MWI4OFwiXVxuICogLm1hcChldmVudHMsICd3aGF0ZXZlcicpO1xuICogLy8gPT4gW11cbiAqXG4gKiAvLyAnQXJyYXknXG4gKiAqIHZhciBldmVudHMgPSBbJ0NvbXBsZXRlZCBPcmRlcicsICdNeSBFdmVudCddO1xuICogLm1hcChldmVudHMsICdNeSBFdmVudCcpO1xuICogLy8gPT4gW1wiTXkgRXZlbnRcIl1cbiAqIC5tYXAoZXZlbnRzLCAnd2hhdGV2ZXInKTtcbiAqIC8vID0+IFtdXG4gKlxuICogLy8gJ01peGVkJ1xuICogdmFyIGV2ZW50cyA9IFt7IGtleTogJ215IGV2ZW50JywgdmFsdWU6ICc5YjVlYjFmYScgfV07XG4gKiAubWFwKGV2ZW50cywgJ215X2V2ZW50Jyk7XG4gKiAvLyA9PiBbXCI5YjVlYjFmYVwiXVxuICogLm1hcChldmVudHMsICd3aGF0ZXZlcicpO1xuICogLy8gPT4gW11cbiAqL1xuXG5leHBvcnRzLm1hcCA9IGZ1bmN0aW9uKG9wdGlvbnMsIGtleSl7XG4gIHZhciBub3JtYWxpemVkQ29tcGFyYXRvciA9IG5vcm1hbGl6ZShrZXkpO1xuICB2YXIgbWFwcGluZ1R5cGUgPSBnZXRNYXBwaW5nVHlwZShvcHRpb25zKTtcblxuICBpZiAobWFwcGluZ1R5cGUgPT09ICd1bmtub3duJykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHJldHVybiBmb2xkbChmdW5jdGlvbihtYXRjaGluZ1ZhbHVlcywgdmFsLCBrZXkpIHtcbiAgICB2YXIgY29tcGFyZTtcbiAgICB2YXIgcmVzdWx0O1xuXG4gICAgaWYgKG1hcHBpbmdUeXBlID09PSAnbWFwJykge1xuICAgICAgY29tcGFyZSA9IGtleTtcbiAgICAgIHJlc3VsdCA9IHZhbDtcbiAgICB9XG5cbiAgICBpZiAobWFwcGluZ1R5cGUgPT09ICdhcnJheScpIHtcbiAgICAgIGNvbXBhcmUgPSB2YWw7XG4gICAgICByZXN1bHQgPSB2YWw7XG4gICAgfVxuXG4gICAgaWYgKG1hcHBpbmdUeXBlID09PSAnbWl4ZWQnKSB7XG4gICAgICBjb21wYXJlID0gdmFsLmtleTtcbiAgICAgIHJlc3VsdCA9IHZhbC52YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAobm9ybWFsaXplKGNvbXBhcmUpID09PSBub3JtYWxpemVkQ29tcGFyYXRvcikge1xuICAgICAgbWF0Y2hpbmdWYWx1ZXMucHVzaChyZXN1bHQpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXRjaGluZ1ZhbHVlcztcbiAgfSwgW10sIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgYSBgbWV0aG9kYCB0aGF0IG1heSBvciBtYXkgbm90IGV4aXN0IG9uIHRoZSBwcm90b3R5cGUgd2l0aCBgYXJnc2AsXG4gKiBxdWV1ZWluZyBvciBub3QgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhlIGludGVncmF0aW9uIGlzIFwicmVhZHlcIi4gRG9uJ3RcbiAqIHRydXN0IHRoZSBtZXRob2QgY2FsbCwgc2luY2UgaXQgY29udGFpbnMgaW50ZWdyYXRpb24gcGFydHkgY29kZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7Li4uKn0gYXJnc1xuICovXG5cbmV4cG9ydHMuaW52b2tlID0gZnVuY3Rpb24obWV0aG9kKXtcbiAgaWYgKCF0aGlzW21ldGhvZF0pIHJldHVybjtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICBpZiAoIXRoaXMuX3JlYWR5KSByZXR1cm4gdGhpcy5xdWV1ZShtZXRob2QsIGFyZ3MpO1xuICB2YXIgcmV0O1xuXG4gIHRyeSB7XG4gICAgdGhpcy5kZWJ1ZygnJXMgd2l0aCAlbycsIG1ldGhvZCwgYXJncyk7XG4gICAgcmV0ID0gdGhpc1ttZXRob2RdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhpcy5kZWJ1ZygnZXJyb3IgJW8gY2FsbGluZyAlcyB3aXRoICVvJywgZSwgbWV0aG9kLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59O1xuXG4vKipcbiAqIFF1ZXVlIGEgYG1ldGhvZGAgd2l0aCBgYXJnc2AuIElmIHRoZSBpbnRlZ3JhdGlvbiBhc3N1bWVzIGFuIGluaXRpYWxcbiAqIHBhZ2V2aWV3LCB0aGVuIGxldCB0aGUgZmlyc3QgY2FsbCB0byBgcGFnZWAgcGFzcyB0aHJvdWdoLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtBcnJheX0gYXJnc1xuICovXG5cbmV4cG9ydHMucXVldWUgPSBmdW5jdGlvbihtZXRob2QsIGFyZ3Mpe1xuICBpZiAobWV0aG9kID09PSAncGFnZScgJiYgdGhpcy5fYXNzdW1lc1BhZ2V2aWV3ICYmICF0aGlzLl9pbml0aWFsaXplZCkge1xuICAgIHJldHVybiB0aGlzLnBhZ2UuYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICB0aGlzLl9xdWV1ZS5wdXNoKHsgbWV0aG9kOiBtZXRob2QsIGFyZ3M6IGFyZ3MgfSk7XG59O1xuXG4vKipcbiAqIEZsdXNoIHRoZSBpbnRlcm5hbCBxdWV1ZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLmZsdXNoID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fcmVhZHkgPSB0cnVlO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgZWFjaCh0aGlzLl9xdWV1ZSwgZnVuY3Rpb24oY2FsbCl7XG4gICAgc2VsZltjYWxsLm1ldGhvZF0uYXBwbHkoc2VsZiwgY2FsbC5hcmdzKTtcbiAgfSk7XG5cbiAgLy8gRW1wdHkgdGhlIHF1ZXVlLlxuICB0aGlzLl9xdWV1ZS5sZW5ndGggPSAwO1xufTtcblxuLyoqXG4gKiBSZXNldCB0aGUgaW50ZWdyYXRpb24sIHJlbW92aW5nIGl0cyBnbG9iYWwgdmFyaWFibGVzLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucmVzZXQgPSBmdW5jdGlvbigpe1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2xvYmFscy5sZW5ndGg7IGkrKykge1xuICAgIHdpbmRvd1t0aGlzLmdsb2JhbHNbaV1dID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgd2luZG93LnNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICB3aW5kb3cuc2V0SW50ZXJ2YWwgPSBzZXRJbnRlcnZhbDtcbiAgd2luZG93Lm9uZXJyb3IgPSBvbmVycm9yO1xuICB3aW5kb3cub25sb2FkID0gb25sb2FkO1xufTtcblxuLyoqXG4gKiBMb2FkIGEgdGFnIGJ5IGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgdGFnLlxuICogQHBhcmFtIHtPYmplY3R9IGxvY2FscyBMb2NhbHMgdXNlZCB0byBwb3B1bGF0ZSB0aGUgdGFnJ3MgdGVtcGxhdGUgdmFyaWFibGVzXG4gKiAoZS5nLiBgdXNlcklkYCBpbiAnPGltZyBzcmM9XCJodHRwczovL3doYXRldmVyLmNvbS97eyB1c2VySWQgfX1cIj4nKS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1ub29wXSBBIGNhbGxiYWNrLCBpbnZva2VkIHdoZW4gdGhlIHRhZyBmaW5pc2hlc1xuICogbG9hZGluZy5cbiAqL1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbihuYW1lLCBsb2NhbHMsIGNhbGxiYWNrKXtcbiAgLy8gQXJndW1lbnQgc2h1ZmZsaW5nXG4gIGlmICh0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJykgeyBjYWxsYmFjayA9IG5hbWU7IGxvY2FscyA9IG51bGw7IG5hbWUgPSBudWxsOyB9XG4gIGlmIChuYW1lICYmIHR5cGVvZiBuYW1lID09PSAnb2JqZWN0JykgeyBjYWxsYmFjayA9IGxvY2FsczsgbG9jYWxzID0gbmFtZTsgbmFtZSA9IG51bGw7IH1cbiAgaWYgKHR5cGVvZiBsb2NhbHMgPT09ICdmdW5jdGlvbicpIHsgY2FsbGJhY2sgPSBsb2NhbHM7IGxvY2FscyA9IG51bGw7IH1cblxuICAvLyBEZWZhdWx0IGFyZ3VtZW50c1xuICBuYW1lID0gbmFtZSB8fCAnbGlicmFyeSc7XG4gIGxvY2FscyA9IGxvY2FscyB8fCB7fTtcblxuICBsb2NhbHMgPSB0aGlzLmxvY2Fscyhsb2NhbHMpO1xuICB2YXIgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlc1tuYW1lXTtcbiAgaWYgKCF0ZW1wbGF0ZSkgdGhyb3cgbmV3IEVycm9yKGZtdCgndGVtcGxhdGUgXCIlc1wiIG5vdCBkZWZpbmVkLicsIG5hbWUpKTtcbiAgdmFyIGF0dHJzID0gcmVuZGVyKHRlbXBsYXRlLCBsb2NhbHMpO1xuICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIGVsO1xuXG4gIHN3aXRjaCAodGVtcGxhdGUudHlwZSkge1xuICAgIGNhc2UgJ2ltZyc6XG4gICAgICBhdHRycy53aWR0aCA9IDE7XG4gICAgICBhdHRycy5oZWlnaHQgPSAxO1xuICAgICAgZWwgPSBsb2FkSW1hZ2UoYXR0cnMsIGNhbGxiYWNrKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NjcmlwdCc6XG4gICAgICBlbCA9IGxvYWRTY3JpcHQoYXR0cnMsIGZ1bmN0aW9uKGVycil7XG4gICAgICAgIGlmICghZXJyKSByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgc2VsZi5kZWJ1ZygnZXJyb3IgbG9hZGluZyBcIiVzXCIgZXJyb3I9XCIlc1wiJywgc2VsZi5uYW1lLCBlcnIpO1xuICAgICAgfSk7XG4gICAgICAvLyBUT0RPOiBoYWNrIHVudGlsIHJlZmFjdG9yaW5nIGxvYWQtc2NyaXB0XG4gICAgICBkZWxldGUgYXR0cnMuc3JjO1xuICAgICAgZWFjaChhdHRycywgZnVuY3Rpb24oa2V5LCB2YWwpe1xuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWwpO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpZnJhbWUnOlxuICAgICAgZWwgPSBsb2FkSWZyYW1lKGF0dHJzLCBjYWxsYmFjayk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gTm8gZGVmYXVsdCBjYXNlXG4gIH1cblxuICByZXR1cm4gZWw7XG59O1xuXG4vKipcbiAqIExvY2FscyBmb3IgdGFnIHRlbXBsYXRlcy5cbiAqXG4gKiBCeSBkZWZhdWx0IGl0IGluY2x1ZGVzIGEgY2FjaGUgYnVzdGVyIGFuZCBhbGwgb2YgdGhlIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtsb2NhbHNdXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZXhwb3J0cy5sb2NhbHMgPSBmdW5jdGlvbihsb2NhbHMpe1xuICBsb2NhbHMgPSBsb2NhbHMgfHwge307XG4gIHZhciBjYWNoZSA9IE1hdGguZmxvb3IobmV3IERhdGUoKS5nZXRUaW1lKCkgLyAzNjAwMDAwKTtcbiAgaWYgKCFsb2NhbHMuaGFzT3duUHJvcGVydHkoJ2NhY2hlJykpIGxvY2Fscy5jYWNoZSA9IGNhY2hlO1xuICBlYWNoKHRoaXMub3B0aW9ucywgZnVuY3Rpb24oa2V5LCB2YWwpe1xuICAgIGlmICghbG9jYWxzLmhhc093blByb3BlcnR5KGtleSkpIGxvY2Fsc1trZXldID0gdmFsO1xuICB9KTtcbiAgcmV0dXJuIGxvY2Fscztcbn07XG5cbi8qKlxuICogU2ltcGxlIHdheSB0byBlbWl0IHJlYWR5LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5yZWFkeSA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuZW1pdCgncmVhZHknKTtcbn07XG5cbi8qKlxuICogV3JhcCB0aGUgaW5pdGlhbGl6ZSBtZXRob2QgaW4gYW4gZXhpc3RzIGNoZWNrLCBzbyB3ZSBkb24ndCBoYXZlIHRvIGRvIGl0IGZvclxuICogZXZlcnkgc2luZ2xlIGludGVncmF0aW9uLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMuX3dyYXBJbml0aWFsaXplID0gZnVuY3Rpb24oKXtcbiAgdmFyIGluaXRpYWxpemUgPSB0aGlzLmluaXRpYWxpemU7XG4gIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5kZWJ1ZygnaW5pdGlhbGl6ZScpO1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB2YXIgcmV0ID0gaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuZW1pdCgnaW5pdGlhbGl6ZScpO1xuICAgIHJldHVybiByZXQ7XG4gIH07XG5cbiAgaWYgKHRoaXMuX2Fzc3VtZXNQYWdldmlldykgdGhpcy5pbml0aWFsaXplID0gYWZ0ZXIoMiwgdGhpcy5pbml0aWFsaXplKTtcbn07XG5cbi8qKlxuICogV3JhcCB0aGUgcGFnZSBtZXRob2QgdG8gY2FsbCBgaW5pdGlhbGl6ZWAgaW5zdGVhZCBpZiB0aGUgaW50ZWdyYXRpb24gYXNzdW1lc1xuICogYSBwYWdldmlldy5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLl93cmFwUGFnZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBwYWdlID0gdGhpcy5wYWdlO1xuICB0aGlzLnBhZ2UgPSBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLl9hc3N1bWVzUGFnZXZpZXcgJiYgIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhZ2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn07XG5cbi8qKlxuICogV3JhcCB0aGUgdHJhY2sgbWV0aG9kIHRvIGNhbGwgb3RoZXIgZWNvbW1lcmNlIG1ldGhvZHMgaWYgYXZhaWxhYmxlIGRlcGVuZGluZ1xuICogb24gdGhlIGB0cmFjay5ldmVudCgpYC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLl93cmFwVHJhY2sgPSBmdW5jdGlvbigpe1xuICB2YXIgdCA9IHRoaXMudHJhY2s7XG4gIHRoaXMudHJhY2sgPSBmdW5jdGlvbih0cmFjayl7XG4gICAgdmFyIGV2ZW50ID0gdHJhY2suZXZlbnQoKTtcbiAgICB2YXIgY2FsbGVkO1xuICAgIHZhciByZXQ7XG5cbiAgICBmb3IgKHZhciBtZXRob2QgaW4gZXZlbnRzKSB7XG4gICAgICBpZiAoaGFzLmNhbGwoZXZlbnRzLCBtZXRob2QpKSB7XG4gICAgICAgIHZhciByZWdleHAgPSBldmVudHNbbWV0aG9kXTtcbiAgICAgICAgaWYgKCF0aGlzW21ldGhvZF0pIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIXJlZ2V4cC50ZXN0KGV2ZW50KSkgY29udGludWU7XG4gICAgICAgIHJldCA9IHRoaXNbbWV0aG9kXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWNhbGxlZCkgcmV0ID0gdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiByZXQ7XG4gIH07XG59O1xuXG4vKipcbiAqIERldGVybWluZSB0aGUgdHlwZSBvZiB0aGUgb3B0aW9uIHBhc3NlZCB0byBgI21hcGBcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fE9iamVjdFtdfSBtYXBwaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9IG1hcHBpbmdUeXBlXG4gKi9cblxuZnVuY3Rpb24gZ2V0TWFwcGluZ1R5cGUobWFwcGluZykge1xuICBpZiAoaXMuYXJyYXkobWFwcGluZykpIHtcbiAgICByZXR1cm4gZXZlcnkoaXNNaXhlZCwgbWFwcGluZykgPyAnbWl4ZWQnIDogJ2FycmF5JztcbiAgfVxuICBpZiAoaXMub2JqZWN0KG1hcHBpbmcpKSByZXR1cm4gJ21hcCc7XG4gIHJldHVybiAndW5rbm93bic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGl0ZW0gaW4gbWFwcGluZyBhcnJheSBpcyBhIHZhbGlkIFwibWl4ZWRcIiB0eXBlIHZhbHVlXG4gKlxuICogTXVzdCBiZSBhbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIFwia2V5XCIgKG9mIHR5cGUgc3RyaW5nKVxuICogYW5kIFwidmFsdWVcIiAob2YgYW55IHR5cGUpXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0geyp9IGl0ZW1cbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gaXNNaXhlZChpdGVtKSB7XG4gIGlmICghaXMub2JqZWN0KGl0ZW0pKSByZXR1cm4gZmFsc2U7XG4gIGlmICghaXMuc3RyaW5nKGl0ZW0ua2V5KSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoIWhhcy5jYWxsKGl0ZW0sICd2YWx1ZScpKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFRPRE86IERvY3VtZW50IG1lXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtJbWFnZX1cbiAqL1xuXG5mdW5jdGlvbiBsb2FkSW1hZ2UoYXR0cnMsIGZuKXtcbiAgZm4gPSBmbiB8fCBmdW5jdGlvbigpe307XG4gIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgaW1nLm9uZXJyb3IgPSBlcnJvcihmbiwgJ2ZhaWxlZCB0byBsb2FkIHBpeGVsJywgaW1nKTtcbiAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCl7IGZuKCk7IH07XG4gIGltZy5zcmMgPSBhdHRycy5zcmM7XG4gIGltZy53aWR0aCA9IDE7XG4gIGltZy5oZWlnaHQgPSAxO1xuICByZXR1cm4gaW1nO1xufVxuXG4vKipcbiAqIFRPRE86IERvY3VtZW50IG1lXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcbiAqIEBwYXJhbSB7RWxlbWVudH0gaW1nXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBlcnJvcihmbiwgbWVzc2FnZSwgaW1nKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpe1xuICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIGVyci5ldmVudCA9IGU7XG4gICAgZXJyLnNvdXJjZSA9IGltZztcbiAgICBmbihlcnIpO1xuICB9O1xufVxuXG4vKipcbiAqIFJlbmRlciB0ZW1wbGF0ZSArIGxvY2FscyBpbnRvIGFuIGBhdHRyc2Agb2JqZWN0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHRlbXBsYXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbG9jYWxzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gcmVuZGVyKHRlbXBsYXRlLCBsb2NhbHMpe1xuICByZXR1cm4gZm9sZGwoZnVuY3Rpb24oYXR0cnMsIHZhbCwga2V5KSB7XG4gICAgYXR0cnNba2V5XSA9IHZhbC5yZXBsYWNlKC9cXHtcXHtcXCAqKFxcdyspXFwgKlxcfVxcfS9nLCBmdW5jdGlvbihfLCAkMSl7XG4gICAgICByZXR1cm4gbG9jYWxzWyQxXTtcbiAgICB9KTtcbiAgICByZXR1cm4gYXR0cnM7XG4gIH0sIHt9LCB0ZW1wbGF0ZS5hdHRycyk7XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG50cnkge1xuICB2YXIgdHlwZSA9IHJlcXVpcmUoJ3R5cGUnKTtcbn0gY2F0Y2ggKGVycikge1xuICB2YXIgdHlwZSA9IHJlcXVpcmUoJ2NvbXBvbmVudC10eXBlJyk7XG59XG5cbnZhciB0b0Z1bmN0aW9uID0gcmVxdWlyZSgndG8tZnVuY3Rpb24nKTtcblxuLyoqXG4gKiBIT1AgcmVmZXJlbmNlLlxuICovXG5cbnZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEl0ZXJhdGUgdGhlIGdpdmVuIGBvYmpgIGFuZCBpbnZva2UgYGZuKHZhbCwgaSlgXG4gKiBpbiBvcHRpb25hbCBjb250ZXh0IGBjdHhgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fE9iamVjdH0gb2JqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtPYmplY3R9IFtjdHhdXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBmbiwgY3R4KXtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcbiAgY3R4ID0gY3R4IHx8IHRoaXM7XG4gIHN3aXRjaCAodHlwZShvYmopKSB7XG4gICAgY2FzZSAnYXJyYXknOlxuICAgICAgcmV0dXJuIGFycmF5KG9iaiwgZm4sIGN0eCk7XG4gICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgIGlmICgnbnVtYmVyJyA9PSB0eXBlb2Ygb2JqLmxlbmd0aCkgcmV0dXJuIGFycmF5KG9iaiwgZm4sIGN0eCk7XG4gICAgICByZXR1cm4gb2JqZWN0KG9iaiwgZm4sIGN0eCk7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiBzdHJpbmcob2JqLCBmbiwgY3R4KTtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIHN0cmluZyBjaGFycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gb2JqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtPYmplY3R9IGN0eFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaW5nKG9iaiwgZm4sIGN0eCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai5sZW5ndGg7ICsraSkge1xuICAgIGZuLmNhbGwoY3R4LCBvYmouY2hhckF0KGkpLCBpKTtcbiAgfVxufVxuXG4vKipcbiAqIEl0ZXJhdGUgb2JqZWN0IGtleXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHhcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdChvYmosIGZuLCBjdHgpIHtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChoYXMuY2FsbChvYmosIGtleSkpIHtcbiAgICAgIGZuLmNhbGwoY3R4LCBrZXksIG9ialtrZXldKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBJdGVyYXRlIGFycmF5LWlzaC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gb2JqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtPYmplY3R9IGN0eFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gYXJyYXkob2JqLCBmbiwgY3R4KSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgKytpKSB7XG4gICAgZm4uY2FsbChjdHgsIG9ialtpXSwgaSk7XG4gIH1cbn1cbiIsIlxuLyoqXG4gKiB0b1N0cmluZyByZWYuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsKXtcbiAgc3dpdGNoICh0b1N0cmluZy5jYWxsKHZhbCkpIHtcbiAgICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6IHJldHVybiAnZnVuY3Rpb24nO1xuICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOiByZXR1cm4gJ2RhdGUnO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6IHJldHVybiAncmVnZXhwJztcbiAgICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOiByZXR1cm4gJ2FyZ3VtZW50cyc7XG4gICAgY2FzZSAnW29iamVjdCBBcnJheV0nOiByZXR1cm4gJ2FycmF5JztcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOiByZXR1cm4gJ3N0cmluZyc7XG4gIH1cblxuICBpZiAodmFsID09PSBudWxsKSByZXR1cm4gJ251bGwnO1xuICBpZiAodmFsID09PSB1bmRlZmluZWQpIHJldHVybiAndW5kZWZpbmVkJztcbiAgaWYgKHZhbCAmJiB2YWwubm9kZVR5cGUgPT09IDEpIHJldHVybiAnZWxlbWVudCc7XG4gIGlmICh2YWwgPT09IE9iamVjdCh2YWwpKSByZXR1cm4gJ29iamVjdCc7XG5cbiAgcmV0dXJuIHR5cGVvZiB2YWw7XG59O1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmVtb3ZlZFByb2R1Y3Q6IC9eWyBfXT9yZW1vdmVkWyBfXT9wcm9kdWN0WyBfXT8kL2ksXG4gIHZpZXdlZFByb2R1Y3Q6IC9eWyBfXT92aWV3ZWRbIF9dP3Byb2R1Y3RbIF9dPyQvaSxcbiAgdmlld2VkUHJvZHVjdENhdGVnb3J5OiAvXlsgX10/dmlld2VkWyBfXT9wcm9kdWN0WyBfXT9jYXRlZ29yeVsgX10/JC9pLFxuICBhZGRlZFByb2R1Y3Q6IC9eWyBfXT9hZGRlZFsgX10/cHJvZHVjdFsgX10/JC9pLFxuICBjb21wbGV0ZWRPcmRlcjogL15bIF9dP2NvbXBsZXRlZFsgX10/b3JkZXJbIF9dPyQvaSxcbiAgc3RhcnRlZE9yZGVyOiAvXlsgX10/c3RhcnRlZFsgX10/b3JkZXJbIF9dPyQvaSxcbiAgdXBkYXRlZE9yZGVyOiAvXlsgX10/dXBkYXRlZFsgX10/b3JkZXJbIF9dPyQvaSxcbiAgcmVmdW5kZWRPcmRlcjogL15bIF9dP3JlZnVuZGVkP1sgX10/b3JkZXJbIF9dPyQvaSxcbiAgdmlld2VkUHJvZHVjdERldGFpbHM6IC9eWyBfXT92aWV3ZWRbIF9dP3Byb2R1Y3RbIF9dP2RldGFpbHM/WyBfXT8kL2ksXG4gIGNsaWNrZWRQcm9kdWN0OiAvXlsgX10/Y2xpY2tlZFsgX10/cHJvZHVjdFsgX10/JC9pLFxuICB2aWV3ZWRQcm9tb3Rpb246IC9eWyBfXT92aWV3ZWRbIF9dP3Byb21vdGlvbj9bIF9dPyQvaSxcbiAgY2xpY2tlZFByb21vdGlvbjogL15bIF9dP2NsaWNrZWRbIF9dP3Byb21vdGlvbj9bIF9dPyQvaSxcbiAgdmlld2VkQ2hlY2tvdXRTdGVwOiAvXlsgX10/dmlld2VkWyBfXT9jaGVja291dFsgX10/c3RlcFsgX10/JC9pLFxuICBjb21wbGV0ZWRDaGVja291dFN0ZXA6IC9eWyBfXT9jb21wbGV0ZWRbIF9dP2NoZWNrb3V0WyBfXT9zdGVwWyBfXT8kL2lcbn07XG4iLCJcbi8qKlxuICogdG9TdHJpbmcuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gd2luZG93LkpTT05cbiAgPyBKU09OLnN0cmluZ2lmeVxuICA6IGZ1bmN0aW9uKF8peyByZXR1cm4gU3RyaW5nKF8pOyB9O1xuXG4vKipcbiAqIEV4cG9ydCBgZm10YFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZm10O1xuXG4vKipcbiAqIEZvcm1hdHRlcnNcbiAqL1xuXG5mbXQubyA9IHRvU3RyaW5nO1xuZm10LnMgPSBTdHJpbmc7XG5mbXQuZCA9IHBhcnNlSW50O1xuXG4vKipcbiAqIEZvcm1hdCB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHsuLi59IGFyZ3NcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZm10KHN0cil7XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICB2YXIgaiA9IDA7XG5cbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8lKFthLXpdKS9naSwgZnVuY3Rpb24oXywgZil7XG4gICAgcmV0dXJuIGZtdFtmXVxuICAgICAgPyBmbXRbZl0oYXJnc1tqKytdKVxuICAgICAgOiBfICsgZjtcbiAgfSk7XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgb25sb2FkID0gcmVxdWlyZSgnc2NyaXB0LW9ubG9hZCcpO1xudmFyIHRpY2sgPSByZXF1aXJlKCduZXh0LXRpY2snKTtcbnZhciB0eXBlID0gcmVxdWlyZSgndHlwZScpO1xuXG4vKipcbiAqIEV4cG9zZSBgbG9hZFNjcmlwdGAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbG9hZElmcmFtZShvcHRpb25zLCBmbil7XG4gIGlmICghb3B0aW9ucykgdGhyb3cgbmV3IEVycm9yKCdDYW50IGxvYWQgbm90aGluZy4uLicpO1xuXG4gIC8vIEFsbG93IGZvciB0aGUgc2ltcGxlc3QgY2FzZSwganVzdCBwYXNzaW5nIGEgYHNyY2Agc3RyaW5nLlxuICBpZiAoJ3N0cmluZycgPT0gdHlwZShvcHRpb25zKSkgb3B0aW9ucyA9IHsgc3JjIDogb3B0aW9ucyB9O1xuXG4gIHZhciBodHRwcyA9IGRvY3VtZW50LmxvY2F0aW9uLnByb3RvY29sID09PSAnaHR0cHM6JyB8fFxuICAgICAgICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2Nocm9tZS1leHRlbnNpb246JztcblxuICAvLyBJZiB5b3UgdXNlIHByb3RvY29sIHJlbGF0aXZlIFVSTHMsIHRoaXJkLXBhcnR5IHNjcmlwdHMgbGlrZSBHb29nbGVcbiAgLy8gQW5hbHl0aWNzIGJyZWFrIHdoZW4gdGVzdGluZyB3aXRoIGBmaWxlOmAgc28gdGhpcyBmaXhlcyB0aGF0LlxuICBpZiAob3B0aW9ucy5zcmMgJiYgb3B0aW9ucy5zcmMuaW5kZXhPZignLy8nKSA9PT0gMCkge1xuICAgIG9wdGlvbnMuc3JjID0gaHR0cHMgPyAnaHR0cHM6JyArIG9wdGlvbnMuc3JjIDogJ2h0dHA6JyArIG9wdGlvbnMuc3JjO1xuICB9XG5cbiAgLy8gQWxsb3cgdGhlbSB0byBwYXNzIGluIGRpZmZlcmVudCBVUkxzIGRlcGVuZGluZyBvbiB0aGUgcHJvdG9jb2wuXG4gIGlmIChodHRwcyAmJiBvcHRpb25zLmh0dHBzKSBvcHRpb25zLnNyYyA9IG9wdGlvbnMuaHR0cHM7XG4gIGVsc2UgaWYgKCFodHRwcyAmJiBvcHRpb25zLmh0dHApIG9wdGlvbnMuc3JjID0gb3B0aW9ucy5odHRwO1xuXG4gIC8vIE1ha2UgdGhlIGA8aWZyYW1lPmAgZWxlbWVudCBhbmQgaW5zZXJ0IGl0IGJlZm9yZSB0aGUgZmlyc3QgaWZyYW1lIG9uIHRoZVxuICAvLyBwYWdlLCB3aGljaCBpcyBndWFyYW50ZWVkIHRvIGV4aXN0IHNpbmNlIHRoaXMgSmF2YWlmcmFtZSBpcyBydW5uaW5nLlxuICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gIGlmcmFtZS5zcmMgPSBvcHRpb25zLnNyYztcbiAgaWZyYW1lLndpZHRoID0gb3B0aW9ucy53aWR0aCB8fCAxO1xuICBpZnJhbWUuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgfHwgMTtcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgLy8gSWYgd2UgaGF2ZSBhIGZuLCBhdHRhY2ggZXZlbnQgaGFuZGxlcnMsIGV2ZW4gaW4gSUUuIEJhc2VkIG9mZiBvZlxuICAvLyB0aGUgVGhpcmQtUGFydHkgSmF2YXNjcmlwdCBzY3JpcHQgbG9hZGluZyBleGFtcGxlOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdGhpcmRwYXJ0eWpzL3RoaXJkcGFydHlqcy1jb2RlL2Jsb2IvbWFzdGVyL2V4YW1wbGVzL3RlbXBsYXRlcy8wMi9sb2FkaW5nLWZpbGVzL2luZGV4Lmh0bWxcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZShmbikpIHtcbiAgICBvbmxvYWQoaWZyYW1lLCBmbik7XG4gIH1cblxuICB0aWNrKGZ1bmN0aW9uKCl7XG4gICAgLy8gQXBwZW5kIGFmdGVyIGV2ZW50IGxpc3RlbmVycyBhcmUgYXR0YWNoZWQgZm9yIElFLlxuICAgIHZhciBmaXJzdFNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtcbiAgICBmaXJzdFNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShpZnJhbWUsIGZpcnN0U2NyaXB0KTtcbiAgfSk7XG5cbiAgLy8gUmV0dXJuIHRoZSBpZnJhbWUgZWxlbWVudCBpbiBjYXNlIHRoZXkgd2FudCB0byBkbyBhbnl0aGluZyBzcGVjaWFsLCBsaWtlXG4gIC8vIGdpdmUgaXQgYW4gSUQgb3IgYXR0cmlidXRlcy5cbiAgcmV0dXJuIGlmcmFtZTtcbn07IiwiXG4vLyBodHRwczovL2dpdGh1Yi5jb20vdGhpcmRwYXJ0eWpzL3RoaXJkcGFydHlqcy1jb2RlL2Jsb2IvbWFzdGVyL2V4YW1wbGVzL3RlbXBsYXRlcy8wMi9sb2FkaW5nLWZpbGVzL2luZGV4Lmh0bWxcblxuLyoqXG4gKiBJbnZva2UgYGZuKGVycilgIHdoZW4gdGhlIGdpdmVuIGBlbGAgc2NyaXB0IGxvYWRzLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWwsIGZuKXtcbiAgcmV0dXJuIGVsLmFkZEV2ZW50TGlzdGVuZXJcbiAgICA/IGFkZChlbCwgZm4pXG4gICAgOiBhdHRhY2goZWwsIGZuKTtcbn07XG5cbi8qKlxuICogQWRkIGV2ZW50IGxpc3RlbmVyIHRvIGBlbGAsIGBmbigpYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gYWRkKGVsLCBmbil7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbihfLCBlKXsgZm4obnVsbCwgZSk7IH0sIGZhbHNlKTtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbihlKXtcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdzY3JpcHQgZXJyb3IgXCInICsgZWwuc3JjICsgJ1wiJyk7XG4gICAgZXJyLmV2ZW50ID0gZTtcbiAgICBmbihlcnIpO1xuICB9LCBmYWxzZSk7XG59XG5cbi8qKlxuICogQXR0YWNoIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBhdHRhY2goZWwsIGZuKXtcbiAgZWwuYXR0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGZ1bmN0aW9uKGUpe1xuICAgIGlmICghL2NvbXBsZXRlfGxvYWRlZC8udGVzdChlbC5yZWFkeVN0YXRlKSkgcmV0dXJuO1xuICAgIGZuKG51bGwsIGUpO1xuICB9KTtcbiAgZWwuYXR0YWNoRXZlbnQoJ29uZXJyb3InLCBmdW5jdGlvbihlKXtcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdmYWlsZWQgdG8gbG9hZCB0aGUgc2NyaXB0IFwiJyArIGVsLnNyYyArICdcIicpO1xuICAgIGVyci5ldmVudCA9IGUgfHwgd2luZG93LmV2ZW50O1xuICAgIGZuKGVycik7XG4gIH0pO1xufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIG9ubG9hZCA9IHJlcXVpcmUoJ3NjcmlwdC1vbmxvYWQnKTtcbnZhciB0aWNrID0gcmVxdWlyZSgnbmV4dC10aWNrJyk7XG52YXIgdHlwZSA9IHJlcXVpcmUoJ3R5cGUnKTtcblxuLyoqXG4gKiBFeHBvc2UgYGxvYWRTY3JpcHRgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxvYWRTY3JpcHQob3B0aW9ucywgZm4pe1xuICBpZiAoIW9wdGlvbnMpIHRocm93IG5ldyBFcnJvcignQ2FudCBsb2FkIG5vdGhpbmcuLi4nKTtcblxuICAvLyBBbGxvdyBmb3IgdGhlIHNpbXBsZXN0IGNhc2UsIGp1c3QgcGFzc2luZyBhIGBzcmNgIHN0cmluZy5cbiAgaWYgKCdzdHJpbmcnID09IHR5cGUob3B0aW9ucykpIG9wdGlvbnMgPSB7IHNyYyA6IG9wdGlvbnMgfTtcblxuICB2YXIgaHR0cHMgPSBkb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2h0dHBzOicgfHxcbiAgICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucHJvdG9jb2wgPT09ICdjaHJvbWUtZXh0ZW5zaW9uOic7XG5cbiAgLy8gSWYgeW91IHVzZSBwcm90b2NvbCByZWxhdGl2ZSBVUkxzLCB0aGlyZC1wYXJ0eSBzY3JpcHRzIGxpa2UgR29vZ2xlXG4gIC8vIEFuYWx5dGljcyBicmVhayB3aGVuIHRlc3Rpbmcgd2l0aCBgZmlsZTpgIHNvIHRoaXMgZml4ZXMgdGhhdC5cbiAgaWYgKG9wdGlvbnMuc3JjICYmIG9wdGlvbnMuc3JjLmluZGV4T2YoJy8vJykgPT09IDApIHtcbiAgICBvcHRpb25zLnNyYyA9IGh0dHBzID8gJ2h0dHBzOicgKyBvcHRpb25zLnNyYyA6ICdodHRwOicgKyBvcHRpb25zLnNyYztcbiAgfVxuXG4gIC8vIEFsbG93IHRoZW0gdG8gcGFzcyBpbiBkaWZmZXJlbnQgVVJMcyBkZXBlbmRpbmcgb24gdGhlIHByb3RvY29sLlxuICBpZiAoaHR0cHMgJiYgb3B0aW9ucy5odHRwcykgb3B0aW9ucy5zcmMgPSBvcHRpb25zLmh0dHBzO1xuICBlbHNlIGlmICghaHR0cHMgJiYgb3B0aW9ucy5odHRwKSBvcHRpb25zLnNyYyA9IG9wdGlvbnMuaHR0cDtcblxuICAvLyBNYWtlIHRoZSBgPHNjcmlwdD5gIGVsZW1lbnQgYW5kIGluc2VydCBpdCBiZWZvcmUgdGhlIGZpcnN0IHNjcmlwdCBvbiB0aGVcbiAgLy8gcGFnZSwgd2hpY2ggaXMgZ3VhcmFudGVlZCB0byBleGlzdCBzaW5jZSB0aGlzIEphdmFzY3JpcHQgaXMgcnVubmluZy5cbiAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICBzY3JpcHQuYXN5bmMgPSB0cnVlO1xuICBzY3JpcHQuc3JjID0gb3B0aW9ucy5zcmM7XG5cbiAgLy8gSWYgd2UgaGF2ZSBhIGZuLCBhdHRhY2ggZXZlbnQgaGFuZGxlcnMsIGV2ZW4gaW4gSUUuIEJhc2VkIG9mZiBvZlxuICAvLyB0aGUgVGhpcmQtUGFydHkgSmF2YXNjcmlwdCBzY3JpcHQgbG9hZGluZyBleGFtcGxlOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdGhpcmRwYXJ0eWpzL3RoaXJkcGFydHlqcy1jb2RlL2Jsb2IvbWFzdGVyL2V4YW1wbGVzL3RlbXBsYXRlcy8wMi9sb2FkaW5nLWZpbGVzL2luZGV4Lmh0bWxcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZShmbikpIHtcbiAgICBvbmxvYWQoc2NyaXB0LCBmbik7XG4gIH1cblxuICB0aWNrKGZ1bmN0aW9uKCl7XG4gICAgLy8gQXBwZW5kIGFmdGVyIGV2ZW50IGxpc3RlbmVycyBhcmUgYXR0YWNoZWQgZm9yIElFLlxuICAgIHZhciBmaXJzdFNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtcbiAgICBmaXJzdFNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzY3JpcHQsIGZpcnN0U2NyaXB0KTtcbiAgfSk7XG5cbiAgLy8gUmV0dXJuIHRoZSBzY3JpcHQgZWxlbWVudCBpbiBjYXNlIHRoZXkgd2FudCB0byBkbyBhbnl0aGluZyBzcGVjaWFsLCBsaWtlXG4gIC8vIGdpdmUgaXQgYW4gSUQgb3IgYXR0cmlidXRlcy5cbiAgcmV0dXJuIHNjcmlwdDtcbn07IiwiXG4vKipcbiAqIEV4cG9zZSBgdG9Ob0Nhc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdG9Ob0Nhc2U7XG5cblxuLyoqXG4gKiBUZXN0IHdoZXRoZXIgYSBzdHJpbmcgaXMgY2FtZWwtY2FzZS5cbiAqL1xuXG52YXIgaGFzU3BhY2UgPSAvXFxzLztcbnZhciBoYXNTZXBhcmF0b3IgPSAvW1xcV19dLztcblxuXG4vKipcbiAqIFJlbW92ZSBhbnkgc3RhcnRpbmcgY2FzZSBmcm9tIGEgYHN0cmluZ2AsIGxpa2UgY2FtZWwgb3Igc25ha2UsIGJ1dCBrZWVwXG4gKiBzcGFjZXMgYW5kIHB1bmN0dWF0aW9uIHRoYXQgbWF5IGJlIGltcG9ydGFudCBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHRvTm9DYXNlIChzdHJpbmcpIHtcbiAgaWYgKGhhc1NwYWNlLnRlc3Qoc3RyaW5nKSkgcmV0dXJuIHN0cmluZy50b0xvd2VyQ2FzZSgpO1xuICBpZiAoaGFzU2VwYXJhdG9yLnRlc3Qoc3RyaW5nKSkgcmV0dXJuIHVuc2VwYXJhdGUoc3RyaW5nKS50b0xvd2VyQ2FzZSgpO1xuICByZXR1cm4gdW5jYW1lbGl6ZShzdHJpbmcpLnRvTG93ZXJDYXNlKCk7XG59XG5cblxuLyoqXG4gKiBTZXBhcmF0b3Igc3BsaXR0ZXIuXG4gKi9cblxudmFyIHNlcGFyYXRvclNwbGl0dGVyID0gL1tcXFdfXSsoLnwkKS9nO1xuXG5cbi8qKlxuICogVW4tc2VwYXJhdGUgYSBgc3RyaW5nYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gdW5zZXBhcmF0ZSAoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShzZXBhcmF0b3JTcGxpdHRlciwgZnVuY3Rpb24gKG0sIG5leHQpIHtcbiAgICByZXR1cm4gbmV4dCA/ICcgJyArIG5leHQgOiAnJztcbiAgfSk7XG59XG5cblxuLyoqXG4gKiBDYW1lbGNhc2Ugc3BsaXR0ZXIuXG4gKi9cblxudmFyIGNhbWVsU3BsaXR0ZXIgPSAvKC4pKFtBLVpdKykvZztcblxuXG4vKipcbiAqIFVuLWNhbWVsY2FzZSBhIGBzdHJpbmdgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiB1bmNhbWVsaXplIChzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGNhbWVsU3BsaXR0ZXIsIGZ1bmN0aW9uIChtLCBwcmV2aW91cywgdXBwZXJzKSB7XG4gICAgcmV0dXJuIHByZXZpb3VzICsgJyAnICsgdXBwZXJzLnRvTG93ZXJDYXNlKCkuc3BsaXQoJycpLmpvaW4oJyAnKTtcbiAgfSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuLy8gRklYTUU6IEhhY2t5IHdvcmthcm91bmQgZm9yIER1b1xudmFyIGVhY2g7IHRyeSB7IGVhY2ggPSByZXF1aXJlKCdAbmRob3VsZS9lYWNoJyk7IH0gY2F0Y2goZSkgeyBlYWNoID0gcmVxdWlyZSgnZWFjaCcpOyB9XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBwcmVkaWNhdGUgZnVuY3Rpb24gcmV0dXJucyBgdHJ1ZWAgZm9yIGFsbCB2YWx1ZXMgaW4gYSBgY29sbGVjdGlvbmAuXG4gKiBDaGVja3Mgb3duZWQsIGVudW1lcmFibGUgdmFsdWVzIGFuZCBleGl0cyBlYXJseSB3aGVuIGBwcmVkaWNhdGVgIHJldHVybnNcbiAqIGBmYWxzZWAuXG4gKlxuICogQG5hbWUgZXZlcnlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gdXNlZCB0byB0ZXN0IHZhbHVlcy5cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBzZWFyY2guXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIGFsbCB2YWx1ZXMgcGFzc2VzIHRoZSBwcmVkaWNhdGUgdGVzdCwgb3RoZXJ3aXNlIGZhbHNlLlxuICogQGV4YW1wbGVcbiAqIHZhciBpc0V2ZW4gPSBmdW5jdGlvbihudW0pIHsgcmV0dXJuIG51bSAlIDIgPT09IDA7IH07XG4gKlxuICogZXZlcnkoaXNFdmVuLCBbXSk7IC8vID0+IHRydWVcbiAqIGV2ZXJ5KGlzRXZlbiwgWzEsIDJdKTsgLy8gPT4gZmFsc2VcbiAqIGV2ZXJ5KGlzRXZlbiwgWzIsIDQsIDZdKTsgLy8gPT4gdHJ1ZVxuICovXG5cbnZhciBldmVyeSA9IGZ1bmN0aW9uIGV2ZXJ5KHByZWRpY2F0ZSwgY29sbGVjdGlvbikge1xuICBpZiAodHlwZW9mIHByZWRpY2F0ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2BwcmVkaWNhdGVgIG11c3QgYmUgYSBmdW5jdGlvbiBidXQgd2FzIGEgJyArIHR5cGVvZiBwcmVkaWNhdGUpO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IHRydWU7XG5cbiAgZWFjaChmdW5jdGlvbih2YWwsIGtleSwgY29sbGVjdGlvbikge1xuICAgIHJlc3VsdCA9ICEhcHJlZGljYXRlKHZhbCwga2V5LCBjb2xsZWN0aW9uKTtcblxuICAgIC8vIEV4aXQgZWFybHlcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSwgY29sbGVjdGlvbik7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV2ZXJ5O1xuIiwiXG52YXIgaXNFbXB0eSA9IHJlcXVpcmUoJ2lzLWVtcHR5Jyk7XG5cbnRyeSB7XG4gIHZhciB0eXBlT2YgPSByZXF1aXJlKCd0eXBlJyk7XG59IGNhdGNoIChlKSB7XG4gIHZhciB0eXBlT2YgPSByZXF1aXJlKCdjb21wb25lbnQtdHlwZScpO1xufVxuXG5cbi8qKlxuICogVHlwZXMuXG4gKi9cblxudmFyIHR5cGVzID0gW1xuICAnYXJndW1lbnRzJyxcbiAgJ2FycmF5JyxcbiAgJ2Jvb2xlYW4nLFxuICAnZGF0ZScsXG4gICdlbGVtZW50JyxcbiAgJ2Z1bmN0aW9uJyxcbiAgJ251bGwnLFxuICAnbnVtYmVyJyxcbiAgJ29iamVjdCcsXG4gICdyZWdleHAnLFxuICAnc3RyaW5nJyxcbiAgJ3VuZGVmaW5lZCdcbl07XG5cblxuLyoqXG4gKiBFeHBvc2UgdHlwZSBjaGVja2Vycy5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mb3IgKHZhciBpID0gMCwgdHlwZTsgdHlwZSA9IHR5cGVzW2ldOyBpKyspIGV4cG9ydHNbdHlwZV0gPSBnZW5lcmF0ZSh0eXBlKTtcblxuXG4vKipcbiAqIEFkZCBhbGlhcyBmb3IgYGZ1bmN0aW9uYCBmb3Igb2xkIGJyb3dzZXJzLlxuICovXG5cbmV4cG9ydHMuZm4gPSBleHBvcnRzWydmdW5jdGlvbiddO1xuXG5cbi8qKlxuICogRXhwb3NlIGBlbXB0eWAgY2hlY2suXG4gKi9cblxuZXhwb3J0cy5lbXB0eSA9IGlzRW1wdHk7XG5cblxuLyoqXG4gKiBFeHBvc2UgYG5hbmAgY2hlY2suXG4gKi9cblxuZXhwb3J0cy5uYW4gPSBmdW5jdGlvbiAodmFsKSB7XG4gIHJldHVybiBleHBvcnRzLm51bWJlcih2YWwpICYmIHZhbCAhPSB2YWw7XG59O1xuXG5cbi8qKlxuICogR2VuZXJhdGUgYSB0eXBlIGNoZWNrZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIGdlbmVyYXRlICh0eXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gdHlwZU9mKHZhbHVlKTtcbiAgfTtcbn0iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcbnZhciBkb21pZnkgPSByZXF1aXJlKCdkb21pZnknKTtcbnZhciBlYWNoID0gcmVxdWlyZSgnZWFjaCcpO1xudmFyIGluY2x1ZGVzID0gcmVxdWlyZSgnaW5jbHVkZXMnKTtcblxuLyoqXG4gKiBNaXggaW4gZW1pdHRlci5cbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuZXctY2FwICovXG5FbWl0dGVyKGV4cG9ydHMpO1xuLyogZXNsaW50LWVuYWJsZSBuZXctY2FwICovXG5cbi8qKlxuICogQWRkIGEgbmV3IG9wdGlvbiB0byB0aGUgaW50ZWdyYXRpb24gYnkgYGtleWAgd2l0aCBkZWZhdWx0IGB2YWx1ZWAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge0ludGVncmF0aW9ufVxuICovXG5cbmV4cG9ydHMub3B0aW9uID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gIHRoaXMucHJvdG90eXBlLmRlZmF1bHRzW2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhIG5ldyBtYXBwaW5nIG9wdGlvbi5cbiAqXG4gKiBUaGlzIHdpbGwgY3JlYXRlIGEgbWV0aG9kIGBuYW1lYCB0aGF0IHdpbGwgcmV0dXJuIGEgbWFwcGluZyBmb3IgeW91IHRvIHVzZS5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0ludGVncmF0aW9ufVxuICogQGV4YW1wbGVcbiAqIEludGVncmF0aW9uKCdNeSBJbnRlZ3JhdGlvbicpXG4gKiAgIC5tYXBwaW5nKCdldmVudHMnKTtcbiAqXG4gKiBuZXcgTXlJbnRlZ3JhdGlvbigpLnRyYWNrKCdNeSBFdmVudCcpO1xuICpcbiAqIC50cmFjayA9IGZ1bmN0aW9uKHRyYWNrKXtcbiAqICAgdmFyIGV2ZW50cyA9IHRoaXMuZXZlbnRzKHRyYWNrLmV2ZW50KCkpO1xuICogICBlYWNoKGV2ZW50cywgc2VuZCk7XG4gKiAgfTtcbiAqL1xuXG5leHBvcnRzLm1hcHBpbmcgPSBmdW5jdGlvbihuYW1lKXtcbiAgdGhpcy5vcHRpb24obmFtZSwgW10pO1xuICB0aGlzLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKGtleSl7XG4gICAgcmV0dXJuIHRoaXMubWFwKHRoaXMub3B0aW9uc1tuYW1lXSwga2V5KTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IGdsb2JhbCB2YXJpYWJsZSBga2V5YCBvd25lZCBieSB0aGUgaW50ZWdyYXRpb24sIHdoaWNoIHdpbGwgYmVcbiAqIHVzZWQgdG8gdGVzdCB3aGV0aGVyIHRoZSBpbnRlZ3JhdGlvbiBpcyBhbHJlYWR5IG9uIHRoZSBwYWdlLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHtJbnRlZ3JhdGlvbn1cbiAqL1xuXG5leHBvcnRzLmdsb2JhbCA9IGZ1bmN0aW9uKGtleSl7XG4gIHRoaXMucHJvdG90eXBlLmdsb2JhbHMucHVzaChrZXkpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTWFyayB0aGUgaW50ZWdyYXRpb24gYXMgYXNzdW1pbmcgYW4gaW5pdGlhbCBwYWdldmlldywgc28gdG8gZGVmZXIgbG9hZGluZ1xuICogdGhlIHNjcmlwdCB1bnRpbCB0aGUgZmlyc3QgYHBhZ2VgIGNhbGwsIG5vb3AgdGhlIGZpcnN0IGBpbml0aWFsaXplYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICogQHJldHVybiB7SW50ZWdyYXRpb259XG4gKi9cblxuZXhwb3J0cy5hc3N1bWVzUGFnZXZpZXcgPSBmdW5jdGlvbigpe1xuICB0aGlzLnByb3RvdHlwZS5fYXNzdW1lc1BhZ2V2aWV3ID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE1hcmsgdGhlIGludGVncmF0aW9uIGFzIGJlaW5nIFwicmVhZHlcIiBvbmNlIGBsb2FkYCBpcyBjYWxsZWQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqIEByZXR1cm4ge0ludGVncmF0aW9ufVxuICovXG5cbmV4cG9ydHMucmVhZHlPbkxvYWQgPSBmdW5jdGlvbigpe1xuICB0aGlzLnByb3RvdHlwZS5fcmVhZHlPbkxvYWQgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTWFyayB0aGUgaW50ZWdyYXRpb24gYXMgYmVpbmcgXCJyZWFkeVwiIG9uY2UgYGluaXRpYWxpemVgIGlzIGNhbGxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICogQHJldHVybiB7SW50ZWdyYXRpb259XG4gKi9cblxuZXhwb3J0cy5yZWFkeU9uSW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMucHJvdG90eXBlLl9yZWFkeU9uSW5pdGlhbGl6ZSA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEZWZpbmUgYSB0YWcgdG8gYmUgbG9hZGVkLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKiBAcGFyYW0ge3N0cmluZ30gW25hbWU9J2xpYnJhcnknXSBBIG5pY2VuYW1lIGZvciB0aGUgdGFnLCBjb21tb25seSB1c2VkIGluXG4gKiAjbG9hZC4gSGVscGZ1bCB3aGVuIHRoZSBpbnRlZ3JhdGlvbiBoYXMgbXVsdGlwbGUgdGFncyBhbmQgeW91IG5lZWQgYSB3YXkgdG9cbiAqIHNwZWNpZnkgd2hpY2ggb2YgdGhlIHRhZ3MgeW91IHdhbnQgdG8gbG9hZCBhdCBhIGdpdmVuIHRpbWUuXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIERPTSB0YWcgYXMgc3RyaW5nIG9yIFVSTC5cbiAqIEByZXR1cm4ge0ludGVncmF0aW9ufVxuICovXG5cbmV4cG9ydHMudGFnID0gZnVuY3Rpb24obmFtZSwgdGFnKXtcbiAgaWYgKHRhZyA9PSBudWxsKSB7XG4gICAgdGFnID0gbmFtZTtcbiAgICBuYW1lID0gJ2xpYnJhcnknO1xuICB9XG4gIHRoaXMucHJvdG90eXBlLnRlbXBsYXRlc1tuYW1lXSA9IG9iamVjdGlmeSh0YWcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2l2ZW4gYSBzdHJpbmcsIGdpdmUgYmFjayBET00gYXR0cmlidXRlcy5cbiAqXG4gKiBEbyBpdCBpbiBhIHdheSB3aGVyZSB0aGUgYnJvd3NlciBkb2Vzbid0IGxvYWQgaW1hZ2VzIG9yIGlmcmFtZXMuIEl0IHR1cm5zXG4gKiBvdXQgZG9taWZ5IHdpbGwgbG9hZCBpbWFnZXMvaWZyYW1lcyBiZWNhdXNlIHdoZW5ldmVyIHlvdSBjb25zdHJ1Y3QgdGhvc2VcbiAqIERPTSBlbGVtZW50cywgdGhlIGJyb3dzZXIgaW1tZWRpYXRlbHkgbG9hZHMgdGhlbS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBvYmplY3RpZnkoc3RyKSB7XG4gIC8vIHJlcGxhY2UgYHNyY2Agd2l0aCBgZGF0YS1zcmNgIHRvIHByZXZlbnQgaW1hZ2UgbG9hZGluZ1xuICBzdHIgPSBzdHIucmVwbGFjZSgnIHNyYz1cIicsICcgZGF0YS1zcmM9XCInKTtcblxuICB2YXIgZWwgPSBkb21pZnkoc3RyKTtcbiAgdmFyIGF0dHJzID0ge307XG5cbiAgZWFjaChlbC5hdHRyaWJ1dGVzLCBmdW5jdGlvbihhdHRyKXtcbiAgICAvLyB0aGVuIHJlcGxhY2UgaXQgYmFja1xuICAgIHZhciBuYW1lID0gYXR0ci5uYW1lID09PSAnZGF0YS1zcmMnID8gJ3NyYycgOiBhdHRyLm5hbWU7XG4gICAgaWYgKCFpbmNsdWRlcyhhdHRyLm5hbWUgKyAnPScsIHN0cikpIHJldHVybjtcbiAgICBhdHRyc1tuYW1lXSA9IGF0dHIudmFsdWU7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgdHlwZTogZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpLFxuICAgIGF0dHJzOiBhdHRyc1xuICB9O1xufVxuIiwiXG4vKipcbiAqIEV4cG9zZSBgcGFyc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG5cbi8qKlxuICogVGVzdHMgZm9yIGJyb3dzZXIgc3VwcG9ydC5cbiAqL1xuXG52YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4vLyBTZXR1cFxuZGl2LmlubmVySFRNTCA9ICcgIDxsaW5rLz48dGFibGU+PC90YWJsZT48YSBocmVmPVwiL2FcIj5hPC9hPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIi8+Jztcbi8vIE1ha2Ugc3VyZSB0aGF0IGxpbmsgZWxlbWVudHMgZ2V0IHNlcmlhbGl6ZWQgY29ycmVjdGx5IGJ5IGlubmVySFRNTFxuLy8gVGhpcyByZXF1aXJlcyBhIHdyYXBwZXIgZWxlbWVudCBpbiBJRVxudmFyIGlubmVySFRNTEJ1ZyA9ICFkaXYuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpbmsnKS5sZW5ndGg7XG5kaXYgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogV3JhcCBtYXAgZnJvbSBqcXVlcnkuXG4gKi9cblxudmFyIG1hcCA9IHtcbiAgbGVnZW5kOiBbMSwgJzxmaWVsZHNldD4nLCAnPC9maWVsZHNldD4nXSxcbiAgdHI6IFsyLCAnPHRhYmxlPjx0Ym9keT4nLCAnPC90Ym9keT48L3RhYmxlPiddLFxuICBjb2w6IFsyLCAnPHRhYmxlPjx0Ym9keT48L3Rib2R5Pjxjb2xncm91cD4nLCAnPC9jb2xncm91cD48L3RhYmxlPiddLFxuICAvLyBmb3Igc2NyaXB0L2xpbmsvc3R5bGUgdGFncyB0byB3b3JrIGluIElFNi04LCB5b3UgaGF2ZSB0byB3cmFwXG4gIC8vIGluIGEgZGl2IHdpdGggYSBub24td2hpdGVzcGFjZSBjaGFyYWN0ZXIgaW4gZnJvbnQsIGhhIVxuICBfZGVmYXVsdDogaW5uZXJIVE1MQnVnID8gWzEsICdYPGRpdj4nLCAnPC9kaXY+J10gOiBbMCwgJycsICcnXVxufTtcblxubWFwLnRkID1cbm1hcC50aCA9IFszLCAnPHRhYmxlPjx0Ym9keT48dHI+JywgJzwvdHI+PC90Ym9keT48L3RhYmxlPiddO1xuXG5tYXAub3B0aW9uID1cbm1hcC5vcHRncm91cCA9IFsxLCAnPHNlbGVjdCBtdWx0aXBsZT1cIm11bHRpcGxlXCI+JywgJzwvc2VsZWN0PiddO1xuXG5tYXAudGhlYWQgPVxubWFwLnRib2R5ID1cbm1hcC5jb2xncm91cCA9XG5tYXAuY2FwdGlvbiA9XG5tYXAudGZvb3QgPSBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXTtcblxubWFwLnBvbHlsaW5lID1cbm1hcC5lbGxpcHNlID1cbm1hcC5wb2x5Z29uID1cbm1hcC5jaXJjbGUgPVxubWFwLnRleHQgPVxubWFwLmxpbmUgPVxubWFwLnBhdGggPVxubWFwLnJlY3QgPVxubWFwLmcgPSBbMSwgJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIj4nLCc8L3N2Zz4nXTtcblxuLyoqXG4gKiBQYXJzZSBgaHRtbGAgYW5kIHJldHVybiBhIERPTSBOb2RlIGluc3RhbmNlLCB3aGljaCBjb3VsZCBiZSBhIFRleHROb2RlLFxuICogSFRNTCBET00gTm9kZSBvZiBzb21lIGtpbmQgKDxkaXY+IGZvciBleGFtcGxlKSwgb3IgYSBEb2N1bWVudEZyYWdtZW50XG4gKiBpbnN0YW5jZSwgZGVwZW5kaW5nIG9uIHRoZSBjb250ZW50cyBvZiB0aGUgYGh0bWxgIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbCAtIEhUTUwgc3RyaW5nIHRvIFwiZG9taWZ5XCJcbiAqIEBwYXJhbSB7RG9jdW1lbnR9IGRvYyAtIFRoZSBgZG9jdW1lbnRgIGluc3RhbmNlIHRvIGNyZWF0ZSB0aGUgTm9kZSBmb3JcbiAqIEByZXR1cm4ge0RPTU5vZGV9IHRoZSBUZXh0Tm9kZSwgRE9NIE5vZGUsIG9yIERvY3VtZW50RnJhZ21lbnQgaW5zdGFuY2VcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKGh0bWwsIGRvYykge1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIGh0bWwpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0cmluZyBleHBlY3RlZCcpO1xuXG4gIC8vIGRlZmF1bHQgdG8gdGhlIGdsb2JhbCBgZG9jdW1lbnRgIG9iamVjdFxuICBpZiAoIWRvYykgZG9jID0gZG9jdW1lbnQ7XG5cbiAgLy8gdGFnIG5hbWVcbiAgdmFyIG0gPSAvPChbXFx3Ol0rKS8uZXhlYyhodG1sKTtcbiAgaWYgKCFtKSByZXR1cm4gZG9jLmNyZWF0ZVRleHROb2RlKGh0bWwpO1xuXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTsgLy8gUmVtb3ZlIGxlYWRpbmcvdHJhaWxpbmcgd2hpdGVzcGFjZVxuXG4gIHZhciB0YWcgPSBtWzFdO1xuXG4gIC8vIGJvZHkgc3VwcG9ydFxuICBpZiAodGFnID09ICdib2R5Jykge1xuICAgIHZhciBlbCA9IGRvYy5jcmVhdGVFbGVtZW50KCdodG1sJyk7XG4gICAgZWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWwubGFzdENoaWxkKTtcbiAgfVxuXG4gIC8vIHdyYXAgbWFwXG4gIHZhciB3cmFwID0gbWFwW3RhZ10gfHwgbWFwLl9kZWZhdWx0O1xuICB2YXIgZGVwdGggPSB3cmFwWzBdO1xuICB2YXIgcHJlZml4ID0gd3JhcFsxXTtcbiAgdmFyIHN1ZmZpeCA9IHdyYXBbMl07XG4gIHZhciBlbCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZWwuaW5uZXJIVE1MID0gcHJlZml4ICsgaHRtbCArIHN1ZmZpeDtcbiAgd2hpbGUgKGRlcHRoLS0pIGVsID0gZWwubGFzdENoaWxkO1xuXG4gIC8vIG9uZSBlbGVtZW50XG4gIGlmIChlbC5maXJzdENoaWxkID09IGVsLmxhc3RDaGlsZCkge1xuICAgIHJldHVybiBlbC5yZW1vdmVDaGlsZChlbC5maXJzdENoaWxkKTtcbiAgfVxuXG4gIC8vIHNldmVyYWwgZWxlbWVudHNcbiAgdmFyIGZyYWdtZW50ID0gZG9jLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgd2hpbGUgKGVsLmZpcnN0Q2hpbGQpIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChlbC5yZW1vdmVDaGlsZChlbC5maXJzdENoaWxkKSk7XG4gIH1cblxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgY2xlYXJBamF4ID0gcmVxdWlyZSgnY2xlYXItYWpheCcpO1xudmFyIGNsZWFyVGltZW91dHMgPSByZXF1aXJlKCdjbGVhci10aW1lb3V0cycpO1xudmFyIGNsZWFySW50ZXJ2YWxzID0gcmVxdWlyZSgnY2xlYXItaW50ZXJ2YWxzJyk7XG52YXIgY2xlYXJMaXN0ZW5lcnMgPSByZXF1aXJlKCdjbGVhci1saXN0ZW5lcnMnKTtcbnZhciBjbGVhckdsb2JhbHMgPSByZXF1aXJlKCdjbGVhci1nbG9iYWxzJyk7XG52YXIgY2xlYXJJbWFnZXMgPSByZXF1aXJlKCdjbGVhci1pbWFnZXMnKTtcbnZhciBjbGVhclNjcmlwdHMgPSByZXF1aXJlKCdjbGVhci1zY3JpcHRzJyk7XG52YXIgY2xlYXJDb29raWVzID0gcmVxdWlyZSgnY2xlYXItY29va2llcycpO1xuXG4vKipcbiAqIFJlc2V0IGluaXRpYWwgc3RhdGUuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIGNsZWFyQWpheCgpO1xuICBjbGVhclRpbWVvdXRzKCk7XG4gIGNsZWFySW50ZXJ2YWxzKCk7XG4gIGNsZWFyTGlzdGVuZXJzKCk7XG4gIGNsZWFyR2xvYmFscygpO1xuICBjbGVhckltYWdlcygpO1xuICBjbGVhclNjcmlwdHMoKTtcbiAgY2xlYXJDb29raWVzKCk7XG59OyIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBlYWNoID0gcmVxdWlyZSgnZWFjaCcpO1xuXG4vKipcbiAqIE9yaWdpbmFsIHNlbmQgbWV0aG9kLlxuICovXG5cbnZhciBzZW5kID0gWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmQ7XG5cbi8qKlxuICogUmVxdWVzdHMgbWFkZS5cbiAqL1xuXG52YXIgcmVxdWVzdHMgPSBbXTtcblxuLyoqXG4gKiBDbGVhciBhbGwgYWN0aXZlIEFKQVggcmVxdWVzdHMuXG4gKiBcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgZWFjaChyZXF1ZXN0cywgZnVuY3Rpb24ocmVxdWVzdCl7XG4gICAgdHJ5IHtcbiAgICAgIHJlcXVlc3Qub25sb2FkID0gbm9vcDtcbiAgICAgIHJlcXVlc3Qub25lcnJvciA9IG5vb3A7XG4gICAgICByZXF1ZXN0Lm9uYWJvcnQgPSBub29wO1xuICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH0pO1xuICByZXF1ZXN0cy5sZW5ndGggPSBbXTtcbn07XG5cbi8qKlxuICogQ2FwdHVyZSBBSkFYIHJlcXVlc3RzLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24oKXtcbiAgWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbigpe1xuICAgIHJlcXVlc3RzLnB1c2godGhpcyk7XG4gICAgcmV0dXJuIHNlbmQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn07XG5cbi8qKlxuICogUmVzZXQgYFhNTEh0dHBSZXF1ZXN0YCBiYWNrIHRvIG5vcm1hbC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMudW5iaW5kID0gZnVuY3Rpb24oKXtcbiAgWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBzZW5kO1xufTtcblxuLyoqXG4gKiBBdXRvbWF0aWNhbGx5IGJpbmQuXG4gKi9cblxuZXhwb3J0cy5iaW5kKCk7XG5cbi8qKlxuICogTm9vcC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBub29wKCl7fSIsIlxuLyoqXG4gKiBQcmV2aW91c1xuICovXG5cbnZhciBwcmV2ID0gMDtcblxuLyoqXG4gKiBOb29wXG4gKi9cblxudmFyIG5vb3AgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKlxuICogQ2xlYXIgYWxsIHRpbWVvdXRzXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0bXAsIGk7XG4gIHRtcCA9IGkgPSBzZXRUaW1lb3V0KG5vb3ApO1xuICB3aGlsZSAocHJldiA8IGkpIGNsZWFyVGltZW91dChpLS0pO1xuICBwcmV2ID0gdG1wO1xufTtcbiIsIlxuLyoqXG4gKiBQcmV2XG4gKi9cblxudmFyIHByZXYgPSAwO1xuXG4vKipcbiAqIE5vb3BcbiAqL1xuXG52YXIgbm9vcCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuLyoqXG4gKiBDbGVhciBhbGwgaW50ZXJ2YWxzLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgdG1wLCBpO1xuICB0bXAgPSBpID0gc2V0SW50ZXJ2YWwobm9vcCk7XG4gIHdoaWxlIChwcmV2IDwgaSkgY2xlYXJJbnRlcnZhbChpLS0pO1xuICBwcmV2ID0gdG1wO1xufTtcbiIsIlxuLyoqXG4gKiBXaW5kb3cgZXZlbnQgbGlzdGVuZXJzLlxuICovXG5cbnZhciBsaXN0ZW5lcnMgPSBbXTtcblxuLyoqXG4gKiBPcmlnaW5hbCB3aW5kb3cgZnVuY3Rpb25zLlxuICovXG5cbnZhciBvbiA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ2F0dGFjaEV2ZW50JztcbnZhciBvZmYgPSB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciA/ICdyZW1vdmVFdmVudExpc3RlbmVyJyA6ICdkZXRhY2hFdmVudCc7XG52YXIgb25GbiA9IHdpbmRvd1tvbl07XG52YXIgb2ZmRm4gPSB3aW5kb3dbb2ZmXTtcblxuLyoqXG4gKiBDbGVhciBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgaSA9IGxpc3RlbmVycy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICB3aW5kb3dbb25dLmFwcGx5XG4gICAgICA/IHdpbmRvd1tvbl0uYXBwbHkod2luZG93LCBsaXN0ZW5lcnNbaV0pXG4gICAgICA6IHdpbmRvd1tvbl0obGlzdGVuZXJzW2ldWzBdLCBsaXN0ZW5lcnNbaV1bMV0pOyAvLyBJRVxuICB9XG4gIGxpc3RlbmVycy5sZW5ndGggPSAwO1xufTtcblxuLyoqXG4gKiBXcmFwIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyIGFuZCB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lclxuICogdG8gYmUgYWJsZSB0byBjbGVhbnVwIGFsbCBldmVudCBsaXN0ZW5lcnMgZm9yIHRlc3RpbmcuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmJpbmQgPSBmdW5jdGlvbigpe1xuICB3aW5kb3dbb25dID0gZnVuY3Rpb24oKXtcbiAgICBsaXN0ZW5lcnMucHVzaChhcmd1bWVudHMpO1xuICAgIHJldHVybiBvbkZuLmFwcGx5XG4gICAgICA/IG9uRm4uYXBwbHkod2luZG93LCBhcmd1bWVudHMpXG4gICAgICA6IG9uRm4oYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pOyAvLyBJRVxuICB9O1xuXG4gIHdpbmRvd1tvZmZdID0gZnVuY3Rpb24obmFtZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpe1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgaWYgKG5hbWUgIT09IGxpc3RlbmVyc1tpXVswXSkgY29udGludWU7XG4gICAgICBpZiAobGlzdGVuZXIgIT09IGxpc3RlbmVyc1tpXVsxXSkgY29udGludWU7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgdXNlQ2FwdHVyZSAhPT0gbGlzdGVuZXJzW2ldWzJdKSBjb250aW51ZTtcbiAgICAgIGxpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG9mZkZuLmFwcGx5XG4gICAgICA/IG9mZkZuLmFwcGx5KHdpbmRvdywgYXJndW1lbnRzKVxuICAgICAgOiBvZmZGbihhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSk7IC8vIElFXG4gIH07XG59O1xuXG5cbi8qKlxuICogUmVzZXQgd2luZG93IGJhY2sgdG8gbm9ybWFsLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy51bmJpbmQgPSBmdW5jdGlvbigpe1xuICBsaXN0ZW5lcnMubGVuZ3RoID0gMDtcbiAgd2luZG93W29uXSA9IG9uRm47XG4gIHdpbmRvd1tvZmZdID0gb2ZmRm47XG59O1xuXG4vKipcbiAqIEF1dG9tYXRpY2FsbHkgb3ZlcnJpZGUuXG4gKi9cblxuZXhwb3J0cy5iaW5kKCk7IiwiXG4vKipcbiAqIE9iamVjdHMgd2Ugd2FudCB0byBrZWVwIHRyYWNrIG9mIGluaXRpYWwgcHJvcGVydGllcyBmb3IuXG4gKi9cblxudmFyIGdsb2JhbHMgPSB7XG4gICd3aW5kb3cnOiB7fSxcbiAgJ2RvY3VtZW50Jzoge30sXG4gICdYTUxIdHRwUmVxdWVzdCc6IHt9XG59O1xuXG4vKipcbiAqIENhcHR1cmUgaW5pdGlhbCBzdGF0ZSBvZiBgd2luZG93YC5cbiAqXG4gKiBOb3RlLCBgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJgIGlzIG92ZXJyaXR0ZW4gYWxyZWFkeSxcbiAqIGZyb20gYGNsZWFyTGlzdGVuZXJzYC4gQnV0IHRoaXMgaXMgZGVzaXJlZCBiZWhhdmlvci5cbiAqL1xuXG5nbG9iYWxzLndpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyID0gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXI7XG5nbG9iYWxzLndpbmRvdy5hZGRFdmVudExpc3RlbmVyID0gd2luZG93LmFkZEV2ZW50TGlzdGVuZXI7XG5nbG9iYWxzLndpbmRvdy5zZXRUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQ7XG5nbG9iYWxzLndpbmRvdy5zZXRJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbDtcbmdsb2JhbHMud2luZG93Lm9uZXJyb3IgPSBudWxsO1xuZ2xvYmFscy53aW5kb3cub25sb2FkID0gbnVsbDtcblxuLyoqXG4gKiBDYXB0dXJlIGluaXRpYWwgc3RhdGUgb2YgYGRvY3VtZW50YC5cbiAqL1xuXG5nbG9iYWxzLmRvY3VtZW50LndyaXRlID0gZG9jdW1lbnQud3JpdGU7XG5nbG9iYWxzLmRvY3VtZW50LmFwcGVuZENoaWxkID0gZG9jdW1lbnQuYXBwZW5kQ2hpbGQ7XG5nbG9iYWxzLmRvY3VtZW50LnJlbW92ZUNoaWxkID0gZG9jdW1lbnQucmVtb3ZlQ2hpbGQ7XG5cbi8qKlxuICogQ2FwdHVyZSB0aGUgaW5pdGlhbCBzdGF0ZSBvZiBgWE1MSHR0cFJlcXVlc3RgLlxuICovXG5cbmlmICgndW5kZWZpbmVkJyAhPSB0eXBlb2YgWE1MSHR0cFJlcXVlc3QpIHtcbiAgZ2xvYmFscy5YTUxIdHRwUmVxdWVzdC5vcGVuID0gWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLm9wZW47XG59XG5cbi8qKlxuICogUmVzZXQgaW5pdGlhbCBzdGF0ZS5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgY29weShnbG9iYWxzLndpbmRvdywgd2luZG93KTtcbiAgY29weShnbG9iYWxzLlhNTEh0dHBSZXF1ZXN0LCBYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUpO1xuICBjb3B5KGdsb2JhbHMuZG9jdW1lbnQsIGRvY3VtZW50KTtcbn07XG5cbi8qKlxuICogUmVzZXQgcHJvcGVydGllcyBvbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZVxuICogQHBhcmFtIHtPYmplY3R9IHRhcmdldFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29weShzb3VyY2UsIHRhcmdldCl7XG4gIGZvciAodmFyIG5hbWUgaW4gc291cmNlKSB7XG4gICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgdGFyZ2V0W25hbWVdID0gc291cmNlW25hbWVdO1xuICAgIH1cbiAgfVxufSIsIlxuLyoqXG4gKiBDcmVhdGVkIGltYWdlcy5cbiAqL1xuXG52YXIgaW1hZ2VzID0gW107XG5cbi8qKlxuICogS2VlcCB0cmFjayBvZiBvcmlnaW5hbCBgSW1hZ2VgLlxuICovXG5cbnZhciBPcmlnaW5hbCA9IHdpbmRvdy5JbWFnZTtcblxuLyoqXG4gKiBJbWFnZSBvdmVycmlkZSB0aGF0IGtlZXBzIHRyYWNrIG9mIGltYWdlcy5cbiAqXG4gKiBDYXJlZnVsIHRob3VnaCwgYGltZyBpbnN0YW5jZSBPdmVycmlkZWAgaXNuJ3QgdHJ1ZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBPdmVycmlkZSgpIHtcbiAgdmFyIGltZyA9IG5ldyBPcmlnaW5hbDtcbiAgaW1hZ2VzLnB1c2goaW1nKTtcbiAgcmV0dXJuIGltZztcbn1cblxuLyoqXG4gKiBDbGVhciBgb25sb2FkYCBmb3IgZWFjaCBpbWFnZS5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBub29wID0gZnVuY3Rpb24oKXt9O1xuICBmb3IgKHZhciBpID0gMCwgbiA9IGltYWdlcy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICBpbWFnZXNbaV0ub25sb2FkID0gbm9vcDtcbiAgfVxuICBpbWFnZXMubGVuZ3RoID0gMDtcbn07XG5cbi8qKlxuICogT3ZlcnJpZGUgYHdpbmRvdy5JbWFnZWAgdG8ga2VlcCB0cmFjayBvZiBpbWFnZXMsXG4gKiBzbyB3ZSBjYW4gY2xlYXIgYG9ubG9hZGAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmJpbmQgPSBmdW5jdGlvbigpe1xuICB3aW5kb3cuSW1hZ2UgPSBPdmVycmlkZTtcbn07XG5cbi8qKlxuICogU2V0IGB3aW5kb3cuSW1hZ2VgIGJhY2sgdG8gbm9ybWFsLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy51bmJpbmQgPSBmdW5jdGlvbigpe1xuICB3aW5kb3cuSW1hZ2UgPSBPcmlnaW5hbDtcbiAgaW1hZ2VzLmxlbmd0aCA9IDA7XG59O1xuXG4vKipcbiAqIEF1dG9tYXRpY2FsbHkgb3ZlcnJpZGUuXG4gKi9cblxuZXhwb3J0cy5iaW5kKCk7IiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGluZGV4T2YgPSByZXF1aXJlKCdpbmRleG9mJyk7XG52YXIgcXVlcnkgPSByZXF1aXJlKCdxdWVyeScpO1xudmFyIGVhY2ggPSByZXF1aXJlKCdlYWNoJyk7XG5cbi8qKlxuICogSW5pdGlhbCBzY3JpcHRzLlxuICovXG5cbnZhciBpbml0aWFsU2NyaXB0cyA9IFtdO1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgc2NyaXB0cyBub3QgaW5pdGlhbGx5IHByZXNlbnQuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW21hdGNoXSBPbmx5IHJlbW92ZSBvbmVzIHRoYXQgcmV0dXJuIHRydWVcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obWF0Y2gpe1xuICBtYXRjaCA9IG1hdGNoIHx8IHNhdWNlbGFicztcbiAgdmFyIGZpbmFsU2NyaXB0cyA9IHF1ZXJ5LmFsbCgnc2NyaXB0Jyk7XG4gIGVhY2goZmluYWxTY3JpcHRzLCBmdW5jdGlvbihzY3JpcHQpe1xuICAgIGlmICgtMSAhPSBpbmRleE9mKGluaXRpYWxTY3JpcHRzLCBzY3JpcHQpKSByZXR1cm47XG4gICAgaWYgKCFzY3JpcHQucGFyZW50Tm9kZSkgcmV0dXJuO1xuICAgIGlmICghbWF0Y2goc2NyaXB0KSkgcmV0dXJuO1xuICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBDYXB0dXJlIGluaXRpYWwgc2NyaXB0cywgdGhlIG9uZXMgbm90IHRvIHJlbW92ZS5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uKHNjcmlwdHMpe1xuICBpbml0aWFsU2NyaXB0cyA9IHNjcmlwdHMgfHwgcXVlcnkuYWxsKCdzY3JpcHQnKTtcbn07XG5cbi8qKlxuICogRGVmYXVsdCBtYXRjaGluZyBmdW5jdGlvbiwgaWdub3JlcyBzYXVjZWxhYnMganNvbnAgc2NyaXB0cy5cbiAqXG4gKiBAcGFyYW0ge1NjcmlwdH0gc2NyaXB0XG4gKiBAYXBpIHByaXZhdGVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gc2F1Y2VsYWJzKHNjcmlwdCkge1xuICByZXR1cm4gIXNjcmlwdC5zcmMubWF0Y2goL2xvY2FsdHVubmVsXFwubWVcXC9zYXVjZWxhYnN8XFwvZHVvdGVzdC8pO1xufTtcblxuLyoqXG4gKiBBdXRvbWF0aWNhbGx5IGJpbmQuXG4gKi9cblxuZXhwb3J0cy5iaW5kKCk7XG4iLCJmdW5jdGlvbiBvbmUoc2VsZWN0b3IsIGVsKSB7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbn1cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VsZWN0b3IsIGVsKXtcbiAgZWwgPSBlbCB8fCBkb2N1bWVudDtcbiAgcmV0dXJuIG9uZShzZWxlY3RvciwgZWwpO1xufTtcblxuZXhwb3J0cy5hbGwgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICByZXR1cm4gZWwucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59O1xuXG5leHBvcnRzLmVuZ2luZSA9IGZ1bmN0aW9uKG9iail7XG4gIGlmICghb2JqLm9uZSkgdGhyb3cgbmV3IEVycm9yKCcub25lIGNhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIGlmICghb2JqLmFsbCkgdGhyb3cgbmV3IEVycm9yKCcuYWxsIGNhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIG9uZSA9IG9iai5vbmU7XG4gIGV4cG9ydHMuYWxsID0gb2JqLmFsbDtcbiAgcmV0dXJuIGV4cG9ydHM7XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGNvb2tpZSA9IHJlcXVpcmUoJ2Nvb2tpZScpO1xuXG4vKipcbiAqIENsZWFyIGNvb2tpZXMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgY29va2llcyA9IGNvb2tpZSgpO1xuICBmb3IgKHZhciBuYW1lIGluIGNvb2tpZXMpIHtcbiAgICBjb29raWUobmFtZSwgJycsIHsgcGF0aDogJy8nIH0pO1xuICB9XG59OyIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBpbmRleE9mID0gcmVxdWlyZSgnaW5kZXhvZicpO1xudmFyIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xudmFyIGRvbWlmeSA9IHJlcXVpcmUoJ2RvbWlmeScpO1xudmFyIHN0dWIgPSByZXF1aXJlKCdzdHViJyk7XG52YXIgZWFjaCA9IHJlcXVpcmUoJ2VhY2gnKTtcbnZhciBrZXlzID0gcmVxdWlyZSgna2V5cycpO1xudmFyIGZtdCA9IHJlcXVpcmUoJ2ZtdCcpO1xudmFyIHNweSA9IHJlcXVpcmUoJ3NweScpO1xudmFyIGlzID0gcmVxdWlyZSgnaXMnKTtcblxuLyoqXG4gKiBFeHBvc2UgYHBsdWdpbmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBwbHVnaW47XG5cbi8qKlxuICogSW50ZWdyYXRpb24gdGVzdGluZyBwbHVnaW4uXG4gKlxuICogQHBhcmFtIHtBbmFseXRpY3N9IGFuYWx5dGljc1xuICovXG5cbmZ1bmN0aW9uIHBsdWdpbihhbmFseXRpY3MpIHtcbiAgYW5hbHl0aWNzLnNwaWVzID0gW107XG5cbiAgLyoqXG4gICAqIFNweSBvbiBhIGBtZXRob2RgIG9mIGhvc3QgYG9iamVjdGAuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICAgKiBAcmV0dXJuIHtBbmFseXRpY3N9XG4gICAqL1xuXG4gIGFuYWx5dGljcy5zcHkgPSBmdW5jdGlvbihvYmplY3QsIG1ldGhvZCl7XG4gICAgdmFyIHMgPSBzcHkob2JqZWN0LCBtZXRob2QpO1xuICAgIHRoaXMuc3BpZXMucHVzaChzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogU3R1YiBhIGBtZXRob2RgIG9mIGhvc3QgYG9iamVjdGAuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBBIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBpbiBwbGFjZSBvZiB0aGUgc3R1YmJlZCBtZXRob2QuXG4gICAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAgICovXG5cbiAgYW5hbHl0aWNzLnN0dWIgPSBmdW5jdGlvbihvYmplY3QsIG1ldGhvZCwgZm4pe1xuICAgIHZhciBzID0gc3R1YihvYmplY3QsIG1ldGhvZCwgZm4pO1xuICAgIHRoaXMuc3BpZXMucHVzaChzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogUmVzdG9yZSBhbGwgc3BpZXMuXG4gICAqXG4gICAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAgICovXG5cbiAgYW5hbHl0aWNzLnJlc3RvcmUgPSBmdW5jdGlvbigpe1xuICAgIGVhY2godGhpcy5zcGllcywgZnVuY3Rpb24oc3B5LCBpKXtcbiAgICAgIHNweS5yZXN0b3JlKCk7XG4gICAgfSk7XG4gICAgdGhpcy5zcGllcyA9IFtdO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBc3NlcnQgdGhhdCBhIGBzcHlgIHdhcyBjYWxsZWQgd2l0aCBgYXJncy4uLmBcbiAgICpcbiAgICogQHBhcmFtIHtTcHl9IHNweVxuICAgKiBAcGFyYW0ge01peGVkfSBhcmdzLi4uIChvcHRpb25hbClcbiAgICogQHJldHVybiB7QW5hbHl0aWNzfVxuICAgKi9cblxuICBhbmFseXRpY3MuY2FsbGVkID0gZnVuY3Rpb24oc3B5KXtcbiAgICBhc3NlcnQoXG4gICAgICB+aW5kZXhPZih0aGlzLnNwaWVzLCBzcHkpLFxuICAgICAgJ1lvdSBtdXN0IGNhbGwgYC5zcHkob2JqZWN0LCBtZXRob2QpYCBwcmlvciB0byBjYWxsaW5nIGAuY2FsbGVkKClgLidcbiAgICApO1xuICAgIGFzc2VydChzcHkuY2FsbGVkLCBmbXQoJ0V4cGVjdGVkIFwiJXNcIiB0byBoYXZlIGJlZW4gY2FsbGVkLicsIHNweS5uYW1lKSk7XG5cbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBpZiAoIWFyZ3MubGVuZ3RoKSByZXR1cm4gdGhpcztcblxuICAgIGFzc2VydChcbiAgICAgIHNweS5nb3QuYXBwbHkoc3B5LCBhcmdzKSwgZm10KCcnXG4gICAgICArICdFeHBlY3RlZCBcIiVzXCIgdG8gYmUgY2FsbGVkIHdpdGggXCIlc1wiLCBcXG4nXG4gICAgICArICdidXQgaXQgd2FzIGNhbGxlZCB3aXRoIFwiJXNcIi4nXG4gICAgICAsIHNweS5uYW1lXG4gICAgICAsIEpTT04uc3RyaW5naWZ5KGFyZ3MsIG51bGwsIDIpXG4gICAgICAsIEpTT04uc3RyaW5naWZ5KHNweS5hcmdzWzBdLCBudWxsLCAyKSlcbiAgICApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGF0IGEgYHNweWAgd2FzIG5vdCBjYWxsZWQgd2l0aCBgYXJncy4uLmAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3B5fSBzcHlcbiAgICogQHBhcmFtIHtNaXhlZH0gYXJncy4uLiAob3B0aW9uYWwpXG4gICAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAgICovXG5cbiAgYW5hbHl0aWNzLmRpZE5vdENhbGwgPSBmdW5jdGlvbihzcHkpe1xuICAgIGFzc2VydChcbiAgICAgIH5pbmRleE9mKHRoaXMuc3BpZXMsIHNweSksXG4gICAgICAnWW91IG11c3QgY2FsbCBgLnNweShvYmplY3QsIG1ldGhvZClgIHByaW9yIHRvIGNhbGxpbmcgYC5kaWROb3RDYWxsKClgLidcbiAgICApO1xuXG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgaWYgKCFhcmdzLmxlbmd0aCkge1xuICAgICAgYXNzZXJ0KFxuICAgICAgICAhc3B5LmNhbGxlZCxcbiAgICAgICAgZm10KCdFeHBlY3RlZCBcIiVzXCIgbm90IHRvIGhhdmUgYmVlbiBjYWxsZWQuJywgc3B5Lm5hbWUpXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBhc3NlcnQoIXNweS5nb3QuYXBwbHkoc3B5LCBhcmdzKSwgZm10KCcnXG4gICAgICAgICsgJ0V4cGVjdGVkIFwiJXNcIiBub3QgdG8gYmUgY2FsbGVkIHdpdGggXCIlb1wiLCAnXG4gICAgICAgICsgJ2J1dCBpdCB3YXMgY2FsbGVkIHdpdGggXCIlb1wiLidcbiAgICAgICAgLCBzcHkubmFtZVxuICAgICAgICAsIGFyZ3NcbiAgICAgICAgLCBzcHkuYXJnc1swXSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGF0IGEgYHNweWAgd2FzIG5vdCBjYWxsZWQgMSB0aW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge1NweX0gc3B5XG4gICAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAgICovXG5cbiAgYW5hbHl0aWNzLmNhbGxlZE9uY2UgPSBjYWxsZWRUaW1lcygxKTtcblxuICAvKipcbiAgICogQXNzZXJ0IHRoYXQgYSBgc3B5YCB3YXMgY2FsbGVkIDIgdGltZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3B5fSBzcHlcbiAgICogQHJldHVybiB7QW5hbHl0aWNzfVxuICAgKi9cblxuICBhbmFseXRpY3MuY2FsbGVkVHdpY2UgPSBjYWxsZWRUaW1lcygyKTtcblxuICAvKipcbiAgICogQXNzZXJ0IHRoYXQgYSBgc3B5YCB3YXMgY2FsbGVkIDMgdGltZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3B5fSBzcHlcbiAgICogQHJldHVybiB7QW5hbHl0aWNzfVxuICAgKi9cblxuICBhbmFseXRpY3MuY2FsbGVkVGhyaWNlID0gY2FsbGVkVGltZXMoMik7XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgZnVuY3Rpb24gZm9yIGFzc2VydGluZyBhIHNweVxuICAgKiB3YXMgY2FsbGVkIGBuYCB0aW1lcy5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNhbGxlZFRpbWVzKG4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3B5KSB7XG4gICAgICB2YXIgbSA9IHNweS5hcmdzLmxlbmd0aDtcbiAgICAgIGFzc2VydChcbiAgICAgICAgbiA9PSBtLFxuICAgICAgICBmbXQoJydcbiAgICAgICAgICArICdFeHBlY3RlZCBcIiVzXCIgdG8gaGF2ZSBiZWVuIGNhbGxlZCAlcyB0aW1lJXMsICdcbiAgICAgICAgICArICdidXQgaXQgd2FzIG9ubHkgY2FsbGVkICVzIHRpbWUlcy4nXG4gICAgICAgICAgLCBzcHkubmFtZSwgbiwgMSAhPSBuID8gJ3MnIDogJycsIG0sIDEgIT0gbSA/ICdzJyA6ICcnKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0IHRoYXQgYSBgc3B5YCByZXR1cm5lZCBgdmFsdWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1NweX0gc3B5XG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gICAqIEByZXR1cm4ge1Rlc3Rlcn1cbiAgICovXG5cbiAgYW5hbHl0aWNzLnJldHVybmVkID0gZnVuY3Rpb24oc3B5LCB2YWx1ZSl7XG4gICAgYXNzZXJ0KFxuICAgICAgfmluZGV4T2YodGhpcy5zcGllcywgc3B5KSxcbiAgICAgICdZb3UgbXVzdCBjYWxsIGAuc3B5KG9iamVjdCwgbWV0aG9kKWAgcHJpb3IgdG8gY2FsbGluZyBgLnJldHVybmVkKClgLidcbiAgICApO1xuICAgIGFzc2VydChcbiAgICAgIHNweS5yZXR1cm5lZCh2YWx1ZSksXG4gICAgICBmbXQoJ0V4cGVjdGVkIFwiJXNcIiB0byBoYXZlIHJldHVybmVkIFwiJW9cIi4nLCBzcHkubmFtZSwgdmFsdWUpXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBc3NlcnQgdGhhdCBhIGBzcHlgIGRpZCBub3QgcmV0dXJuIGB2YWx1ZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3B5fSBzcHlcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAgICogQHJldHVybiB7VGVzdGVyfVxuICAgKi9cblxuICBhbmFseXRpY3MuZGlkTm90UmV0dXJuID0gZnVuY3Rpb24oc3B5LCB2YWx1ZSl7XG4gICAgYXNzZXJ0KFxuICAgICAgfmluZGV4T2YodGhpcy5zcGllcywgc3B5KSxcbiAgICAgICdZb3UgbXVzdCBjYWxsIGAuc3B5KG9iamVjdCwgbWV0aG9kKWAgcHJpb3IgdG8gY2FsbGluZyBgLmRpZE5vdFJldHVybigpYC4nXG4gICAgKTtcbiAgICBhc3NlcnQoXG4gICAgICAhc3B5LnJldHVybmVkKHZhbHVlKSxcbiAgICAgIGZtdCgnRXhwZWN0ZWQgXCIlc1wiIG5vdCB0byBoYXZlIHJldHVybmVkIFwiJW9cIi4nLCBzcHkubmFtZSwgdmFsdWUpXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsIGByZXNldGAgb24gdGhlIGludGVncmF0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtBbmFseXRpY3N9XG4gICAqL1xuXG4gIGFuYWx5dGljcy5yZXNldCA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy51c2VyKCkucmVzZXQoKTtcbiAgICB0aGlzLmdyb3VwKCkucmVzZXQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogQ29tcGFyZSBgaW50YCBhZ2FpbnN0IGB0ZXN0YC5cbiAgICpcbiAgICogVG8gZG91YmxlLWNoZWNrIHRoYXQgdGhleSBoYXZlIHRoZSByaWdodCBkZWZhdWx0cywgZ2xvYmFscywgYW5kIGNvbmZpZy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gYSBhY3R1YWwgaW50ZWdyYXRpb24gY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gYiB0ZXN0IGludGVncmF0aW9uIGNvbnN0cnVjdG9yXG4gICAqL1xuXG4gIGFuYWx5dGljcy5jb21wYXJlID0gZnVuY3Rpb24oYSwgYil7XG4gICAgYSA9IG5ldyBhO1xuICAgIGIgPSBuZXcgYjtcbiAgICAvLyBuYW1lXG4gICAgYXNzZXJ0KFxuICAgICAgYS5uYW1lID09PSBiLm5hbWUsXG4gICAgICBmbXQoJ0V4cGVjdGVkIG5hbWUgdG8gYmUgXCIlc1wiLCBidXQgaXQgd2FzIFwiJXNcIi4nLCBiLm5hbWUsIGEubmFtZSlcbiAgICApO1xuXG4gICAgLy8gb3B0aW9uc1xuICAgIHZhciB4ID0gYS5kZWZhdWx0cztcbiAgICB2YXIgeSA9IGIuZGVmYXVsdHM7XG4gICAgZm9yICh2YXIga2V5IGluIHkpIHtcbiAgICAgIGFzc2VydChcbiAgICAgICAgeC5oYXNPd25Qcm9wZXJ0eShrZXkpLFxuICAgICAgICBmbXQoJ1RoZSBpbnRlZ3JhdGlvbiBkb2VzIG5vdCBoYXZlIGFuIG9wdGlvbiBuYW1lZCBcIiVzXCIuJywga2V5KVxuICAgICAgKTtcbiAgICAgIGFzc2VydC5kZWVwRXF1YWwoXG4gICAgICAgIHhba2V5XSwgeVtrZXldLFxuICAgICAgICBmbXQoXG4gICAgICAgICAgJ0V4cGVjdGVkIG9wdGlvbiBcIiVzXCIgdG8gZGVmYXVsdCB0byBcIiVzXCIsIGJ1dCBpdCBkZWZhdWx0cyB0byBcIiVzXCIuJyxcbiAgICAgICAgICBrZXksIHlba2V5XSwgeFtrZXldXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gZ2xvYmFsc1xuICAgIHZhciB4ID0gYS5nbG9iYWxzO1xuICAgIHZhciB5ID0gYi5nbG9iYWxzO1xuICAgIGVhY2goeSwgZnVuY3Rpb24oa2V5KXtcbiAgICAgIGFzc2VydChcbiAgICAgICAgaW5kZXhPZih4LCBrZXkpICE9PSAtMSxcbiAgICAgICAgZm10KCdFeHBlY3RlZCBnbG9iYWwgXCIlc1wiIHRvIGJlIHJlZ2lzdGVyZWQuJywga2V5KVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIGFzc3VtZXNQYWdldmlld1xuICAgIGFzc2VydChcbiAgICAgIGEuX2Fzc3VtZXNQYWdldmlldyA9PSBiLl9hc3N1bWVzUGFnZXZpZXcsXG4gICAgICAnRXhwZWN0ZWQgdGhlIGludGVncmF0aW9uIHRvIGFzc3VtZSBhIHBhZ2V2aWV3LidcbiAgICApO1xuXG4gICAgLy8gcmVhZHlPbkluaXRpYWxpemVcbiAgICBhc3NlcnQoXG4gICAgICBhLl9yZWFkeU9uSW5pdGlhbGl6ZSA9PSBiLl9yZWFkeU9uSW5pdGlhbGl6ZSxcbiAgICAgICdFeHBlY3RlZCB0aGUgaW50ZWdyYXRpb24gdG8gYmUgcmVhZHkgb24gaW5pdGlhbGl6ZS4nXG4gICAgKTtcblxuICAgIC8vIHJlYWR5T25Mb2FkXG4gICAgYXNzZXJ0KFxuICAgICAgYS5fcmVhZHlPbkxvYWQgPT0gYi5fcmVhZHlPbkxvYWQsXG4gICAgICAnRXhwZWN0ZWQgaW50ZWdyYXRpb24gdG8gYmUgcmVhZHkgb24gbG9hZC4nXG4gICAgKTtcbiAgfTtcblxuICAvKipcbiAgICogQXNzZXJ0IHRoZSBpbnRlZ3JhdGlvbiBiZWluZyB0ZXN0ZWQgbG9hZHMuXG4gICAqXG4gICAqIEBwYXJhbSB7SW50ZWdyYXRpb259IGludGVncmF0aW9uXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGRvbmVcbiAgICovXG5cbiAgYW5hbHl0aWNzLmxvYWQgPSBmdW5jdGlvbihpbnRlZ3JhdGlvbiwgZG9uZSl7XG4gICAgYW5hbHl0aWNzLmFzc2VydCghaW50ZWdyYXRpb24ubG9hZGVkKCksICdFeHBlY3RlZCBgaW50ZWdyYXRpb24ubG9hZGVkKClgIHRvIGJlIGZhbHNlIGJlZm9yZSBsb2FkaW5nLicpO1xuICAgIGFuYWx5dGljcy5vbmNlKCdyZWFkeScsIGZ1bmN0aW9uKCl7XG4gICAgICBhbmFseXRpY3MuYXNzZXJ0KGludGVncmF0aW9uLmxvYWRlZCgpLCAnRXhwZWN0ZWQgYGludGVncmF0aW9uLmxvYWRlZCgpYCB0byBiZSB0cnVlIGFmdGVyIGxvYWRpbmcuJyk7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gICAgYW5hbHl0aWNzLmluaXRpYWxpemUoKTtcbiAgICBhbmFseXRpY3MucGFnZSh7fSwgeyBNYXJrZXRvOiB0cnVlIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBc3NlcnQgYSBzY3JpcHQsIGltYWdlLCBvciBpZnJhbWUgd2FzIGxvYWRlZC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHN0ciBET00gdGVtcGxhdGVcbiAgICovXG4gIFxuICBhbmFseXRpY3MubG9hZGVkID0gZnVuY3Rpb24oaW50ZWdyYXRpb24sIHN0cil7XG4gICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBpbnRlZ3JhdGlvbikge1xuICAgICAgc3RyID0gaW50ZWdyYXRpb247XG4gICAgICBpbnRlZ3JhdGlvbiA9IHRoaXMuaW50ZWdyYXRpb24oKTtcbiAgICB9XG5cbiAgICB2YXIgdGFncyA9IFtdO1xuXG4gICAgYXNzZXJ0KFxuICAgICAgfmluZGV4T2YodGhpcy5zcGllcywgaW50ZWdyYXRpb24ubG9hZCksXG4gICAgICAnWW91IG11c3QgY2FsbCBgLnNweShpbnRlZ3JhdGlvbiwgXFwnbG9hZFxcJylgIHByaW9yIHRvIGNhbGxpbmcgYC5sb2FkZWQoKWAuJ1xuICAgICk7XG5cbiAgICAvLyBjb2xsZWN0IGFsbCBJbWFnZSBvciBIVE1MRWxlbWVudCBvYmplY3RzXG4gICAgLy8gaW4gYW4gYXJyYXkgb2Ygc3RyaW5naWZpZWQgZWxlbWVudHMsIGZvciBodW1hbi1yZWFkYWJsZSBhc3NlcnRpb25zLlxuICAgIGVhY2goaW50ZWdyYXRpb24ubG9hZC5yZXR1cm5zLCBmdW5jdGlvbihlbCl7XG4gICAgICB2YXIgdGFnID0ge307XG4gICAgICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50KSB7XG4gICAgICAgIHRhZy50eXBlID0gJ2ltZyc7XG4gICAgICAgIHRhZy5hdHRycyA9IHsgc3JjOiBlbC5zcmMgfTtcbiAgICAgIH0gZWxzZSBpZiAoaXMuZWxlbWVudChlbCkpIHtcbiAgICAgICAgdGFnLnR5cGUgPSBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHRhZy5hdHRycyA9IGF0dHJpYnV0ZXMoZWwpO1xuICAgICAgICBzd2l0Y2ggKHRhZy50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnc2NyaXB0JzpcbiAgICAgICAgICAgIC8vIGRvbid0IGNhcmUgYWJvdXQgdGhlc2UgcHJvcGVydGllcy5cbiAgICAgICAgICAgIGRlbGV0ZSB0YWcuYXR0cnMudHlwZTtcbiAgICAgICAgICAgIGRlbGV0ZSB0YWcuYXR0cnMuYXN5bmM7XG4gICAgICAgICAgICBkZWxldGUgdGFnLmF0dHJzLmRlZmVyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0YWcudHlwZSkgdGFncy5wdXNoKHN0cmluZ2lmeSh0YWcudHlwZSwgdGFnLmF0dHJzKSk7XG4gICAgfSk7XG5cbiAgICAvLyBub3JtYWxpemUgZm9ybWF0dGluZ1xuICAgIHZhciB0YWcgPSBvYmplY3RpZnkoc3RyKTtcbiAgICB2YXIgZXhwZWN0ZWQgPSBzdHJpbmdpZnkodGFnLnR5cGUsIHRhZy5hdHRycyk7XG5cbiAgICBpZiAoIXRhZ3MubGVuZ3RoKSB7XG4gICAgICBhc3NlcnQoZmFsc2UsIGZtdCgnTm8gdGFncyB3ZXJlIHJldHVybmVkLlxcbkV4cGVjdGVkICVzLicsIGV4cGVjdGVkKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHNob3cgdGhlIGNsb3Nlc3QgbWF0Y2hcbiAgICAgIGFzc2VydChcbiAgICAgICAgaW5kZXhPZih0YWdzLCBleHBlY3RlZCkgIT09IC0xLFxuICAgICAgICBmbXQoJ1xcbkV4cGVjdGVkICVzLlxcbkZvdW5kICVzJywgZXhwZWN0ZWQsIHRhZ3Muam9pbignXFxuJykpXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgaW50ZWdyYXRpb24uXG4gICAqXG4gICAqIEByZXR1cm4ge0ludGVncmF0aW9ufVxuICAgKi9cbiAgXG4gIGFuYWx5dGljcy5pbnRlZ3JhdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLl9pbnRlZ3JhdGlvbnMpIHJldHVybiB0aGlzLl9pbnRlZ3JhdGlvbnNbbmFtZV07XG4gIH07XG5cbiAgLyoqXG4gICAqIEFzc2VydCBhIGB2YWx1ZWAgaXMgdHJ1dGh5LlxuICAgKlxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICAgKiBAcmV0dXJuIHtUZXN0ZXJ9XG4gICAqL1xuXG4gIGFuYWx5dGljcy5hc3NlcnQgPSBhc3NlcnQ7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBhbGwgb2YgdGhlIG1ldGhvZHMgb24gYGFzc2VydGAuXG4gICAqXG4gICAqIEBwYXJhbSB7TWl4ZWR9IGFyZ3MuLi5cbiAgICogQHJldHVybiB7VGVzdGVyfVxuICAgKi9cblxuICBlYWNoKGtleXMoYXNzZXJ0KSwgZnVuY3Rpb24oa2V5KXtcbiAgICBhbmFseXRpY3Nba2V5XSA9IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIGFzc2VydFtrZXldLmFwcGx5KGFzc2VydCwgYXJncyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICB9KTtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgRE9NIG5vZGUgc3RyaW5nLlxuICAgKi9cblxuICBmdW5jdGlvbiBzdHJpbmdpZnkobmFtZSwgYXR0cnMpIHtcbiAgICB2YXIgc3RyID0gW107XG4gICAgc3RyLnB1c2goJzwnICsgbmFtZSk7XG4gICAgZWFjaChhdHRycywgZnVuY3Rpb24oa2V5LCB2YWwpe1xuICAgICAgc3RyLnB1c2goJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcbiAgICB9KTtcbiAgICBzdHIucHVzaCgnPicpO1xuICAgIC8vIGJsb2NrXG4gICAgaWYgKCdpbWcnICE9PSBuYW1lKSBzdHIucHVzaCgnPC8nICsgbmFtZSArICc+Jyk7XG4gICAgcmV0dXJuIHN0ci5qb2luKCcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBET00gbm9kZSBhdHRyaWJ1dGVzIGFzIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtFbGVtZW50fVxuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuICBcbiAgZnVuY3Rpb24gYXR0cmlidXRlcyhub2RlKSB7XG4gICAgdmFyIG9iaiA9IHt9O1xuICAgIGVhY2gobm9kZS5hdHRyaWJ1dGVzLCBmdW5jdGlvbihhdHRyKXtcbiAgICAgIG9ialthdHRyLm5hbWVdID0gYXR0ci52YWx1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgc3RyaW5nLCBnaXZlIGJhY2sgRE9NIGF0dHJpYnV0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICBmdW5jdGlvbiBvYmplY3RpZnkoc3RyKSB7XG4gICAgLy8gcmVwbGFjZSBgc3JjYCB3aXRoIGBkYXRhLXNyY2AgdG8gcHJldmVudCBpbWFnZSBsb2FkaW5nXG4gICAgc3RyID0gc3RyLnJlcGxhY2UoJyBzcmM9XCInLCAnIGRhdGEtc3JjPVwiJyk7XG4gICAgXG4gICAgdmFyIGVsID0gZG9taWZ5KHN0cik7XG4gICAgdmFyIGF0dHJzID0ge307XG4gICAgXG4gICAgZWFjaChlbC5hdHRyaWJ1dGVzLCBmdW5jdGlvbihhdHRyKXtcbiAgICAgIC8vIHRoZW4gcmVwbGFjZSBpdCBiYWNrXG4gICAgICB2YXIgbmFtZSA9ICdkYXRhLXNyYycgPT0gYXR0ci5uYW1lID8gJ3NyYycgOiBhdHRyLm5hbWU7XG4gICAgICBhdHRyc1tuYW1lXSA9IGF0dHIudmFsdWU7XG4gICAgfSk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSxcbiAgICAgIGF0dHJzOiBhdHRyc1xuICAgIH07XG4gIH1cbn0iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgZXF1YWxzID0gcmVxdWlyZSgnZXF1YWxzJyk7XG52YXIgZm10ID0gcmVxdWlyZSgnZm10Jyk7XG52YXIgc3RhY2sgPSByZXF1aXJlKCdzdGFjaycpO1xuXG4vKipcbiAqIEFzc2VydCBgZXhwcmAgd2l0aCBvcHRpb25hbCBmYWlsdXJlIGBtc2dgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4cHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBbbXNnXVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmdW5jdGlvbiAoZXhwciwgbXNnKSB7XG4gIGlmIChleHByKSByZXR1cm47XG4gIHRocm93IGVycm9yKG1zZyB8fCBtZXNzYWdlKCkpO1xufTtcblxuLyoqXG4gKiBBc3NlcnQgYGFjdHVhbGAgaXMgd2VhayBlcXVhbCB0byBgZXhwZWN0ZWRgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGFjdHVhbFxuICogQHBhcmFtIHtNaXhlZH0gZXhwZWN0ZWRcbiAqIEBwYXJhbSB7U3RyaW5nfSBbbXNnXVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmVxdWFsID0gZnVuY3Rpb24gKGFjdHVhbCwgZXhwZWN0ZWQsIG1zZykge1xuICBpZiAoYWN0dWFsID09IGV4cGVjdGVkKSByZXR1cm47XG4gIHRocm93IGVycm9yKG1zZyB8fCBmbXQoJ0V4cGVjdGVkICVvIHRvIGVxdWFsICVvLicsIGFjdHVhbCwgZXhwZWN0ZWQpLCBhY3R1YWwsIGV4cGVjdGVkKTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IGBhY3R1YWxgIGlzIG5vdCB3ZWFrIGVxdWFsIHRvIGBleHBlY3RlZGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gYWN0dWFsXG4gKiBAcGFyYW0ge01peGVkfSBleHBlY3RlZFxuICogQHBhcmFtIHtTdHJpbmd9IFttc2ddXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMubm90RXF1YWwgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgbXNnKSB7XG4gIGlmIChhY3R1YWwgIT0gZXhwZWN0ZWQpIHJldHVybjtcbiAgdGhyb3cgZXJyb3IobXNnIHx8IGZtdCgnRXhwZWN0ZWQgJW8gbm90IHRvIGVxdWFsICVvLicsIGFjdHVhbCwgZXhwZWN0ZWQpKTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IGBhY3R1YWxgIGlzIGRlZXAgZXF1YWwgdG8gYGV4cGVjdGVkYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBhY3R1YWxcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4cGVjdGVkXG4gKiBAcGFyYW0ge1N0cmluZ30gW21zZ11cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5kZWVwRXF1YWwgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgbXNnKSB7XG4gIGlmIChlcXVhbHMoYWN0dWFsLCBleHBlY3RlZCkpIHJldHVybjtcbiAgdGhyb3cgZXJyb3IobXNnIHx8IGZtdCgnRXhwZWN0ZWQgJW8gdG8gZGVlcGx5IGVxdWFsICVvLicsIGFjdHVhbCwgZXhwZWN0ZWQpLCBhY3R1YWwsIGV4cGVjdGVkKTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IGBhY3R1YWxgIGlzIG5vdCBkZWVwIGVxdWFsIHRvIGBleHBlY3RlZGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gYWN0dWFsXG4gKiBAcGFyYW0ge01peGVkfSBleHBlY3RlZFxuICogQHBhcmFtIHtTdHJpbmd9IFttc2ddXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMubm90RGVlcEVxdWFsID0gZnVuY3Rpb24gKGFjdHVhbCwgZXhwZWN0ZWQsIG1zZykge1xuICBpZiAoIWVxdWFscyhhY3R1YWwsIGV4cGVjdGVkKSkgcmV0dXJuO1xuICB0aHJvdyBlcnJvcihtc2cgfHwgZm10KCdFeHBlY3RlZCAlbyBub3QgdG8gZGVlcGx5IGVxdWFsICVvLicsIGFjdHVhbCwgZXhwZWN0ZWQpKTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IGBhY3R1YWxgIGlzIHN0cmljdCBlcXVhbCB0byBgZXhwZWN0ZWRgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGFjdHVhbFxuICogQHBhcmFtIHtNaXhlZH0gZXhwZWN0ZWRcbiAqIEBwYXJhbSB7U3RyaW5nfSBbbXNnXVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnN0cmljdEVxdWFsID0gZnVuY3Rpb24gKGFjdHVhbCwgZXhwZWN0ZWQsIG1zZykge1xuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkgcmV0dXJuO1xuICB0aHJvdyBlcnJvcihtc2cgfHwgZm10KCdFeHBlY3RlZCAlbyB0byBzdHJpY3RseSBlcXVhbCAlby4nLCBhY3R1YWwsIGV4cGVjdGVkKSwgYWN0dWFsLCBleHBlY3RlZCk7XG59O1xuXG4vKipcbiAqIEFzc2VydCBgYWN0dWFsYCBpcyBub3Qgc3RyaWN0IGVxdWFsIHRvIGBleHBlY3RlZGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gYWN0dWFsXG4gKiBAcGFyYW0ge01peGVkfSBleHBlY3RlZFxuICogQHBhcmFtIHtTdHJpbmd9IFttc2ddXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMubm90U3RyaWN0RXF1YWwgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgbXNnKSB7XG4gIGlmIChhY3R1YWwgIT09IGV4cGVjdGVkKSByZXR1cm47XG4gIHRocm93IGVycm9yKG1zZyB8fCBmbXQoJ0V4cGVjdGVkICVvIG5vdCB0byBzdHJpY3RseSBlcXVhbCAlby4nLCBhY3R1YWwsIGV4cGVjdGVkKSk7XG59O1xuXG4vKipcbiAqIEFzc2VydCBgYmxvY2tgIHRocm93cyBhbiBgZXJyb3JgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGJsb2NrXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZXJyb3JdXG4gKiBAcGFyYW0ge1N0cmluZ30gW21zZ11cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy50aHJvd3MgPSBmdW5jdGlvbiAoYmxvY2ssIGVyciwgbXNnKSB7XG4gIHZhciB0aHJldztcbiAgdHJ5IHtcbiAgICBibG9jaygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyZXcgPSBlO1xuICB9XG5cbiAgaWYgKCF0aHJldykgdGhyb3cgZXJyb3IobXNnIHx8IGZtdCgnRXhwZWN0ZWQgJXMgdG8gdGhyb3cgYW4gZXJyb3IuJywgYmxvY2sudG9TdHJpbmcoKSkpO1xuICBpZiAoZXJyICYmICEodGhyZXcgaW5zdGFuY2VvZiBlcnIpKSB7XG4gICAgdGhyb3cgZXJyb3IobXNnIHx8IGZtdCgnRXhwZWN0ZWQgJXMgdG8gdGhyb3cgYW4gJW8uJywgYmxvY2sudG9TdHJpbmcoKSwgZXJyKSk7XG4gIH1cbn07XG5cbi8qKlxuICogQXNzZXJ0IGBibG9ja2AgZG9lc24ndCB0aHJvdyBhbiBgZXJyb3JgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGJsb2NrXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZXJyb3JdXG4gKiBAcGFyYW0ge1N0cmluZ30gW21zZ11cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5kb2VzTm90VGhyb3cgPSBmdW5jdGlvbiAoYmxvY2ssIGVyciwgbXNnKSB7XG4gIHZhciB0aHJldztcbiAgdHJ5IHtcbiAgICBibG9jaygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyZXcgPSBlO1xuICB9XG5cbiAgaWYgKHRocmV3KSB0aHJvdyBlcnJvcihtc2cgfHwgZm10KCdFeHBlY3RlZCAlcyBub3QgdG8gdGhyb3cgYW4gZXJyb3IuJywgYmxvY2sudG9TdHJpbmcoKSkpO1xuICBpZiAoZXJyICYmICh0aHJldyBpbnN0YW5jZW9mIGVycikpIHtcbiAgICB0aHJvdyBlcnJvcihtc2cgfHwgZm10KCdFeHBlY3RlZCAlcyBub3QgdG8gdGhyb3cgYW4gJW8uJywgYmxvY2sudG9TdHJpbmcoKSwgZXJyKSk7XG4gIH1cbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgbWVzc2FnZSBmcm9tIHRoZSBjYWxsIHN0YWNrLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1lc3NhZ2UoKSB7XG4gIGlmICghRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHJldHVybiAnYXNzZXJ0aW9uIGZhaWxlZCc7XG4gIHZhciBjYWxsc2l0ZSA9IHN0YWNrKClbMl07XG4gIHZhciBmbiA9IGNhbGxzaXRlLmdldEZ1bmN0aW9uTmFtZSgpO1xuICB2YXIgZmlsZSA9IGNhbGxzaXRlLmdldEZpbGVOYW1lKCk7XG4gIHZhciBsaW5lID0gY2FsbHNpdGUuZ2V0TGluZU51bWJlcigpIC0gMTtcbiAgdmFyIGNvbCA9IGNhbGxzaXRlLmdldENvbHVtbk51bWJlcigpIC0gMTtcbiAgdmFyIHNyYyA9IGdldChmaWxlKTtcbiAgbGluZSA9IHNyYy5zcGxpdCgnXFxuJylbbGluZV0uc2xpY2UoY29sKTtcbiAgdmFyIG0gPSBsaW5lLm1hdGNoKC9hc3NlcnRcXCgoLiopXFwpLyk7XG4gIHJldHVybiBtICYmIG1bMV0udHJpbSgpO1xufVxuXG4vKipcbiAqIExvYWQgY29udGVudHMgb2YgYHNjcmlwdGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNjcmlwdFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KHNjcmlwdCkge1xuICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB4aHIub3BlbignR0VUJywgc2NyaXB0LCBmYWxzZSk7XG4gIHhoci5zZW5kKG51bGwpO1xuICByZXR1cm4geGhyLnJlc3BvbnNlVGV4dDtcbn1cblxuLyoqXG4gKiBFcnJvciB3aXRoIGBtc2dgLCBgYWN0dWFsYCBhbmQgYGV4cGVjdGVkYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbXNnXG4gKiBAcGFyYW0ge01peGVkfSBhY3R1YWxcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4cGVjdGVkXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqL1xuXG5mdW5jdGlvbiBlcnJvcihtc2csIGFjdHVhbCwgZXhwZWN0ZWQpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKG1zZyk7XG4gIGVyci5zaG93RGlmZiA9IDMgPT0gYXJndW1lbnRzLmxlbmd0aDtcbiAgZXJyLmFjdHVhbCA9IGFjdHVhbDtcbiAgZXJyLmV4cGVjdGVkID0gZXhwZWN0ZWQ7XG4gIHJldHVybiBlcnI7XG59XG4iLCJ2YXIgdHlwZSA9IHJlcXVpcmUoJ2prcm9zby10eXBlJylcblxuLy8gKGFueSwgYW55LCBbYXJyYXldKSAtPiBib29sZWFuXG5mdW5jdGlvbiBlcXVhbChhLCBiLCBtZW1vcyl7XG4gIC8vIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50XG4gIGlmIChhID09PSBiKSByZXR1cm4gdHJ1ZVxuICB2YXIgZm5BID0gdHlwZXNbdHlwZShhKV1cbiAgdmFyIGZuQiA9IHR5cGVzW3R5cGUoYildXG4gIHJldHVybiBmbkEgJiYgZm5BID09PSBmbkJcbiAgICA/IGZuQShhLCBiLCBtZW1vcylcbiAgICA6IGZhbHNlXG59XG5cbnZhciB0eXBlcyA9IHt9XG5cbi8vIChOdW1iZXIpIC0+IGJvb2xlYW5cbnR5cGVzLm51bWJlciA9IGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gYSAhPT0gYSAmJiBiICE9PSBiLypOYW4gY2hlY2sqL1xufVxuXG4vLyAoZnVuY3Rpb24sIGZ1bmN0aW9uLCBhcnJheSkgLT4gYm9vbGVhblxudHlwZXNbJ2Z1bmN0aW9uJ10gPSBmdW5jdGlvbihhLCBiLCBtZW1vcyl7XG4gIHJldHVybiBhLnRvU3RyaW5nKCkgPT09IGIudG9TdHJpbmcoKVxuICAgIC8vIEZ1bmN0aW9ucyBjYW4gYWN0IGFzIG9iamVjdHNcbiAgICAmJiB0eXBlcy5vYmplY3QoYSwgYiwgbWVtb3MpXG4gICAgJiYgZXF1YWwoYS5wcm90b3R5cGUsIGIucHJvdG90eXBlKVxufVxuXG4vLyAoZGF0ZSwgZGF0ZSkgLT4gYm9vbGVhblxudHlwZXMuZGF0ZSA9IGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gK2EgPT09ICtiXG59XG5cbi8vIChyZWdleHAsIHJlZ2V4cCkgLT4gYm9vbGVhblxudHlwZXMucmVnZXhwID0gZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiBhLnRvU3RyaW5nKCkgPT09IGIudG9TdHJpbmcoKVxufVxuXG4vLyAoRE9NRWxlbWVudCwgRE9NRWxlbWVudCkgLT4gYm9vbGVhblxudHlwZXMuZWxlbWVudCA9IGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gYS5vdXRlckhUTUwgPT09IGIub3V0ZXJIVE1MXG59XG5cbi8vICh0ZXh0bm9kZSwgdGV4dG5vZGUpIC0+IGJvb2xlYW5cbnR5cGVzLnRleHRub2RlID0gZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiBhLnRleHRDb250ZW50ID09PSBiLnRleHRDb250ZW50XG59XG5cbi8vIGRlY29yYXRlIGBmbmAgdG8gcHJldmVudCBpdCByZS1jaGVja2luZyBvYmplY3RzXG4vLyAoZnVuY3Rpb24pIC0+IGZ1bmN0aW9uXG5mdW5jdGlvbiBtZW1vR2F1cmQoZm4pe1xuICByZXR1cm4gZnVuY3Rpb24oYSwgYiwgbWVtb3Mpe1xuICAgIGlmICghbWVtb3MpIHJldHVybiBmbihhLCBiLCBbXSlcbiAgICB2YXIgaSA9IG1lbW9zLmxlbmd0aCwgbWVtb1xuICAgIHdoaWxlIChtZW1vID0gbWVtb3NbLS1pXSkge1xuICAgICAgaWYgKG1lbW9bMF0gPT09IGEgJiYgbWVtb1sxXSA9PT0gYikgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZuKGEsIGIsIG1lbW9zKVxuICB9XG59XG5cbnR5cGVzWydhcmd1bWVudHMnXSA9XG50eXBlc1snYml0LWFycmF5J10gPVxudHlwZXMuYXJyYXkgPSBtZW1vR2F1cmQoYXJyYXlFcXVhbClcblxuLy8gKGFycmF5LCBhcnJheSwgYXJyYXkpIC0+IGJvb2xlYW5cbmZ1bmN0aW9uIGFycmF5RXF1YWwoYSwgYiwgbWVtb3Mpe1xuICB2YXIgaSA9IGEubGVuZ3RoXG4gIGlmIChpICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlXG4gIG1lbW9zLnB1c2goW2EsIGJdKVxuICB3aGlsZSAoaS0tKSB7XG4gICAgaWYgKCFlcXVhbChhW2ldLCBiW2ldLCBtZW1vcykpIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiB0cnVlXG59XG5cbnR5cGVzLm9iamVjdCA9IG1lbW9HYXVyZChvYmplY3RFcXVhbClcblxuLy8gKG9iamVjdCwgb2JqZWN0LCBhcnJheSkgLT4gYm9vbGVhblxuZnVuY3Rpb24gb2JqZWN0RXF1YWwoYSwgYiwgbWVtb3MpIHtcbiAgaWYgKHR5cGVvZiBhLmVxdWFsID09ICdmdW5jdGlvbicpIHtcbiAgICBtZW1vcy5wdXNoKFthLCBiXSlcbiAgICByZXR1cm4gYS5lcXVhbChiLCBtZW1vcylcbiAgfVxuICB2YXIga2EgPSBnZXRFbnVtZXJhYmxlUHJvcGVydGllcyhhKVxuICB2YXIga2IgPSBnZXRFbnVtZXJhYmxlUHJvcGVydGllcyhiKVxuICB2YXIgaSA9IGthLmxlbmd0aFxuXG4gIC8vIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXNcbiAgaWYgKGkgIT09IGtiLmxlbmd0aCkgcmV0dXJuIGZhbHNlXG5cbiAgLy8gYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyXG4gIGthLnNvcnQoKVxuICBrYi5zb3J0KClcblxuICAvLyBjaGVhcCBrZXkgdGVzdFxuICB3aGlsZSAoaS0tKSBpZiAoa2FbaV0gIT09IGtiW2ldKSByZXR1cm4gZmFsc2VcblxuICAvLyByZW1lbWJlclxuICBtZW1vcy5wdXNoKFthLCBiXSlcblxuICAvLyBpdGVyYXRlIGFnYWluIHRoaXMgdGltZSBkb2luZyBhIHRob3JvdWdoIGNoZWNrXG4gIGkgPSBrYS5sZW5ndGhcbiAgd2hpbGUgKGktLSkge1xuICAgIHZhciBrZXkgPSBrYVtpXVxuICAgIGlmICghZXF1YWwoYVtrZXldLCBiW2tleV0sIG1lbW9zKSkgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG4vLyAob2JqZWN0KSAtPiBhcnJheVxuZnVuY3Rpb24gZ2V0RW51bWVyYWJsZVByb3BlcnRpZXMgKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gW11cbiAgZm9yICh2YXIgayBpbiBvYmplY3QpIGlmIChrICE9PSAnY29uc3RydWN0b3InKSB7XG4gICAgcmVzdWx0LnB1c2goaylcbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXF1YWxcbiIsIlxudmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmdcbnZhciBEb21Ob2RlID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJ1xuICA/IHdpbmRvdy5Ob2RlXG4gIDogRnVuY3Rpb25cblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZ1bmN0aW9uKHgpe1xuICB2YXIgdHlwZSA9IHR5cGVvZiB4XG4gIGlmICh0eXBlICE9ICdvYmplY3QnKSByZXR1cm4gdHlwZVxuICB0eXBlID0gdHlwZXNbdG9TdHJpbmcuY2FsbCh4KV1cbiAgaWYgKHR5cGUpIHJldHVybiB0eXBlXG4gIGlmICh4IGluc3RhbmNlb2YgRG9tTm9kZSkgc3dpdGNoICh4Lm5vZGVUeXBlKSB7XG4gICAgY2FzZSAxOiAgcmV0dXJuICdlbGVtZW50J1xuICAgIGNhc2UgMzogIHJldHVybiAndGV4dC1ub2RlJ1xuICAgIGNhc2UgOTogIHJldHVybiAnZG9jdW1lbnQnXG4gICAgY2FzZSAxMTogcmV0dXJuICdkb2N1bWVudC1mcmFnbWVudCdcbiAgICBkZWZhdWx0OiByZXR1cm4gJ2RvbS1ub2RlJ1xuICB9XG59XG5cbnZhciB0eXBlcyA9IGV4cG9ydHMudHlwZXMgPSB7XG4gICdbb2JqZWN0IEZ1bmN0aW9uXSc6ICdmdW5jdGlvbicsXG4gICdbb2JqZWN0IERhdGVdJzogJ2RhdGUnLFxuICAnW29iamVjdCBSZWdFeHBdJzogJ3JlZ2V4cCcsXG4gICdbb2JqZWN0IEFyZ3VtZW50c10nOiAnYXJndW1lbnRzJyxcbiAgJ1tvYmplY3QgQXJyYXldJzogJ2FycmF5JyxcbiAgJ1tvYmplY3QgU3RyaW5nXSc6ICdzdHJpbmcnLFxuICAnW29iamVjdCBOdWxsXSc6ICdudWxsJyxcbiAgJ1tvYmplY3QgVW5kZWZpbmVkXSc6ICd1bmRlZmluZWQnLFxuICAnW29iamVjdCBOdW1iZXJdJzogJ251bWJlcicsXG4gICdbb2JqZWN0IEJvb2xlYW5dJzogJ2Jvb2xlYW4nLFxuICAnW29iamVjdCBPYmplY3RdJzogJ29iamVjdCcsXG4gICdbb2JqZWN0IFRleHRdJzogJ3RleHQtbm9kZScsXG4gICdbb2JqZWN0IFVpbnQ4QXJyYXldJzogJ2JpdC1hcnJheScsXG4gICdbb2JqZWN0IFVpbnQxNkFycmF5XSc6ICdiaXQtYXJyYXknLFxuICAnW29iamVjdCBVaW50MzJBcnJheV0nOiAnYml0LWFycmF5JyxcbiAgJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJzogJ2JpdC1hcnJheScsXG4gICdbb2JqZWN0IEVycm9yXSc6ICdlcnJvcicsXG4gICdbb2JqZWN0IEZvcm1EYXRhXSc6ICdmb3JtLWRhdGEnLFxuICAnW29iamVjdCBGaWxlXSc6ICdmaWxlJyxcbiAgJ1tvYmplY3QgQmxvYl0nOiAnYmxvYidcbn1cbiIsIlxuLyoqXG4gKiBFeHBvc2UgYHN0YWNrKClgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2s7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBzdGFjay5cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gc3RhY2soKSB7XG4gIHZhciBvcmlnID0gRXJyb3IucHJlcGFyZVN0YWNrVHJhY2U7XG4gIEVycm9yLnByZXBhcmVTdGFja1RyYWNlID0gZnVuY3Rpb24oXywgc3RhY2speyByZXR1cm4gc3RhY2s7IH07XG4gIHZhciBlcnIgPSBuZXcgRXJyb3I7XG4gIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKGVyciwgYXJndW1lbnRzLmNhbGxlZSk7XG4gIHZhciBzdGFjayA9IGVyci5zdGFjaztcbiAgRXJyb3IucHJlcGFyZVN0YWNrVHJhY2UgPSBvcmlnO1xuICByZXR1cm4gc3RhY2s7XG59IiwiXG4vKipcbiAqIEV4cG9zZSBgcGFyc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG5cbi8qKlxuICogVGVzdHMgZm9yIGJyb3dzZXIgc3VwcG9ydC5cbiAqL1xuXG52YXIgaW5uZXJIVE1MQnVnID0gZmFsc2U7XG52YXIgYnVnVGVzdERpdjtcbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gIGJ1Z1Rlc3REaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgLy8gU2V0dXBcbiAgYnVnVGVzdERpdi5pbm5lckhUTUwgPSAnICA8bGluay8+PHRhYmxlPjwvdGFibGU+PGEgaHJlZj1cIi9hXCI+YTwvYT48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIvPic7XG4gIC8vIE1ha2Ugc3VyZSB0aGF0IGxpbmsgZWxlbWVudHMgZ2V0IHNlcmlhbGl6ZWQgY29ycmVjdGx5IGJ5IGlubmVySFRNTFxuICAvLyBUaGlzIHJlcXVpcmVzIGEgd3JhcHBlciBlbGVtZW50IGluIElFXG4gIGlubmVySFRNTEJ1ZyA9ICFidWdUZXN0RGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaW5rJykubGVuZ3RoO1xuICBidWdUZXN0RGl2ID0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFdyYXAgbWFwIGZyb20ganF1ZXJ5LlxuICovXG5cbnZhciBtYXAgPSB7XG4gIGxlZ2VuZDogWzEsICc8ZmllbGRzZXQ+JywgJzwvZmllbGRzZXQ+J10sXG4gIHRyOiBbMiwgJzx0YWJsZT48dGJvZHk+JywgJzwvdGJvZHk+PC90YWJsZT4nXSxcbiAgY29sOiBbMiwgJzx0YWJsZT48dGJvZHk+PC90Ym9keT48Y29sZ3JvdXA+JywgJzwvY29sZ3JvdXA+PC90YWJsZT4nXSxcbiAgLy8gZm9yIHNjcmlwdC9saW5rL3N0eWxlIHRhZ3MgdG8gd29yayBpbiBJRTYtOCwgeW91IGhhdmUgdG8gd3JhcFxuICAvLyBpbiBhIGRpdiB3aXRoIGEgbm9uLXdoaXRlc3BhY2UgY2hhcmFjdGVyIGluIGZyb250LCBoYSFcbiAgX2RlZmF1bHQ6IGlubmVySFRNTEJ1ZyA/IFsxLCAnWDxkaXY+JywgJzwvZGl2PiddIDogWzAsICcnLCAnJ11cbn07XG5cbm1hcC50ZCA9XG5tYXAudGggPSBbMywgJzx0YWJsZT48dGJvZHk+PHRyPicsICc8L3RyPjwvdGJvZHk+PC90YWJsZT4nXTtcblxubWFwLm9wdGlvbiA9XG5tYXAub3B0Z3JvdXAgPSBbMSwgJzxzZWxlY3QgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPicsICc8L3NlbGVjdD4nXTtcblxubWFwLnRoZWFkID1cbm1hcC50Ym9keSA9XG5tYXAuY29sZ3JvdXAgPVxubWFwLmNhcHRpb24gPVxubWFwLnRmb290ID0gWzEsICc8dGFibGU+JywgJzwvdGFibGU+J107XG5cbm1hcC5wb2x5bGluZSA9XG5tYXAuZWxsaXBzZSA9XG5tYXAucG9seWdvbiA9XG5tYXAuY2lyY2xlID1cbm1hcC50ZXh0ID1cbm1hcC5saW5lID1cbm1hcC5wYXRoID1cbm1hcC5yZWN0ID1cbm1hcC5nID0gWzEsICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2ZXJzaW9uPVwiMS4xXCI+JywnPC9zdmc+J107XG5cbi8qKlxuICogUGFyc2UgYGh0bWxgIGFuZCByZXR1cm4gYSBET00gTm9kZSBpbnN0YW5jZSwgd2hpY2ggY291bGQgYmUgYSBUZXh0Tm9kZSxcbiAqIEhUTUwgRE9NIE5vZGUgb2Ygc29tZSBraW5kICg8ZGl2PiBmb3IgZXhhbXBsZSksIG9yIGEgRG9jdW1lbnRGcmFnbWVudFxuICogaW5zdGFuY2UsIGRlcGVuZGluZyBvbiB0aGUgY29udGVudHMgb2YgdGhlIGBodG1sYCBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWwgLSBIVE1MIHN0cmluZyB0byBcImRvbWlmeVwiXG4gKiBAcGFyYW0ge0RvY3VtZW50fSBkb2MgLSBUaGUgYGRvY3VtZW50YCBpbnN0YW5jZSB0byBjcmVhdGUgdGhlIE5vZGUgZm9yXG4gKiBAcmV0dXJuIHtET01Ob2RlfSB0aGUgVGV4dE5vZGUsIERPTSBOb2RlLCBvciBEb2N1bWVudEZyYWdtZW50IGluc3RhbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShodG1sLCBkb2MpIHtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBodG1sKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdHJpbmcgZXhwZWN0ZWQnKTtcblxuICAvLyBkZWZhdWx0IHRvIHRoZSBnbG9iYWwgYGRvY3VtZW50YCBvYmplY3RcbiAgaWYgKCFkb2MpIGRvYyA9IGRvY3VtZW50O1xuXG4gIC8vIHRhZyBuYW1lXG4gIHZhciBtID0gLzwoW1xcdzpdKykvLmV4ZWMoaHRtbCk7XG4gIGlmICghbSkgcmV0dXJuIGRvYy5jcmVhdGVUZXh0Tm9kZShodG1sKTtcblxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7IC8vIFJlbW92ZSBsZWFkaW5nL3RyYWlsaW5nIHdoaXRlc3BhY2VcblxuICB2YXIgdGFnID0gbVsxXTtcblxuICAvLyBib2R5IHN1cHBvcnRcbiAgaWYgKHRhZyA9PSAnYm9keScpIHtcbiAgICB2YXIgZWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnaHRtbCcpO1xuICAgIGVsLmlubmVySFRNTCA9IGh0bWw7XG4gICAgcmV0dXJuIGVsLnJlbW92ZUNoaWxkKGVsLmxhc3RDaGlsZCk7XG4gIH1cblxuICAvLyB3cmFwIG1hcFxuICB2YXIgd3JhcCA9IG1hcFt0YWddIHx8IG1hcC5fZGVmYXVsdDtcbiAgdmFyIGRlcHRoID0gd3JhcFswXTtcbiAgdmFyIHByZWZpeCA9IHdyYXBbMV07XG4gIHZhciBzdWZmaXggPSB3cmFwWzJdO1xuICB2YXIgZWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsLmlubmVySFRNTCA9IHByZWZpeCArIGh0bWwgKyBzdWZmaXg7XG4gIHdoaWxlIChkZXB0aC0tKSBlbCA9IGVsLmxhc3RDaGlsZDtcblxuICAvLyBvbmUgZWxlbWVudFxuICBpZiAoZWwuZmlyc3RDaGlsZCA9PSBlbC5sYXN0Q2hpbGQpIHtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZCk7XG4gIH1cblxuICAvLyBzZXZlcmFsIGVsZW1lbnRzXG4gIHZhciBmcmFnbWVudCA9IGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHdoaWxlIChlbC5maXJzdENoaWxkKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZCkpO1xuICB9XG5cbiAgcmV0dXJuIGZyYWdtZW50O1xufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIG1lcmdlID0gcmVxdWlyZSgnbWVyZ2UnKTtcbnZhciBlcWwgPSByZXF1aXJlKCdlcWwnKTtcblxuLyoqXG4gKiBDcmVhdGUgYSB0ZXN0IHN0dWIgd2l0aCBgb2JqYCwgYG1ldGhvZGAuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzID0gcmVxdWlyZSgnc3R1YicpKHt9LCAndG9TdHJpbmcnKTtcbiAqICAgICAgcyA9IHJlcXVpcmUoJ3N0dWInKShkb2N1bWVudC53cml0ZSk7XG4gKiAgICAgIHMgPSByZXF1aXJlKCdzdHViJykoKTtcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gb2JqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosIG1ldGhvZCl7XG4gIHZhciBmbiA9IHRvRnVuY3Rpb24oYXJndW1lbnRzLCBzdHViKTtcbiAgbWVyZ2Uoc3R1YiwgcHJvdG8pO1xuICBzdHViLnJlc2V0KCk7XG4gIHN0dWIubmFtZSA9IG1ldGhvZDtcbiAgcmV0dXJuIHN0dWI7XG5cbiAgZnVuY3Rpb24gc3R1Yigpe1xuICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIHZhciByZXQgPSBmbihhcmd1bWVudHMpO1xuICAgIC8vc3R1Yi5yZXR1cm5zIHx8IHN0dWIucmVzZXQoKTtcbiAgICBzdHViLmFyZ3MucHVzaChhcmdzKTtcbiAgICBzdHViLnJldHVybnMucHVzaChyZXQpO1xuICAgIHN0dWIudXBkYXRlKCk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufTtcblxuLyoqXG4gKiBQcm90b3R5cGUuXG4gKi9cblxudmFyIHByb3RvID0ge307XG5cbi8qKlxuICogYHRydWVgIGlmIHRoZSBzdHViIHdhcyBjYWxsZWQgd2l0aCBgYXJnc2AuXG4gKlxuICogQHBhcmFtIHtBcmd1bWVudHN9IC4uLlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucHJvdG8uZ290ID1cbnByb3RvLmNhbGxlZFdpdGggPSBmdW5jdGlvbihuKXtcbiAgdmFyIGEgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdGhpcy5hcmdzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgIHZhciBiID0gdGhpcy5hcmdzW2ldO1xuICAgIGlmIChlcWwoYSwgYi5zbGljZSgwLCBhLmxlbmd0aCkpKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm47XG59O1xuXG4vKipcbiAqIGB0cnVlYCBpZiB0aGUgc3R1YiByZXR1cm5lZCBgdmFsdWVgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5wcm90by5yZXR1cm5lZCA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgdmFyIHJldCA9IHRoaXMucmV0dXJuc1t0aGlzLnJldHVybnMubGVuZ3RoIC0gMV07XG4gIHJldHVybiBlcWwocmV0LCB2YWx1ZSk7XG59O1xuXG4vKipcbiAqIGB0cnVlYCBpZiB0aGUgc3R1YiB3YXMgY2FsbGVkIG9uY2UuXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucHJvdG8ub25jZSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiAxID09IHRoaXMuYXJncy5sZW5ndGg7XG59O1xuXG4vKipcbiAqIGB0cnVlYCBpZiB0aGUgc3R1YiB3YXMgY2FsbGVkIHR3aWNlLlxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLnR3aWNlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIDIgPT0gdGhpcy5hcmdzLmxlbmd0aDtcbn07XG5cbi8qKlxuICogYHRydWVgIGlmIHRoZSBzdHViIHdhcyBjYWxsZWQgdGhyZWUgdGltZXMuXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucHJvdG8udGhyaWNlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIDMgPT0gdGhpcy5hcmdzLmxlbmd0aDtcbn07XG5cbi8qKlxuICogUmVzZXQgdGhlIHN0dWIuXG4gKlxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5yZXR1cm5zID0gW107XG4gIHRoaXMuYXJncyA9IFtdO1xuICB0aGlzLnVwZGF0ZSgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVzdG9yZS5cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucHJvdG8ucmVzdG9yZSA9IGZ1bmN0aW9uKCl7XG4gIGlmICghdGhpcy5vYmopIHJldHVybiB0aGlzO1xuICB2YXIgbSA9IHRoaXMubWV0aG9kO1xuICB2YXIgZm4gPSB0aGlzLmZuO1xuICB0aGlzLm9ialttXSA9IGZuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBzdHViLlxuICpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxucHJvdG8udXBkYXRlID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5jYWxsZWQgPSAhISB0aGlzLmFyZ3MubGVuZ3RoO1xuICB0aGlzLmNhbGxlZE9uY2UgPSB0aGlzLm9uY2UoKTtcbiAgdGhpcy5jYWxsZWRUd2ljZSA9IHRoaXMudHdpY2UoKTtcbiAgdGhpcy5jYWxsZWRUaHJpY2UgPSB0aGlzLnRocmljZSgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVG8gZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHsuLi59IGFyZ3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN0dWJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdG9GdW5jdGlvbihhcmdzLCBzdHViKXtcbiAgdmFyIG9iaiA9IGFyZ3NbMF07XG4gIHZhciBtZXRob2QgPSBhcmdzWzFdO1xuICB2YXIgZm4gPSBhcmdzWzJdIHx8IGZ1bmN0aW9uKCl7fTtcblxuICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gZnVuY3Rpb24gbm9vcCgpe307XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYXJncyl7IHJldHVybiBvYmouYXBwbHkobnVsbCwgYXJncyk7IH07XG4gICAgY2FzZSAyOlxuICAgIGNhc2UgMzpcbiAgICB2YXIgbSA9IG9ialttZXRob2RdO1xuICAgIHN0dWIubWV0aG9kID0gbWV0aG9kO1xuICAgIHN0dWIuZm4gPSBtO1xuICAgIHN0dWIub2JqID0gb2JqO1xuICAgIG9ialttZXRob2RdID0gc3R1YjtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJncykge1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KG9iaiwgYXJncyk7XG4gICAgfTtcbiAgfVxufVxuIiwiXG4vKipcbiAqIG1lcmdlIGBiYCdzIHByb3BlcnRpZXMgd2l0aCBgYWAncy5cbiAqXG4gKiBleGFtcGxlOlxuICpcbiAqICAgICAgICB2YXIgdXNlciA9IHt9O1xuICogICAgICAgIG1lcmdlKHVzZXIsIGNvbnNvbGUpO1xuICogICAgICAgIC8vID4geyBsb2c6IGZuLCBkaXI6IGZuIC4ufVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgZm9yICh2YXIgayBpbiBiKSBhW2tdID0gYltrXTtcbiAgcmV0dXJuIGE7XG59O1xuIiwiXG4vKipcbiAqIGRlcGVuZGVuY2llc1xuICovXG5cbnZhciB0eXBlID0gcmVxdWlyZSgndHlwZScpO1xudmFyIGsgPSByZXF1aXJlKCdrZXlzJyk7XG5cbi8qKlxuICogRXhwb3J0IGBlcWxgXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZXFsO1xuXG4vKipcbiAqIENvbXBhcmUgYGFgIHRvIGBiYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBhXG4gKiBAcGFyYW0ge01peGVkfSBiXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlcWwoYSwgYil7XG4gIHZhciBjb21wYXJlID0gdHlwZShhKTtcblxuICAvLyBzYW5pdHkgY2hlY2tcbiAgaWYgKGNvbXBhcmUgIT0gdHlwZShiKSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoYSA9PT0gYikgcmV0dXJuIHRydWU7XG5cbiAgLy8gY29tcGFyZVxuICByZXR1cm4gKGNvbXBhcmUgPSBlcWxbY29tcGFyZV0pXG4gICAgPyBjb21wYXJlKGEsIGIpXG4gICAgOiBhID09IGI7XG59XG5cbi8qKlxuICogQ29tcGFyZSByZWdleHBzIGBhYCwgYGJgLlxuICpcbiAqIEBwYXJhbSB7UmVnRXhwfSBhXG4gKiBAcGFyYW0ge1JlZ0V4cH0gYlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXFsLnJlZ2V4cCA9IGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gYS5pZ25vcmVDYXNlID09IGIuaWdub3JlQ2FzZVxuICAgICYmIGEubXVsdGlsaW5lID09IGIubXVsdGlsaW5lXG4gICAgJiYgYS5sYXN0SW5kZXggPT0gYi5sYXN0SW5kZXhcbiAgICAmJiBhLmdsb2JhbCA9PSBiLmdsb2JhbFxuICAgICYmIGEuc291cmNlID09IGIuc291cmNlO1xufTtcblxuLyoqXG4gKiBDb21wYXJlIG9iamVjdHMgYGFgLCBgYmAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5lcWwub2JqZWN0ID0gZnVuY3Rpb24oYSwgYil7XG4gIHZhciBrZXlzID0ge307XG5cbiAgLy8gcHJvdG9cbiAgaWYgKGEucHJvdG90eXBlICE9IGIucHJvdG90eXBlKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8ga2V5c1xuICBrZXlzLmEgPSBrKGEpLnNvcnQoKTtcbiAga2V5cy5iID0gayhiKS5zb3J0KCk7XG5cbiAgLy8gbGVuZ3RoXG4gIGlmIChrZXlzLmEubGVuZ3RoICE9IGtleXMuYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcblxuICAvLyBrZXlzXG4gIGlmIChrZXlzLmEudG9TdHJpbmcoKSAhPSBrZXlzLmIudG9TdHJpbmcoKSkgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIHdhbGtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmEubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIga2V5ID0ga2V5cy5hW2ldO1xuICAgIGlmICghZXFsKGFba2V5XSwgYltrZXldKSkgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gZXFsXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBDb21wYXJlIGFycmF5cyBgYWAsIGBiYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhXG4gKiBAcGFyYW0ge0FycmF5fSBiXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5lcWwuYXJyYXkgPSBmdW5jdGlvbihhLCBiKXtcbiAgaWYgKGEubGVuZ3RoICE9IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7ICsraSkge1xuICAgIGlmICghZXFsKGFbaV0sIGJbaV0pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIENvbXBhcmUgZGF0ZXMgYGFgLCBgYmAuXG4gKlxuICogQHBhcmFtIHtEYXRlfSBhXG4gKiBAcGFyYW0ge0RhdGV9IGJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmVxbC5kYXRlID0gZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiArYSA9PSArYjtcbn07XG4iLCJ2YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbihvYmope1xuICB2YXIga2V5cyA9IFtdO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzLmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ga2V5cztcbn07XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgbWVyZ2UgPSByZXF1aXJlKCdtZXJnZScpO1xudmFyIGVxbCA9IHJlcXVpcmUoJ2VxbCcpO1xuXG4vKipcbiAqIENyZWF0ZSBhIHRlc3Qgc3B5IHdpdGggYG9iamAsIGBtZXRob2RgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcyA9IHJlcXVpcmUoJ3NweScpKHt9LCAndG9TdHJpbmcnKTtcbiAqICAgICAgcyA9IHJlcXVpcmUoJ3NweScpKGRvY3VtZW50LndyaXRlKTtcbiAqICAgICAgcyA9IHJlcXVpcmUoJ3NweScpKCk7XG4gKlxuICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IG9ialxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBtZXRob2Qpe1xuICB2YXIgZm4gPSB0b0Z1bmN0aW9uKGFyZ3VtZW50cywgc3B5KTtcbiAgbWVyZ2Uoc3B5LCBwcm90byk7XG4gIHJldHVybiBzcHkucmVzZXQoKTtcblxuICBmdW5jdGlvbiBzcHkoKXtcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICB2YXIgcmV0ID0gZm4oYXJndW1lbnRzKTtcbiAgICBzcHkucmV0dXJucyB8fCBzcHkucmVzZXQoKTtcbiAgICBzcHkuYXJncy5wdXNoKGFyZ3MpO1xuICAgIHNweS5yZXR1cm5zLnB1c2gocmV0KTtcbiAgICBzcHkudXBkYXRlKCk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufTtcblxuLyoqXG4gKiBQc2V1ZG8tcHJvdG90eXBlLlxuICovXG5cbnZhciBwcm90byA9IHt9O1xuXG4vKipcbiAqIExhemlseSBtYXRjaCBgYXJnc2AgYW5kIHJldHVybiBgdHJ1ZWAgaWYgdGhlIHNweSB3YXMgY2FsbGVkIHdpdGggdGhlbS5cbiAqXG4gKiBAcGFyYW0ge0FyZ3VtZW50c30gYXJnc1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucHJvdG8uZ290ID1cbnByb3RvLmNhbGxlZFdpdGggPVxucHJvdG8uZ290TGF6eSA9XG5wcm90by5jYWxsZWRXaXRoTGF6eSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBhID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXG4gIGZvciAodmFyIGkgPSAwLCBhcmdzOyBhcmdzID0gdGhpcy5hcmdzW2ldOyBpKyspIHtcbiAgICBpZiAoZXFsKGEsICBhcmdzLnNsaWNlKDAsIGEubGVuZ3RoKSkpIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBFeGFjdGx5IG1hdGNoIGBhcmdzYCBhbmQgcmV0dXJuIGB0cnVlYCBpZiB0aGUgc3B5IHdhcyBjYWxsZWQgd2l0aCB0aGVtLlxuICpcbiAqIEBwYXJhbSB7QXJndW1lbnRzfSAuLi5cbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLmdvdEV4YWN0bHkgPVxucHJvdG8uY2FsbGVkV2l0aEV4YWN0bHkgPSBmdW5jdGlvbigpe1xuICB2YXIgYSA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblxuICBmb3IgKHZhciBpID0gMCwgYXJnczsgYXJncyA9IHRoaXMuYXJnc1tpXTsgaSsrKSB7XG4gICAgaWYgKGVxbChhLCBhcmdzKSkgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIGB0cnVlYCBpZiB0aGUgc3B5IHJldHVybmVkIGB2YWx1ZWAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLnJldHVybmVkID0gZnVuY3Rpb24odmFsdWUpe1xuICB2YXIgcmV0ID0gdGhpcy5yZXR1cm5zW3RoaXMucmV0dXJucy5sZW5ndGggLSAxXTtcbiAgcmV0dXJuIGVxbChyZXQsIHZhbHVlKTtcbn07XG5cbi8qKlxuICogYHRydWVgIGlmIHRoZSBzcHkgd2FzIGNhbGxlZCBvbmNlLlxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLm9uY2UgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gMSA9PSB0aGlzLmFyZ3MubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBgdHJ1ZWAgaWYgdGhlIHNweSB3YXMgY2FsbGVkIHR3aWNlLlxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLnR3aWNlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIDIgPT0gdGhpcy5hcmdzLmxlbmd0aDtcbn07XG5cbi8qKlxuICogYHRydWVgIGlmIHRoZSBzcHkgd2FzIGNhbGxlZCB0aHJlZSB0aW1lcy5cbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5wcm90by50aHJpY2UgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gMyA9PSB0aGlzLmFyZ3MubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBSZXNldCB0aGUgc3B5LlxuICpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5wcm90by5yZXNldCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMucmV0dXJucyA9IFtdO1xuICB0aGlzLmFyZ3MgPSBbXTtcbiAgdGhpcy51cGRhdGUoKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlc3RvcmUuXG4gKlxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLnJlc3RvcmUgPSBmdW5jdGlvbigpe1xuICBpZiAoIXRoaXMub2JqKSByZXR1cm4gdGhpcztcbiAgdmFyIG0gPSB0aGlzLm1ldGhvZDtcbiAgdmFyIGZuID0gdGhpcy5mbjtcbiAgdGhpcy5vYmpbbV0gPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgc3B5LlxuICpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxucHJvdG8udXBkYXRlID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5jYWxsZWQgPSAhISB0aGlzLmFyZ3MubGVuZ3RoO1xuICB0aGlzLmNhbGxlZE9uY2UgPSB0aGlzLm9uY2UoKTtcbiAgdGhpcy5jYWxsZWRUd2ljZSA9IHRoaXMudHdpY2UoKTtcbiAgdGhpcy5jYWxsZWRUaHJpY2UgPSB0aGlzLnRocmljZSgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVG8gZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHsuLi59IGFyZ3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHNweVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0b0Z1bmN0aW9uKGFyZ3MsIHNweSl7XG4gIHZhciBvYmogPSBhcmdzWzBdO1xuICB2YXIgbWV0aG9kID0gYXJnc1sxXTtcblxuICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gZnVuY3Rpb24gbm9vcCgpe307XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYXJncyl7IHJldHVybiBvYmouYXBwbHkobnVsbCwgYXJncyk7IH07XG4gICAgY2FzZSAyOlxuICAgICAgdmFyIG0gPSBvYmpbbWV0aG9kXTtcbiAgICAgIG1lcmdlKHNweSwgbSk7XG4gICAgICBzcHkubWV0aG9kID0gbWV0aG9kO1xuICAgICAgc3B5LmZuID0gbTtcbiAgICAgIHNweS5vYmogPSBvYmo7XG4gICAgICBvYmpbbWV0aG9kXSA9IHNweTtcbiAgICAgIHJldHVybiBmdW5jdGlvbihhcmdzKXtcbiAgICAgICAgcmV0dXJuIG0uYXBwbHkob2JqLCBhcmdzKTtcbiAgICAgIH07XG4gIH1cbn1cbiIsInZhciBpbnRlZ3JhdGlvbiA9IHJlcXVpcmUoJ2FuYWx5dGljcy5qcy1pbnRlZ3JhdGlvbicpO1xudmFyIGVhY2ggPSByZXF1aXJlKCdlYWNoJyk7XG5cbnZhciBSZXRlbnRpb25TY2llbmNlID0gbW9kdWxlLmV4cG9ydHMgPSBpbnRlZ3JhdGlvbignUmV0ZW50aW9uIFNjaWVuY2UnKVxuLmdsb2JhbCgnX3JzcScpXG4ub3B0aW9uKCdzaXRlSWQnLCAnJylcbi5vcHRpb24oJ2VuYWJsZU9uU2l0ZScsIGZhbHNlKVxuLm1hcHBpbmcoJ2N1c3RvbU1hcHBpbmdzJylcbi50YWcoJzxzY3JpcHQgc3JjPVwiLy9kMXN0eGZ2OTRocmhpYS5jbG91ZGZyb250Lm5ldC93YXZlcy92Mi93LmpzXCI+Jyk7XG5cblJldGVudGlvblNjaWVuY2UucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuX3JzcSA9IHdpbmRvdy5fcnNxIHx8IFtdO1xuICAgIHRoaXMubG9hZCh0aGlzLnJlYWR5KTtcbn07XG5cblJldGVudGlvblNjaWVuY2UucHJvdG90eXBlLmxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAhISh3aW5kb3cuX3JzcSk7XG59O1xuXG5SZXRlbnRpb25TY2llbmNlLnByb3RvdHlwZS5wYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fYWRkRGVmYXVsdHMoKTtcbiAgICB3aW5kb3cuX3JzcS5wdXNoKFsnX3RyYWNrJ10pO1xufTtcblxuUmV0ZW50aW9uU2NpZW5jZS5wcm90b3R5cGUudHJhY2sgPSBmdW5jdGlvbih0cmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbWFwcGluZ3MgPSB0aGlzLmN1c3RvbU1hcHBpbmdzKHRyYWNrLmV2ZW50KCkpO1xuICAgIGlmIChtYXBwaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVhY2goZnVuY3Rpb24obWFwcGluZykge1xuICAgICAgICAgICAgc2VsZi5fYWRkRGVmYXVsdHMoKTtcbiAgICAgICAgICAgIHNlbGYuX3B1c2goWydfc2V0QWN0aW9uJywgbWFwcGluZ10pO1xuICAgICAgICAgICAgc2VsZi5fcHVzaChbJ19zZXRQYXJhbXMnLCB0cmFjay5wcm9wZXJ0aWVzKCldKTtcbiAgICAgICAgICAgIHNlbGYuX3B1c2goWydfdHJhY2snXSk7XG4gICAgICAgIH0sIG1hcHBpbmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hZGREZWZhdWx0cygpO1xuICAgICAgICB0aGlzLl9wdXNoKFsnX3NldEFjdGlvbicsIHRyYWNrLmV2ZW50KCldKTtcbiAgICAgICAgdGhpcy5fcHVzaChbJ19zZXRQYXJhbXMnLCB0cmFjay5wcm9wZXJ0aWVzKCldKTtcbiAgICAgICAgdGhpcy5fcHVzaChbJ190cmFjayddKTtcbiAgICB9XG59O1xuXG5SZXRlbnRpb25TY2llbmNlLnByb3RvdHlwZS52aWV3ZWRQcm9kdWN0ID0gZnVuY3Rpb24odHJhY2spIHtcbiAgICB0aGlzLl9hZGREZWZhdWx0cygpO1xuICAgIHRoaXMuX2FkZFJTUHJvZHVjdCh0cmFjay5pZCgpIHx8IHRyYWNrLnNrdSgpLCB0cmFjay5uYW1lKCksIHRyYWNrLnByaWNlKCkpO1xuICAgIHdpbmRvdy5fcnNxLnB1c2goWydfdHJhY2snXSk7XG59O1xuXG5SZXRlbnRpb25TY2llbmNlLnByb3RvdHlwZS5jb21wbGV0ZWRPcmRlciA9IGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgdGhpcy5fYWRkRGVmYXVsdHMoKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fcHVzaChbJ19hZGRPcmRlcicsIHsgaWQ6IHRyYWNrLm9yZGVySWQoKSwgdG90YWw6IHRyYWNrLnJldmVudWUoKSB9XSk7XG4gICAgZWFjaChmdW5jdGlvbihwcm9kdWN0KSB7XG4gICAgICAgIHNlbGYuX2FkZFJTUHJvZHVjdChwcm9kdWN0LmlkIHx8IHByb2R1Y3Quc2t1LCBwcm9kdWN0Lm5hbWUsIHByb2R1Y3QucHJpY2UpO1xuICAgIH0sIHRyYWNrLnByb2R1Y3RzKCkgfHwgW10pO1xuICAgIHRoaXMuX3B1c2goWydfc2V0QWN0aW9uJywgJ2NoZWNrb3V0X3N1Y2Nlc3MnXSk7XG4gICAgdGhpcy5fcHVzaChbJ190cmFjayddKTtcbn07XG5cblJldGVudGlvblNjaWVuY2UucHJvdG90eXBlLmFkZGVkUHJvZHVjdCA9IGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgdGhpcy5fYWRkRGVmYXVsdHMoKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fYWRkUlNQcm9kdWN0KHRyYWNrLmlkKCkgfHwgdHJhY2suc2t1KCksIHRyYWNrLm5hbWUoKSwgdHJhY2sucHJpY2UoKSk7XG4gICAgdGhpcy5fcHVzaChbJ19zZXRBY3Rpb24nLCAnc2hvcHBpbmdfY2FydCddKTtcbiAgICB0aGlzLl9wdXNoKFsnX3RyYWNrJ10pO1xufTtcblxuUmV0ZW50aW9uU2NpZW5jZS5wcm90b3R5cGUuX2FkZERlZmF1bHRzID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gU2l0ZSBpZC5cbiAgICB0aGlzLl9wdXNoKFsnX3NldFNpdGVJZCcsIHRoaXMub3B0aW9ucy5zaXRlSWRdKTtcblxuICAgIC8vIEVuYWJsZSBvbiBzaXRlLlxuICAgIGlmICh0aGlzLm9wdGlvbnMuZW5hYmxlT25TaXRlKSB7XG4gICAgICAgIHRoaXMuX3B1c2goWydfZW5hYmxlT25TaXRlJ10pO1xuICAgIH1cblxuICAgIC8vIFVzZXJJZC5cbiAgICB2YXIgdXNlcklkID0gdGhpcy5hbmFseXRpY3MudXNlcigpLmlkKCk7XG4gICAgdGhpcy5fcHVzaChbJ19zZXRVc2VySWQnLCB1c2VySWRdKTtcblxuICAgIC8vIEVtYWlsLlxuICAgIHZhciBlbWFpbCA9ICh0aGlzLmFuYWx5dGljcy51c2VyKCkudHJhaXRzKCkgfHwge30pLmVtYWlsO1xuICAgIHRoaXMuX3B1c2goWydfc2V0VXNlckVtYWlsJywgZW1haWxdKTtcbn07XG5cblJldGVudGlvblNjaWVuY2UucHJvdG90eXBlLl9hZGRSU1Byb2R1Y3QgPSBmdW5jdGlvbihpZCwgbmFtZSwgcHJpY2UpIHtcbiAgICB0aGlzLl9wdXNoKFsnX2FkZEl0ZW0nLCB7IGlkOiBpZCwgbmFtZTogbmFtZSwgcHJpY2U6IHByaWNlIH1dKTtcbn07XG5cblJldGVudGlvblNjaWVuY2UucHJvdG90eXBlLl9wdXNoID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgdmFyIGV2ZW50ID0gYXJyLnNsaWNlKDAsIDEpO1xuXG4gICAgaWYgKGFyci5sZW5ndGggPiAxKSB7XG4gICAgICAgIHZhciBwYXJhbSA9IGFyclsxXTtcbiAgICAgICAgdmFyIHBhcmFtVHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwYXJhbSk7XG4gICAgICAgIGlmIChwYXJhbVR5cGUgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgICAgICB2YXIgc3RyaW5nZWQgPSB7fTtcbiAgICAgICAgICAgIGVhY2goZnVuY3Rpb24odiwgaSkge1xuICAgICAgICAgICAgICAgIHN0cmluZ2VkW2ldID0gdiA/IFN0cmluZyh2KSA6ICcnO1xuICAgICAgICAgICAgfSwgcGFyYW0pO1xuICAgICAgICAgICAgZXZlbnQucHVzaChzdHJpbmdlZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBldmVudC5wdXNoKHBhcmFtID8gU3RyaW5nKHBhcmFtKSA6ICcnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHdpbmRvdy5fcnNxLnB1c2goZXZlbnQpO1xuICAgIHJldHVybiBldmVudDtcbn07XG4iXX0=