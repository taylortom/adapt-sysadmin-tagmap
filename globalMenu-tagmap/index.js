// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  var TagMapView = require('./views/tagMapView');

  Origin.on('origin:dataReady login:changed', function() {
    Origin.globalMenu.addItem({
      "location": "global",
      "text": Origin.l10n.t('app.tagmap'),
      "icon": "fa-book",
      "sortOrder": 3,
      "callbackEvent": "tagmap:open"
    });
  });

  Origin.on('globalMenu:tagmap:open', function() {
    Origin.router.navigateTo('tagmap');
  });

  Origin.on('router:tagmap', function(location, subLocation, action) {
    Origin.trigger('sidebar:sidebarContainer:hide');
    Origin.trigger('location:title:update', { title: Origin.l10n.t('app.tagmap') });
    Origin.contentPane.setView(TagMapView);
  });
});
