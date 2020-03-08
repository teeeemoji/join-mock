const mockClient = require('../index')
const {createHttpsApp} = require('../src/https-server')

createHttpsApp().then(({httpsServer, httpsApp}) => {
  mockClient(null, httpsApp).then(() => {
    httpsServer.listen(3000, () => {
      console.log(`https> join mock dist test server started, server running at 3000`)
    })
  })
})
