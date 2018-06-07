function getUrl(){
  var url_start = "https://www.reddit.com/r/";
  var subreddit = "ImaginaryLandscapes";
  var param = "/.json?limit=";
  return url_start+subreddit+param;
}
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
  var post_info_list = [];
  il_posts.forEach(function(item, index) {
    var item_url = item.data.preview;
    var item_permalink = item.data.permalink;
    if(item_url!= undefined) {
      post_info_list.push({
          post_url: item_url.images[0].source.url,
          post_permalink: item.data.permalink,
          post_title: item.data.title,
          post_author: item.data.author,
          post_actual_url: item.data.url
        });
    }
  });
  if (to_set) {
    setBackground(post_info_list);
  } else {
    savePostInfoList(post_info_list);
  }
}

function setBackground(post_info_list) {
  //resp_json.data.children[0].data.preview.images[0].source.url
  //resp_json.data.children[0].data.url
  do {
    post_info = post_info_list.shift();
  } while (post_info.post_url == undefined);

  document.body.style.backgroundImage = "url("+post_info.post_url+")";
  document.getElementById('info_title').textContent = post_info.post_title;
  document.getElementById('info_title').href = post_info.post_actual_url;
  document.getElementById('info_author').textContent = "Posted by: "+post_info.post_author;
  document.getElementById('info_author').href = "https://reddit.com/user/"+post_info.post_author;
  document.getElementById('info_permalink').href = "https://reddit.com"+post_info.post_permalink;
  if (post_info_list.length === 0) {
    httpGetAsync(getUrl(), parseData, false);
  } else {
    savePostInfoList(post_info_list);
  }
}

function savePostInfoList(post_info_list) {
  chrome.storage.local.set({post_info_list: post_info_list});
}

function loadBackground() {
  /*
  syntax for after first page searches
  https://www.reddit.com/r/imaginarylandscapes/.json?count=50&after=t3_10omtd/
  syntax for 100 il_posts
  https://www.reddit.com/r/imaginarylandscapes/.json?limit=100
  */
  chrome.storage.local.get(['post_info_list'], function(result) {
    if (result.post_info_list == undefined || result.post_info_list == [] || result.post_info_list == '') {
      httpGetAsync(getUrl(), parseData, true);
    } else {
      setBackground(result.post_info_list);
    }
  });
}

loadBackground();
