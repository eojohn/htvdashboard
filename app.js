    // the authentication in page
  function login(){
        // Initialize Passwordless Lock instance
        var lock = new Auth0LockPasswordless(
          // All these properties are set in auth0-variables.js
         'ThjTg1wA4gZADyLKJVkhmSOMpC6gybwA',
          'eojohn.auth0.com'
        );

        // Open the lock in Email Code mode with the ability to handle
        // the authentication in page
        lock.emailcode( function(err, profile, id_token, state) {
          if (!err) {
            console.log('profile',profile);
            console.log('id_token',profile);
            console.log('state',state);

            // Save the JWT token.
            localStorage.setItem('userToken', id_token);
            $('.login-box').hide();
            $('.logged-in-box').show();
            $('.nickname').text(profile.name);
            $('.avatar').attr('src', profile.picture);
          }
        });
      }
    
     
    $.ajaxSetup({
      'beforeSend': function(xhr) {
        if (localStorage.getItem('userToken')) {        
          xhr.setRequestHeader('Authorization', 
                'Bearer ' + localStorage.getItem('userToken'));
        }
      }
    });

    $('.btn-api').click(function(e) {
        // Just call your API here. The header will be sent
    })

    
