/**

    @fileoverview Attendance Controller with TOTP Integration.
    Validates Rolling 30-second Codes Before Marking Attendance.

 */

const supabase = require('../config/supabaseClient');
const { verify } = require('otplib');

// Marking the Attendance

const markAttendance = async (req, res) => {

    try{

        const { event_id, code } = req.body;
        const student_id = req.user.id;

        if(!event_id || !code){

            return res.status(400).json({

                status: 'Error',
                message: 'Both Event Id and 6-Digit Code is Required'

            });

        }

        // Fetch the Event's TOTP Secret from the Database

        const { data: event, error: eventError } = await supabase

            .from('events')
            .select('totp_secret')
            .eq('id', event_id)
            .single();

        if(eventError || !event || !event.totp_secret){

            return res.status(404).json({

                status: 'Error',
                message: 'Event Not Found or is Invalid'

            });

        }

        // Verifying the 6-Digit Code by the Student

        const result = await verify({

            token: code,
            secret: event.totp_secret,
            epochTolerance: 30

        });

        if(!result.valid){

            return res.status(400).json({

                status: 'Error',
                message: 'Invalid or Expired Code. Please Look at the Screen for Current Code.'

            });

        }

        // Code is Valid. Proceed to Mark Attendance

        const { data: attendanceRecord, error: insertError } = await supabase

            .from('attendance')
            .insert([{

                event_id: event_id,
                student_id: student_id

            }])
            .select()
            .single();

        if(insertError){

            if(insertError.code === '23505'){

                return res.status(409).json({

                    status: 'Error',
                    message: 'Attendance Already Marked'

                });

            }

            console.error('[DB Attendance Error]: ', insertError);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Mark Attendance'

            });

        }

        return res.status(201).json({

            status: 'Success',
            message: 'Attendance Marked Successfully',
            data: attendanceRecord

        });

    }

    catch(err){

        console.error('[Attendance Controller Error]: ', err.message);
        
        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        })

    }

}

// Get Attendance for a Specific Event

const getEventAttendance = async (req, res) => {

    try{

        const eventId = req.params.eventId;

        // Fetching Attendance Records and Joining the `users` Table to Get Student IDs and Emails.

        const { data: attendees, error } = await supabase

            .from('attendance')
            .select(`
                
                id,
                marked_at,
                users(

                    id,
                    student_id,
                    email

                )

            `)
            .eq('event_id', eventId)
            .order('marked_at', { ascending: true });

        if(error){

            console.error('[DB Fetch Attendance Error]: ', error);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Fetch the Attendance'

            });

        }

        return res.status(200).json({

            status: 'Success', 
            total_attendees: attendees.length,
            data: attendees

        });

    }

    catch(err){

        console.error('[Attendance Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

}

module.exports = { markAttendance, getEventAttendance };