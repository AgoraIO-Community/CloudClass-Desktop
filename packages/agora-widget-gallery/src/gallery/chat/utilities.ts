export class PersistLocalStorage {
    private storage: Storage;
  
    constructor() {
      this.storage = window.sessionStorage
    }
  
    saveConversationReadTs(jsonStringify: string) {
      this.storage.setItem("conversationReadTs", jsonStringify)
    }
  
    getConversationReadTs() {
      const str = this.storage.getItem("conversationReadTs")
      if (!str) {
        return new Map()
      }
      try {
        return new Map(Object.entries(JSON.parse(str) as {}))
      } catch (err) {
        return new Map()
      }
    }
  
}



export const ChatStorage = new PersistLocalStorage()