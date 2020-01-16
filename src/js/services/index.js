import { CACHE_IN_DAYS, DEFAULT_DICTIONARY_ID } from "./constants"

const getDictionaryList = () => new Promise((resolve, reject) => {
    import(/* webpackChunkName: "api" */ "@/services/api").then(({ default: api }) => {
        api.get("/dictionary/list")
           .then(({ data }) => {
               import(/* webpackChunkName: "dictionary" */ "@/models/Dictionary").then(({ default: Dictionary }) => resolve({
                   dictionaries: data.Dictionaries.map((el) => new Dictionary(el)),
                   total: Number(data.Total),
               }))
           })
           .catch((error) => reject(error))
    })
})

const getEntryIndex = (query, dictionaryId) => new Promise((resolve, reject) => {
    import(/* webpackChunkName: "api" */ "@/services/api").then(({ default: api }) => {
        api.get("/search/entry-index", {
               params: {
                   dictionaryId,
                   query,
                   headword: query,
               },
           })
           .then(({ data }) => {
               import(/* webpackChunkName: "entry-index" */ "@/models/EntryIndex").then(({ default: EntryIndex }) => resolve(new EntryIndex({
                   ...data,
                   query,
                   dictionaryId,
               })))
           })
           .catch((error) => reject(error))
    })
})

const getEntry = (entryId, dictionaryId) => new Promise((resolve, reject) => {
    import(/* webpackChunkName: "api" */ "@/services/api").then(({ default: api }) => {
        api.get("/search/get-entry", {
               params: {
                   dictionaryId,
                   entryId,
               },
               headers: {
                   Accept: "text/xml", // specifically request an XML payload
               },
           })
           .then(({ data }) => {
               import(/* webpackChunkName: "entry" */ "@/models/Entry").then(({ default: Entry }) => resolve(Entry.fromXML(data)))
           })
           .catch((error) => reject(error))
    })
})

export const search = (query, dictionaryId = DEFAULT_DICTIONARY_ID) => new Promise((resolve, reject) => {
    import(/* webpackChunkName: "md5" */ "crypto-js/md5").then(({ default: md5 }) => {
        const cacheKey = md5(`${query}_${dictionaryId}`)
            .toString()

        chrome.storage.local.get(cacheKey, (data) => {
            /**
             * Check if we have a cached copy of the result
             */
            if (data[cacheKey] && "expires" in data[cacheKey] && new Date(data[cacheKey].expires) > new Date()) {
                console.log(`[OK] CACHED SEARCH RESULT FOR "${query}"`)
                return resolve(data[cacheKey])
            }

            /**
             * Data does not exist in cache or is not valid anymore
             */
            getEntryIndex(query, dictionaryId)
                .then((entryIndex) => {
                    /**
                     * Check if there are any results
                     */
                    if (entryIndex.absoluteIndex > -1 && entryIndex.relativeIndex > -1) {
                        return getEntry(entryIndex.absoluteIndex, dictionaryId)
                            .then((entry) => {
                                /**
                                 * Cache the result
                                 */
                                const cache = {}
                                cache[cacheKey] = entry.mappedForCache(query)
                                chrome.storage.local.set(cache)

                                /**
                                 * Resolve the Entry
                                 */
                                return resolve(cache[cacheKey])
                            })
                            .catch((error) => reject(error))
                    }

                    /**
                     * In case there are no results
                     */
                    return reject(Error("Search query yielded no results!"))
                })
                .catch((error) => reject(error))
        })
    })
})

export const getLemma = (query, withNames = false) => new Promise((resolve, reject) => {
    import(/* webpackChunkName: "db" */ "@/services/db").then(({ default: db }) => {
        db.words.where("word")
          .equalsIgnoreCase(query)
          .and((word) => withNames ? true : !word.msd.startsWith("Sl"))
          .first((word) => {
              if (!word || !("lemma" in word)) {
                  return reject(Error(`Lemma of "${query}" not found!`))
              }
              return resolve(word.lemma)
          })
          .catch("DatabaseClosedError", (exception) => {
              console.warn(`DatabaseClosed error: ${exception.message}`)
              db.open()
                .then(() => resolve(getLemma(query)))
          })
          .catch((error) => {
              console.warn(error.stack || error)
          })
    })
})

export const getDictionaries = () => new Promise((resolve, reject) => {
    chrome.storage.local.get("dictionaries", (data) => {
        if (!data.dictionaries || new Date(data.dictionaries.expires) <= new Date()) {
            // get dictionary list form Termania and store it in cache
            return getDictionaryList()
                .then(({ dictionaries, total }) => {
                    if (!total) {
                        return reject(Error("Termania.net API returned 0 dictionaries!"))
                    }

                    import(/* webpackChunkName: "date-fns" */ "date-fns").then(({ addDays }) => chrome.storage.local.set({
                        dictionaries: {
                            dictionaries,
                            total,
                            expires: addDays(new Date(), CACHE_IN_DAYS)
                                .toISOString(),
                        },
                    }, () => resolve(dictionaries)))
                })
                .catch((error) => {
                    console.warn("Could not fetch dictionary list from Termania.net")
                    return reject(error)
                })
        }

        return resolve(data.dictionaries.dictionaries)
    })
})

export const getDictionary = (dictionaryId) => new Promise((resolve, reject) => {
    getDictionaries()
        .then((dictionaries) => {
            const dictionary = dictionaries.find((dict) => dict.id === dictionaryId)
            return dictionary ? resolve(dictionary) : reject(Error("Dictionary not found!"))
        })
        .catch((error) => reject(error))
})
