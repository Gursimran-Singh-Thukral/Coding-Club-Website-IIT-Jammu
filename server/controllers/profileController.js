/**

    @fileoverview Profile Controller.
    Manages Public-Facing Student and Admin Profiles, Including External Links and Stats

 */

const supabase = require('../config/supabaseClient');
const { fetchStats } = require('../services/statFetcher');

// Fetch the Currently Authenticated User's Data

const getUserProfile = async(req, res) => {

    try{

        const userId = req.user.id;

        const { data: user, error } = await supabase

            .from('users')
            .select(`
                
                id, 
                full_name, 
                email,
                student_id,
                role, 
                created_at,
                profiles(*)

            `)
            .eq('id', userId)
            .single();

        if(error || !user){

            return res.status(404).json({

                status: 'Error',
                message: 'User Not Found'

            });

        }

        return res.status(200).json({

            status: 'Success',
            user: user

        });

    }

    catch(err){

        console.error('[Profile Fetch Error]: ', err.message);

        return res.status(500).json({

            status: 'Error', 
            message: 'Internal Server Error'

        });

    }

};

// Create or Update the Authenticated User's Profile

const upsertProfile = async (req, res) => {

    try{

        const userId = req.user.id;

        const { bio, avatar_url, github_handle, codeforces_handle, leetcode_handle, kaggle_handle, stats } = req.body;

        const handles = { github_handle, codeforces_handle, leetcode_handle, kaggle_handle };

        const liveStats = await fetchStats(handles);

        const { data: profile, error } = await supabase

            .from('profiles')
            .upsert({

                user_id: userId,
                bio: bio,
                avatar_url: avatar_url,
                github_handle: github_handle,
                codeforces_handle: codeforces_handle,
                leetcode_handle: leetcode_handle,
                kaggle_handle: kaggle_handle,
                stats: liveStats,

                updated_at: new Date()

            }, { onConflict: 'user_id' })

            .select()
            .single();

        if(error){

            console.error('[DB Profile Upsert Error]: ', error);

            return res.status(500).json({

                status: 'Error', 
                message: 'Failed to Update Profile.'

            });

        }

        return res.status(200).json({

            status: 'Success',
            message: 'Profile Updated Successfully',
            data: profile

        });

    }

    catch(err){

        console.error('[Profile Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error', 
            message: 'Internal Server Error'

        });

    }

};

// Fetch All Profiles
// Public, Unauthenticated Endpoint - Deliberately Excludes Email (PII) from the Response

const getAllProfiles = async (req, res) => {

    try{

        const { data: profiles, error } = await supabase

            .from('profiles')
            .select(`

                *,
                users (student_id, role)

            `);

        if(error){

            console.error('[DB Fetch Profile Error]: ', error);

            return res.status(500).json({

                status: 'Error', 
                message: 'Failed to Fetch Team Profiles.'

            });

        }

        return res.status(200).json({

            status: 'Success', 
            total_members: profiles.length,
            data: profiles

        });

    }

    catch(err){

        console.error('[Profile Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

module.exports = { upsertProfile, getAllProfiles, getUserProfile };