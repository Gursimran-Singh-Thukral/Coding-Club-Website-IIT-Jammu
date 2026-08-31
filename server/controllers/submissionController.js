/**

    @fileoverview Team Workspace Controller.
    One HTML/CSS/JS submission per team, shared and autosaved by whichever
    member last hit save (last write wins - no realtime collaboration).
    Rendering happens entirely client-side via a sandboxed iframe; nothing
    here ever executes student code.

    Access is gated two ways beyond "is this event's workspace enabled at
    all": the caller must have marked attendance for this event themselves,
    and the event must currently be live - both enforced here, not just
    hidden client-side, since a student could otherwise hit the API directly.
    Coordinators/Technical Secretaries skip the attendance gate (they're
    running the event, not checking into it) but still only get in while
    it's actually live.

*/

const supabase = require('../config/supabaseClient');
const { getEventStatus } = require('../utils/eventStatus');
const { isCoordinatorRole } = require('../middleware/roleMiddleware');

const MAX_FIELD_LENGTH = 200000; // Defensive Cap - Not a Real Editor Limit
const MAX_COUNTER = 100000; // Defensive Cap on the Self-Reported Integrity Counters

const SUBMISSION_FIELDS = 'html, css, js, score, feedback, evaluated_at, tab_switch_count, paste_attempt_count, updated_at';
const EMPTY_SUBMISSION = {
    html: '', css: '', js: '', score: null, feedback: null, evaluated_at: null,
    tab_switch_count: 0, paste_attempt_count: 0, updated_at: null
};

async function resolveTeamId(eventId, studentId) {

    const { data } = await supabase

        .from('event_team_members')
        .select('team_id')
        .eq('event_id', eventId)
        .eq('student_id', studentId)
        .maybeSingle();

    return data?.team_id || null;

}

// Loads the Event and Checks it has the Workspace Feature Turned On at All.
// Returns the Event Row on Success, or Sends the Error Response and Returns null.
// (Whether it's currently LIVE is checked separately, after confirming the
// caller is even registered - see requireLiveEvent below.)

async function requireWorkspaceEnabled(eventId, res) {

    const { data: event, error } = await supabase

        .from('events')
        .select('event_date, event_end, workspace_enabled')
        .eq('id', eventId)
        .single();

    if(error || !event){

        res.status(404).json({ status: 'Error', message: 'Event Not Found' });
        return null;

    }

    if(!event.workspace_enabled){

        res.status(403).json({ status: 'Error', message: 'The Workspace is Not Enabled for This Event' });
        return null;

    }

    return event;

}

// Second Gate: the Event Itself must Currently be Live.

function requireLiveEvent(event, res) {

    if(getEventStatus(event) !== 'live'){

        res.status(403).json({ status: 'Error', message: 'The Workspace Only Opens While the Event is Live' });
        return false;

    }

    return true;

}

// Confirms the Caller has Checked In - the Second Gate, Independent of Workspace/Live Status.

async function requireAttendance(eventId, studentId, res) {

    const { data: record } = await supabase

        .from('attendance')
        .select('id')
        .eq('event_id', eventId)
        .eq('student_id', studentId)
        .maybeSingle();

    if(!record){

        res.status(403).json({ status: 'Error', message: 'Mark Attendance First to Unlock the Workspace' });
        return false;

    }

    return true;

}

// Get the Caller's Team's Current Workspace

const getMySubmission = async (req, res) => {

    try{

        const eventId = req.params.id;

        const event = await requireWorkspaceEnabled(eventId, res);
        if(!event) return;

        const teamId = await resolveTeamId(eventId, req.user.id);

        if(!teamId){

            return res.status(404).json({ status: 'Error', message: 'You Are Not Registered for This Event' });

        }

        if(!requireLiveEvent(event, res)) return;
        if(!(await isCoordinatorRole(req.user.id)) && !(await requireAttendance(eventId, req.user.id, res))) return;

        const { data: submission } = await supabase

            .from('event_submissions')
            .select(SUBMISSION_FIELDS)
            .eq('team_id', teamId)
            .maybeSingle();

        return res.status(200).json({

            status: 'Success',
            data: submission || EMPTY_SUBMISSION

        });

    }

    catch(err){

        console.error('[Submission Controller Error]: ', err.message);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });

    }

};

// Save (Upsert) the Caller's Team's Workspace

