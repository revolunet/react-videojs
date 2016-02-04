var cx = require('classnames');
var blacklist = require('blacklist');
var React = require('react');
var ReactDOM = require('react-dom');

module.exports = React.createClass({
  displayName: 'VideoJS',

  componentDidMount() {
    // due to the DOM-destructive nature of VideosJS
    // we cant render the video tag directly as react element
    // so we add this part to the DOM on componentDidMount
    // this is necessary if VideoJS needs to update its DOM later
    let video = document.createElement('video');
    let source = document.createElement('source');
    video.appendChild(source);

    let attrs = blacklist(this.props, 'children', 'className', 'src', 'type', 'onPlay', 'onPlayerInit', 'onPause', 'options');
    attrs.class = cx(this.props.className, 'videojs', 'video-js vjs-default-skin vjs-big-play-centered');

    Object.keys(attrs).forEach(key => {
      video.setAttribute(key, attrs[key]);
    });

    if (this.props.options) {
      video.setAttribute('data-setup', JSON.stringify(this.props.options));
    }

    source.setAttribute('src', this.props.src);
    source.setAttribute('type', this.props.type);

    this.refs.target.appendChild(video);

    let self = this;

    videojs(video, this.props.options).ready(function() {
      self.player = this;

      if(self.props.onPlay) {
        self.player.on('play', function() {
          self.props.onPlay(self.player);
        });
      }

      if(self.props.onPause) {
        self.player.on('pause', function() {
          self.props.onPause(self.player);
        });
      }
      
      if(self.props.onPlayerInit) {
        self.props.onPlayerInit(self.player);
      }

      self.togglePlatformUI(self.props);
    });

  },

  shouldComponentUpdate() {
    return false;
  },

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  },

  togglePlatformUI(props) {

    // and adjust based on platform
    this.player.controls(true);
    if (this.player.bigPlayButton) {
      this.player.bigPlayButton.show();
    }
    // disable per platform
    if (props.type === 'video/youtube') {
      // youtube has a mandatory play button
      if (this.player.bigPlayButton) {
        this.player.bigPlayButton.hide();
      }
    }
    if (props.type === 'video/vimeo'){
      // vimeo has its own mandatory controls
      this.player.controls(false);
    }
    if (props.type === 'video/dailymotion'){
      // dailymotion native controls works ok
      this.player.controls(false);
    }

    // manually change DOM elements colors if any defined
    if (props.options && props.options.color) {
      let el = ReactDOM.findDOMNode(this);
      let progress = el.querySelector('.vjs-play-progress');
      if (progress) {
          progress.style.backgroundColor = props.options.color;
      }
      let volume = el.querySelector('.vjs-volume-level');
      if (volume) {
          volume.style.backgroundColor = props.options.color;
      }
    }

  },

  componentWillReceiveProps(nextProps) {
    if (this.player && nextProps.src !== this.props.src) {
      this.player.pause();
      this.player.src({
        src: nextProps.src,
        type: nextProps.type
      });
      this.togglePlatformUI(nextProps);
    }
  },

  handlePlay: function() {
    if(this.props.onPlay) this.props.onPlay(this.player);
  },

  render() {
    return (<div ref="target"></div>);
  }

});
