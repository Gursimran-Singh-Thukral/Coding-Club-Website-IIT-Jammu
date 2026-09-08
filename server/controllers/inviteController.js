const supabase = require('../config/supabaseClient');

const inviteToEvent = async (req, res) => {
    try {
        const { id: eventId } = req.params;
        const { studentId } = req.body;

        if (!studentId) {
            return res.status(400).json({ status: 'Error', message: 'studentId is required' });
        }

        const { data: invite, error } = await supabase
            .from('event_invitations')
            .insert([{ event_id: eventId, student_id: studentId }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({ status: 'Error', message: 'User is already invited' });
            }
            console.error('[Invite Error]: ', error);
            return res.status(500).json({ status: 'Error', message: 'Failed to invite user' });
        }

        return res.status(201).json({ status: 'Success', data: invite });
    } catch (err) {
        console.error('[Invite Controller Error]: ', err);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

const getEventInvites = async (req, res) => {
    try {
        const { id: eventId } = req.params;

        const { data: invites, error } = await supabase
            .from('event_invitations')
            .select(`
                id,
                student_id,
                users ( id, full_name, email )
            `)
            .eq('event_id', eventId);

        if (error) {
            console.error('[Get Invites Error]: ', error);
            return res.status(500).json({ status: 'Error', message: 'Failed to fetch invites' });
        }

        return res.status(200).json({ status: 'Success', data: invites });
    } catch (err) {
        console.error('[Invite Controller Error]: ', err);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

const revokeInvite = async (req, res) => {
    try {
        const { id: eventId, studentId } = req.params;

        const { error } = await supabase
            .from('event_invitations')
            .delete()
            .match({ event_id: eventId, student_id: studentId });

        if (error) {
            console.error('[Revoke Invite Error]: ', error);
            return res.status(500).json({ status: 'Error', message: 'Failed to revoke invite' });
        }

        return res.status(200).json({ status: 'Success', message: 'Invite revoked' });
    } catch (err) {
        console.error('[Invite Controller Error]: ', err);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

module.exports = { inviteToEvent, getEventInvites, revokeInvite };
