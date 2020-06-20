var Player = {
    // player Constructor
    initialize: function() {  
        this.playerEvents();
    },
    playerEvents: function(){
    var vocalSlider = document.getElementById("change_vol_vocal"),
        songSlider = document.getElementById("change_vol_song"),
        playBtn = document.getElementById("play-button"),
        pauseBtn = document.getElementById("pause-button"),
        stopBtn = document.getElementById("stop-button"),
        swChordBtn = document.getElementById("switch-chord"),
        swVocalBtn = document.getElementById("switch-vocal"),
        swSongBtn = document.getElementById("switch-song"),
        vocalMuteBtn = document.getElementById("buttonMuteVocal"),
        songMuteBtn = document.getElementById("buttonMuteSong"),
        vocalNetwork = vocalAudio.networkState,
        songNetwork = songAudio.networkState,
        vocalState = vocalAudio.readyState,
        songState = songAudio.readyState,
        loading = jQuery(".se-pre-con"),
        stickyPanel = jQuery('#sticky-controller'),
        timerCunt = 1,
        songLoader = false,
        mouseDown = 0;


        playBtn.addEventListener('click', function() {
            
            // check if context is in suspended state (autoplay policy)
            if (ctxAudios.state === 'suspended') {
                ctxAudios.resume();
            }
            
            if (this.dataset.playing === 'false') {
                vocalAudio.play();
                this.dataset.playing = 'true';
            // if track is playing pause it
            } else if (this.dataset.playing === 'true') {
                vocalAudio.pause();
                this.dataset.playing = 'false';
            }
            
            let state = this.getAttribute('aria-checked') === "true" ? true : false;
            this.setAttribute( 'aria-checked', state ? "false" : "true" );
            
        }, false);

        function fetchAudioAndPlay(playerTime){
            vocalTime(playerTime);
            songTime(playerTime);
            if ( vocalState == 1  && songState != 0 || songState != 2 ) {
                document.getElementById("play-button").innerHTML = '<i class="fas fa-sync"><span class="sync-tip">هماهنگ سازی</span></i>';
                songAudio.play();
                vocalAudio.play();
            }
            else if ( vocalState == 3 && songState != 0 || songState != 2 ){
                document.getElementById("play-button").innerHTML = '<i class="fas fa-sync"><span class="sync-tip">هماهنگ سازی</span></i>';
                songAudio.play();
                vocalAudio.play();
            }
        
            else if ( vocalState == 4 && songState != 0 || songState != 2 ){
                document.getElementById("play-button").innerHTML = '<i class="fas fa-sync"><span class="sync-tip">هماهنگ سازی</span></i>';
                songAudio.play();
                vocalAudio.play();
            }
            else {
                timerCunt = 1,
                intervalId = setInterval(checkTimer, 500);
            }
        }

        function checkTimer(){
            if (intervalId) { 
                if ( timerCunt < 30 ){
                    if ( timerCunt >= 4 && vocalNetwork == 1 && songNetwork == 1 || vocalNetwork == 2 && songNetwork == 2 && vocalState == 1 && songState != 0 || songState != 2
                        || vocalState == 3 && songState != 0 || songState != 2 || vocalState == 4 && songState != 0 || songState != 2){
                        stickyPanel.fadeIn("slow");
                        loading.fadeOut("slow");
                        songLoader = true ;
                        clearInterval(intervalId);
                        if ( vocalAudio.currentTime ){
                            fetchAudioAndPlay(vocalAudio.currentTime);
                        }
                    }
                    else if ( timerCunt >= 4 && vocalNetwork == 0 && songNetwork == 0 ){
                        vocalAudio.load();
                        songAudio.load();
                    }
                }
                else {
                    clearInterval(intervalId)
                    jQuery(".se-pre-con h5").text("مشکلی رخ داده یا سرعت اینترنت خوب نیست!");
                    jQuery(".se-pre-con p").text("لطفاً برای بارگذاری مجدد کلیک کنید!");
                    jQuery( ".se-pre-con img" ).replaceWith( 
                        '<img src="https://voiceless.ir/wp-content/plugins/bhd-lyrics/inc/gif/refresh.svg" style="font-size:20px;cursor: pointer" onclick="location.reload()" alt="بازنشانی"></img>' );
                }
            timerCunt++;
            }
        } 

    // play Function
    function vocalTime(playerTime){
    vocalAudio.currentTime = playerTime;
    }
    function songTime(playerTime){
        songAudio.currentTime = playerTime;
    }

    fillBar.onmousedown = function() { 
        ++mouseDown;
    }
    fillBar.onmouseup = function() {
        --mouseDown;
    }

    var touchDown = 0;
    fillBar.ontouchstart = function() { 
        ++touchDown;
    }
    fillBar.ontouchend = function() {
        --touchDown;
    }

    fillBar.addEventListener('mouseup' , function(e){
        seekValue = e.target.value;
        seekpos = seekValue * vocalAudio.duration;
        seekPlay = seekpos / 100;
        vocalTime(seekPlay);
        songTime(seekPlay);
    })
    fillBar.addEventListener('touchend' , function(e){
        seekValue = e.target.value;
        seekpos = seekValue * vocalAudio.duration;
        seekPlay = seekpos / 100;
        vocalTime(seekPlay);
        songTime(seekPlay);
    })

    vocalMuteBtn.onclick = function() {
        vocalMute();
    }

    songMuteBtn.onclick = function() {
        songMute();
    }

    // switch button
    swVocalBtn.onclick = function() {
        if( vocalSlider.value < 0.5 && swVocalBtn.value == "Off" ){
            vocalSlider.value = 1 ;
        }
        vocalMute();
    }
    swSongBtn.onclick = function() {
        if( songSlider.value < 0.5 && swSongBtn.value == "Off" ){
            songSlider.value = 1 ;
        }
        songMute();
    }

    vocalSlider.oninput = function(){
        vocalAudio.volume=this.value;
        if(vocalAudio.muted == true) {
            vocalMute()
        } 
        if(this.value == 0){
            vocalMute()
        }
    }

    songSlider.oninput = function(){
        songAudio.volume=this.value;
        if(songAudio.muted == true) {
            songMute()
        }
        if(this.value == 0){
            songMute()
        }
    }

    var header = document.getElementById("lyric-player");
    var btns = header.getElementsByClassName("playback-button");

    for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function() {
            var current = document.getElementsByClassName("active-btns");
            current[0].className = current[0].className.replace(" active-btns", "");
            this.className += " active-btns";
        });
    }

    // playBtn.addEventListener("click", function() {
    //     if( vocalAudio.paused && songAudio.paused){
    //         if ( vocalAudio.currentTime ){
    //             fetchAudioAndPlay(vocalAudio.currentTime);
    //         }
    //         else {
    //             var beginTime = 0;
    //             fetchAudioAndPlay(beginTime);
    //         }
    //     }
    // })

    vocalAudio.durationchange = function() {
        fetchAudioAndPlay(vocalAudio.currentTime);
    }


    pauseBtn.addEventListener( "click" ,function () {
        vocalAudio.pause();
        songAudio.pause(); 
        playBtn.innerHTML = '<i class="fa fa-play"></i>';
    })

    stopBtn.addEventListener("click", function () {
        vocalAudio.pause();
        songAudio.pause();
        vocalAudio.currentTime = 0;
        songAudio.currentTime = 0;
        playBtn.innerHTML = '<i class="fa fa-play"></i>';
    })

    swChordBtn.addEventListener("click", function () {
        currentvalue = swChordBtn.value;
        if( currentvalue == "Off" ){
            swChordBtn.value="On";
            jQuery('.word').addClass('chord-data')
            jQuery('.word-space').css('margin','40px 15px 10px 15px')
        }
        else{
            swChordBtn.value="Off";
            jQuery('.word').removeClass('chord-data')
            jQuery('.word-space').css('margin','25px 15px 10px 15px')
        }
    })

    function vocalMute(){
        var isVocalMuted = vocalAudio.muted;
        if(!isVocalMuted || vocalSlider.value == 0){
            vocalSlider.style.opacity = 0.6;
            buttonMuteVocal.classList.remove('active-btn');
            buttonMuteVocal.innerHTML = '<i class="fas fa-microphone-alt-slash"></i> ';
            vocalAudio.muted = true;
            swVocalBtn.value="Off";
        } 
        else {
            vocalSlider.style.opacity = 1;
            buttonMuteVocal.classList.add('active-btn');
            buttonMuteVocal.innerHTML = '<i class="fas fa-microphone-alt"></i> ';
            vocalAudio.muted = false;
            swVocalBtn.value="On";
        }
    }
    function songMute(){
        var isSongMuted = songAudio.muted;
        if(!isSongMuted || songSlider.value == 0 ){
            songSlider.style.opacity = 0.6;
            buttonMuteSong.classList.remove('active-btn');
            buttonMuteSong.innerHTML = '<i class="fas fa-music-alt-slash"></i> ';
            songAudio.muted = true;
            swSongBtn.value="Off";
        } 
        else {
            songSlider.style.opacity = 1;
            buttonMuteSong.classList.add('active-btn');
            buttonMuteSong.innerHTML = '<i class="fas fa-music-alt"></i> ';
            songAudio.muted = false;
            swSongBtn.value="On";
        }
    }
}
    // songAudio.addEventListener('ended',  endedStop);

//     endedStop:function(){
//         vocalTime(0);
//         songTime(0);
//         playBtn.innerHTML = '<i class="fa fa-play"></i>';
//     }	
}
// $(window).ready(function() {

//     intervalId = setInterval(checkTimer, 500);

// })