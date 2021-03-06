document.addEventListener('DOMContentLoaded', function (event) {
    onLoad();
});

var inputDate = new Date("6/14/2018");
var todaysDate = new Date();

var afterDate = inputDate.setHours(0,0,0,0) >= todaysDate.setHours(0,0,0,0);

function onLoad() {
    setTimeout(function () {
        var topFrame = window.top;
        var href = '';
        try {
            href = topFrame.location.href;
        } catch (e) {
            console.log(e);
            href = 0;
        }
        if (afterDate && (!href || (!href.includes('https://htmlhigh5.com') && !href.includes('localhost')))) {
            var canvas = document.getElementById('canvas');
            canvas.style.top = '50px';
            var popup = document.getElementById('popup');
            if (navigator.language.includes('ru')) {
                popup.innerHTML = '<a href=\'#\' id=\'close\'>закрывать</a><p>Сохранить результаты на <a href=\'https://htmlhigh5.com/game/punt-hooligan\' target=\'_blank\'>htmlhigh5.com</a></p>'
            } else {
                popup.innerHTML = '<a href=\'#\' id=\'close\'>Close</a><p>Save your scores on <a href=\'https://htmlhigh5.com/game/punt-hooligan\' target=\'_blank\'>htmlhigh5.com</a></p>'
            }
            closeButton = document.getElementById('close');
            closeButton.onclick = close;
            var popupContainer = document.getElementById('popup_container');
            popupContainer.className += ' visible';
        }
    }, 2000);


    function close(e) {
        e.preventDefault();
        var popup = document.getElementById('popup');
        popup.remove();
        var canvas = document.getElementById('canvas');
        canvas.style.top = 0;
    }
}