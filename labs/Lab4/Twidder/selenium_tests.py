# Before running this, make sure that the test user is not already in the database.
#
# sqlite3 database.db
# .read database.schema
#

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import database_helper
import time
from termcolor import colored


driver = webdriver.Chrome('./Selenium/chromedriver')
driver.get("http://localhost:5000/")

def signup(email, firstname, familyname, gender, city, country, pw, pw_repeat):

    driver.find_element_by_id("emailinput").clear()
    driver.find_element_by_id("firstnameinput").clear()
    driver.find_element_by_id("familynameinput").clear()
    driver.find_element_by_id("cityinput").clear()
    driver.find_element_by_id("countryinput").clear()
    driver.find_element_by_id("passwordinput").clear()
    driver.find_element_by_id("repeatpasswordinput").clear()


    driver.find_element_by_id("emailinput").send_keys(email) 
    driver.find_element_by_id("firstnameinput").send_keys(firstname) 
    driver.find_element_by_id("familynameinput").send_keys(familyname) 

    genderdropdown = driver.find_element_by_id("genderinput")
    for option in genderdropdown.find_elements_by_tag_name('option'):
     if option.text == gender:
         option.click()
         break

    driver.find_element_by_id("cityinput").send_keys(city) 
    driver.find_element_by_id("countryinput").send_keys(country) 
    driver.find_element_by_id("passwordinput").send_keys(pw) 
    driver.find_element_by_id("repeatpasswordinput").send_keys(pw_repeat) 

    driver.find_element_by_id("signupsubmit").click()

def login(email, password):
   driver.find_element_by_id("loginemailinput").clear()
   driver.find_element_by_id("loginpasswordinput").clear()
   driver.find_element_by_id("loginemailinput").send_keys(email)
   driver.find_element_by_id("loginpasswordinput").send_keys(password)

   driver.find_element_by_id("loginsubmit").click()
   time.sleep(2)

def self_post(message):
    driver.find_element_by_id("homeposttextarea").clear()
    driver.find_element_by_id("homeposttextarea").send_keys(message)
    driver.find_element_by_id("selfpostbutton").click()
    time.sleep(1)

def click_browsetab(): 
    driver.find_element_by_id("browsetabselector").click()
    time.sleep(1)

def click_accounttab(): 
    driver.find_element_by_id("accounttabselector").click()
    time.sleep(1)

def browse_user(email):
    driver.find_element_by_id("browseuserinput").clear()
    driver.find_element_by_id("browseuserinput").send_keys(email)

    driver.find_element_by_id("browseuserbutton").click()
    time.sleep(1)

def browse_post(message):
    driver.find_element_by_id("browseposttextarea").clear()
    driver.find_element_by_id("browseposttextarea").send_keys(message)

    driver.find_element_by_id("browsepostbutton").click()
    time.sleep(1)

def change_password(old_pw, new_pw, new_pw_repeat):
    driver.find_element_by_id("oldpasswordinput").clear()
    driver.find_element_by_id("newpasswordinput").clear()
    driver.find_element_by_id("repeatnewpasswordinput").clear() 

    driver.find_element_by_id("oldpasswordinput").send_keys(old_pw)
    driver.find_element_by_id("newpasswordinput").send_keys(new_pw)
    driver.find_element_by_id("repeatnewpasswordinput").send_keys(new_pw_repeat)

    driver.find_element_by_id("changepasswordsubmit").click()
    time.sleep(1) 


