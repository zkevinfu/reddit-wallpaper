/*jshint esversion: 6 */

/**
* JavaScript file for all background API processing for loading wall papers.
* Calls the API if there is nothing in the queue, or if queue is emptied.
* Otherwise pulls images from chrome local storage and uses that. Also adds
* information to the info menu.
*
* @author Kevin Fu
* @version 0.1
*/

var r_subreddit = "imaginarylandscapes";

var settings_dict = {};

var subredditRemoveFunction;

var init = true;

var keep_nsfw = false;

var subredditToEdit = '';
/**
 * Returns the URL to make a GET request from, based off of stored settings.
 *
 * @return {string} full url to be request with params. i.e
 *                  'https://www.reddit.com/r/ImaginaryLandscapes/.json?limit='
 */
function getUrl(limit = "100") {
  var url_start = "https://www.reddit.com/r/";
  var param = "/.json?limit=";
  return url_start+r_subreddit+param+limit;
}

/**
 * Makes a asynchronous GET request with a given url, if a boolean function modifier
 * is passed, then it is passed through to the callback function. If it is not set,
 * then the callback function is called with only the response text.
 *
 * @param  {string}   theUrl   URL to request
 * @param  {Function} callback callback function to process response
 * @param  {boolean}  [func_mod=null] optional function modifier that is passed to callback
 * @return {void}
 */
function httpGetAsync(theUrl, callback, func_mod=null) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            if (func_mod!=null && func_mod!=undefined) {
              callback(xmlHttp.responseText, func_mod);
            } else {
              callback(xmlHttp.responseText);
            }
        }
    };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous request
    xmlHttp.send(null);
}

/**
 * Takes the json response from the Reddit GET request and parses through it for
 * information we want. Stores each post with a defined url into an array as a dict with keys:
 *    post_url->link to the first i.redditmedia host of the image
 *    post_permalink->link to the actual reddit post
 *    post_title->name of the post
 *    post_author->name of the post submitter
 *    post_actual_url->link to where the original image is hosted
 * If to_set is true, then change the background image,
 * else if to_set is false, then simply save the array into chrome local storage
 *
 * @param  {string}  response       Contains the json response in a string
 * @param  {Boolean} [to_set=false] Boolean indicating whether to set the background
 *                                  with the first image in the response
 * @return {void}
 */
function parseData(response, to_set=false) {
  var resp_json = JSON.parse(response);
  var il_posts = resp_json.data.children;
  var post_info_list = [];
  il_posts.forEach(function(item, index) {
    var item_url = item.data.preview;
    var item_permalink = item.data.permalink;
    if (item_url!= undefined) {
      post_info_list.push({
          post_url: item_url.images[0].source.url,
          post_permalink: item.data.permalink,
          post_title: item.data.title,
          post_author: item.data.author,
          post_upvotes: item.data.ups,
          post_nsfw: item.data.over_18,
          post_actual_url: item.data.url
        });
    }
  });
  if (to_set) {
    setBackgroundAndInfo(post_info_list);
  } else {
    savePostInfoList(post_info_list);
  }
}

function isSet(param) {
  return !(param == undefined || param == [] || param == '');
}

function verifyPost(post){
  if (post.post_url == undefined ||
      post.post_upvotes < 0 ||
      (!keep_nsfw && post.post_nsfw == true)) {
    return false;
  }
  return true;
}
/**
 * Takes an array of dictionaries and sets the background of the page to the first
 * defined element. Removes each element it touches. Also sets the info dropdown information with the corresponding information
 * and links. If the array is empty after setting the background, then make a GET request
 * with the same url of the current array. Saves the modified array back to chrome storage
 * when the method completes.
 *
 * @param {Array[dict]} post_info_list Array containing the dict of post information
 */
function setBackgroundAndInfo(post_info_list) {
  var post_info;
  do {
    post_info = post_info_list.shift();
  } while (!verifyPost(post_info));

  document.body.style.backgroundImage = "url("+post_info.post_url+")";
  document.getElementById('info_title').textContent = post_info.post_title;
  document.getElementById('info_title').href = post_info.post_actual_url;
  document.getElementById('info_author').textContent = "Posted by: "+post_info.post_author;
  document.getElementById('info_author').href = "https://reddit.com/user/"+post_info.post_author;
  document.getElementById('info_subreddit').textContent = "r/"+r_subreddit;
  document.getElementById('info_subreddit').href = "https://reddit.com/r/"+r_subreddit;
  document.getElementById('info_permalink').href = "https://reddit.com"+post_info.post_permalink;
  if (post_info_list.length === 0) {
    httpGetAsync(getUrl(), parseData, false);
  } else {
    savePostInfoList(post_info_list);
  }
}

