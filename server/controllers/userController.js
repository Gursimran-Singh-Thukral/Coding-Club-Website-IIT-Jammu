/*

    @fileoverview User Controller.
    Handles Synchronizing Authenticated Users from Supabase Auth into our public.users Table.

*/

const supabase = require('../config/supabaseClient');

const syncUserProfile = async(req, res) => {

    try{

        const { id, email } = req.user;

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

        const { data: newUser, error: insertError } = await supabase

            .from('users')
            .insert([{

                id: id,
                email: email,
                student_id: email.split('@')[0].toUpperCase(),
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

module.exports = { syncUserProfile };