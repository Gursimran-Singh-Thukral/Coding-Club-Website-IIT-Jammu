/**

    @fileoverview Event Controller.
    Handles the Creation and Retrieval of the Coding Club Events.

*/

const supabase = require('../config/supabaseClient');
const { get } = require('../routes/userRoutes');

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

        const { data: newEvent, error } = await supabase

            .from('events')
            .insert([{

                title: title,
                description: description,
                event_date: event_date,
                venue: venue,
                category: category || 'Workshop',
                created_by: created_by

            }])
            .select()
            .single()

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

module.exports = { createEvent, getEvents };