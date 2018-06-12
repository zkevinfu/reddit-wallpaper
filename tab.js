/*jshint esversion: 6 */
var url_with_favi_issues = {
  gmailcom:"mail.google.com"
};
var cur_url_list = [];
var settings = [];
chrome.storage.sync.get(['quicklinks', 'settings'], function(results){
  cur_url_list = ((results.quicklink == '' || results.quicklinks == undefined) ? [] : results.quicklinks);
  settings = ((results.settings == '' || results.settings == undefined) ? [] : results.settings);
  cur_url_list.forEach(function(item, index){
    dropdownAppendLink(item.name, item.url, item.favicon);
  });
});

function hideDropdowns() {
  removeClass("dropdown-box");
  removeClass('quicklink-options');
}
function removeListener(to_remove, class_name = 'm-text'){
  var elements = document.getElementsByClassName(class_name);
  for (i = 0; i < elements.length; i++) {
    elements[i].removeEventListener("click", to_remove[elements[i].id]);
  }
}
function resetStatus() {
  document.getElementById('quicklink_dropdown').classList.remove('show');
  document.getElementById('add_quicklink_change_icon_dropdown').classList.remove('show');
  document.getElementById('quicklink_name').classList.remove("invalid");
  document.getElementById('quicklink_url').classList.remove("invalid");
  clearQuicklinkInput();
  removeClass('variable-m-title');
  removeClass('m-text', 'to-remove');
  removeClass('selected', 'selected');
  removeListener(removeOnClickDict);
  removeOnClickDict = {};
}
function removeClass(class_name, to_remove = 'show') {
  var elements = document.getElementsByClassName(class_name);
  var i;
  for (i = 0; i < elements.length; i++) {
    if (elements[i].classList.contains(to_remove)) {
      elements[i].classList.remove(to_remove);
    }
  }
}
document.onclick = function(event) {
  if(!document.getElementById('quicklink_options').contains(event.target) &&
  !document.getElementById('quicklink_dropdown').contains(event.target) &&
  !document.getElementById('add_quicklink_change_icon_dropdown').contains(event.target) &&
  !event.target.classList.contains("m-text")
){
  resetStatus();
}
if (!document.getElementById('dropdown').contains(event.target) && !event.target.classList.contains("m-text")) {
  hideDropdowns();
}
};
document.getElementById('menu_icon').addEventListener("click", function(){
  hideDropdowns();
  document.getElementById("menu_arrow").classList.toggle("show");
  document.getElementById("menu_dropdown").classList.toggle("show");
});
document.getElementById('info_icon').addEventListener("click", function(){
  hideDropdowns();
  document.getElementById("info_arrow").classList.toggle("show");
  document.getElementById("info_dropdown").classList.toggle("show");
});
document.getElementById('setting_icon').addEventListener("click", function(){
  hideDropdowns();
  document.getElementById("setting_arrow").classList.toggle("show");
  document.getElementById("setting_dropdown").classList.toggle("show");
});
document.getElementById('manage_quicklink').addEventListener("click", function(){
  document.getElementById("quicklink_options").classList.toggle("show");
});
document.getElementById('add_quicklink').addEventListener("click", function(){
  resetStatus();
  document.getElementById('add_quicklink').classList.add("selected");
  document.getElementById("quicklink_dropdown").classList.add("show");
  document.getElementById("quicklink_name").focus();
});
var removeOnClickDict = {};
var removeOnClick;
document.getElementById('remove_quicklink').addEventListener("click", function(){
  resetStatus();
  document.getElementById('remove_quicklink_title').classList.add("show");
  document.getElementById('remove_quicklink').classList.add("selected");
  var things = document.getElementsByClassName('m-text');
  Array.prototype.forEach.call(things, function(thing) {
    thing.classList.add('to-remove');
    thing.addEventListener("click", removeOnClick = function(e){
      e.preventDefault();
      document.getElementById('menu_dropdown_links').removeChild(thing);
      removeQuicklink(thing.id);
    });
    removeOnClickDict[thing.id] = removeOnClick;
  });
});
document.getElementById('add_quicklink_change_icon_button').addEventListener("click", function(){
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
document.getElementById('add_quicklink_submit').addEventListener("click", function(){
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
  if (document.getElementById(url)!=undefined){
    document.getElementById('quicklink_url').value = "In Use!";
    document.getElementById('quicklink_url').classList.add("invalid");
    document.getElementById("quicklink_url").focus();
    return;
  } else {
    document.getElementById('quicklink_url').classList.remove("invalid");
  }
  var favicon = "/nofavi.png";
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
function clearQuicklinkInput(){
  document.getElementById('quicklink_name').value = '';
  document.getElementById('quicklink_url').value = '';
}
function processURL(url) {
  var reg = /^.+?(?=\/)/;
  var domain = (url.replace('https://','').replace('http://', '')+'/').match(reg);
  domain = (domain==null)?'':domain[0];
  if (url_with_favi_issues[domain.replace('.','')]!==undefined){
    return url_with_favi_issues[domain.replace('.','')];
  } else {
    return domain;
  }
}
function fillFaviImg(id, src) {
  document.getElementById(id).addEventListener("error", function(){
    document.getElementById(id).setAttribute("src", "/nofavi.png");
  });
  document.getElementById(id).setAttribute("src", src);
}
function fillFavi(url, current) {
  var domain = processURL(url);
  fillFaviImg("favico_fav", "http://"+domain+"/favicon.ico");
  fillFaviImg("google_fav", "https://www.google.com/s2/favicons?domain="+domain);
  fillFaviImg("duck_fav", "https://icons.duckduckgo.com/ip2/"+domain+".ico");
  fillFaviImg("nofavi_fav", "/nofavi.png");
}
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
//dropdownAppendLink();
//<img height="16" width="16" src='http://www.google.com/s2/favicons?domain=www.edocuments.co.uk' />
//https://icons.duckduckgo.com/ip2/reddit.com.ico
