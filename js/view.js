// Amine Hallili
// Creation de l'objet interface pour simplifier le code et le rendre facilement maintenable
// cette classe ne doit contenir que le traitement lié directement à l'interface graphique
// cette classe ne contient pas forcement tout les elements de la page mais ceux qui vont surement etre utilisés dans le code
function View() {
  // all html elements [element=id]
  this.masterCanvas = "myCanvas"; // the canvas where we draw the track wave
  this.masterCanvasContext;
  this.frontCanvas = "frontCanvas"; // the canvas where we draw the time
  this.frontCanvasContext;
  this.waveCanvas = "waveCanvas"; //the canvas where we draw the animation wave of the song
  this.textWaveCanvas = "textWaveCanvas"; //the canvas where we draw the animation wave of the song
  this.waveCanvasContext;
  this.songs = "songs"; //choice list of all the songs
  this.knobMasterVolume = "masterVolume"; // the canvas representing the master volume slider
  this.mute = "bsound"; // button to mute unmute the current song volume
  this.play = "bplay";
  this.pause = "bpause";
  this.stop = "bstop";
  this.startLoop = "loopStart";
  this.endLoop = "loopEnd";
  this.replayLoop = "loopReset";
  this.enableLoop = "loopOnOff";
  this.tracks = "tracks"; // List of tracks and mute buttons
  this.console = "messages";
  this.consoleTab = "consoleTab";
  this.waveTab = "waveTab";
  // getting all the html elements when the page completly loads
  this.init = function () {
    this.masterCanvas = document.getElementById(this.masterCanvas);
    this.masterCanvasContext = this.masterCanvas.getContext("2d");
    this.frontCanvas = document.getElementById(this.frontCanvas);
    this.frontCanvasContext = this.frontCanvas.getContext("2d");

    window.View.masterCanvas.width = window.innerWidth;
    // make it same size as its brother
    this.frontCanvas.height = window.View.masterCanvas.height;
    this.frontCanvas.width = window.View.masterCanvas.width;
    this.textWaveCanvas = document.getElementById("textWaveCanvas");
    this.waveCanvas = document.getElementById(this.waveCanvas);
    this.waveCanvasContext = this.waveCanvas.getContext("2d");
    this.songs = document.getElementById(this.songs);
    this.knobMasterVolume = document.getElementById(this.knobMasterVolume);
    this.mute = document.getElementById(this.mute);
    this.play = document.getElementById(this.play);
    this.pause = document.getElementById(this.pause);
    this.stop = document.getElementById(this.stop);
    this.startLoop = document.getElementById(this.startLoop);
    this.endLoop = document.getElementById(this.endLoop);
    this.replayLoop = document.getElementById(this.replayLoop);
    this.enableLoop = document.getElementById(this.enableLoop);
    this.tracks = document.getElementById(this.tracks);
    this.console = document.getElementById(this.console);
    this.consoleTab = document.getElementById(this.consoleTab);
    this.waveTab = document.getElementById(this.waveTab);
  };
}
