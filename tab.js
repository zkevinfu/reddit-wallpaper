/*jshint esversion: 6 */

/**
* JavaScript file for all UI proccessing. Loads all quicklinks and setting values from
* chrome.storage.sync. Attatches all event listeners to the document.
*
* @author Kevin Fu
* @version 0.1
*/

/**
 * Dict containing known url redirects with missing favicons
 *
 * @type {Object}
 */
var url_with_favi_issues = {
  gmailcom:"mail.google.com"
};

/**
 * Array containing the current stored quicklinks
 *
 * @type {Array}
 */
var cur_url_list = [];

/**
 * Array containing the current stored settings
 *
 * @type {Array}
 */
var settings = [];

/**
 * Dict containg a mapping from id to event listener functions
 *
 * @type {Object}
 */
var onClickFunctionDict = {};

/**
 * Global variable for storing event listener functions before pushing them to
 * the id->function dictionary
 *
 * @type {function}
 */
var onClickFunction = function(){};

/**
 * Global variable containing the currently modified quicklink, '' if no link is
 * being modified.
 * @type {String}
 */
var linkToEdit = '';

/**
 * Hides all menu dropdowns in 'dropdown-box', and minimizes quicklink options with 'quicklink-options'
 */
function hideDropdowns() {
  removeClass("dropdown-box");
  removeClass('quicklink-options');
}

/**
 * Resets the state of the document to that when first opened. Only quicklink
 * extended options maintains it's current state
 */
function resetStatus() {
  document.getElementById('quicklink_dropdown').classList.remove('show');
  document.getElementById('quicklink_change_icon_dropdown').classList.remove('show');
  document.getElementById('quicklink_name').classList.remove("invalid");
  document.getElementById('quicklink_url').classList.remove("invalid");
  clearQuicklinkInput();
  removeClass('variable-m-label');
  removeClass('m-text', 'to-remove');
  removeClass('m-text', 'to-edit');
  removeClass('selected', 'selected');
  onClickFunctionDict = removeListener(onClickFunctionDict);
  linkToEdit = '';
}

/**
 * Removes a class, default = 'show', from all elements in a given class
 *
 * @param {String} class_name         class of the elements to look at
 * @param {String} [to_remove='show'] name of class to be removed
 * @return {void}
 */
function removeClass(class_name, to_remove = 'show') {
  var elements = document.getElementsByClassName(class_name);
  var i;
  for (i = 0; i < elements.length; i++) {
    if (elements[i].classList.contains(to_remove)) {
      elements[i].classList.remove(to_remove);
    }
  }
}

/**
 * Sets the value of the input boxes in add_quicklink to ''
 *
 * @return {void}
 */
function clearQuicklinkInput() {
  document.getElementById('quicklink_name').value = '';
  document.getElementById('quicklink_url').value = '';
}

/**
 * Helper function to remove the beginning protocol from urls if they exists
 *
 * @param  {string} url URL to process i.e http://example.com/exam/ple
 * @return {[type]}     URL without front protocol i.e example.com/exam/ple
 */
function removeHTTP(url) {
  return url.replace('https://','').replace('http://', '');
}

/**
 * Pulls the domain from a given url. Replaces the domain if it exists as a key in
 * 'url_with_favi_issues' with the respective value
 *
 * @param  {string} url url as a string i.e https://exa.mple.example.com/exam/ple.html
 * @return {string}     the domain name of the given url i.e exa.mple.example.com,
 */
function processURL(url) {
  var reg = /^.+?(?=\/)/;
  var domain = (url+'/').match(reg);
  domain = (domain==null)?'':domain[0];
  if (url_with_favi_issues[domain.replace('.','')]!==undefined) {
    return url_with_favi_issues[domain.replace('.','')];
  } else {
    return domain;
  }
}

/**
 * Helper function to assign a favicon in the switch favicon dropdown a 'checked'
 * parameter. Defaults to the first one if no parameter is passed
 *
 * @param {String} [current="favico_fav"] String indicating what favicon to set as checked:
 *                                        'favico_fav'->/favicon.ico
 *                                        'duck_fav'->duckduckgo
 *                                        'google_fav'->google
 *                                        'nofavi_fav'->/nofavi.png
 */
function setFavi(current="favico_fav") {
  document.getElementById(current).checked = true;
}

