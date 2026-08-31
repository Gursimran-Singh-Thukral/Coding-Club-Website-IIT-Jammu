/**

    @fileoverview Event Registration Controller.
    Registering solo or as a group both create a row in `event_teams` -
    individual-mode events just skip showing the invite code to the student.
    Team-mode events use a short, shareable invite code to join (no email
    invites, no team discovery - deliberately simple for a first run).

*/

const crypto = require('crypto');
const supabase = require('../config/supabaseClient');

// Avoids Visually Ambiguous Characters (0/O, 1/I) in Shared Codes

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateInviteCode() {

    const bytes = crypto.randomBytes(8);
    let code = '';

    for(let i = 0; i < 8; i++) code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];

    return code;

}

async function findMembership(eventId, studentId) {

    const { data } = await supabase

        .from('event_team_members')
        .select('*, event_teams(*)')
        .eq('event_id', eventId)
        .eq('student_id', studentId)
        .maybeSingle();

    return data;

}

async function getTeamWithMembers(teamId) {

    const { data: team } = await supabase.from('event_teams').select('*').eq('id', teamId).single();

    const { data: members } = await supabase

        .from('event_team_members')
        .select('id, is_leader, joined_at, users(id, full_name, email, student_id)')
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true });

    return { ...team, members: members || [] };

}

// Register - Creates a Team (of One, for Individual-Mode Events)

const createTeam = async (req, res) => {

    try{

        const eventId = req.params.id;
        const studentId = req.user.id;
        const { team_name } = req.body;

        if(!team_name || !team_name.trim()){

            return res.status(400).json({ status: 'Error', message: 'Team Name is Required' });

        }

        const { data: event, error: eventError } = await supabase

            .from('events')
            .select('registration_open')
            .eq('id', eventId)
            .single();

        if(eventError || !event){

            return res.status(404).json({ status: 'Error', message: 'Event Not Found' });

        }

        if(!event.registration_open){

            return res.status(400).json({ status: 'Error', message: 'Registration is Closed for This Event' });

        }

        const existing = await findMembership(eventId, studentId);

        if(existing){

            return res.status(409).json({ status: 'Error', message: 'You Are Already Registered for This Event' });

        }

        // Retry a Few Times on the Astronomically Unlikely Invite Code Collision

        let team = null;

        for(let attempt = 0; attempt < 5 && !team; attempt++){

            const { data, error } = await supabase

                .from('event_teams')
                .insert([{ event_id: eventId, team_name: team_name.trim(), invite_code: generateInviteCode(), created_by: studentId }])
                .select()
                .single();

            if(!error) team = data;
            else if(error.code !== '23505') {

                console.error('[DB Team Insert Error]: ', error);
                return res.status(500).json({ status: 'Error', message: 'Failed to Register' });

            }

        }

        if(!team){

            return res.status(500).json({ status: 'Error', message: 'Failed to Register. Please Try Again.' });

        }

        const { error: memberError } = await supabase

            .from('event_team_members')
            .insert([{ event_id: eventId, team_id: team.id, student_id: studentId, is_leader: true }]);

        if(memberError){

            console.error('[DB Team Member Insert Error]: ', memberError);

            // Roll Back the Orphaned Team

            await supabase.from('event_teams').delete().eq('id', team.id);

            return res.status(500).json({ status: 'Error', message: 'Failed to Register' });

        }

        return res.status(201).json({ status: 'Success', data: await getTeamWithMembers(team.id) });

    }

    catch(err){

        console.error('[Registration Controller Error]: ', err.message);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });

    }

};

// Join an Existing Team via its Invite Code

