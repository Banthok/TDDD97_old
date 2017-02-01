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

};
var passwordHelper = function() {
    var password = document.getElementById("passwordinput").value;
    var repeatpassword = document.getElementById("repeatpasswordinput").value;
    var etbelement = document.getElementsByClassName("errortextbox");


    if( password === "" ){
        /* clear text in error text box */
        etbelement[0].innerHTML="";
    }
    else if( password.length < 8 ){
        etbelement[0].id="etbnotok";
        etbelement[0].innerHTML="Password too short";

    }
    else if( password === repeatpassword ){
        /* match text and style in error text box */
        etbelement[0].id="etbok";

        if( password === "password"){
            etbelement[0].innerHTML="I deserve this";
        }
        else{
            etbelement[0].innerHTML="Password OK";
        }
    }
    else{
        /* mismatch text and style in error text box */
        etbelement[0].id="etbnotok";
        etbelement[0].innerHTML="Passwords do not match";
    }

};
