import { camel }                 from "case"
import { DEFAULT_DICTIONARY_ID } from "@/services/constants"

export default class Dictionary {
    constructor(values = {}) {
        this.id = null
        this.name = null
        this.author = null
        this.languages = []
        this.lingualism = null
        this.type = null

        // Dictionaries come with capitalised keys and we have to lowercase them first
        Object.assign(this, Object.fromEntries(
            Object.entries(values)
                  .map(([key, value]) => [camel(key), value]),
        ))

        if (this.languages.length > 0) {
            if (this.languages.length > 1) {
                // In case there's more than 1 language make all the languages unique
                this.languages = [...new Set(this.languages)]
            }
        }
    }

    static setActive(dictionary) {
        chrome.storage.local.set({ dictionary })
    }

    static getActive() {
        return new Promise((resolve) => {
            chrome.storage.local.get("dictionary", ({ dictionary }) => {
                if (!dictionary) {
                    chrome.storage.local.get("dictionaries", ({ dictionaries }) => {
                        const defaultDictionary = dictionaries.dictionaries.find((dict) => dict.id === DEFAULT_DICTIONARY_ID)
                        chrome.storage.local.set({ dictionary: defaultDictionary }, () => resolve(resolve(defaultDictionary)))
                    })
                }

                return resolve(dictionary)
            })
        })
    }
}
