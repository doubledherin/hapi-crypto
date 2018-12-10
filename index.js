const Crypto = require('crypto')
const Hapi = require('hapi')
const Path = require('path')
const Fs = require('fs')

const server = new Hapi.Server()

server.connection({ host: 'localhost', port: 4000 })

server.method('readKey1', (request, reply) => {
  Fs.readFile(Path.join(__dirname, 'key1.txt'), 'utf8', (err, data) => {
    if (err) {
      throw err
    }
    console.log('data')
    reply(data.trim())
  })
})

server.method('readKey2', (request, reply) => {
  Fs.readFile(Path.join(__dirname, 'key2.txt'), 'utf8', (err, data) => {
    if (err) {
      throw err
    }
    console.log('data')
    reply(data.trim())
  })
})

server.method('decryptMessage', (request, reply) => {
  const key = request.pre.readKey1 + request.pre.readKey2
  const decipher = Crypto.createDecipher('aes-256-cbc',key)
  let clearText = decipher.update(request.payload.message, 'hex', 'utf8')
  clearText += decipher.final('utf8')
  reply(clearText)
})

server.method('convertMessage', (request, reply) => {
  const messages = {
    'Catflap is open': 'I have infiltrated the base',
    'Ink is dry': 'I have the blueprints',
    'Bird has flown': 'I am making my escape'
  }
  reply(messages[request.pre.decryptMessage])
})

server.route({
  config: {
    pre: [
      [
        'readKey1',
        'readKey2'
      ],
      'decryptMessage',
      'convertMessage'
    ]
  },
  method: 'POST',
  path: '/',
  handler: function (request, reply) {
    console.log(new Date() + ': Incoming payload')

    console.log('Encrypted message: ' + request.payload.message)
    console.log('Decrypted message: ' + request.pre.decryptMessage)
    console.log('Converted message: ' + request.pre.convertMessage)

    reply('ok')
  }
})

server.start(() => {
  console.log('Server started!')
})
