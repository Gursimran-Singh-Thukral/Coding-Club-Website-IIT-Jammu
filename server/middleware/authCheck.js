/**
 * 
 * Authentication & Domain Verification Middleware
 * 
 * Intercepts incoming requests to validate the JSON Web Token (JWT) provided by the client.
 * Strictly enforces that the authenticated user's email belongs to the official institute domain.
 * 
 */

const supabase = require('../db/supabaseClient');

const verifyInstituteEmail = async(req, res, next) => {

    try{

        // Extract the Authorization Header from the Incoming HTTP Request

        const authHeader = req.headers.authorization;

        // Ensuring Standard Bearer Token Formatting

        if(!authHeader || !authHeader.startsWith('Bearer ')){

            return res.status(401).json({

                status: "Error",
                message: "Unauthorized: Missing or Properly Formatted Authentication Token."

            });

        }

        // Isolate the Token String from the Bearer Prefix

        const token = authHeader.split(' ')[1];

        // Validate the Token Cryptographically Against the Supabase Auth Server

        const { data: {user}, error } = await supabase.auth.getUser(token);

        if(error || !user){

            return res.status(401).json({

                status: "Error", 
                message: "Unauthorized: Token Verification Failed or has Expired"

            });

        }

        // Strict Domain Enforcement

        const userEmail = user.email;

        if(!userEmail || !userEmail.endsWith('@iitjammu.ac.in')){

            return res.status(403).json({

                status: "Error", 
                message: "Forbidden: Access is Strictly Restricted to Official @iitjammu.ac.in Accounts."

            })

        }

        // Attach the Verified User Payload to the Request Object for Downstream Controllers to use

        req.user = user;

        // Pass Control to next Middleware or the Final Route Handler

        next();

    }

    catch(err){

        console.error("[Auth Middleware Error]: ", err.message);

        return res.status(500).json({

            status: "Error",
            message: "Internal Server Error using Authentication Process"

        });

    }

};

module.exports = {verifyInstituteEmail};