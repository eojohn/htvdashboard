    var auth0 = new Auth0({
        domain: 'eojohn.auth0.com',
        clientID: 'ThjTg1wA4gZADyLKJVkhmSOMpC6gybwA',
        callbackURL: 'https://dashboard.hackvalley.com/index.html',
        responseType: 'token'
    });

    // the authentication in page
    function login() {
        clear();
        var options = {
            "icon": "htv_logo-01.png",
            "container": "root",
            "primaryColor": "#F0D96F",
            "foregroundColor": "#edf5e1",
            "responseType": "token",
            "autoclose": true,
            "focusInput": false,
            "popup": false,
            "socialBigButtons": true,
            "dict": { "title": "Hack The Valley" },
            "authParams": { "scope": "openid profile offline_access" },
            "connections": ["facebook", "twitter"]
        };

        // initialize
        var lock = new Auth0LockPasswordless('ThjTg1wA4gZADyLKJVkhmSOMpC6gybwA', 'eojohn.auth0.com');

        // Open the lock in Email Code mode with the ability to handle
        // the authentication in page
        lock.emailcode(options, function(err, profile, id_token, access_token, state, refresh_token) {
            if (!err) {
                console.log('profile', profile);
                console.log('id_token', id_token);
                console.log('refresh_token', refresh_token);

                // Save the JWT token.
                localStorage.setItem('userToken', id_token);
                localStorage.setItem('refreshToken', refresh_token);
                loadProfile(profile);
            }
        });
    }

    function loadProfile(profile) {

        localStorage.setItem('expToken', profile.exp);

        $('.login-box').hide();
        $('.logged-in-box').show();
        $('.nickname').text(profile.name);
        var ref = firebase.database().ref();
        ref.child("users")
            .orderByChild("email")
            .equalTo(profile.name) //profile.name
            .on("child_added", function(snapshot) {
                var regEmail = snapshot.val().email;
                var userName = snapshot.val().first_name;
                var userLast = snapshot.val().last_name;
                var userStatus = snapshot.val().status;
                if (userStatus === "P") {
                    userStatus = "Pending";
                } else if (userStatus === "Y") {
                    userStatus = "Admitted";
                    $('.notify').show();
                } else if (userStatus === "" && profile.name === regEmail) {
                    userStatus = "Pending";
                } else if (userStatus === "D") {
                    userStatus = "Denied";
                } else {
                    userStatus = snapshot.val().status;
                    $('.notify').show();
                }


                $('.userName').text(userName);



                $('.status').text(userStatus);
                if (regEmail === "ralphpal@hotmail.com" || "eojohn@packer.edu") {
                    $('.message_box').show();
                    document.onkeydown = function() {
                        if (window.event.keyCode == '13') {
                            submitPost();
                            return false;

                        }
                    }

                } else {
                    $('.message_box').hide();
                }

            });
        $('.avatar').attr('src', profile.picture);
    }



    var messageRef = firebase.database().ref('messages/');;
    messageRef.on('child_added', function(snapshot) {
        var post = snapshot.val();
        displayUserPost(post.text);
    });

    var template =
        '<span  class="message">Hey</span>';


    function submitPost() {
        var text;
        if (regEmail === "ralphpal@hotmail.com" || "eojohn@packer.edu") {
            text = $('#message').val();

        } else {
            return false;
        }
        //  var messageRef = new Firebase('https://hack-the-valley.firebaseio.com/messages');

        if (text === "") {
            alert("You need to have a value in the field")
        } else {
            messageRef.push({ text: text });
            $('#message').val('');
        }


    }


    function displayUserPost(text) {
        $('<span class="message child">').text(text).appendTo($('#messages2'));


        /* var elems = document.getElementsByClassName("message");
        var arr = jQuery.makeArray(elems);
        arr.reverse();
        $(arr).appendTo($('#messages2'));*/

        $('body, html, #messages2').animate({ scrollTop: 0 }, "fast");
    }

    function logout() {
        clear();
        window.location.href = 'https://www.hackvalley.com';
    }

    function clear() {
        localStorage.removeItem('userToken');
        localStorage.removeItem('expToken');
        localStorage.removeItem('refreshToken');
    }

    function checkToken(cb) {
        if (!localStorage.getItem('userToken') || !localStorage.getItem('expToken') || !localStorage.getItem('refreshToken')) {
            return cb(null);
        }
        var time = new Date().getTime();
        if (time > localStorage.getItem('expToken')) {
            refreshToken(cb);
        } else {
            auth0.getProfile(localStorage.getItem('userToken'), function(err, profile) {
                if (err) {
                    console.log(err);
                    return refreshToken(cb);
                }

                cb(profile);
            });
        }
    }

    function refreshToken(cb) {
        auth0.refreshToken(localStorage.getItem('refreshToken'), function(err, delegationResult) {
            if (err) {
                console.log(err);
                return cb(null);
            }
            localStorage.setItem('userToken', delegationResult.id_token);
            localStorage.setItem('expToken', delegationResult.expires_in + localStorage.getItem('expToken'));

            checkToken(cb);
        });
    }



    window.onload = function() {
        checkToken(function(profile) {
            if (!profile) {
                login();
            } else {
                loadProfile(profile);
            }
        });
    };
