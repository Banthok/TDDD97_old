/**
 * endSession and continueSession functions?
 * Consider formmethod="get" and "post"
 * separate refresh buttons browse/home?
 */
var displayView = function(){
    var localtokenJSON = localStorage.getItem("localtoken");
    var localtokenobject;
    var localdataobject;
    var tokenresponse;

    if (localtokenJSON === null) {
        // No token in localStorage
        displayWelcomeView();
    }
    else{
        localtokenobject = JSON.parse(localtokenJSON);
        tokenresponse = serverstub.getUserDataByToken(localtokenobject.token);

        if (tokenresponse.success){
            // Token is valid, store and use local data
            localdataobject = tokenresponse.data;
            localStorage.setItem("localdata", JSON.stringify(localdataobject));
            displayProfileView(localdataobject);
        }
        else{
            // Token is invalid, clear local data
            localStorage.removeItem("localtoken");
            localStorage.removeItem("localdata");
            displayWelcomeView();
        }
    }

};
var displayWelcomeView = function(){
    document.getElementById("viewdiv").innerHTML=document.getElementById("welcomeview").innerHTML;
    attachHandlers();

};
var displayProfileView = function(dataobject){
    document.getElementById("viewdiv").innerHTML=document.getElementById("profileview").innerHTML;

    var firstnameholders = document.getElementsByClassName("userfirstname");
    for( i = 0 ; i < firstnameholders.length ; ++i ){
        firstnameholders[i].innerHTML=dataobject.firstname;
    }
    var familynameholders = document.getElementsByClassName("userfamilyname");
    for( i = 0 ; i < familynameholders.length ; ++i ){
        familynameholders[i].innerHTML=dataobject.familyname;
    }
    var genderholders = document.getElementsByClassName("usergender");
    for( i = 0 ; i < genderholders.length ; ++i ){
        genderholders[i].innerHTML=dataobject.gender;
    }
    var emailholders = document.getElementsByClassName("useremail");
    for( i = 0 ; i < emailholders.length ; ++i ){
        emailholders[i].innerHTML=dataobject.email;
    }
    var cityholders = document.getElementsByClassName("usercity");
    for( i = 0 ; i < cityholders.length ; ++i ){
        cityholders[i].innerHTML=dataobject.city;
    }
    var countryholders = document.getElementsByClassName("usercountry");
    for( i = 0 ; i < countryholders.length ; ++i ){
        countryholders[i].innerHTML=dataobject.country;
    }

    updateClientWall();

    attachHandlers();

};
window.onload = function(){
    //code that is executed as the page is loaded.
    //You shall put your own custom code here.
    //window.alert() is not allowed to be used in your implementation.
    init();
    alert("page reloaded");

};
var init = function() {
    displayView();

};
var attachHandlers = function() {
    var signupbox = document.getElementById("signupbox");
    var loginbox = document.getElementById("loginbox");
    var tabselectors = document.getElementsByClassName("tabselector");
    var changepasswordform = document.getElementById("changepasswordform");
    var signoutbutton = document.getElementById("signoutbutton");
    var selfpostbutton = document.getElementById("selfpostbutton");
    var clientwallrefreshbutton = document.getElementById("clientwallrefresh");
    var fetchuserbutton = document.getElementById("browseuserbutton");

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

    if( tabselectors != null ){
        /* attach tab selector functions */
        for( i = 0 ; i < tabselectors.length ; ++i ){
            tabselectors[i].addEventListener("click", switchTabByTabSelector);
            tabselectors[i].addEventListener("mouseover", tabselectorHighlight);
            tabselectors[i].addEventListener("mouseleave", tabselectorNormalize);
        }

    }

    if( changepasswordform != null ){
        /* attach changepasswordformSubmit */
        changepasswordform.setAttribute("onsubmit","changepasswordformSubmit(); return false");
    }

    if( signoutbutton != null ){
        /* attach logOutClick */
        signoutbutton.addEventListener("click", logOutClick);
    }

    if( selfpostbutton != null ){
        /* attach selfPostClick */
        selfpostbutton.addEventListener("click", selfPostClick);
    }

    if( clientwallrefreshbutton != null ){
        /* attach updateClientWall */
        clientwallrefreshbutton.addEventListener("click", updateClientWall);
    }

    if( fetchuserbutton != null ){
        /* attach browseUserClick */
        fetchuserbutton.addEventListener("click",browseUserClick);
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
    var localtokenobject;
    var localdataobject;
    var tokenresponse;

    var loginstatus = serverstub.signIn(loginemail, loginpassword);


    if( loginstatus.success ){
        localtokenobject = {"token": loginstatus.data};
        localStorage.setItem("localtoken", JSON.stringify(localtokenobject));

        tokenresponse = serverstub.getUserDataByToken(localtokenobject.token);
        if( tokenresponse.success ) {
            localdataobject = tokenresponse.data;
            localStorage.setItem("localdata", JSON.stringify(localdataobject));
            displayProfileView(localdataobject);
        }
        else{
            alert("! This token is so 2016 !. Server message: " + tokenresponse.message);
        }
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
var switchTabByTabSelector = function() {
    var tabs = document.getElementsByClassName("tab");

    for( i = 0 ; i < tabs.length ; ++i ) {
        tabs[i].style.display = "none";
    }
    /* this.id == "<tabwewant>selector" */
    document.getElementById( this.id.substring( 0, this.id.search( "selector" ))).style.display = "block";
    /* note the very polly nature of updateClientWall - to be changed? */
    updateClientWall();

};
var tabselectorHighlight = function() {
    document.getElementById(this.id).style.backgroundColor = "#f0e1e6";

};
var tabselectorNormalize = function(){
    document.getElementById(this.id).style.backgroundColor = "#fff0f5";

};
var changepasswordformSubmit = function() {
    var localtokenJSON = localStorage.getItem("localtoken");
    var localtokenobject;
    var CPWETBelement = document.getElementById("changepassworderrortextbox");
    var changepasswordresponse;

    if( localtokenJSON === null ){
        // No token in local storage
        alert("How?");
    }
    else {
        localtokenobject = JSON.parse(localtokenJSON);
        changepasswordresponse = serverstub.changePassword(
            localtokenobject.token,
            document.getElementById("oldpasswordinput").value,
            document.getElementById("newpasswordinput").value
        );

        CPWETBelement.innerHTML = changepasswordresponse.message;
        if( changepasswordresponse.success ){
            CPWETBelement.style.color = "green";
        }
        else{
            CPWETBelement.style.color = "red";
        }
    }

};
var logOutClick = function() {
    var localtokenJSON = localStorage.getItem("localtoken");
    var localtokenobject;
    var signoutresponse;

    if( localtokenJSON === null ){
        // No token in local storage
        alert("How?");
    }
    else{
        localtokenobject = JSON.parse(localtokenJSON);
        signoutresponse = serverstub.signOut(localtokenobject.token);

        if( signoutresponse.success ){
            localStorage.removeItem("localtoken");
            localStorage.removeItem("localdata");
            displayWelcomeView();
        }
        else{
            alert(signoutresponse.message);
        }
    }

};
var selfPostClick = function() {
    var localtokenJSON = localStorage.getItem("localtoken");
    var content = document.getElementById("homeposttextarea").value;
    var localdataJSON = localStorage.getItem("localdata");

    if( localtokenJSON != null
        && content != null
        && localdataJSON != null
        && content != ""){
        clientPostMessage(JSON.parse(localtokenJSON).token, content, JSON.parse(localdataJSON).email);
        document.getElementById("homeposttextarea").value = "";
    }

};
var clientPostMessage = function(token, content, toEmail) {
    serverstub.postMessage(token, content, toEmail);
    updateClientWall();

};
var updateClientWall = function() {
    /* updateClientWall to eventually be a callback function? */
    var localtokenJSON = localStorage.getItem("localtoken");
    var clientmessages = serverstub.getUserMessagesByToken(JSON.parse(localtokenJSON).token);
    var clientmessagesHTML = "";
    var clientwallelement = document.getElementById("clientwall");

    if( clientmessages.success
        && clientwallelement != null ){
        for( i = 0; i < clientmessages.data.length; ++i ){
            clientmessagesHTML = clientmessagesHTML + "<p>" + clientmessages.data[i].writer + " wrote:</p>"
            + "<p>" + clientmessages.data[i].content + "</p><hr />";
        }
        clientwallelement.innerHTML = clientmessagesHTML;
    }
    else{
        /* endSession */
    }

};

var browseUserClick = function () {
    var localtokenJSON = localStorage.getItem("localtoken");
    var email = document.getElementById("browseuserinput").value;
    var browseuserdata = serverstub.getUserDataByEmail(JSON.parse(localtokenJSON).token, email);
    var browseusermessages = serverstub.getUserMessagesByEmail(JSON.parse(localtokenJSON).token, email);

    /* alert("data" + browseuserdata.message);
    alert("msgs" + browseusermessages.message); */

    if( browseuserdata.success
        && browseusermessages.success ){
        /* fill in the template and make it visible */
        document.getElementById("userpagetemplate").style.display = "block";

        document.getElementById("browsefirstname").innerHTML = browseuserdata.data.firstname;
        document.getElementById("browsefamilyname").innerHTML = browseuserdata.data.familyname;
        document.getElementById("browseemail").innerHTML = browseuserdata.data.email;
        document.getElementById("browsegender").innerHTML = browseuserdata.data.gender;
        document.getElementById("browsecity").innerHTML = browseuserdata.data.city;
        document.getElementById("browsecountry").innerHTML = browseuserdata.data.country;

        writeToWall(somearg);
    }

}