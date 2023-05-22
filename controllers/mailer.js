import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

import axios from 'axios';

// https://ethereal.email/create
let nodeConfig = {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
    }
}

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
    theme: "default",
    product : {
        name: "Mailgen",
        link: 'https://mailgen.js/'
    }
})

/** POST: http://localhost:5001/api/registerMail 
 * @param: {
  "username" : "example123",
  "userEmail" : "admin123",
  "text" : "",
  "subject" : "",
}
*/
export const registerMail = async (req, res) => {
    const { userEmail, text, subject } = req.body;

    // body of the email
    var email = {
        body : {
            name: userEmail,
            intro : text || 'Welcome to Daily Tuition! We\'re very excited to have you on board.',
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }

    var emailBody = MailGenerator.generate(email);

    let message = {
        from : process.env.EMAIL,
        to: userEmail,
        subject : subject || "Signup Successful",
        html : emailBody
    }

    // send mail
    transporter.sendMail(message)
        .then(() => {
            return res.status(200).send({ msg: "You should receive an email from us."})
        })
        .catch(error => res.status(500).send({ error }))

}

export const sendSms = async (msisdn, text) => {
    console.log("Text", text)
    console.log("msisdn", msisdn)

    const url = process.env.SMS_URL;

    // Define the JSON payload for the SMS message.
    const payload = JSON.stringify({
        MessageParameters: [
            {
                Text: msisdn.text,
                Number: msisdn.msisdn
            }
        ],
        ApiKey: process.env.SMS_API_KEY,
        SenderId: process.env.SMS_SENDER_ID,
        ClientId: process.env.SMS_CLIENT_ID
    });

    // Send the SMS message.
    console.log(`---REQUEST----\n${url} -> ${JSON.stringify(payload)}`);
    try {
    const response = await axios.post(url, payload);
        console.log("---RESPONSE---");
        console.log(response.data);
    } catch (error) {
        console.error("---ERROR---");
        console.error(error.response.data);
    }

}
