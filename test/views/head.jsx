var React = require('react');

module.exports = React.createClass({
   render: function() {
      return (
         <head>
            <title>{this.props.title}</title>
         </head>
      );
   }
});
