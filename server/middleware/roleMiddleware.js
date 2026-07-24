/**

    @fileoverview Role Authorization Middleware.
    Ensure the Authenticated User Holds the Required Role before Proceeding.
    Must Run AFTER authMiddleware 

 */

const supabase = require('../config/supabaseClient');

const requireManager = async (req, res, next) => {

    try{

        const userId = req.user.id;

        // Fetch the User's Specific Role from our Database

        const { data: user, error } = await supabase

            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        if(error || !user){

            console.error('[Role Check Error]: ', error);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Verify User Permissions.'

            });

        }

        // Check if User is a Manager

        if(user.role != 'Manager'){

            return res.status(403).json({

                status: 'Error',
                message: 'Forbidden: Only Club Managers can Perform This Action.'

            });

        }

        next();

    }

    catch(err){

        console.error('[Middleware Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error during Role Verification'

        });

    }

};

module.exports = { requireManager };