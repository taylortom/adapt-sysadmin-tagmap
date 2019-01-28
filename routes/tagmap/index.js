const async = require('async');
const database = require('../../lib/database');
const express = require('express');

const app = require('../../lib/application')();
const server = express();

const PROJECT_PREFIX = '^' + app.configuration.getConfig('tagsProjectPrefix') || 'p-';
const MODULE_PREFIX = '^' + app.configuration.getConfig('tagsModulePrefix') || 'm-';

server.get('/api/tagmap', (req, res, next) => {
  getTagMap()
    .then(map => res.status(200).json(map))
    .catch(e => res.status(500).json({
      success: false,
      message: e.message
    }));
});

function getTagMap() {
  return new Promise((resolve, reject) => {
    Promise.all([getCourses(), getTags()]).then(data => {
      const [courses,tags] = data;
      for(let i = 0, count = courses.length; i < count; i++) {
        const course = courses[i];

        if(!course.tags.length) {
          continue;
        }
        for(let j = 0, count2 = course.tags.length; j < count2; j++) {
          const tag = course.tags[j];

          if(i === 0) console.log(tag.title);

          if(!course.projectTag && tag.title.match(PROJECT_PREFIX)) {
            course.projectTag = tag;
          } else if(!course.moduleTag && tag.title.match(MODULE_PREFIX)) {
            course.moduleTag = tag;
          }
        }
        courses[i] = course;
      }
      resolve({ courses, tags });
    }).catch(reject);
  });
}

function getCourses() {
  return new Promise((resolve, reject) => {
    app.db.retrieve('course', { _isShared: true }, { populate: { tags: '_id title' }, jsonOnly: true }, (error, courses) => {
      if(error) return reject(error);
      resolve(courses);
    });
  });
}

function getTags() {
  return new Promise((resolve, reject) => {
    app.db.retrieve('tag', { title: { $regex: PROJECT_PREFIX } }, { jsonOnly: true }, (error, tags) => {
      if(error) return reject(error);
      resolve(tags);
    });
  });
}

module.exports = server;
