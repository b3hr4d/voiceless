// Borrowed and adapted from : http://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color) {
  //variables to be used when creating the arrow
  console.log("here : " + ctx, fromx, fromy, tox, toy, arrowWidth, color);
  var headlen = 10;
  var angle = Math.atan2(toy - fromy, tox - fromx);

  ctx.save();
  ctx.strokeStyle = color;

  //starting path of the arrow from the start square to the end square and drawing the stroke
  ctx.beginPath();
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.lineWidth = arrowWidth;
  ctx.stroke();

  //starting a new path from the head of the arrow to one of the sides of the point
  ctx.beginPath();
  ctx.moveTo(tox, toy);
  ctx.lineTo(
    tox - headlen * Math.cos(angle - Math.PI / 7),
    toy - headlen * Math.sin(angle - Math.PI / 7)
  );

  //path from the side point of the arrow, to the other side point
  ctx.lineTo(
    tox - headlen * Math.cos(angle + Math.PI / 7),
    toy - headlen * Math.sin(angle + Math.PI / 7)
  );

  //path from the side point back to the tip of the arrow, and then again to the opposite side point
  ctx.lineTo(tox, toy);
  ctx.lineTo(
    tox - headlen * Math.cos(angle - Math.PI / 7),
    toy - headlen * Math.sin(angle - Math.PI / 7)
  );

  //draws the paths created above
  ctx.stroke();
  ctx.restore();
}

