module.exports = function(params, server, database) {

    server.get(['/users', '/users/page/:number'], server.authOptional, (request, response) => {
        if (!(request.headers['accept'].includes('text/html') && request.session.authorized ||
              request.headers['accept'].includes('application/json') && request.user.authorized)) {
            response.status(401).end('Unauthorized');

            return;
        }

        if (!(request.headers['accept'].includes('text/html') && request.session.administrator ||
              request.headers['accept'].includes('application/json') && request.user.administrator)) {
            response.status(403).end('Forbidden');

            return;
        }

        const usersPerPage =
            4;
        const page =
            Math.max((request.params['number'] || 0) - 1, 0);

        const User = database.user;
        User.findAndCount({ 'offset': page * usersPerPage, 'limit': usersPerPage }).then(result => {
            response.format({
                'text/html': () => {
                    response.render('user/users', {
                        'session': request.session,
                        'users': result.rows,
                        'page': page + 1,
                        'lastPage': Math.floor(result.count / usersPerPage),
                        'totalUsers': result.count,
                        'usersPerPage': usersPerPage
                    });
                },
                'application/json': () => {
                    const users = result.rows.map(user => {
                        return {
                            'id': user.id,
                            'login': user.login,
                            'administrator': user.administrator,
                            'createdAt': user.createdAt
                        };
                    });
                    response.json({
                        'users': users,
                        'page': page + 1,
                        'lastPage': Math.floor(result.count / usersPerPage),
                        'totalUsers': result.count,
                        'usersPerPage': usersPerPage
                    });
                }
            });
        }).catch(error => {
            console.error(error);

            response.status(500).end('Internal Server Error');
        });
    });

    server.get(['/register', '/user/create', '/user/:id/update'], (request, response) => {
        if (request.path.endsWith('/update')) {
            if (!request.session.authorized) {
                response.status(401).end('Unauthorized');

                return;
            }
        }

        const previousLocation =
            request.header('Referer') || '/users';

        if (request.path === '/user/create' || request.path == '/register') {
            response.render('user/user-create-update', {
                'session': request.session,
                'user': null
            });
        } else {
            id = request.params['id'];
            if (!id) {
                request.session.errors.push('The user is unknown.');
                response.redirect(previousLocation);

                return;
            }

            if (id != request.session.id && !request.session.administrator) {
                response.status(401).end('Unauthorized');

                return;
            }

            const User = database.user;
            User.findById(id).then(user => {
                response.format({
                    'text/html': () => {
                        response.render('user/user-create-update', {
                            'session': request.session,
                            'user': user
                        });
                    },
                    'applicaton/json': () => {
                        response.json({
                            'id': user.id,
                            'login': user.login,
                            'administrator': administrator,
                            'createdAt': user.createdAt
                        });
                    }
                });
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to find the specified user.');
                response.redirect(previousLocation);
            });
        }
    });

    server.post(['/user/create', '/user/:id/update'], (request, response) => {
        if (request.path.endsWith('/update')) {
            if (!request.session.authorized) {
                response.status(401).end('Unauthorized');

                return;
            }
        }

        const destination =
            request.header('Referer') || '/users';

        let id;
        if (!request.path.endsWith('/create')) {
            id = request.params['id'];
            if (!id) {
                request.session.errors.push('The user is unknown.');
                response.redirect(destination);

                return;
            }

            if (id != request.session.id && !request.session.administrator) {
                response.status(401).end('Unauthorized');

                return;
            }
        }

        const login = request.body['login'];
        if (!login) {
            request.session.errors.push('The login must be specified.');
        }

        const password = request.body['password'];
        if (!password) {
            request.session.errors.push('The password must be specified.');
        }
        if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
            request.session.errors.push(
                'The password must contain a minimum of eight characters, ' +
                'at least one letter and one number.'
            );
        }

        const credentials =
            params.bcrypt.hashSync(params.adminPassword, params.bcryptSaltLength);

        const administrator =
            request.session.administrator ?
                request.body['administrator'] :
                false;

        if (request.session.errors.length > 0) {
            response.redirect(destination);

            return;
        }

        const User = database.user;
        if (id) {
            User.update({
                'login': login,
                'credentials': credentials,
                'administrator': administrator
            }, {
                'where': {
                    'id': id
                }
            }).then(result => {
                response.redirect(`/user/${id}`);
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to create a new user.');
                response.redirect(`/user/${id}`);
            });
        } else {
            User.create({
                'login': login,
                'credentials': credentials,
                'administrator': administrator
            }).then(user => {
                response.redirect(`/user/${user.id}`);
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to create a new user.');
                response.redirect(destination);
            });
        }
    });

    server.post('/user/:id/delete', (request, response) => {
        if (!request.session.authorized) {
            response.status(401).end('Unauthorized');

            return;
        }

        if (!request.session.administrator) {
            response.status(403).end('Forbidden');

            return;
        }

        const previousLocation =
            request.header('Referer') || '/user';

        const id = request.params['id'];
        if (!id) {
            request.session.errors.push('The user is unknown.');
            response.redirect(previousLocation);

            return;
        }

        const User = database.user;
        User.destroy({
            'where': {
                'id': id
            }
        }).then(() => {
            response.redirect('/users');
        }).catch(error => {
            console.error(error);

            request.session.errors.push('Failed to remove the user.');
            response.redirect('/users');
        });
    });

    server.get(['/user', '/user/:id'], server.authRequired, (request, response) => {
        const previousLocation = request.header('Referer') || '/users';

        const id = request.params['id'] || request.session.userID || request.payload.userID;
        if (!id) {
            request.session.errors.push('The user is unknown.');
            response.redirect(previousLocation);

            return;
        }

        const User  = database.user;
        const Entry = database.entry;
        User.findById(id, {
            'include': [ Entry ]
        }).then(user => {
            response.format({
                'text/html': () => {
                    response.render('user/user', {
                        'session': request.session,
                        'user': user
                    });
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
                            'bio': '',
                            'image': ''
                        }
                    });
                }
            });
        }).catch(error => {
            console.error(error);

            request.session.errors.push('The user was not found.');
            response.redirect(previousLocation);
        });
    });


};

