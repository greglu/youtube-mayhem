/**
 * Example usage:
 *
 *     Youtube.setContainer($('#youtube-window'));
 *     Youtube.loadVideo("itvJybdcYbI");
 *
 * Calling Youtube.loadVideo will cause it to autoplay as soon as it's loaded. You can control
 * it with Youtube.play(), Youtube.pause(), Youtube.stop(), or Youtube.taylorswift()
 *
 * Youtube.loadVideo will accept a full youtube URL or just the ID (which is an 11 character alphanumeric string).
 *
 * Browser resizes will cause the video player to be sizes incorrectly, so you can also include:
 *
 *     $(window).resize(debounce(Youtube.reloadVideo, 500));
 *
 * Which will reload the video, and resume at the same player position after resizing.
 *
 */

window.Youtube = {};

(function(yt) {

  yt.setContainer = function(ele) {
    yt.container = $(ele);
  };

  yt.loadVideo = function(youtubeIdOrLink, startTime) {
    var youtubeId = yt.extractYoutubeId(youtubeIdOrLink);

    if (!youtubeId) {
      console.log("Youtube ID not found from: " + youtubeIdOrLink);
      return;
    }

    // We need to be able to load a video at a specific start time in order to resume it on
    // browser resizes. If this argument isn't given, just start at the beginning of the video.
    if (!startTime) {
      startTime = 0;
    }

    // If a video is already playing, we can stop it by removing the SWF
    yt.unloadVideo();

    // Using swfobject will consume the containing div, so we need to re-append it
    if (yt.container.find('#ytapiplayer').length == 0) {
      yt.container.append($('<div id="ytapiplayer"/>'));
    }

    var params = { allowScriptAccess: "always" };
    var attrs = { id: "ytplayer" };
    swfobject.embedSWF("http://www.youtube.com/v/" + youtubeId +
        "?enablejsapi=1&modestbranding=1&rel=0&showinfo=0&autohide=1&" +
        "iv_load_policy=3&version=3&autoplay=1&playerapiid=ytplayer&start=" + startTime,
      "ytapiplayer", $(window).width(), $(window).height(), "8", null, null, params, attrs);

    yt.currentYoutubeId = youtubeId;
  };

  yt.unloadVideo = function() {
    if (yt.player) {
      swfobject.removeSWF(yt.player.id);
      yt.player = null;
    }
  };

  // Reloads a currently playing video and resumes at the same place. Bind this function to
  // the browser resize event in order to get the player size to keep fitting.
  yt.reloadVideo = function() {
    if (!yt.currentYoutubeId) { return; }
    var resumeTime = yt.player.getCurrentTime();
    yt.loadVideo(yt.currentYoutubeId, resumeTime);
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
  $(window).resize(debounce(Youtube.reloadVideo, 500));
});
