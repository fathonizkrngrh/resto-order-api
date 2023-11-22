"use strict"

module.exports.parse = (page, size) => {
    const limit = size ? +size : 3
    const offset = page ? page * limit : 0
    return { limit, offset }
}

module.exports.data = (data, page, limit) => {
    const { count: total_items, rows: items } = data
    const current_page = page ? +page : 0
    const total_pages = Math.ceil(total_items / limit)
    return { total_items, items, total_pages, current_page }
}

module.exports.pagination = (data, page, limit) => {
    const { count: total_items, rows: items } = data
    const current_page = page ? +page : 0
    const total_pages = Math.ceil(total_items / limit)
    return { total_items, items, total_pages, current_page }
}