try:
    #database_helper.clear_test_data()

    print "Signup Test 1: Signup with mismatched Passwords..."
    signup("zyzz@slayers.com", "Aziz", "Shaversian", "Male", "Sydney", "Down undah", "100natty", "100sharky")
    print driver.find_element_by_id("signuperrortextbox").get_attribute('innerHTML')
    assert driver.find_element_by_id("signuperrortextbox").get_attribute('innerHTML') == 'Passwords do not match'
    print colored("OK!", "green") 

    print "Signup Test 2: Signup with existing email..."
    signup("mjordan@nba.com", "Aziz", "Shaversian", "Male", "Sydney", "Down undah", "100natty", "100natty")  
    time.sleep(1)
    print driver.find_element_by_id("signuperrortextbox").get_attribute('innerHTML')
    assert driver.find_element_by_id("signuperrortextbox").get_attribute('innerHTML') == 'Email already in use.'
    print colored("OK!", "green") 

    print "Signup Test 3: Do an okay signup..."
    signup("zyzz@slayers.com", "Aziz", "Shaversian", "Male", "Sydney", "Down undah", "100natty", "100natty")  
    time.sleep(1)
    print driver.find_element_by_id("signuperrortextbox").get_attribute('innerHTML')
    assert driver.find_element_by_id("signuperrortextbox").get_attribute('innerHTML') == 'User successfully created.'
    print colored("OK!", "green") 

    print "Usage Test 1: Login with created user and view personal information..."
    login("zyzz@slayers.com", "100natty")

    #print driver.find_element_by_id("homeleftpanel").get_attribute('innerHTML')
    assert "Aziz" and "Shaversian" and "Sydney" in driver.find_element_by_id("homeleftpanel").get_attribute('innerHTML')
    print colored("OK!", "green")

    print "Usage Test 2: Post a message to your own wall..."
    self_post("Alright brahs, it's time to talk one on one with everyone here")
    self_post("Everyone has got a little bit of zyzz in them" )
    #print driver.find_element_by_id("selfwall").get_attribute("innerHTML")
    assert "Alright brahs, it's time to talk one on one with everyone here" and "Everyone has got a little bit of zyzz in them" in driver.find_element_by_id("selfwall").get_attribute("innerHTML")
    print colored("OK!", "green")

    print "Usage Test 3: Lookup a nonexisting user..."
    click_browsetab()
    browse_user("chestbrah@slayers.com")
    assert "No such email." in driver.find_element_by_id("browseerrortextbox").get_attribute("innerHTML")
    print colored("OK!", "green")

    print "Usage Test 4: Lookup an existing user..."
    browse_user("mjordan@nba.com")
    assert "User found!" in driver.find_element_by_id("browseerrortextbox").get_attribute("innerHTML")
    print colored("OK!", "green")

    print "Usage Test 5: Cyberbully another user..."
    browse_post("You mirin brah?")
    browse_post("I'll give you even more reasons to mire brah")
    
    assert "You mirin brah?" and "I'll give you even more reasons to mire brah" in driver.find_element_by_id("browsewall").get_attribute("innerHTML")
    print colored("OK!", "green")

    print "Usage Test 6: Change your password incorrectly..."
    click_accounttab()

    print "Incorrect old password..."
    change_password("zyzz2011", "mirin1", "mirin1")
    assert "Incorrect password." in driver.find_element_by_id("changepassworderrortextbox").get_attribute("innerHTML")

    print "Too short new password..."
    change_password("100natty", "123", "123")
    assert "New password too short" in driver.find_element_by_id("changepassworderrortextbox").get_attribute("innerHTML")

    print "Mismatching new passwords..."
    change_password("100natty", "1234", "12345")
    assert "New passwords do not match" in driver.find_element_by_id("changepassworderrortextbox").get_attribute("innerHTML")
    print colored("OK!", "green")

    print "Usage Test 7: Change your password correctly..."
    change_password("100natty", "mrolympia2018", "mrolympia2018")
    time.sleep(1)
    assert "Password changed!" in driver.find_element_by_id("changepassworderrortextbox").get_attribute("innerHTML")

    print "Logging out and logging in with new credentials"
    driver.find_element_by_id("signoutbutton").click()

    login("zyzz@slayers.com", "mrolympia2018")
    assert "Aziz" and "Shaversian" and "Sydney" in driver.find_element_by_id("homeleftpanel").get_attribute('innerHTML')
    print colored("OK!", "green")

    self_post("We made it brah" )


    print colored("All tests passed!", "green")
    time.sleep(1)
    driver.close()    

except AssertionError:
    print colored("Test failed!", "red")
    time.sleep(1)
    driver.close()
 


