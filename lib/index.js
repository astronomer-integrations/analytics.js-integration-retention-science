/* vim: set shiftwidth=2: */
'use strict';

var integration = require('@astronomerio/analytics.js-integration');
var each = require('@ndhoule/each');

var RetentionScience = module.exports = integration('Retention Science')
  .global('_rsq')
  .option('siteId', '')
  .option('enableOnSite', false)
  .mapping('reservedMappings') // RS has reserved event names, (shopping_cart, etc.). these are for mapping track events to these RS events
  .mapping('customMappings') // RS allows custom event names. these are for mapping track calls to custom events
  .tag('<script src="//d1stxfv94hrhia.cloudfront.net/waves/v2/w.js">');

RetentionScience.prototype.initialize = function() {
  window._rsq = window._rsq || [];
  this.load(this.ready);
};

RetentionScience.prototype.loaded = function() {
  return !!window._rsq;
};

RetentionScience.prototype.page = function() {
  this._addDefaults();
  this._push(['_track']);
};

RetentionScience.prototype.track = function(track) {
  var self = this;
  var reservedMappings = this.reservedMappings(track.event());
  var customMappings = this.customMappings(track.event());

  if (reservedMappings.length > 0) {
    each(function(mapping) {
      self._reservedEvent(mapping, track);
    }, reservedMappings);
  } else if (customMappings.length > 0) {
    each(function(mapping) {
      self._addDefaults();
      self._push(['_setAction', mapping]);
      self._push(['_setParams', track.properties()]);
      self._push(['_track']);
    }, customMappings);
  } else {
    this._addDefaults();
    this._push(['_setAction', track.event()]);
    this._push(['_setParams', track.properties()]);
    this._push(['_track']);
  }
};

RetentionScience.prototype._reservedEvent = function(event, track) {
  switch (event) {
  case 'shopping_cart':
    this._shoppingCart(track);
    break;
  case 'checkout_success':
    this._checkoutSuccess(track);
    break;
  default:
    break;
  }
};

RetentionScience.prototype.productViewed = function(track) {
  this._addDefaults();
  this._addRSProduct(track.id() || track.sku(), track.name(), track.price());
  window._rsq.push(['_track']);
};

RetentionScience.prototype.orderCompleted = function(track) {
  this._checkoutSuccess(track);
};

RetentionScience.prototype.productAdded = function(track) {
  this._addDefaults();
  this._addRSProduct(track.id() || track.sku(), track.name(), track.price());
  this._push(['_setAction', 'shopping_cart']);
  this._push(['_track']);
};

/**
 * Adds values added to every RS event by default.
 */
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
  var email = (this.analytics.user().traits() || {}).email || '';
  this._push(['_setUserEmail', email]);
};

RetentionScience.prototype._addRSProduct = function(id, name, price) {
  this._push(['_addItem', { id: id, name: name, price: price }]);
};

/**
 * Push
 * You interface with RS by calling: _rsq.push(['_addItem', {'id': 'item_id'}]);
 * with the appropriate parameters for each event.
 * RS wants the object that is the second value in the array to be stringified, so this converts any JavaScript objects
 * to a string and calls rsq.push with the updated param.
 *
 * @param {Array} arr The object being pushed onto the global rsq variable.
 */
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
};

/**
 * _checkoutSuccess
 * Takes a track parameter and converts it to a checkout_sucess event for RS.
 * @param {Obj} track
 */
RetentionScience.prototype._checkoutSuccess = function(track) {
  this._addDefaults();
  var self = this;
  this._push(['_addOrder', { id: track.orderId(), total: track.revenue() }]);
  each(function(product) {
    self._addRSProduct(product.id || product.sku, product.name, product.price);
  }, track.products() || []);
  this._push(['_setAction', 'checkout_success']);
  this._push(['_track']);
};

/**
 * Takes a track parameter and converts it to a shopping_cart event for RS.
 * @param {Obj} track
 */
RetentionScience.prototype._shoppingCart = function(track) {
  this._addDefaults();
  var self = this;

  // Shopping Cart can either be called with multiple products or just one. Check if there is a products array, and add the products accordingly.
  var products = track.products() || [];
  if (products.length > 0) {
    each(function(product) {
      self._addRSProduct(product.id || product.sku, product.name, product.price);
    }, products);
  } else {
    this._addRSProduct(track.id() || track.sku(), track.name(), track.price());
  }

  this._push(['_setAction', 'shopping_cart']);
  this._push(['_track']);
};