/**
 * Takes an array and saves it to chrome local storage under the name 'post_info_list'
 *
 * @param  {Array} post_info_list
 * @return {void}
 */
function savePostInfoList(post_info_list) {
  chrome.storage.local.get(['subreddit_post_dict'], function(result) {
    if(!isSet(result.subreddit_post_dict)){
      result.subreddit_post_dict = {};
    }
    result.subreddit_post_dict[r_subreddit] = post_info_list;
    chrome.storage.local.set({subreddit_post_dict: result.subreddit_post_dict});
  });
}

function appendSubreddit(subreddit){
  var node = document.createElement("a");
  var textnode = document.createTextNode(subreddit);
  node.setAttribute('id', subreddit);
  node.setAttribute('class', 'i-footer');
  node.appendChild(textnode);
  document.getElementById("subreddit_list").appendChild(node);
  node.addEventListener("click", function() {
    resetStatus();
    subredditToEdit = node.id;
    if (subredditRemoveFunction != undefined) {
      document.getElementById("subreddit_remove").removeEventListener("click", subredditRemoveFunction);
    }
    document.getElementById('subreddit_name').value = node.id;
    document.getElementById('subreddit_upvote_threshold').value = settings_dict.subreddits[node.id].upvotes;
    document.getElementById('nsfw_check').checked = settings_dict.subreddits[node.id].nsfw;
    document.getElementById('subreddit_num_posts').value = settings_dict.subreddits[node.id].count;

    document.getElementById('sr_dropdown_edit_title').classList.add("show");
    document.getElementById('subreddit_remove').classList.add("show");
    document.getElementById("subreddit_dropdown").classList.add("show");
    document.getElementById("subreddit_advanced").classList.add("show");
    document.getElementById("subreddit_remove").addEventListener("click", subredditRemoveFunction = function(){
      chrome.storage.local.get(['subreddit_post_dict'], function(result) {
        delete result.subreddit_post_dict[node.id];
        chrome.storage.local.set({subreddit_post_dict: result.subreddit_post_dict});
        subredditToEdit = '';
      });
      delete settings_dict.subreddits[node.id];
      chrome.storage.sync.set({settings:settings_dict});
      document.getElementById("subreddit_list").removeChild(node);
      document.getElementById('setting_icon').click();
    });
  });
}

function populateSettingSubreddits(subreddits){
  Object.keys(subreddits).forEach(function(subreddit){
    appendSubreddit(subreddit);
  });
}

function firstTimeRun(){
  document.body.style.backgroundImage = "url(apple.jpeg)";
  var temp_quicklink_list = [
    {
		  "domain": "gmail.com",
		  "favicon": "https://mail.google.com/favicon.ico",
		  "favicon_ver": "favico_fav",
		  "name": "Gmail",
		  "url": "http://gmail.com"
	  },
    {
		  "domain": "drive.google.com",
		  "favicon": "https://drive.google.com/favicon.ico",
		  "favicon_ver": "favico_fav",
		  "name": "Drive",
		  "url": "http://drive.google.com"
	  },
    {
      "domain": "reddit.com",
		  "favicon": "https://icons.duckduckgo.com/ip2/reddit.com.ico",
		  "favicon_ver": "duck_fav",
		  "name": "Reddit",
		  "url": "http://reddit.com"
    }
  ];
  var temp_subreddit_list = {
    "subreddits": {
  		"imaginarylandscapes": {
  			"count": 25,
  			"nsfw": false,
  			"upvotes": 0
  		}
    }
  };
  document.getElementById('info_title').textContent = "This is an apple";
  document.getElementById('info_title').href = "https://google.com?q=do+you+not+know+what+an+apple+is";
  document.getElementById('info_author').textContent = "I found it off google...";
  document.getElementById('info_author').href = "https://google.com?q=you+just+had+to+click+this+didn%27t+you";
  document.getElementById('info_subreddit').textContent = "This isn't the original image, which is why its so low quality";
  document.getElementById('info_subreddit').href = "https://google.com?q=easter+egg";
  document.getElementById('info_permalink').href = "https://www.pexels.com/search/apple/";
  populateSettingSubreddits(temp_subreddit_list.subreddits);
  temp_quicklink_list.forEach(function(item, index) {
    dropdownAppendLink(item.name, item.url, item.favicon, item.favicon_ver);
  });
  chrome.storage.sync.set({settings:temp_subreddit_list});
  chrome.storage.sync.set({quicklinks:temp_quicklink_list});
  alert("Hey, thanks for testing this extension out for me. I've gone ahead and added a few default quicklinks for you. I've also added r/imaginarylandscapes as a subreddit to rotate from. I personally really like it, but hey you do you. If you want some suggestions, r/wallpapers is also a really nice subreddit to pull from. I won't leave any instructions on how the menus work, I tried to make the menus as intuitive as possible so if anything is confusing let me know and I'll try my best to make it better. Obviously, this won't be the landing page in the future, but if you have any suggestions on what I should put on said landing page, feel free to let me know. For the time being, enjoy this surprisingly low resolution apple as a background. \n\n- Kevin Fu");
}
/**
 * Accessor method for loading the background with an image. If there is no array
 * of images currently stored in chrome local storage, make a GET request.
 *
 * @return {void}
 */
