const firebaseApp = require("firebase/app")
const initializeApp = firebaseApp.initializeApp

const firestore = require("firebase/firestore")
const { getFirestore, collection, addDoc, GeoPoint } = firestore

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const firebaseConfig = {
  apiKey: "AIzaSyDKlGhb8voPdKxCfEI-7KC6zj9PoU7itUo",
  authDomain: "bitcoin-jungle-maps.firebaseapp.com",
  projectId: "bitcoin-jungle-maps",
  storageBucket: "bitcoin-jungle-maps.appspot.com",
  messagingSenderId: "962016469889",
  appId: "1:962016469889:web:f331a8687c201f86f4fe80"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

exports.handler = async function (event, context) {
  let inputData
  let geoPoint

  try {
    inputData = JSON.parse(event.body)
  } catch(err) {
    return getError(400, 'POST Body must be JSON')
  }

  if(!inputData.name) {
    return getError(400, 'Name is required')
  }

  if(!parseFloat(inputData.latitude)) {
    return getError(400, 'Invalid Latitude Coordinates')
  }

  if(!parseFloat(inputData.longitude)) {
    return getError(400, 'Invalid Longitude Coordinates')
  }

  try {
    geoPoint = new GeoPoint(inputData.latitude, inputData.longitude)
  } catch(err) {
    return getError(400, 'Invalid Coordinates')
  }

  if(!inputData.acceptsOnChain && !inputData.acceptsLightning && !inputData.acceptsLiquid) {
    return getError(400, 'Please select at least one accepted coin')
  }

  const locationData = {
    approved: false,
    name: inputData.name,
    acceptsOnChain: !!inputData.acceptsOnChain,
    acceptsLightning: !!inputData.acceptsLightning,
    acceptsLiquid: !!inputData.acceptsLiquid,
    latLong: geoPoint,
  }

  const docRef = await addDoc(collection(db, "locations"), locationData)

  const msg = {
    to: 'mapadd@bitcoinjungle.app',
    from: 'noreply@bitcoinjungle.app',
    subject: 'New Map Item Pending Approval',
    html: 'Please visit <a href="' + process.env.URL_TO_VISIT + '">Cloud Firestore</a> to approve the new map pin submitted by a user (Name: ' + locationData.name + ').',
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