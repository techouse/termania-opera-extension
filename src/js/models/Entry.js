import { addDays }       from "date-fns"
import { camel }         from "case"
import { CACHE_IN_DAYS } from "@/services/constants"

export default class Entry {
    constructor(values = {}) {
        this.dictionaryId = null
        this.entryId = null
        this.headword = null
        this.html = null

        Object.assign(this, Object.fromEntries(
            Object.entries(values)
                  .map(([key, value]) => [camel(key), value]),
        ))
    }

    static fromXML(xml) {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xml, "text/xml")

        const entry = new Entry()
        entry.dictionaryId = Number(xmlDoc.getElementsByTagName("dictionary_id")[0].childNodes[0].nodeValue)
        entry.entryId = Number(xmlDoc.getElementsByTagName("entry_id")[0].childNodes[0].nodeValue)
        entry.headword = xmlDoc.getElementsByTagName("headword")[0].childNodes[0].nodeValue
        entry.html = xmlDoc.getElementsByTagName("html_content")[0].innerHTML

        return entry
    }

    mappedForCache(query) {
        return {
            query,
            ...this,
            expires: addDays(new Date(), CACHE_IN_DAYS)
                .toISOString(),
        }
    }
}
