const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const axios = require("axios")

const es = [
  {
      "id": 13,
      "category": "Actividades TurÃ­sticas"
  },
  {
      "id": 22,
      "category": "CafÃ©s"
  },
  {
      "id": 18,
      "category": "Hoteles y Hospedaje"
  },
  {
      "id": 20,
      "category": "Postres y Dulces"
  },
  {
      "id": 17,
      "category": "Productos OrgÃ¡nicos"
  },
  {
      "id": 16,
      "category": "Restaurantes"
  },
  {
      "id": 19,
      "category": "Salud & Bienestar"
  },
  {
      "id": 21,
      "category": "Servicios Express"
  },
  {
      "id": 14,
      "category": "Surfear"
  },
  {
      "id": 15,
      "category": "Tiendas"
  },
  {
      "id": 8,
      "category": "Transporte"
  }
]

const en = [
    {
        "id": 6,
        "category": "Cafe"
    },
    {
        "id": 9,
        "category": "Delivery"
    },
    {
        "id": 11,
        "category": "Desserts & Sweets"
    },
    {
        "id": 10,
        "category": "Health & Wellness"
    },
    {
        "id": 1,
        "category": "Hotel & Accomodations"
    },
    {
        "id": 12,
        "category": "Organic Products"
    },
    {
        "id": 2,
        "category": "Restaurant"
    },
    {
        "id": 3,
        "category": "Retail"
    },
    {
        "id": 4,
        "category": "Surfing"
    },
    {
        "id": 5,
        "category": "Tourism Activities"
    },
    {
        "id": 7,
        "category": "Transportation"
    }
]

const categories = {
    es,
    en,
}

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

  const newCategories = [...inputData.categories]

  if(newCategories.indexOf(6) !== -1) {
    newCategories.push(22)
  }

  if(newCategories.indexOf(9) !== -1) {
    newCategories.push(21)
  }

  if(newCategories.indexOf(11) !== -1) {
    newCategories.push(20)
  }

  if(newCategories.indexOf(10) !== -1) {
    newCategories.push(19)
  }

  if(newCategories.indexOf(1) !== -1) {
    newCategories.push(18)
  }

  if(newCategories.indexOf(12) !== -1) {
    newCategories.push(17)
  }

  if(newCategories.indexOf(2) !== -1) {
    newCategories.push(16)
  }

  if(newCategories.indexOf(3) !== -1) {
    newCategories.push(15)
  }

  if(newCategories.indexOf(4) !== -1) {
    newCategories.push(14)
  }

  if(newCategories.indexOf(5) !== -1) {
    newCategories.push(13)
  }

  if(newCategories.indexOf(7) !== -1) {
    newCategories.push(8)
  }

  const finalCategories = [...new Set(newCategories)]

  console.log(finalCategories)

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
      categories: finalCategories,
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