/**
 * Attatches a src to a favicon to a element with id equal to 'id'. If the src does
 * not exists, instead attatches the default no favi icon as the src
 *
 * @param  {string} id  id of element to be attatched
 * @param  {string} src link to where the favicon is hosted
 * @return {void}
 */
function fillFaviImg(id, src) {
  document.getElementById(id).addEventListener("error", function() {
    document.getElementById(id).setAttribute("src", "icons/nofavi.png");
  });
  document.getElementById(id).setAttribute("src", src);
}

/**
 * Populates the favicon display bar for add_quicklink with favicons from various
 * hosts for a given URL string.
 *
 * @param  {string} url     url to get the favicon from
 * @return {void}
 */
function fillFavi(url) {
  var domain = processURL(removeHTTP(url));
  fillFaviImg("favico_fav_img", "http://"+domain+"/favicon.ico");
  fillFaviImg("google_fav_img", "https://www.google.com/s2/favicons?domain="+domain);
  fillFaviImg("duck_fav_img", "https://icons.duckduckgo.com/ip2/"+domain+".ico");
  fillFaviImg("nofavi_fav_img", "icons/nofavi.png");
}

/**
 * Appends a quicklink to the quicklink dropdown menu_icon
 *
 * @param  {string} link_name    string containing the name of the quicklink
 * @param  {string} link         string containing the url of the quicklink
 * @param  {string} link_favicon string containing the url to the favicon of the quicklink
 * @param  {string} [favicon_ver = 'favico_fav']  string containing the method
 *                                                we retrieve the favicon i.e google_fav
 *                                                defaults to 'favico_fav'
 * @return {void}
 */
function dropdownAppendLink(link_name, link, link_favicon, favicon_ver='favico_fav') {
  var node = document.createElement("a");
  var imgnode = document.createElement("img");
  var textnode = document.createTextNode(link_name);
  imgnode.setAttribute("class", "m-favicon");
  imgnode.setAttribute("src", link_favicon);
  node.setAttribute('id', link);
  node.setAttribute('class', 'm-text');
  node.setAttribute('data-value', link_name);
  node.setAttribute('data-favicon_ver', favicon_ver);
  node.setAttribute('href', link);

  node.appendChild(imgnode);
  node.appendChild(textnode);
  document.getElementById("menu_dropdown_links").appendChild(node);
}

/**
 * Edits a quicklink to the quicklink dropdown menu_icon if a link is being edited,
 * if not then appends a link with that information.
 *
 * @param  {string} link_name    string containing the name of the quicklink
 * @param  {string} link         string containing the url of the quicklink
 * @param  {string} link_favicon string containing the url to the favicon of the quicklink
 * @param  {string} [favicon_ver = 'favico_fav']  string containing the method
 *                                                we retrieve the favicon i.e google_fav
 *                                                defaults to 'favico_fav'
 * @return {void}
 */
function dropdownModifyLink(link_name, link, link_favicon, favicon_ver='favico_fav') {
  if(linkToEdit === '' || linkToEdit === undefined || linkToEdit === null) {
    dropdownAppendLink(link_name, link, link_favicon, favicon_ver);
    return;
  }
  var node = linkToEdit;
  var imgnode = linkToEdit.getElementsByTagName('img')[0];
  linkToEdit.textContent = '';
  var textnode = document.createTextNode(link_name);

  imgnode.setAttribute("class", "m-favicon");
  imgnode.setAttribute("src", link_favicon);
  node.setAttribute('id', link);
  node.setAttribute('class', 'm-text');
  node.setAttribute('data-value', link_name);
  node.setAttribute('data-favicon_ver', favicon_ver);
  node.setAttribute('href', link);
  node.appendChild(imgnode);
  node.appendChild(textnode);
}

/**
 * removes a quicklink from the DOM
 *
 * @param  {string} link string containing the url of the link to be removed
 * @return {int} int containg the position of the element removed, -1 if not found
 */
function removeQuicklink(link) {
  var i;
  for (i = 0; i < cur_url_list.length; i++) {
    if (cur_url_list[i].url == link) {
      cur_url_list.splice(i, 1);
      chrome.storage.sync.set({quicklinks:cur_url_list});
      return i;
    }
  }
  return -1;
}

/**
 * Takes a dict of id:listenerFunction and removes all the listeners from the elements
 * in the dict
 *
 * @param  {dict{id:function}} to_remove  dict containing the id of the element as a key
 *                                        and the function to be removed as the value
 * @param  {String} [func_type='click'] type of function to be removed, defaults to 'click'
 * @return {dict}                       returns empty dict
 */
function removeListener(to_remove, func_type = 'click') {
  Object.keys(to_remove).forEach(function(id) {
    if (document.getElementById(id)!=null) {
      document.getElementById(id).removeEventListener("click", to_remove[id]);
    }
  });
  return {};
}

/**
 * Queries chrome sync storage for stored quicklinks and settings. Sets cur_url_list
 * to current quicklinks if the value exists, sets it to an empty array if the value does not exist.
 * Sets settings to current settings if the value exists, sets it to an emmpty array if the value does not exist.
 */
chrome.storage.sync.get(['quicklinks', 'settings'], function(results) {
  cur_url_list = ((results.quicklink == '' || results.quicklinks == undefined) ? [] : results.quicklinks);
  settings = ((results.settings == '' || results.settings == undefined) ? [] : results.settings);
  cur_url_list.forEach(function(item, index) {
    dropdownAppendLink(item.name, item.url, item.favicon, item.favicon_ver);
  });
});

/**
 * Sets an onclick for the document that closes all open menu things
 */
document.onclick = function(event) {
  if(event.target.classList.contains("m-text")){
    return;
  }
  var ignoreIDs = [
    'quicklink_options',
    'quicklink_dropdown',
    'quicklink_change_icon_dropdown',
    'subreddit_dropdown',
    'setting_dropdown'
  ];
  var i;
  for (i = 0; i < ignoreIDs.length; i++){
    if (document.getElementById(ignoreIDs[i]).contains(event.target)){
      return;
    }
  }
  resetStatus();
  if (!document.getElementById('dropdown').contains(event.target) &&
      !event.target.classList.contains("m-text")) {
    hideDropdowns();
  }
};

/**
 * Adds an event listener to the menu icon that opens the menu dropdown and closes everything else
 */
document.getElementById('menu_icon').addEventListener("click", function() {
  hideDropdowns();
  document.getElementById("menu_arrow").classList.toggle("show");
  document.getElementById("menu_dropdown").classList.toggle("show");
});

/**
 * Adds an event listener to the info icon that opens the info dropdown and closes everything else
 */
document.getElementById('info_icon').addEventListener("click", function() {
  hideDropdowns();
  document.getElementById("info_arrow").classList.toggle("show");
  document.getElementById("info_dropdown").classList.toggle("show");
});

/**
 * Adds an event listener to the settings icon that opens the settings dropdown and closes everything else
 */
document.getElementById('setting_icon').addEventListener("click", function() {
  hideDropdowns();
  document.getElementById("setting_arrow").classList.toggle("show");
  document.getElementById("setting_dropdown").classList.toggle("show");
});

/**
 * Adds and event listener to the 'manage quicklinks' button that toggles the extended quicklink dropdown
 */
document.getElementById('quicklink_manage').addEventListener("click", function() {
  document.getElementById("quicklink_options").classList.toggle("show");
});

/**
 * Adds a quicklink to 'add quicklink' button that opens up the add quicklink side-bar
 */
document.getElementById('add_quicklink').addEventListener("click", function() {
  resetStatus();
  setFavi();
  document.getElementById('ql_dropdown_add_title').classList.add("show");
  document.getElementById('add_quicklink').classList.add("selected");
  document.getElementById("quicklink_dropdown").classList.add("show");
  document.getElementById("quicklink_name").focus();
});

/**
 * Adds a quicklink to 'change icon' button that opens up the change icon side-bar
 */
document.getElementById('quicklink_change_icon_button').addEventListener("click", function() {
  if (document.getElementById('quicklink_url').value =='') {
    document.getElementById('quicklink_url').classList.add("invalid");
    document.getElementById('quicklink_url').focus();
    return;
  } else {
    document.getElementById('quicklink_url').classList.remove("invalid");
  }
  fillFavi(document.getElementById('quicklink_url').value);
  document.getElementById("quicklink_change_icon_dropdown").classList.toggle("show");
});

/**
 * Adds listener to the submit button for adding quicklinks. Appends the addition to the DOM
 * and saves it into chrome.storage.sync as a dict with the keys:
 *    name->quicklink name
 *    url->quicklink url
 *    domain->quicklink domain
 *    favicon->quicklink favicon link
 */
