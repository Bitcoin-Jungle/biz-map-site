const firebaseApp = require("firebase/app")
const initializeApp = firebaseApp.initializeApp

const firestore = require("firebase/firestore")
const { getFirestore, collection, doc, getDoc, addDoc, GeoPoint, updateDoc } = firestore

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
  let inputData, html

  try {
    inputData = JSON.parse(event.body)
  } catch(err) {
    return getError(400, 'POST Body must be JSON')
  }

  if(!inputData.id) {
    return getError(400, 'ID is required')
  }

  if(!inputData.description) {
    return getError(400, 'Report description is required')
  }

  const docRef = doc(db, "locations", inputData.id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return getError(400, 'Document not found. Check the ID and try again')
  }

  const docData = docSnap.data()

  const res = await updateDoc(docRef, {
    approved: false
  })

  html = `A user has reported an issue with a map item.<br><br>`
  html += `Location ID: ${inputData.id}<br><br>`
  html += `Location Name: ${docData.name}<br><br>`
  html += `Problem description: ${inputData.description}<br><br>`
  html += `This map item has been temporarily disabled. Please visit <a href="${process.env.URL_TO_VISIT}">Cloud Firestore</a> to reactivate or delete the pin.`

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
        headers: {
          "Access-Control-Allow-Origin": "*",
        }
      }
    })
    .catch((error) => {
      console.error(error)

      return {
        statusCode: 200,
        body: JSON.stringify({success: true}),
        headers: {
          "Access-Control-Allow-Origin": "*",
        }
      }
    })
}

const getError = (code, error) => {
  return {
    statusCode: code, 
    body: JSON.stringify({error}),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  }
}