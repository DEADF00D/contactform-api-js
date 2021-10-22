function loadCaptcha(f){
    fetch('http://127.0.0.1:5000/captcha', {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'uid': f.getAttribute('data-contactformapi') })
    })
    .then(res => res.json())
    .then(res => {
        if(!res.success){ return; }

        var e = f.querySelector("*[data-contactformapi-captcha]");
        e.querySelector("img").src = `data:image/png;base64,${ res.image }`
        e.querySelector("input[data-contactformapi-captcha-uid]").setAttribute("data-contactformapi-captcha-uid", res.uid);
    });
}

function createCaptcha(f){
    var submit = f.querySelector("button[type='submit'], input[type='submit']");

    var captcha_div_specified = document.querySelector("*[data-contactformapi-captcha]");
    if(captcha_div_specified){
        captcha_div = captcha_div_specified;
    }else{
        captcha_div = document.createElement('DIV');
        captcha_div.setAttribute('data-contactformapi-captcha', 'true');
    }

    captcha_div.style = 'width:200px; padding:5px; border: 1px solid #ddd; border-radius: 5px;';
    captcha_div.innerHTML = `
        <img src = "c" style="width: 100%; height: auto;" />
        <input data-contactformapi-captcha-uid = "hello" style="width: calc(100% - 15px);border: 1px solid #ddd;padding: 6px;" placeholder="Type caracters" />
        <span style="color:#f44336; font-size: 12px;" data-contactformapi-error = "true"></span>
    `;

    if(!captcha_div_specified){
        submit.parentNode.insertBefore(captcha_div, submit);
    }
}

function errorCaptcha(f, error){
    var e = document.querySelector("*[data-contactformapi-captcha] span[data-contactformapi-error]");
    e.innerText = error;
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

            fetch('http://127.0.0.1:5000/submit', {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
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

                    var onerror = f.getAttribute('data-contactformapi-onerror');
                    if(onerror && window[onerror]){
                        window[onerror](f, res);
                    }
                }
                else if(res.success){
                    errorCaptcha(f, '');
                    var onsuccess = f.getAttribute('data-contactformapi-onsuccess');
                    if(onsuccess && window[onsuccess]){
                        window[onsuccess](f, res);
                    }
                }
            });

            captcha_input.value = '';
        });
    });
});
