This is a personal mini project to calculate your monthly working rate based on yours worked tracked by Harvest.

It has an integration with Telegram in order that you can check your worked hours on a bot's chat.
If you send the command `/estimate` it will return your billing hours.

## Getting Started

- Clone this repo and run `yarn install`
- Create a file named `.env` based on the file `.env.example`
- Fill the environment variables with your values
- Run the script with `node index.js`, or with `yarn run start` if you want to listen for changes

## Dependencies
In order to run properly this script you will need:
- Nodejs
- Yarn
- Nodemon (not mandatory)

This [article](https://www.siteguarding.com/en/how-to-get-telegram-bot-api-token) could be useful to setup an initialize a Bot in Telegram.
