const firebaseApp = require("firebase/app")
const initializeApp = firebaseApp.initializeApp

const firestore = require("firebase/firestore")
const { getFirestore, doc, updateDoc } = firestore

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
  const id = event.queryStringParameters.id

  if(!id) {
    return getError(400, 'ID is required')
  }

  try {
    const docRef = doc(db, "locations", id)

    if(!docRef) {
      return getError(400, 'document not found')
    }
 
    const res = await updateDoc(docRef, {approved: true});

    return {
      statusCode: 200,
      body: JSON.stringify({success: true}),
    }
  } catch(e) {
    console.log(e)
    return getError(400, 'error updating document')
  }
}

const getError = (code, error) => {return {statusCode: code, body: JSON.stringify({error})}}