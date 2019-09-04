const path =
    require('path');

const express =
    require('express');
const bodyParser =
    require('body-parser');
const session =
    require('express-session');
const jwt =
    require('express-jwt');

module.exports = function(params) {

    const server = express();
    server.set('view engine', 'ejs');

    server.use(express.static(path.resolve(__dirname, '..', 'public')));
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ 'extended': true }));
    server.use(session({
        secret: params.sessionSecret,
        resave: false,
        saveUninitialized: true
    }));

    function getTokenFromHeader(req){
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
            req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        }

        return null;
    }
    server.authRequired = jwt({
        secret: params.jwtSecret,
        userProperty: 'payload',
        getToken: getTokenFromHeader
    });
    server.authOptional = jwt({
        secret: params.jwtSecret,
        userProperty: 'payload',
        credentialsRequired: false,
        getToken: getTokenFromHeader
    });

    server.use((request, response, next) => {
        if (!request.session.errors) {
            request.session.errors = [];
        }

        next();
    });

    return server;

};

