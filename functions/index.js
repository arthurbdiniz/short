const express   = require('express')
const admin     = require('firebase-admin');
const functions = require('firebase-functions');
const app       = express();

admin.initializeApp(functions.config().firebase);

let db = admin.firestore();

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }))

hostname = 'https://short.arthurbdiniz.com/'

app.get('/', async (request, response) => {
    response.render('index', { hostname: null, shortUrl: null })
})

app.post('/', async (request, response) => {
  let docRef = db.collection('shortUrls');
  
  let shortUrl = docRef.add({
    full: request.body.fullUrl
  }).then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      response.render('index', { hostname: hostname, shortUrl: docRef.id })
      return null
  })
  .catch((error) => {
      console.error("Error adding document: ", error);
  });
})

app.get('/:shortUrl', async (request, response) => {

  let shortUrlRef = db.collection('shortUrls').doc(request.params.shortUrl);
  let getShortUrl = shortUrlRef.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
        response.sendStatus(404)
      } else {
        console.log('Document data:', doc.data());
        response.redirect( doc.data().full)
      }
      return null
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
})

exports.app = functions.https.onRequest(app);