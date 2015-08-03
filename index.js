"use strict";

var React = require('react');
require('node-jsx').install();

function buildDataString(props) {
   return "var APP_PROPS = " + JSON.stringify(props) + ";";
}

var Content = React.createClass({
   render: function() {
      return React.createElement("div", {
         id: "content",
         dangerouslySetInnerHTML: {
            __html: React.renderToString(React.createElement(this.props.app, this.props.data))
         }
      });
   }
});

var Page = React.createClass({
   render: function() {
      return React.createElement("html", null,
         this.props.head && React.createElement(this.props.head, this.props.head_props),
         React.createElement("body", null,
            this.props.app && React.createElement(Content, {
               app: this.props.app,
               data: this.props.app_props
            })
         ),
         React.createElement("script", {
            dangerouslySetInnerHTML: {
               __html: buildDataString(this.props.app_props)
            }
         }),
         this.props.post && React.createElement(this.props.post, this.props.post_props)
      )
   }
});

var PageFactory = React.createFactory(Page);

function createEngine(engineOptions) {
   function render(app_file, options, cb) {
      try{
         var app = require(app_file);
         var markup = React.renderToStaticMarkup(PageFactory({
            head: options.head,
            head_props: options.head_props,
            app: app,
            app_props: options.props,
            post: options.post,
            post_props: options.post_props
         }));
      } catch(e) {
         return cb(e);
      }

      return cb(null, markup);
   }
   return render;
}

exports.createEngine = createEngine;

