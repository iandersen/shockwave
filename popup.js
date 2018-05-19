document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});

function onLoad(){
    setTimeout(function(){
        var topFrame = window.top;
        var href = '';
        try {
            href = topFrame.location.href;
        } catch (e){
            console.log(e);
            href = 0;
        }
        if(!href || !href.includes("https://htmlhigh5.com")){
            var canvas = document.getElementById("canvas");
            canvas.style.top = '50px';
            var popup = document.getElementById("popup");
            if(navigator.language.includes('ru')){
                popup.innerHTML = "<a href='#' id='close'>закрывать</a><p>Сохранить результаты на <a href='https://htmlhigh5.com/game/punt-hooligan' target='_blank'>htmlhigh5.com</a></p>"
            } else {
                popup.innerHTML = "<a href='#' id='close'>Close</a><p>Save your scores on <a href='https://htmlhigh5.com/game/punt-hooligan' target='_blank'>htmlhigh5.com</a></p>"
            }
            closeButton = document.getElementById('close');
            closeButton.onclick = close;
        }
    }, 5000);


    function close(e){
        e.preventDefault();
        var popup = document.getElementById("popup");
        popup.remove();
        var canvas = document.getElementById("canvas");
        canvas.style.top = 0;
    }
}