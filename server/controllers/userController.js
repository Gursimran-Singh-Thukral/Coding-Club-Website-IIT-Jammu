/*

    @fileoverview User Controller.
    Handles Synchronizing Authenticated Users from Supabase Auth into our public.users Table.

*/

const supabase = require('../config/supabaseClient');

const syncUserProfile = async(req, res) => {

    try{

        const { id, email, user_metadata } = req.user;

        // Check if the User Already Exists in our Database.

        const { data: existingUser, error: fetchError } = await supabase

            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        
        // If User Exists, Return them and Stop Execution

        if(existingUser){

            return res.status(200).json({

                status: 'Success',
                message: 'User Profile Already Exists',
                data: existingUser

            });

        }

        // We expect a PGRST116 Error if User Doesn't Exist. Logging Anything Else.

        if(fetchError && fetchError.code != 'PGRST116') console.error("[Database Fetch Error]: ", fetchError);

        // User Doesn't Exist, so Inserting them Safely

        console.log(`[Database] Inserting new User: ${email}`);

        const full_name = user_metadata?.full_name || user_metadata?.name || "Unknown";

        const { data: newUser, error: insertError } = await supabase

            .from('users')
            .insert([{

                id: id,
                email: email,
                student_id: email.split('@')[0].toUpperCase(),
                full_name: full_name,
                role: 'Student'

            }])
            .select()
            .single();

        // Fail Fast if Insert is Rejected

        if(insertError){

            console.error('[Critical Database Insert Error]: ', insertError);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Insert User into the Database',
                details: insertError.message

            });

        }

        // Success

        return res.status(201).json({

            status: 'Success',
            message: 'User Profile Synced Successfully',
            data: newUser

        });

    }

    catch(err){

        console.error('[User Sync Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Error while Syncing User Profile.'

        });

    }

}

// Roles a Coordinator is Allowed to Assign - Mirrors the student_role Enum

const ASSIGNABLE_ROLES = ['Student', 'Field Specialist', 'Coordinator', 'Technical Secretary'];

// List Every Registered User - Coordinator-Only, Backs the Role Management Page

const listUsers = async (req, res) => {

    try{

        const { data: users, error } = await supabase

            .from('users')
            .select('id, full_name, email, student_id, role, created_at')
            .order('full_name', { ascending: true });

        if(error){

            console.error('[DB Users Fetch Error]: ', error);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Fetch Users'

            });

        }

        return res.status(200).json({

            status: 'Success',
            data: users

        });

    }

    catch(err){

        console.error('[User Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

// Promote/Demote a User's Platform Role - Coordinator-Only

const updateUserRole = async (req, res) => {

    try{

        const targetId = req.params.id;
        const { role } = req.body;

        if(!ASSIGNABLE_ROLES.includes(role)){

            return res.status(400).json({

                status: 'Error',
                message: `Role must be one of: ${ASSIGNABLE_ROLES.join(', ')}`

            });

        }

        // Guard against Locking Yourself Out (or Escalating Yourself) via this Endpoint

        if(targetId === req.user.id){

            return res.status(400).json({

                status: 'Error',
                message: 'You Cannot Change Your Own Role'

            });

        }

        const { data: updatedUser, error } = await supabase

            .from('users')
            .update({ role })
            .eq('id', targetId)
            .select('id, full_name, email, student_id, role, created_at')
            .single();

        if(error){

            console.error('[DB Role Update Error]: ', error);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Update Role'

            });

        }

        return res.status(200).json({

            status: 'Success',
            message: 'Role Updated Successfully',
            data: updatedUser

        });

    }

    catch(err){

        console.error('[User Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

module.exports = { syncUserProfile, listUsers, updateUserRole };