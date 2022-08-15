const express = require('express');
const cron = require('node-cron');
const serveStatic = require('serve-static');
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');
const getSign = require('./signs/signsIndex');
const queryManager = require('./queries/queries');
const { query } = require('express');

const app = express();

var updateCronEnable = false;
var errorQuery = { response: 'Query malformed' };

app.use(expressCspHeader({
    directives: {
        'default-src': [SELF, INLINE],
        'script-src': [SELF, INLINE],
        'image-src': [SELF, INLINE],
        'worker-src': [NONE],
        'block-all-mixed-content': true
    }
}));

app.use(serveStatic('./media'));

app.get("/getSign", (req, res, next) => {
    if(req.query.name == null)
        return res
        .header("Content-Type", "application/json")
        .status(400)
        .send(errorQuery);
    else
        res
        .header("Content-Type", "application/json")
        .status(200)
        .send(getSign(req.query.name));
})

app.get("/getFeatures", (req, res, next) => {
    if(req.query.type != null){
        var result = queryManager.getQuery(req.query.type)
        if(result.error)
            res.status(404).send(result);
        else
            res.status(200).send(result);
    }else
        res
        .status(400)
        .send(errorQuery);
})


// app.get("/startUpdate", (req, res, next) => {
//     res.status(200).send("OK.");
//     queryManager.updateQuery();
// })

app.get('*', function (req, res) {
    res
    .status(400)
    .send('Wanna a durmí sté');
});

cron.schedule('30 56 * * * *', () => {
    console.log('[ ! ] Hourly query update');
    queryManager.updateQuery();
});

const server = app.listen(3001, function(){
    let host = server.address().address;
    let port = server.address().port;
    console.log("Know my city | Backend");
});