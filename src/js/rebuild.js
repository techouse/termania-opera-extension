import db from "@/services/db"

const downloadDatabase = () => {
    import(/* webpackChunkName: "dexie-export-import" */ "dexie-export-import").then(({ exportDB }) => {
        exportDB(db)
            .then((blob) => {
                import(/* webpackChunkName: "download" */ "downloadjs").then(({ default: download }) => {
                    download(blob, "db.json", "application/json")
                })
            })
    })
}

const rebuild = (jsonDatabaseSource) => {
    db.on("ready", () => {
        fetch(jsonDatabaseSource)
            .then((response) => response.json())
            .then((json) => {
                console.log(`rebuilding from ${jsonDatabaseSource}`)
                return db.words.bulkAdd(json)
                         .then(() => {
                             downloadDatabase()
                         })
            })
            .catch((error) => {
                console.error(error)
            })
    })
    db.open()
}

export default rebuild
