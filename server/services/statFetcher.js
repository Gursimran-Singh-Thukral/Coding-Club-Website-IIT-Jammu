/**

    @fileoverview Utility to Fetch Live Stats from Third-Party Developer Platforms.

 */

const axios = require('axios');
const cheerio = require('cheerio');

const fetchStats = async (handles) => {

    let liveStats = {};

    // GitHub (Official REST API)

    if(handles.github_handle){

        try{

            const res = await axios.get(`https://api.github.com/users/${handles.github_handle}`);
            liveStats.github_repos = res.data.public_repos;
            liveStats.github_followers = res.data.followers;

        }

        catch(err){

            console.error(`[GitHub Fetch Error] for ${handles.github_handle}`);

        }

    }

    // CodeForces (Official REST API)

    if(handles.codeforces_handle){

        try{

            const res = await axios.get(`https://codeforces.com/api/user.info?handles=${handles.codeforces_handle}`);
            
            if(res.data.status === "OK"){

                liveStats.codeforces_rating = res.data.result[0].rating || 0;
                liveStats.codeforces_rank = res.data.result[0].rank || "Unrated";

            }

        }

        catch(err){

            console.error(`[Codeforces Fetch Error] for ${handles.codeforces_handle}`);

        }

    }

    // LeetCode (Public GraphQL API)

    if(handles.leetcode_handle){

        try{

            const res = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${handles.leetcode_handle}`);

            if(res.data && res.data.totalSolved !== undefined)
                
                liveStats.leetcode_solved = res.data.totalSolved;

            else
                
                console.log(`[LeetCode Alert]: Handle ${handles.leetcode_handle} Not Found.`);

        }

        catch(err){

            console.error(`[LeetCode Fetch Error] for ${handles.leetcode_handle}: `, err.message)

        }

    }

    // Kaggle (Web Scraping with Cheerio)

    if(handles.kaggle_handle){

        try{

            const res = await axios.get(`https://www.kaggle.com/${handles.kaggle_handle}`, {

                headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

            });

            const $ = cheerio.load(res.data);

            // Looking for Standard Meta Description Tag Kaggle Uses for Profiles

            const metaDesc = $('meta[name="description"]').attr('content');

            if(metaDesc){

                liveStats.kaggle_raw_bio = metaDesc;

            }

        }

        catch(err){

            console.error(`[Kaggle Fetch Error] for ${handles.kaggle_handle}`);

        }

    }

    return liveStats;

};

module.exports = { fetchStats };