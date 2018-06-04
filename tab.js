function httpGetAsync(theUrl, callback){
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    //xmlHttp.setRequestHeader('User-agent', 'chrome:imgaginarylandscapes_wallpaper:v0.1 (by /u/begelsyah)');
    xmlHttp.send(null);
}

function setBody(response){
  var resp_json = JSON.parse(response);
  document.body.style.backgroundImage = "url("+resp_json.data.children[2].data.url+")";
}

httpGetAsync('https://www.reddit.com/r/ImaginaryLandscapes.json', setBody);
