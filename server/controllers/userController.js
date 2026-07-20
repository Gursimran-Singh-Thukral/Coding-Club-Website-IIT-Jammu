/**
 * 
 * User Controller
 * 
 * Handles business logic for user profile management.
 * Interfaces with the Supabase database to read and write user data.
 * 
 */

const supabase = require('../db/supabaseClient')

const syncUserProfile = async (req, res) => {

    try{

        // Extracting Verified User

        const { id, email, user_metadata } = req.user;

        // Extract Name of the User

        const full_name = user_metadata?.full_name || "No Name Found";

        // Attempt to Fetch the User From the Custom PostgreSQL Database

        let{ data: existingUser, error: fetchError } = await supabase

            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        // Handle Database Errors

        if(fetchError && fetchError.code != 'PGRST116')         // PGRST116 is an Error Code for No Rows Found

        // If User didn't Exist, Insert them as a new 'Student'

        if(!existingUser){

            const { data: newUser, error: insertError } = await supabase

                .from('users')
                .insert([{

                    id: id,
                    email: email,
                    full_name: full_name,
                    role: 'Student'

                }])
                .select()
                .single();

            if(insertError) throw insertError;

            existingUser = newUser;             // Set the Output to New User

        }

        return res.status(200).json({

            status: 'Success',
            data: existingUser

        });

    }

    catch(err){

        console.error("[User Controller Error]: ", err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error while Syncing User Profile'

        });

    }

}

module.exports = { syncUserProfile };