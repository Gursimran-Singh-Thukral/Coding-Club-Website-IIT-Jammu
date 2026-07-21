/**

    Authentication & Domain Verification Middleware

    Intercepts incoming requests to validate the JSON Web Token (JWT) provided by the client.
    Strictly enforces that the authenticated user's email belongs to the official institute domain.

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

/**

    Role-Based Access Control (RBAC) Middleware

    Verifies that the authenticated user possesses the required authorization 
    level (role) in the database before accessing sensitive administrative routes.

    @param {Array<string>} allowedRoles - Array of roles permitted to access the route.

 */

const requireRole = (allowedRoles) => {

    // This returns a customized middleware function.

    return async(req, res, next) => {

        try{

            // Ensuring that the User is already Authenticated by the verifyInstituteEmail function

            if(!req.user || !req.user.id){

                return res.status(401).json({

                    status: "Error",
                    message: "Unauthorized: User Context Missing. Ensure Authentication Middleware Runs First"

                });

            }

            // Fetch the User's Custom Role from our 'users' Table

            const { data: dbUser, error } = await supabase

                .from('users')
                .select('role')
                .eq('id', req.user.id)
                .single();

            // Handle Database Lookup Errors or Missing Profiles

            if(error || !dbUser){

                return res.status(403).json({

                    status: "Error",
                    message: "Forbidden: User Profile was not Found in the Database System."

                })

            }

            // Strict Role Enforcement

            if(!allowedRoles.includes(dbUser.role)){

                return res.status(403).json({

                    status: "Error", 
                    message: `Forbidden: Insufficient Permissions. Require one of: ${allowedRoles.join(', ')}.`

                });

            }

            // Attach the Verified Role to the Request for Downstream Controllers

            req.userRole = dbUser.role;

            // Access Granted

            next()

        }

        catch(err){

            console.error("[RBAC Middleware Error]: ", err.message);
            return res.status(500).json({

                status: "Error",
                message: "Internal Server Error during Role Verification"

            });

        }

    };

};

module.exports = { verifyInstituteEmail, requireRole };