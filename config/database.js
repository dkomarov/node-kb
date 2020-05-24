if (process.env.NODE_ENV !== 'production') { // set by default by Node
  require('dotenv').config({path: '.env'})
}

module.exports = {
  database: process.env.FULL_DB_URL,
  secret: process.env.SECRET
}