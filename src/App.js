import { useState, useEffect, useLayoutEffect } from 'react'
import { Map, Marker, FeatureVisibility } from 'mapkit-react'

import Add from "./Add"
import Report from "./Report"

import { getLanguage, isFromBJ } from "./utils"
import { localizeText } from "./lang"

import './App.css'

const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

function App() {
  const [width, height] = useWindowSize()
  const [token, setToken] = useState("")
  const [region, setRegion] = useState({
    centerLatitude: 9.1549238,
    centerLongitude: -83.7570566,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  })

  const [categories, setCategories] = useState([])
  const [mapData, setMapData] = useState([])

  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)

  const [addPinToMap, setAddPinToMap] = useState(false)
  const [newPinCoordinates, setNewPinCoordinates] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)

  const [reportItem, setReportItem] = useState(false)

  const [showCategories, setShowCategories] = useState(false)

  const localized = localizeText(getLanguage())

  const getToken = async () => {
    const res = await fetch("/api/token")
    const token = await res.text()

    setToken(token)
  }

  const getMapData = async () => {
    const res = await fetch(`/api/list?locale=${getLanguage()}`)
    const data = await res.json()

    setCategories(data.categories)

    setMapData(data.locations)
  }

  const handleRegionChange = (region) => {
    setRegion(region)
  }

  const selectItem = (id) => {
    const item = mapData.find((el) => el.id === id)
    setSelectedItem(item)
  }

  const selectCategory = (id) => {
    const newCategories = [...selectedCategories]

    if(newCategories.indexOf(id) !== -1) {
      newCategories.splice(newCategories.indexOf(id), 1)
    } else {
      newCategories.push(id)
    }

    setSelectedCategories(newCategories)
  }

  const diff = (arr, arr2) => {
    const ret = []
    arr.sort()
    arr2.sort()
    for(let i = 0; i < arr.length; i += 1) {
      if(arr2.indexOf(arr[i]) > -1) {
        ret.push(arr[i])
      }
    }
    return ret
  }

  const shouldRenderMapItem = (item) => {
    if(!selectedCategories.length) {
      return true
    }

    const catIds = item.categories.map((cat) => cat.id)
    const shouldInclude = diff(catIds, selectedCategories)

    if(shouldInclude.length) {
      return true
    }

    if(!catIds.length && selectedCategories.indexOf(null) !== -1) {
      return true
    }

    return false
  }

  const handleNewPin = (obj) => {
    if(addPinToMap) {
      setNewPinCoordinates(obj.toCoordinates())
      setShowAddModal(true)
    } else {
      setShowCategories(false)
    }
  }

  useEffect(() => {
    getToken()
  }, [])

  useEffect(() => {
    if(selectedItem && !shouldRenderMapItem(selectedItem)) {
      setSelectedItem(null)
    }
  }, [selectedCategories])

  return (
    <div id="App">
      <div id="header">
        {!isFromBJ() &&
          <header>
            <a href="https://bitcoinjungle.app" target="_blank">
              <img src="https://storage.googleapis.com/bitcoin-jungle-branding/logo/web/logo-web.png" />
              <span>{localized.title}</span>
            </a>
          </header>
        }
        {categories.length > 0 && (showCategories || width > 700) ?
          <div id="categories">
            {showCategories &&
              <a onClick={() => { setShowCategories(false) }}>X</a>
            }
            <ul className="w-48 text-sm text-gray-900 rounded-lg">
              {categories.map((el) => {
                return (
                  <li 
                    key={el.id} 
                    onClick={() => { selectCategory(el.id) } }
                    className={`w-full text-gray-900 px-4 py-2 border-b border-gray-400 ${(selectedCategories.indexOf(el.id) !== -1 ? 'bg-orange-300' : '')}`}
                  >
                    {el.category}
                  </li>
                )
              })}
              <li
                onClick={() => { selectCategory(null) }}
                className={`w-full text-gray-900 px-4 py-2 border-b border-gray-400 ${(selectedCategories.indexOf(null) !== -1 ? 'bg-orange-300' : '')}`}
              >
                {localized.uncategorized}
              </li>
            </ul>
          </div>
        : 
          <div id="categoriesSlider">
            <a onClick={() => { setShowCategories(true) }}>&gt;</a>
          </div>
        }
      </div>
      
      {addPinToMap &&
        <div id="topHeader">
          <p className="text-lg font-bold">{localized.addPrompt}</p>
        </div>
      }
      <div>
        <main style={{width: "100vw", height: "100vh"}}>
          {token.length > 0 && 
            <Map 
              token={token}
              onLoad={getMapData}
              showsPointsOfInterest={false}
              onRegionChangeEnd={handleRegionChange}
              initialRegion={region}
              onClick={handleNewPin}
              showsMapTypeControl={false}
            >
              {mapData.map((el) => {
                return (
                  <Marker
                    key={el.id} 
                    latitude={el.coordinates.latitude}
                    longitude={el.coordinates.longitude}
                    title={el.name}
                    titleVisibility={region.latitudeDelta < 0.05 ? FeatureVisibility.Adaptive : FeatureVisibility.Hidden} 
                    visible={shouldRenderMapItem(el)}
                    onSelect={() => { selectItem(el.id) } }
                    onDeselect={() => { selectItem(null) } }
                  />
                )
              })}

              {newPinCoordinates && newPinCoordinates.latitude && newPinCoordinates.longitude &&
                <Marker
                  key="new"
                  latitude={newPinCoordinates.latitude}
                  longitude={newPinCoordinates.longitude}
                  title={localized.addPinTitle}
                  color="blue"
                />
              }
            </Map>
          }
        </main>
        {selectedItem &&
          <div id="details">
            <ul className="w-96 text-sm text-gray-900 rounded-lg">
              <li className="w-full text-lg text-gray-900 px-4 py-2 border-b border-gray-400">
                <b>{selectedItem.name}</b>
              </li>
              <li className="w-full text-gray-900 px-4 py-2 border-b border-gray-400">
                <b>{localized.categories} </b>
                {selectedItem.categories.filter((el) => categories.find(cat => cat.category === el.name)).map((el) => el.name).join(', ')}
              </li>
              <li className="w-full text-gray-900 px-4 py-2 border-b border-gray-400">
                <b>{localized.phone} </b>
                <a href={`tel:${selectedItem.phone}`}>
                  {selectedItem.phone}
                </a>
              </li>
              <li className="w-full text-gray-900 px-4 py-2 border-b border-gray-400">
                <b>{localized.website} </b>
                <a target="_blank" href={selectedItem.website}>
                  {selectedItem.website ? selectedItem.website.substr(0, 30) : ""}
                </a>
              </li>
              <li className="w-full text-gray-900 px-4 py-2 border-b border-gray-400">
                <b>{localized.description} </b>
                <br />
                {selectedItem.description}
              </li>
              <li className="w-full text-gray-900 px-4 py-2 border-b border-gray-400">
                <button onClick={() => {setReportItem(selectedItem)}} className="mt-3 inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm text-white font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-500 sm:mt-0 sm:w-auto">
                  {localized.report}
                </button>
              </li>
            </ul>
          </div>
        }
      </div>
      <div id="footer">
        <footer>
          {!isFromBJ() && 
            <div>
              <a href="https://apps.apple.com/us/app/bitcoin-jungle/id1600313979">
                <img src="https://pay.bitcoinjungle.app/apple-app-store.png" />
              </a>
              <a href="https://play.google.com/store/apps/details?id=app.bitcoinjungle.mobile">
                <img src="https://pay.bitcoinjungle.app/google-play-badge.png" />
              </a>
              <div style={{height: "5px"}}>&nbsp;</div>
            </div>
          }
          <button onClick={() => { setAddPinToMap(true) }} className="shadow bg-purple-500 focus:shadow-outline focus:outline-none text-white font-bold py-1 px-1 rounded">
            {localized.addToMap}
          </button>
        </footer>
      </div>

      {showAddModal &&
        <Add
          localized={localized}
          categories={categories}
          newPinCoordinates={newPinCoordinates}
          handleCancel={() => {
            setShowAddModal(!showAddModal)
            setAddPinToMap(false)
            setNewPinCoordinates({})
          }} />
      }

      {reportItem &&
        <Report
          localized={localized}
          item={reportItem}
          handleCancel={() => {
            setReportItem(false)
          }} />
      }
    </div>
  );
}

export default App;
