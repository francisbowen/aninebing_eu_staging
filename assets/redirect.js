var ref=getCookie("referredus");
if(checkParemeterExists("ref") != true && ref == "" ){
  setCookie("referredus", "eu", 6);
  document.write("<script src='//geotargetly-1a441.appspot.com/georedirect?id=-LJUlGyX00cj8v99YTyv'></");
  document.write("script>");
}
if(checkParemeterExists("ref") == true && ref == "" ){ setCookie("referredus", "eu", 6); }

function setCookie(cname,cvalue,exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}
function checkParemeterExists(parameter) {
 fullQString = window.location.search.substring(1);
 paramCount = 0;
 queryStringComplete = "?";
 if(fullQString.length > 0) {
  paramArray = fullQString.split("&");  
     for (i=0;i<paramArray.length;i++) {
       currentParameter = paramArray[i].split("=");
       if(currentParameter[0] == parameter) { return true; } }
 }
 return false;
}