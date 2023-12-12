const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const axios = require("axios")

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
}

exports.handler = async function (event, context) {
  let inputData, html

  try {
    inputData = JSON.parse(event.body)
  } catch(err) {
    return getError(200, 'POST Body must be JSON')
  }

  if(!inputData.id) {
    return getError(400, 'ID is required')
  }

  if(!inputData.description) {
    return getError(400, 'Report description is required')
  }

  const res = await axios({
    "method": "PUT",
    "url": `https://maps-api.bitcoinjungle.app/api/businesses/${inputData.id}`,
    "headers": {
      "Authorization": `Bearer ${process.env.STRAPI_API_KEY}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    "data": {
      data: {
        publishedAt: null,
      }
    },
  })

  html = `A user has reported an issue with a map item.<br><br>`
  html += `Location ID: ${inputData.id}<br><br>`
  html += `Problem description: ${inputData.description}<br><br>`
  html += `This map item has been temporarily disabled. Please visit <a href="${process.env.URL_TO_VISIT}${inputData.id}">Maps Admin</a> to reactivate or delete the pin.`

  const msg = {
    to: 'mapadd@bitcoinjungle.app',
    from: 'noreply@bitcoinjungle.app',
    subject: 'New Problem Report on Map Item',
    html: html,
  }

  return sgMail.send(msg)
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.stringify({success: true}),
        headers: CORS_HEADERS,
      }
    })
    .catch((error) => {
      console.error(error)

      return {
        statusCode: 200,
        body: JSON.stringify({success: true}),
        headers: CORS_HEADERS,
      }
    })
}

const getError = (code, error) => {
  return {
    statusCode: code, 
    body: JSON.stringify({error}),
    headers: CORS_HEADERS,
  }
}