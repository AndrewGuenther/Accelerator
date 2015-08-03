var React = require('react');

module.exports = React.createClass({
   render: function() {
      return (
         <div className="smoke">
            <span>{this.props.text}</span>
         </div>
      );
   }
});
