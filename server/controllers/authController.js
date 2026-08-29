const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Secure Cookies Require HTTPS - Only Enforce Once We're Actually Deployed Behind TLS

const isProduction = process.env.NODE_ENV === 'production';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// Frontend (Vercel) and backend (Render) live on different domains, so the
// auth cookies are cross-site in production - browsers only send SameSite=Lax
// cookies on same-site requests / top-level navigations, never on a cross-site
// fetch(). SameSite=None is required for that, which in turn requires Secure.
// Locally both run on localhost (same site, different ports), where Lax is
// correct and Secure would just silently drop the cookie over plain HTTP.

function accessCookieOptions() {

    return {

        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: ACCESS_TOKEN_MAX_AGE

    };

}

function refreshCookieOptions() {

    return {

        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/api/auth',          // Covers /refresh, /logout and /sessions* - Never Sent Elsewhere
        maxAge: REFRESH_TOKEN_MAX_AGE

    };

}

// Best-Effort Decode of the Caller's Own Refresh Cookie, to Identify "This Device" in the Sessions List

function getCurrentSessionId(req) {

    const token = req.cookies?.refreshToken;

    if(!token) return null;

    try{

        const decoded = jwt.verify(token, process.env.REFRESH_SECRET || 'secret_refresh_key');
        return decoded.sid || null;

    }

    catch(err){

        return null;

    }

}

const handleGoogleLogin = async (req, res) => {

    try{

        const { credential } = req.body;       // The Token Sent from React

        if(!credential){

            return res.status(400).json({

                status: 'Error',
                message: 'No Credentials Provided'

            });

        }

        // Verify the Token with Google

        const ticket = await client.verifyIdToken({

            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,

        });

        const payload = ticket.getPayload();

        // Restricting to Institute ID Only

        if(!payload.email.endsWith('@iitjammu.ac.in')){

            return res.status(403).json({

                status: 'Error',
                message: 'Please Use Your Institute Email.'

            });

        }

        const email = payload.email;
        const full_name = payload.name;
        const student_id = email.split('@')[0].toUpperCase();

        // Sync With Supabase (Bypass RLS using Service Role)

        let { data: user, error: fetchError } = await supabase

            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if(!user){

            const { data: newUser, error: insertError } = await supabase

                .from('users')
                .insert([{

                    id: crypto.randomUUID(),
                    email: email,
                    full_name: full_name,
                    student_id: student_id,
                    role: 'Student'

                }])
                .select()
                .single();

            if(insertError) throw insertError;

            user = newUser;

        }

        // Record This Login as a Trackable, Revocable Session

        const { data: session, error: sessionError } = await supabase

            .from('sessions')
            .insert([{

                user_id: user.id,
                user_agent: req.headers['user-agent'] || null,
                ip_address: req.ip

            }])
            .select()
            .single();

        if(sessionError) throw sessionError;

        // Mint Custom JWTs

        const accessToken = jwt.sign(

            {

                id: user.id,
                email: user.email,
                role: user.role,
                full_name: user.full_name

            },

            process.env.JWT_SECRET || "secret_access_key",

            { expiresIn: '15m' }

        );

        const refreshToken = jwt.sign(

            { id: user.id, sid: session.id },

            process.env.REFRESH_SECRET || "secret_refresh_key",

            { expiresIn: '7d' }

        );

        // Send as HttpOnly Cookies

        res.cookie('accessToken', accessToken, accessCookieOptions());
        res.cookie('refreshToken', refreshToken, refreshCookieOptions());

        return res.status(200).json({

            status: 'Success',
            user

        });

    }

    catch(err){

        console.error('[Auth Error]: ', err.message);

        res.status(500).json({

            status: 'Error',
            message: 'Authentication Failed'

        });

    }

};

