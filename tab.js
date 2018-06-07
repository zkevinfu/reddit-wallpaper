function hideDropdowns() {
  var dropdowns = document.getElementsByClassName("dropdown-content");
  for (var i = 0; i < dropdowns.length; i++) {
    var openDropdown = dropdowns[i];
    if (openDropdown.classList.contains('show')) {
      openDropdown.classList.remove('show');
    }
  }
}

document.getElementById('menu_icon').addEventListener("click", function(){
  hideDropdowns();
  document.getElementById("menu_dropdown").classList.toggle("show");
});

document.getElementById('info_icon').addEventListener("click", function(){
  hideDropdowns();
  document.getElementById("info_dropdown").classList.toggle("show");
});

window.onclick = function(event) {
  if (!event.target.matches('.m-icon')) {
    hideDropdowns();
  }
};

function dropdownAppendLink() {
  var link = "https://google.com";
  var link_name = "google";

  var node = document.createElement("a");
  var imgnode = document.createElement("img");
  imgnode.setAttribute("src", "http://www.google.com/s2/favicons?domain=reddit.com");
  var textnode = document.createTextNode(link_name);
  node.setAttribute('href', link);
  node.appendChild(imgnode);
  node.appendChild(textnode);
  document.getElementById("menu_dropdown").appendChild(node);
}

dropdownAppendLink();
//<img height="16" width="16" src='http://www.google.com/s2/favicons?domain=www.edocuments.co.uk' />
//https://icons.duckduckgo.com/ip2/reddit.com.ico
