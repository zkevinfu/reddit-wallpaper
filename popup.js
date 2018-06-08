/* script to enable jquery on websites
var jq = document.createElement('script');
jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";
document.getElementsByTagName('head')[0].appendChild(jq);
*/
function setPermalink(){
  chrome.storage.local.get(['permalink_list'], function(result) {
    var link = "https://reddit.com"+result.permalink_list[0];
    document.getElementById('go_to_post').setAttribute("href", link);
  });
}


document.getElementById('clear_queue').addEventListener("click", function(){
  chrome.storage.local.set({post_info_list: ''});
});

//setPermalink();
