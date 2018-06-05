function httpGetAsync(theUrl, callback, to_set) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function(){
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            callback(xmlHttp.responseText, to_set);
        }
    };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    //xmlHttp.setRequestHeader('User-agent', 'chrome:imaginarylandscapes_wallpaper:v0.1 (by /u/begelsyah)');
    xmlHttp.send(null);
}

function parseData(response, to_set) {
  var resp_json = JSON.parse(response);
  var il_posts = resp_json.data.children;
  var url_list = [];
  il_posts.forEach(function(item, index) {
    var item_url = item.data.preview;
    if(item_url!= undefined) {
      url_list.push(item_url.images[0].source.url);
    }
  });
  if (to_set) {
    setBackground(url_list);
  } else {
    saveUrlList(url_list);
  }
}

function setBackground(url_list) {
  //resp_json.data.children[0].data.preview.images[0].source.url
  //resp_json.data.children[0].data.url
  var img_url;
  do {
    img_url = url_list.shift();
  } while (img_url == undefined);
  document.body.style.backgroundImage = "url("+img_url+")";
  if (url_list.length === 0) {
    httpGetAsync('https://www.reddit.com/r/ImaginaryLandscapes.json', parseData, false);
  } else {
    saveUrlList(url_list);
  }
}

function saveUrlList(url_list) {
  chrome.storage.local.set({url_list: url_list});
}

function loadBackground() {
  /*
  syntax for after first page searches
  https://www.reddit.com/r/imaginarylandscapes/.json?count=50&after=t3_10omtd/
  */
  chrome.storage.local.get(['url_list'], function(result) {
    if (result.url_list == undefined) {
      httpGetAsync('https://www.reddit.com/r/ImaginaryLandscapes.json', parseData, true);
    } else {
      setBackground(result.url_list);
    }
  });
}

loadBackground();
