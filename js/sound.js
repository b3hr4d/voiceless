// Amine Hallili
//hooking the interface object to the window
window.View = new View();

// The current song
var currentSong;

// The audio context
var context;

var buttonPlay, buttonStop, buttonPause, buttonRecordMix, swChords;
// List of tracks and mute buttons
var divTrack;
//The div where we display messages
var divConsole;

// Object that draws a sample waveform in a canvas
var waveformDrawer;

// zone selected for loop
var selectionForLoop = {
  xStart: -1,
  xEnd: -1,
};

//Loading Complete
var AllLoadingFinished = false;
// Sample size in pixels
var SAMPLE_HEIGHT = 40;

// Useful for memorizing when we paused the song
var lastIncomeSample = null;
var lastTime = 0;
var currentTime;
var delta;
// The x position in pixels of the timeline
var currentXTimeline;

// requestAnim shim layer by Paul Irish, like that canvas animation works
// in all browsers
window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (/* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

function init() {
  View.init();
  BhdDraw.prepare();
  // Get handles on buttons
  // buttonPlay = document.getElementById("play-button");
  buttonPause = document.getElementById("pause-button");
  buttonStop = document.getElementById("stop-button");
  buttonRecordMix = document.getElementById("recordMix");

  // The waveform drawer
  waveformDrawer = new WaveformDrawer();

  View.frontCanvas.addEventListener("mouseup", function (event) {
    if (!existsSelection()) {
      var mousePos = getMousePos(window.View.frontCanvas, event);
      // will compute time from mouse pos and start playing from there...
      jumpTo(mousePos.x);
    }
  });

  // Mouse listeners for loop selection
  initLoopABListeners();

  // Master volume slider
  masterVolumeSlider = $("#masterVolume").val();

  // Init audio context
  context = initAudioContext();
}

function existsSelection() {
  return selectionForLoop.xStart !== -1 && selectionForLoop.xEnd !== -1;
}

function loopOnOff() {
  currentSong.toggleLoopMode();
  $("#loopOnOff").toggleClass("activated");
}

function setLoopStart() {
  if (!currentSong.paused) {
    selectionForLoop.xStart = currentXTimeline;
    // Switch xStart and xEnd if necessary, compute width of selection
    adjustSelectionMarkers();
  }
}

function setLoopEnd() {
  if (!currentSong.paused) {
    selectionForLoop.xEnd = currentXTimeline;
    // Switch xStart and xEnd if necessary, compute width of selection
    adjustSelectionMarkers();
  }
}

function resetSelection() {
  selectionForLoop = {
    xStart: -1,
    xEnd: -1,
  };
}

function initLoopABListeners() {
  // For loop A/B selection
  $("#" + View.frontCanvas.id).mousedown(function (event) {
    resetSelection();
    var previousMousePos = getMousePos(window.View.frontCanvas, event);
    selectionForLoop.xStart = previousMousePos.x;

    $("#" + View.frontCanvas.id).bind("mousemove", previousMousePos, function (
      event
    ) {
      // calculate move angle minus the angle onclick
      var mousePos = getMousePos(window.View.frontCanvas, event);

      //    + mousePos.x + ", " + mousePos.y +")");
      selectionForLoop.xEnd = mousePos.x;

      // Switch xStart and xEnd if necessary, compute width of selection
      adjustSelectionMarkers();
    });
  });

  /**
   * Remove listener when mouseup
   */
  $("#" + View.frontCanvas.id).mouseup(function () {
    $("#" + View.frontCanvas.id).unbind("mousemove");
  });
}

function adjustSelectionMarkers() {
  if (existsSelection()) {
    // Adjust the different values of the selection
    var selectionWidth = Math.abs(
      selectionForLoop.xEnd - selectionForLoop.xStart
    );
    var start = Math.min(selectionForLoop.xStart, selectionForLoop.xEnd);
    var end = Math.max(selectionForLoop.xStart, selectionForLoop.xEnd);
    selectionForLoop = {
      xStart: start,
      xEnd: end,
      width: selectionWidth,
    };
  }
}

