connectedUsers = [];
playerIDs = [0,1];
playerContainerIDs = ["first-player","second-player"];

authPanel = document.getElementById("auth-panel");
currlogPlayerHeading = document.getElementById("currlog-player");
nicknameContainer = document.getElementById("name");
passwordContainer = document.getElementById("pass");
sillyContainer = document.getElementById("silly");
loginBtn = document.getElementById("login-btn");
loadingImage = document.getElementById("load-img");
loading = false;

editPanel = document.getElementById("edit-panel");
editTitle = document.getElementById("edit-title");
doneBtn = document.getElementById("done-btn");
deleteBtn = document.getElementById("dltacc-btn");
closeBtn = document.getElementById("close-btn");
oldPassContainer = document.getElementById("oldpass");
newPassContainer = document.getElementById("newpass");
oldPassInfoCotnainer = document.getElementById("oldpass-info");
newPassInfoContainer = document.getElementById("newpass-info");
selectedEditUser = null;

allGood = [false,false];
correct = "1px solid #38ada9";
wrong = "2px solid #ff6348";

function checkPassword(passContainer, passInfoContainer) {
    var password = passContainer.value;
    var len = password.length;
    if(len >= 8 && len <= 20) {
        allGood[1] = true;
        passContainer.style.border = correct;
        passInfoContainer.textContent = "";
    } else {
        allGood[1] = false;
        passContainer.style.border = wrong;
        passInfoContainer.textContent = "- the password should have between 8 and 20 characters;";
    }
}

function deleteAccount() {
    // console.log(selectedEditUser.id.toString());
    var url = "./delete.php";

    url += "?id=" + selectedEditUser.id;
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(function(response) {
        response.text().then(function(res) {
            console.log(res);
            if(res == "true") {
                editPanel.children[0].textContent = "Account deleted successfully! Webpage refreshing...";
                setTimeout(function(){ location.reload(); }, 3000);
            } else {
                newPassInfoContainer = "There was a problem deleting the account."
            }
        });
    });
}

window.onload = function(e) {
    closeBtn.addEventListener("click", function(e) {
        editPanel.style.display = "none";
        oldPassContainer.value = "";
        newPassContainer.value = "";
        oldPassContainer.textContent = "";
        newPassContainer.textContent = "";
    });
    newPassContainer.addEventListener("change", function() {
        checkPassword(newPassContainer, newPassInfoContainer);
    });
    doneBtn.addEventListener("click", function(e) {
        e.preventDefault();
        // changePassword();
    });
    deleteBtn.addEventListener("click", function(e) {
        e.preventDefault();
        deleteAccount();
    });
}

function setUpEditMenu(user) {
    editTitle.textContent = "Edit " + user.nickname;
    editPanel.style.display = "block";
    selectedEditUser = user;

    // console.log(user);
}

function populatePlayerContainer(user) {
    var playerContainer = document.getElementById(user.player);
    var sponge = document.createElement("DIV");
    sponge.setAttribute("class","sponge");
    playerContainer.appendChild(sponge);
    // add player's name to the container
    var playerName = document.createElement("H1");
    playerName.textContent = user.nickname;

    var editBtn = document.createElement("SPAN");
    editBtn.setAttribute("class","edit-btn");
    editBtn.addEventListener("click", function() {
        setUpEditMenu(user);
    });

    playerName.appendChild(editBtn);
    sponge.appendChild(playerName);
    // add containers for rolled_dice, score, experience etc
    for(var i = 0; i < 3; i++) {
        sponge.appendChild(document.createElement("DIV"));
    }
}

function handleResult(result) {
    var playYourselfMsg = "You cannot play against yourself, silly! ( ͡° ͜ʖ ͡°)";
    var checkAgain = "The nickname or password is wrong. Check again.";

    loading = false;
    nicknameContainer.value = "";
    passwordContainer.value = "";
    nicknameContainer.disabled = false;
    passwordContainer.disabled = false;
    nicknameContainer.focus();
    nicknameContainer.select();
    loadingImage.style.display = "none";
    loginBtn.style.display = "block";

    if(result !== "false") {
        // auth success waiting
        var user = JSON.parse(result);
        // if a user tries to login again with the same account do nothing
        // and display a decent message
        if(connectedUsers.length == 1 && connectedUsers[0].id === user.id) {
            sillyContainer.textContent = playYourselfMsg;
        } else {
            // auth success
            connectedUsers.push(user);
            if(connectedUsers.length == 1) {
                currlogPlayerHeading.textContent = "2nd player";
            } else if(connectedUsers.length == 2) {
                currlogPlayerHeading.textContent = "";
                authPanel.children[0].style.display = "none";
                authPanel.textContent = "Press SPACE to start";
            }
            populatePlayerContainer(user);
        }
    } else {
        // auth failed
        sillyContainer.textContent = checkAgain;
    }
}

function login(event) {
    event.preventDefault();
    
    var playerContainerID;
    if(!loading && connectedUsers.length < 2) {
        if(connectedUsers.length == 0) {
            playerContainerID = playerContainerIDs[0];
        } else {
            playerContainerID = playerContainerIDs[1];
        }

        sillyContainer.textContent = "";
        nicknameContainer.disabled = true;
        passwordContainer.disabled = true;
        loginBtn.style.display = "none";
        loadingImage.style.display = "block";
        loading = true;
        
        var url = "./login.php";
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player: playerContainerID,
                name: nicknameContainer.value,
                pass: passwordContainer.value
            })
        })
        .then(function(response) {
            response.text().then(function(res) {
                handleResult(res);
            });
        });
    } else {
        document.getElementById("silly").textContent = "No way! ( ͡° ͜ʖ ͡°)";
    }
}