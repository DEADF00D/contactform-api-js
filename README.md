**ContactForm API** take care of your contact form easily and with minimal setup.  

Create your form on your page, add few attributes, and that's it !
Your form now support **captcha validation**, **honeypot security** and **email reporting on submissions**.

## Setup on your page:
To work, **ContactForm API** need you to import the `contactformapi.min.js` javascript snippet.
It will take care of captcha generation, captcha element and form submissions automatically and weight **only 2.5kb**.  
You can include it with:
```
<script src="https://cdn.jsdelivr.net/gh/DEADF00D/contactform-api-js@main/contactformapi.min.js" type="text/javascript" data-contactformapi-rapidapi-key="API_KEY"></script>
```
Remember to replace `API_KEY` by your RapidAPI API key.

## Form registration:
1. Create your form on https://contactformapi.rac-0.fr/.
2. Then click on the **Create your form** button.
3. Choose a name for your form. This name will appear in your collaborators mail on submission.
4. Add your collaborators emails using the **Add email** button. You can add up to 5 emails per form.
5. Then submit.

You should now get a **Form UID**.

## Setup the form on your page:

This **Form UID** should appear under the `data-contactformapi` attribute on your `<form>` element.

You can then add `data-contactformapi-success` and `data-contactformapi-error` attributes to specify callback on success / errors of form submission.

By default, captcha element is located right before the `<button>` or `<input />` submit element.
You can choose this location anywhere in your form by creating an empty `div` with the attribute `data-contactformapi-captcha="true"`.

You're now ready to receive enquiries from your visitors.
