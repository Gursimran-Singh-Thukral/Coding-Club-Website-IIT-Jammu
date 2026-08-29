const jwt = require('jsonwebtoken');

const verifyToken = async(req, res, next) => {

    try{

        // Grab Token from Cookies

        let token = req.cookies?.accessToken;

        // Fallback for Testing Tools via Headers

        if(!token && req.headers.authorization?.startsWith('Bearer '))

            token = req.headers.authorization.split(' ')[1];

        if(!token){

            return res.status(401).json({

                status: 'Error', 
                message: 'Unauthorized: Missing Token'

            });

        }

        // Verify Custom JWT 

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_access_key');

        // Attach to the Request for the Next Route to Use

        req.user = decoded;

        next();

    }

    catch(err){

        console.error('[Middleware Error]: Invalid Token');

        return res.status(401).json({

            status: 'Error', 
            message: 'Unauthorized: Invalid or Expired Token'

        })

    }

};

module.exports = { verifyToken };