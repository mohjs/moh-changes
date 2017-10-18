const inquirer = require('inquirer')
const Preferences = require('preferences')

const prefs = new Preferences('moh-changes')

exports.login = () => new Promise((resolve, reject) => {
  inquirer.prompt([
    {
      name: 'username',
      type: 'input',
      message: 'Enter your Github username or e-mail address:',
      validate: value => value.length ? true : 'Please enter your username or e-mail address'
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
      validate: value => value.length ? true : 'Please enter your password'
    }
  ]).then(resolve)
  .catch(reject)
})