const joinTeam = async (req, res) => {

    try{

        const eventId = req.params.id;
        const studentId = req.user.id;
        const { invite_code } = req.body;

        if(!invite_code || !invite_code.trim()){

            return res.status(400).json({ status: 'Error', message: 'Invite Code is Required' });

        }

        const { data: event, error: eventError } = await supabase

            .from('events')
            .select('registration_open, registration_mode, max_team_size')
            .eq('id', eventId)
            .single();

        if(eventError || !event){

            return res.status(404).json({ status: 'Error', message: 'Event Not Found' });

        }

        if(!event.registration_open){

            return res.status(400).json({ status: 'Error', message: 'Registration is Closed for This Event' });

        }

        if(event.registration_mode !== 'team'){

            return res.status(400).json({ status: 'Error', message: 'This Event Does Not Use Team Registration' });

        }

        const existing = await findMembership(eventId, studentId);

        if(existing){

            return res.status(409).json({ status: 'Error', message: 'You Are Already Registered for This Event' });

        }

        const { data: team, error: teamError } = await supabase

            .from('event_teams')
            .select('id')
            .eq('event_id', eventId)
            .eq('invite_code', invite_code.trim().toUpperCase())
            .maybeSingle();

        if(teamError || !team){

            return res.status(404).json({ status: 'Error', message: 'Invalid Invite Code' });

        }

        const { count } = await supabase

            .from('event_team_members')
            .select('id', { count: 'exact', head: true })
            .eq('team_id', team.id);

        if((count || 0) >= event.max_team_size){

            return res.status(400).json({ status: 'Error', message: 'This Team is Already Full' });

        }

        const { error: memberError } = await supabase

            .from('event_team_members')
            .insert([{ event_id: eventId, team_id: team.id, student_id: studentId, is_leader: false }]);

        if(memberError){

            console.error('[DB Team Join Error]: ', memberError);
            return res.status(500).json({ status: 'Error', message: 'Failed to Join Team' });

        }

        return res.status(200).json({ status: 'Success', data: await getTeamWithMembers(team.id) });

    }

    catch(err){

        console.error('[Registration Controller Error]: ', err.message);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });

    }

};

// Get the Caller's Own Registration for This Event, if Any

const getMyTeam = async (req, res) => {

    try{

        const membership = await findMembership(req.params.id, req.user.id);

        if(!membership){

            return res.status(200).json({ status: 'Success', data: null });

        }

        return res.status(200).json({ status: 'Success', data: await getTeamWithMembers(membership.team_id) });

    }

    catch(err){

        console.error('[Registration Controller Error]: ', err.message);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });

    }

};

// Leave (Non-Leaders) or Disband (a Solo Leader) One's Own Registration

const leaveTeam = async (req, res) => {

    try{

        const eventId = req.params.id;
        const studentId = req.user.id;

        const membership = await findMembership(eventId, studentId);

        if(!membership){

            return res.status(404).json({ status: 'Error', message: 'You Are Not Registered for This Event' });

        }

        if(membership.is_leader){

            const { count } = await supabase

                .from('event_team_members')
                .select('id', { count: 'exact', head: true })
                .eq('team_id', membership.team_id);

            if((count || 0) > 1){

                return res.status(400).json({

                    status: 'Error',
                    message: 'You Are the Team Leader - Ask a Coordinator to Remove the Team, or Have Everyone Else Leave First'

                });

            }

            // Sole Member: Disband Entirely (Cascades to the Membership Row and Any Saved Workspace)

            await supabase.from('event_teams').delete().eq('id', membership.team_id);

        }

        else{

            await supabase.from('event_team_members').delete().eq('id', membership.id);

        }

        return res.status(200).json({ status: 'Success', message: 'You Have Left the Event' });

    }

    catch(err){

        console.error('[Registration Controller Error]: ', err.message);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });

    }

};

// Coordinator View: Every Team + Its Members for This Event

const listRegistrations = async (req, res) => {

    try{

        const eventId = req.params.id;

        const { data: teams, error: teamsError } = await supabase

            .from('event_teams')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: true });

        if(teamsError){

            console.error('[DB Registrations Fetch Error]: ', teamsError);
            return res.status(500).json({ status: 'Error', message: 'Failed to Fetch Registrations' });

        }

        const { data: members, error: membersError } = await supabase

            .from('event_team_members')
            .select('id, team_id, is_leader, joined_at, users(id, full_name, email, student_id)')
            .eq('event_id', eventId);

        if(membersError){

            console.error('[DB Registration Members Fetch Error]: ', membersError);
            return res.status(500).json({ status: 'Error', message: 'Failed to Fetch Registrations' });

        }

        const teamsWithMembers = teams.map((team) => ({

            ...team,
            members: (members || []).filter((m) => m.team_id === team.id)

        }));

        return res.status(200).json({ status: 'Success', data: teamsWithMembers });

    }

    catch(err){

        console.error('[Registration Controller Error]: ', err.message);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });

    }

};

// Coordinator Correction: Remove a Team Registered by Mistake

const removeTeam = async (req, res) => {

    try{

        const { id: eventId, teamId } = req.params;

        const { error } = await supabase

            .from('event_teams')
            .delete()
            .eq('id', teamId)
            .eq('event_id', eventId);

        if(error){

            console.error('[DB Team Delete Error]: ', error);
            return res.status(500).json({ status: 'Error', message: 'Failed to Remove Team' });

        }

        return res.status(200).json({ status: 'Success', message: 'Team Removed Successfully' });

    }

    catch(err){

        console.error('[Registration Controller Error]: ', err.message);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });

    }

};

module.exports = { createTeam, joinTeam, getMyTeam, leaveTeam, listRegistrations, removeTeam };
