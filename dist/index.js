'use strict';

var cx = require('classnames');
var blacklist = require('blacklist');
var React = require('react');

module.exports = React.createClass({
  displayName: 'VideoJS',

  componentDidMount: function componentDidMount() {
    // due to the DOM-destructive nature of VideosJS
    // we cant render the video tag directly as react element
    // so we add this part to the DOM on componentDidMount
    // this is necessary if VideoJS needs to update its DOM later
    var video = document.createElement('video');
    var source = document.createElement('source');
    video.appendChild(source);

    var attrs = blacklist(this.props, 'children', 'className', 'src', 'type', 'onPlay', 'onPlayerInit', 'options');
    attrs.class = cx(this.props.className, 'videojs', 'video-js vjs-default-skin');

    Object.keys(attrs).forEach(function (key) {
      video.setAttribute(key, attrs[key]);
    });

    if (this.props.options) {
      video.setAttribute('data-setup', JSON.stringify(this.props.options));
    }

    source.setAttribute('src', this.props.src);
    source.setAttribute('type', this.props.type);

    this.refs.target.appendChild(video);

    var self = this;

    videojs(video, this.props.options).ready(function () {
      self.player = this;
      self.player.on('play', self.handlePlay);

      if (self.props.onPlayerInit) {
        self.props.onPlayerInit(this.player);
      }

      self.togglePlatformUI(self.props.type);
    });
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  },
  togglePlatformUI: function togglePlatformUI(platform) {
    // when src changes, restore initial UI
    // and adjust based on platform
    this.player.controls(true);
    if (this.player.bigPlayButton) {
      this.player.bigPlayButton.show();
    }
    // disable per platform
    if (platform === 'video/youtube') {
      // youtube has a mandatory play button
      if (this.player.bigPlayButton) {
        this.player.bigPlayButton.hide();
      }
    }
    if (platform === 'video/vimeo') {
      // vimeo has mandatory controls
      this.player.controls(false);
    }
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (this.player) {
      this.player.pause();
      this.player.src({
        src: nextProps.src,
        type: nextProps.type
      });
      this.togglePlatformUI(nextProps.type);
    }
  },

  handlePlay: function handlePlay() {
    if (this.props.onPlay) this.props.onPlay(this.player);
  },

  render: function render() {
    return React.createElement('div', { ref: 'target' });
  }
});