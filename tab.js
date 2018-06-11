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
  hideClass("dropdown-box");
  hideClass("dropdown-ext");
}
function hideClass(class_name) {
  var dropdowns = document.getElementsByClassName(class_name);
  for (var i = 0; i < dropdowns.length; i++) {
    var openDropdown = dropdowns[i];
    if (openDropdown.classList.contains('show')) {
      openDropdown.classList.remove('show');
    }
  }
}
document.onclick = function(event) {
  if (!document.getElementById('dropdown').contains(event.target)) {
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
  document.getElementById("quicklink_dropdown").classList.toggle("show");
  document.getElementById("quicklink_name").focus();
});
document.getElementById('add_quicklink_change_icon_button').addEventListener("click", function(){
  var urlbar = document.getElementById('quicklink_url');
  if (urlbar.value =='') {
    urlbar.classList.add("invalid");
    urlbar.focus();
    return;
  } else {
    urlbar.classList.remove("invalid");
  }
  fillFavi(urlbar.value);
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
  var favicon = "/nofavi.png";
  var favirad= document.getElementsByName('changefavi');
  for (var i = 0, length = favirad.length; i < length; i++) {
    if (favirad[i].checked) {
      favicon = document.getElementById(favirad[i].value).src;
      break;
    }
  }
  url = "http://"+url;
  var quicklink_nameandurl = {
    name: name,
    url: url,
    domain: domain,
    favicon: favicon
  };
  cur_url_list.push(quicklink_nameandurl);
  chrome.storage.sync.set({quicklinks:cur_url_list});
  document.getElementById('quicklink_name').value = '';
  document.getElementById('quicklink_url').value = '';
  dropdownAppendLink(name, url, favicon);
});
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
  imgnode.setAttribute("class", "m-favicon");
  imgnode.setAttribute("src", link_favicon);
  var textnode = document.createTextNode(link_name);
  node.setAttribute('href', link);
  node.setAttribute('class', 'm-text');
  node.appendChild(imgnode);
  node.appendChild(textnode);
  document.getElementById("menu_dropdown_links").appendChild(node);
}
//dropdownAppendLink();
//<img height="16" width="16" src='http://www.google.com/s2/favicons?domain=www.edocuments.co.uk' />
//https://icons.duckduckgo.com/ip2/reddit.com.ico
