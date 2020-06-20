function Track(songName, instrument) {
  var DownloadAppFolder = Downloader.localFolder.toURL();
  // var DownloadAppFolder = "track/";
  // name of the track : bass, guitar, voice, etc.
  this.name = instrument.name;
  // url of the track in the form http://.../track/track_name
  this.url = DownloadAppFolder + instrument.sound;
  // decoded audio buffer
  this.decodedBuffer;
  // peaks for drawing the sample
  this.peaks;
  // current volume
  this.volume = 1;
  // current left/right panning
  this.panning;
  // muted / non muted state
  this.muted = false;
  // solo mode ?
  this.solo = false;
  // the web audio nodes that compose this track
  this.sampleNode;
  // volume for this track
  this.volumeNode;
}
