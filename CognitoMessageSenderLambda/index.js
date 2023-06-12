import encryptionSdk from '@aws-crypto/client-node'
import b64 from 'base64-js'
import nodemailer from 'nodemailer'
import twilio from 'twilio'

const { decrypt } = encryptionSdk.buildClient(encryptionSdk.CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT)

const keyring = new encryptionSdk.KmsKeyringNode(
    {
        generatorKeyId: process.env.KEY_ALIAS,
        keyIds: [process.env.KEY_ARN]
    }
)

const transporter = nodemailer.createTransport(
    {
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.MAIL_ADDRESS,
            pass: process.env.MAIL_PASSWORD
        }
    }
)

const sendMail = async (mailOptions) => {
    return new Promise(
        (resolve, reject) => {
            transporter.sendMail(
                mailOptions, (error) => {
                    if (error) {
                        reject()
                    } else {
                        resolve()
                    }
                }
            )
        }
    )
}


const twilioClient = new twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_TOKEN
)

const sendSms = async (to, body) => {
    await twilioClient.messages.create(
        {
            to,
            body,
            from: process.env.TWILIO_PHONE
        }
    )
}


const signUpSendMessage = async (code, email, phone) => {
    const { plaintext: otpCode } = await decrypt(keyring, b64.toByteArray(code))

    if (email) {
        const mailOptions = {
            from: 'Verify OTP',
            to: email,
            subject: 'Hello from Nodemailer',
            text: `Your verification code is: ${otpCode}`
        }
        await sendMail(mailOptions)
    }

    if (phone) {
        await sendSms(
            phone,
            `Your verification code is: ${otpCode}`
        )
    }
}

export const handler = async (event) => {
    const { triggerSource } = event

    // CustomSMSSender_ResendCode
    // CustomSMSSender_ForgotPassword
    // CustomSMSSender_UpdateUserAttribute
    // CustomSMSSender_VerifyUserAttribute
    // CustomSMSSender_AdminCreateUser,
    // CustomSMSSender_AccountTakeOverNotification

    if (triggerSource === 'CustomSMSSender_SignUp') {
        const { userAttributes: { phone_number: phone, email } } = event.request

        await signUpSendMessage(
            event.request.code,
            email,
            phone
        )
    }
    return event
}