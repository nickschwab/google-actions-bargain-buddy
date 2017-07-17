# Bargain Buddy Action for Google Assistant
This "Bargain Buddy" Google Action allows you to get the current daily deal from woot.com (and all Woot sub-sites) and meh.com within Google Assistant.

# Using Bargain Buddy
- Open Google Assistant on your Android phone
- Say `Ask Bargain Buddy for the Woot`

# Creating your own Bargain Buddy Action
- Fork the repo
- Create a new [Google Action](https://console.actions.google.com)
- Create a [Firebase Project](https://console.firebase.google.com)
- Install the Firebase CLI
`npm install -g firebase-tools`
- Login to the Firebase CLI
`firebase login`
- Initialize your clone with your Firebase Project
`firebase init`
- Get API keys from [Woot](https://woot.com) and [Meh](https://meh.com)
- Configure your Firebase Cloud Function to use your API keys:
`firebase functions:config:set meh.key="PUT_MEH_KEY_HERE" woot.key="PUT_WOOT_KEY_HERE"`
- Deploy your Firebase Cloud Function
`firebase deploy`
- Set the Webhook `URL` in the `Fulfillment` tab of your [API.ai](https://console.api.ai) project to the URL of your Firebase Cloud Function.
- Add a `merchant` entity to your associated [API.ai](https://console.api.ai) project with the following reference values: `woot` `meh` `home woot` `electronics woot` `computers woot` `tools woot` `sports woot` `accessories woot` `kids woot` `shirt woot` `wine woot` `sellout woot`. You may associate synonyms with each, if you wish.
- Add a `Merchant Deal` intent and populate it with user phrases such as `what's the meh`. Set the intent action to `input.deal` and check the `Use webhook` option in the `Fulfillment` section.
- Make sure you've saved all your settings, then try typing `open bargain buddy` in the Google Actions Simulator!

![Bargain Buddy Logo](https://raw.githubusercontent.com/nickschwab/google-actions-bargain-buddy/master/logo/large_512x512.png)