const refreshAccessToken = async(req, res) => {

    try{

        const token = req.cookies?.refreshToken;

        if(!token){

            return res.status(401).json({

                status: 'Error',
                message: 'No Refresh Token'

            });

        }

        const decoded = jwt.verify(token, process.env.REFRESH_SECRET || "secret_refresh_key");

        // Confirm the Session Behind this Refresh Token is Still Active

        const { data: session, error: sessionError } = await supabase

            .from('sessions')
            .select('id, revoked_at')
            .eq('id', decoded.sid)
            .eq('user_id', decoded.id)
            .single();

        if(sessionError || !session || session.revoked_at){

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken', { path: '/api/auth' });

            return res.status(401).json({

                status: 'Error',
                message: 'Session Revoked. Please Sign In Again.'

            });

        }

        // Fetch Fresh User Data just in case Roles Changed

        const { data: user } = await supabase

            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if(!user){

            return res.status(401).json({

                status: 'Error',
                message: 'User No Longer Exists'

            });

        }

        await supabase

            .from('sessions')
            .update({ last_used_at: new Date() })
            .eq('id', decoded.sid);

        const newAccessToken = jwt.sign(

            {

                id: user.id,
                email: user.email,
                role: user.role,
                full_name: user.full_name

            },

            process.env.JWT_SECRET || 'secret_access_key',

            { expiresIn: '15m' }

        );

        res.cookie('accessToken', newAccessToken, accessCookieOptions());

        res.status(200).json({

            status: 'Success',
            message: 'Token Refreshed'

        });

    }

    catch(err){

        res.status(403).json({

            status: 'Error',
            message: 'Invalid Refresh Token'

        });

    }

};

const logout = async (req, res) => {

    const token = req.cookies?.refreshToken;

    if(token){

        try{

            const decoded = jwt.verify(token, process.env.REFRESH_SECRET || 'secret_refresh_key');

            await supabase

                .from('sessions')
                .update({ revoked_at: new Date() })
                .eq('id', decoded.sid);

        }

        catch(err){

            // An Already-Expired or Invalid Refresh Token Simply Has Nothing Left to Revoke

        }

    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth' });

    res.status(200).json({

        status: 'Success',
        message: 'Logged Out'

    });

};

// List the Caller's Own Active Sessions - Flags Which One is the Current Device

const listSessions = async (req, res) => {

    try{

        const { data: sessions, error } = await supabase

            .from('sessions')
            .select('id, user_agent, ip_address, created_at, last_used_at')
            .eq('user_id', req.user.id)
            .is('revoked_at', null)
            .order('last_used_at', { ascending: false });

        if(error){

            console.error('[Session Fetch Error]: ', error);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Fetch Sessions'

            });

        }

        const currentSessionId = getCurrentSessionId(req);

        return res.status(200).json({

            status: 'Success',
            data: sessions.map((session) => ({

                ...session,
                is_current: session.id === currentSessionId

            }))

        });

    }

    catch(err){

        console.error('[Session Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

// Revoke a Single Session (Must Belong to the Caller)

const revokeSession = async (req, res) => {

    try{

        const sessionId = req.params.id;

        const { data: session, error: fetchError } = await supabase

            .from('sessions')
            .select('id, user_id')
            .eq('id', sessionId)
            .single();

        if(fetchError || !session){

            return res.status(404).json({

                status: 'Error',
                message: 'Session Not Found'

            });

        }

        if(session.user_id !== req.user.id){

            return res.status(403).json({

                status: 'Error',
                message: 'Forbidden: This is Not Your Session'

            });

        }

        const { error: updateError } = await supabase

            .from('sessions')
            .update({ revoked_at: new Date() })
            .eq('id', sessionId);

        if(updateError){

            console.error('[Session Revoke Error]: ', updateError);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Revoke Session'

            });

        }

        return res.status(200).json({

            status: 'Success',
            message: 'Session Revoked'

        });

    }

    catch(err){

        console.error('[Session Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

// Sign Out of Every Other Device, Keeping the Caller's Current Session Alive

const revokeOtherSessions = async (req, res) => {

    try{

        const currentSessionId = getCurrentSessionId(req);

        if(!currentSessionId){

            return res.status(400).json({

                status: 'Error',
                message: 'Could Not Identify the Current Session'

            });

        }

        const { error } = await supabase

            .from('sessions')
            .update({ revoked_at: new Date() })
            .eq('user_id', req.user.id)
            .is('revoked_at', null)
            .neq('id', currentSessionId);

        if(error){

            console.error('[Session Revoke-Others Error]: ', error);

            return res.status(500).json({

                status: 'Error',
                message: 'Failed to Revoke Other Sessions'

            });

        }

        return res.status(200).json({

            status: 'Success',
            message: 'Signed Out of Other Devices'

        });

    }

    catch(err){

        console.error('[Session Controller Error]: ', err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error'

        });

    }

};

module.exports = {

    handleGoogleLogin,
    refreshAccessToken,
    logout,
    listSessions,
    revokeSession,
    revokeOtherSessions

};