function initAudioContext() {
  audioContext = window.AudioContext || window.webkitAudioContext;

  var ctx = new audioContext();

  if (ctx === undefined) {
    throw new Error("AudioContext is not supported. :(");
  }

  return ctx;
}
// SOUNDS AUDIO ETC.

function resetAllBeforeLoadingANewSong() {
  // disable the menu for selecting song: avoid downloading more than one song
  // at the same time
  // var s = document.querySelector("#songSelect");
  // s.disabled = true;

  // reset the selection
  resetSelection();

  // Stop the song
  stopAllTracks();

  // buttonPlay.disabled = true;
  // divTrack.innerHTML = "";

  AllLoadingFinished = false;
  buttonRecordMix.disabled = true;
}

var bufferLoader;

function loadAllSoundSamples() {
  bufferLoader = new BufferLoader(
    context,
    currentSong.getUrlsOfTracks(),
    finishedLoading,
    drawTrack
  );
  bufferLoader.load();
}

function drawTrack(decodedBuffer, trackNumber) {
  // var trackName = currentSong.tracks[trackNumber].name;
  //trackName = trackName.slice(trackName.lastIndexOf("/")+1, trackName.length-4);

  waveformDrawer.init(decodedBuffer, View.masterCanvas, "#83E83E");
  var x = 0;
  var y = trackNumber * SAMPLE_HEIGHT;
  // First parameter = Y position (top left corner)
  // second = height of the sample drawing
  waveformDrawer.drawWave(y, SAMPLE_HEIGHT);

  // View.masterCanvasContext.strokeStyle = "white";
  // View.masterCanvasContext.strokeRect(x, y, window.View.masterCanvas.width, SAMPLE_HEIGHT);

  // View.masterCanvasContext.font = '14pt Arial';
  // View.masterCanvasContext.fillStyle = 'white';
  // View.masterCanvasContext.fillText(trackName, x + 10, y + 20);
}

function finishedLoading(bufferList) {
  // set the decoded buffer in the song object
  currentSong.setDecodedAudioBuffers(bufferList);

  // buttonPlay.disabled = false;
  buttonRecordMix.disabled = false;
  playAllTracks(0);
  //enabling the loop buttons
  $("#loopBox > button").each(function (key, item) {
    item.disabled = false;
  });

  // enable all mute/solo buttons
  $(".mute").attr("disabled", false);
  $(".solo").attr("disabled", false);
  $("footer").animate({ bottom: 0 }, "slow");
  // enable song select menu
  // var s = document.querySelector("#songSelect");
  // s.disabled = false;

  // Set each track volume slider to max
  for (i = 0; i < currentSong.getNbTracks(); i++) {
    // set volume gain of track i to max (1)
    //currentSong.setVolumeOfTrack(1, i);
    $(".volumeSlider").each(function (obj, value) {
      obj.value = 100;
    });
  }
  AllLoadingFinished = true;
}
// ##### TRACKS #####

function loadSong(songNum) {
  console.log(lastIncomeSample, "ane?");

  if (lastIncomeSample != songNum) {
    // animateTime();
    resetAllBeforeLoadingANewSong();
    // This function builds the current
    // song and resets all states to default (zero muted and zero solo lists, all
    // volumes set to 1, start at 0 second, etc.)
    currentSong = new Song(songNum, context);
    // get a JSON description of the song
    // var song = {"id":"sina","instruments":[{"name":"sina","sound":"Amdan-sina.mp3"},{"name":"sina2","sound":"Amdan-sina-original.mp3"}]}
    var song = {
      id: songNum,
      instruments: [
        {
          name: "song-" + songNum,
          sound: app.nameGenerator(songArray[songNum]),
        },
        {
          name: "vocal-" + songNum,
          sound: app.nameGenerator(vocalArray[songNum]),
        },
      ],
    };
    // resize canvas depending on number of samples
    resizeSampleCanvas(song.instruments.length);
    // for eah instrument/track in the song
    song.instruments.forEach(function (instrument, trackNumber) {
      // Let's add a new track to the current song for this instrument
      currentSong.addTrack(instrument);
    });
    // Add range listeners, from range-input.js
    addRangeListeners();
    // disable all mute/solo buttons
    $(".mute").attr("disabled", true);
    $(".solo").attr("disabled", true);
    // Loads all samples for the currentSong
    loadAllSoundSamples();
    lastIncomeSample = songNum;
  }
}

