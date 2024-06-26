const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const axios = require("axios")

const es = [
  {
      "id": 13,
      "category": "Actividades Turísticas"
  },
  {
      "id": 22,
      "category": "Cafés"
  },
  {
      "id": 18,
      "category": "Hoteles y Hospedaje"
  },
  {
      "id": 28,
      "category": "Lavacarros "
  },
  {
      "id": 20,
      "category": "Postres y Dulces"
  },
  {
      "id": 17,
      "category": "Productos Orgánicos"
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
      "id": 30,
      "category": "Servicios Legales"
  },
  {
      "id": 32,
      "category": "Servicios",
  },
  {
      "id": 14,
      "category": "Surfear"
  },
  {
      "id": 26,
      "category": "Tienda de viveros y jardinería"
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
        "id": 27,
        "category": "Car wash "
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
        "id": 29,
        "category": "Legal Services"
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
        "id": 25,
        "category": "Nursery and Garden Center"
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
        "id": 31,
        "category": "Services",
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

  if(newCategories.indexOf(25) !== -1) {
    newCategories.push(26)
  }

  if(newCategories.indexOf(27) !== -1) {
    newCategories.push(28)
  }

  if(newCategories.indexOf(29) !== -1) {
    newCategories.push(30)
  }

  if(newCategories.indexOf(31) !== -1) {
    newCategories.push(32)
  }

  if(newCategories.indexOf(22) !== -1) {
    newCategories.push(6)
  }

  if(newCategories.indexOf(21) !== -1) {
    newCategories.push(9)
  }

  if(newCategories.indexOf(20) !== -1) {
    newCategories.push(11)
  }

  if(newCategories.indexOf(19) !== -1) {
    newCategories.push(10)
  }

  if(newCategories.indexOf(18) !== -1) {
    newCategories.push(1)
  }

  if(newCategories.indexOf(17) !== -1) {
    newCategories.push(12)
  }

  if(newCategories.indexOf(16) !== -1) {
    newCategories.push(2)
  }

  if(newCategories.indexOf(15) !== -1) {
    newCategories.push(3)
  }

  if(newCategories.indexOf(14) !== -1) {
    newCategories.push(4)
  }

  if(newCategories.indexOf(13) !== -1) {
    newCategories.push(5)
  }

  if(newCategories.indexOf(8) !== -1) {
    newCategories.push(7)
  }

  if(newCategories.indexOf(26) !== -1) {
    newCategories.push(25)
  }

  if(newCategories.indexOf(28) !== -1) {
    newCategories.push(27)
  }

  if(newCategories.indexOf(30) !== -1) {
    newCategories.push(29)
  }

  if(newCategories.indexOf(32) !== -1) {
    newCategories.push(31)
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
  html += `<li>Categories: ${finalCategories.map((categoryId => {
    const enCat = categories.en.find((el) => el.id == categoryId)

    if(enCat) {
      return enCat.category
    }

    const esCat = categories.es.find((el) => el.id == categoryId)

    if(esCat) {
      return esCat.category
    }

    return ''
  })).join(', ')}`
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