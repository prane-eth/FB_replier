
import cookie from 'react-cookies'
// import useFetch from "react-fetch-hook"

export function initFBSdk() {
    return new Promise(resolve => {
        window.fbAsyncInit = function() {
            window.FB.init({
              appId            : '370672534609881',
              autoLogAppEvents : true,
              xfbml            : true,
              version          : 'v11.0'
            });
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

export function fbLogin() {
    window.FB.login((resp) => {
        window.document.location.reload();
    }, {
        scope: 'public_profile,email,pages_messaging,pages_read_user_content,pages_manage_metadata',
    })
}


export function getPageAccessToken() {
    return new Promise(async (resolve, reject) => {
        const fbDetails = cookie.load('fbDetails')
        // console.log(`FB page: ${fbDetails}`)
        var access_token = fbDetails["accessToken"]
        var page_access_token = ""
        var page_id = ""
        window.FB.api('/me/accounts', (resp) => {
            resp = resp.data[0];
            page_access_token = resp.access_token;
            page_id = resp['id'];
            fetch(`https://graph.facebook.com/${page_id}/subscribed_apps?subscribed_fields=feed&access_token=${page_access_token}`, {method: "post"})
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