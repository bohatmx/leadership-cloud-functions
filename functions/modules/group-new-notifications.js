const functions = require('firebase-functions')
// const config = require('./config.js')
var nodemailer = require('nodemailer2')
var async = require('async')

// ------------------
// send an email to all users add to group
exports.groupNewNotification = functions.database
  .ref('/group-new-notification/{groupDetails}')
  .onCreate((snap, context) => {
    const groupDetails = snap.val()
    const results = []
    let queue = null

    // if url not Live return
    // if (config.environment === 1) {
    //   return
    // }

    console.log('list of users', groupDetails)

    // format html of email: add name, surname

    // ------------------
    // Configure mailer
    const transporter = nodemailer.createTransport({
      pool: true,
      host: 'comms.thinklead.co.za',
      port: 465,
      secure: true,
      auth: {
        user: 'thinklead@comms.thinklead.co.za',
        pass: 'wR3(7FPMQvUwa-u&'
      },
      tls: {
        rejectUnauthorized: false
      },
      maxConnections: 10,
      maxMessages: 100
    })

    // ------------------
    // Send email to list of Users
    function processQueue (user, callback) {
      transporter.sendMail({
        from: 'Global Leadership Platform <thinklead@comms.thinklead.co.za>',
        to: '' + user.to,
        bcc: '' + 'denver@oneconnect.co.za',
        subject: 'Welcome to ' + groupDetails.name,
        text: 'Welcome to ' + groupDetails.name,
        html: 'Welcome to ' + groupDetails.name
      }, (result, info) => {
        console.log('sending email', result)
        results.push(user.to)
        return callback()
      })
    }

    // ------------------
    queue = async.queue(processQueue, 100)

    // ------------------
    queue.drain = () => {
      console.log('total results emails sent', results)
    }

    // ------------------
    queue.push(groupDetails.listOfUsers, () => {
      console.log('completed adding users to queue')
    })

    return snap.ref.remove()
  })
