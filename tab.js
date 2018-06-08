function hideDropdowns() {
  var dropdowns = document.getElementsByClassName("dropdown-box");
  for (var i = 0; i < dropdowns.length; i++) {
    var openDropdown = dropdowns[i];
    if (openDropdown.classList.contains('show')) {
      openDropdown.classList.remove('show');
    }
  }
}

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

// document.getElementById('add_quicklink').addEventListener("click", function(){
//   alert("don't work yet");
// });

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

// Get the modal
var modal = document.getElementById('modal_quicklink');

// Get the button that opens the modal
var btn = document.getElementById("add_quicklink");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (!event.target.matches('.m-icon')) {
    hideDropdowns();
  }
  if (event.target == modal) {
      modal.style.display = "none";
  }
};
//dropdownAppendLink();
//<img height="16" width="16" src='http://www.google.com/s2/favicons?domain=www.edocuments.co.uk' />
//https://icons.duckduckgo.com/ip2/reddit.com.ico
