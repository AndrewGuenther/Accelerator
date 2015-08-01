# Accelerator
A [React][react] view engine for [Express][express] which supports client-side
mounting.

## Installing

```
npm install accelerator
```

## Adding Accelerator to your app
In your main app file, add the following:

```javascript
// app.js

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', require('accelerator').createEngine());
```

## Rendering a view
Here is a simple example of a route returning an Accelerator view

```javascript
// app.js

app.get('/', function(req, res) {
   res.render('homepage', {props: {name: 'Andrew'}});
});
```

When we render a view using Accelerator, the actual properties which will be
passed to our React element are stored in the `props` key of our options
object.

Here's what `homepage.jsx` looks like.

```javascript
// views/homepage.jsx

var React = require('react')

module.exports = React.createClass({
   render: function() {
      return (
         <div>
            <h1>Hello {this.props.name}</h1>
         </div>
      );
   }
});
```

Here's what the resulting HTML will look like:

```html
<html>
   <body>
      <div id="content">
         <div data-reactid=".hi3kxtgbnk" data-react-checksum="-480494251">
            <h1 data-reactid=".hi3kxtgbnk.0">What the Code</h1>
         </div>
      </div>
      <script>var APP_PROPS = {"name": "Andrew"};</script>
   </body>
</html>
```

So what did Accelerator do? When you pass a view to the `render()` function
Accelerator will require that file and render whatever React class is exported
to non-static markup. This means that the `react-id` and `data-react-checksum`
fields will be preserved (they're necessary for mounting on the client later).
The resulting element will then be mounted on a `<div>` with the `id`
"content." You will also notice that your `props` are nicely added there at the
bottom so that you can more easily mount cleanly on the client. Here's what
your client mounting will look like:

```javascript
// client.js

React.render(React.createElement(Homepage, APP_PROPS), document.getElementById("content"))
```

**Note:** This assumes that you've used [Browserify][browserify] to package up
your export from `homepage.jsx` above. The details of how to do this aren't
covered here. See the Browserify documentation.

**Another note:** The clever observer may notice that our example page has no
`<head>` element and also doesn't include `client.js` anywhere. I know it is
wrong, but don't worry, we'll get to that in a minute.

Why mount to "content" and not directly to the `<body>`? There's a few reasons.

1. React doesn't like mounting directly to the body, you'll see it
complain if you try.
1. Also, notice that nifty little `<script>` element with
your initial props in it at the bottom there? That can't be there if you mount
directly to the `<body>`, otherwise the checksum would fail when you try to
mount.
1. Lastly, this allows us to inject other static markup at the bottom of
the `<body>` without failing the checksum.

## The `head` and `post` properties
You'll notice that our above example is lacking a `<head>` element. Don't
worry, Accelerator will handle that. Let's expand a bit on our example.

```javascript
// app.js

app.get('/', function(req, res) {
   res.render('homepage', {
      props: {name: 'Andrew'},
      head: require('./views/head.jsx'),
      head_props: {title: 'My Homepage'},
      post: require('./views/post.jsx'),
      post_props: {src: '/js/client.js'} 
   });
});
```

Well that is certainly different. Let's take a look at these bad boys.

```javascript
// head.jsx

var React = require('react');

module.exports = React.createClass({
   render: function() {
      return (
         <head>
            <title>{this.props.title}</title>
            <link rel="stylesheet" type="text/css" href="/css/base.css" />
         </head>
   )}
});
```

```javascript
// post.jsx

var React = require('react');

module.exports = React.createClass({
   render: function() {
      return (
         <div>
            <script src="http://fb.me/react-0.13.3.js"></script>
            <script src={this.props.src}></script>
         </div>
   )}
});
```

Accelerator renders both the `head` and `post` parameters to **static** markup
and inserts them above and below your the `<div id="content">` element,
respectively. As you have likely guessed, `head_props` and `post_props` get
passed as props when the elements are rendered.

So *now* what does our HTML look like?

```html
<html>
   <head>
      <title>My Homepage</title>
      <link rel="stylesheet" type="text/css" href="/css/base.css" />
   </head>
   <body>
      <div id="content">
         <div data-reactid=".hi3kxtgbnk" data-react-checksum="-480494251">
            <h1 data-reactid=".hi3kxtgbnk.0">What the Code</h1>
         </div>
      </div>
      <script>var APP_PROPS = {"name": "Andrew"};</script>
      <div>
         <script src="http://fb.me/react-0.13.3.js"></script>
         <script src="/js/client.js"></script>
      </div>
   </body>
</html>
```

And there you have it.

## TL;DR

Render a view like this:

```javascript
app.get('/', function(req, res) {
   res.render('homepage', {
      props: {name: 'Andrew'},
      head: require('./views/head.jsx'),
      head_props: {title: 'My Homepage'},
      post: require('./views/post.jsx'),
      post_props: {src: '/js/client.js'}
   });
});
```

And Accelerator will use it to generate a page based on this:

```html
<html>
   <head_elem />
   <body>
      <div id="content">
         <view_elem />
      </div>
      <script>var APP_PROPS=view_props;</script>
      <post_elem />
   </body>
</html>
```

Get it? Got it? Good. Don't get it? Feel free to submit an issue!

## Why not [express-react-views][express-react-views]?
The maintainers of the express-react-views project have explicitly stated that
they have no intent to supoort client-side mounting and reject any
contributions which try to add this functionality.

[react]: http://facebook.github.io/react/
[express]: http://expressjs.com/
[express-react-views]: https://github.com/reactjs/express-react-views
[browserify]: http://browserify.org/
