// global array
var globalArray = [],
  vocalArray = [],
  songArray = [],
  favArray = [];
// Variable
var dataBase,
  OnlineMode = false,
  clicked = false,
  clickedCard,
  lastpx = 0,
  cHeight,
  playMode = false,
  lastPlayStart,
  gettingData,
  loadCount = 1,
  fullyLoaded = false,
  percent = 0,
  pertage = 0,
  downloadProc = false,
  deleteProc = false,
  lastTimeBackPress = 0,
  lastPercentage = 0,
  timePeriodToExit = 2000,
  zarib = 2,
  progressNum,
  delProgressNum,
  cancelProgress = null,
  flrmNum = 0,
  DownloadAppFolder = null,
  playCardPos,
  playCardWidth,
  playCardHeight,
  myMediaElement;
// Main Application
var app = {
  /*****************************Initializers*****************************/
  // Application Constructor
  initialize: function () {
    this.bindEvents();
  },
  // Done
  allDone: function () {
    var parentElement = document.getElementById("deviceready"),
      listeningElement = parentElement.querySelector(".listening"),
      receivedElement = parentElement.querySelector(".received");
    listeningElement.setAttribute("style", "display:none;");
    receivedElement.setAttribute("style", "display:block;");
    $(".startpage").on("click", function () {
      if (document.readyState === "complete") {
        fullyLoaded = true;
        $("body").removeAttr("style");
        $(".startpage").fadeOut("slow");
      }
    });
  },
  /*****************************Events*****************************/
  // Bind Event Listeners
  bindEvents: function () {
    document.addEventListener("offline", this.onOfflineDevice, false);
    document.addEventListener("online", this.onOfflineDevice, false);
    document.addEventListener("deviceready", this.onDeviceReady, false);
    document.addEventListener("backbutton", this.onBackKeyDown, false);
  },
  // Deviceready Event Handler
  onDeviceReady: function () {
    Downloader.init({ folder: "downloaded" });
    init();
    document.addEventListener(
      "DOWNLOADER_initialized",
      app.receivedEvent,
      false
    );
  },
  // Offline Event Handler
  onOfflineDevice: function () {
    OnlineMode = false;
    $("#online-btn").css("color", "#ed2b2f");
    window.plugins.toast.showWithOptions({
      message: "حالت آفلاین",
      duration: "short",
      position: "bottom",
      addPixelsY: -50,
    });
  },
  // Online Event Handler
  onOnlineDevice: function () {
    OnlineMode = true;
    $("#online-btn").css("color", "lime");
    window.plugins.toast.showWithOptions({
      message: "حالت آنلاین",
      duration: "short",
      position: "bottom",
      addPixelsY: -50,
    });
  },
  // Update DOM on a Received Event
  receivedEvent: function () {
    if (gettingData != "Done") {
      app.getInfoApi();
      $(".listening").html("در حال بارگذاری ...");
      $(".loadprogressbar").show();
    }
  },
  /*****************************Getters*****************************/
  // Get information from voiceless.ir
  getInfoApi: function () {
    if (!OnlineMode) {
      console.log("OfflineMode");
      if (localStorage.getItem("Content")) {
        let gets = JSON.parse(localStorage.getItem("Content"));
        app.mainDataLoop(gets);
      } else {
        window.plugins.toast.showWithOptions({
          message:
            "اتصال اینترنت برقرار نشد، برنامه حداقل برای بار نخست نیاز به اینترنت دارد!",
          duration: "short",
          position: "bottom",
          addPixelsY: -50,
        });
      }
    } else if (OnlineMode) {
      console.log("OnlineMode");
      var request = new XMLHttpRequest();
      request.open("GET", "https://voiceless.ir/edd-api/v2/products/");
      request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
          dataBase = request.responseText;
          localStorage.setItem("Content", dataBase);
          let gets = JSON.parse(request.responseText);
          app.mainDataLoop(gets);
        } else {
          window.plugins.toast.showWithOptions({
            message:
              "برنامه به سرور متصل شده است، اما ظاهراً خطایی بوجود آمده!\n بعداً دوباره تلاش کنید. ",
            duration: "short",
            position: "bottom",
            addPixelsY: -50,
          });
        }
      };
      request.onerror = function () {
        window.plugins.toast.showWithOptions({
          message:
            "اتصال اینترنت برقرار نشد، برنامه حداقل برای بار نخست نیاز به اینترنت دارد!",
          duration: "short",
          position: "bottom",
          addPixelsY: -50,
        });
      };
      request.send();
    }
  },
  // Data structure
  mainDataLoop: function (gets) {
    globalArray = [];
    var data = gets.products,
      itemsProcessed = 0;
    data.forEach((download) => {
      const pInfo = download.info;
      globalArray.push(pInfo);
      favArray[itemsProcessed] = false;
      itemsProcessed++;
      if (itemsProcessed === data.length) {
        globalArray = globalArray.reverse();
        if (app.GetFav() != null) {
          favArray = JSON.parse(localStorage.getItem("favs"));
        }
        app.contentParser();
        gettingData = "Done";
      }
    });
  },
  // Get setting from localStorage
  GetSetting: function (e, t) {
    if (!app.GetCard(e)) {
      app.SetCard(e, "pending");
      app.SetVocal(e, "pending");
      app.SetSong(e, "pending");
    } else if (app.GetCard(e) == "downloaded") {
      app.fileExist(e);
      $("#card-" + e).css("filter", "none");
      $("[flnumber=" + e + "]")
        .attr("src", "./inc/icon/play.svg")
        .css({ height: "30px" });
      $("#card-" + e + " .border-simultaneous")
        .find(":nth-child(odd)")
        .css({ width: "100%" });
      $("#card-" + e + " .border-simultaneous")
        .find(":nth-child(even)")
        .css({ height: "100%" });
    } else if (app.GetCard(e) == "downloading") {
      $("[flnumber=" + e + "]")
        .attr("src", "./inc/icon/exclamation-triangle.svg")
        .css("height", "30px");
    }
    if (favArray[e]) {
      $("[fvnumber=" + e + "]").attr("src", "./inc/icon/heart.svg");
    }
    const loadProg = ((100 * loadCount) / t).toFixed(0);
    $(".loadprogressbar").animate({ width: loadProg + "%" }, "fast");
    if (loadProg == 100) {
      setTimeout(() => {
        this.allDone();
      }, 1500);
    }
  },
  // Making content from array
  contentParser: function () {
    const container = document.getElementById("container");
    container.innerHTML = "";
    var count = 0,
      totalItem = globalArray.length;
    globalArray.forEach((pInfo) => {
      const card = document.createElement("div");
      card.setAttribute("class", "card");
      card.setAttribute("id", "card-" + count);
      const minus = document.createElement("div");
      minus.setAttribute("class", "minus");
      minus.style.backgroundImage =
        app.backGenerator() + ", url(" + pInfo.thumbnail + ")";
      const full = document.createElement("div");
      full.setAttribute("class", "full-playmode");
      const fl = document.createElement("img");
      fl.setAttribute("class", "download-btn");
      fl.setAttribute("src", "./inc/icon/download.svg");
      fl.setAttribute("flnumber", count);
      const rm = document.createElement("img");
      rm.setAttribute("class", "delete-btn");
      rm.setAttribute("src", "./inc/icon/times.svg");
      rm.setAttribute("rmnumber", count);
      const fv = document.createElement("img");
      fv.setAttribute("class", "favorite-btn");
      fv.setAttribute("src", "./inc/icon/heart-broken.svg");
      fv.setAttribute("fvnumber", count);
      const h3 = document.createElement("h3");
      h3.textContent = pInfo.title;
      container.appendChild(card);
      card.appendChild(minus);
      card.appendChild(full);
      minus.appendChild(h3);
      minus.appendChild(fl);
      minus.appendChild(rm);
      minus.appendChild(fv);
      const mainString = document.createElement("p");
      mainString.setAttribute("id", "lyrics-" + count);
      mainString.setAttribute("class", "bhd-lyrics");
      mainString.textContent = app.contentParserInit(pInfo.content, count);
      full.appendChild(mainString);
      $("#play-" + count).css("display", "none");
      app.borderSimultaneous("#card-" + count);
      app.GetSetting(count, totalItem);
      count++;
      loadCount++;
    });
  },
  // find song from strings
  songFinder: function (str, num) {
    const regexS = /(http[s]?:\/\/[^\s]+).mp3/;
    const regexV = /(http[s]?:\/\/[^\s]+)-original.mp3/;
    let s;
    let v;
    if ((s = regexS.exec(str)) !== null) {
      songArray[num] = s[0];
    }
    if ((v = regexV.exec(str)) !== null) {
      vocalArray[num] = v[0];
    }
  },
  // Get value From localStorage
  GetCard: function (num) {
    return localStorage.getItem("card-" + num);
  },
  GetVocal: function (num) {
    return localStorage.getItem("vocal-" + num);
  },
  GetSong: function (num) {
    return localStorage.getItem("song-" + num);
  },
  GetFav: function () {
    return JSON.parse(localStorage.getItem("favs"));
  },
  /*****************************Setters*****************************/
  // Set value From localStorage
  SetCard: function (num, value) {
    return localStorage.setItem("card-" + num, value);
  },
  SetVocal: function (num, value) {
    return localStorage.setItem("vocal-" + num, value);
  },
  SetSong: function (num, value) {
    return localStorage.setItem("song-" + num, value);
  },
  SetFav: function () {
    localStorage.setItem("favs", JSON.stringify(favArray));
  },
  // set file color and border
  fileChanger: function (e) {
    if (app.GetCard(e) == "downloading" || app.GetCard(e) == "downloaded") {
      vocalLink = app.GetVocal(e).replace(/-original.mp3/g, "");
      songLink = app.GetSong(e).replace(/.mp3/g, "");
      if (songLink == vocalLink) {
        if (playMode) {
          app.startPlayerFunc(e);
        } else {
          app.SetCard(e, "downloaded");
          $(".cancel-btn").remove();
          $("#card-" + e).css("filter", "none");
          $("[flnumber=" + e + "]")
            .attr("src", "./inc/icon/play.svg")
            .css({ height: "30px" });
          $("#card-" + e + " .border-simultaneous")
            .find(":nth-child(odd)")
            .css("width", "100%");
          $("#card-" + e + " .border-simultaneous")
            .find(":nth-child(even)")
            .css("height", "100%");
          if (clickedCard == e) {
            app.firstClick(e);
          }
          downloadProc = false;
        }
      } else if (!downloadProc) {
        app.SetCard(e, "downloading");
        $("[flnumber=" + progressNum + "]")
          .attr("src", "./inc/icon/exclamation-triangle.svg")
          .css("height", "30px");
      }
    } else if (app.GetCard(delProgressNum) == "deleted") {
      $("#card-" + delProgressNum).removeAttr("style");
      $("[rmnumber=" + delProgressNum + "]")
        .attr("src", "./inc/icon/times.svg")
        .css("height", "30px");
      app.secClick();
      $("[flnumber=" + delProgressNum + "]")
        .attr("src", "./inc/icon/download.svg")
        .css({ height: "30px" });
      $("#card-" + e + " .border-simultaneous")
        .find(":nth-child(odd)")
        .css("width", "0");
      $("#card-" + e + " .border-simultaneous")
        .find(":nth-child(even)")
        .css("height", "0");
      deleteProc = false;
    } else if (app.GetCard(progressNum) == "cancelled") {
      clearInterval(cancelProgress);
      cancelProgress = null;
      window.plugins.toast.showWithOptions({
        message: "دانلود لغو شد.",
        duration: "short",
        position: "bottom",
        addPixelsY: -50,
      });
      $("#card-" + progressNum).removeAttr("style");
      $("[rmnumber=" + progressNum + "]")
        .attr("src", "./inc/icon/times.svg")
        .css("height", "30px");
      app.secClick();
      $("[flnumber=" + progressNum + "]")
        .attr("src", "./inc/icon/download.svg")
        .css({ height: "30px" });
      $("#card-" + progressNum + " .border-simultaneous")
        .find(":nth-child(odd)")
        .css("width", "0");
      $("#card-" + progressNum + " .border-simultaneous")
        .find(":nth-child(even)")
        .css("height", "0");
      downloadProc = false;
    }
  },
  /*****************************Downloader*****************************/
  // Main function for Downloader
  FileDownloader: function (e, list) {
    progressNum = e;
    if (list.length == 2) {
      pertage = 0;
    } else {
      pertage = 50;
    }
    Downloader.init({ folder: "downloaded" });
    Downloader.getMultipleFiles(list);
    $("#card-" + e).css("filter", "none");
    app.SetCard(e, "downloading");
    $("[flnumber=" + e + "]")
      .attr("src", "./inc/icon/spinner.svg")
      .css("height", "30px");
  },
  // Main Downloader
  transferFile: function (fileObject) {
    if (app.GetCard(progressNum) != "cancelled" && fileObject) {
      setTimeout(() => {
        var DownloadAppFolder = Downloader.localFolder.toURL();
        progFile = fileObject.name;
        console.log("downloading : " + progFile);
        var filePath = DownloadAppFolder + progFile;
        Downloader.transfer = new FileTransfer();
        Downloader.transfer.onprogress = function (progressEvent) {
          if (progressEvent.lengthComputable) {
            var percentage = Math.floor(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            app.downloadProgress(percentage);
          }
        };
        Downloader.transfer.download(
          fileObject.url,
          filePath,
          function (entry) {
            if (filePath.match(/original.mp3/g)) {
              app.SetVocal(progressNum, filePath);
            } else {
              app.SetSong(progressNum, filePath);
            }
            pertage = 50;
            document.dispatchEvent(
              createEvent("DOWNLOADER_downloadSuccess", [entry])
            );
            app.downloadSeccess();
            window.plugins.toast.showWithOptions({
              message: "فایل " + progFile + " به خوبی دانلود شد.",
              duration: "short",
              position: "bottom",
            });
          },
          function (error) {
            app.downloadErorr(progFile, error);
            document.dispatchEvent(
              createEvent("DOWNLOADER_downloadError", [error])
            );
          }
        );
      }, 1500);
    }
  },
  // Downloader Events
  downloadSeccess: function () {
    app.fileChanger(progressNum);
    Downloader.abort();
    console.log("reset");
  },
  downloadProgress: function (percentage) {
    percent = pertage + percentage / zarib;
    $("#card-" + progressNum + " .border-simultaneous")
      .find(":nth-child(odd)")
      .css("width", percent + "%");
    $("#card-" + progressNum + " .border-simultaneous")
      .find(":nth-child(even)")
      .css("height", percent + "%");
  },
  downloadErorr: function (progFile, error) {
    if (app.GetCard(progressNum) != "cancelled") {
      window.plugins.toast.showWithOptions({
        message: "فایل " + progFile + " دانلود نشد!",
        duration: "short",
        position: "bottom",
        addPixelsY: -50,
        styling: {
          backgroundColor: "#ed2b2f",
        },
      });
      $("[flnumber=" + progressNum + "]")
        .attr("src", "./inc/icon/exclamation-triangle.svg")
        .css("height", "30px");
      app.SetCard(progressNum, "failed");
      app.SetSong(progressNum, "failed");
      app.SetVocal(progressNum, "failed");
      Downloader.abort();
    } else {
      app.SetSong(progressNum, "cancelled");
      app.SetVocal(progressNum, "cancelled");
    }
    app.fileChanger(progressNum);
    $("#card-" + progressNum + " .border-simultaneous")
      .find(":nth-child(odd)")
      .css("width", "0");
    $("#card-" + progressNum + " .border-simultaneous")
      .find(":nth-child(even)")
      .css("height", "0");
    $(".cancel-btn").remove();
    downloadProc = false;
  },
  /*****************************FileManagers*****************************/
  // check existing files
  fileExist: function (e) {
    var DownloadAppFolder = Downloader.localFolder.toURL();
    let downloadList = [],
      fileName1 = app.nameGenerator(songArray[e]),
      fileName2 = app.nameGenerator(vocalArray[e]);
    AllowNow1();
    function AllowNow1() {
      var folder = Downloader.localFolder;
      folder.getFile(
        fileName1,
        { create: false },
        function () {
          console.log(fileName1 + " File found");
          app.SetSong(e, DownloadAppFolder + fileName1);
          AllowNow2();
        },
        function () {
          console.log(fileName1 + " File missing");
          app.SetSong(e, "notfounded");
          downloadList.push({ url: songArray[e], md5: null, name: fileName1 });
          AllowNow2();
        }
      );
    }
    function AllowNow2() {
      var folder = Downloader.localFolder;
      folder.getFile(
        fileName2,
        { create: false },
        function () {
          console.log(fileName2 + " File found");
          app.SetVocal(e, DownloadAppFolder + fileName2);
          AllowDownload();
        },
        function () {
          console.log(fileName2 + " File missing");
          app.SetVocal(e, "notfounded");
          downloadList.push({ url: vocalArray[e], md5: null, name: fileName2 });
          AllowDownload();
        }
      );
    }
    function AllowDownload() {
      if (downloadList.length >= 1) {
        if (OnlineMode) {
          app.SetCard(e, "downloadnow");
          downloadProc = true;
          app.FileDownloader(e, downloadList);
        } else {
          window.plugins.toast.showWithOptions({
            message:
              "اتصال اینترنت برقرار نشد، برای دانلود آهنگ ها نیاز به اینترنت است!",
            duration: "short",
            position: "bottom",
            addPixelsY: -50,
          });
          downloadProc = true;
        }
      } else if (downloadList.length == 0) {
        app.SetCard(e, "downloading");
        app.fileChanger(e);
      }
    }
  },
  // removes file with name fileName from the download-directory
  removeFile: function (flrm) {
    $("[rmnumber=" + delProgressNum + "]")
      .attr("src", "./inc/icon/spinner.svg")
      .css("height", "30px");
    const rmFile = flrm[flrmNum];
    var folder = Downloader.localFolder;
    folder.getFile(
      rmFile,
      {
        create: false,
        exclusive: false,
      },
      function onGotFileToRemove(entry) {
        entry.remove(
          function () {
            nextRm();
            window.plugins.toast.showWithOptions({
              message: "فایل " + rmFile + " به خوبی حذف شد.",
              duration: "short",
              position: "bottom",
            });
          },
          function () {
            nextRm();
            window.plugins.toast.showWithOptions({
              message: "فایل " + rmFile + " پاک نشد!",
              duration: "short",
              position: "bottom",
            });
          }
        );
      },
      function () {
        nextRm();
        window.plugins.toast.showWithOptions({
          message: "فایل " + rmFile + " موجود نیست!",
          duration: "short",
          position: "bottom",
        });
      }
    );
    //   next file remove
    function nextRm() {
      setTimeout(() => {
        if (flrmNum == 1) {
          app.SetVocal(delProgressNum, "deleted");
          app.SetCard(delProgressNum, "deleted");
          app.fileChanger(delProgressNum);
          flrmNum = 0;
        } else if (flrmNum == 0) {
          flrmNum = 1;
          app.SetSong(delProgressNum, "deleted");
          app.removeFile(flrm);
        }
      }, 500);
    }
  },
  // name of file
  nameGenerator: function (url) {
    let fileName = url.replace(/^.*\//, "").replace(" ", "");
    return fileName;
  },
  /*****************************Designers*****************************/
  // Card Size
  cardHeight: function (c) {
    let px = $(c).css("height").replace("px", "");
    px = parseInt(px);
    if (lastpx == 0 || lastpx > px) {
      lastpx = px;
    }
    if (lastpx == px) {
      px = px + 30.0 + "px";
      return px;
    } else if (lastpx < px) {
      px = lastpx + 30.0 + "px";
      return px;
    }
  },
  // Background Generator
  backGenerator: function () {
    var firstValues = [
      "rgb(251, 194, 235)",
      "rgb(255, 195, 160)",
      "rgb(255, 154, 158)",
      "rgb(213, 226, 35)",
      "rgb(166, 193, 238)",
    ];
    var secValues = [
      "rgb(251, 194, 235, 0.75)",
      "rgb(255, 195, 160, 0.75)",
      "rgb(255, 154, 158, 0.75)",
      "rgb(213, 226, 35, 0.75)",
      "rgb(166, 193, 238, 0.75)",
    ];

    var gradient =
      "linear-gradient( 90deg, " +
      firstValues[Math.floor(Math.random() * firstValues.length)] +
      " 0%, " +
      secValues[Math.floor(Math.random() * secValues.length)] +
      " 100%)";
    return gradient;
  },
  // content replacer
  contentParserInit: function (str, num) {
    var start_pos = str.indexOf("[bhd_restrict]");
    var end_pos = str.indexOf("[/bhd_restrict]", start_pos);
    var text_to_get = str.substring(start_pos, end_pos);
    var find = ["[bhd_restrict]", "[lyrics]", "[/lyrics]"];
    cleanText = text_to_get
      .replace(find[0], "")
      .replace(find[1], "")
      .replace(find[2], "");
    app.songFinder(cleanText, num);
    return cleanText;
  },
  // border add here
  borderSimultaneous: function (e) {
    var animationDuration = "0.8",
      borderWidth = " 2px ",
      backgroundColor = "#4f9852",
      timePerSide = animationDuration / 2,
      className = ".border-simultaneous";

    $(e).wrapInner("<div class='border-progress'></div>");
    $(e).append(
      '<div class="border-simultaneous"><div></div><div></div><div></div><div></div></div>'
    );

    //All of them
    $(e).children(className).children().css({
      "background-color": backgroundColor,
    });
    //Top border
    $(e)
      .children(className)
      .find(":first-child")
      .css({
        height: borderWidth,
        width: "0%",
        "-webkit-transition":
          "width" + timePerSide + "s linear " + timePerSide * 0 + "s",
        transition:
          "width " + timePerSide + "s linear " + timePerSide * 0 + "s",
      });
    //Right border
    $(e)
      .children(className)
      .find(":nth-child(2)")
      .css({
        width: borderWidth,
        height: "0%",
        "-webkit-transition":
          "height" + timePerSide + "s linear " + timePerSide * 1 + "s",
        transition:
          "height " + timePerSide + "s linear " + timePerSide * 1 + "s",
      });
    //Bottom border
    $(e)
      .children(className)
      .find(":nth-child(3)")
      .css({
        height: borderWidth,
        width: "0%",
        "-webkit-transition":
          "width" + timePerSide + "s linear " + timePerSide * 0 + "s",
        transition:
          "width " + timePerSide + "s linear " + timePerSide * 0 + "s",
      });
    //Left border
    $(e)
      .children(className)
      .find(":nth-child(4)")
      .css({
        width: borderWidth,
        height: "0%",
        "-webkit-transition":
          "height" + timePerSide + "s linear " + timePerSide * 1 + "s",
        transition:
          "height " + timePerSide + "s linear " + timePerSide * 1 + "s",
      });
  },
  /*****************************CardClickControllers*****************************/
  // first click on card
  firstClick: function (num) {
    clickedCard = num;
    const card = "#card-" + num;
    $(card).css("filter", "none");
    if (app.GetCard(num) == "downloaded") {
      cHeight = $(card + " .minus").css("height");
      $(card + " .minus h3").css("text-align", "center");
      $(card + " .minus .download-btn").animate(
        { left: "40px", width: "30px" },
        "fast"
      );
      $(card + " .minus").animate({ height: app.cardHeight(card) }, "fast");
      $(card + " .minus .favorite-btn").animate({ width: "32px" }, "fast");
      $(card + " .minus .delete-btn").animate({ width: "23px" }, "fast");
    }
    clicked = true;
  },
  // secound click on card
  secClick: function () {
    if (clicked) {
      if (this.GetCard(clickedCard) !== "downloaded") {
        $("#card-" + clickedCard).removeAttr("style");
      }
      $(".download-btn").animate({ left: "5px" }, "fast");
      $(".delete-btn").animate({ width: 0 }, "fast");
      $(".favorite-btn").animate({ width: 0 }, "fast");
      $("#card-" + clickedCard + " .minus").animate(
        { height: cHeight },
        "fast",
        function () {
          $(this).css("height", "");
        }
      );
      $("#card-" + clickedCard + " .minus h3").css("text-align", "");
      clicked = false;
    }
  },
  // Favorite click on card
  favClick: function (num) {
    if (favArray[num]) {
      favArray[num] = false;
      app.SetFav();
      $("[fvnumber=" + num + "]").attr("src", "./inc/icon/heart-broken.svg");
      window.plugins.toast.showWithOptions({
        message: "از لیست علاقه مندیها حذف شد.",
        duration: "short",
        position: "bottom",
        addPixelsY: -50,
      });
    } else {
      favArray[num] = true;
      app.SetFav();
      $("[fvnumber=" + num + "]").attr("src", "./inc/icon/heart.svg");
      window.plugins.toast.showWithOptions({
        message: "به لیست علاقه مندیها اضافه شد.",
        duration: "short",
        position: "bottom",
        addPixelsY: -50,
      });
    }
  },
  // back button function
  onBackKeyDown: function (e) {
    if (!playMode) {
      e.preventDefault();
      e.stopPropagation();
      if (new Date().getTime() - lastTimeBackPress < timePeriodToExit) {
        navigator.app.exitApp();
      } else {
        window.plugins.toast.showWithOptions({
          message: "برای خروج دوباره فشار دهید.",
          duration: "short",
          position: "bottom",
          addPixelsY: -50,
        });

        lastTimeBackPress = new Date().getTime();
      }
    } else if (playMode) {
      playMode = false;
      app.secClick();
      app.startPlayerFunc(lastPlayStart);
    }
  },
  // player buttons
  startPlayerFunc: function (num) {
    if (playMode) {
      playCardPos = $("#card-" + num).offset();
      playCardWidth = $("#card-" + num).width();
      playCardHeight = $("#card-" + num).height();

      clickedCard = num;
      lastPlayStart = num;
      $(".minus").children("img").hide();
      $(".card")
        .not("#card-" + num)
        .fadeOut("slow");
      $("#card-" + num + " .border-simultaneous").css("display", "none");
      $("#card-" + num + " .border-progress").css("padding", 0);
      $(
        '<div class="card-replacer" style="width:' +
        parseInt(playCardWidth + 22) +
        "px;height:" +
        parseInt(playCardHeight + 5) +
        'px"></div>'
      ).insertBefore("#card-" + num);
      $("#card-" + num)
        .css({
          position: "absolute",
          filter: "none",
          margin: 0,
          height: playCardHeight,
          width: playCardWidth,
          top: playCardPos.top,
          left: playCardPos.left,
          "z-index": "1",
        })
        .animate({ width: "100%", left: 0 }, "slow", function () {
          $("#container").css("height", "100vh");
          $(".full-playmode").show();
          $("header").animate({ top: -50 }, "slow");
          $("#card-" + num + " .minus")
            .css("text-align", "center")
            .animate({ height: "50px", top: 0, height: 75 }, 50, function () {
              $("#card-" + num).animate(
                { left: "0px", top: "0px", height: "100%" },
                "slow",
                function () {
                  if (!swChords) {
                    $("#waveCanvas").fadeIn("slow");
                    $("#textWaveCanvas").fadeIn("slow");
                  }
                  $("#back-btn").fadeIn("slow");
                  $(".switches").fadeIn("slow");
                  $("#lyrics-" + num).fadeIn("slow");
                }
              );
            });
        });
      $("footer").animate({ bottom: -100 }, "slow", function () {
        $(".navbar").hide();
        $(".lyrics-controller").show();
        if (AllLoadingFinished) {
          $("footer").animate({ bottom: 0 }, "slow");
        }
      });
    } else {
      $("#back-btn").hide();
      $(".switches").fadeOut("slow");
      $("#card-" + num).animate(
        { height: playCardHeight },
        "slow",
        function () {
          $("#waveCanvas").removeAttr("style");
          $("#textWaveCanvas").removeAttr("style");
          $(".chordCanvas").removeAttr("style");
          $("#container").removeAttr("style");
          $("#lyrics-" + num).removeAttr("style");
          $(".full-playmode").hide();
          $("#card-" + num + " .border-progress").animate(
            { padding: 3 },
            "slow"
          );
          $("#card-" + num + " .border-simultaneous").removeAttr("style");
          $(".minus").children().show();
          $(".navbar").animate({ bottom: 0 }, "slow");
          $(".card")
            .not("#card-" + num)
            .fadeIn("slow");
          $("#card-" + num).animate(
            {
              left: playCardPos.left,
              top: playCardPos.top,
              width: playCardWidth,
            },
            "slow",
            function () {
              $(".card-replacer").remove();
              $("#card-" + num).removeAttr("style");
              $("#card-" + num).css("filter", "none");
            }
          );
          $("#card-" + num + " .minus").animate(
            { height: playCardHeight },
            "slow",
            function () {
              $(".minus").css({ height: "", "text-align": "", position: "" });
            }
          );
        }
      );
      $("footer").animate({ bottom: -100 }, "slow", function () {
        $("header").animate({ top: 0 }, "slow");
        $(".lyrics-controller").hide();
        $(".navbar").show();
        $("footer").animate({ bottom: 0 }, "slow");
      });
    }
  },
  /*****************************SendingInfoForPlayer*****************************/
  // Main function to enable Bhd Lyrics
  bhdLyricsInit: function (num) {
    str = $("#lyrics-" + num);
    BhdLyrics.chordsArray = [];
    var myMediaElement = null;
    $("#textWaveCanvas").empty();
    BhdDraw.C = 0;
    if (!str.hasClass("enabled")) {
      str.addClass("enabled");
      console.log("initialize");
      BhdLyrics.init(str, num);
    }
    BhdLyrics.enableLyrics(str);
    if (swChords) {
      toggleChordSwitch();
      toggleChordSwitch();
    }
    BhdLyrics.chordInit(num);
  },
};
/*****************************GlobalClickEvents*****************************/
// Click On cards Events
$("#container").on("click", ".card", function () {
  const click = $(this);
  const num = click.attr("id").replace("card-", "");
  if (clickedCard != num && clicked && !playMode) {
    app.secClick();
  }
  if (!clicked && !playMode) {
    app.firstClick(num);
  }
});
// Click On Download&PLay button Events
$("#container").on("click", ".download-btn", function () {
  const click = $(this);
  const num = click.attr("flnumber");
  if (app.GetCard(num) != "downloaded" && !downloadProc) {
    downloadProc = true;
    $(
      '<img class="cancel-btn" src="./inc/icon/times-red.svg"></img>'
    ).insertBefore(click);
    app.fileExist(num);
  } else if (app.GetCard(num) == "downloaded") {
    playMode = true;
    loadSong(num);
    if (clickedCard != num) {
      app.secClick();
    }
    app.fileChanger(num);
    app.bhdLyricsInit(num);
  } else if (downloadProc) {
    window.plugins.toast.showWithOptions({
      message:
        " لطفاً صبور باشیداز دانلود شما " +
        (100 - percent.toFixed(0)) +
        "% مانده است.",
      duration: "short",
      position: "bottom",
      addPixelsY: -50,
    });
  }
});
// delete button
$("#container").on("click", ".delete-btn", function () {
  const click = $(this),
    num = click.attr("rmnumber"),
    filerm = [];
  if (!deleteProc) {
    filerm[0] = app.nameGenerator(songArray[num]);
    filerm[1] = app.nameGenerator(vocalArray[num]);
    let rmReq = confirm("آیا می خواهید فایل " + filerm[0] + " پاک شود؟");
    if (rmReq) {
      deleteProc = true;
      delProgressNum = num;
      app.removeFile(filerm);
    }
  } else if (deleteProc) {
    window.plugins.toast.showWithOptions({
      message: "سیستم در حال پاک کردن فایل است لطفاً صبور باشید.",
      duration: "short",
      position: "bottom",
      addPixelsY: -50,
    });
  }
});
// cancel button
$("#container").on("click", ".cancel-btn", function () {
  if (!cancelProgress) {
    app.SetCard(progressNum, "cancelled");
    cancelProgress = setInterval(() => {
      console.log("cancel this shit");
      Downloader.abort();
    }, 100);
  } else if (cancelProgress) {
    window.plugins.toast.showWithOptions({
      message: "سیستم در حال پردازش است لطفاً صبور باشید.",
      duration: "short",
      position: "bottom",
      addPixelsY: -50,
    });
  }
});
// favorite button
$("#container").on("click", ".favorite-btn", function () {
  const click = $(this),
    num = click.attr("fvnumber");
  app.favClick(num);
});
// Back arrow
$("#back-btn").on("click", function () {
  app.secClick();
  playMode = false;
  app.startPlayerFunc(lastPlayStart);
});
