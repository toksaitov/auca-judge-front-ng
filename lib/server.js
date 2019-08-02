const path =
    require('path');

const express =
    require('express');
const bodyParser =
    require('body-parser');
const session =
    require('express-session');

module.exports = function(params) {

    const server = express();
    server.set('view engine', 'ejs');

    server.use(express.static(path.resolve(__dirname, '..', 'public')));
    server.use(bodyParser.urlencoded({ 'extended': true }));
    server.use(session({
        secret: params.sessionSecret,
        resave: false,
        saveUninitialized: true
    }));

    server.use((request, response, next) => {
        if (!request.session.errors) {
            request.session.errors = [];
        }

        next();
    });

    return server;

};