document.getElementById('quicklink_submit').addEventListener("click", function() {
  var is_add = (linkToEdit === '' || linkToEdit === undefined || linkToEdit === null);
  var name = document.getElementById('quicklink_name').value;
  var url = document.getElementById('quicklink_url').value;
  if (name == '') {
    document.getElementById('quicklink_name').classList.add("invalid");
    document.getElementById("quicklink_name").focus();
    return;
  } else {
    document.getElementById('quicklink_name').classList.remove("invalid");
  }
  if (url =='') {
    document.getElementById('quicklink_url').classList.add("invalid");
    document.getElementById("quicklink_url").focus();
    return;
  } else {
    document.getElementById('quicklink_url').classList.remove("invalid");
  }
  url = removeHTTP(url);
  var domain = processURL(url);
  url = "http://"+url;
  if (document.getElementById(url)!=undefined && is_add) {
    document.getElementById('quicklink_url').value = "In Use!";
    document.getElementById('quicklink_url').classList.add("invalid");
    document.getElementById("quicklink_url").focus();
    return;
  } else {
    document.getElementById('quicklink_url').classList.remove("invalid");
  }
  var favicon = "icons/nofavi.png";
  var favicon_ver = "favico_fav";
  var favirad= document.getElementsByClassName('fav-border');
  var faviradin= document.getElementsByName('changefavi');
  var i;
  fillFavi(domain);
  for (i = 0, length = favirad.length; i < length; i++) {
    if (faviradin[i].checked) {
      favicon = favirad[i].src;
      favicon_ver = faviradin[i].value;
      break;
    }
  }
  clearQuicklinkInput();
  var quicklink_nameandurl = {
    name: name,
    url: url,
    domain: domain,
    favicon: favicon,
    favicon_ver: favicon_ver
  };
  if (is_add) {
    cur_url_list.push(quicklink_nameandurl);
    dropdownAppendLink(name, url, favicon, favicon_ver);
  } else {
    cur_url_list.splice(removeQuicklink(linkToEdit.id), 0 , quicklink_nameandurl);
    dropdownModifyLink(name, url, favicon, favicon_ver);
    document.getElementById('menu_icon').click();
  }
  chrome.storage.sync.set({quicklinks:cur_url_list});
});

/**
 * Adds an event listener to the edit quicklink button. When clicked, binds an edit
 * quicklink listener to all quicklinks. Stores the function bound to each quicklink to
 * an id->function dict, with the id of the link as the key
 */
document.getElementById('edit_quicklink').addEventListener("click", function(){
  resetStatus();
  document.getElementById('edit_quicklink_title').classList.add("show");
  document.getElementById('edit_quicklink').classList.add("selected");
  var things = document.getElementsByClassName('m-text');
  Array.prototype.forEach.call(things, function(thing) {
    thing.classList.add('to-edit');
    thing.addEventListener("click", onClickFunction = function(e) {
      e.preventDefault();
      setFavi(thing.dataset.favicon_ver);
      fillFavi(thing.id);
      linkToEdit = e.target;
      document.getElementById('quicklink_name').value = thing.dataset.value;
      document.getElementById('quicklink_url').value = thing.id;
      document.getElementById('ql_dropdown_edit_title').classList.add("show");
      document.getElementById("quicklink_dropdown").classList.add("show");
      document.getElementById("quicklink_name").focus();
    });
    onClickFunctionDict[thing.id] = onClickFunction;
  });
});

/**
 * Adds an event listener to the remove quicklink button. When clicked, binds a remove
 * quicklink listener to all quicklinks. Stores the function bound to each quicklink to
 * an id->function dict, with the id of the link as the key
 */
document.getElementById('remove_quicklink').addEventListener("click", function() {
  resetStatus();
  document.getElementById('remove_quicklink_title').classList.add("show");
  document.getElementById('remove_quicklink').classList.add("selected");
  var things = document.getElementsByClassName('m-text');
  Array.prototype.forEach.call(things, function(thing) {
    thing.classList.add('to-remove');
    thing.addEventListener("click", onClickFunction = function(e) {
      e.preventDefault();
      document.getElementById('menu_dropdown_links').removeChild(thing);
      removeQuicklink(thing.id);
    });
    onClickFunctionDict[thing.id] = onClickFunction;
  });
});