function getMousePos(canvas, evt) {
  // get canvas position
  var obj = canvas;
  var top = 0;
  var left = 0;
  while (obj && obj.tagName != "BODY") {
    top += obj.offsetTop;
    left += obj.offsetLeft;
    obj = obj.offsetParent;
  }
  // return relative mouse position
  var mouseX = evt.clientX - left + window.pageXOffset;
  var mouseY = evt.clientY - top + window.pageYOffset;
  return {
    x: mouseX,
    y: mouseY,
  };
}

// Michel Buffa : x is in pixels, should be in seconds, and this function should
// be moved into song.js, and elapsedTimeSinceStart be an attribute...
function jumpTo(x) {
  // is there a song loaded ?
  if (currentSong === undefined) return;

  // width - totalTime
  // x - ?
  stopAllTracks();
  var totalTime = currentSong.getDuration();
  var startTime = (x * totalTime) / window.View.frontCanvas.width;
  currentSong.elapsedTimeSinceStart = startTime;
  playAllTracks(startTime);
}
function wordJumper(x) {
  if (currentSong === undefined) return;
  stopAllTracks();
  playAllTracks(x);
}
// A better function for displaying float numbers with a given number
// of digits after the int part
function toFixed(value, precision) {
  var power = Math.pow(10, precision || 0);
  return String(Math.round(value * power) / power);
}

function animateTime() {
  // clear canvas
  View.frontCanvasContext.clearRect(
    0,
    0,
    window.View.masterCanvas.width,
    window.View.masterCanvas.height
  );
  // View.waveCanvasContext.clearRect(0, 0, window.View.waveCanvas.width, window.View.waveCanvas.height);
  // Draw something only if a song has been loaded
  if (currentSong !== undefined) {
    // Draw selection for loop
    drawSelection();

    if (!currentSong.paused) {
      // Draw the time on the front canvas
      currentTime = context.currentTime;
      var delta = currentTime - lastTime;

      var totalTime;

      // View.waveCanvasContext.fillStyle = 'white';
      // View.waveCanvasContext.font = '2.1rem Arial';
      // View.waveCanvasContext.fillText(toFixed(currentSong.elapsedTimeSinceStart, 1) + "s", 180, 20);

      // at least one track has been loaded
      if (currentSong.decodedAudioBuffers[0] !== undefined) {
        totalTime = currentSong.getDuration();
        currentXTimeline =
          (currentSong.elapsedTimeSinceStart * window.View.masterCanvas.width) /
          totalTime;

        // draw frequencies that dance with the music
        // drawFrequencies();

        // Draw time bar
        View.frontCanvasContext.strokeStyle = "white";
        View.frontCanvasContext.lineWidth = 2;
        View.frontCanvasContext.beginPath();
        View.frontCanvasContext.moveTo(currentXTimeline, 0);
        View.frontCanvasContext.lineTo(
          currentXTimeline,
          window.View.masterCanvas.height
        );
        View.frontCanvasContext.stroke();

        currentSong.elapsedTimeSinceStart += delta;
        lastTime = currentTime;

        if (currentSong.loopMode) {
          // Did we reach the end of the loop
          if (existsSelection()) {
            if (currentXTimeline > selectionForLoop.xEnd) {
              jumpTo(selectionForLoop.xStart);
            }
          }
        }

        // Did we reach the end of the song ?
        if (currentSong.elapsedTimeSinceStart > currentSong.getDuration()) {
          // Clear the console

          // Stop the current song
          stopAllTracks();
        }
      }
    }
  } else {
    // showWelcomeMessage();
  }
  // requestAnimFrame(animateTime);
}
/*
function showWelcomeMessage() {
    View.frontCanvasContext.save();
    View.frontCanvasContext.font = '14pt Arial';
    View.frontCanvasContext.fillStyle = 'white';
    View.frontCanvasContext.fillText('Welcome to MT5, start by choosing a song ', 50, 200);
    View.frontCanvasContext.fillText('in this drop down menu! ', 50, 220);
    View.frontCanvasContext.fillText('Documentation and HowTo in the ', 315, 100);
    View.frontCanvasContext.fillText('first link of the Help tab there! ', 315, 120);

    // Draws an arrow in direction of the drop down menu
    // x1, y1, x2, y2, width of arrow, color
    drawArrow(View.frontCanvasContext, 180, 170, 10, 10, 10, 'lightGreen');
    drawArrow(View.frontCanvasContext, 450, 80, 450, 10, 10, 'lightGreen');

    View.frontCanvasContext.restore();
}
*/
function drawSelection() {
  View.frontCanvasContext.save();

  if (existsSelection()) {
    // draw selection
    View.frontCanvasContext.fillStyle = "rgba(0, 240, 240, 0.4)";
    View.frontCanvasContext.fillRect(
      selectionForLoop.xStart,
      0,
      selectionForLoop.width,
      window.View.frontCanvas.height
    );
  }
  View.frontCanvasContext.restore();
}

