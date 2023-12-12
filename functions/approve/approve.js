const axios = require("axios")

exports.handler = async function (event, context) {
  const id = event.queryStringParameters.id
  const key = event.queryStringParameters.key

  if(!key) {
    return getError(400, 'Key is required')
  }

  if(key !== process.env.APPROVE_KEY) {
    return getError(400, 'Invalid key')
  }

  if(!id) {
    return getError(400, 'ID is required')
  }

  const res = await axios({
    "method": "PUT",
    "url": `https://maps-api.bitcoinjungle.app/api/businesses/${id}`,
    "headers": {
      "Authorization": `Bearer ${process.env.STRAPI_API_KEY}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    "data": {
      data: {
        publishedAt: new Date().toISOString(),
      }
    },
  })

  return {
    statusCode: 200,
    body: JSON.stringify({success: true, message: "This business has now been approved and is visible on the map."}),
  }
}

const getError = (code, error) => {return {statusCode: code, body: JSON.stringify({error})}}