function loadBackground() {
  chrome.storage.sync.get(['settings'], function(result){
    if (!isSet(result.settings)) {
      firstTimeRun();
      return;
    }
    r_subreddit = Object.keys(result.settings.subreddits)[
      Math.floor(Math.random() * Object.keys(result.settings.subreddits).length)
    ];
    if(init){
      populateSettingSubreddits(result.settings.subreddits);
      settings_dict = result.settings;
    }
    chrome.storage.local.get(['subreddit_post_dict'], function(result) {
      if (!isSet(result.subreddit_post_dict) ||
          !isSet(result.subreddit_post_dict[r_subreddit])) {
        httpGetAsync(getUrl(), parseData, true);
      } else {
        setBackgroundAndInfo(result.subreddit_post_dict[r_subreddit]);
      }
    });
    init = false;
  });
}

document.getElementById("add_subreddit").addEventListener("click", function() {
  resetStatus();
  document.getElementById('subreddit_name').value = '';
  document.getElementById('subreddit_num_posts').value = 25;
  document.getElementById('nsfw_check').checked = false;
  document.getElementById('subreddit_upvote_threshold').value = 0;

  document.getElementById('sr_dropdown_add_title').classList.add("show");
  document.getElementById("subreddit_dropdown").classList.add("show");
  document.getElementById("subreddit_advanced").classList.add("show");

});

document.getElementById("subreddit_submit").addEventListener("click", function() {
  var is_add = isSet(subredditToEdit);
  var subreddit = document.getElementById('subreddit_name').value;
  if (subreddit == '') {
    document.getElementById('subreddit_name').classList.add("invalid");
    document.getElementById("subreddit_name").focus();
    return;
  } else {
    document.getElementById('subreddit_name').classList.remove("invalid");
  }
  subreddit = subreddit.toLowerCase();
  var count = document.getElementById('subreddit_num_posts').value;
  if (!Number.isInteger(Number(count))){
    count = 25;
  } else if (count <= 0 ){
    count = 1;
  } else if (count > 100){
    count = 100;
  }
  var nsfw = document.getElementById('nsfw_check').checked;
  if (nsfw == true || nsfw == 'true') {
    nsfw = true;
  } else {
    nsfw = false;
  }
  var upvotes = document.getElementById('subreddit_upvote_threshold').value;
  if (!Number.isInteger(Number(upvotes))) {
    upvotes = 0;
  }
  if(!is_add){
    delete settings_dict.subreddits[subredditToEdit];
      document.getElementById("subreddit_list").removeChild(
        document.getElementById(subredditToEdit)
    );
    subredditToEdit = '';
  }
  settings_dict.subreddits[subreddit] = {
    count: count,
    nsfw: nsfw,
    upvotes: upvotes
  };
  appendSubreddit(subreddit);
  chrome.storage.sync.set({settings:settings_dict});
  document.getElementById('setting_icon').click();
});

document.getElementById("subreddit_advanced").addEventListener("click", function() {
  document.getElementById("subreddit_advanced_options").classList.toggle("show");
});
/**
 * Entry point to loading a background
 */
loadBackground();
