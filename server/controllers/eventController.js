/**

    @fileoverview Event Controller.
    Handles the Creation and Retrieval of the Coding Club Events.

*/

const supabase = require('../config/supabaseClient');
const { generateSecret } = require('otplib');

// Fields a Manager is Allowed to Change via PUT - Never totp_secret, created_by, etc.

const UPDATABLE_EVENT_FIELDS = ['title', 'description', 'event_date', 'venue', 'category'];

// Create New Event

const createEvent = async (req, res) => {

    try{

        const { title, description, event_date, venue, category } = req.body;

        // Grab ID of the Person making the Request

        const created_by = req.user.id;

        if(!title || !event_date || !venue){

            return res.status(400).json({

                status: 'Error',
                message: 'Title, Event Date and Venue are Required'

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
                venue: venue,
                category: category || 'Workshop',
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
            .select('*')
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

        // Whitelist: Prevents a Manager Request from Tampering with totp_secret or created_by

        const updates = {};

        for(const field of UPDATABLE_EVENT_FIELDS){

            if(req.body[field] !== undefined) updates[field] = req.body[field];

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

module.exports = { createEvent, getEvents, updateEvent, deleteEvent, getEventSecret };