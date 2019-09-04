const jwt = require('jsonwebtoken');

module.exports = function(params, server, database) {

    server.get('/login', (request, response) => {
        response.render('user/login', {
            'session': request.session
        });
    });

    server.post('/login', (request, response) => {
        const destination = '/';

        const login = request.body['login'];
        if (!login) {
            request.session.errors.push('The login was not provided.');
        }

        const password = request.body['password'];
        if (!password) {
            request.session.errors.push('The password was not provided.');
        }

        if (request.session.errors.length > 0) {
            response.redirect(destination);

            return;
        }

        User = database.user;
        User.findOne({ 'where': { 'login': login } }).then(user => {
            if (!params.bcrypt.compareSync(password, user.credentials)) {
                request.session.errors.push('The login or password is not valid.');
                response.redirect(destination);

                return;
            }

            request.session.userID = user.id;
            request.session.authorized = true;
            request.session.administrator = user.administrator;

            const today = new Date();
            const exp = new Date(today);
            exp.setDate(today.getDate() + 60);

            const token = jwt.sign({
                userID: user.id,
                authorized: true,
                administrator: user.administrator,
                exp: parseInt(exp.getTime() / 1000),
            }, params.jwtSecret);

            response.format({
                'text/html': () => {
                    response.redirect(destination);
                },
                'application/json': () => {
                    response.json({
                        'user': {
                            'id': user.id,
                            'login': user.login,
                            'username': user.login,
                            'email': user.login,
                            'administrator': user.administrator,
                            'createdAt': user.createdAt,
                            'token': token,
                            'bio': '',
                            'image': ''
                        }
                    });
                }
            });
        }).catch(error => {
            console.error(error);

            request.session.errors.push('Failed to authenticate.');
            response.redirect(destination);

            return;
        });
    });

    server.post('/logout', (request, response) => {
        request.session.regenerate(() => {
            response.redirect('/');
        });
    });

};

