DataBase & Tables
astrochats
    chatmessages
Software Architecture Pattern Used
 **Modularized MVC pattern enhanced by a layered approach**, which is a popular design for scalable and maintainable web applications.

/config: Store project constants, db connections, environment variables
/middlewares: Commonly used functions (related to controllers)
/public: For static things
/utils: Commonly used functions (related to REST API)
/modules
    /modulesName
        |-/controllers
        |-/models
        |-/routes
        |-/services
        |-index.js

backend
    /config
        /constants
        /db
            mongo.db.js
            mysql.db.js
    /middlewares 
        authMiddleware.js
        errorMiddleware.js
    /modules
        /auth
            |-/controllers
            |-/routes
            |-/services
            |-index.js
        /booking
            |-/controllers
            |-/routes
            |-/services
        /chat
            |-/controllers
            |-/models
            |-/routes
            |-/services
            |-index.js
        /dashboard
            |-/controllers
            |-/models
            |-/routes
        /payment
            |-/controllers
            |-/models
            |-/routes
            |-/services
            |-index.js
        /user-management
            |-/controllers
            |-/models
            |-/routes
            |-/services
            |-index.js
    /public:
    /utils: 
    .env
    index.js
    package.json
    package-lock.json
    readme.md
        