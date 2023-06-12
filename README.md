# Cognito Message Sender Lambda

Customize send sms or email via twilio and smtp protocol.

## 1. Create key
- Go to aws console Key Management Service > Customer managed keys > Create key
    - Key type: Symmetric
    - Key usage: Encrypt and decrypt

- After successfully add policy template replace "<aws-account-id>" by your aws account id.

<pre><code>
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "cognito-idp.amazonaws.com",
                "AWS": "arn:aws:iam::<aws-account-id>:root"
            },
            "Action": "kms:*",
            "Resource": "*"
        }
    ]
}
</code></pre>

- After key created copy of Alias ​​and ARN of the key.

## 2. Create IAM Role
Go to IAM > Roles > Create Role "If not exist any role allow read Key Management Service"

- Trusted entity type: AWS service.
- Use case: Lambda.
- Attach the policy to be sure to have the right to read the key.

## 3. Create and setting lambda function 
- Go to aws console Lambda > Functions > Create function.
- Change default execution role > Use an existing role > Select role include read Key Management Service.
- Add environment variables.

| Name          | Describe      |
| ------------- | ------------- |
| KEY_ALIAS     | Key Alias     |
| KEY_ARN       | Key arn       |
| MAIL_ADDRESS  | Email         |
| MAIL_PASSWORD | Email app     |
| MAIL_SERVICE  | Name service  |
| TWILIO_PHONE  | Phone         |
| TWILIO_SID    | SID           |
| TWILIO_TOKEN  | Token         |
 
- Disable verifying attribute changes.
- Go to AWS CLI: 
    - Replace user-pool-id, lambda-arn and key-arn

    <pre><code>
        aws lambda add-permission --function-name lambda_arn --statement-id "CognitoLambdaInvokeAccess" --action lambda:InvokeFunction --principal cognito-idp.amazonaws.com
    </code></pre>

    - Replace user-pool-id, lambda-arn and key-arn

    <pre><code>
        aws cognito-idp update-user-pool --user-pool-id=user-pool-id --lambda-config "CustomSMSSender={LambdaVersion=V1_0,LambdaArn=arn:aws:lambda:lambda-arn}, CustomEmailSender={LambdaVersion=V1_0,LambdaArn=arn:aws:lambda:lambda-arn}, KMSKeyID=key-arn"
    </code></pre>


