"use strict";

var cheerio = require('cheerio');
var engine_render = process.env.ACCELERATOR_COV
   ? require('../index-cov.js').createEngine()
   : require('../index.js').createEngine()
var render = function(view, options, test) {
   return engine_render(view, options, function(err, markup) {
      if (test) {
         test.ifError(err);
      }
      return markup;
   });
}

var Head = require('./views/head.jsx');
var Post = require('./views/post.jsx');

// Can we render a page without errors
exports.smokeNoProps = function(test) {
   var result = render('./test/views/smoke.jsx', {}, test);
   cheerio.load(result);
   test.done();
};

exports.simpleDocument = {
   setUp: function(callback) {
      this.page = render('./test/views/smoke.jsx', {}, null);
      this.$ = cheerio.load(this.page);
      callback();
   },
   // Check for expected element presence
   presence: function(test) {
      var $ = this.$
      test.ok($('div#content').length,
            'Document does not contain a #content div.');
      test.ok($('div.smoke').length,
            'Document does not contain generated view.');
      test.ok($('script#app-props').length,
            'Document does not contain generated view.');
      test.done()
   },
   // Check document structure
   structure: function(test) {
      var $ = this.$
      test.ok($('html > body > div#content > div.smoke').length,
            'View does not appear in expected document location.');
      test.ok($('html > body > script#app-props').length,
            'APP_PROPS do not appear in expected document location.');
      test.done();
   },
   // Check sibling ordering
   ordering: function(test) {
      var $ = this.$
      test.ok($('html > body > div#content ~ script#app-props').length,
            'APP_PROPS and #content are incorrectly ordered.');
      test.done();
   }
};

exports.smokeWithProps = function(test) {
   var result = render('./test/views/smokeWithProps.jsx', {
      props: { text: 'Testing...1, 2, 3' }
   }, test);
   cheerio.load(result);
   test.done();
};

exports.smokeWithHeadAndPost = function(test) {
   var result = render('./test/views/smokeWithProps.jsx', {
      props: { text: 'Testing...1, 2, 3' },
      head: Head,
      head_props: { title: 'Test head' },
      post: Post,
      post_props: { src: 'http://example.com' }
   }, test);
   cheerio.load(result);
   test.done();
};

exports.complexDocument = {
   setUp: function(callback) {
      this.page = render('./test/views/smokeWithProps.jsx', {
         props: { text: 'Testing...1, 2, 3' },
         head: Head,
         head_props: { title: 'Test head' },
         post: Post,
         post_props: { src: 'http://example.com' }
      }, null);
      this.$ = cheerio.load(this.page);
      callback();
   },
   // Check for expected element presence
   presence: function(test) {
      var $ = this.$;
      test.ok($('div#content').length,
            'Document does not contain a #content div.');
      test.ok($('div.smoke > span').length,
            'Document does not contain generated view.');
      test.ok($('script#app-props').length,
            'Document does not contain generated view.');
      test.ok($('head > title').length,
            'Document does not contain generated head.');
      test.ok($('div#post > script').length,
            'Document does not contain generated post.');
      test.done()
   },
   // Check document structure
   structure: function(test) {
      var $ = this.$;
      test.ok($('html > body > div#content > div.smoke > span').length,
            'View does not appear in expected document location.');
      test.ok($('html > body > script#app-props').length,
            'APP_PROPS do not appear in expected document location.');
      test.ok($('html > head > title').length,
            'Head element does not appear in expected document location.');
      test.ok($('html > body > div#post > script').length,
            'Post element does not appear in expected document location.');
      test.done();
   },
   // Check sibling ordering
   ordering: function(test) {
      var $ = this.$;
      test.ok($('html > head ~ body').length,
            'Head element and body are incorrectly ordered.');
      test.ok($('html > body > div#content ~ script#app-props ~ div#post').length,
            'APP_PROPS, #content, and post element are incorrectly ordered.');
      test.done();
   },
   // Check props content
   content: function(test) {
      var $ = this.$;
      test.equals($('div.smoke > span').text(), 'Testing...1, 2, 3',
            'Content does not contain the correct props');
      test.equals($('head > title').text(), 'Test head',
            'Head does not contain the correct props');
      test.equals($('div#post > script').attr('src'), 'http://example.com',
            'Post does not contain the correct props');
      test.ok($('script#app-props').text().indexOf('Testing...1, 2, 3'),
            'APP_PROPS script does not contain the correct props');
      test.done();
   }
};

