export function initFacebookSdk() {
    return new Promise(resolve => {

        // wait for facebook sdk to initialize before starting the react app
        window.fbAsyncInit = function() {
            FB.init({
              appId            : '370672534609881',
              autoLogAppEvents : true,
              xfbml            : true,
              version          : 'v11.0'
            });

            // auto authenticate with the api if already logged in with facebook
            window.FB.getLoginStatus((resp) => {
                console.log(resp.status);
                resolve(resp.authResponse);
            });
        };

        // load facebook sdk script
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));    
    });
}

export function facebookLogin() {
    window.FB.login((resp) => {
        window.document.location.reload();
    }, {
        scope: 'public_profile,email,pages_messaging,pages_read_user_content,pages_manage_metadata',
    })
}

export function facebookLogout() {
    window.FB.logout(() => {
        window.document.location.reload();
    });
}

export function facebookGetPageAccessToken() {
    return new Promise(async (resolve, reject) => {
        window.FB.api('/me/accounts', (resp) => {
            fetch(`https://graph.facebook.com/${resp.data[0].id}/subscribed_apps?subscribed_fields=feed&access_token=${resp.data[0].access_token}`, {method: "post"})
                .then((resp) => resp.json())
                .then((r) => console.log(r))
                .catch((err) => console.log('App did not subscribe:', err.message))
            resolve({
                id: resp.data[0].id,
                accessToken: resp.data[0].access_token,
            });
        })
    })
}