function drawFrequencies() {
  View.waveCanvasContext.save();
  View.waveCanvasContext.fillStyle = "rgba(0, 0, 0, 0.05)";
  View.waveCanvasContext.fillRect(
    0,
    0,
    View.waveCanvas.width,
    View.waveCanvas.height
  );

  var freqByteData = new Uint8Array(currentSong.analyserNode.frequencyBinCount);
  currentSong.analyserNode.getByteFrequencyData(freqByteData);
  var nbFreq = freqByteData.length;

  var SPACER_WIDTH = 5;
  var BAR_WIDTH = 2;
  var OFFSET = 100;
  var CUTOFF = 23;
  var HALF_HEIGHT = View.waveCanvas.height / 2;
  var numBars = 1.7 * Math.round(View.waveCanvas.width / SPACER_WIDTH);

  View.waveCanvasContext.lineCap = "round";

  for (var i = 0; i < numBars; ++i) {
    var magnitude = 0.3 * freqByteData[Math.round((i * nbFreq) / numBars)];

    View.waveCanvasContext.fillStyle =
      "hsl( " + Math.round((i * 360) / numBars) + ", 100%, 50%)";
    View.waveCanvasContext.fillRect(
      i * SPACER_WIDTH,
      HALF_HEIGHT,
      BAR_WIDTH,
      -magnitude
    );
    View.waveCanvasContext.fillRect(
      i * SPACER_WIDTH,
      HALF_HEIGHT,
      BAR_WIDTH,
      magnitude
    );
  }

  // Draw animated white lines top
  View.waveCanvasContext.strokeStyle = "white";
  View.waveCanvasContext.beginPath();

  for (var i = 0; i < numBars; ++i) {
    var magnitude = 0.3 * freqByteData[Math.round((i * nbFreq) / numBars)];
    if (i > 0) {
      View.waveCanvasContext.lineTo(i * SPACER_WIDTH, HALF_HEIGHT - magnitude);
    } else {
      View.waveCanvasContext.moveTo(i * SPACER_WIDTH, HALF_HEIGHT - magnitude);
    }
  }
  for (var i = 0; i < numBars; ++i) {
    var magnitude = 0.3 * freqByteData[Math.round((i * nbFreq) / numBars)];
    if (i > 0) {
      View.waveCanvasContext.lineTo(i * SPACER_WIDTH, HALF_HEIGHT + magnitude);
    } else {
      View.waveCanvasContext.moveTo(i * SPACER_WIDTH, HALF_HEIGHT + magnitude);
    }
  }
  View.waveCanvasContext.stroke();

  View.waveCanvasContext.restore();
}

