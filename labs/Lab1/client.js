/**
 * endSession and continueSession functions?
 * Consider formmethod="get" and "post"
 * make localdata global script variable as well instead of localStorage?
 * addEventListeners -> setAttributes
 * change password should utilize the repeatbox
 */
var browsecontext = {
    "email": undefined,
    "firstname": undefined,
    "familyname": undefined,
    "gender": undefined,
    "city": undefined,
    "country": undefined
};
/* get away with with no value? no! browsecontext === undefined, while browsecontext.email -> exception */

var displayView = function(){
    var localtokenJSON = localStorage.getItem("localtoken");
    var localtokenobject;
    var localdataobject;
    var tokenresponse;

    if( localtokenJSON === null ){
        // No token in localStorage
        displayWelcomeView();
    }
    else{
        localtokenobject = JSON.parse(localtokenJSON);
        tokenresponse = serverstub.getUserDataByToken(localtokenobject.token);

        if( tokenresponse.success ){
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

    updateWall();

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
    var selfwallrefreshbutton = document.getElementById("selfwallrefresh");
    var browsepostbutton = document.getElementById("browsepostbutton");
    var browsewallrefreshbutton = document.getElementById("browsewallrefresh");
    var fetchuserbutton = document.getElementById("browseuserbutton");

    if( loginbox != null ){
        /* attach loginformSubmit */
        var loginform = document.getElementById("loginform");

        loginform.setAttribute("onsubmit", "loginformSubmit(); return false");
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

    if( selfwallrefreshbutton != null ){
        /* attach (self) updateWall */
        selfwallrefreshbutton.setAttribute("onclick", "updateWall()");
    }

    if( browsepostbutton != null ){
        /* attach browsePostClick */
        browsepostbutton.addEventListener("click", browsePostClick);
    }

    if( browsewallrefreshbutton != null ){
        /* attach (self) updateWall */
        browsewallrefreshbutton.setAttribute("onclick", "updateWall(browsecontext.email)");
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
    /* note the very polly nature of updateWall - to be changed? */
    updateWall();

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
    else{
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
        && content != "" ){
        clientPostMessage(JSON.parse(localtokenJSON).token, content, JSON.parse(localdataJSON).email, true);
        document.getElementById("homeposttextarea").value = "";
    }

};
var browsePostClick = function() {
    var localtokenJSON = localStorage.getItem("localtoken");
    var content = document.getElementById("browseposttextarea").value;
    var email = browsecontext.email;

    if( localtokenJSON != null
        && content != null
        && email != undefined
        && content != "" ){
        clientPostMessage(JSON.parse(localtokenJSON).token, content, email, false);
        document.getElementById("browseposttextarea").value = "";
    }

};
var clientPostMessage = function(token, content, toEmail, self) {
    serverstub.postMessage(token, content, toEmail);

    if( self ){
        updateWall();
    }
    else{
        updateWall(toEmail);
    }

};
var browseUserClick = function () {
    var localtokenJSON = localStorage.getItem("localtoken");
    var email = document.getElementById("browseuserinput").value;
    var browseuserdata = serverstub.getUserDataByEmail(JSON.parse(localtokenJSON).token, email);
    var browseusermessages = serverstub.getUserMessagesByEmail(JSON.parse(localtokenJSON).token, email);

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

        /* fill browsecontext fam */
        browsecontext.firstname = browseuserdata.data.firstname;
        browsecontext.familyname = browseuserdata.data.familyname;
        browsecontext.email = browseuserdata.data.email;
        browsecontext.gender = browseuserdata.data.gender;
        browsecontext.city = browseuserdata.data.city;
        browsecontext.country = browseuserdata.data.country;

        updateWall(email);
    }

};
var updateWall = function(email) {
    /* updateWall to eventually be a callback function? */
    var messages;
    var messagesHTML = "";
    var wallelement;
    var localtokenJSON = localStorage.getItem("localtoken");

    /* acquire target */
    if( email === undefined ){
        messages = serverstub.getUserMessagesByToken(JSON.parse(localtokenJSON).token);
        wallelement = document.getElementById("selfwall");
    }
    else{
        messages = serverstub.getUserMessagesByEmail(JSON.parse(localtokenJSON).token, email);
        wallelement = document.getElementById("browsewall");
    }

    /* build the wall */
    if( messages.success
        && wallelement != null ){
        for( i = 0; i < messages.data.length; ++i ){
            messagesHTML = messagesHTML + "<p>" + messages.data[i].writer + " wrote:</p>"
            + "<p>" + messages.data[i].content + "</p><hr />";
        }
        wallelement.innerHTML = messagesHTML;
    }
    else{
        /* couldn't get messages or wallelement - something wrong - endSession? */
        alert("uh oh spaghettio");
    }

};
