import { camel } from "case"

export default class EntryIndex {
    constructor(values = {}) {
        this.absoluteIndex = null
        this.relativeIndex = null
        this.query = null
        this.dictionaryId = null

        // EntryIndices come with capitalised keys and we have to lowercase them first
        Object.assign(this, Object.fromEntries(
            Object.entries(values)
                  .map(([key, value]) => [camel(key), value]),
        ))
    }
}
