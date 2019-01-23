const async = require('async');
const database = require('../../lib/database');
const express = require('express');

const app = require('../../lib/application')();
const server = express();

const PROJECT_PREFIX = app.configuration.getConfig('tagsProjectPrefix') || 'x-';
const MODULE_PREFIX = app.configuration.getConfig('tagsModulePrefix') || 'y-';

server.get('/api/tagmap', (req, res, next) => {
  getTagMap()
    .then(map => res.status(200).json(map))
    .catch(e => res.status(500).json({
      success: false,
      message: e.message
    }));
});

function getTagMap() {
  const map = {};

  return new Promise((resolve, reject) => {
    Promise.all([getCourses(), getTags()]).then(data => {
      const courses = data[0];
      const projectTags = data[1].project;
      const moduleTags = data[1].module;

      courses.forEach(course => {
        if(!course.tags.length) {
          return;
        }
        let gotProject = gotModule = false;

        course.tags.forEach(tag => {
          if(gotProject && gotModule) {
            console.log(course);
            return;
          }
          projectTags.forEach(pTag => {
            if(pTag.get('_id').toString() === tag._id.toString()) {
              course.projectTag = pTag;
              return
            }
          });
          moduleTags.forEach(mTag => {
            if(mTag.get('_id').toString() === tag._id.toString()) {
              course.moduleTag = mTag;
              return
            }
          });
        });
        resolve(courses);
      });
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

function getTags() {
  return new Promise((resolve, reject) => {
    app.contentmanager.getContentPlugin('tag', (error, plugin) => {
      if(error) {
        return reject(error);
      }
      async.parallel([
        cb => plugin.retrieve({ title: { $regex: `^${PROJECT_PREFIX}` } }, (error, tags) => cb(error, tags)),
        cb => plugin.retrieve({ title: { $regex: `^${MODULE_PREFIX}` } }, (error, tags) => cb(error, tags))
      ], (error, results) => {
        if(error) return reject(error);
        resolve({ project: results[0], module: results[1] });
      });
    });
  });
}

module.exports = server;
