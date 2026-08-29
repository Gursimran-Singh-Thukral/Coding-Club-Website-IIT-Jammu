/**

    @fileoverview Team Controller.
    Handles the Public Team Roster - Manageable by Club Managers.

*/

const supabase = require('../config/supabaseClient');

// Fields a Manager is Allowed to Set/Change - Never created_by, id, etc.

const TEAM_MEMBER_FIELDS = ['name', 'title', 'image_url', 'github', 'linkedin', 'display_order'];

function pickTeamFields(body) {

    const fields = {};

    for(const field of TEAM_MEMBER_FIELDS){

        if(body[field] !== undefined) fields[field] = body[field];

    }

    return fields;

}

// Get the Public Team Roster

const getTeamMembers = async (req, res) => {

    try{

        const { data: members, error } = await supabase

            .from('team_members')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: true });

        if(error){

            console.error('[DB Team Fetch Error]: ', error);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Fetch Team Members'

            });

        }

        return res.status(200).json({

            status: 'Success',
            data: members

        });

    }

    catch(err){

        console.error('[Team Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

// Add a Team Member

const createTeamMember = async (req, res) => {

    try{

        const { name, title } = req.body;

        if(!name || !title){

            return res.status(400).json({

                status: 'Error',
                message: 'Name and Title are Required'

            });

        }

        const fields = pickTeamFields(req.body);

        const { data: member, error } = await supabase

            .from('team_members')
            .insert([{ ...fields, created_by: req.user.id }])
            .select()
            .single();

        if(error){

            console.error('[DB Team Insert Error]: ', error);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Add Team Member'

            });

        }

        return res.status(201).json({

            status: 'Success',
            data: member

        });

    }

    catch(err){

        console.error('[Team Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

// Update a Team Member

const updateTeamMember = async (req, res) => {

    try{

        const memberId = req.params.id;
        const fields = pickTeamFields(req.body);

        const { data: member, error } = await supabase

            .from('team_members')
            .update(fields)
            .eq('id', memberId)
            .select()
            .single();

        if(error){

            console.error('[DB Team Update Error]: ', error);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Update Team Member'

            });

        }

        return res.status(200).json({

            status: 'Success',
            message: 'Team Member Updated Successfully',
            data: member

        });

    }

    catch(err){

        console.error('[Team Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

// Remove a Team Member

const deleteTeamMember = async (req, res) => {

    try{

        const memberId = req.params.id;

        const { error } = await supabase

            .from('team_members')
            .delete()
            .eq('id', memberId);

        if(error){

            console.error('[DB Team Delete Error]: ', error);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Remove Team Member'

            });

        }

        return res.status(200).json({

            status: 'Success',
            message: 'Team Member Removed Successfully'

        });

    }

    catch(err){

        console.error('[Team Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

module.exports = { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember };
