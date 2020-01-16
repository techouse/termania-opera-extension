import Dexie        from "dexie"
import { DB_NAME }  from "@/services/constants"

const db = new Dexie(DB_NAME)
db.version(1)
  .stores({ words: "id++,word,msd,lemma" })

export default db