function drawSampleImage(imageURL, trackNumber, trackName) {
  var image = new Image();

  image.onload = function () {
    // SAMPLE_HEIGHT pixels height
    var x = 0;
    var y = trackNumber * SAMPLE_HEIGHT;
    View.masterCanvasContext.drawImage(
      image,
      x,
      y,
      window.View.masterCanvas.width,
      SAMPLE_HEIGHT
    );

    View.masterCanvasContext.strokeStyle = "white";
    View.masterCanvasContext.strokeRect(
      x,
      y,
      window.View.masterCanvas.width,
      SAMPLE_HEIGHT
    );

    View.masterCanvasContext.font = "14pt Arial";
    View.masterCanvasContext.fillStyle = "white";
    View.masterCanvasContext.fillText(trackName, x + 10, y + 20);
  };
  image.src = imageURL;
}

function resizeSampleCanvas(numTracks) {
  window.View.masterCanvas.height = SAMPLE_HEIGHT * numTracks;
  window.View.frontCanvas.height = window.View.masterCanvas.height / 2;
}

function clearAllSampleDrawings() {
  //View.masterCanvasContext.clearRect(0,0, canvas.width, canvas.height);
}

function playAllTracks(startTime) {
  // First : build the web audio graph
  //currentSong.buildGraph();
  // Read current master volume slider position and set the volume
  setMasterVolume();

  // Starts playing
  currentSong.play(startTime);

  // Set each track volume depending on slider value
  for (i = 0; i < currentSong.getNbTracks(); i++) {
    // set volume gain of track i the value indicated by the slider
    setVolumeOfTrackDependingOnSliderValue(i);
  }

  // Adjust the volumes depending on all mute/solo states
  currentSong.setTrackVolumesDependingOnMuteSoloStatus();

  // enable all mute/solo buttons
  //$(".mute").attr("disabled", false);
  //$(".solo").attr("disabled", false);

  // Set play/stop/pause buttons' states
  // buttonPlay.disabled = true;
  buttonStop.disabled = false;
  buttonPause.disabled = false;

  // Note : we memorise the current time, context.currentTime always
  // goes forward, it's a high precision timer
  lastTime = context.currentTime;
}

function setVolumeOfTrackDependingOnSliderValue(nbTrack) {
  var fraction = $("#volume" + nbTrack).val() / 100;

  currentSong.setVolumeOfTrack(fraction * fraction, nbTrack);
}
function setMasterVolumeFuckingValue() {
  var fraction = $("#masterVolume").val();

  setMasterVolume(fraction);
}

function stopAllTracks() {
  if (currentSong === undefined) return;

  // Stop the song
  currentSong.stop();

  // update gui's state
  buttonStop.disabled = true;
  buttonPause.disabled = true;
  // buttonPlay.disabled = false;

  // reset the elapsed time
  currentSong.elapsedTimeSinceStart = 0;
}

function pauseAllTracks() {
  currentSong.pause();
  lastTime = context.currentTime;
}

// The next function can be called two ways :
// 1 - when we click or drag the master volume widget. In that case the val
// parameter is passed.
// 2 - without parameters, this is the case when we jump to another place in
// the song or when a new song is loaded. We need to keep the same volume as
// before
function setMasterVolume(val) {
  if (currentSong !== undefined) {
    // If we are here, then we need to reset the mute all button
    // document.getElementById("#bsound").innerHTML = '<span class="glyphicon glyphicon-volume-up"></span>';
    var fraction;

    // set its volume to the current value of the master volume knob
    if (val === undefined) {
      fraction = $("#masterVolume").val() / 100;
    } else {
      fraction = val / 100;
    }

    // Let's use an x*x curve (x-squared) since simple linear (x) does not
    // sound as good.
    currentSong.setVolume(fraction * fraction);
  }
}

