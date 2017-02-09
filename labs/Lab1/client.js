/**
 *
 */
var displayView = function(){
    var localtokenobject;
    var tokenresponse;

    if (localStorage.getItem("localtoken") === null) {
        // No token in localStorage
        displayWelcomeView();
    }
    else{
        localtokenobject = JSON.parse(localStorage.getItem("localtoken"));
        tokenresponse = serverstub.getUserDataByToken(localtokenobject.token);

        if (tokenresponse.success){
            // Token is valid
            displayProfileView();
        }
        else{
            // Token is invalid
            displayWelcomeView();
        }
    }

};
var displayWelcomeView = function(){
    document.getElementById("viewdiv").innerHTML=document.getElementById("welcomeview").innerHTML;

}
var displayProfileView = function(){
    document.getElementById("viewdiv").innerHTML=document.getElementById("profileview").innerHTML;

};
window.onload = function(){
    //code that is executed as the page is loaded.
    //You shall put your own custom code here.
    //window.alert() is not allowed to be used in your implementation.
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

        loginform.setAttribute("onsubmit", "loginformSubmit();return false" );
    }

    if( signupbox != null ){
        /* attach signupPasswordHelper */
        var pwinputelement = document.getElementById("passwordinput");
        var rptpwinputelement = document.getElementById("repeatpasswordinput");

        pwinputelement.addEventListener("input", signupPasswordHelper);
        rptpwinputelement.addEventListener("input", signupPasswordHelper);

       /*  attach signupformSubmit */
        var signupform = document.getElementById("signupform");

        signupform.setAttribute("onsubmit","signupformSubmit(); return false");
    }
};
var signupPasswordHelper = function() {
    var password = document.getElementById("passwordinput").value;
    var repeatpassword = document.getElementById("repeatpasswordinput").value;
    var SUETBelement = document.getElementById("signuperrortextbox");

    if( password === "" ){
        /* clear text in error text box */
        SUETBelement.innerHTML="";
    }
    else if( password.length < 4 ){
        SUETBelement.style.color="red";
        SUETBelement.innerHTML="Password too short";
    }
    else if( password === repeatpassword ){
        SUETBelement.style.color="green";

        if( password === "password"){
            SUETBelement.innerHTML="I deserve this";
        }
        else{
            SUETBelement.innerHTML="Password OK";
            return true;
        }
    }
    else{
        SUETBelement.style.color = "red";
        SUETBelement.innerHTML = "Passwords do not match";
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
        displayProfileView();
    }
    else{
        document.getElementById("loginerrortextbox").innerHTML = loginstatus.message;
    }

};
var signupformSubmit = function() {
    if( ! signupPasswordHelper() ){
        return;
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

};