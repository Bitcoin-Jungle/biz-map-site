const axios = require("axios")

const strapi_api_key = process.env.STRAPI_API_KEY

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