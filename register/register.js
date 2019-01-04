function Register() {
    var self = this;
    this.allGood = [false,false,false,false];
    this.correct = "1px solid #38ada9";
    this.wrong = "2px solid #ff6348";

    this.setup();

    this.nicknameContainer.addEventListener("change", function() { self.checkNickname(); });
    this.emailContainer.addEventListener("change", function() { self.checkEmail(); });
    this.passwordContainer.addEventListener("change", function() { self.checkPassword(); });
    this.termsContainer.addEventListener("change", function() { self.checkTerms(); });
    this.registerButton.addEventListener("click", function(e) { self.register(e); });
}

Register.prototype.setup = function() {
    this.nicknameContainer = document.getElementById("name");
    this.passwordContainer = document.getElementById("pass");
    this.emailContainer = document.getElementById("mail");
    this.termsContainer = document.getElementById("check");
    this.registerButton = document.getElementById("register-btn");
    this.nameInfoContainer = document.getElementById("name-info");
    this.passInfoContainer = document.getElementById("pass-info");
    this.mailInfoContainer = document.getElementById("mail-info");
    this.termInfoContainer = document.getElementById("term-info");
}

Register.prototype.checkNickname = function() {
    var nickname = this.nicknameContainer.value;
    var len = nickname.length;
    var nicknameRegex = /[A-Za-z0-9_]/;
    if(len >= 3 && len <= 10 && nicknameRegex.test(nickname)) {
        this.allGood[0] = true;
        this.nicknameContainer.style.border = this.correct;
        this.nameInfoContainer.textContent = "";
    } else {
        this.allGood[0] = false;
        this.nicknameContainer.style.border = this.wrong;
        this.nameInfoContainer.textContent = "- the nickname should have between 3 and 10 characters and should only contain letters and numbers;";
    }
}

Register.prototype.checkPassword = function() {
    var password = this.passwordContainer.value;
    var len = password.length;
    if(len >= 8 && len <= 20) {
        this.allGood[1] = true;
        this.passwordContainer.style.border = this.correct;
        this.passInfoContainer.textContent = "";
    } else {
        this.allGood[1] = false;
        this.passwordContainer.style.border = this.wrong;
        this.passInfoContainer.textContent = "- the password should have between 8 and 20 characters;";
    }
}

Register.prototype.checkEmail = function() {
    var email = this.emailContainer.value;
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(emailRegex.test(email)) {
        this.allGood[2] = true;
        this.emailContainer.style.border = this.correct;
        this.mailInfoContainer.textContent = "";
    } else {
        this.allGood[2] = false;
        this.emailContainer.style.border = this.wrong;
        this.mailInfoContainer.textContent = "- the email is not valid;";
    }
}

Register.prototype.checkTerms = function() {
    this.allGood[3] =  this.termsContainer.checked;
    if(this.allGood[3]) {
        this.termInfoContainer.textContent = "";
    } else {
        this.termInfoContainer.textContent = "- please read and accept the terms and conditions;";
    }
}

Register.prototype.register = function(event) {
    event.preventDefault();
    var i;
    for(i = 0; i < this.allGood.length; i++) {
        if(this.allGood[i] == false) break;
    }
    if(i == this.allGood.length) {
        this.proceed();
    } else {
        this.checkNickname();
        this.checkEmail();
        this.checkPassword();
        this.checkTerms();
    }
    //console.log(this.allGood);
}

Register.prototype.proceed = function() {
    var url = "register.php";

    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: this.nicknameContainer.value,
            pass: this.passwordContainer.value,
            mail: this.emailContainer.value
        })
    })
    .then(function(response) {
        response.text().then(function(res) {
            document.getElementById("message").innerHTML = res;
        });
    });
}

new Register();