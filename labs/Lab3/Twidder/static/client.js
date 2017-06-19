/**
 * endSession and continueSession functions?
 * Consider formmethod="get" and "post"
 * make localdata a global script variable as well instead of localStorage?
 * addEventListeners -> setAttributes?
 */
var browsecontext = {
    "email": undefined,
    "firstname": undefined,
    "familyname": undefined,
    "gender": undefined,
    "city": undefined,
    "country": undefined
};

var localdata = {
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

	get("/data-by-token/" + JSON.parse(localtokenJSON), function(response){

	    if(response.success){
		localdata = JSON.stringify(response.data); 

		displayProfileView(localdata);
	    }
	    else{
		displayWelcomeView();
		localStorage.removeItem("localtoken"); 
	    }
	}); 
    }

};
var displayWelcomeView = function(){
    document.getElementById("viewdiv").innerHTML=document.getElementById("welcomeview").innerHTML;
    attachHandlers();

};
var displayProfileView = function(dataobject){
    if (typeof dataobject !== 'undefined'){
	document.getElementById("viewdiv").innerHTML=document.getElementById("profileview").innerHTML;

	var firstnameholders = document.getElementsByClassName("userfirstname");
	for( i = 0 ; i < firstnameholders.length ; ++i ){
            firstnameholders[i].innerHTML=JSON.parse(dataobject).firstname;
	}
	var familynameholders = document.getElementsByClassName("userfamilyname");
	for( i = 0 ; i < familynameholders.length ; ++i ){
            familynameholders[i].innerHTML=JSON.parse(dataobject).familyname;
	}
	var genderholders = document.getElementsByClassName("usergender");
	for( i = 0 ; i < genderholders.length ; ++i ){
            genderholders[i].innerHTML=JSON.parse(dataobject).gender;
	}
	var emailholders = document.getElementsByClassName("useremail");
	for( i = 0 ; i < emailholders.length ; ++i ){
            emailholders[i].innerHTML=JSON.parse(dataobject).email;
	}
	var cityholders = document.getElementsByClassName("usercity");
	for( i = 0 ; i < cityholders.length ; ++i ){
            cityholders[i].innerHTML=JSON.parse(dataobject).city;
	}
	var countryholders = document.getElementsByClassName("usercountry");
	for( i = 0 ; i < countryholders.length ; ++i ){
            countryholders[i].innerHTML=JSON.parse(dataobject).country;
	}

    }
    updateWall();

    attachHandlers();

};
window.onload = function(){
    //code that is executed as the page is loaded.
    //You shall put your own custom code here.
    //window.alert() is not allowed to be used in your implementation.
    init();


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

        /* attach changepwPasswordHelper */
        var newpwinputelement = document.getElementById("newpasswordinput");
        var rptnewpwinputelement = document.getElementById("repeatnewpasswordinput");

        newpwinputelement.addEventListener("input", changepwPasswordHelper);
        rptnewpwinputelement.addEventListener("input", changepwPasswordHelper);
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
        SUETBelement.innerHTML = "";
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


    var postData = "username="+loginemail+"&password="+loginpassword; 

    post("/sign-in", postData, function(response){

	if(response.success){
	    localStorage.setItem("localtoken", JSON.stringify(response.data));
	    get("/data-by-token/" + response.data, function(response2){
		if(response2.success){
		    localdata = JSON.stringify(response2.data);

		    // testboys
		    connectSocket(loginemail);
		    displayProfileView(JSON.stringify(response2.data));
		}
	    }); 
	}
	else{
	    document.getElementById("loginerrortextbox").innerHTML = response.message;
	}
    });

};
var signupformSubmit = function() {
    var newsignee;
    var signupresponse;
    var SUETBelement = document.getElementById("signuperrortextbox");

    if( ! signupPasswordHelper() ){
        return;
    }

    newsignee = {"email":       document.getElementById("emailinput").value,
                 "firstname":    document.getElementById("firstnameinput").value,
                 "familyname":   document.getElementById("familynameinput").value,
                 "gender":       document.getElementById("genderinput").value,
                 "city":         document.getElementById("cityinput").value,
                 "country":      document.getElementById("countryinput").value,
                 "password":     document.getElementById("passwordinput").value
		};

    //signupresponse = serverstub.signUp(newsignee);

    var postData = "email="+       document.getElementById("emailinput").value+"&"+
        "firstname="+    document.getElementById("firstnameinput").value+"&"+
        "familyname="+   document.getElementById("familynameinput").value+"&"+
        "gender="+       document.getElementById("genderinput").value+"&"+
        "city="+         document.getElementById("cityinput").value+"&"+
        "country="+     document.getElementById("countryinput").value+"&"+
        "password="+     document.getElementById("passwordinput").value;

    post("/sign-up", postData, function(response){

	if( response.success ){
            SUETBelement.style.color="green";
            document.getElementById("signupform").reset();
	}
	else{
            SUETBelement.style.color="red";
	}
	SUETBelement.innerHTML=response.message;
    }); 

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
var changepwPasswordHelper = function() {
    var newpassword = document.getElementById("newpasswordinput").value;
    var repeatnewpassword = document.getElementById("repeatnewpasswordinput").value;
    var CPWETBelement = document.getElementById("changepassworderrortextbox");

    if( newpassword === "" ){
        CPWETBelement.innerHTML="";
    }
    else if( newpassword.length < 4 ){
        CPWETBelement.style.color="red";
        CPWETBelement.innerHTML="New password too short";
    }
    else if( newpassword === repeatnewpassword ){
        CPWETBelement.style.color="green";

        if( newpassword === "password"){
            CPWETBelement.innerHTML="I deserve this";
        }
        else{
            CPWETBelement.innerHTML="New password OK";
            return true;
        }
    }
    else{
        CPWETBelement.style.color = "red";
        CPWETBelement.innerHTML = "New passwords do not match";
    }
    return false;

};
var changepasswordformSubmit = function() {
    var localtokenJSON = localStorage.getItem("localtoken");
    var localtokenobject;
    var CPWETBelement = document.getElementById("changepassworderrortextbox");
    var changepasswordresponse;

    if( ! changepwPasswordHelper() ){
        return;
    }

    if( localtokenJSON === null ){
        // No token in local storage

    }
    else{
        localtokenobject = JSON.parse(localtokenJSON);

	post("/change-password", "token="+JSON.parse(localtokenJSON) 
	     + "&old_password=" + document.getElementById("oldpasswordinput").value
	     + "&new_password=" + document.getElementById("newpasswordinput").value, function(response){
		 CPWETBelement.innerHTML = response.message;
		 if( response.success ){
		     CPWETBelement.style.color = "green";
		     document.getElementById("changepasswordform").reset();
		 }
		 else{
		     CPWETBelement.style.color = "red";
		 }
	     }); 


    }

};
var logOutClick = function() {
    var localtokenJSON = localStorage.getItem("localtoken");
    
    
    var SOETBelement = document.getElementById("signouterrortextbox");

    if( localtokenJSON === null ){
        // No token in local storage

    }
    else{
        post("/sign-out", "token="+JSON.parse(localtokenJSON), function(response){

            if( response.success ){
		localStorage.removeItem("localtoken");
		localStorage.removeItem("localdata");
		displayWelcomeView();
            }
            else{
		//Something went wrong, pretend everything is alright
		SOETBelement.innerHTML=signoutresponse.message;
            }
	});
    }

};
var selfPostClick = function() {
    var localtokenJSON = localStorage.getItem("localtoken");
    var content = document.getElementById("homeposttextarea").value;
   // var localdataJSON = localStorage.getItem("localdata");
 
    post("/post", "message="+content + "&token=" + JSON.parse(localtokenJSON) + "&email="
	 + JSON.parse(localdata).email, function(response){
	     document.getElementById("homeposttextarea").value = "";
	 });

    updateWall(); 

};
var browsePostClick = function() {
    var localtokenJSON = localStorage.getItem("localtoken");
    var content = document.getElementById("browseposttextarea").value;
    var email = browsecontext.email;
    post("/post", "message="+content + "&token=" + JSON.parse(localtokenJSON) + "&email="
	 + email, function(response){
             document.getElementById("browseposttextarea").value = "";
	     updateWall(email);
	 });

};
var clientPostMessage = function(token, content, toEmail, self) {
    //serverstub.postMessage(token, content, toEmail);

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
    //    var browseuserdata = serverstub.getUserDataByEmail(JSON.parse(localtokenJSON).token, email);
if(email != ""){
    get("/data-by-email/" + JSON.parse(localtokenJSON) + "/" +
	email, function(response)
	{
	    
	    if(response.success){
		/* fill in the template and make it visible */
		document.getElementById("userpagetemplate").style.display = "block";
		document.getElementById("browsefirstname").innerHTML = response.data.firstname;
		document.getElementById("browsefamilyname").innerHTML = response.data.familyname;
		document.getElementById("browseemail").innerHTML = response.data.email;
		document.getElementById("browsegender").innerHTML = response.data.gender;
		document.getElementById("browsecity").innerHTML = response.data.city;
		document.getElementById("browsecountry").innerHTML = response.data.country;

		/* fill browsecontext fam */
		browsecontext.firstname = response.data.firstname;
		browsecontext.familyname = response.data.familyname;
		browsecontext.email = response.data.email;
		browsecontext.gender = response.data.gender;
		browsecontext.city = response.data.city;
		browsecontext.country = response.data.country;

		updateWall(email);
	    }
	    else{
		//output some form of error
	    }
	}); 
}
    //   var browseusermessages = serverstub.getUserMessagesByEmail(JSON.parse(localtokenJSON).token, email);



};
var updateWall = function(email) {
    /* updateWall to eventually be a callback function? */
    var messages = "";
    var messagesHTML = "";
    var wallelement;
    var localtokenJSON = localStorage.getItem("localtoken");

    if(email != undefined)
	//todo: denna funkar inte för icke-jag. jag tror anropet är
	//konstigt. post för andra människor hamnar på min wall.
    {
	get("/messages-by-email/" + JSON.parse(localtokenJSON)  + "/"
	    + email, function(response){
		if(response.success){
		    messages=response.data; 
		    for( i = 0; i < messages.length; ++i ){
			messagesHTML = messagesHTML + "<p>" + messages[i].fromUser
			    + " wrote:</p>" + "<p>" + messages[i].content + "</p><hr />";
		    }
		    wallelement = document.getElementById("browsewall");
		    wallelement.innerHTML = messagesHTML;
		}
	    });
    }
    else{	
	get("/messages-by-email/" + JSON.parse(localtokenJSON)  + "/"
	    + JSON.parse(localdata).email, function(response){
		if(response.success){
		    messages=response.data; 
		    for( i = 0; i < messages.length; ++i ){
			messagesHTML = messagesHTML + "<p>" + messages[i].fromUser
			    + " wrote:</p>" + "<p>" + messages[i].content + "</p><hr />";
		    }
		    wallelement = document.getElementById("selfwall");
		    wallelement.innerHTML = messagesHTML;
		}
	    });
    }
};


/*testing theseboys*/
function post(url, postData, callback){
    var xmlHttp = new XMLHttpRequest();
    var async = true;


    xmlHttp.open("POST", url, async);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.onreadystatechange = function () {
	if( xmlHttp.readyState == 4 && xmlHttp.status == 200){
	    callback(JSON.parse(xmlHttp.responseText)); 
	}
    }
    xmlHttp.send(postData); 
}

function get(url, callback){
    var xmlHttp = new XMLHttpRequest();
    var async = true;


    xmlHttp.open("GET", url, async);
    xmlHttp.onreadystatechange = function () {
	if( xmlHttp.readyState == 4 && xmlHttp.status == 200){
	    callback(JSON.parse(xmlHttp.responseText)); 
	}
    }
    xmlHttp.send(null); 
}


function connectSocket(email) {

    var ws = new WebSocket("ws://localhost:5000/connect-socket");

    ws.onopen = function() {
        ws.send(email);
    };

    ws.onmessage = function(response) {
        console.log(response.data);
        if (response.data == "logout") {
            logOutClick();
        };
    };

    ws.onclose = function() {
        console.log("WebSocket closed");
    };

    ws.onerror = function() {
        console.log("ERROR!");
    };
}
