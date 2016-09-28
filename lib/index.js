var integration = require('@segment/analytics.js-integration');
var each = require('@ndhoule/each');

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
