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
 * Dict containg a mapping from id to removeOnClick listeners
 *
 * @type {Object}
 */
var removeOnClickDict = {};

/**
 * Temp variable for storing removeOnClick functions before pushing them to
 * removeOnClickDict dictionary
 *
 * @type {function}
 */
var removeOnClick;

/**
 * Hides all menu dropdowns in 'dropdown-box', and minimizes quicklink options with 'quicklink-options'
 */
function hideDropdowns() {
  removeClass("dropdown-box");
  removeClass('quicklink-options');
}

/**
 * Resets the state of the document to that when first opened
 */
function resetStatus() {
  document.getElementById('quicklink_dropdown').classList.remove('show');
  document.getElementById('add_quicklink_change_icon_dropdown').classList.remove('show');
  document.getElementById('quicklink_name').classList.remove("invalid");
  document.getElementById('quicklink_url').classList.remove("invalid");
  clearQuicklinkInput();
  removeClass('variable-m-title');
  removeClass('m-text', 'to-remove');
  removeClass('selected', 'selected');
  removeOnClickDict = removeListener(removeOnClickDict);
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
 * Pulls the domain from a given url. Replaces the domain if it exists as a key in
 * 'url_with_favi_issues' with the respective value
 *
 * @param  {string} url url as a string i.e https://exa.mple.example.com/exam/ple.html
 * @return {string}     the domain name of the given url i.e exa.mple.example.com,
 */
function processURL(url) {
  var reg = /^.+?(?=\/)/;
  var domain = (url.replace('https://','').replace('http://', '')+'/').match(reg);
  domain = (domain==null)?'':domain[0];
  if (url_with_favi_issues[domain.replace('.','')]!==undefined) {
    return url_with_favi_issues[domain.replace('.','')];
  } else {
    return domain;
  }
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
 * @param  {string} current favicon to be highlighted !!NOT CURRENTLY USED!!
 * @return {void}
 */
function fillFavi(url, current) {
  var domain = processURL(url);
  fillFaviImg("favico_fav", "http://"+domain+"/favicon.ico");
  fillFaviImg("google_fav", "https://www.google.com/s2/favicons?domain="+domain);
  fillFaviImg("duck_fav", "https://icons.duckduckgo.com/ip2/"+domain+".ico");
  fillFaviImg("nofavi_fav", "icons/nofavi.png");
}

/**
 * Appends a quicklink to the quicklink dropdown menu_icon
 *
 * @param  {string} link_name    string containing the name of the quicklink
 * @param  {string} link         string containing the url of the quicklink
 * @param  {string} link_favicon string containing the url to the favicon of the quicklink
 * @return {void}
 */
function dropdownAppendLink(link_name, link, link_favicon) {
  var node = document.createElement("a");
  var imgnode = document.createElement("img");
  var textnode = document.createTextNode(link_name);
  imgnode.setAttribute("class", "m-favicon");
  imgnode.setAttribute("src", link_favicon);
  node.setAttribute('id', link);
  node.setAttribute('href', link);
  node.setAttribute('class', 'm-text');
  node.appendChild(imgnode);
  node.appendChild(textnode);
  document.getElementById("menu_dropdown_links").appendChild(node);
}

/**
 * removes a quicklink from the DOM
 *
 * @param  {string} link string containing the url of the link to be removed
 * @return {void}
 */
function removeQuicklink(link) {
  var i;
  for (i = 0; i < cur_url_list.length; i++) {
    if (cur_url_list[i].url == link) {
      cur_url_list.splice(i, 1);
      chrome.storage.sync.set({quicklinks:cur_url_list});
      break;
    }
  }
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
    dropdownAppendLink(item.name, item.url, item.favicon);
  });
});

/**
 * Sets an onclick for the document that closes all open menu things
 */
document.onclick = function(event) {
  if (!document.getElementById('quicklink_options').contains(event.target) &&
      !document.getElementById('quicklink_dropdown').contains(event.target) &&
      !document.getElementById('add_quicklink_change_icon_dropdown').contains(event.target) &&
      !event.target.classList.contains("m-text")) {
    resetStatus();
  }
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
document.getElementById('manage_quicklink').addEventListener("click", function() {
  document.getElementById("quicklink_options").classList.toggle("show");
});

/**
 * Adds a quicklink to 'add quicklink' button that opens up the add quicklink side-bar
 */
document.getElementById('add_quicklink').addEventListener("click", function() {
  resetStatus();
  document.getElementById('add_quicklink').classList.add("selected");
  document.getElementById("quicklink_dropdown").classList.add("show");
  document.getElementById("quicklink_name").focus();
});

/**
 * Adds a quicklink to 'change icon' button that opens up the change icon side-bar
 */
document.getElementById('add_quicklink_change_icon_button').addEventListener("click", function() {
  if (document.getElementById('quicklink_url').value =='') {
    document.getElementById('quicklink_url').classList.add("invalid");
    document.getElementById('quicklink_url').focus();
    return;
  } else {
    document.getElementById('quicklink_url').classList.remove("invalid");
  }
  fillFavi(document.getElementById('quicklink_url').value);
  document.getElementById("add_quicklink_change_icon_dropdown").classList.toggle("show");
});

/**
 * Adds listener to the submit button for adding quicklinks. Appends the addition to the DOM
 * and saves it into chrome.storage.sync as a dict with the keys:
 *    name->quicklink name
 *    url->quicklink url
 *    domain->quicklink domain
 *    favicon->quicklink favicon link
 */
document.getElementById('add_quicklink_submit').addEventListener("click", function() {
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
  var reg = /^.+?(?=\/)/;
  var domain = processURL(url);
  url = "http://"+url;
  if (document.getElementById(url)!=undefined) {
    document.getElementById('quicklink_url').value = "In Use!";
    document.getElementById('quicklink_url').classList.add("invalid");
    document.getElementById("quicklink_url").focus();
    return;
  } else {
    document.getElementById('quicklink_url').classList.remove("invalid");
  }
  var favicon = "icons/nofavi.png";
  var favirad= document.getElementsByName('changefavi');
  var i;
  for (i = 0, length = favirad.length; i < length; i++) {
    if (favirad[i].checked) {
      favicon = document.getElementById(favirad[i].value).src;
      break;
    }
  }
  var quicklink_nameandurl = {
    name: name,
    url: url,
    domain: domain,
    favicon: favicon
  };
  cur_url_list.push(quicklink_nameandurl);
  chrome.storage.sync.set({quicklinks:cur_url_list});
  clearQuicklinkInput();
  dropdownAppendLink(name, url, favicon);
});

/**
 * Adds an event listener to the remove quicklink button. When clicked, binds a remove
 * quicklink listener to all quicklinks. Stores the function bound to each quicklink to
 * the 'removeOnClickDict' dict, with the id of the link as the key
 */
document.getElementById('remove_quicklink').addEventListener("click", function() {
  resetStatus();
  document.getElementById('remove_quicklink_title').classList.add("show");
  document.getElementById('remove_quicklink').classList.add("selected");
  var things = document.getElementsByClassName('m-text');
  Array.prototype.forEach.call(things, function(thing) {
    thing.classList.add('to-remove');
    thing.addEventListener("click", removeOnClick = function(e) {
      e.preventDefault();
      document.getElementById('menu_dropdown_links').removeChild(thing);
      removeQuicklink(thing.id);
    });
    removeOnClickDict[thing.id] = removeOnClick;
  });
});
