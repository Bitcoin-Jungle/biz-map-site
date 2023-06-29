import 'babel-polyfill'
import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore/lite'

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

const modal = document.querySelector('#modalContainer')
const closeBtn = document.querySelector('.close')
const form = document.querySelector('#report-form')
const submitButtonEl = document.getElementById('submit-button')

const showModal = (el) => {
    const modalHeader = document.querySelector('.modal-header h2')

    modalHeader.innerText = `Problem at ${el.mapInfo.title}`

    const modalBody = document.querySelector('.modal-body p')

    modalBody.innerText = `Please describe the problem you experienced at ${el.mapInfo.title} so that we can investigate and take action.`

    const idInput = document.querySelector('#problem-report-id')
    idInput.value = el.id

    modal.style.display = "block"
}

const closeModal = () => {
    modal.style.display = "none"
}

closeBtn.onclick = () => {
    closeModal()
}

form.addEventListener('submit', async (e) => {
    e.preventDefault()

    submitButtonEl.style.display = "none"

    const formData = new FormData(form);
    let postData = {}

    for(var pair of formData.entries()) {
        postData[pair[0]] = pair[1]
    }

    try {
        const response = await fetch('/api/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        })

        const responseData = await response.json();

        submitButtonEl.style.display = "block"

        if(!response.ok) {
            alert(`Error! ${responseData.error}`)
        } else {
            alert("Thank you for the report. We will investigate and take action soon.")
        
            form.reset()

            closeModal()
        }
    } catch(e) {
        alert(e)
        submitButtonEl.style.display = "block"
        return false
    }
})

const getUserProvidedLocations = async () => {
    const locationsCol = collection(db, 'locations')
    const q = query(locationsCol, where("approved", "==", true))
    const locationSnapshot = await getDocs(q)
    const locationList = locationSnapshot.docs.map(doc => {
        const data = doc.data()

        return {
            id: doc.id,
            username: data.bitcoinJungleUsername,
            acceptsLightning: data.acceptsLightning,
            acceptsOnChain: data.acceptsOnChain,
            acceptsLiquid: data.acceptsLiquid,
            mapInfo: {
                title: data.name,
                coordinates: {
                    latitude: data.latLong._lat,
                    longitude: data.latLong._long,
                }
            }
        }
    })
 
    addMapPins(locationList)
}

const getMigratedMapPins = async () => {
    const locationsCol = collection(db, 'locations')
    const q = query(locationsCol, where("migratedFromApp", "==", true))
    const locationSnapshot = await getDocs(q)
    const locationList = locationSnapshot.docs.map(doc => {
        const data = doc.data()

        return {
            id: doc.id,
            username: data.bitcoinJungleUsername,
            acceptsLightning: data.acceptsLightning,
            acceptsOnChain: data.acceptsOnChain,
            acceptsLiquid: data.acceptsLiquid,
            mapInfo: {
                title: data.name,
                coordinates: {
                    latitude: data.latLong._lat,
                    longitude: data.latLong._long,
                }
            }
        }
    })
 
    addMapPins(locationList)
}

const addMapPins = (pins) => {
    const markerAnnotations = pins.map((el) => {

        const calloutDelegate = {
            calloutContentForAnnotation: function() {
                var element = document.createElement("div");
                element.className = "review-callout-content";
                var title = element.appendChild(document.createElement("h1"));
                title.textContent = el.mapInfo.title;
                
                if(el.acceptsOnChain) {
                    var img = element.appendChild(document.createElement("img"));
                    img.src = "https://storage.googleapis.com/bitcoin-jungle-maps-images/onchain.png"
                    img.width = 20
                    img.style.display = "inline"
                }

                if(el.acceptsLightning) {
                    var img = element.appendChild(document.createElement("img"));
                    img.src = "https://storage.googleapis.com/bitcoin-jungle-maps-images/lightning.png"
                    img.width = 20
                    img.style.display = "inline"
                }

                if(el.acceptsLiquid) {
                    var img = element.appendChild(document.createElement("img"));
                    img.src = "https://storage.googleapis.com/bitcoin-jungle-maps-images/liquid.png"
                    img.width = 20
                    img.style.display = "inline"
                }

                var problemContainer = element.appendChild(document.createElement("div"))

                problemContainer.className = "problem-container"

                var problemIcon = problemContainer.appendChild(document.createElement("a"))

                problemIcon.appendChild(document.createTextNode("Report"))
                problemIcon.href = "#"
                problemIcon.className = "report-problem"
                problemIcon.onclick = () => {
                    showModal(el)
                }

                return element;
            },
            calloutRightAccessoryForAnnotation: function() {
                if(el.username) {
                    const accessoryViewRight = document.createElement("a");
                    accessoryViewRight.className = "right-accessory-view";
                    accessoryViewRight.href = "https://pay.bitcoinjungle.app/" + el.username;
                    accessoryViewRight.target = "_blank";
                    accessoryViewRight.appendChild(document.createTextNode("➡"));

                    return accessoryViewRight;
                } else {
                    const accessoryViewRight = document.createElement("a");
                    accessoryViewRight.className = "right-accessory-view";
                    accessoryViewRight.href = "#";

                    return accessoryViewRight;
                }
            }
        }


        const coordinate = new mapkit.Coordinate(el.mapInfo.coordinates.latitude, el.mapInfo.coordinates.longitude)

        let annotationObj = {
            title: el.mapInfo.title,
            callout: calloutDelegate,
            titleVisibility: mapkit.FeatureVisibility.Hidden,
        }

        if(!el.username) {
            annotationObj.color = "purple"
        }

        return new mapkit.MarkerAnnotation(coordinate, annotationObj)
    })

    map.addAnnotations(markerAnnotations)
}

mapkit.init({
    authorizationCallback: function (done) {
        fetch("/api/token")
        .then((res) => res.text())
        .then(done)
        .then(getMigratedMapPins)
        .then(getUserProvidedLocations)
    },
    language: navigator.language || navigator.userLanguage,
})

const center = new mapkit.Coordinate(9.1549238, -83.7570566)
const map = new mapkit.Map("apple-maps", {
    center,
    cameraDistance: 50000,
    showsPointsOfInterest: false,
})

map.addEventListener('zoom-end', (evt) => {
    const map = mapkit.maps[0]
    const curentCameraDistance = map.cameraDistance.toFixed(0)

    if(curentCameraDistance < 10000) {
        map.annotations = map.annotations.map((el) => {
            el.titleVisibility = mapkit.FeatureVisibility.Visible

            return el
        })
    } else {
        map.annotations = map.annotations.map((el) => {
            el.titleVisibility = mapkit.FeatureVisibility.Hidden

            return el
        })
    }
})