function soloNosoloTrack(trackNumber) {
  var s = document.querySelector("#solo" + trackNumber);
  var m = document.querySelector("#mute" + trackNumber);

  var currentTrack = currentSong.tracks[trackNumber];

  $(s).toggleClass("activated");

  // Is the current track in solo mode ?
  if (!currentTrack.solo) {
    // we were not in solo mode, let's go in solo mode
    currentTrack.solo = true;
    // Let's change the icon
    // s.innerHTML = "<img src='../img/noearphones.png' />";
  } else {
    // we were in solo mode, let's go to the "no solo" mode
    currentTrack.solo = false;
    // Let's change the icon
    // s.innerHTML = "<img src='../img/earphones.png' />";
  }

  // In all cases we remove the mute state of the curent track
  currentTrack.muted = false;
  $(m).removeClass("activated");
  // Let's change the icon
  // m.innerHTML = "<span class='glyphicon glyphicon-volume-up'></span>";

  // Adjust the volumes depending on all mute/solo states
  currentSong.setTrackVolumesDependingOnMuteSoloStatus();
}

function muteUnmuteTrack(trackNumber) {
  var m = document.getElementById("mute" + trackNumber);

  var currentTrack = currentSong.tracks[trackNumber];

  $(m).toggleClass("active-btn");

  if (!currentTrack.muted) {
    // Track was not muted, let's mute it!
    currentTrack.muted = true;
    // let's change the button's class
    if (trackNumber == 1) {
      m.innerHTML = '<img src="./inc/icon/microphone-alt-slash.svg">';
    } else {
      m.innerHTML = '<img src="./inc/icon/music-alt-slash.svg">';
    }
  } else {
    // track was muted, let's unmute it!
    currentTrack.muted = false;
    if (trackNumber == 1) {
      m.innerHTML = '<img src="./inc/icon/microphone-alt.svg">';
    } else {
      m.innerHTML = '<img src="./inc/icon/music-alt.svg">';
    }
  }

  // In all cases we must put the track on "no solo" mode
  currentTrack.solo = false;
  // Let's change the icon
  // s.innerHTML = "<img src='../img/earphones.png' />";

  // adjust track volumes dependinf on all mute/solo states
  currentSong.setTrackVolumesDependingOnMuteSoloStatus();
}

function masterMuteUnmute(btn) {
  if (currentSong === undefined) return;

  currentSong.toggleMute();

  $(btn).toggleClass("activated");

  if (currentSong.muted) {
    // btn.innerHTML = '<span class="glyphicon glyphicon-volume-off"></span>';
  } else {
    // btn.innerHTML = '<span class="glyphicon glyphicon-volume-up"></span>';
  }
}

function toggleRecordMix() {
  currentSong.toggRecordMixMode();
  $("#brecordMix").toggleClass("activated");

  if (currentSong.recordMixMode) {
  }
}

function toggleChordSwitch() {
  const switcher = $("#switch-chords");
  if (!swChords) {
    swChords = true;
    $("#textWaveCanvas").removeAttr("style");
    $(".chordCanvas").css("display", "flex");
    switcher.val("On");
    jQuery(".word").addClass("chord-data");
    jQuery(".word-space").css("margin", "40px 15px 10px 15px");
  } else if (swChords) {
    swChords = false;
    $("#textWaveCanvas").show();
    $(".chordCanvas").removeAttr("style");
    switcher.val("Off");
    jQuery(".word").removeClass("chord-data");
    jQuery(".word-space").css("margin", "25px 15px 10px 15px");
  }
}
