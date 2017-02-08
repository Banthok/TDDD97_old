/**
 * Created by matla782 on 2017-01-24.
 */
displayView = function(){
    // the code required to display a view
    document.getElementById("welcomediv").innerHTML=document.getElementById("welcomeview").innerHTML;
};
window.onload = function(){
    alert("page refreshed");
    //code that is executed as the page is loaded.
    //You shall put your own custom code here.
    //window.alert() is not allowed to be used in your implementation.
    //window.alert("Shkreli hails you!");
    init();

};
var init = function() {
    displayView();
    attachHandlers();

};
var attachHandlers = function() {
    var signupbox = document.getElementById("signupbox");
    var loginbox = document.getElementById("loginbox");

    if( loginbox != null ){
        /* attach loginformSubmit */
        var loginform = document.getElementById("loginform");

        loginform.addEventListener("submit", loginformSubmit);
    }

    if( signupbox != null ){
        /* attach passwordHelper */
        var pwinputelement = document.getElementById("passwordinput");
        var rptpwinputelement = document.getElementById("repeatpasswordinput");

        pwinputelement.addEventListener("input", passwordHelper);
        rptpwinputelement.addEventListener("input", passwordHelper);

       /*  attach signupformSubmit */
        var signupform = document.getElementById("signupform");

        signupform.addEventListener("submit", signupformSubmit);
    }
};
var passwordHelper = function() {
    var password = document.getElementById("passwordinput").value;
    var repeatpassword = document.getElementById("repeatpasswordinput").value;
    var etbelement = document.getElementsByClassName("errortextbox");

    if( password === "" ){
        /* clear text in error text box */
        etbelement[0].innerHTML="";
    }
    else if( password.length < 4 ){
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
            return true;
        }
    }
    else{
        /* mismatch text and style in error text box */
        etbelement[0].id="etbnotok";
        etbelement[0].innerHTML="Passwords do not match";
    }
    return false;

};
var loginformSubmit = function() {
    var loginemail = document.getElementById("loginemailinput").value;
    var loginpassword = document.getElementById("loginpasswordinput").value;

    var loginstatus = serverstub.signIn(loginemail, loginpassword);

    if( loginstatus.success ){
        var localtoken = {"token": loginstatus.data};
        localStorage.setItem("localtoken", JSON.stringify(localtoken));
        // add: change view to profile view
    }
    // add: display error message in loginbox until loginbox interact
};
var signupformSubmit = function() {
    if( ! passwordHelper() ){
        return false; /*  ?? */
    }

    var newSignee = {"email":       document.getElementById("emailinput").value,
                    "firstname":    document.getElementById("firstnameinput").value,
                    "familyname":   document.getElementById("familynameinput").value,
                    "gender":       document.getElementById("genderinput").value,
                    "city":         document.getElementById("cityinput").value,
                    "country":      document.getElementById("countryinput").value,
                    "password":     document.getElementById("passwordinput").value
    };
    alert("about to sign up on server");
    serverstub.signUp(newSignee);
    return false; /*  ?? */
};