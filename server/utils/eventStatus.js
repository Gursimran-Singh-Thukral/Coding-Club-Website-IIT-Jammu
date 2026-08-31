/**

    @fileoverview Mirrors client/src/lib/utils.ts's getEventStatus() so the
    server can enforce "workspace only during the live window" itself,
    rather than trusting the client to hide the button.

*/

function getEventStatus(event) {

    const now = Date.now();
    const start = new Date(event.event_date).getTime();
    const end = event.event_end ? new Date(event.event_end).getTime() : start;

    if(now < start) return 'upcoming';
    if(now > end) return 'past';
    return 'live';

}

module.exports = { getEventStatus };