const saveMySubmission = async (req, res) => {

    try{

        const eventId = req.params.id;

        const event = await requireWorkspaceEnabled(eventId, res);
        if(!event) return;

        const teamId = await resolveTeamId(eventId, req.user.id);

        if(!teamId){

            return res.status(404).json({ status: 'Error', message: 'You Are Not Registered for This Event' });

        }

        if(!requireLiveEvent(event, res)) return;
        if(!(await isCoordinatorRole(req.user.id)) && !(await requireAttendance(eventId, req.user.id, res))) return;

        const { html, css, js, tab_switch_count, paste_attempt_count } = req.body;

        for(const [key, value] of Object.entries({ html, css, js })){

            if(value !== undefined && (typeof value !== 'string' || value.length > MAX_FIELD_LENGTH)){

                return res.status(400).json({ status: 'Error', message: `Invalid ${key} Content` });

            }

        }

        for(const [key, value] of Object.entries({ tab_switch_count, paste_attempt_count })){

            if(value !== undefined && (!Number.isInteger(value) || value < 0 || value > MAX_COUNTER)){

                return res.status(400).json({ status: 'Error', message: `Invalid ${key}` });

            }

        }

        const { data: submission, error } = await supabase

            .from('event_submissions')
            .upsert(

                {

                    team_id: teamId,
                    html: html ?? '',
                    css: css ?? '',
                    js: js ?? '',
                    ...(tab_switch_count !== undefined ? { tab_switch_count } : {}),
                    ...(paste_attempt_count !== undefined ? { paste_attempt_count } : {}),
                    updated_by: req.user.id,
                    updated_at: new Date().toISOString()

                },
                { onConflict: 'team_id' }

            )
            .select(SUBMISSION_FIELDS)
            .single();

        if(error){

            console.error('[DB Submission Save Error]: ', error);
            return res.status(500).json({ status: 'Error', message: 'Failed to Save' });

        }

        return res.status(200).json({ status: 'Success', data: submission });

    }

    catch(err){

        console.error('[Submission Controller Error]: ', err.message);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });

    }

};

// Coordinator View: Every Team's Workspace for This Event

const listSubmissions = async (req, res) => {

    try{

        const eventId = req.params.id;

        const { data: teams, error } = await supabase

            .from('event_teams')
            .select(`id, team_name, event_submissions(${SUBMISSION_FIELDS})`)
            .eq('event_id', eventId)
            .order('team_name', { ascending: true });

        if(error){

            console.error('[DB Submissions Fetch Error]: ', error);
            return res.status(500).json({ status: 'Error', message: 'Failed to Fetch Submissions' });

        }

        return res.status(200).json({ status: 'Success', data: teams });

    }

    catch(err){

        console.error('[Submission Controller Error]: ', err.message);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });

    }

};

// Coordinator View: One Team's Workspace, for the Read-Only Preview + Judging Panel

const getTeamSubmission = async (req, res) => {

    try{

        const { id: eventId, teamId } = req.params;

        const { data: team, error: teamError } = await supabase

            .from('event_teams')
            .select('id, team_name')
            .eq('id', teamId)
            .eq('event_id', eventId)
            .single();

        if(teamError || !team){

            return res.status(404).json({ status: 'Error', message: 'Team Not Found' });

        }

        const { data: submission } = await supabase

            .from('event_submissions')
            .select(SUBMISSION_FIELDS)
            .eq('team_id', teamId)
            .maybeSingle();

        return res.status(200).json({

            status: 'Success',
            data: { ...team, ...(submission || EMPTY_SUBMISSION) }

        });

    }

    catch(err){

        console.error('[Submission Controller Error]: ', err.message);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });

    }

};

// Coordinator Action: Score and Leave Feedback on a Team's Submission

const evaluateSubmission = async (req, res) => {

    try{

        const { id: eventId, teamId } = req.params;
        const { score, feedback } = req.body;

        if(score !== undefined && score !== null && (typeof score !== 'number' || Number.isNaN(score))){

            return res.status(400).json({ status: 'Error', message: 'Score must be a Number' });

        }

        const { data: team, error: teamError } = await supabase

            .from('event_teams')
            .select('id')
            .eq('id', teamId)
            .eq('event_id', eventId)
            .single();

        if(teamError || !team){

            return res.status(404).json({ status: 'Error', message: 'Team Not Found' });

        }

        const { data: submission, error } = await supabase

            .from('event_submissions')
            .upsert(

                {

                    team_id: teamId,
                    score: score ?? null,
                    feedback: feedback ?? null,
                    evaluated_by: req.user.id,
                    evaluated_at: new Date().toISOString()

                },
                { onConflict: 'team_id' }

            )
            .select(SUBMISSION_FIELDS)
            .single();

        if(error){

            console.error('[DB Evaluation Save Error]: ', error);
            return res.status(500).json({ status: 'Error', message: 'Failed to Save Evaluation' });

        }

        return res.status(200).json({ status: 'Success', data: submission });

    }

    catch(err){

        console.error('[Submission Controller Error]: ', err.message);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });

    }

};

module.exports = { getMySubmission, saveMySubmission, listSubmissions, getTeamSubmission, evaluateSubmission };
