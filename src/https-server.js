const mkcert = require('mkcert')
const express = require('express')
const https = require('https')

// Create a Certificate Authority
async function createCa() {
  try {
    return await mkcert.createCA({
      organization: 'Hello CA',
      countryCode: 'NP',
      state: 'Bagmati',
      locality: 'Kathmandu',
      validityDays: 365
    })
  } catch (e) {
    throw new Error(e)
  }
}

// Then create the certificate
async function createCert(ca) {
  try {
    //Then create the certificate
    return await mkcert.createCert({
      domains: ['127.0.0.1', 'localhost'],
      validityDays: 365,
      caKey: ca.key,
      caCert: ca.cert
    })
  } catch (e) {
    throw new Error(e)
  }
}

// Get https server option
async function getHttpsServerOption() {
  const ca = await createCa()
  const cert = await createCert(ca)
  const httpsOptions = {
    key: cert.key,
    cert: cert.cert
  }

  return httpsOptions
}

async function createHttpsApp() {
  const httpsOptions = await getHttpsServerOption()

  const app = express()
  https.createServer(httpsOptions, app)

  return {
    httpsServer,
    httpsApp
  }
}

async function getHttpsServerCreator() {
  const httpsOptions = await getHttpsServerOption()

  return function httpsServerCreator(injectApp) {
    return https.createServer(httpsOptions, injectApp)
  }
}

module.exports = {
  createCa,
  createCert,
  createHttpsApp,
  getHttpsServerCreator
}
