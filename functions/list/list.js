const axios = require("axios")

const getLocale = (locale) => {
  if(!locale) {
    return "en"
  }

  if(locale.indexOf('en') === 0) {
    return "en"
  }

  if(locale.indexOf('es') === 0) {
    return "es-CR"
  }

  return "en"
}

exports.handler = async function (event, context) {
  let locale = getLocale(event.queryStringParameters.locale)

  const categoriesData = await axios({
    method: "GET",
    url: `https://maps-api.bitcoinjungle.app/api/categories`,
    params: {
      locale,
      pagination: {
        pageSize: 100,
      }
    },
    headers: {
      "Authorization": `Bearer ${process.env.STRAPI_API_KEY}`
    }
  })
  
  const locationsData = await axios({
    method: "GET",
    url: "https://maps-api.bitcoinjungle.app/api/businesses",
    params: {
      locale,
      pagination: {
        pageSize: 10000,
      },
      populate: ["categories"],
    },
    headers: {
      "Authorization": `Bearer ${process.env.STRAPI_API_KEY}`
    }
  })

  const output = {
    locations: locationsData.data.data.map((el) => {
      return {
        id: el.id,
        name: el.attributes.Name,
        coordinates: {
          latitude: el.attributes.Location.coordinates.lat,
          longitude: el.attributes.Location.coordinates.lng,
        },
        phone: el.attributes.Phone,
        website: el.attributes.Website,
        description: el.attributes.Description,
        categories: el.attributes.categories.data.map((cat) => {
          return {
            id: cat.id,
            name: cat.attributes.category,
          }
        }),
      }
    }),
    categories: categoriesData.data.data.map((el) => {
      return {
        id: el.id,
        category: el.attributes.category,
      }
    })
    .sort((a, b) => (a.category > b.category) ? 1 : ((b.category > a.category) ? -1 : 0)),
  }

  return {
    statusCode: 200,
    body: JSON.stringify(output),
  }
}