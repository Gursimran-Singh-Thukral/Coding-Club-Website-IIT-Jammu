/**

    @fileoverview Event Controller.
    Handles the Creation and Retrieval of the Coding Club Events.

*/

const supabase = require('../config/supabaseClient');
const { generateSecret } = require('otplib');
const { isOrganizerRole } = require('../middleware/roleMiddleware');

// Fields a Coordinator is Allowed to Change via PUT - Never totp_secret, created_by, etc.

const UPDATABLE_EVENT_FIELDS = [
    'title', 'description', 'event_date', 'event_end', 'venue', 'category',
    'registration_open', 'registration_mode', 'max_team_size', 'workspace_enabled', 'ps'
];

// Columns Safe to Hand Back on the Public, Unauthenticated GET /api/events Listing.
// Deliberately Excludes totp_secret (the Attendance-Code Seed) and ps (the Problem
// Statement, which has its own Attendance/Role-Gated Endpoint below) - `select('*')`
// would Leak Both to Anyone who Hits this Endpoint, Logged in or Not.

const PUBLIC_EVENT_FIELDS = [
    'id', 'title', 'description', 'event_date', 'event_end', 'venue', 'category',
    'registration_open', 'registration_mode', 'max_team_size', 'workspace_enabled',
    'created_by', 'created_at'
].join(', ');

// Create New Event

const createEvent = async (req, res) => {

    try{

        const {
            title, description, event_date, event_end, venue, category,
            registration_open, registration_mode, max_team_size, workspace_enabled, ps
        } = req.body;

        // Grab ID of the Person making the Request

        const created_by = req.user.id;

        if(!title || !event_date || !venue){

            return res.status(400).json({

                status: 'Error',
                message: 'Title, Event Date and Venue are Required'

            });

        }

        if(event_end && new Date(event_end) <= new Date(event_date)){

            return res.status(400).json({

                status: 'Error',
                message: 'Event End Time must be After the Start Time'

            });

        }

        // Get a Unique TOTP Secret for this Specific Event

        const totpSecret = generateSecret();

        const { data: newEvent, error } = await supabase

            .from('events')
            .insert([{

                title: title,
                description: description,
                event_date: event_date,
                event_end: event_end || null,
                venue: venue,
                category: category || 'Workshop',
                registration_open: registration_open ?? false,
                registration_mode: registration_mode || 'individual',
                max_team_size: max_team_size || 1,
                workspace_enabled: workspace_enabled ?? false,
                ps: ps || null,
                created_by: created_by,
                totp_secret: totpSecret

            }])
            .select()
            .single();

        if(error){

            console.error('[DB Event Insert Error]: ', error);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Create the Event'

            });

        }

        return res.status(201).json({

            status: 'Success', 
            data: newEvent

        })

    }

    catch(err){

        console.error('[Event Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

// Get All Events

const getEvents = async (req, res) => {

    try{

        const { data: events, error } = await supabase

            .from('events')
            .select(PUBLIC_EVENT_FIELDS)
            .order('event_date', {ascending: true});

        if(error){

            console.error('[DB Event Fetch Error]: ', error);

            return res.status(500).json({

                status: 'Error', 
                message: 'Failed to Fetch Events'

            });

        }

        return res.status(200).json({

            status: 'Success',
            data: events

        });

    }

    catch(err){

        console.error('[Event Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error', 
            message: 'Internal Server Error'

        });

    }

};

// Update an Event

const updateEvent = async (req, res) => {

    try{

        const eventId = req.params.id;

        // Whitelist: Prevents a Coordinator Request from Tampering with totp_secret or created_by

        const updates = {};

        for(const field of UPDATABLE_EVENT_FIELDS){

            if(req.body[field] !== undefined) updates[field] = req.body[field];

        }

        if(updates.event_end){

            // Need the Other Side of the Range to Validate Against - Fetch it if the Caller Didn't Send a New event_date

            const startDate = updates.event_date || (await supabase.from('events').select('event_date').eq('id', eventId).single()).data?.event_date;

            if(startDate && new Date(updates.event_end) <= new Date(startDate)){

                return res.status(400).json({

                    status: 'Error',
                    message: 'Event End Time must be After the Start Time'

                });

            }

        }

        const { data: updatedEvent, error } = await supabase

            .from('events')
            .update(updates)
            .eq('id', eventId)
            .select()
            .single();

        if(error){

            console.error('[DB Event Update Error]: ', error);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Update Event.'

            });

        }

        return res.status(200).json({

            status: 'Success',
            message: 'Event Updated Successfully',
            data: updatedEvent

        });

    }

    catch(err){

        console.error('[Event Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

// Delete an Event

const deleteEvent = async (req, res) => {

    try{

        const eventId = req.params.id;

        const { error } = await supabase
            
            .from('events')
            .delete()
            .eq('id', eventId);

        if(error){

            console.error('[DB Event Delete Error]: ', error);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Delete Event'

            });

        }

        return res.status(200).json({

            status: 'Success',
            message: 'Event Deleted Successfully'

        });

    }

    catch(err){

        console.error('[Event Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

const getEventSecret = async (req, res) => {

    try{

        const eventId = req.params.id;

        const { data: event, error } = await supabase

            .from('events')
            .select('totp_secret')
            .eq('id', eventId)
            .single();

        if(error || !event){

            console.error('[DB Fetch Secret Error]: ', error);

            return res.status(404).json({

                status: 'Error',
                message: 'Event Not Found'

            });

        }

        return res.status(200).json({

            status: 'Success',
            data: {

                totp_secret: event.totp_secret

            }

        });

    }

    catch(err){

        console.error('[Event Controller Error]: ', err);

        return res.status(500).json({

            status: 'Error', 
            message: 'Internal Server Error'

        });

    }

};

// Get an Event's Problem Statement - Organizers (Coordinator/Technical Secretary/
// Field Specialist) can Always See it; Everyone Else must have Marked Attendance
// for this Event First. Enforced Here, not just Hidden Client-Side.

const getEventPs = async (req, res) => {

    try{

        const eventId = req.params.id;

        const { data: event, error } = await supabase

            .from('events')
            .select('ps')
            .eq('id', eventId)
            .single();

        if(error || !event){

            return res.status(404).json({

                status: 'Error',
                message: 'Event Not Found'

            });

        }

        if(!(await isOrganizerRole(req.user.id))){

            const { data: record } = await supabase

                .from('attendance')
                .select('id')
                .eq('event_id', eventId)
                .eq('student_id', req.user.id)
                .maybeSingle();

            if(!record){

                return res.status(403).json({

                    status: 'Error',
                    message: 'Mark Attendance First to See the Problem Statement'

                });

            }

        }

        return res.status(200).json({

            status: 'Success',
            data: { ps: event.ps }

        });

    }

    catch(err){

        console.error('[Event Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

module.exports = { createEvent, getEvents, updateEvent, deleteEvent, getEventSecret, getEventPs };