var BhdDraw = {
  particles: [],
  C: 0,
  TimerLooperText: null,
  Delete: 0,
  changed: true,
  allowedWords: null,
  lastWordNum: null,
  wordInScreen: null,
  prepare: function () {
    $("<canvas/>", { id: "started" }).appendTo("#textWaveCanvas");
    var canvas = document.getElementById("started");
    var ctx = canvas.getContext("2d");
    ctx.font = 0 + "pt Nastaliq";
    ctx.fillText("Started", 0, 0);
    $("#started").remove();
  },
  init: function (wordNumber) {
    // var currentWordNum = $("#textWaveCanvas")[0].childElementCount

    // if ( currentWordNum+1 >= BhdDraw.allowedWords ){
    //     BhdDraw.deleterTimer(BhdDraw.allowedWords)
    // }
    BhdDraw.allowedWords = parseInt(wordNumber) + parseInt(BhdDraw.lastWordNum);
    if (wordNumber > 5) {
      var zarbdar = wordNumber * 30;
      var taghsim = wordNumber * 10;
    } else {
      var zarbdar = wordNumber * 30;
      var taghsim = 0;
    }
    var MyCW = View.textWaveCanvas.offsetWidth * 2,
      MyCH = View.textWaveCanvas.offsetHeight * 2;
    BhdDraw.particles = [];
    for (var i = 0; i < 3; i++) {
      BhdDraw.particles.push(new createParticals());
    }
    function createParticals() {
      // position
      this.x = Math.random() * MyCW;
      this.y = Math.random() * MyCH;
      this.o = Math.random() * 0.2 + 0.1;
      this.z = Math.floor(Math.random() * 100) + 80;
    }
    if (BhdDraw.changed) {
      BhdDraw.deleterTimer(BhdDraw.allowedWords);
      BhdDraw.particles.push({
        o: 1,
        x: MyCW / 1.5 + zarbdar,
        y: MyCH / 2 + taghsim,
        z: 60,
      });
      BhdDraw.changed = false;
    } else if (!BhdDraw.changed) {
      BhdDraw.particles.push({
        o: 1,
        x: MyCW / 1.8 + zarbdar,
        y: MyCH / 1.1,
        z: 60,
      });
      BhdDraw.changed = true;
    }

    BhdDraw.lastWordNum = wordNumber;
  },
  deleterTimer: function () {
    $(".lyricCanvas")
      .filter(function () {
        return $(this).attr("number") < BhdDraw.C;
      })
      .animate({ opacity: 0 }, "slow", function () {
        $(this).remove();
      });
    // BhdDraw.TimerLooperText = setInterval(() => {
    //        if ( num > 0 ){
    //         $("#lC-"+BhdDraw.Delete).animate({'opacity': 0},'slow',function(){
    //             $(this).remove()
    //         })
    //         console.log(BhdDraw.Delete + ' cleaned');
    //         BhdDraw.Delete++
    //         num--
    //        }
    //        BhdDraw.wordInScreen = BhdDraw.C - BhdDraw.Delete
    //    }, 200);
  },
  StopTimer: function () {
    clearInterval(BhdDraw.TimerLooperText);
  },
  Draw: function (word) {
    $("<canvas/>", {
      class: "lyricCanvas",
      id: "lC-" + BhdDraw.C,
      number: BhdDraw.C,
    }).appendTo("#textWaveCanvas");
    var canvas = document.getElementById("lC-" + BhdDraw.C);
    var ctx = canvas.getContext("2d");
    var scale = 2;
    var MyCW = View.textWaveCanvas.offsetWidth * scale,
      MyCH = View.textWaveCanvas.offsetHeight * scale;
    canvas.width = MyCW;
    canvas.height = MyCH;
    // Create gradient
    var gradient = ctx.createLinearGradient(0, 0, word.length * 10, 0);
    // gradient.addColorStop("0", "white");
    // gradient.addColorStop("0.5", "black");
    gradient.addColorStop("1.0", "white");
    // countingTime = 0;
    // var inter = setInterval(() => {
    // countingTime++
    // if ( countingTime == 20 ){
    //     clearInterval(inter)
    // }
    // console.log(word);
    // ctx.clearRect(0, 0, MyCW, MyCH);
    for (var t = 0; t < BhdDraw.particles.length; t++) {
      if (t < 3) {
        let p = BhdDraw.particles[Math.floor(Math.random() * 3)];
        ctx.font = p.z + "pt Nastaliq";
        ctx.fillStyle = "white";
        ctx.globalAlpha = p.o;
        ctx.fillText(word, p.x, p.y);
        p.y -= 40;
        p.x -= 60;
      } else {
        let p = BhdDraw.particles[t];
        ctx.font = p.z + "pt Nastaliq";
        ctx.fillStyle = "#00ff72";
        ctx.globalAlpha = p.o;
        ctx.strokeStyle = gradient;
        ctx.strokeText(word, p.x + 5, p.y + 5);
        ctx.fillText(word, p.x, p.y);
        p.x -= 20 * word.length;
        p.y -= 50;
      }
      // if ( countingTime < 10  ) {
      //     p.o -= 0.1
      //     p.x += 0.2
      //     p.y += 0.5
      // }
      // else {
      //     p.o -= 0.1
      // }
    }
    // }, 100);

    BhdDraw.C++;
  },

  DrawChord: function (num) {
    $("#" + num).animate(
      {
        fontSize: "100px",
      },
      function () {
        $("#" + num).css({ color: "red" });
      }
    );
    selNum = parseInt(num) - 1;
    $("#" + selNum).animate(
      {
        fontSize: "50px",
      },
      function () {
        $(".chordCanvas").animate({
          scrollLeft:
            $("#" + num).offset().left -
            $(".chordCanvas").offset().left +
            $(".chordCanvas").scrollLeft(),
        });
        $(".chordCanvas h1")
          .filter(function () {
            return $(this).attr("id") < num;
          })
          .removeAttr("style");
      }
    );
    // $("<canvas/>", {
    //   class: "chordCanvas",
    //   id: "chord-" + num,
    //   number: num,
    // }).appendTo("#textWaveCanvas");
    // var canvas = document.getElementById("chord-" + num);
    // var ctx = canvas.getContext("2d");
    // ctx.font = 30 + "pt Nastaliq";
    // ctx.fillStyle = "#00ff72";
    // ctx.strokeText(chords, 150, 50);
    // ctx.fillText(chords, 150, 50);
  },
};
