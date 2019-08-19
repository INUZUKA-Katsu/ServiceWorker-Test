if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        var elm=document.getElementById("swbtn");
        elm.style.display = "inline-block";
        navigator.serviceWorker.register('./my-service-worker.js', { scope: './' });
    });
}

function registServiceWorker(num){
    navigator.serviceWorker.register('./my-service-worker.js', { scope: './' })
    .then(function(reg) {
        console.log('登録に成功しました。 Scope は ' + reg.scope);
    })
    .then(function(){
        console.log(num);
        navigator.serviceWorker.controller.postMessage(num);
        console.log('postMessageの登録に成功しました。');
    })
    .catch(function(error) {
        console.log('登録に失敗しました。' + error);
    });
 }

// 文字入力ダイアログの表示
function ShowInputDialog() {
    var ret;
    num = prompt("お客様の番号を入力してください.");
    if (num!=null) {
        res=confirm("お客様の券番号は「" + num + "」でよろしいですか？");
        if(res==true){
        	notifyMe();
        	registServiceWorker(num);
        }
    }
}

function notifyMe() {
    // ブラウザが通知をサポートしているか確認する
    if (!("Notification" in window)) {
        alert("このブラウザはシステム通知をサポートしていません");
    }
    else if (Notification.permission === "granted") {
        // 許可を得ている場合は、通知を作成する
        //var notification = new Notification("通知は許可済みです。");
    }
    // 許可を得ていない場合は、ユーザに許可を求めなければならない
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            // ユーザが許可した場合は、通知を作成する
            if (permission === "granted") {
                var notification = new Notification("通知が許可されました。");
            }
        });
    }
}
