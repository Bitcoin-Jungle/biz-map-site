const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const axios = require("axios")

exports.handler = async function (event, context) {
  let inputData

  try {
    inputData = JSON.parse(event.body)
  } catch(err) {
    return getError(400, 'POST Body must be JSON')
  }

  if(!inputData.name) {
    return getError(400, 'Name is required')
  }

  if(!parseFloat(inputData.coordinates.latitude)) {
    return getError(400, 'Invalid Latitude Coordinates')
  }

  if(!parseFloat(inputData.coordinates.longitude)) {
    return getError(400, 'Invalid Longitude Coordinates')
  }

  if(!inputData.categories.length) {
    return getError(400, 'At least one cateogry is required')
  }

  const postData = { 
    data: {
      approved: false,
      Name: inputData.name,
      Location: {
        coordinates: {
          lat: inputData.coordinates.latitude,
          lng: inputData.coordinates.longitude,
        }
      },
      categories: inputData.categories,
      Phone: inputData.phone,
      Website: inputData.website,
      Description: inputData.description,
      publishedAt: null,
    },
  }

  const res = await axios({
    "method": "POST",
    "url": "https://maps-api.bitcoinjungle.app/api/businesses",
    "headers": {
      "Authorization": `Bearer ${process.env.STRAPI_API_KEY}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    "data": postData,
  })

  const newId = res.data.data.id

  let html = `Please click <a href="https://maps.bitcoinjungle.app/api/approve?id=${newId}&key=${process.env.APPROVE_KEY}">here</a> to approve the new map pin submitted by a user.`
  html += '<ul>'
  html += `<li>ID: ${newId}</li>`
  html += `<li>Name: ${postData.data.Name}</li>`
  html += `<li>Latitude: ${postData.data.Location.coordinates.lat}</li>`
  html += `<li>Longitude: ${postData.data.Location.coordinates.lng}</li>`
  html += `<li>Phone: ${postData.data.Phone}</li>`
  html += `<li>Website: ${postData.data.Website}</li>`
  html += `<li>Description: ${postData.data.Description}</li>`
  html += '</ul>'

  const msg = {
    to: 'mapadd@bitcoinjungle.app',
    from: 'noreply@bitcoinjungle.app',
    subject: 'New Map Item Pending Approval',
    html: html,
  }

  return sgMail.send(msg)
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.stringify({success: true}),
      }
    })
    .catch((error) => {
      console.error(error)

      return {
        statusCode: 200,
        body: JSON.stringify({success: true}),
      }
    })
}

const getError = (code, error) => {return {statusCode: code, body: JSON.stringify({error})}}