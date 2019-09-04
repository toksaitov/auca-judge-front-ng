auca-judge-front
================

auca-judge-front is a web front end for the auca-judge system.

## Required Software

* _Node.js (7.10.0)_
* _MySQL (5.7.18)_

## Usage

Create an `.env` file with secrets and parameters for all the components.

```bash
# Database
AUCA_JUDGE_FRONT_DATABASE_HOST=the location of the database server (localhost by default)
AUCA_JUDGE_FRONT_DATABASE_PORT=the database port (3306 by default)
AUCA_JUDGE_FRONT_DATABASE_DIALECT=the dialect of the database management engine (mysql by default)
AUCA_JUDGE_FRONT_DATABASE_NAME=the name of the database (auca_judge_front by default)
AUCA_JUDGE_FRONT_DATABASE_USER=the user of the database with write permissions (auca_judge_front_user by default)
AUCA_JUDGE_FRONT_DATABASE_PASSWORD=his pasword (empty by default)

AUCA_JUDGE_FRONT_PROBLEM_DATABASE_URL=URL of the mongo DB

# Server
AUCA_JUDGE_FRONT_SERVER_PORT=the port to use by the server (8080 by default)

# Session
AUCA_JUDGE_FRONT_SESSION_SECRET=session secret to use with cookies
AUCA_JUDGE_FRONT_JWT_SECRET=JWT secret

# bcrypt
AUCA_JUDGE_FRONT_BCRYPT_SALT_LENGTH=length of the random salt (8 by default)

# Default Users
AUCA_JUDGE_FRONT_ADMIN_PASSWORD=administrator password
AUCA_JUDGE_FRONT_USER_PASSWORD=test user password
```

Create the database and the database user with the password specified in the
previous step in the `.env` file (you can use MySQL Workbench, other management
tools, or issue SQL queries manually from the `mysql` command).

Install dependencies, ensure the database system is running, and start the
server.

```bash
npm install # to install dependencies
npm start   # to start the server
```

