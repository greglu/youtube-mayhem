/**
 * Example initialization:
 *
 *     // Set the Youtube player to play within this div. Expects a jquery object.
 *     Youtube.setContainer($('#youtube-window'));
 *     Youtube.loadVideo("itvJybdcYbI");
 *
 * Calling Youtube.loadVideo(youtubeIdOrLink, userOptions) will cause it to autoplay as soon as it's
 * loaded. The following is a list of arguments:
 *
 *   - youtubeIdOrLink: accepts a full youtube URL or just the ID (which is an 11 character alphanumeric string)
 *   - userOptions (map object):
 *      - startTime (defaults to 0): integer argument in seconds that represents the point in the video to
 *                                at which to start playback.
 *      - loop (defaults to 0): set this to 1 to keep looping the video
 *
 * Javascript API controls:
 *   - Youtube.play
 *   - Youtube.pause
 *   - Youtube.stop
 *   - Youtube.taylorswift
 *   - Youtube.reloadVideo
 *   - Youtube.unloadVideo
 *
 * Browser resize events should call Youtube.resizeVideo in order to adapt to the viewport size:
 *
 *     $(window).resize(debounce(Youtube.resizeVideo, 500));
 *
 */

window.Youtube = {};

(function(yt) {

  yt.setContainer = function(ele) {
    yt.container = $(ele);
  };

  yt.loadVideo = function(youtubeIdOrLink, userOptions) {
    // startTime: defines the time position (in seconds) at which to begin playing the video.
    // loop: 0 or 1 to continuously loop the video.
    var options = $.extend({ startTime: 0, loop: 0 }, userOptions);

    var youtubeId = yt.extractYoutubeId(youtubeIdOrLink);
    if (!youtubeId) {
      console.log("Youtube ID not found from: " + youtubeIdOrLink);
      return;
    }

    // If a video is already playing, we can stop it by removing the SWF
    yt.unloadVideo();

    // Using swfobject will consume the containing div, so we need to re-append it
    if (yt.container.find('#ytapiplayer').length == 0) {
      yt.container.append($('<div id="ytapiplayer"/>'));
    }

    var youtubeEmbedLink = "http://www.youtube.com/v/" + youtubeId +
      "?enablejsapi=1&modestbranding=1&rel=0&showinfo=0&autohide=1&" +
      "iv_load_policy=3&version=3&autoplay=1&playerapiid=ytplayer&start=" + options.startTime;

    // In order to loop a single video, you need to create a "playlist" out of it. This is documented
    // in the Youtube API (https://developers.google.com/youtube/player_parameters#loop)
    if (options.loop == 1) {
      youtubeEmbedLink += "&loop=1&playlist=" + youtubeId;
    }

    // Ordered arguments and optionals instead of using an argument map makes me cry.
    // https://code.google.com/p/swfobject/wiki/documentation#STEP_3:_Embed_your_SWF_with
    swfobject.embedSWF(youtubeEmbedLink, "ytapiplayer",
      $(window).width(), $(window).height(), "8", null, null,
      { allowScriptAccess: "always" }, { id: "ytplayer" });

    yt.currentYoutubeId = youtubeId;
  };

  yt.unloadVideo = function() {
    if (yt.player) {
      swfobject.removeSWF(yt.player.id);
      yt.player = null;
    }
  };

  // Reloads a currently playing video and resumes at the same place.
  yt.reloadVideo = function() {
    if (!yt.currentYoutubeId) { return; }
    var resumeTime = yt.player.getCurrentTime();
    yt.loadVideo(yt.currentYoutubeId, resumeTime);
  };

  // Resize the video player to fit the screen. Bind to the window resize event
  yt.resizeVideo = function(e) {
    if (yt.player) {
      $(yt.player).width($(window).width()).height($(window).height());
    }
  };

  // Accepts a link or id (youtube format is 11 alphanumeric characters), parses out the
  // youtube id and returns it.
  yt.extractYoutubeId = function(idOrLink) {
    if (idOrLink.match(/^\s*([A-Za-z0-9]{11})\s*$/)) {
      return idOrLink;
    } else {
      var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      var match = idOrLink.match(regExp);
      if (match && match[7].length == 11) {
        return match[7];
      }
    }
  };

  // The Youtube API will call the window.onYouTubePlayerReady function on player ready,
  // but that function just delegates to this one to keep code organized.
  yt.onYouTubePlayerReady = function(playerId) {
    yt.player = document.getElementById(playerId);

    // The following is an example of adding an event listener on the youtube player.
    // Refer here for more info: https://developers.google.com/youtube/js_api_reference#Events
    // ytplayer.addEventListener('onStateChange', 'stateChange');
  };

  yt.play = function() {
    if (!yt.player) { return; }
    yt.player.playVideo();
  };

  yt.pause = function() {
    if (!yt.player) { return; }
    yt.player.pauseVideo();
  };

  yt.stop = function() {
    if (!yt.player) { return; }
    yt.player.stopVideo();
  };

  yt.taylorswift = function() {
    yt.loadVideo("vNoKguSdy4Y");
  };

})(window.Youtube);

// This is a youtube built-in callback function convention. We're just delegating
// to the namespaced function.
function onYouTubePlayerReady(playerId) {
  Youtube.onYouTubePlayerReady(playerId);
}

// Stolen from underback.js
function debounce(func, wait, immediate) {
  var timeout, result;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) result = func.apply(context, args);
    return result;
  };
}

$(function() {
  Youtube.setContainer($('#youtube-window'));
  Youtube.loadVideo("itvJybdcYbI");
  $(window).resize(debounce(Youtube.resizeVideo, 300));
});
