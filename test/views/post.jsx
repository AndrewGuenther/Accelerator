var React = require('react');

module.exports = React.createClass({
   render: function() {
      return (
         <div id="post">
            <script src={this.props.src} />
         </div>
      );
   }
});
