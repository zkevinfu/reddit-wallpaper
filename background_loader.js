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

/**
 * Returns the URL to make a GET request from, based off of stored settings.
 *
 * @return {string} full url to be request with params. i.e
 *                  'https://www.reddit.com/r/ImaginaryLandscapes/.json?limit='
 */
function getUrl(limit = "25") {
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

/**
 * Takes an array and saves it to chrome local storage under the name 'post_info_list'
 *
 * @param  {Array} post_info_list
 * @return {void}
 */
function savePostInfoList(post_info_list) {
  chrome.storage.local.get(['subreddit_post_dict'], function(result) {
    result.subreddit_post_dict[r_subreddit] = post_info_list;
    chrome.storage.local.set({subreddit_post_dict: result.subreddit_post_dict});
  });
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
      // TODO: Initialize Settings
    }
    r_subreddit = result.settings.subreddits[
      Math.floor(Math.random() * result.settings.subreddits.length)
    ];
    chrome.storage.local.get(['subreddit_post_dict'], function(result) {
      if (!isSet(result.subreddit_post_dict[r_subreddit])) {
        // TODO: Fill the dict
        httpGetAsync(getUrl(), parseData, true);
      } else {
        setBackgroundAndInfo(result.subreddit_post_dict[r_subreddit]);
      }
    });
  });
}

/**
 * Entry point to loading a background
 */
loadBackground();
