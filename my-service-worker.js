
const site_url="http://localhost/Sites/serviceworker-test/";
let   num={};
let   pre_num={};
let   today;
let   callTime={};
let   jihun={};
let   stop;


self.addEventListener('install', (event) => {
  console.log('service worker install ...');
});

self.addEventListener('activate', (event) => {
    console.info('activate', event);
    //active 状態になったらすぐにブラウザをコントロールさせる.
    event.waitUntil(self.clients.claim());
    //var madoNums = getMadoNums();
});

self.addEventListener('message', event => {
    num     = event.data;
    pre_num = 999;
    today   = getToday();
    callTime= undefined;
    stop    = undefined;
    console.log('postMessage受信できました！=> '+num);
    fetch('./madoNums.json')
        .then(function(response){
            return response.json();
        })
        .then(function(madoNums){
            //番号を一定間隔で繰り返し確認する。
            checkNumber(num,madoNums,3*1000);
        });
});

self.addEventListener("notificationclick", function(event) {
    event.notification.close();
    if(event.action=='stop'){
        stop=true;
    }else{
        clients.openWindow(site_url);
    }
}, false);

self.addEventListener('fetch', function(event) {
    console.log('fetch', "fetchメソッドが呼ばれたよ!: "+event.request.url);
});

async function checkNumber(num,madoNums,delay) {
    let myHeaders = new Headers();
    myHeaders.append('pragma', 'no-cache');
    myHeaders.append('cache-control', 'no-cache');
    
    let myInit = {
      method: 'GET',
      headers: myHeaders,
    };

    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            if(num!=0 && stop==undefined){
                fetch('./currentNums.json',myInit)
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(currentNums){
                        //console.log(JSON.stringify(currentNums);
                        let c=cNum(num,madoNums,currentNums);
                        let n=atoNannin(num,madoNums,currentNums);
                        //console.log("c="+c[0]+", pre_num="+pre_num);
                        if(n<=pre_num){
                            pre_num=n;
                            //console.log("あと"+n+"人！");
                            //console.log("前回は"+pre_num+"人");                          
                            let mess = new Object;
                            mess.title="ただいま"+c[0]+"番です.(保険年金課)";
                            if(n>0){
                                mess.body="あと "+n+"人 です.";
                            }else{
                                mess.body="お客様の番号をお呼びしています.";
                            }
                            showMessage(mess);
                        }else{
                            console.log(callTime);
                            if(callTime==undefined){
                                callTime=new Date();
                                jihun=makeTime(callTime);
                            }
                            let mess = new Object;
                            mess.title="ただいま"+c[0]+"番です.(保険年金課)";
                            mess.body="お客様の"+num+"番は,"+jihun+"にお呼びしました.";
                            showMessage(mess);
                        }
                        //console.log(num_has_gone);
                        resolve();
                    });
            }
        }, delay);
    });
    const ans = await promise ;
    if(today==getToday() &&
      (callTime==undefined || diffMin(callTime,new Date())<=30)){
        checkNumber(num,madoNums,delay);
    }
}

function cNum(num,madoNums,currentNums){
    for(k in madoNums){
        if(madoNums[k][0]<=num && num<=madoNums[k][1]){
            return [currentNums[k],k];
        }
    }
}

function atoNannin(num,madoNums,currentNums){
    let c=cNum(num,madoNums,currentNums);
    console.log(c[0]);
    if(c[0]<=num){
        return num-c[0];
    }else{
        return (madoNums[c[1]][1]-c[0])+(num-madoNums[c[1]][0]);
    }
}

function showMessage(mess){
  if (Notification.permission == "granted") {
    // /*通知作成して表示 */
    self.registration.showNotification(mess.title, {
          body: mess.body,
          actions: [{action: "stop",title: "非表示"}],
          vibrate: [200, 100, 200, 100, 200, 100, 200]
          //tag: 'hogehoge'  tagを固定すると同一の通知と判断され、1回しか表示されなくなる.
    });
  } else if(result.state == 'denied'){
      console.log('許可されていません。');
  }
}

function getToday(){
    let today = new Date();
    return today.getFullYear() + "/" +  today.getMonth() + 1 + "/"+ today.getDate()  + "/" + today.getDay();
}

function makeTime(date){
  return date.getHours() + ":" + ("0"+date.getMinutes()).slice(-2);
}

function diffMin(time1,time2){
  let diff=time2.getTime()-time1.getTime();
    return diff/(1000*60);
}
