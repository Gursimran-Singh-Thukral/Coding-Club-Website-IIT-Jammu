/*

    @fileoverview Authentication Middleware.
    Intercepts Incoming Requests to Verify the Supabase JWT Token.
    If Valid, it attaches the User Data to the Request. If invalid, it blocks the Request.

*/

const supabase = require('../config/supabaseClient');

const verifyAuth = async (req, res, next) => {

    try{

        // Check if Authorization Header Exists

        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')){

            return res.status(401).json({

                status: 'Error',
                message: 'Unauthorized: Missed or Malformed Token'

            });

        }

        // Extract the Token

        const token = authHeader.split(' ')[1];

        // Ask Supabase to Validate the Token and Fetch the User

        const { data, error } = await supabase.auth.getUser(token);

        if(error || !data.user){

            console.error('[Auth Error]: Invalid or Expired Token');

            return res.status(401).json({

                status: 'Error',
                message: 'Unauthorized: Invalid or Expired Token'

            });

        }

        // Token is Valid. Attach the User Object to the Request for the Controllers to Use.

        req.user = data.user;

        // Pass Control to Next Function

        next();

    }

    catch(err){

        console.error('[Middleware Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error During Authentication'

        });

    }

}

module.exports = { verifyAuth };