const sgmail = require('@sendgrid/mail')

const apikey = process.env.SENDGRID_API_KEY
sgmail.setApiKey(apikey)

const sendWelcomeEmail = (email, name) => {

    sgmail.send({
        to: email,
        from: process.env.EMAIL,
        subject: "Thanks for joining in!",
        text: `Welcome to the app, ${name}. Let me know how to get along with the app.`
    })
}

module.exports = {
    sendWelcomeEmail
}