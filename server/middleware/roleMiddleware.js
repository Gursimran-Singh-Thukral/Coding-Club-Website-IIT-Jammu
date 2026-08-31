/**

    @fileoverview Role Authorization Middleware.
    Ensure the Authenticated User Holds the Required Role before Proceeding.
    Must Run AFTER authMiddleware 

 */

const supabase = require('../config/supabaseClient');

// Admin-Tier Roles (Coordinator or Technical Secretary, per PRD's "Coordinator" Role) - Exported
// so Other Controllers can Grant the Same People Extra Leeway (e.g. Skipping the
// Attendance-Gate on the Hackathon Workspace) without Duplicating this List.

const ADMIN_ROLES = ['Coordinator', 'Technical Secretary'];

// Fresh DB Lookup (not the Possibly-Stale Role Embedded in the JWT) - so a Just-Assigned
// or Just-Revoked Role Takes Effect Immediately, not after the Next Silent Token Refresh.

const isCoordinatorRole = async (userId) => {

    const { data: user } = await supabase.from('users').select('role').eq('id', userId).single();

    return !!user && ADMIN_ROLES.includes(user.role);

};

const requireCoordinator = async (req, res, next) => {

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

        // Check if User Holds Admin-Tier Privileges

        if(!ADMIN_ROLES.includes(user.role)){

            return res.status(403).json({

                status: 'Error',
                message: 'Forbidden: Only Club Coordinators can Perform This Action.'

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

module.exports = { requireCoordinator, isCoordinatorRole, ADMIN_ROLES };