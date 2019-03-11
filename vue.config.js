module.exports = {
  devServer: {
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': 'https://domain'
    },
    host: 'localhost',
    https: true
  }
}
