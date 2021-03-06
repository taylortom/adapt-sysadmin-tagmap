// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Backbone = require('backbone');
  var Origin = require('core/origin');
  var OriginView = require('core/views/originView');
  var ContentCollection = require('core/collections/contentCollection');
  var TagCollection = Backbone.Collection.extend({ url: '/api/content/tag' });

  var TagMapView = OriginView.extend({
    className: 'tagmap',
    settings: {
      autoRender: false
    },
    events: {
      'click button.sort': 'onSortClicked',
      'click button.tag': 'onTagClicked'
    },
    sorts: {
      date: {
        regular: function(a, b) {
          var aDate = new Date(a.get('updatedAt'));
          var bDate = new Date(b.get('updatedAt'));
          return aDate > bDate ? 1 : bDate > aDate ? -1 : 0;
        },
        reverse: function(a, b) {
          var aDate = new Date(a.get('updatedAt'));
          var bDate = new Date(b.get('updatedAt'));
          return aDate < bDate ? 1 : bDate < aDate ? -1 : 0;
        }
      },
      module: {
        regular: function(a, b) {
          return a.get('moduleTag').title.localeCompare(b.get('moduleTag').title);
        },
        reverse: function(a, b) {
          return b.get('moduleTag').title.localeCompare(a.get('moduleTag').title);
        }
      },
      project: {
        regular: function(a, b) {
          return a.get('projectTag').title.localeCompare(b.get('projectTag').title);
        },
        reverse: function(a, b) {
          return b.get('projectTag').title.localeCompare(a.get('projectTag').title);
        }
      },
      title: {
        regular: function(a, b) {
          return a.get('title').localeCompare(b.get('title'));
        },
        reverse: function(a, b) {
          return b.get('title').localeCompare(a.get('title'));
        }
      }
    },

    initialize: function(options) {
      this.model = new Backbone.Model({
        allCourses: new Backbone.Collection(),
        courses: new Backbone.Collection(),
        currentSort: 'module'
      });
      this.listenTo(Origin, 'tagmap:filter', this.onFilterClicked);
      OriginView.prototype.initialize.apply(this, arguments);
    },

    preRender: function() {
      this.fetchData(function() {
        this.filterCourses();
        this.doSort('module');
      });
    },

    fetchData: function(cb) {
      $.get('api/tagmap', function(data) {
        this.model.get('allCourses').add(data.courses);
        this.model.get('courses').add(data.courses);
        (new TagCollection()).fetch({
          success: function(tags) {
            this.model.set({
              tagIds: tags.map(function(tag) { return tag.get('_id'); }),
              projectTags: data.tags
            });
            cb.call(this);
          }.bind(this)
        });
      }.bind(this));
    },

    filterCourses: function() {
      var allTagIds = this.model.get('tagIds');
      // only want matching courses
      var filtered = this.model.get('allCourses').filter(_.bind(function(course) {
        var courseTagIds = course.get('tags').map(function(tag) {
          return tag._id;
        });
        return _.intersection(courseTagIds, allTagIds).length > 0;
      }, this));
      this.model.set('courses', new Backbone.Collection(filtered));

      this.doSort('module');
    },

    doesCourseHaveTag: function(course, tag) {
      var ret = false;
      course.get('tags').forEach(function(courseTag) {
        if(courseTag._id === tag.get('_id')) return ret = true;
      });
      return ret;
    },

    doSort: function(type) {
      this.model.get('courses').comparator = this.getSortFunction(type);
      this.model.get('courses').sort();
      this.model.set({ currentSort: type, isReverseSort: this.isReverseSort() });
      this.render();
    },

    getSortFunction: function(type) {
      var sort = this.sorts[type];
      var shouldReverse = this.model.get('currentSort') === type && !this.isReverseSort();
      return shouldReverse ? sort.reverse : sort.regular;
    },

    isReverseSort: function() {
      var sort = this.sorts[this.model.get('currentSort')];
      return this.model.get('courses').comparator === sort.reverse;
    },

    onFilterClicked: function(event) {
      this.$('.filters').toggleClass('hidden');
    },

    onSortClicked: function(event) {
      this.doSort($(event.currentTarget).attr('data-id'));
    },

    onTagClicked: function(event) {
      var filter = $(event.currentTarget).attr('data-id');
      this.model.set('tagFilter', (filter === this.model.get('tagFilter')) ? '' : filter);
      this.render();
    }
  }, { template: 'tagMap' });

  return TagMapView;
});
