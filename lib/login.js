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

            response.redirect(destination);
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

