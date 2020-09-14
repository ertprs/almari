// init all function 
function setCookie(key, value, expiry) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

function eraseCookie(key) {
    var keyValue = getCookie(key);
    setCookie(key, keyValue, '-1');
}

function logout() {
    eraseCookie("id");
    window.location.href = "/";
}

function check_cookie() {
    // filter cookies
    if(getCookie("id") == null){
        if (window.location.pathname  != "/"){
            window.location.href = "/";
        }
    } else {
        if (window.location.pathname  == "/"){
            window.location.href = "/dashboard";
        }
    }
}

check_cookie();

// allow cookie
// window.cookieconsent.initialise({
//     container: document.getElementById("cookieconsent"),
//     palette:{
//         popup: {background: "#1aa3ff"},
//         button: {background: "#e0e0e0"},
//     },
//     revokable: true,
//     onStatusChange: function(status) {
//         console.log(this.hasConsented() ?
//         'enable cookies' : 'disable cookies');
//     },
//     "position": "bottom-right",
//     "theme": "classic",
//     "domain": "http://localhost:3001",
//     "secure": true,
//     "content": {
//         "header": 'Cookies used on the website!',
//         "message": 'This website uses cookies to improve your experience.',
//         "dismiss": 'Got it!',
//         "allow": 'Allow cookies',
//         "deny": 'Decline',
//         "link": 'Learn more',
//         "href": 'https://www.cookiesandyou.com',
//         "close": '&#x274c;',
//         "policy": 'Cookie Policy',
//         "target": '_blank',
//     }
// });