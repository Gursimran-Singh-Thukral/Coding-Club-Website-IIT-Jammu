/**

    @fileoverview Profile Controller.
    Manages Public-Facing Student and Admin Profiles, Including External Links and Stats

 */

const supabase = require('../config/supabaseClient');
const { fetchStats } = require('../services/statFetcher');

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

const getAllProfiles = async (req, res) => {

    try{

        const { data: profiles, error } = await supabase

            .from('profiles')
            .select(`
                
                *,
                users (student_id, role, email)

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

module.exports = { upsertProfile, getAllProfiles };