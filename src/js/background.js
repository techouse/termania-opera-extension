/**
 * Install the database if needed
 */
import { DEFAULT_DICTIONARY_ID } from "@/services/constants"

chrome.runtime.onInstalled.addListener(() => {
    import(/* webpackChunkName: "services" */ "@/services").then(({ getDictionaries }) => {
        getDictionaries()
            .then(() => {
                import(/* webpackChunkName: "dictionary" */ "@/models/Dictionary").then(({ default: Dictionary }) => {
                    Dictionary.getActive()
                              .catch(() => {
                                  chrome.storage.local.get("dictionaries", ({ dictionaries }) => Dictionary.setActive(dictionaries.dictionaries.find((dict) => dict.id === DEFAULT_DICTIONARY_ID)))
                              })
                })
            })
    })

    import(/* webpackChunkName: "install" */ "@/install").then(({ isOutdated, default: install }) => {
        isOutdated()
            .then(() => {
                console.log("Database is outdated or does not exist!")
                install()
            })
            .catch((error) => {
                console.log(error.message)
            })
    })

    import(/* webpackChunkName: "context" */ "@/context").then(({ createContextMenu }) => {
        createContextMenu()
    })
})

/**
 * Add the context menu
 */
import(/* webpackChunkName: "context" */ "@/context").then(({ default: context }) => {
    context()
})
