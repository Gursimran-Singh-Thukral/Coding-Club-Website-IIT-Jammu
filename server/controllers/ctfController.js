const supabase = require('../config/supabaseClient');

// Get all challenges for an event (hides the flag)
const getChallenges = async (req, res) => {
    try {
        const { id: eventId } = req.params;

        const { data: challenges, error } = await supabase
            .from('ctf_challenges')
            .select('id, event_id, title, description, points, target_url, created_at') // Exclude flag
            .eq('event_id', eventId)
            .order('points', { ascending: true });

        if (error) {
            console.error('[Get CTF Challenges Error]: ', error);
            return res.status(500).json({ status: 'Error', message: 'Failed to fetch challenges' });
        }

        return res.status(200).json({ status: 'Success', data: challenges });
    } catch (err) {
        console.error('[CTF Controller Error]: ', err);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

// Create a new challenge (Coordinator only)
const createChallenge = async (req, res) => {
    try {
        const { id: eventId } = req.params;
        const { title, description, points, flag, target_url } = req.body;

        const { data: challenge, error } = await supabase
            .from('ctf_challenges')
            .insert([{ event_id: eventId, title, description, points, flag, target_url }])
            .select('id, title, description, points, target_url') // Don't return flag
            .single();

        if (error) {
            console.error('[Create CTF Challenge Error]: ', error);
            return res.status(500).json({ status: 'Error', message: 'Failed to create challenge' });
        }

        return res.status(201).json({ status: 'Success', data: challenge });
    } catch (err) {
        console.error('[CTF Controller Error]: ', err);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

// Submit a flag
const submitFlag = async (req, res) => {
    try {
        const { id: eventId, challengeId } = req.params;
        const { flag } = req.body;
        const studentId = req.user.id;

        // 1. Get the challenge to check the flag
        const { data: challenge, error: challengeError } = await supabase
            .from('ctf_challenges')
            .select('flag')
            .eq('id', challengeId)
            .single();

        if (challengeError || !challenge) {
            return res.status(404).json({ status: 'Error', message: 'Challenge not found' });
        }

        const isCorrect = challenge.flag === flag;

        // 2. Check if already solved
        if (isCorrect) {
            const { data: existing } = await supabase
                .from('ctf_submissions')
                .select('id')
                .eq('challenge_id', challengeId)
                .eq('student_id', studentId)
                .eq('is_correct', true)
                .single();

            if (existing) {
                return res.status(400).json({ status: 'Error', message: 'You have already solved this challenge!' });
            }
        }

        // 3. Record submission
        const { error: submitError } = await supabase
            .from('ctf_submissions')
            .insert([{ challenge_id: challengeId, student_id: studentId, is_correct: isCorrect }]);

        if (submitError) {
            console.error('[CTF Submit Error]: ', submitError);
            return res.status(500).json({ status: 'Error', message: 'Failed to record submission' });
        }

        if (isCorrect) {
            return res.status(200).json({ status: 'Success', message: 'Flag correct!' });
        } else {
            return res.status(400).json({ status: 'Error', message: 'Incorrect flag.' });
        }
    } catch (err) {
        console.error('[CTF Controller Error]: ', err);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const { id: eventId } = req.params;

        // Fetch all correct submissions for this event's challenges
        const { data: submissions, error } = await supabase
            .from('ctf_submissions')
            .select(`
                student_id,
                users ( full_name ),
                ctf_challenges!inner ( event_id, points )
            `)
            .eq('is_correct', true)
            .eq('ctf_challenges.event_id', eventId);

        if (error) {
            console.error('[CTF Leaderboard Error]: ', error);
            return res.status(500).json({ status: 'Error', message: 'Failed to fetch leaderboard' });
        }

        // Aggregate points by student
        const scores = {};
        for (const sub of submissions) {
            const sid = sub.student_id;
            if (!scores[sid]) {
                scores[sid] = {
                    student_id: sid,
                    full_name: sub.users.full_name,
                    score: 0
                };
            }
            scores[sid].score += sub.ctf_challenges.points;
        }

        const leaderboard = Object.values(scores).sort((a, b) => b.score - a.score);

        return res.status(200).json({ status: 'Success', data: leaderboard });
    } catch (err) {
        console.error('[CTF Controller Error]: ', err);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

module.exports = { getChallenges, createChallenge, submitFlag, getLeaderboard };
