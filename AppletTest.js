console.log("Inside AppletTest.js");


var AudioTool = function(mp3) {
  this.soundURL = mp3 || null;
  this.audioContext = null;
  this.audio = null;
  this.isPlaying = false;
  // MIC stuff
  this.stream = null;
  this.analyserNode = null;
  this.data = [];
  this.dataWave = [];
  this.size = 2048;
  this.counter = 0;
  this.setup();
};

AudioTool.prototype = {

  isAudioContextSupported : function() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if (window.AudioContext) {
      return true;
    } else {
      return false;
    }
  },

  setup : function() {
    if (this.isAudioContextSupported()) {
      this.audioContext = new AudioContext();
      // Setup audio stuff
      this.update(this.soundURL);
    } else {
      alert("this browser doesn't support the Web Audio API. Come on...");
    }
  },

  update : function(url) {

    this.mic = null;
    console.log(document.getElementsByTagName("audio"));
    this.audio = document.getElementsByTagName("audio")[0];
    if (this.audio) {
      this.broadcast();
    }
    else {
      console.log("No audio element");
      console.log(document.getElementsByTagName("video"));
      this.audio = document.getElementsByTagName("video")[0];
      if (this.audio) {
        this.broadcast();
      }
      else {
        console.log("No video element");
      }
    }


    // if (url != null) {
    //   if (this.audio == null) {
    //     this.audio = new Audio();
    //     this.audio.controls = true;
    //     this.audio.load();
    //     this.audio.src = url;
    //     document.body.appendChild(this.audio);
    //   }
    //   this.mic = null;
    //   this.broadcast();
    // }

    /* else {
      try {
        // monkeypatch getUserMedia
        navigator.getUserMedia = navigator.getUserMedia ||
                                 navigator.webkitGetUserMedia ||
                                 navigator.mozGetUserMedia;

        // ask for an audio input
        navigator.getUserMedia({
          "audio" : {
            "mandatory" : {
              "googEchoCancellation" : "false",
              "googAutoGainControl" : "false",
              "googNoiseSuppression" : "false",
              "googHighpassFilter" : "false"
            },
            "optional" : []
          },
        },
                               this.onStream.bind(this),
                               this.noStream.bind(this));
      } catch (e) {
        alert('getUserMedia threw exception :' + e);
      }
    }
    */
  },

  broadcast : function() {
    if (this.source == null)
      this.source = this.audioContext.createMediaElementSource(this.audio);
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = this.size;
    this.source.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);
    this.data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.dataWave = new Uint8Array(this.analyserNode.frequencyBinCount);
  },

  onStream : function(stream) {
    this.stream = stream;
    this.mic = this.audioContext.createMediaStreamSource(stream);
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = this.size;
    this.mic.connect(this.analyserNode);
    // two kind of analysis
    this.data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.dataWave = new Uint8Array(this.analyserNode.frequencyBinCount);
  },

  noStream : function() { alert("problem with mic"); },

  toggle : function() {
    // if (this.isPlaying) {
    //   this.audio.pause();
    // } else {
    //   this.audio.play();
    // };
    // this.isPlaying = !this.isPlaying;
  },

  updateFrequency : function() {
    if (this.analyserNode) {
    this.analyserNode.getByteFrequencyData(this.data);
  }
    else {
      // console.log("No analyser node");
    }
  },

  updateWave : function() {
    if (this.analyserNode) {
    this.analyserNode.getByteTimeDomainData(this.dataWave);
  }
    else {
      // console.log("No analyser node");
    }
  },

  reset : function() {
    // if (this.audio != null) {
    //   this.audio.pause();
    //   this.audio.currentTime = 0;
    //   this.isPlaying = false;
    // }
  }
}





var App = function() {
  console.log("app is running");
//   this.canvas = document.getElementsByTagName("canvas")[0];
//   this.w = window.innerWidth;
//   this.h = window.innerHeight;
//   this.canvas.width = this.w;
//   this.canvas.height = this.h;
  this.ctx = this.canvas.getContext("2d");
  this.tool = null;
  this.isMic = false;

  this.tool = new AudioTool();
  this.tool.toggle();

  this.draw();
};


App.prototype = {


  draw : function() {

    if (this.tool) {
      this.tool.updateFrequency();
      this.tool.updateWave();

      if (this.tool.data) {
        for (let i = 0; i < this.tool.data.length; i++) {
          if (this.tool.data[i] && this.tool.data[i]  > 0) {
            if (Math.random() < 0.05)
            console.log(this.tool.data[i]);
          }
        }
      }
    }
    // refresh
    requestAnimationFrame(this.draw.bind(this));
  },

  onKeyDown : function(e) {
    var track = "audio/bombay-short.m4a";
    switch (e.keyCode) {
      case 32: // spacebar
      if (this.tool == null) {
        this.tool = new AudioTool(track);
        this.tool.toggle();
        this.tool.setupBeatDetector(128, 1.25);
        // this.tool.toggleBeatDetection();
      } else {
        this.tool.reset();
        if (this.isMic) {
          this.tool.update(track);
          this.tool.toggle();
          this.isMic = false;
        } else {
          this.tool.update(null);
          this.isMic = true;
        }
      }
      break;
      case 65: // A
      this.tool.toggleBeatDetection();
      break;
      case 67: // C
      let audio = document.getElementsByTagName("audio")[0];
      audio.style.display = audio.style.display == "inline" ? "none" : "inline";
      break;
      case 37: // ArrowLeft
      this.tool.adjustThreshold(-0.1);
      break;
      case 39: // ArrowRight
      this.tool.adjustThreshold(0.1);
      break;
    }
  }

};

console.log("Going to run up app :");
new App();
