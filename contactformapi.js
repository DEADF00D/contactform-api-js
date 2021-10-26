let RapidAPI_Key = document.currentScript.getAttribute('data-contactformapi-rapidapi-key');

console.log(RapidAPI_Key);

function loadCaptcha(f){
    fetch('https://contact-form4.p.rapidapi.com/captcha', {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'contact-form4.p.rapidapi.com',
		    'x-rapidapi-key': RapidAPI_Key
        },
        body: JSON.stringify({ 'uid': f.getAttribute('data-contactformapi') })
    })
    .then(res => res.json())
    .then(res => {
        if(!res.success){ return; }

        var e = f.querySelector("*[data-contactformapi-captcha]");
        e.querySelector("img").src = `data:image/png;base64,${ res.image }`;
        e.querySelector("input[data-contactformapi-captcha-uid]").setAttribute("data-contactformapi-captcha-uid", res.uid);
    })
    .catch(res => {
        var captcha_div = getCaptchaElementForm(f);
        captcha_div.parentNode.removeChild(captcha_div);
        formCallError(f, res);
    });
}

function getCaptchaElementForm(f){
    var captcha_div;

    var captcha_div_specified = f.querySelector("*[data-contactformapi-captcha]");
    if(captcha_div_specified){
        captcha_div = captcha_div_specified;
    }else{
        captcha_div = document.createElement('DIV');
        captcha_div.setAttribute('data-contactformapi-captcha', 'true');
    }

    return captcha_div;
}

function createCaptcha(f){
    var submit = f.querySelector("button[type='submit'], input[type='submit']");
    var captcha_div = getCaptchaElementForm(f);

    captcha_div.style = 'width:200px; padding:5px; border: 1px solid #ddd; border-radius: 5px;';
    captcha_div.innerHTML = `
        <img src = "#" style="width: 100%; height: auto;" />
        <input data-contactformapi-captcha-uid = "hello" style="width: calc(100% - 15px);border: 1px solid #ddd;padding: 6px;" placeholder="Type characters" />
        <span style="color:#f44336; font-size: 12px;" data-contactformapi-error = "true"></span>
    `;

    if(!f.querySelector("*[data-contactformapi-captcha]")){
        submit.parentNode.insertBefore(captcha_div, submit);
    }
}

function errorCaptcha(f, error){
    var e = document.querySelector("*[data-contactformapi-captcha] span[data-contactformapi-error]");
    e.innerText = error;
}

function formCallSuccess(f, res){
    var onsuccess = f.getAttribute('data-contactformapi-onsuccess');
    if(onsuccess && window[onsuccess]){
        window[onsuccess](f, res);
    }
}

function formCallError(f, res){
    var onerror = f.getAttribute('data-contactformapi-onerror');
    if(onerror && window[onerror]){
        window[onerror](f, res);
    }
}

window.addEventListener('load', () => {
    document.querySelectorAll('form[data-contactformapi]').forEach((f) => {
        createCaptcha(f);
        loadCaptcha(f);

        f.addEventListener('submit', function(e){
            e.preventDefault();

            var fields = [];

            var formData = new FormData(f);
            for(var p of formData.entries()){
                fields.push({
                    name: p[0],
                    value: p[1]
                })
            }

            var captcha_input = document.querySelector("input[data-contactformapi-captcha-uid]");

            fetch('https://contact-form4.p.rapidapi.com/submit', {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'x-rapidapi-host': 'contact-form4.p.rapidapi.com',
        		    'x-rapidapi-key': RapidAPI_Key
                },
                body: JSON.stringify({
                    'captcha-uid': captcha_input.getAttribute("data-contactformapi-captcha-uid"),
                    'captcha-response': captcha_input.value,
                    'fields': fields
                })
            })
            .then(res => res.json())
            .then(res => {
                if(res.error){
                    if(res.code == 'captcha_expired'){
                        errorCaptcha(f, "Expired captcha. Please retry.");
                        loadCaptcha(f);
                    }else if(res.code == 'captcha_wrong'){
                        errorCaptcha(f, "Wrong captcha. Please retry.");
                        loadCaptcha(f);
                    }

                    formCallError(f, res);
                }
                else if(res.success){
                    errorCaptcha(f, '');
                    formCallSuccess(f, res);
                }
            }).catch(res => {
                formCallError(f, res);
            });

            captcha_input.value = '';
        });
    });
});
