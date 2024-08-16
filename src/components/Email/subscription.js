function generateSubscriptionContent(){
 return `
 <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Netflix Membership Expired</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd; padding: 20px;">
        <h2 style="color: #000; text-align: center;">Your Movies Omdbi Membership has Expired</h2>
        <div style="text-align: center;">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRT_bXIwR1CupP12GVQpMOfNPJpKVxwNU56I7jn-sNg9gKzSqzH6AVT8vzWnoCl5nUEfCo&usqp=CAU" alt="Omdb Logo" style="width: 100px; margin-bottom: 20px;">
            <h3 style="color: #e50914; font-size: 24px; margin: 0;">Your membership has expired!</h3>
            <p style="color: #333333; font-size: 16px; margin-top: 10px;">Dear customer,</p>
            <p style="color: #333333; font-size: 16px;">Your membership has expired.</p>
            <p style="color: #333333; font-size: 16px;">But, as part of our loyalty program, you can now extend for 90 days for free.</p>
            <p style="color: #333333; font-size: 16px;">Enjoy unlimited movies, TV shows, and more. Ready to watch? Extend your membership.</p>
            <a href="#" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; margin-top: 20px;">Extend for Free</a>
        </div>
        <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 20px;">* After signing up, you have to insert your credit card details for validation of your Netflix ID. We will not withdraw any amount.</p>
        <p style="color: #999999; font-size: 12px; text-align: center;">Copyright © 2023 All rights reserved.</p>
        <p style="color: #999999; font-size: 12px; text-align: center;">This is an advertisement. If you no longer wish to receive promotional messages from this advertiser, please <a href="#" style="color: #007bff; text-decoration: none;">unsubscribe here</a>.</p>
    </div>
</body>
</html>

 `




}

module.exports = { generateSubscriptionContent };
