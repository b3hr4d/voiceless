var BhdLyrics = {
  lyricsElement: null,
  size: null,
  trackNumber: null,
  chordsArray: [],
  init: function (str, number, size) {
    this.lyricsElement = $(str);
    this.trackNumber = number;
    // Do not initialize twice on the same element
    if (this.lyricsElement.data("lyricsEnabled")) {
      return;
    }
    switch (size) {
      case "tiny":
      case "medium":
      case "full":
        this.size = size;
        break;
      default:
        this.size = "medium";
    }
    this.applySize().parseLyrics();
  },

  applySize: function () {
    this.lyricsElement.addClass(this.size);
    return BhdLyrics;
  },

  parseLyrics: function () {
    var content = this.lyricsElement
        .text()
        .replace(/\[(http[s]?:\/\/[^\s]+)\]/g, ""),
      words = content.trim().split("\n"),
      lastTime = 0,
      nCount = 0,
      cCount = -1,
      chordCount = 0,
      lineCounter = 0,
      lastSpace = $('<p class="intro"></p>');

    this.lyricsElement.html("");
    this.lyricsElement.prepend(lastSpace);
    for (var i = 0; i < words.length; i++) {
      var word = words[i].trim();
      var chords = word.match(/\[[a-z#A-Z]{1,15}\]/g);
      var wordChords = [],
        wordChordW = [];
      if (chords) {
        cleanedWord = word.replace(/\[\d+\.\d+\]/g, "");
        chordChar = cleanedWord.split(/\[[a-z#A-Z]{1,15}\]/g);
        for (c = 0; c < chords.length; c++) {
          wordChord = chords[c].replace(/\[|\]/gm, "");
          counter = chordChar[c].length;
          chordSpaces = wordChord + "&nbsp;".repeat(counter);
          wordChords.unshift(chordSpaces);
          wordChordW.push(wordChord);
        }
        this.chordsArray.push(wordChordW);
        var wordElement = $(
          '<a href="#" number="' +
            i +
            '"chordnumber="' +
            chordCount +
            '"class="word" data-chord=' +
            wordChords.join("") +
            "></a>"
        );
        chordCount++;
        this.lyricsElement.append(wordElement);
      } else {
        var wordElement = $('<a href="#" number=' + i + ' class="word"></a>');
        this.lyricsElement.append(wordElement);
      }
      var spaces = word.match(/\[0{1,3}\]/g);
      var times = word.match(/\[\d+\.\d+\]/g) || [];
      var beginningTime = word.match(/^\[\d+\.\d+\]/g) || [];
      var endingTime = word.match(/\[\d+\.\d+\]$/g) || [];
      if (spaces) {
        lineCounter = i - cCount;
        clasSor = "verse";
        var spaceElement = $('<p class="next-line"></p>');
        nCount++;
        this.lyricsElement.append(spaceElement);
        lastSpace
          .nextUntil(spaceElement)
          .wrapAll(
            '<div class="' +
              clasSor +
              '" number="' +
              nCount +
              '" word="' +
              lineCounter +
              '" ></div>'
          );
        lastSpace = spaceElement;
        cCount = i;
      }

      if (times.length > 0) {
        this.lyricsElement
          .find(".no-end")
          .removeClass("no-end")
          .data("end", this.decodeTimeStamp(times[0]));
      }

      if (
        times.length === 0 &&
        beginningTime.length > 0 &&
        endingTime.length > 0
      ) {
        // Have both beginning and ending time stamp
        wordElement.data("start", this.decodeTimeStamp(beginningTime[0]));
        wordElement.data("end", this.decodeTimeStamp(endingTime[0]));
        lastTime = this.decodeTimeStamp(endingTime[0]);
      } else if (times.length === 1 && beginningTime.length > 0) {
        // Only have beginning time stamp, or only have a time stamp, no text
        wordElement
          .data("start", this.decodeTimeStamp(beginningTime[0]))
          .addClass("no-end");
        lastTime = this.decodeTimeStamp(beginningTime[0]);
      } else if (endingTime.length > 0) {
        // Only have ending time stamp
        wordElement
          .data("start", lastTime)
          .data("end", this.decodeTimeStamp(endingTime[0]));
        lastTime = this.decodeTimeStamp(endingTime[0]);
      } else {
        // Do not have any time stamps
        wordElement.html(word).data("start", lastTime).addClass("no-end");
      }

      word = word.replace(/\[\d+\.\d+\]/g, " ");
      word = word.replace(/\[0{1,3}\]/g, " ");
      word = word.replace(/\[[a-z#A-Z]{1,15}]/g, "");

      if (!word) {
        word = "&nbsp;";
        wordElement.data("start", 999999).data("end", 999999);
      }

      wordElement.html(word);
    }

    this.lyricsElement
      .find(".no-end")
      .removeClass("no-end")
      .data("end", 999999);

    localStorage.setItem(
      "chords-" + this.trackNumber,
      JSON.stringify(this.chordsArray)
    );
    return this;
  },
  decodeTimeStamp: function (timeStamp) {
    var time = null;

    if (timeStamp) {
      var results = timeStamp.match(/\[(\d+)(.\d+)\]/);
      time = parseInt(results[1]) + parseFloat(results[2]);
    }
    return time;
  },

  enableLyrics: function (str) {
    var that = this;
    this.lyrics = [];
    this.activeLyrics = [];
    myMediaElement = str;
    myMediaElement.find(".word").each(function () {
      that.lyrics.push({
        start: $(this).data("start"),
        end: $(this).data("end"),
        element: $(this),
      });
    });
    var timerAudio;
    myMediaElement.scrollTop(0);

    $("#listerner-play").on("click", syncPlay);
    $("#listerner-pause").on("click", syncPause);

    function syncPause() {
      $("#pause-button img").attr("src", "./inc/icon/play-light.svg");
      clearInterval(timerAudio);
    }
    function syncPlay() {
      $("#pause-button img").attr("src", "./inc/icon/pause.svg");
      BhdDraw.deleterTimer();
      timerAudio = setInterval(checkTime, 100);
    }
    var lastLineBreak = 0;
    var chordCounter = 0;
    function checkTime() {
      requestAnimFrame(animateTime);
      var time = (that.time = currentSong.elapsedTimeSinceStart);
      var changed = false;
      that.activeLyrics = [];
      for (var i = 0; i < that.lyrics.length; i++) {
        var lrc = that.lyrics[i];
        if (lrc.start < time && lrc.end > time) {
          if (!lrc.element.hasClass("active")) {
            changed = true;
            lrc.element.addClass("active");
          }
          that.activeLyrics.push(lrc);
        } else {
          if (lrc.element.hasClass("active")) {
            changed = true;
            lrc.element.removeClass("active");
          }
        }
      }

      if (changed && that.activeLyrics.length > 0) {
        wordLinesNum = $(that.activeLyrics[0].element[0].parentElement).attr(
          "number"
        );
        var wordNumber = $(that.activeLyrics[0].element[0].parentElement).attr(
          "word"
        );
        if (wordLinesNum != lastLineBreak) {
          var zarb;
          if (swChords) zarb = 4;
          else if (!swChords) zarb = 7;
          var scrollHeight =
            myMediaElement.scrollTop() +
            (that.activeLyrics[0].element.offset().top +
              that.activeLyrics[that.activeLyrics.length - 1].element.offset()
                .top) /
              2 -
            myMediaElement.offset().top -
            myMediaElement.height() / zarb;
          BhdDraw.init(wordNumber);
          myMediaElement.scrollTop(scrollHeight);
          lastLineBreak = wordLinesNum;
        }
      }

      if (
        $("#textWaveCanvas").is(":visible") &&
        changed &&
        that.activeLyrics.length > 0
      ) {
        BhdDraw.Draw(that.activeLyrics[0].element[0].text);
      }
      if (
        $(".chordCanvas").is(":visible") &&
        changed &&
        that.activeLyrics.length > 0 &&
        swChords &&
        that.activeLyrics[0].element[0].dataset.chord
      ) {
        BhdDraw.DrawChord(that.activeLyrics[0].element[0].attributes[2].value);
      }
    }

    $(".bhd-lyrics a").click(function () {
      var wordNum = $(this).attr("number");
      var lrc = that.lyrics[wordNum];
      changed = true;
      lrc.element.removeClass("active");
      wordJumper(lrc.start);
      window.plugins.toast.showWithOptions({
        message: lrc.element[0].text,
        duration: "short",
        position: "bottom",
        addPixelsY: -40,
      });
    });
    str.data("lyricsEnabled");
  },

  chordInit: function (num) {
    var chordArr = JSON.parse(localStorage.getItem("chords-" + num));
    chords = [];
    $(".chordCanvas").scrollLeft(0);
    $(".chordCanvas").empty();
    function makeElement() {
      for (var g = 0; g < chords.length; g++) {
        $("<h1/>", {
          id: g,
          text: chords[g],
        }).appendTo(".chordCanvas");
      }
    }
    for (var c = 0; c < chordArr.length; c++) {
      if (chordArr[c][0] != "") {
        if (chordArr[c].length > 1) {
          chords.push(chordArr[c].join("/"));
        } else if (chordArr[c].length == 1) {
          chords.push(chordArr[c][0]);
        }
      }
    }
    makeElement();
  },
};
