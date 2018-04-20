// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  var TagMapView = require('./views/tagMapView');

  Origin.on('sysadmin:ready', function() {
    Origin.trigger('sysadmin:addView', {
      name: 'tagmap',
      title: Origin.l10n.t('app.tagmap'),
      icon: 'fa-book',
      view: TagMapView
    });
  });
});
