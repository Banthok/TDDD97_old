/**
 * Created by matla782 on 2017-01-24.
 */
displayView = function(){
    // the code required to display a view
    document.getElementById("welcomediv").innerHTML=document.getElementById("welcomeview").innerHTML;
};
window.onload = function(){
    //code that is executed as the page is loaded.
    //You shall put your own custom code here.
    //window.alert() is not allowed to be used in your implementation.
    //window.alert("Shkreli hails you!");
    init();

};
var init = function() {
    displayView();

}

var passwordHelper = function() {
    var pwinput = document.getElementById("pw").value;
    var rptpwinput = document.getElementById("rptpw").value;

}