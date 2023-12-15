const axios = require("axios")

const esCats = [
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

const enCats = [
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

const main = async () => {
	const locationsData = await axios({
	    method: "GET",
	    url: "https://maps-api.bitcoinjungle.app/api/businesses",
	    params: {
	      locale: "en",
	      pagination: {
	        pageSize: 10000,
	      },
	      populate: ["categories"],
	    },
	    headers: {
	      "Authorization": `Bearer ${strapi_api_key}`
	    }
	})

	for (var i = locationsData.data.data.length - 1; i >= 0; i--) {
		const item = locationsData.data.data[i]

		const newCategories = (item.attributes.categories ? [...item.attributes.categories.data.map(el =>  el.id)] : [])

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

		const categories = [...new Set(newCategories)]

		console.log(item.id, categories)

		const res = await axios({
		    "method": "PUT",
		    "url": `https://maps-api.bitcoinjungle.app/api/businesses/${item.id}`,
		    "headers": {
		      "Authorization": `Bearer ${strapi_api_key}`,
		      "Content-Type": "application/json; charset=utf-8"
		    },
		    "data": {
		      data: {
		        categories,
		      }
		    },
		})

		console.log(res.status)
	}
}

main()