import { defineStore } from 'pinia'

export const useTableStore = defineStore('table', {
  state: () => ({
    tables: {
      'business-analytics': {
        allData: [],
        filteredPaginatingData: []
      }
    }
  }),
  actions: {
    ensureTable(name) {
      if (!this.tables[name]) {
        this.tables[name] = {
          allData: [],
          filteredPaginatingData: []
        }
      }
    },
    setAllData(name, rows) {
      this.ensureTable(name)
      this.tables[name].allData = Array.isArray(rows) ? rows : []
    },
    setFilteredPages(name, pages) {
      this.ensureTable(name)
      this.tables[name].filteredPaginatingData = Array.isArray(pages) ? pages : []
    },
    clear(name) {
      if (this.tables[name]) {
        this.tables[name].allData = []
        this.tables[name].filteredPaginatingData = []
      }
    }
  }
})