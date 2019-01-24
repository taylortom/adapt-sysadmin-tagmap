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
    getCourses().then(courses => {
      for(let i = 0, count = courses.length; i < count; i++) {
        const course = courses[i];
        if(!course.tags.length) {
          continue;
        }
        for(let j = 0, count2 = course.tags.length; j < count2; j++) {
          const tag = course.tags[j];
          if(!course.projectTag && tag.title.match(PROJECT_PREFIX)) {
            course.projectTag = tag;
          } else if(!course.moduleTag && tag.title.match(MODULE_PREFIX)) {
            course.moduleTag = tag;
          }
        }
      }
      resolve(courses);
    }).catch(reject);
  });
}

function getCourses() {
  return new Promise((resolve, reject) => {
    app.db.retrieve('course', {}, { populate: { tags: '_id title' } }, (error, courses) => {
      if(error) return reject(error);
      resolve(courses);
    });
  });
}

module.exports = server;
