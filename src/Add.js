import { useState } from 'react'
import Select from 'react-select'

import Modal from "./Modal"

function Add({localized, categories, newPinCoordinates, handleCancel}) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [selectedCategories, setSelectedCategories] = useState([])
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [description, setDescription] = useState("")

  const handleAdd = async () => {
    if(loading) {
      return 
    }

    setLoading(true)

    try {
      const response = await fetch('/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          coordinates: newPinCoordinates,
          categories: selectedCategories,
          phone: phone,
          website: website,
          description: description,
        }),
      })

      const responseData = await response.json();

      if(!response.ok) {
        alert(`Error! ${responseData.error}`)
      } else {
        alert("This business has been added successfully. It will now be reviewed by an admin. Once approved, it will show on the map")
        handleCancel()
      }
    } catch(e) {
      alert(e)
    }

    setLoading(false)
  }

  return (
    <Modal>
      <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
        <div className="">
          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">{localized.addToMap}</h3>
            <div className="mt-2">
              <form className="w-full max-w-lg" id="add-form" onSubmit={handleAdd}>
                <div className="flex flex-wrap -mx-3 mb-6">
                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="name">
                      {localized.bizName}
                    </label>
                    <input onChange={(e) => { setName(e.target.value) }} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" name="name" type="text" />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="categories">
                      {localized.categories}
                    </label>
                    <Select 
                      options={
                        categories.map((cat) => {
                          return {
                            label: cat.category,
                            value: cat.id,
                          }
                        })
                      } 
                      isMulti 
                      name="categories"
                      onChange={(val) => { setSelectedCategories(val.map(el => el.value)) }} />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="phone">
                      {localized.bizPhone} ({localized.optional})
                    </label>
                    <input onChange={(e) => { setPhone(e.target.value) }} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" name="phone" type="text" />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="website">
                      {localized.bizWebsite} ({localized.optional})
                    </label>
                    <input onChange={(e) => { setWebsite(e.target.value) }} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" name="website" type="text" />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="description">
                      {localized.description} ({localized.optional})
                    </label>
                    <textarea onChange={(e) => { setDescription(e.target.value) }} className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" name="description" type="text" />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
        {loading &&
          <div role="status">
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        }
        <button type="button" disabled={loading} onClick={handleAdd} className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto">
          {localized.addToMap}
        </button>
        <button type="button" disabled={loading} onClick={handleCancel} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">{localized.cancel}</button>
      </div>
    </Modal>
  )
}

export default Add